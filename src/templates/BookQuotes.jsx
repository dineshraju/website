import * as React from 'react'
import MarkdownAst from '../components/MarkdownAst'
import NoteFooter from '../components/NoteFooter'
import { generateAnchorLink, parseBookAst } from '../lib/note-ast'

const BookQuotes = ({ frontmatter, htmlAst, hideWithCss }) => {
  const chapters = parseBookAst(htmlAst)
  const anchors = {}
  const hiddenClass = hideWithCss ? ' bookquotehidden' : ''

  return (
    <div>
      <h2 id="booktitle">{frontmatter.book}</h2>
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
                <a href={ `#${anc}`} className="bookanchor">#</a>
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
              <div className="bookchaptertitle">{chapter.title}</div>
              <div className="bookchapterrow">{generateQuotes()}</div>
            </div>
          )
        })
      }
      </div>
      <br />
      <br />
      <NoteFooter note={frontmatter} />
    </div>
  )
}

export default BookQuotes
