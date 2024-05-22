import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Syrup2525",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      // { text: 'Home', link: '/' },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: '쿠버네티스 환경 구성',
        items: [
          { text: 'Master 구성', link: '/k8s/step1-master.md' },
          { text: 'Worker 구성', link: '/k8s/step2-worker.md' },
          { text: 'Rancher 설치', link: '/k8s/step3-rancher.md' },
          { text: '설치 제거', link: '/k8s/step4-uninstall.md' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
