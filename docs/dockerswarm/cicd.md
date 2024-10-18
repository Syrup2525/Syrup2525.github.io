# CI/CD

::: info
해당 문서는 Docker Swarm 기반에서 `Nginx Reverse Proxy` `Gitlab(runner)` `Gitlab(registry)` `Portainer` 를 활용하여 CI/CD 구성 방식을 설명합니다.
:::

::: warning
[Portainer 세팅](./portainer.md)을 완료한 것을 전재로 합니다.
:::

::: warning
[Gitlab 세팅](./gitlab.md)을 완료한 것을 전재로 합니다.
:::

::: warning
[Nginx 세팅](./nginx.md)을 완료한 것을 전재로 합니다.
:::

## docker-compose.yml 수정
[Gitlab](./gitlab.md) 배포시 사용된 [docker-compose.yml](./gitlab.md#docker-compose-yml) 파일을 수정합니다.

`Gitlab Runner` 및 `Registry` 사용을 위해 아래를 참고하여 yml 파일을 수정합니다.

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
      - "2424:22"
      - "8929:80"
      - "8444:443"
      - "5050:5050" # docker image private registry port // [!code ++]
    networks:
      - nginx_network
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
  gitlab-runner: // [!code ++]
    image: gitlab/gitlab-runner:latest // [!code ++]
    restart: always // [!code ++]
    networks: // [!code ++]
      - network // [!code ++]
    privileged: true // [!code ++]
    volumes: // [!code ++]
      - gitlab_runner_volume:/etc/gitlab-runner // [!code ++]
      - /var/run/docker.sock:/var/run/docker.sock // [!code ++]
configs:
  gitlab:
    file: ./gitlab.rb
secrets:
  gitlab_root_password:
    file: ./root_password.txt
networks:
  nginx_network:
    external: true
volumes:
  gitlab_runner_volume: // [!code ++]
```
:::

변경사항 적용을 위해 스택을 재배포 합니다. 
``` bash
docker stack rm gitlab
```

``` bash
docker stack deploy -c docker-compose.yml gitlab
```

## Gitlab Runner

### Runner 생성
Gitlab Web 에서 root 계정으로 로그인 후 `admin > CI/CD > Runners > New instance runner` 를 선택하여 새 Runner 를 생성하고 `The runner authentication token` 을 확인합니다.

### 초기 설정
runner 컨테이너 접속
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
> Runner 생성 단계에서 확인한 Token 정보

Enter a name for the runner. This is stored only in the local config.toml file:
> 러너 이름 입력

Enter an executor: ssh, parallels, virtualbox, docker, docker-windows, docker+machine, kubernetes, shell, docker-autoscaler, instance, custom:
> docker

Enter the default Docker image (for example, ruby:2.7):
> 사용할 docker base image 입력
```

### config.toml 파일 확인 및 수정
vim 설치 

``` bash
apt update
```

``` bash
apt install vim -y
```

- `volumes` 수정 
- `privileged` 값이 `true` 인지 확인

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

## Registry
### gitlab.rb 수정

``` bash
vi gitlab.rb
```

::: code-group
``` txt [gitlab.rb]
external_url 'https://gitlab.mydomain.com/'
gitlab_rails['initial_root_password'] = File.read('/run/secrets/gitlab_root_password').gsub("\n", "")

nginx['listen_port'] = 80 
nginx['listen_https'] = false 

registry_external_url 'http://registry.mydomain.com' // [!code ++]

# Registry Nginx Config  // [!code ++]
registry_nginx['enable'] = true  // [!code ++]
registry_nginx['listen_port'] = 5050  // [!code ++]
registry_nginx['listen_https'] = false  // [!code ++]
registry_nginx['proxy_set_headers'] = {  // [!code ++]
  "X-Forwarded-Proto" => "https",  // [!code ++]
  "X-Forwarded-Ssl" => "on"  // [!code ++]
} // [!code ++]

```
:::

### Nginx 설정
[Nginx 설정](./nginx.md#directory-structure) 을 참고하여 `./conf/nginx/conf.d/` 위치에 `registry.mydomain.com.conf` 파일을 생성합니다.

``` bash
vi registry.mydomain.com.conf
```

::: code-group
``` txt [registry.mydomain.com.conf]
server {
    server_name registry.mydomain.com;

    charset utf-8;

    client_max_body_size 10240m;

    location /v2/ {
        resolver 127.0.0.11 valid=10s;
    	set $upstream gitlab:5050;

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

### Stack 재배포
변경사항 적용을 위해 스택을 재배포 합니다. 
``` bash
docker stack rm gitlab
```

``` bash
docker stack deploy -c docker-compose.yml gitlab
```

## Proejct 설정
### .gitlab-cl.yml 파일 작성
프로젝트 폴더 최상단에 `.gitlab-ci.yml` 파일을 생성하고 아래 예제를 참고하여 yml 파일을 작성합니다.

::: tip
아래 예시에서 `warning` 처리된 부분은 자신의 세팅에 맞도록 수정해야하며 `highlight` 부분은 선택사항 입니다.
:::

::: code-group
``` yml [.gitlab-ci.yml]
image: docker:latest

services:
  - name: docker:dind

variables:
  # Private Container Registry URL
  REGISTRY: registry.mydomain.com // [!code warning]
  # 사용할 이미지 이름 (프로젝트 명)
  IMAGE_NAME: myprocjet/myservice // [!code warning]

stages:
  - build
  - push
  - deploy

before_script:
  # Docker login을 위한 로그인 정보 설정
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $REGISTRY
  - apk update
  - apk add jq

build:
  stage: build
  tags:
    - nodejs
    - 22.5.1
  script:
    # Extract version from package.json
    - export VERSION=$(jq -r .version package.json)
    # Docker 이미지 빌드 (버전 및 latest 태그)
    - docker build -t $REGISTRY/$IMAGE_NAME:$VERSION -t $REGISTRY/$IMAGE_NAME:latest .
    # 로컬 테스트를 위해 실행하고, 컨테이너 ID 저장
    - export CONTAINER_ID=$(docker run -d $REGISTRY/$IMAGE_NAME:$VERSION)
    # 테스트 후 컨테이너를 종료하고 삭제
    - docker rm -f $CONTAINER_ID

push:
  stage: push
  tags:
    - nodejs
    - 22.5.1
  script:
    # Extract version from package.json
    - export VERSION=$(jq -r .version package.json)
    # Docker 이미지 Push (버전 및 latest 태그)
    - docker push $REGISTRY/$IMAGE_NAME:$VERSION
    - docker push $REGISTRY/$IMAGE_NAME:latest
  only: // [!code highlight]
    - main // [!code highlight]

deploy:
  stage: deploy
  tags:
    - nodejs
    - 22.5.1
  script:
    - curl -v -k -XPOST $WWW_WEBHOOK
  only: // [!code highlight]
    - main // [!code highlight]
```
:::

### Portainer Service webhook
portainer 에 접속하여 `Services > CD 를 적용할 Service Name 선택 > Service webhook` 항목을 enable 하고, Webhook 주소를 복사합니다.

### Variables 등록
Gitlab Web 에서 Proejct > Settings > CI/CD > Variables 로 이동 후 CI/CD Variables 섹션에서 Add variable 을 선택하고 아래를 참고하여 key, value 를 추가합니다.
* `CI_REGISTRY_USER` Gitlab 로그인시 사용되는 user name
* `CI_REGISTRY_PASSWORD` Gitlab 로그인시 사용되는 user password
* `WWW_WEBHOOK` [Portainer Service webhook](#portainer-service-webhook) 에서 복사한 Webhook 주소
