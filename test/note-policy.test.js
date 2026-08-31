const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const {
  DISPLAY_MODES,
  NOTE_TYPES,
  shouldHideWithCss,
  shouldListNote
} = require('../src/lib/note-policy')

const notesDirectory = path.join(__dirname, '..', 'src', 'pages', 'notes')

const extractFrontmatter = (markdown, filename) => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  assert.ok(match, `${filename} has a frontmatter block`)
  return match[1]
}

// Policy fields are simple scalars. Accept both the repository's quoted style
// and equivalent unquoted YAML values.
const readScalar = (frontmatter, field) => {
  const value = frontmatter.match(new RegExp(`^${field}:\\s*(.*?)\\s*$`, 'm'))?.[1]
  if (value === undefined) { return undefined }

  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  if (value === 'true') { return true }
  if (value === 'false') { return false }
  return value
}

const readPolicy = filename => {
  const markdown = fs.readFileSync(path.join(notesDirectory, filename), 'utf8')
  const frontmatter = extractFrontmatter(markdown, filename)

  return {
    type: readScalar(frontmatter, 'type'),
    listed: readScalar(frontmatter, 'listed'),
    display: readScalar(frontmatter, 'display')
  }
}

test('every Markdown note declares policy fields with allowed values', () => {
  const markdownFiles = fs.readdirSync(notesDirectory)
    .filter(filename => filename.endsWith('.md'))

  assert.ok(markdownFiles.length > 0, 'at least one Markdown note exists')

  for (const filename of markdownFiles) {
    const policy = readPolicy(filename)
    assert.ok(Object.values(NOTE_TYPES).includes(policy.type), `${filename} has a valid type`)
    assert.equal(typeof policy.listed, 'boolean', `${filename} declares listed`)
    assert.ok(Object.values(DISPLAY_MODES).includes(policy.display), `${filename} has a valid display`)
  }
})

test('policy parsing is limited to frontmatter and accepts unquoted scalars', () => {
  const markdown = [
    '---',
    'type: note',
    'listed: false',
    'display: full',
    '---',
    '',
    'listed: true'
  ].join('\n')
  const frontmatter = extractFrontmatter(markdown, 'example.md')

  assert.equal(readScalar(frontmatter, 'type'), NOTE_TYPES.NOTE)
  assert.equal(readScalar(frontmatter, 'listed'), false)
  assert.equal(readScalar(frontmatter, 'display'), DISPLAY_MODES.FULL)

  const missingListed = extractFrontmatter(
    '---\ntype: note\ndisplay: full\n---\n\nlisted: true',
    'missing-listed.md'
  )
  assert.equal(readScalar(missingListed, 'listed'), undefined)
})

test('listing policy is independent of content type', () => {
  const unlistedNote = {
    type: NOTE_TYPES.NOTE,
    listed: false,
    display: DISPLAY_MODES.FULL
  }
  const listedBookQuotes = {
    type: NOTE_TYPES.BOOK_QUOTES,
    listed: true,
    display: DISPLAY_MODES.FULL
  }

  assert.equal(shouldListNote(unlistedNote), false)
  assert.equal(shouldListNote(listedBookQuotes), true)
})

test('preview mode overrides listing and CSS hiding without changing policy', () => {
  const bookQuotes = {
    type: NOTE_TYPES.BOOK_QUOTES,
    listed: false,
    display: DISPLAY_MODES.DEEP_LINK_ONLY
  }

  assert.equal(shouldListNote(bookQuotes), false)
  assert.equal(shouldHideWithCss(bookQuotes), true)
  assert.equal(shouldListNote(bookQuotes, true), true)
  assert.equal(shouldHideWithCss(bookQuotes, true), false)
})
