const test = require('node:test')
const assert = require('node:assert/strict')

const { onCreateNode } = require('../gatsby-node')

const validNode = {
  internal: { type: 'MarkdownRemark' },
  fileAbsolutePath: '/notes/example.md',
  frontmatter: {
    title: 'Example',
    slug: 'example',
    type: 'note',
    listed: true,
    display: 'full',
    published: '2024-02-29',
    updated: '2024-03-01'
  }
}

const validate = node => {
  const errors = []
  onCreateNode({
    node,
    reporter: { panicOnBuild: message => errors.push(message) }
  })
  return errors
}

test('frontmatter validation accepts a complete note', () => {
  assert.deepEqual(validate(validNode), [])
})

test('frontmatter validation reports the file and every malformed required field', () => {
  const node = {
    ...validNode,
    fileAbsolutePath: '/notes/broken.md',
    frontmatter: {
      ...validNode.frontmatter,
      title: '',
      type: 'essay',
      listed: 'true',
      published: '2023-02-29'
    }
  }

  const errors = validate(node)

  assert.equal(errors.length, 1)
  assert.match(errors[0], /Invalid note frontmatter in \/notes\/broken\.md:/)
  assert.match(errors[0], /title must be a non-empty string/)
  assert.match(errors[0], /type must be one of: note, transcript, book-quotes/)
  assert.match(errors[0], /listed must be a boolean/)
  assert.match(errors[0], /published must be a valid YYYY-MM-DD date/)
})
