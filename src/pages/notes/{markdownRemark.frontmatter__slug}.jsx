import * as React from 'react'
import { graphql } from 'gatsby'
import '../../styles/simple.css'
import NoteHead from '../../components/NoteHead'
import { expandIPFSReferences } from '../../lib/ipfs'
import { mapAstStrings } from '../../lib/note-ast'
import { NOTE_TYPES, shouldHideWithCss } from '../../lib/note-policy'
import BookQuotes from '../../templates/BookQuotes'
import RegularNote from '../../templates/RegularNote'
import Transcript from '../../templates/Transcript'

const BlogPostTemplate = ({ data }) => {
  const { frontmatter, html, htmlAst } = data.markdownRemark
  const processedHtml = expandIPFSReferences(html)
  const processedHtmlAst = mapAstStrings(htmlAst, expandIPFSReferences)
  const preview = Boolean(process.env.GATSBY_DEV)
  const hideWithCss = shouldHideWithCss(frontmatter, preview)

  switch (frontmatter.type) {
    case NOTE_TYPES.TRANSCRIPT:
      return <Transcript frontmatter={frontmatter} htmlAst={processedHtmlAst} />
    case NOTE_TYPES.BOOK_QUOTES:
      return <BookQuotes frontmatter={frontmatter} htmlAst={processedHtmlAst} hideWithCss={hideWithCss} />
    case NOTE_TYPES.NOTE:
      return <RegularNote frontmatter={frontmatter} html={processedHtml} />
    default:
      throw new Error(`Unsupported note type: ${frontmatter.type}`)
  }
}

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      htmlAst
      frontmatter {
        title
        updated(formatString: "Do MMM, YYYY")
        published(formatString: "Do MMM, YYYY")
        type
        listed
        display
        transcript
        book
        author
        url
        thanks
        slug
        ogimage
      }
    }
  }
`

export const Head = ({ data }) => (
  <NoteHead note={data.markdownRemark.frontmatter} />
)

export default BlogPostTemplate
