# Portainer CE 설치

::: info
해당 문서는 Nginx Reverse Proxy 를 활용하여 Nginx 뒤에서 동작하는 Portainer 구성 방식을 설명합니다.
:::

::: tip
[공식 문서 바로가기](https://docs.portainer.io/start/install-ce/server/swarm/linux)
:::

## Nginx 설정
[Nginx 설정](./nginx.md#directory-structure) 을 참고하여 `./conf/nginx/conf.d/` 위치에 `portainer.mydomain.com.conf` 파일을 생성합니다.

``` bash
vi portainer.mydomain.com.conf
```

아래 예제를 참고하여 conf 파일을 구성합니다.

::: code-group
``` conf [portainer.mydomain.com.conf]
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream portainer {
    server portainer:9000;
}

server {
    server_name portainer.mydomain.com;

    charset utf-8;

    location / {
        proxy_set_header Host $host;
        proxy_pass http://portainer;
    }

    location /api/websocket/exec {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_pass http://portainer;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate     /etc/letsencrypt/live/mydomain.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mydomain.com/privkey.pem; # managed by Certbot
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
}

server {
    if ($host = portainer.mydomain.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name portainer.mydomain.com;
    return 404; # managed by Certbot
}
```
:::

::: tip
적용을 위해 nginx 재시작이 필요합니다.
:::

## Portainer 배포

::: warning
[Nginx](./nginx.md) 세팅을 완료한 것을 전재로 합니다. `nginx_network` overlay network 가 필요합니다.
:::

::: info
`Nginx` 에서 `Portainer` 서버를 Reverse Proxy 할 수 있도록 동일한 overlay network 로 설정합니다.
:::

Portainer stack yml 파일을 생성합니다.

``` bash
vi stack.yml
```

::: code-group
``` yml [stack.yml]
version: '3.7'

services:
  agent:
    image: portainer/agent:2.19.5
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /var/lib/docker/volumes:/var/lib/docker/volumes
    networks:
      - network
    deploy:
      mode: global
      placement:
        constraints: [node.platform.os == linux]

  portainer:
    image: portainer/portainer-ce:2.19.5
    command: -H tcp://tasks.agent:9001 --tlsskipverify
    ports:
      - "9443:9443"
      - "9000:9000"
      - "8000:8000"
    volumes:
      - portainer_data:/data
    networks:
      - network
      - nginx_network
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]

networks:
  network:
    driver: overlay
    attachable: true

  nginx_network:
    external: true

volumes:
  portainer_data:
```
:::

yml 파일을 이용하여 Stack 을 배포합니다.
``` bash
docker stack deploy -c stack.yml protainer
```

service 실행 확인
``` bash
docker service ls
```

::: info
`https://portainer.mydomain.com` 에 접속하여 초기 설정을 완료합니다.
:::