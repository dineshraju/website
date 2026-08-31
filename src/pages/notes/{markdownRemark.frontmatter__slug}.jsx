import * as React from "react"
import { Link, graphql, Script } from 'gatsby'
import "../../styles/simple.css"
import config from '../../../gatsby-config'
import MarkdownAst from '../../components/MarkdownAst'
import {
  generateAnchorLink,
  mapAstStrings,
  parseBookAst,
  parseTranscriptAst
} from '../../lib/note-ast'
import { NOTE_TYPES, shouldHideWithCss } from '../../lib/note-policy'

const Footer = (frontmatter) => {
  return (
      <div className="footerbox">
        <hr className="footerhr" />
        <a className="footerdate" href={`https://github.com/dineshraju/website/blob/main/src/pages/notes/${frontmatter.slug}.md`} target="_blank"> last updated {frontmatter.updated}</a>
        <Link className="footercat" to={`/notes/`}>other notes</Link>
      </div>
  )
}

const RegularTemplate = (frontmatter, html) => {
  const renderThanks = () => {
    if (frontmatter.thanks) {
      const linkify = t => {
        const arr = t.trim().split('@')
        return arr.length > 1 ? <a href={`${arr[1]}`} target="_blank">{arr[0]}</a> : arr[0]
      }
      const thanksArr = frontmatter.thanks.trim().split(',').map(linkify)
      for (let idx = thanksArr.length - 1; idx > 0; idx--) { thanksArr.splice(idx, 0, idx === thanksArr.length - 1 ? ' & ' : ', ') }
      return <div className="footerthanks"> Thanks to { thanksArr } for reading drafts of this note.</div>
    }
    return <div className="footerthanks"></div>
  }


  const anchors = {}
  const processedHtml = html.replaceAll(/<(h[34]|p)>/g, (match, p1, offset) => {
    const substart = offset + p1.length + 2
    return `<${p1} id="${generateAnchorLink(html.substring(substart, substart + 40), anchors)}">`
  })

  return (
    <div>
      <div
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
      { renderThanks() }
      { Footer(frontmatter) }
    </div>
  )
}

const BookTemplate = (frontmatter, htmlAst, hideWithCss) => {
  const chapters = parseBookAst(htmlAst)
  const anchors = {}

  const hiddenClass = hideWithCss ? ' bookquotehidden' : ''

  return (
    <div>
      <h2 id="booktitle" className="bookfadein">{frontmatter.book}</h2>
      <div className="bookheader">
        { "(Quotes from a " }
        <a href={frontmatter.url} target="_blank">book by {frontmatter.author}</a>
        { `)` }
      </div>
      <div>
      {
        chapters.map((chapter, chidx) => {
          const generateQuotes = () => chapter.quotes.map((quote, qidx) => {
            const anc = generateAnchorLink(quote.anchorText, anchors)

            return (
              <div key={`q${qidx}`} id={anc} className={`bookquoterow${hiddenClass}`}>
                <Link to={ `#${anc}`} className="bookanchor">#</Link>
                <div className="bookquote">
                  {quote.blocks.map((block, qbidx) => (
                    <MarkdownAst
                      key={`q-${qidx}-${qbidx}`}
                      node={block}
                      prefix={`book-${chidx}-${qidx}-${qbidx}`}
                    />
                  ))}
                </div>
              </div>
            )
          })

          return (
            <div key={`ch${chidx}`} className={`bookrow${hiddenClass}`}>
              <div className={`bookchaptertitle`}>{chapter.title}</div>
              <div className={`bookchapterrow`}>{generateQuotes()}</div>
            </div>
          )
        })
      }
      </div>
      <br />
      <br />
      { Footer(frontmatter) }
    </div>
  )
}

const TranscriptTemplate = (frontmatter, htmlAst) => {
  const { title, segments } = parseTranscriptAst(htmlAst)

  const transcriptFrags = frontmatter.transcript.split('@')
  const transcriptType = transcriptFrags[0] === 'youtube' ? 'YouTube video' : 'unknown'

  const timeToStr = (hour, min, sec) => {
    let str = ''
    if (transcriptType === 'YouTube video') {
      if (hour > 0) { str += `${parseInt(hour)}h `}
      str += `${parseInt(min)}m ${parseInt(sec)}s`
    }
    return str
  }

  const timeToLink = (hour, min, sec) => {
    if (transcriptType === 'YouTube video') {
      return `https://www.youtube.com/watch?v=${transcriptFrags[1]}&t=${parseInt(hour) * 3600 + parseInt(min) * 60 + parseInt(sec)}`
    }
    return ''
  }

  return (
    <div>
      <h2>{title}</h2>
      <div className="transcriptheader">
        { "(Transcript of " }
        <a href={`https://www.youtube.com/watch?v=${transcriptFrags[1]}`} target="_blank">{transcriptType}</a>
        { ")" }
      </div>
      <div className="transcriptblock">
      {
        segments.map(segment => {
          const time = [segment.hour, segment.min, segment.sec]
          const timeStr = time.join("-")
          const anchorLink = `t-${timeStr}`
          return (
            <div key={anchorLink} className={`transcriptrow`}>
              <div className="transcripttime">
                <a href={timeToLink(...time)} target="_blank">{timeToStr(...time)}</a>
                <Link to={ `#${anchorLink}`} className="transcriptanchor">(#)</Link>
              </div>
              <div id={anchorLink} className={`transcriptquote`}>
                {segment.blocks.map((block, idx) => (
                  <MarkdownAst
                    key={`p-${timeStr}-${idx}`}
                    node={{
                      ...block,
                      properties: { ...block.properties, id: `p-${timeStr}-${idx}` }
                    }}
                    prefix={`transcript-${timeStr}-${idx}`}
                  />
                ))}
              </div>
            </div>
          )
        })
      }
      </div>
      { Footer(frontmatter) }
    </div>
  )
}

const expandIPFS = hash => `https://ipfs.dineshraju.xyz/${hash}`
const expandIPFSReferences = value => value.replaceAll(
  /ipfs:\/\/(baf[A-Za-z2-7]{56})/g,
  (match, hash) => expandIPFS(hash)
)

const BlogPostTemplate = ({ data }) => {
  const { frontmatter, html, htmlAst } = data.markdownRemark
  const processedHtml = expandIPFSReferences(html)
  const processedHtmlAst = mapAstStrings(htmlAst, expandIPFSReferences)
  const preview = Boolean(process.env.GATSBY_DEV)
  const hideWithCss = shouldHideWithCss(frontmatter, preview)

  React.useEffect(() => {
    const urlHash = typeof window !== 'undefined' ? window.location.hash.substr(1) : null
    if (urlHash) {
      const elem = window.document.getElementById(urlHash)
      if (frontmatter.type === NOTE_TYPES.BOOK_QUOTES) {
        if (elem && hideWithCss) {
          elem.parentElement.parentElement.classList.remove('bookquotehidden')
          elem.classList.remove('bookquotehidden')
          Array.from(window.document.getElementsByClassName('bookrow bookquotehidden')).forEach(e => e.remove())
          Array.from(window.document.getElementsByClassName('bookquoterow bookquotehidden')).forEach(e => e.remove())
        }
      } else {
        if (elem) { elem.classList.add('highlight') }
      }
    }
    if (frontmatter.type === NOTE_TYPES.BOOK_QUOTES) {
      const elem = window.document.getElementById('booktitle')
      if (elem) { elem.classList.remove('bookfadein') }
    }
  })

  switch (frontmatter.type) {
    case NOTE_TYPES.TRANSCRIPT:
      return TranscriptTemplate(frontmatter, processedHtmlAst)
    case NOTE_TYPES.BOOK_QUOTES:
      return BookTemplate(frontmatter, processedHtmlAst, hideWithCss)
    case NOTE_TYPES.NOTE:
      return RegularTemplate(frontmatter, processedHtml)
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

export const Head = ({ data }) => {
  const { frontmatter, htmlAst } = data.markdownRemark
  return (
    <>
      <title>{ frontmatter.type === NOTE_TYPES.BOOK_QUOTES ? frontmatter.book : htmlAst.children[0].children[0].value }</title>
      <link rel='icon' type='image/png' sizes='32X32' href={ expandIPFS('bafybeify2jkbx7hyqqb6siu4sn2xhtoroj7f7zjuseub6hmvhj3yfovojm') } />
      <link rel='canonical' href={ `${config.siteMetadata.siteUrl}notes/${frontmatter.slug}/` } />
      <meta property='og:image' content= { expandIPFS(frontmatter.ogimage || 'bafybeieg2hv4pfvkccj6axnaqzhv3ue3jsifx4ws4zfw6ld3d4i7r37x2y') } />
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-B9LVX0CBPY" />
      <Script>
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-B9LVX0CBPY');
        `}
      </Script>
    </>
  )
}

export default BlogPostTemplate
