import * as React from "react"
import { Link, graphql } from 'gatsby'
import "../../styles/simple.css"

const BlogPostTemplate = ({ data }) => {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  return (
    <div>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <hr class="footerhr" />
      <div class="footerbox">
        <div class="footerdate"> last updated {frontmatter.updated}</div>
        <Link class="footercat" to={`/notes/`}>other notes</Link>
      </div>
    </div>
  )
}

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      htmlAst
      frontmatter {
        updated(formatString: "Do MMM, YYYY")
        published(formatString: "Do MMM, YYYY")
        slug
      }
    }
  }
`

export const Head = ({ data }) => {
  return (
    <title>{ data.markdownRemark.htmlAst.children[0].children[0].value }</title>
  )
}

export default BlogPostTemplate
