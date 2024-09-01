# Registry

## 컨테이너 이미지 사설 저장소 구성

::: warning
해당 챕터에서는 `Nginx Reverse Proxy` 와 `htpasswd` 를 사용하여 docker image 사설 저장소를 구축하는 방법을 설명합니다. [Nginx 설치](./nginx.md) 에서 진행한 SSL 인증서 발급과 `Nginx` 환경이 모두 구축된 것으로 가정합니다.
:::

::: tip
- [registry Docker Hub](https://hub.docker.com/_/registry)
- [distribution Github](https://github.com/distribution/distribution)
:::

### 컨테이너 실행

아래 `yml` 파일을 참조하여 `registry` 서비스를 배포합니다.

``` yml
version: '3.7'

services:
  registry:
    image: registry:latest
    restart: always
    ports:
      - 5000:5000
    environment:
      - TZ=Asia/Seoul
    networks:
      - nginx_network

networks:
  nginx_network:
    external: true
```

### Nginx Reverse Proxy 설정

#### htpasswd 생성
[Nginx 설정](./nginx.md#directory-structure) 을 참고하여 `./conf/nginx/conf.d/` 위치에 `registry.mydomain.com.htpasswd` 파일을 생성합니다.

``` bash
htpasswd -c registry.mydomain.com.htpasswd myaccount
```

::: details bash: htpasswd: command not found 발생시
httpd-tools 설치
```bash
sudo yum install httpd-tools -y
```
:::

#### conf 파일 설정
[Nginx 설정](./nginx.md#directory-structure) 을 참고하여 `./conf/nginx/conf.d/` 위치에 `registry.mydomain.com.conf` 파일을 생성합니다.

``` bash
vi registry.mydomain.com.conf
```

아래 예제를 참고하여 conf 파일을 구성합니다.

::: code-group
``` conf [registry.mydomain.com.conf]
server {
    server_name registry.mydomain.com;

    charset utf-8;

    client_max_body_size 10240m;

    location /v2/ {
        auth_basic "registry";
        auth_basic_user_file /etc/nginx/conf.d/registry.mydomain.com.htpasswd;

        resolver 127.0.0.11 valid=10s;
    	set $upstream registry:5000;

    	proxy_pass http://$upstream;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate     /etc/letsencrypt/live/mydomain.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mydomain.com/privkey.pem; # managed by Certbot
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
}

server {
    if ($host = registry.mydomain.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name registry.mydomain.com;
    return 404; # managed by Certbot
}
```
:::

설정 완료 후 nignx service 를 재시작 합니다.
