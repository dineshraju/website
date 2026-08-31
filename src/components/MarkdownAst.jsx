import * as React from 'react'
import hastToHyperscript from 'hast-to-hyperscript'

const MarkdownAst = ({ node, prefix }) => (
  hastToHyperscript(React.createElement, node, { prefix })
)

export default MarkdownAst
