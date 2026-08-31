import * as React from 'react'
import NoteFooter from '../components/NoteFooter'
import { generateAnchorLink } from '../lib/note-ast'

const RegularNote = ({ frontmatter, html }) => {
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
        className="regularcontent"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
      { renderThanks() }
      <NoteFooter note={frontmatter} />
    </div>
  )
}

export default RegularNote
