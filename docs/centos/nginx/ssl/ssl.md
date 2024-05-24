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

    CERTIFICATE 부분 줄바꿈 처리
    ```txt
    -----END CERTIFICATE----------BEGIN CERTIFICATE----- // [!code --]
    -----END CERTIFICATE----- // [!code ++]
    -----BEGIN CERTIFICATE----- // [!code ++]
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
    vi /etc/nginx/conf.d/example.com.conf
    ```

    ::: code-group
    ```bash [example.com.conf]
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
            index index.html index.htm;
        }
    }
    ```
    :::

    ::: tip
    더 다양한 설정 방법은 [nginx conf 파일 구성 예시](/centos/nginx/install.html#nginx-conf-파일-구성-예시) 참고
    :::

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