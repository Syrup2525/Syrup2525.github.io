# Nginx 설치

::: info
해당 문서는 Nginx 와 certbot 을 활용하여 두개의 도메인에 대해 SSL 을 적용하는 방법을 설명합니다.
:::

## Directory Structure

```
.
├─ certbot_updateall.sh
├─ conf
│  └─ nginx
│     ├─ conf.d
│     │   ├─ mydomain.com.conf
│     │   └─ mydomain2.com.conf
│     └─ nginx.conf
├─ data
│  └─ certbot
│     ├─ etc
│     └─ www
└─ stack.yml
```

## certbot Let's Encrypt SSH 발급

::: tip
TCP 80, TCP 443 을 활용하여 인증하기 때문에 nginx 컨테이너를 올리기전 먼저 선행해야 됩니다.
:::

``` bash
docker run --rm \
  -p 443:443 -p 80:80 --name letsencrypt \
  -v "./data/certbot/etc:/etc/letsencrypt" \
  -v "./data/certbot/www:/var/www/letsencrypt" \
  certbot/certbot certonly -n \
  -m "youemail@example.com" \
  -d mydomain.com \
  -d mydomain2.com \
  --standalone --agree-tos --no-eff-email
```

아래 두 경로에서 발급된 인증서를 확인할수 있습니다.

```
/etc/letsencrypt/live/mydomain.com/fullchain.pem
/etc/letsencrypt/live/mydomain2.com/privkey.pem
```

## Nginx 구성

### 기본 conf 파일 작성
[최종 Directory 구조](#directory-structure) 를 참고하여 `./conf/nginx/` 위치에 `nginx.conf` 파일을 생성합니다.

``` bash
cd ./conf/nginx/
```

``` bash
vi nginx.conf
```

::: code-group
``` conf [nginx.conf]
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```
:::

### 첫번째 도메인 conf 파일 작성

[최종 Directory 구조](#directory-structure) 를 참고하여 `./conf/nginx/conf.d/` 위치에 `mydomain.com.conf` 파일을 생성합니다.

``` bash
cd ./conf/nginx/conf.d
```

``` bash
vi mydomain.com.conf
```

::: code-group
``` conf [mydomain.com.conf]
server {
    server_name mydomain.com;

    charset utf-8;

    location / {
    	resolver 127.0.0.11 valid=10s;

        # 여기에 각 환경에 맞는 필요한 내용을 기입합니다.
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

### 두번째 도메인 conf 파일 작성
[최종 Directory 구조](#directory-structure) 를 참고하여 `./conf/nginx/conf.d/` 위치에 `mydomain2.com.conf` 파일을 생성합니다.

``` bash
cd ./conf/nginx/conf.d
```

``` bash
vi mydomain2.com.conf
```

::: code-group
``` conf [mydomain2.com.conf]
server {
    server_name mydomain2.com;

    charset utf-8;

    location / {
    	resolver 127.0.0.11 valid=10s;

        # 여기에 각 환경에 맞는 필요한 내용을 기입합니다.
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate     /etc/letsencrypt/live/mydomain.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mydomain.com/privkey.pem; # managed by Certbot
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
}

server {
    if ($host = mydomain2.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name mydomain2.com;
    return 404; # managed by Certbot
}
```
:::

### Docker Stack 생성
[최종 Directory 구조](#directory-structure) 를 참고하여 `./` 위치에 `stack.yml` 파일을 생성합니다.

``` bash
vi stack.yml
```

::: code-group
``` yml [stack.yml]
version: '3.7'

services:
  nginx:
    image: nginx:latest
    restart: always
    ports:
      - 80:80
      - 443:443
    volumes:
      - ./conf/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./conf/nginx/conf.d:/etc/nginx/conf.d
      - ./data/certbot/etc:/etc/letsencrypt
      - ./data/certbot/www:/var/www/certbot
    environment:
      - TZ=Asia/Seoul
    networks:
      - network

networks:
  network:
    driver: overlay
    attachable: true
```
:::

yml 파일을 이용하여 Stack 을 배포합니다.
``` bash
docker stack deploy -c stack.yml nginx
```

service 실행 확인
``` bash
docker service ls
```

## SSL 재발급
[최종 Directory 구조](#directory-structure) 를 참고하여 `./` 위치에 `certbot_updateall.sh` 파일을 생성합니다.

``` bash
vi certbot_updateall.sh
```

::: code-group
``` sh [certbot_updateall.sh]
docker run --rm --name letsencrypt \
  -v "./data/certbot/etc:/etc/letsencrypt" \
  -v "./data/certbot/www:/var/www/letsencrypt" \
  certbot/certbot:latest \
  renew --quiet
```
:::

sh 파일을 실행하여 SSL 재발급이 가능합니다

``` bash
sh certbot_updateall.sh 
```

::: tip
crontab 에 명령어를 등록하여 자동으로 갱신할 수 있습니다.
:::