import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Syrup",
  description: "개발 여정에서 겪은 고민과 해결의 순간들, 그리고 환경 구성 방법을 기록하는 공간",
  themeConfig: {
    logo: "https://github.com/Syrup2525/Syrup2525.github.io/blob/main/docs/images/logo_circle.png?raw=true",
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'kubernetes',
        items: [
          {
            text: 'k3s',
            items: [
              { text: 'k3s 설치', link: '/kubernetes/k3s/install' },
            ],
          },
          {
            text: 'k8s',
            items: [
              { text: 'k8s 설치', link: '/kubernetes/k8s/install/step1-master' },
              { text: 'k8s 설정', link: '/kubernetes/k8s/setting/coredns' },
            ],
          },
          { text: '쿠버네티스 설정', link: '/kubernetes/setting/ingress' },
          { text: 'Rancher', link: '/kubernetes/rancher'},
          { text: 'GitOps, CI/CD', link: '/kubernetes/gitops/gitlab' },
          { text: 'Database', link: '/kubernetes/database/mysql' },
          { text: 'Apache Kafka', link: '/kubernetes/kafka/install' },
          { text: 'EFK', link: '/kubernetes/efk' },
          { text: 'Prometheus', link: '/kubernetes/prometheus' },
        ]
      },
      {
        text: 'CentOS',
        items: [
          { text: 'Kafka',  link: '/centos/kafka/kraft.html'},
          { text: 'Nginx', link: '/centos/nginx/install.html' },
          { text: 'Node.js', link: '/centos/nodejs/step1-nodejs' },
          { text: 'php (7.4)', link: '/centos/php/step1-phpfpm' },
          { text: 'Docker', link: '/centos/docker' },
          { text: "MongoDB", link: "/centos/mongodb" },
          { text: "MySQL 8", link: "/centos/mysql8" },
        ],
      },
      {
        text: "MacOS",
        items: [
          { text: "CI/CD", link: "/macos/cicd" },
          { text: "GitLab-Runner 설정", link: "/macos/gitlab-runner" },
          { text: "fastlane match 설정", link: "/macos/fastlane-match" },
          { text: "pod 라이브러리 재설치", link: "/macos/pod-reinstall" },
        ],
      },
      {
        text: "Docker",
        items: [
          { text: "kafka", link: "/docker/kafka" },
          { text: "MongoDB", link: "/docker/mongodb" },
          { text: "MySQL 8", link: "/docker/mysql8" },
          { text: "Portainer", link: "/docker/portainer" },
          { text: "redis", link: "/docker/redis" },
        ],
      },
      {
        text: "Docker Swarm",
        items: [
          { text: "CI/CD", link: "/dockerswarm/cicd" },
          { text: "Gitlab", link: "/dockerswarm/gitlab" },
          { text: "Nginx", link: "/dockerswarm/nginx" },
          { text: "Portainer", link: "/dockerswarm/portainer" },
          { text: "Monitoring", link: "/dockerswarm/monitoring" },
          { text: "Registry", link: "/dockerswarm/registry" },
        ],
      },
    ],
    sidebar: {
      '/kubernetes/': [
        { text: 'k3s 설치', link: '/kubernetes/k3s/install'},
        {
          text: 'k8s 설치',
          items: [
            { text: 'Master 구성', link: '/kubernetes/k8s/install/step1-master.md' },
            { text: 'Worker 구성', link: '/kubernetes/k8s/install/step2-worker.md' },
            { text: '설치 제거', link: '/kubernetes/k8s/install/step3-uninstall.md' },
          ],
        },
        {
          text: 'k8s 설정',
          items: [
            { text: 'Core DNS', link: '/kubernetes/k8s/setting/coredns' },
          ],
        },
        {
          text: '쿠버네티스 설정',
          items: [
            { text: 'Ingress', link: '/kubernetes/setting/ingress' },
          ],
        },
        {
          text: 'GitOps, CI/CD',
          items: [
            { text: 'GitLab', link: '/kubernetes/gitops/gitlab' },
            { text: 'CI (gitlab-runner)', link: '/kubernetes/gitops/ci' },
            { text: 'CD (Argo CD)', link: '/kubernetes/gitops/cd' },
            { text: 'Troubleshooting', link: '/kubernetes/gitops/troubleshooting' },
          ],
        },
        {
          text: 'Database',
          items: [
            { text: 'MySQL', link: '/kubernetes/database/mysql' },
            { text: 'MongoDB', link: '/kubernetes/database/mongodb' },
            { text: 'Redis', link: '/kubernetes/database/redis' },
          ],
        },
        {
          text: 'Apache Kafka',
          items: [
            { text: 'Install', link: '/kubernetes/kafka/install' },
            { text: 'UI', link: '/kubernetes/kafka/ui' },
          ],
        },
        { text: 'Rancher', link: '/kubernetes/rancher.md' },
        { text: 'EFK', link: '/kubernetes/efk' },
        { text: 'Prometheus', link: '/kubernetes/prometheus' },
      ],
      '/centos/': [
        {
          text: 'CentOS',
          items: [
            {
              text: 'Kafka',
              items: [
                { text: "kraft 사용", link: '/centos/kafka/kraft'},
                { text: "zookeeper 사용", link: '/centos/kafka/zookeeper'},
              ],
            },
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
                  collapsed: true,
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
              text: 'PHP (7.4)',
              items: [
                { text: "php-fpm 설치", link: '/centos/php/step1-phpfpm' },
                { text: "Nginx 연동", link: '/centos/php/step2-nginx' },
              ]
            },
            { text: 'Docker', link: '/centos/docker' },
            { text: "MongoDB", link: "/centos/mongodb" },
            { text: "mysql", link: "/centos/mysql8" },
          ]
        }
      ],
      "/macos/": [
        {
          text: "MacOS",
          items: [
            { text: "CI/CD", link: "/macos/cicd" },
            { text: "GitLab-Runner 설정", link: "/macos/gitlab-runner" },
            { text: "fastlane match 설정", link: "/macos/fastlane-match" },
            { text: "pod 라이브러리 재설치", link: "/macos/pod-reinstall" },
          ]
        }
      ],
      "/docker/": [
        {
          text: "Docker",
          items: [
            { text: "kafka", link: "/docker/kafka" },
            { text: "MongoDB", link: "/docker/mongodb" },
            { text: "MySQL 8", link: "/docker/mysql8" },
            { text: "Portainer", link: "/docker/portainer" },
            { text: "redis", link: "/docker/redis" },
          ]
        }
      ],
      "/dockerswarm/": [
        {
          text: "Docker Swarm",
          items: [
            { text: "CI/CD", link: "/dockerswarm/cicd" },
            { text: "Gitlab", link: "/dockerswarm/gitlab" },
            { text: "Nginx", link: "/dockerswarm/nginx" },
            { text: "Portainer", link: "/dockerswarm/portainer" },
            { text: "Monitoring", link: "/dockerswarm/monitoring" },
            { text: "Registry", link: "/dockerswarm/registry" },
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
