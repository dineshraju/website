const NOTE_TYPES = Object.freeze({
  NOTE: 'note',
  TRANSCRIPT: 'transcript',
  BOOK_QUOTES: 'book-quotes'
})

const DISPLAY_MODES = Object.freeze({
  FULL: 'full',
  DEEP_LINK_ONLY: 'deep-link-only'
})

const shouldListNote = (frontmatter, preview = false) => (
  frontmatter.listed || preview
)

const shouldHideWithCss = (frontmatter, preview = false) => (
  frontmatter.display === DISPLAY_MODES.DEEP_LINK_ONLY && !preview
)

module.exports = {
  DISPLAY_MODES,
  NOTE_TYPES,
  shouldHideWithCss,
  shouldListNote
}
