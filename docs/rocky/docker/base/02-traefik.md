# Traefik
## Traefik 구성
1. network 생성
``` bash
docker network create traefik
```

2. 경로 생성
``` bash
mkdir -p ~/traefik
cd ~/traefik
```

3. docker-compose.yml 작성
``` bash
vi docker-compose.yml
```

* `example@mail.com` 에 본인 이메일 입력

::: code-group
``` yml [docker-compose.yml]
version: '3'

services:
  traefik:
    image: traefik:v2.11
    container_name: traefik
    restart: always
    command:
      - "--api.dashboard=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--certificatesresolvers.le.acme.httpchallenge=true"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.le.acme.email=example@email.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "./letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    networks:
      - traefik

networks:
  traefik:
    external: true
```
:::

4. 권한 설정
``` bash
mkdir -p ~/traefik/letsencrypt
touch ~/traefik/letsencrypt/acme.json
chmod 600 ~/traefik/letsencrypt/acme.json
```

5. 배포
``` bash
cd ~/traefik
docker-compose up -d
```