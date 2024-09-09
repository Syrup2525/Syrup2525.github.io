# Gitlab 

::: info
해당 문서는 Docker Swarm 기반에서 Nginx Reverse Proxy 를 활용하여 Nginx 뒤에서 동작하는 Gitlab 구성 방식을 설명합니다.
:::

::: tip
[공식 문서 바로가기](https://docs.gitlab.com/ee/install/docker/installation.html#install-gitlab-using-docker-swarm-mode)
:::

::: warning
[Nginx 세팅](./nginx.md)을 완료한 것을 전재로 합니다. `사용할 도메인 ex)gitlab.mydomain.com` 의 certbot Let's Encrypt SSH 가 필요합니다.
:::

## Directory Structure

```
.
├─ config
├─ data
├─ docker-compose.yml
├─ gitlab.rb
├─ logs
└─ root_password.txt
```

## volumes 생성
[최종 Directory 구조](#directory-structure) 를 참고하여 `./` 위치에 gitlab 컨테이너에 연결될 volumes 폴더를 생성합니다
``` bash
mkdir config
mkdir data
mkdir logs
```

## docker-compose yml
### 파일 작성
::: warning
[Nginx 세팅](./nginx.md)을 완료한 것을 전재로 합니다. `nginx_network` overlay network 가 필요합니다.
:::

Nginx 가 Reverse Proxy 할수 있도록 nginx_network overlay network 추가한 아래 파일을 참고하여 yml 파일을 작성합니다. (ports 또한 서버 환경에 맞게 적절히 수정합니다.)

``` bash
vi docker-compose-yml
```

::: code-group
``` yml [docker-compose.yml]
version: "3.6"
services:
  gitlab:
    image: gitlab/gitlab-ee:17.3.1-ee.0
    container_name: gitlab
    restart: always
    hostname: 'gitlab.mydomain.com'
    ports:
      - "2424:22" // [!code warning]
      - "8929:80" // [!code warning]
      - "8444:443" // [!code warning]
    networks: // [!code ++]
      - nginx_network // [!code ++]
    volumes:
      - ./data:/var/opt/gitlab
      - ./logs:/var/log/gitlab
      - ./config:/etc/gitlab
    shm_size: '256m'
    environment:
      GITLAB_OMNIBUS_CONFIG: "from_file('/omnibus_config.rb')"
    configs:
      - source: gitlab
        target: /omnibus_config.rb
    secrets:
      - gitlab_root_password
configs:
  gitlab:
    file: ./gitlab.rb
secrets:
  gitlab_root_password:
    file: ./root_password.txt
networks: // [!code ++]
  nginx_network: // [!code ++]
    external: true // [!code ++]
```
:::

## Gitlab
### gitlab rb
gitlab 에서 제공하는 기본 Let's Encrypt SSH 를 사용하지 않고 Reverse Proxy 된 Nginx 의 SSH 를 사용할 것이므로 관련 변수를 입력합니다.
::: info
[Configure a reverse proxy or load balancer SSL termination Gitlab 공식 문서](https://docs.gitlab.com/omnibus/settings/ssl/index.html#configure-a-reverse-proxy-or-load-balancer-ssl-termination)
:::

``` bash
vi gitlab.rb
```

::: code-group
``` txt [gitlab.rb]
external_url 'https://gitlab.mydomain.com/'
gitlab_rails['initial_root_password'] = File.read('/run/secrets/gitlab_root_password').gsub("\n", "")

nginx['listen_port'] = 80 // [!code ++]
nginx['listen_https'] = false // [!code ++]
```
:::

::: tip
::: details CI/CD 를 위한 외부 `Private Container Registry` 연결
[Registry](registry.md) 서비스를 배포한것으로 가정

``` txt [gitlab.rb]
external_url 'https://gitlab.mydomain.com/'
gitlab_rails['initial_root_password'] = File.read('/run/secrets/gitlab_root_password').gsub("\n", "")

nginx['listen_port'] = 80
nginx['listen_https'] = false

registry_external_url 'http://registry:5000' // [!code ++]
```
:::

### root_password txt
root 비밀번호로 사용될 password 를 정의합니다.

``` bash
vi root_password.txt
```

::: code-group
``` txt [root_password.txt]
MySuperSecretAndSecurePassw0rd!
```
:::

## Gitlab-runner
### 초기 설정
``` bash
docker exec -it DOCKER_CONTAINER_ID /bin/bash
```

``` bash
gitlab-runner register
```

``` txt
Enter the GitLab instance URL (for example, https://gitlab.com/):
> http://gitlab

Enter the registration token:
> gitlab web root 접근 > admin > CI/CD > Runners > New instance runner > The runner authentication token 에서 확인한 값

Enter a name for the runner. This is stored only in the local config.toml file:
> 러너 이름 입력

Enter an executor: ssh, parallels, virtualbox, docker, docker-windows, docker+machine, kubernetes, shell, docker-autoscaler, instance, custom:
> docker

Enter the default Docker image (for example, ruby:2.7):
> 사용할 docker base image 입력
```

### 설정 파일 확인 및 수정
- `volumes` 수정 
- `privileged` 값이 `true` 인지 확인

vim 설치 

``` bash
apt update
```

``` bash
apt install vim
```

``` bash
vi /etc/gitlab-runner/config.toml 
```

::: code-group
``` txt [config.toml]
concurrent = 1
check_interval = 0
connection_max_age = "15m0s"
shutdown_timeout = 0

[session_server]
  session_timeout = 1800

[[runners]]
  name = 
  url = "http://gitlab"
  id = 4
  token =
  token_obtained_at = 2024-09-09T00:36:20Z
  token_expires_at = 0001-01-01T00:00:00Z
  executor = "docker"
  [runners.custom_build_dir]
  [runners.cache]
    MaxUploadedArchiveSize = 0
    [runners.cache.s3]
    [runners.cache.gcs]
    [runners.cache.azure]
  [runners.docker]
    tls_verify = false
    image = 
    privileged = true // [!code warning]
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"] // [!code warning]
    shm_size = 0
    network_mtu = 0
```
:::

runner 재시작
``` bash
gitlab-runner restart
```

## gitlab stack 배포
[docker-compose.yml](#docker-compose-yml) 단계에서 생성한 파일을 이용하여 stack 을 배포합니다.
``` bash
docker stack deploy --compose-file docker-compose.yml mystack
```

## Nginx 설정

[Nginx 설정](./nginx.md#directory-structure) 을 참고하여 `./conf/nginx/conf.d/` 위치에 `gitlab.mydomain.com.conf` 파일을 생성합니다.

``` bash
vi gitlab.mydomain.com.conf
```

::: code-group
``` txt [gitlab.mydomain.com.conf]
server {
    server_name gitlab.mydomain.com;

    charset utf-8;

    location / {
        resolver 127.0.0.11 valid=10s;
    	set $upstream gitlab;

        client_max_body_size 0;
        gzip off;

        proxy_read_timeout      300;
        proxy_connect_timeout   300;

        proxy_redirect          off;
        proxy_request_buffering off;
        proxy_buffering off;

        proxy_http_version 1.1;

        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-Ssl     on;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto   $scheme;

    	proxy_pass http://$upstream;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate     /etc/letsencrypt/live/mydomain.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mydomain.com/privkey.pem; # managed by Certbot
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
}

server {
    if ($host = gitlab.mydomain.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name gitlab.mydomain.com;
    return 404; # managed by Certbot
}
```
:::

설정 완료 후 nignx service 를 재시작 합니다.

## Web UI 확인
gitlab 이 실행되는데 시간이 소요됩니다. `docker command` 혹은 [Portainer](./portainer.md) 와 같은 도구를 이용하여 서비스가 `running` 상태인지 확인 후 웹 브라우저에서 접속하여 확인합니다.

``` txt
https://gitlab.mydomain.com
```