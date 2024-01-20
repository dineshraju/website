/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Dinesh Raju's notes`,
    siteUrl: `https://dinesh.eth.limo/`
  },
  plugins: ["gatsby-transformer-remark", {
    resolve: 'gatsby-source-filesystem',
    options: {
      "name": "notes",
      "path": "./src/pages/notes/"
    },
    __key: "notes"
  }]
};
