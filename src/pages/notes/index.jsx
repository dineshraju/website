import * as React from "react"
import { Link, graphql } from 'gatsby'
import "../../styles/simple.css"

const NotesPage = ({ data }) => {

  const nodes = data.allMarkdownRemark.nodes.filter(n => n.fileAbsolutePath.match('/pages/notes/')).map(n => ({
    slug: n.frontmatter.slug,
    title: n.htmlAst.children[0].children[0].value,
    publishedStr: n.frontmatter.publishedStr,
    published: n.frontmatter.published
  }))

  return (
    <div>
    <h2>Notes</h2>
    {
      nodes.sort((a,b) => parseInt(b.published) - parseInt(a.published)).map(n => (
        <div class="notesitem">
          <Link class="noteslink" to={`/notes/${n.slug}`}>
            { n.title }
          </Link>
          <div class="notesdate">
            { n.publishedStr }
          </div>
        </div>
      ))
    }
    </div>
  )
}

export const pageQuery = graphql`
{
  allMarkdownRemark {
    nodes {
      fileAbsolutePath
      htmlAst
      frontmatter {
        slug
        published(formatString: "YYYYMMDD")
        publishedStr: published(formatString: "Do MMM, YYYY")
      }
    }
  }
}
`

export const Head = () => {
  return (
    <title>Notes</title>
  )
}

export default NotesPage
