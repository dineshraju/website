---
slug: "writing-notes"
published: "2022-12-29"
updated: "2024-09-20"
---

## Writing Notes
There are a few key ideas I keep coming back to over and over again in chats with others. I'm going to capture them in long-form notes on this site so I can just point to the notes in future conversations.

I've published some articles in the past, but it's been sporadic and I've never gotten around to consolidating everything in one place. So I'm taking some time as the year winds down to get the writing & publishing workflow set up.


### A workflow that's quick, easy & open
My main goal with the setup was to make the writing and publishing workflow quick and easy. I also didn't want to be too reliant on external hosting providers who might disappear in the future, so wanted to use as many open standards as possible. I settled on using:
- Markdown for content formatting
- IPFS for file storage
- ENS for the domain
- Public version control to track if a post got updated

### Gatsby + GitHub + Fleek
After looking at a few options, I decided on [Gatsby](https://www.gatsbyjs.com/) for the CMS. Gatsby has Markdown integration out of the box and generates standard HTML, which I'm styling with [Simple.css](https://simplecss.org/).

Once a new Gatsby project was set up, I pushed it to this [Github repository](https://github.com/dineshraju/blog), and connected it to a [Fleek](https://fleek.co) account. Fleek monitors the GitHub repository, builds the Gatsby site when it's updated and pushes the files to IPFS.

### The publishing process
Creating a new post is pretty straightforward:
1. Use ~~[Bear](https://bear.app/)~~ ~~[Notion](https://www.notion.so/)~~ [Anytype](https://anytype.io/) to draft and edit the post
2. Copy the final text into a new Markdown file and push it to the repository
3. Wait for Fleek to re-publish the site and get the IPFS hash
4. Pin the IPFS hash using ~~[Infura](https://www.infura.io/)~~ [Pinata](https://pinata.cloud/)
5. Add the IPFS record to ENS to be served up via [eth.link](https://eth.link/)

Steps 2 to 5 are fairly quick and can be automated if needed. If an individual app or service is taken down, it's easy to find a replacement since there's no reliance on proprietary formats.

So there we have it, a quick and easy publishing workflow that's up and running now. All that's left to do is actually write the content. That's the easy part right?
