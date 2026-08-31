import * as React from 'react'
import { Script } from 'gatsby'
import config from '../../gatsby-config'
import { expandIPFS } from '../lib/ipfs'

const DEFAULT_OG_IMAGE = 'bafybeieg2hv4pfvkccj6axnaqzhv3ue3jsifx4ws4zfw6ld3d4i7r37x2y'
const FAVICON = 'bafybeify2jkbx7hyqqb6siu4sn2xhtoroj7f7zjuseub6hmvhj3yfovojm'

const NoteHead = ({ note }) => (
  <>
    <title>{ note.title }</title>
    <link rel="icon" type="image/png" sizes="32X32" href={expandIPFS(FAVICON)} />
    <link rel="canonical" href={`${config.siteMetadata.siteUrl}notes/${note.slug}/`} />
    <meta property="og:image" content={expandIPFS(note.ogimage || DEFAULT_OG_IMAGE)} />
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

export default NoteHead
