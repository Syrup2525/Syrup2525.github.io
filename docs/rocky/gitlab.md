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

#### Registry 설정
> `1023 line` 및 `2416 line` 근처
> ``` txt{6,9-12,21-23,26,34,42,45,47,54}
> ################################################################################
> ## Container Registry settings
> ##! Docs: https://docs.gitlab.com/ee/administration/packages/container_registry.html
> ################################################################################
> 
> egistry_external_url 'https://registry.example.com'
> 
> ### Settings used by GitLab application
> gitlab_rails['registry_enabled'] = true
> gitlab_rails['registry_host'] = "registry.example.com"
> gitlab_rails['registry_port'] = "443"
> gitlab_rails['registry_path'] = "/var/opt/gitlab/gitlab-rails/shared/registry"
> 
> ###! Notification secret, it's used to authenticate notification requests to GitLab application
> ###! You only need to change this when you use external Registry service, otherwise
> ###! it will be taken directly from notification settings of your Registry
> # gitlab_rails['registry_notification_secret'] = nil
> 
> ###! **Do not change the following 3 settings unless you know what you are
> ###!   doing**
> gitlab_rails['registry_api_url'] = "http://127.0.0.1:5000"
> gitlab_rails['registry_key_path'] = "/var/opt/gitlab/gitlab-rails/certificate.key"
> gitlab_rails['registry_issuer'] = "omnibus-gitlab-issuer"
> 
> ### Settings used by Registry application
> registry['enable'] = true
> # registry['username'] = "registry"
> # registry['username'] = "registry"
> # registry['group'] = "registry"
> # registry['uid'] = nil
> # registry['gid'] = nil
> # registry['dir'] = "/var/opt/gitlab/registry"
> # registry['shell'] = "/usr/sbin/nologin"
> registry['registry_http_addr'] = "127.0.0.1:5000"
> # registry['debug_addr'] = "localhost:5001"
> # registry['log_directory'] = "/var/log/gitlab/registry"
> # registry['env_directory'] = "/opt/gitlab/etc/registry/env"
> # registry['env'] = {
> #   'SSL_CERT_DIR' => "/opt/gitlab/embedded/ssl/certs/",
> #   'GODEBUG' => "tlsmlkem=0",
> # }
> registry['log_level'] = "info"
> # registry['log_formatter'] = "text"
> # registry['rootcertbundle'] = "/var/opt/gitlab/registry/certificate.crt"
> registry['health_storagedriver_enabled'] = true
> # registry['middleware'] = nil
> registry['storage_delete_enabled'] = true
> # registry['validation_enabled'] = false
> # registry['autoredirect'] = false
> # registry['compatibility_schema1_enabled'] = false
> 
> .....
> 
> registry_nginx['enable'] = false
> ```

#### Gitlab Workhorse 설정
> `1210 line` 근처 `gitlab_workhorse`
> ``` txt
> gitlab_workhorse['listen_network'] = "tcp"
> gitlab_workhorse['listen_addr'] = "127.0.0.1:8080"
> gitlab_workhorse['auth_backend'] = "http://localhost:8181"
> ```

#### puma 설정
> `1349 line` 근처 `puma`
> ```
> puma['listen'] = '127.0.0.1'
> puma['port'] = 8181
> puma['socket'] = ""
> ```

#### Gitlab 자체 Nginx 설정
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
#### gitlab.example.com
``` bash
vi /etc/nginx/conf.d/gitlab.example.com.conf
```
::: code-group
``` txt [gitlab.example.com.conf]
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
:::

#### registry.example.com
``` bash
vi /etc/nginx/conf.d/registry.example.com.conf
```
::: code-group
``` txt [registry.example.com.conf]
# /etc/nginx/conf.d/registry.example.com.conf
server {
    listen 443 ssl http2;
    server_name registry.example.com;

    ssl_certificate     /etc/nginx/ssl/registry.example.com/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/registry.example.com/key.pem;

    client_max_body_size 0;

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
:::

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

## Gitlab Runner 설치
### 공식 저장소 등록
``` bash
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh" | sudo bash
```

### 패키지 설치
``` bash
sudo dnf install -y gitlab-runner
```

### Runner 등록 및 서비스 설정
``` bash
sudo gitlab-runner register
```

Docker 환경 준비
``` bash
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable --now docker
sudo usermod -aG docker gitlab-runner
```

등록 명령 실행
``` bash
sudo gitlab-runner register
```

등록 예시
``` txt
Enter the GitLab instance URL: https://gitlab.example.com
Enter the registration token: [Runner 토큰 입력]
Enter a description: docker-runner
Enter tags for the runner: docker,build
Enter an executor: docker
Enter the default Docker image: docker:latest
```

config.toml 설정 수정
``` bash
sudo vi /etc/gitlab-runner/config.toml
```
> ::: code-group
> ``` txt{25,29} [config.toml]
> concurrent = 1
> check_interval = 0
> connection_max_age = "15m0s"
> shutdown_timeout = 0
>
> [session_server]
>   session_timeout = 1800
> 
> [[runners]]
>   name = "docker-runner"
>   url = "https://gitlab.example.com/"
>   id = 1
>   token = "XXXXXXXXXX"
>   token_obtained_at = 2025-10-23T06:01:54Z
>   token_expires_at = 0001-01-01T00:00:00Z
>   executor = "docker"
>   [runners.cache]
>     MaxUploadedArchiveSize = 0
>     [runners.cache.s3]
>     [runners.cache.gcs]
>     [runners.cache.azure]
>   [runners.docker]
>     tls_verify = false
>     image = "docker:latest"
>     privileged = true
>     disable_entrypoint_overwrite = false
>     oom_kill_disable = false
>     disable_cache = false
>     volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
>     shm_size = 0
>     network_mtu = 0
> ```

설정 적용
``` bash
sudo systemctl restart gitlab-runner
```

### .gitlab-ci.yml 예시
::: code-group
``` yml [.gitlab-ci.yml]
image: docker:24.0.6

variables:
  REGISTRY: registry.example.com
  IMAGE_NAME: sample/sample

stages:
  - push

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $REGISTRY
  - apk update
  - apk add --no-cache docker-cli jq curl

push:
  stage: push
  tags: 
    - dind
  script:
    - export VERSION=$(jq -r .version package.json)
    - docker build -t $REGISTRY/$IMAGE_NAME:$VERSION -t $REGISTRY/$IMAGE_NAME:latest .
    - docker push $REGISTRY/$IMAGE_NAME:$VERSION
    - docker push $REGISTRY/$IMAGE_NAME:latest
```
:::