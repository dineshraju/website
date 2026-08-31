const BOOK_MARKER = /^\{([^{}\n]+)\}\s+/
const TRANSCRIPT_MARKER = /^\{(\d+):(\d+):(\d+)\}\s*/

const isElement = (node, tagName) => (
  node?.type === 'element' && (!tagName || node.tagName === tagName)
)

const textContent = node => {
  if (!node) { return '' }
  if (node.type === 'text') { return node.value }
  if (!node.children) { return '' }
  return node.children.map(textContent).join('')
}

const removeLeadingText = (node, length) => {
  let remaining = length

  const remove = current => {
    if (current.type === 'text') {
      const removed = Math.min(remaining, current.value.length)
      remaining -= removed
      return { ...current, value: current.value.slice(removed) }
    }

    if (!current.children) { return { ...current } }

    return {
      ...current,
      properties: current.properties ? { ...current.properties } : current.properties,
      children: current.children.map(remove)
    }
  }

  return remove(node)
}

const hasContent = node => (
  textContent(node).trim().length > 0 ||
  node.children?.some(child => child.type === 'element')
)

const splitParagraphOnBreaks = paragraph => {
  if (!isElement(paragraph, 'p')) { return [paragraph] }

  const groups = [[]]
  paragraph.children.forEach(child => {
    if (isElement(child, 'br')) {
      groups.push([])
    } else {
      groups[groups.length - 1].push(child)
    }
  })

  return groups.map(children => ({
    ...paragraph,
    properties: { ...paragraph.properties },
    children
  }))
}

const generateAnchorLink = (text, anchors) => {
  let link = text
    .substring(0, 40)
    .replaceAll(/<\/?\w+>/g, '')
    .replaceAll(/[',’]/g, '')
    .replaceAll(/\W/g, '-')
    .toLowerCase()
    .split('-').slice(0, 3).join('-')

  while (anchors[link]) { link = link + '-' }
  anchors[link] = true
  return link
}

const parseBookAst = htmlAst => {
  const chapters = []
  let currentChapter = null

  for (const node of htmlAst?.children || []) {
    if (!isElement(node)) { continue }

    const marker = isElement(node, 'p')
      ? textContent(node).match(BOOK_MARKER)
      : null

    let quoteNode = node
    if (marker) {
      currentChapter = { title: marker[1].trim(), quotes: [] }
      chapters.push(currentChapter)
      quoteNode = removeLeadingText(node, marker[0].length)
    }

    if (!currentChapter || !hasContent(quoteNode)) { continue }

    currentChapter.quotes.push({
      anchorText: textContent(quoteNode),
      blocks: splitParagraphOnBreaks(quoteNode)
    })
  }

  return chapters
}

const parseTranscriptAst = htmlAst => {
  const titleNode = (htmlAst?.children || []).find(node => isElement(node, 'h2'))
  const segments = []
  let currentSegment = null

  for (const node of htmlAst?.children || []) {
    if (!isElement(node) || node === titleNode) { continue }

    const marker = isElement(node, 'p')
      ? textContent(node).match(TRANSCRIPT_MARKER)
      : null

    let block = node
    if (marker) {
      currentSegment = {
        hour: marker[1],
        min: marker[2],
        sec: marker[3],
        blocks: []
      }
      segments.push(currentSegment)
      block = removeLeadingText(node, marker[0].length)
    }

    if (currentSegment && hasContent(block)) {
      currentSegment.blocks.push(block)
    }
  }

  return {
    title: textContent(titleNode),
    segments
  }
}

const mapStrings = (value, transform) => {
  if (typeof value === 'string') { return transform(value) }
  if (Array.isArray(value)) { return value.map(item => mapStrings(item, transform)) }
  return value
}

const mapAstStrings = (node, transform) => {
  if (!node) { return node }

  const mapped = { ...node }
  if (node.value) { mapped.value = transform(node.value) }
  if (node.properties) {
    mapped.properties = Object.fromEntries(
      Object.entries(node.properties).map(([key, value]) => [key, mapStrings(value, transform)])
    )
  }
  if (node.children) {
    mapped.children = node.children.map(child => mapAstStrings(child, transform))
  }
  return mapped
}

module.exports = {
  generateAnchorLink,
  mapAstStrings,
  parseBookAst,
  parseTranscriptAst,
  textContent
}
