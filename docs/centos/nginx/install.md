# nginx 설치

## nginx 설치 및 서비스 등록
```bash
yum install nginx
```
```bash
systemctl start nginx 
```
```bash
systemctl status nginx
```
```bash
systemctl enable nginx
```

## Nginx conf 파일 구성 예시
### 포트 프록시
/exmaple 경로에 3000번 포트 프록시
::: code-group
```bash [example.com.conf]
location /example {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```
:::

### webSocket 프록시
/socket 경로에 webSocket 3001번 포트 프록시
::: code-group
```bash [example.com.conf]
location /socket {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;

    proxy_pass http://127.0.0.1:3001;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    roxy_set_header Connection "upgrade";
}
```
:::

### php 설정 
/example/php 경로에 php 설정
::: code-group
```bash [example.com.conf]
location ^~ /example/php {
    alias /home/user/php/example/;
    index index.html index.htm index.php;

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9000;
        include        fastcgi_params;
        fastcgi_param  SCRIPT_FILENAME $request_filename;
    }
}
:::

### 모두 적용시 최종 형태
::: code-group
```bash [example.com.conf]
server {
    listen 80;
    server_name example.com;

    charset utf-8;

    # root
    location / {
        root /home/user/public-html/example/;
        index index.html index.htm index.php;

        # php 
        location ~ \.php$ {
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include        fastcgi_params;
        }
    }

    # /example (node listen 3000)
    location /example {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # /socket (node listen 3001 webSocket)
    location /socket {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;

        proxy_pass http://127.0.0.1:3001;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        roxy_set_header Connection "upgrade";
    }

    # /example/php
    location ^~ /example/php {
        alias /home/user/php/example/;
        index index.html index.htm index.php;

        location ~ \.php$ {
            fastcgi_pass   127.0.0.1:9000;
            include        fastcgi_params;
            fastcgi_param  SCRIPT_FILENAME $request_filename;
        }
    }
}
```
:::