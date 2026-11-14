import { defineConfig } from 'vitepress'

// sidebar: [ { link: '/commented/out' } ]
const note = "sidebar: ['/not/a/sidebar']"

export default defineConfig({
  title: 'Fixture',
  base: '/Fixture/',
  themeConfig: {
    editLink: {
      pattern: 'https://example.invalid/edit/:path', // trailing comment with ] and }
      text: `Edit ${'this'} page`
    },
    /* sidebarish: [] */
    sidebar: [
      { text: 'One', link: '/book/01-one' },
      {
        text: "Group [with brackets]",
        items: [
          { text: 'Two', link: '/book/02-two.md' },
          { text: 'Three', link: '/book/03-three.html' },
        ],
      },
      {
        text: 'Based',
        base: '/book/',
        items: [
          { text: 'Four', link: '04-four' },
          { text: 'External', link: 'https://example.invalid/' },
        ]
      },
    ],
  }
})
