import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Syrup",
  description: "개발 여정에서 겪은 고민과 해결의 순간들, 그리고 환경 구성 방법을 기록하는 공간",
  themeConfig: {
    logo: "https://github.com/Syrup2525/Syrup2525.github.io/blob/main/docs/images/logo_circle.png?raw=true",
    nav: [
      // { text: 'Home', link: '/' },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: {
      '/k8s/': [
        {
          text: '쿠버네티스 환경 구성',
          items: [
            { text: 'Master 구성', link: '/k8s/install/step1-master.md' },
            { text: 'Worker 구성', link: '/k8s/install/step2-worker.md' },
            { text: 'Rancher 설치', link: '/k8s/install/step3-rancher.md' },
            { text: '설치 제거', link: '/k8s/install/step4-uninstall.md' },
          ]
        },
      ],
      '/centos/': [
        {
          text: 'CentOS',
          items: [
            {
              text: 'Nginx',
              items: [
                { text: "설치", link: '/centos/nginx/install' },
                { 
                  text: 'SSL 적용',
                  items: [
                    { text: 'Lets encrypt 인증서 발급 (certbot 활용)', link: '/centos/nginx/ssl/certbot' },
                    { text: '공용 또는 개인 CA 서명 인증서 적용', link: '/centos/nginx/ssl/ssl' },
                  ],
                }
              ]
            },
            {
              text: 'Node.js',
              items: [
                { text: "개발 환경 구성", link: '/centos/nodejs/step1-nodejs' },
                { text: "Nginx 프록시 서버 구성", link: '/centos/nodejs/step2-nginx' },
              ]
            },
            {
              text: 'php (7.4)',
              items: [
                { text: "php-fpm 설치", link: '/centos/php/step1-phpfpm' },
                { text: "Nginx 연동", link: '/centos/php/step2-nginx' },
              ]
            },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/syrup2525' }
    ],

    outline: [2, 3],
  }
})
