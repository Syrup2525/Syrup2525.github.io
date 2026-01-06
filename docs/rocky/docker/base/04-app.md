# App 

::: tip
`Portainer` 를 기반으로, `GitHub Repository` 와 `ghcr (Github Container Repository)` 을 사용하여 컨테이너를 `docker-compose` 기반으로 배포하는 방법을 설명합니다.
:::

## ghcr (Container Image 업로드)
::: tip
현재 글을 작성하는 시점으로 `GitHub Packages` 에 업로드하는 `Container Image` 는 예외적으로 저장 공간 및 대역폭은 현재 무료여서 `ghcr` 로 선택했습니다. [공식 문서 바로가기](https://docs.github.com/en/billing/concepts/product-billing/github-packages#free-use-of-github-packages) `AWS ECR` 제품이나 자체 호스팅 서버를 운영중인경우 대체 사용해도 무관합니다.
:::

``` bash
docker build ghcr.io/NAMESPACE/IMAGE_NAME:2.5 .
```
::: details ARM 기기에서 amd64 로 빌드하기
``` bash
docker build --platform linux/amd64 ghcr.io/NAMESPACE/IMAGE_NAME:2.5 .
```
:::

``` bash
docker push ghcr.io/NAMESPACE/IMAGE_NAME:2.5
```

## GitHub (docker-compose 작성)
### docker-compose.yml 작성
아래는 디렉토리 구조 예시입니다.
``` txt {6}
.
├─ dist
├─ src
├─ .dockerignore
├─ .gitignore
├─ docker-compose.yml
├─ Dockerfile
├─ package.json
├─ tsconfig.json
└─ tsup.config.ts
```

::: code-group
``` yml [docker-compose.yml]
services:
  node-app:
    image: ghcr.io/NAMESPACE/IMAGE_NAME:2.5 # 컨테이너 이미지 주소
    container_name: example-container
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.example-container.rule=Host(`example.com`)"
      - "traefik.http.routers.example-container.entrypoints=websecure"
      - "traefik.http.routers.example-container.tls.certresolver=le"
      - "traefik.http.services.example-container.loadbalancer.server.port=3000"
    networks:
      - traefik

networks:
  traefik:
    external: true
```
:::

::: details 서브 도메인 또는 최상위 도메인이 아닌 하위 경로로 라우팅 하는 경우
::: code-group
``` yml [docker-compose.yml] {8}
services:
  node-app:
    image: ghcr.io/NAMESPACE/IMAGE_NAME:2.5 # 컨테이너 이미지 주소
    container_name: example-container
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.example-container.rule=Host(`example.com`) && (Path(`/example`) || PathPrefix(`/example/`))"
      - "traefik.http.routers.example-container.entrypoints=websecure"
      - "traefik.http.routers.example-container.tls.certresolver=le"
      - "traefik.http.services.example-container.loadbalancer.server.port=3000"
    networks:
      - traefik

networks:
  traefik:
    external: true
```
:::

### GitHub 업로드
작성한 소스코드를 GitHub 에 업로드 합니다.
``` bash
git init --initial-branch=main
git remote add origin https://github.com/NAMESPACE/example.git
git add .
git commit -m "first commit"
git push -u origin main
```

## Portainer 배포
### Registry 설정
좌측 메뉴 `registries` > `Custom Registry`
| 항목                     | 상세 항목            | 예시  |
| ----------------------- | ------------------ | --- |
| Custom registry details | Name               | ghcr.io |
|                         | Registry URL       | ghcr.io |
|                         | Authentication 토글 | On |
|                         | Username | GitHub Id (username) 입력 |
|                         | Password | GitHub token 입력 ([GitHub tokens](https://github.com/settings/tokens)) |

### Stack 배포
`Stacks` > `Add stack` > `Repository`

| 항목            | 상세 항목                   | 설명 (또는 예시) |
| -------------- | ------------------------- | ------------ |
| Git repository | Authentication 토글        | On           | 
|                | Username                  | GitHub Id (username) 입력 |
|                | Personal Access Token     | GitHub token 입력 ([GitHub tokens](https://github.com/settings/tokens)) |
|                | Repository URL            | https://github.com/NAMESPACE/example.git |
|                | Compose path              | docker-compose.yml (기본값) | 

`Deploy the stack` 선택

::: tip
컨테이너 이미지 크기와 머신 사양에 따라 배포까지 시간이 다소 소요 될 수 있습니다.
:::