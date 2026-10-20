import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'aiXP',
  description: 'Extreme Programming for Human-AI Teams of 1 to N',
  base: '/aiXP/',

  themeConfig: {
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Start reading', link: '/aixp/00.01-preface' }
    ],

    sidebar: [
      {
        text: 'Front Matter',
        items: [
          { text: 'Preface', link: '/aixp/00.01-preface' },
          { text: 'How to Read This Book', link: '/aixp/00.02-how-to-read' },
        ]
      },
      {
        text: 'Part I - Background',
        items: [
          { text: 'The Problem with Vibe Coding', link: '/aixp/01.01-vibe-coding' },
          { text: "XP's Original Bet", link: '/aixp/01.02-xp-background' },
          { text: 'What Changed When AI Joined the Team', link: '/aixp/01.03-what-changed' },
        ]
      },
      {
        text: 'Part II - The Manifesto',
        items: [
          { text: 'Pillars and Rejection Criteria', link: '/aixp/02.01-manifesto' },
        ]
      },
      {
        text: 'Part III - The Practices',
        items: [
          { text: 'XP Practices Carried Over', link: '/aixp/03.01-xp-practices-carried-over' },
          { text: 'New Practices, Native to aiXP', link: '/aixp/03.02-new-practices' },
          { text: 'DevOps/SRE Practices Adopted', link: '/aixp/03.03-devops-practices' },
          { text: 'Testing Strategy', link: '/aixp/03.04-testing-tiers' },
          { text: 'Versioning and Release Identity', link: '/aixp/03.05-versioning' },
        ]
      },
      {
        text: 'Part IV - Context and Comparison',
        items: [
          { text: 'aiXP vs. the AI-Native SDLC', link: '/aixp/04.01-comparison-ai-native-sdlc' },
          { text: 'Scaling Beyond the Solo Practitioner', link: '/aixp/04.02-scaling' },
          { text: 'What aiXP Is Not', link: '/aixp/04.03-anti-patterns' },
        ]
      },
      {
        text: 'Back Matter',
        items: [
          { text: 'Appendix - Original 12 XP Practices', link: '/aixp/05.02-appendix-original-12' },
          { text: 'Bibliography', link: '/aixp/05.03-bibliography' },
        ]
      },
    ],

    socialLinks: []
  }
})
