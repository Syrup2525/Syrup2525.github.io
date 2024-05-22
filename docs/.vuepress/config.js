import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'ko-KR',

  title: 'Syrup2525',
  description: '개발 여정에서 겪은 고민과 해결의 순간들, 그리고 환경 구성 방법을 기록하는 공간',

  theme: defaultTheme({
    logo: 'https://avatars.githubusercontent.com/u/86085963?s=400&u=0279a220e13bbbec8fb4f630ba1b6e2ffa3dd581&v=4',

    // navbar: ['/', '/get-started'],
  }),

  bundler: viteBundler(),
})
