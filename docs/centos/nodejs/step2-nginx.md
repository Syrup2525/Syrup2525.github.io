# Nginx 프록시 서버 구성

## nginx 설치

* [Nginx 설치](../nginx/install) 참고 

## nginx config 파일 설정 (root 권한 필요)

::: tip
아래 예시는 nginx 80 번 포트 요청을 node.js 3000 포트로 프록시 하는 과정을 설명합니다.
:::

* nignx proxy 서버 설정

    ```bash
    vi /etc/nginx/conf.d/node.conf
    ```

    ::: code-group
    ```bash [node.conf]
    server {
        listen       80;
        listen       [::]:80;
        server_name  test.example.com;

        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
    ```
    :::

* IP 직접접근 차단 (필요한 경우)

    ```
    vi /etc/nginx/nginx.conf
    ```
    ```
    ...
    server {
        listen       80 default_server;
	    return       444;
        ...
    }
    ...
    ```

* 변경사항 적용

    ```
    systemctl restart nginx
    ```

## SELinex 설정변경
    
* semanage 명령어 사용을 위한 패키지 설치 (필요한 경우)

    ```
    yum install policycoreutils-python
    ```

* 현재 허용되어있는 포트 확인

    ```
    semanage port --list | grep http_port_t
    ```

    * http_port_t 항목 확인

        ```
        http_port_t    tcp    80, 81, 443, 488, 8008, 8009, 8443, 9000
        ```

* 3000 번 포트 허용

    ```
    semanage port --add --type http_port_t --proto tcp 3000
    ```

## 8. 브라우저에서 접속 확인

```
http://test.example.com
```