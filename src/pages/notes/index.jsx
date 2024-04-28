import * as React from "react"
import { Link, graphql } from 'gatsby'
import "../../styles/simple.css"

const NotesPage = ({ data }) => {

  const nodes = data.allMarkdownRemark.nodes.filter(n => n.fileAbsolutePath.match('/pages/notes/')).map(n => ({
    slug: n.frontmatter.slug,
    title: n.htmlAst.children[0].children[0].value,
    transcript: n.frontmatter.transcript,
    book: n.frontmatter.book,
    author: n.frontmatter.author,
    publishedStr: n.frontmatter.publishedStr,
    published: n.frontmatter.published
  }))

  return (
    <div>
    <h2>Notes</h2>
    {
      nodes.sort((a,b) => parseInt(b.published) - parseInt(a.published)).filter(n => !n.book || process.env.GATSBY_DEV).map(n => (
        <div key={n.slug} className="notesitem">
          <Link className="noteslink" to={`/notes/${n.slug}`}>
            { n.book ? `${n.book}` : n.title }
          </Link>
          { n.transcript ? ' (transcript)' : n.book ? ' (quotes)' : '' }
          <div className="notesdate">
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
        transcript
        book
        author
        published(formatString: "YYYYMMDD")
        publishedStr: published(formatString: "Do MMM, YYYY")
      }
    }
  }
}
`

const expandIPFS = hash => `https://ipfs.dineshraju.xyz/${hash}`

export const Head = () => {
  return (
    <>
      <title>Notes</title>
      <link rel='icon' type='image/png' sizes='32X32' href={ expandIPFS('bafybeify2jkbx7hyqqb6siu4sn2xhtoroj7f7zjuseub6hmvhj3yfovojm') } />
    </>
  )
}

export default NotesPage
