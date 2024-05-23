# Nginx 연동

## nginx 설치

* [Nginx 설치](../nginx/install) 참고 

## nginx 설정

* nginx 설정 파일 수정

    ```bash
    vi /etc/nginx/conf.d/php.conf
    ```

    ::: code-group 
    ```bash [php.conf]
    server {
        listen       80;
        server_name  <도메인 이름>;

        charset utf-8;

        root <디렉터리 경로>;
        location / {
            index  index.html index.htm index.php;
        }

        location ~ \.php$ {
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include        fastcgi_params;
        }
    }
    ```
    :::

* 설정파일 적용 (nginx 재시작)

    ```bash
    systemctl restart nginx
    ```

## 추가 설정 (필요시)

### Linux SELinux 설정
* SELinux httpd_sys_content_t 설정

    ```bash
    chcon -R -t httpd_sys_content_t <디렉터리 경로>
    ```

* SELinux httpd_can_network_connect_db 권한 설정 (DB 접속 필요시)

    ```bash
    setsebool -P httpd_can_network_connect_db 1
    ```

### Session 설정

* session 폴더 권한 설정 (session 사용 필요시)

```bash
chown -R root:nginx /var/opt/remi/php74/lib/php/session
```