# Gitlab CE

::: tip
`Gitlab CE` 를 설치하고 `Nginx` 를 사용하여 `Reverse Proxy` 세팅 방법을 기준으로 설명합니다.
:::

## Gitalb 설치
### GitLab 저장소 추가 및 설치
#### 1. 저장소 스크립트 실행
``` bash
curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash
```

#### 2. GitLab CE 설치
``` bash
sudo EXTERNAL_URL="https://gitlab.example.com" dnf install -y gitlab-ce
```
`EXTERNAL_URL` 사용할 도메인으로 변경

### 기본 GitLab 설정
`/etc/gitlab/gitlab.rb` 파일을 열어 설정 변경
``` bash
sudo vi /etc/gitlab/gitlab.rb
```

> `1210 line` 근처 `gitlab_workhorse`
> ``` txt
> gitlab_workhorse['listen_network'] = "tcp"
> gitlab_workhorse['listen_addr'] = "127.0.0.1:8080"
> gitlab_workhorse['auth_backend'] = "http://localhost:8181"
> ```

> `1349 line` 근처 `puma`
> ```
> puma['listen'] = '127.0.0.1'
> puma['port'] = 8181
> puma['socket'] = ""
> ```

> `1805 line` 근처 `nginx`
> ``` txt
> nginx['enable'] = false
> # nginx['client_max_body_size'] = '0'
> nginx['redirect_http_to_https'] = false
> ```

설정 적용
``` bash
sudo gitlab-ctl reconfigure
sudo gitlab-ctl restart
```

### Reverse Proxy 설정
``` bash
vi /etc/nginx/conf.d/example.com.conf
```
``` txt
# /etc/nginx/conf.d/gitlab.example.com.conf
server {
    listen 443 ssl http2;
    server_name gitlab.example.com;

    ssl_certificate     /etc/nginx/ssl/gitlab.example.com/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/gitlab.example.com/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name gitlab.example.com;
    return 301 https://$host$request_uri;
}
```
::: tip
더 자세한 설정은 [Nginx Reverse Proxy](/rocky/nginx-reverse-proxy) 참고
:::

nginx 설정 테스트 및 제시작
``` bash
nginx -t
systemctl restart nginx
```

### Web 접속
초기 `root` 유저 정보 확인
> Username: root
> 
> Password: `/etc/gitlab/initial_root_password` 파일 확인

## Gitalb 제거
::: tip
[공식문서 바로가기](https://docs.gitlab.com/install/package/?utm_source=chatgpt.com)
:::
1. 패키지에서 생성된 모든 사용자와 그룹을 제거
``` bash
sudo gitlab-ctl stop && sudo gitlab-ctl remove-accounts
```

2. 모든 데이터 제거
``` bash
sudo gitlab-ctl cleanse && sudo rm -r /opt/gitlab
```

3. 패키지 제거
``` bash
sudo dnf remove gitlab-ee
```