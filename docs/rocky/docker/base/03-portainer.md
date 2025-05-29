# Portainer
## Portainer 구성
1. 경로 생성
``` bash
mkdir -p ~/portainer
cd ~/portainer
```

2. docker-compose.yml 작성
``` bash
vi docker-compose.yml
```

* `portainer.example.com` 에 본인 도메인 입력

::: code-group
``` yml [docker-compose.yml]
services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(`portainer.example.com`)"
      - "traefik.http.routers.portainer.entrypoints=websecure"
      - "traefik.http.routers.portainer.tls.certresolver=le"
      - "traefik.http.services.portainer.loadbalancer.server.port=9000"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "portainer_data:/data"
    networks:
      - traefik

volumes:
  portainer_data:

networks:
  traefik:
    external: true

```
:::

3. 배포
``` bash
cd ~/portainer
docker-compose up -d
```