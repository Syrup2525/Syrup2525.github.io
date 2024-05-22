import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Syrup",
  description: "개발 여정에서 겪은 고민과 해결의 순간들, 그리고 환경 구성 방법을 기록하는 공간",
  themeConfig: {
    logo: "/images/logo_circle.png",
    nav: [
      // { text: 'Home', link: '/' },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: {
      '/k8s/': [
        {
          text: '쿠버네티스 환경 구성',
          items: [
            { text: 'Master 구성', link: '/k8s/step1-master.md' },
            { text: 'Worker 구성', link: '/k8s/step2-worker.md' },
            { text: 'Rancher 설치', link: '/k8s/step3-rancher.md' },
            { text: '설치 제거', link: '/k8s/step4-uninstall.md' },
          ]
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/syrup2525' }
    ],

    outline: [2, 3],
  }
})
