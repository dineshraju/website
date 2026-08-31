import * as React from 'react'
import { Link } from 'gatsby'

const NoteFooter = ({ note }) => (
  <div className="footerbox">
    <hr className="footerhr" />
    <a className="footerdate" href={`https://github.com/dineshraju/website/blob/main/src/pages/notes/${note.slug}.md`} target="_blank"> last updated {note.updated}</a>
    <Link className="footercat" to="/notes/">other notes</Link>
  </div>
)

export default NoteFooter
