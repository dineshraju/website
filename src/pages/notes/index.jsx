import * as React from "react"
import { Link, graphql } from 'gatsby'
import "../../styles/simple.css"
import { NOTE_TYPES, shouldListNote } from '../../lib/note-policy'

const NotesPage = ({ data }) => {

  const nodes = data.allMarkdownRemark.nodes.filter(n => n.fileAbsolutePath.match('/pages/notes/')).map(n => ({
    slug: n.frontmatter.slug,
    title: n.htmlAst.children[0].children[0].value,
    type: n.frontmatter.type,
    listed: n.frontmatter.listed,
    book: n.frontmatter.book,
    publishedStr: n.frontmatter.publishedStr,
    published: n.frontmatter.published
  }))
  const preview = Boolean(process.env.GATSBY_DEV)

  return (
    <div>
    <h2>Notes</h2>
    {
      nodes.sort((a,b) => parseInt(b.published) - parseInt(a.published)).filter(n => shouldListNote(n, preview)).map(n => (
        <div key={n.slug} className="notesitem">
          <Link className="noteslink" to={`/notes/${n.slug}`}>
            { n.type === NOTE_TYPES.BOOK_QUOTES ? n.book : n.title }
          </Link>
          { n.type === NOTE_TYPES.TRANSCRIPT ? ' (transcript)' : n.type === NOTE_TYPES.BOOK_QUOTES ? ' (quotes)' : '' }
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
        type
        listed
        book
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
