const expandIPFS = hash => `https://ipfs.dineshraju.xyz/${hash}`

const expandIPFSReferences = value => value.replaceAll(
  /ipfs:\/\/(baf[A-Za-z2-7]{56})/g,
  (match, hash) => expandIPFS(hash)
)

module.exports = {
  expandIPFS,
  expandIPFSReferences
}
