# 공용 또는 개인 서명 인증서 적용 (GOGET SSL 기준)

## 인증서 생성
* 메인 > SSL Certificate Details > 도메인 선택 > All files

* 인증서 합치기
    ```bash
    cat domain.crt CA.crt Certification_Authority.crt > crt
    ```

* crt 수정
    ```bash
    vi crt
    ```

    해당 부분을
    ```bash
    -----END CERTIFICATE----------BEGIN CERTIFICATE-----
    ```

    아래처럼 줄바꿈 처리한다.
    ```bash
    -----END CERTIFICATE-----
    -----BEGIN CERTIFICATE-----
    ```

* 인증서 파일 경로 수정 (필요한 경우)
    ```bash
    mkdir /etc/nginx/ssl
    ```
    
    ```bash
    chcon -Rv --type=httpd_config_t /etc/nginx/ssl
    ```

    ```bash
    mv crt /etc/nginx/ssl
    ```

*  개인 키 파일 생성
    ```bash
    vi /etc/nginx/ssl/key
    ```

## conf 파일 수정

* conf 파일에 다음과 같이 ssl 적용 (예시)

    ```bash
    server {
        listen 80;
        server_name example.com;
        root html;
	
        location / {
            return 301 https://example.com$request_uri;
        }
    }

    server {
        listen      443 ssl;
        server_name example.com;

        charset utf-8;

        # ssl 인증서 추가
        ssl_certificate     /etc/nginx/ssl/crt;
        ssl_certificate_key /etc/nginx/ssl/key;

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

## nginx 데몬 재시작 및 SSL 확인

* nginx conf 파일 확인 및 데몬 재시작

    ```bash
    nginx -t
    ```

    ```bash
    systemctl restart nginx
    ```

    ```bash
    systemctl status nginx
    ```

* SSL 확인
    
    [sslshopper.com](https://www.sslshopper.com/ssl-checker.html) 또는 [decoder.link](https://decoder.link/sslchecker/) 에 접속해서 본인 도메인을 넣고 적용이 잘 되었는지 확인 (모든 항목이 성공 표시가 되어야함)