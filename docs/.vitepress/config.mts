import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'aiXP',
  description: 'Extreme Programming for Human-AI Teams of 1 to N',
  base: '/aiXP/',

  themeConfig: {
    editLink: {
      pattern: 'https://github.com/AI-Extreme-Programming/aiXP/edit/main/docs/:path',
      text: 'Edit this page on GitHub' // Optional: customize the link text
    },
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3],
      label: 'On this page'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Start reading', link: '/aixp/00.01-preface' }
    ],

    sidebar: [
      { text: 'Preface', link: '/aixp/00.01-preface' },
      { text: 'Introduction', link: '/aixp/00.10-introduction' },
      {
        text: 'Chapters',
        items: [
          { text: '1. The Manifesto', link: '/aixp/01.00-manifesto' },
          { text: '2. Intent and Context', link: '/aixp/02.00-intent-and-context' },
          { text: '3. The Terminal Loop', link: '/aixp/03.00-terminal-loop' },
          { text: '4. Judgment, Roles, and Cognitive Budgeting', link: '/aixp/04.00-judgment-and-roles' },
          { text: '5. Verification Strategy and Integration', link: '/aixp/05.00-verification-and-testing' },
          { text: '6. Delivery, Release, and Observability', link: '/aixp/06.00-delivery-and-release' },
          { text: '7. Scaling Beyond the Solo Practitioner', link: '/aixp/07.00-scaling' },
          { text: '8. aiXP in the Modern Landscape', link: '/aixp/08.00-modern-landscape' },
          { text: '9. What aiXP Is Not', link: '/aixp/09.00-anti-patterns' },
        ]
      },
      {
        text: 'Back Matter',
        items: [
          { text: 'Appendix - Original 12 XP Practices', link: '/aixp/10.01-appendix-original-12' },
          { text: 'Bibliography', link: '/aixp/10.02-bibliography' },
        ]
      },
    ],

    socialLinks: []
  }
})
