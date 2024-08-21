# Monitoring

::: info
해당 문서는 `Portainer` 에서 제공하는 `Grafana` 커스텀 이미지를 사용해서 `도커 클러스터`와 `컨테이너`를 모니터링 하는 방법을 설명합니다. Nginx Reverse Proxy 를 사용하여 Nginx 뒤에서 동작하는것을 목표로합니다. 먼저 [Portainer 설치](./portainer.md) 를 참고하여 Portainer 설치 이후 진행해주세요.
:::

::: tip
[공식 문서 바로가기](https://www.portainer.io/blog/monitoring-a-swarm-cluster-with-prometheus-and-grafana)
:::

## 초기 설정

[공식 문서](https://www.portainer.io/blog/monitoring-a-swarm-cluster-with-prometheus-and-grafana) 를 참고해서 아래 사항을 설정합니다.

- Swarm Nodes 에 `monitoring == true` Node Labels 추가
- `App Templates` 에서 `Swarm monitoring` stack 배포

## yml 파일 변경
::: warning
[Nginx 세팅](./nginx.md)을 완료한 것을 전재로 합니다. `nginx_network` overlay network 가 필요합니다.
:::

Nginx 가 Reverse Proxy 할수 있도록 portainer WEB 에서 `초기 설정` 에서 생성된 yml 파일을 수정합니다.

``` yml
version: "3.8"

services:
  grafana:
    image: portainer/template-swarm-monitoring:grafana-9.5.2
    ports:
      - target: 3000
        published: 3100 # 필요시 변경
        protocol: tcp
        mode: ingress
    
    # ---

    networks:
      - net    
      - nginx_network # overlay network 추가

# ---

# ---

networks:
  net:
    driver: overlay

# 아래 두줄을 추가 
  nginx_network:
    external: true
```

내용을 수정 후 `Update the stack` 버튼을 눌러 배포합니다.

## Nginx 설정
::: info
[Run Grafana behind a reverse proxy Nginx 그라파나 공식 문서](https://grafana.com/tutorials/run-grafana-behind-a-proxy/#configure-nginx)
:::

[Nginx 설정](./nginx.md#directory-structure) 을 참고하여 `./conf/nginx/conf.d/` 위치에 `grafana.mydomain.com.conf` 파일을 생성합니다.

``` bash
vi grafana.mydomain.com.conf
```

아래 예제를 참고하여 conf 파일을 구성합니다.

::: code-group
``` conf [grafana.mydomain.com.conf]
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream grafana {
    server grafana:3000; # grafana target ports 를 입력합니다. published 사용 X
}

server {
    server_name grafana.mydomain.com;

    charset utf-8;

    location / {
        proxy_set_header Host $host;
        proxy_pass http://grafana;
    }

    location /api/live/ {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_pass http://grafana;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate     /etc/letsencrypt/live/mydomain.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mydomain.com/privkey.pem; # managed by Certbot
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
}

server {
    if ($host = grafana.mydomain.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name grafana.mydomain.com;
    return 404; # managed by Certbot
}
```
:::

설정 완료 후 nignx service 를 재시작 합니다.