import * as React from 'react'
import MarkdownAst from '../components/MarkdownAst'
import NoteFooter from '../components/NoteFooter'
import { parseTranscriptAst } from '../lib/note-ast'

const Transcript = ({ frontmatter, htmlAst }) => {
  const { title, segments } = parseTranscriptAst(htmlAst)

  const transcriptFrags = frontmatter.transcript.split('@')
  const transcriptType = transcriptFrags[0] === 'youtube' ? 'YouTube video' : 'unknown'

  const timeToStr = (hour, min, sec) => {
    let str = ''
    if (transcriptType === 'YouTube video') {
      if (hour > 0) { str += `${parseInt(hour)}h ` }
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
            <div key={anchorLink} className="transcriptrow">
              <div className="transcripttime">
                <a href={timeToLink(...time)} target="_blank">{timeToStr(...time)}</a>
                <a href={ `#${anchorLink}`} className="transcriptanchor">(#)</a>
              </div>
              <div id={anchorLink} className="transcriptquote">
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
      <NoteFooter note={frontmatter} />
    </div>
  )
}

export default Transcript
