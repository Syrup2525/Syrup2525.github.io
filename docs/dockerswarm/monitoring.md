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
        published: 3100 # 필요시 변경 // [!code warning]
        protocol: tcp
        mode: ingress
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == manager
          - node.labels.monitoring == true
    volumes:
      - type: volume
        source: grafana-data
        target: /var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=${GRAFANA_ROOT_URL} # path 기반 routing 시 설정 ex) https://mydomain.com/grafana // [!code warning]
    networks:
      - net    
      - nginx_network // [!code ++]

  prometheus:
    image: portainer/template-swarm-monitoring:prometheus-v2.44.0
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--log.level=error'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=7d'
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == manager
          - node.labels.monitoring == true
    volumes:
      - type: volume
        source: prometheus-data
        target: /prometheus
    networks:
      - net

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    command: -logtostderr -docker_only
    deploy:
      mode: global
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M
    volumes:
      - type: bind
        source: /
        target: /rootfs
        read_only: true
      - type: bind
        source: /var/run
        target: /var/run
        read_only: true
      - type: bind
        source: /sys
        target: /sys
        read_only: true
      - type: bind
        source: /var/lib/docker
        target: /var/lib/docker
        read_only: true
      - type: bind
        source: /dev/disk
        target: /dev/disk
        read_only: true                        
    networks:
      - net

  node-exporter:
    image: prom/node-exporter:v1.5.0
    command:
      - '--path.sysfs=/host/sys'
      - '--path.procfs=/host/proc'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
      - '--no-collector.ipvs'
    deploy:
      mode: global
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M
    volumes:
      - type: bind
        source: /
        target: /rootfs
        read_only: true
      - type: bind
        source: /proc
        target: /host/proc
        read_only: true
      - type: bind
        source: /sys
        target: /host/sys
        read_only: true
    networks:
      - net

volumes:
  grafana-data:
  prometheus-data:

networks:
  net:
    driver: overlay

  nginx_network:  // [!code ++]
    external: true  // [!code ++]
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


::: tip
::: details url path 기반으로 라우팅 하기
서브도메인을 사용하는것이 아닌 path 기반으로 conf 파일을 작성하는 방법입니다.

::: code-group
``` conf [mydomain.com.conf]
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream grafana {
    server grafana:3000; # grafana target ports 를 입력합니다. published 사용 X
}

server {
    server_name mydomain.com;

    charset utf-8;

    location /grafana/ {
        rewrite ^/grafana/(.*)$ /$1 break;

        proxy_set_header Host $host;
        proxy_pass http://grafana;
    }

    location /api/live/ {
        rewrite ^/grafana/(.*)$ /$1 break;

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
    if ($host = mydomain.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name mydomain.com;
    return 404; # managed by Certbot
}
```
:::

설정 완료 후 nignx service 를 재시작 합니다.