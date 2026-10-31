import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'aiXP',
  description: 'Extreme Programming for Human-AI Teams of 1 to N',
  base: '/aiXP/',

  themeConfig: {
    editLink: {
      pattern: 'https://github.com/AI-Extreme-Programming/aiXP/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
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
        text: 'Part I: The Premise and the Loop',
        items: [
          { text: '1. The Manifesto', link: '/aixp/01.50-manifesto' },
          { text: '2. Intent and Context', link: '/aixp/02.50-intent-and-context' },
          { text: '3. The Terminal Loop', link: '/aixp/03.50-terminal-loop' },
          { text: '4. Judgment, Roles, and Cognitive Budgeting', link: '/aixp/04.50-judgment-and-roles' },
        ]
      },
      {
        text: 'Part II: The Speed of Trust',
        items: [
          { text: '5. Verification Strategy and Integration', link: '/aixp/05.50-verification-and-testing' },
          { text: '6. Delivery, Release, and Observability', link: '/aixp/06.50-delivery-and-release' },
          { text: '7. What aiXP Is Not: Anti-Patterns and Traps', link: '/aixp/07.50-anti-patterns' },
        ]
      },
      {
        text: 'Part III: The Horizon',
        items: [
          { text: '8. Scaling Beyond the Solo Practitioner', link: '/aixp/08.50-scaling' },
          { text: '9. The Future of the Craft', link: '/aixp/09.50-future-of-the-craft' },
        ]
      },
      {
        text: 'Appendices',
        items: [
          { text: 'Appendix A - Original 12 XP Practices', link: '/aixp/10.01-appendix-original-12' },
          { text: 'Appendix B - aiXP and the AI-Native SDLC', link: '/aixp/10.02-appendix-ai-native-sdlc' },
          { text: 'Appendix C - Bibliography and Lineage', link: '/aixp/10.03-bibliography' },
        ]
      },
    ],

    socialLinks: []
  }
})
