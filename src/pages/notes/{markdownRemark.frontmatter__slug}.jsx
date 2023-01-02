import * as React from "react"
import { Link, graphql } from 'gatsby'
import "../../styles/simple.css"

const BlogPostTemplate = ({ data }) => {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  const processedHtml = html
    .replaceAll(/ipfs:\/\/(baf[A-Za-z2-7]{56})/g, "https://$1.ipfs.cf-ipfs.com")
    .replaceAll(/<(h[1234])>/g, (match, p1, offset) => `<${p1} id="${p1}-id-${offset}">`)

  const renderThanks = () => {
    if (frontmatter.thanks) {
      const linkify = t => {
        const arr = t.trim().split('@')
        return arr.length > 1 ? <Link to={`${arr[1]}`} target="_blank">{arr[0]}</Link> : arr[0]
      }
      const thanksArr = frontmatter.thanks.trim().split(',').map(linkify)
      for (let idx = thanksArr.length - 1; idx > 0; idx--) { thanksArr.splice(idx, 0, idx === thanksArr.length - 1 ? ' & ' : ', ') }
      return <div className="footerthanks"> Thanks to { thanksArr } for reading drafts of this note.</div>
    }
    return <div className="footerthanks"></div>
  }

  return (
    <div>
      <div
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
      { renderThanks() }
      <hr className="footerhr" />
      <div className="footerbox">
        <Link className="footerdate" to={`https://github.com/dineshraju/website/blob/main/src/pages/notes/${frontmatter.slug}.md`} target="_blank"> last updated {frontmatter.updated}</Link>
        <Link className="footercat" to={`/notes/`}>other notes</Link>
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
        thanks
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
