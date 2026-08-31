const { DISPLAY_MODES, NOTE_TYPES } = require('./src/lib/note-policy')

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0
const isISODate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) { return false }

  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

const FRONTMATTER_RULES = [
  ['title', 'a non-empty string', isNonEmptyString],
  ['slug', 'a non-empty string', isNonEmptyString],
  ['type', `one of: ${Object.values(NOTE_TYPES).join(', ')}`, value => Object.values(NOTE_TYPES).includes(value)],
  ['listed', 'a boolean', value => typeof value === 'boolean'],
  ['display', `one of: ${Object.values(DISPLAY_MODES).join(', ')}`, value => Object.values(DISPLAY_MODES).includes(value)],
  ['published', 'a valid YYYY-MM-DD date', isISODate],
  ['updated', 'a valid YYYY-MM-DD date', isISODate]
]

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type MarkdownRemark implements Node {
      frontmatter: MarkdownRemarkFrontmatter!
    }

    type MarkdownRemarkFrontmatter @dontInfer {
      title: String!
      slug: String!
      type: String!
      listed: Boolean!
      display: String!
      published: Date! @dateformat
      updated: Date! @dateformat
      transcript: String
      book: String
      author: String
      url: String
      thanks: String
      ogimage: String
    }
  `)
}

exports.onCreateNode = ({ node, reporter }) => {
  if (node.internal.type !== 'MarkdownRemark') { return }

  const frontmatter = node.frontmatter || {}
  const errors = FRONTMATTER_RULES
    .filter(([field, , isValid]) => !isValid(frontmatter[field]))
    .map(([field, expectation]) => `- ${field} must be ${expectation}`)

  if (errors.length > 0) {
    reporter.panicOnBuild([
      `Invalid note frontmatter in ${node.fileAbsolutePath || 'an unknown Markdown file'}:`,
      ...errors
    ].join('\n'))
  }
}
