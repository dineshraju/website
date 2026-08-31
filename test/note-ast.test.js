const test = require('node:test')
const assert = require('node:assert/strict')

const {
  generateAnchorLink,
  mapAstStrings,
  parseBookAst,
  parseTranscriptAst,
  textContent
} = require('../src/lib/note-ast')

const text = value => ({ type: 'text', value })
const element = (tagName, children, properties = {}) => ({
  type: 'element',
  tagName,
  properties,
  children
})
const paragraph = children => element('p', children)
const root = children => ({ type: 'root', children })

test('parseBookAst groups paragraphs by chapter and preserves inline AST', () => {
  const ast = root([
    paragraph([
      text('{Chapter One} First quote'),
      element('br', []),
      element('em', [text('same quote, second line')])
    ]),
    text('\n'),
    paragraph([text('Second quote with a {brace} in its text')]),
    paragraph([text('{Chapter Two} Third quote')])
  ])

  const chapters = parseBookAst(ast)

  assert.deepEqual(chapters.map(chapter => chapter.title), ['Chapter One', 'Chapter Two'])
  assert.deepEqual(chapters.map(chapter => chapter.quotes.length), [2, 1])
  assert.equal(chapters[0].quotes[0].blocks.length, 2)
  assert.equal(textContent(chapters[0].quotes[0].blocks[0]), 'First quote')
  assert.equal(chapters[0].quotes[0].blocks[1].children[0].tagName, 'em')
  assert.equal(chapters[0].quotes[1].anchorText, 'Second quote with a {brace} in its text')
  assert.equal(textContent(ast.children[0]), '{Chapter One} First quotesame quote, second line')
})

test('parseTranscriptAst extracts timestamps and groups following blocks', () => {
  const ast = root([
    element('h2', [text('A '), element('em', [text('conversation')])]),
    paragraph([text('{00:01:02} Opening paragraph')]),
    paragraph([text('Continuation')]),
    paragraph([text('{1:20:03} Next segment')])
  ])

  const transcript = parseTranscriptAst(ast)

  assert.equal(transcript.title, 'A conversation')
  assert.deepEqual(
    transcript.segments.map(({ hour, min, sec }) => [hour, min, sec]),
    [['00', '01', '02'], ['1', '20', '03']]
  )
  assert.deepEqual(transcript.segments.map(segment => segment.blocks.length), [2, 1])
  assert.equal(textContent(transcript.segments[0].blocks[0]), 'Opening paragraph')
  assert.equal(textContent(transcript.segments[0].blocks[1]), 'Continuation')
})

test('mapAstStrings transforms text and property values without mutating input', () => {
  const ast = root([
    element('a', [text('ipfs://example')], {
      href: 'ipfs://example',
      className: ['ipfs://example', 'link']
    })
  ])

  const mapped = mapAstStrings(ast, value => value.replaceAll('ipfs://', 'https://gateway/'))

  assert.equal(mapped.children[0].properties.href, 'https://gateway/example')
  assert.deepEqual(mapped.children[0].properties.className, ['https://gateway/example', 'link'])
  assert.equal(textContent(mapped), 'https://gateway/example')
  assert.equal(ast.children[0].properties.href, 'ipfs://example')
  assert.equal(textContent(ast), 'ipfs://example')
})

test('generateAnchorLink keeps links short and resolves collisions', () => {
  const anchors = {}

  assert.equal(generateAnchorLink("It’s a useful idea", anchors), 'its-a-useful')
  assert.equal(generateAnchorLink("It’s a useful idea", anchors), 'its-a-useful-')
})
