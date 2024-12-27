# CI (gitlab-runner)

## Namespace
``` bash
kubectl create ns gitlab-runners
```
> gitlab-runner 을 설치할 `namespace` 를 정의 합니다.

## 저장소 추가
``` bash
helm repo add gitlab https://charts.gitlab.io
```

``` bash
helm repo update
```

## Runner 생성
::: tip
해당 문서에서는 `tag` 를 `dind` 로 지정했습니다.
:::

Gitlab Web 에서 root 계정으로 로그인 후 `admin > CI/CD > Runners > New instance runner` 를 선택하여 새 Runner 를 생성하고 `The runner authentication token` 을 확인합니다.

## values.yaml 작성
::: code-group
``` yaml [values.yaml]
replicas: 1
gitlabUrl: https://gitlab.example.com
runnerRegistrationToken: "Gitlab 에서 Runner 생성 단계에서 확인한 Token 정보"

runners:
  config: |
    [[runners]]
      name = "dind-gitlab-runner"
      url = "https://gitlab.example.com"
      token = "Gitlab 에서 Runner 생성 단계에서 확인한 Token 정보"
      executor = "kubernetes"
      tags = ["dind"]
      [runners.kubernetes]
        image = "docker:24.0.6"
        namespace = "gitlab-runner"
        privileged = true

rbac:
  create: true

serviceAccount:
  create: true
```
:::

gitlab helm chart 설치
``` bash
helm install gitlab-runner gitlab/gitlab-runner -n gitlab-runners -f values.yaml 
```

## .gitlab-ci.yaml 작성

아래 내용을 참고하여 gitlab-ci 파일을 작성 후 CI 파이프라인을 테스트 합니다.

::: code-group
``` yaml [.gitlab-ci.yaml]
image: docker:24.0.6

services:
  - name: docker:24.0.6-dind
    command: [ "--tls=false" ]
    variables:
      HEALTHCHECK_TCP_PORT: "2375"

variables:
  DOCKER_HOST: tcp://docker:2375 
  DOCKER_TLS_CERTDIR: ""
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
