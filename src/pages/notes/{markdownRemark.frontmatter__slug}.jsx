import * as React from "react"
import { Link, graphql, Script } from 'gatsby'
import "../../styles/simple.css"
import config from '../../../gatsby-config'

const Footer = (frontmatter) => {
  return (
      <div className="footerbox">
        <hr className="footerhr" />
        <a className="footerdate" href={`https://github.com/dineshraju/website/blob/main/src/pages/notes/${frontmatter.slug}.md`} target="_blank"> last updated {frontmatter.updated}</a>
        <Link className="footercat" to={`/notes/`}>other notes</Link>
      </div>
  )
}

const generateAnchorLink = (text, anchors) => {
  let link = text
    .substring(0, 40)
    .replaceAll(/<\/?\w+>/g, '')
    .replaceAll(/[',’]/g, '')
    .replaceAll(/\W/g, '-')
    .toLowerCase()
    .split('-').slice(0,3).join('-')

    while (anchors[link]) { link = link + '-' }
    anchors[link] = true
    return link
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

const BookTemplate = (frontmatter, html) => {

  // TODO: find better way to do this
  const cleanedHtml = html.replaceAll(/\n/gm, '').replaceAll(/<\/p><p>{/g, '{').replaceAll(/<\/p><p>/g, '<br />').replaceAll(/<\/p>/g, '')
  const items = Array.from(cleanedHtml.matchAll(/{.+?}[^{]+/gm))
  const anchors = {}

  const hiddenClass = process.env.GATSBY_DEV ? '' : ' bookquotehidden'

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
        items.map((item, chidx) => {
          const matches = item.toString().match('^{(.+)} (.+)$')
          const chapter = matches[1]

          const generateQuotes = () => matches[2].split('<br />').map((e, qidx) => {
            const anc = generateAnchorLink(e, anchors)

            return (
              <div key={`q${qidx}`} id={anc} className={`bookquoterow${hiddenClass}`}>
                <Link to={ `#${anc}`} className="bookanchor">#</Link>
                <div className="bookquote">{e.split('<br>').map((s, qbidx) => (<p key={`q-${qidx}-${qbidx}`} >{s}</p>))}</div>
              </div>
            )
          })

          return (
            <div key={`ch${chidx}`} className={`bookrow${hiddenClass}`}>
              <div className={`bookchaptertitle`}>{chapter}</div>
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

const TranscriptTemplate = (frontmatter, html) => {

  // TODO: find better way to do this
  const title = html.match('<h2>(.+?)</h2>')[1]
  const cleanedHtml = html.replaceAll(/\n/gm, '').replaceAll(/<\/p><p>{/g, '{').replaceAll(/<\/p><p>/g, '<br />').replaceAll(/<\/p>/g, '')
  const items = Array.from(cleanedHtml.matchAll(/{\d+:\d+:\d+}[^{]+/gm))

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
        items.map(item => {
          const segments = item.toString().match('^{(\\d+):(\\d+):(\\d+)}(.+)$')
          const timeStr = segments.slice(1,4).join("-")
          const anchorLink = `t-${timeStr}`
          return (
            <div key={anchorLink} className={`transcriptrow`}>
              <div className="transcripttime">
                <a href={timeToLink(...segments.slice(1,4))} target="_blank">{timeToStr(...segments.slice(1,4))}</a>
                <Link to={ `#${anchorLink}`} className="transcriptanchor">(#)</Link>
              </div>
              <div id={anchorLink} className={`transcriptquote`}>{segments[4].split('<br />').map((e, idx) => (<p key={`p-${timeStr}-${idx}`} id={`p-${timeStr}-${idx}`}>{e}</p>))}</div>
            </div>
          )
        })
      }
      </div>
      { Footer(frontmatter) }
    </div>
  )
}

const expandIPFS = hash => `https://cloudflare-ipfs.com/ipfs/${hash}`

const BlogPostTemplate = ({ data }) => {
  const { frontmatter, html } = data.markdownRemark
  let processedHtml = html.replaceAll(/ipfs:\/\/(baf[A-Za-z2-7]{56})/g, expandIPFS('$1'))

  React.useEffect(() => {
    const urlHash = typeof window !== 'undefined' ? window.location.hash.substr(1) : null
    if (urlHash) {
      const elem = window.document.getElementById(urlHash)
      if (frontmatter.book) {
        if (elem) {
          elem.parentElement.parentElement.classList.remove('bookquotehidden')
          elem.classList.remove('bookquotehidden')
          Array.from(window.document.getElementsByClassName('bookrow bookquotehidden')).forEach(e => e.remove())
          Array.from(window.document.getElementsByClassName('bookquoterow bookquotehidden')).forEach(e => e.remove())
        }
      } else {
        if (elem) { elem.classList.add('highlight') }
      }
    }
    if (frontmatter.book) {
      const elem = window.document.getElementById('booktitle')
      if (elem) { elem.classList.remove('bookfadein') }
    }
  })

  if (frontmatter.transcript) { return TranscriptTemplate(frontmatter, processedHtml) }

  if (frontmatter.book) { return BookTemplate(frontmatter, processedHtml) }

  return RegularTemplate(frontmatter, processedHtml)
}

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      htmlAst
      frontmatter {
        updated(formatString: "Do MMM, YYYY")
        published(formatString: "Do MMM, YYYY")
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
  return (
    <>
      <title>{ data.markdownRemark.frontmatter.book || data.markdownRemark.htmlAst.children[0].children[0].value }</title>
      <link rel='icon' type='image/png' sizes='32X32' href={ expandIPFS('bafkreicwsb5wa74xkn4hcy6rlvgct732jjydbl7rfeeav4jx5hfidklixa') } />
      <link rel='canonical' href={ `${config.siteMetadata.siteUrl}notes/${data.markdownRemark.frontmatter.slug}/` } />
      <meta property='og:image' content= { expandIPFS(data.markdownRemark.frontmatter.ogimage || 'bafkreifbc5wnjsmcjoqg7ado3eaekv46kmis2rbuu6rzjiosxgtun3vqt4') } />
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
