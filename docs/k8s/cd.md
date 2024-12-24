# CD (ArgoCD)

[[toc]]

## Namespace
``` bash
kubectl create ns argocd
```
> ArgoCD 을 설치할 `namespace` 를 정의 합니다.

## 저장소 추가
``` bash
helm repo add argo https://argoproj.github.io/argo-helm
```

``` bash
helm repo update
```

## ArgoCD 설치
### values.yaml 작성
::: code-group
``` yaml [values.yaml]
global:
  domain: argocd.example.com

configs:
  params:
    server.insecure: true

server:
  ingress:
    enabled: false
```
:::
> ::: tip
> * `global.domain` localhost 가 아닌 domain 접근을 위해 설정합니다.
> * `configs.params.server.insecure` Ingress TLS 적용 후 무한 리다이렉션 방지를 위해 `true` 로 설정합니다.
> * `server.ingress.enabled` ingress 를 직접 설정하기 위해 `false` 로 지정합니다. `Argo` 에서 제공하는 `Argo CD` `helm chart` 기본값 또한 `false` 지만, 명시적으로 지정했습니다.
> :::

### ArgoCD 설치
``` bash
helm install argocd argo/argo-cd -n argocd -f values.yaml
```

## Ingress 생성
### Issuer 생성
::: code-group
``` yaml [issuer.yaml]
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: argocd
  namespace: argocd
spec:
  acme:
    email: example@email.com
    privateKeySecretRef:
      name: letsencrypt-production
    server: https://acme-v02.api.letsencrypt.org/directory
    solvers:
      - http01:
          ingress:
            class: nginx
```
:::
``` bash
kubectl apply -f issuer.yaml
```

### Ingress 생성
::: code-group
``` yaml [ingress.yaml]
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/issuer: argocd
    cert-manager.io/issuer-kind: Issuer
  name: argocd-server
  namespace: argocd
spec:
  ingressClassName: nginx
  rules:
    - host: argocd.example.com
      http:
        paths:
          - backend:
              service:
                name: argocd-server
                port:
                  number: 8080
            path: /
            pathType: Prefix
  tls:
    - hosts:
        - argocd.example.com
      secretName: tls-argocd-ingress
```
:::
``` bash
kubectl apply -f ingress.yaml
```

## GitLab Repository 설정
### deployment.yaml 설정
`deployment.yaml` 파일의 위치는 다음 예시와 같습니다.

``` txt
sample/
├── README.md
├── manifests/          // [!code ++]
│   └── deployment.yaml // [!code ++]
├── scripts/
│   ├── build.sh
│   └── deploy.sh
└── docs/
    └── architecture.md
```

아래는 `deployment.yaml` 파일 내용의 예시입니다.

::: code-group
``` yaml [deployment.yaml]
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: example-app
  template:
    metadata:
      labels:
        app: example-app
    spec:
      containers:
      - name: example-container
        image: registry.example.com/project/sample:latest 
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
      imagePullSecrets:
      - name: gitlab-registry
```
:::

### kustomization.yaml
`kustomization.yaml` 파일의 위치는 다음 예시와 같습니다.

``` txt
sample/
├── README.md
├── manifests/          
│   ├── deployment.yaml 
│   └── kustomization.yaml  // [!code ++]
├── scripts/
│   ├── build.sh
│   └── deploy.sh
└── docs/
    └── architecture.md
```

아래는 `kustomization.yaml` 파일 내용의 예시입니다.

::: code-group
``` yaml [kustomization.yaml]
resources:
  - deployment.yaml
```
:::

## ArgoCD Image Updater
### Image Updater 설치 
``` bash
helm install argocd-image-updater argo/argocd-image-updater -n argocd
```

### GitLab Container Registry 액세스 설정
#### Secret 생성
``` bash
kubectl create secret docker-registry gitlab-registry-secret \
    --docker-server=registry.example.com \
    --docker-username=GITLAB_USER_NAME \
    --docker-password=GITLAB_USER_PASSWORD \
    --namespace argocd
```

#### ConfigMap 에 Secret 추가
``` bash
kubectl edit configmap argocd-image-updater-config -n argocd
```

``` yaml
# Please edit the object below. Lines beginning with a '#' will be ignored,
# and an empty file will abort the edit. If an error occurs while saving this file will be
# reopened with the relevant failures.
#
apiVersion: v1
data:
  kube.events: "false"
  log.level: info
  registries.conf: |                            // [!code ++]
    registries:                                 // [!code ++]
      - name: gitlab                            // [!code ++]
        api_url: https://registry.gitlab.com    // [!code ++]
        prefix: registry.gitlab.com             // [!code ++]
        credentials: |                          // [!code ++]
          secret: gitlab-registry-secret         // [!code ++]
kind: ConfigMap
metadata:
  annotations:
    meta.helm.sh/release-name: image-updater
    meta.helm.sh/release-namespace: argocd
  creationTimestamp: 
  labels:
    app.kubernetes.io/instance: image-updater
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: argocd-image-updater
    app.kubernetes.io/version: v0.15.1
    helm.sh/chart: argocd-image-updater-0.11.2
  name: argocd-image-updater-config
  namespace: argocd
  resourceVersion: 
  uid: 
```

Secret 적용
``` bash
kubectl rollout restart deployment argocd-image-updater -n argocd
```

### Argo CD 애플리케이션 생성
#### Argo CD 접속
``` txt
https://argocd.example.com
```

> * ID : `admin`
> * PW :
> ``` bash
> kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
> ```

#### Repositories 추가
* `Settings` > `Repositories` > `Connect Repo`

* 값 입력
> | Key                           | Value |
> | ----------------------------- | --- |
> | Choose your connection method | `VIA HTTPS` |
> | Type                          | `git` |
> | Project                       | `default` |
> | Repository URL                | `https://gitlab.example.com/project/sample.git` |
> | Username                      | GITLAB_USER_NAME |
> | Password                      | GITLAB_USER_PASSOWRD |

* 상단 `CONNET` 선택

#### Application 생성
* `Applications` > `NEW APP`

* 값 입력
> GENERAL
> | Key | Value |
> | --- | ----- |
> | Application Name | `example` |
> | Project Name | `default` |
>
> SOURCE
> | Key | Value |
> | --- | ----- |
> | Repository URL | https://gitlab.example.com/project/sample.git |
> | Path | manifests |
> 
> DESTINATION
> | Key | Value |
> | --- | ----- |
> | Cluster URL | https://kubernetes.default.svc |
> | Namespace | default |
>

* Directory 를 Kustomization 로 변경 후 값 입력
> | Key | Value | 설명 |
> | --- | ----- | --- |
> | VERSION     | default | Kustomize의 버전 (대부분 default로 유지) |
> | NAME PREFIX |         | 모든 리소스 이름 앞에 붙일 접두사 (선택 사항) |
> | NAME SUFFIX |         | 모든 리소스 이름 뒤에 붙일 접미사 (선택 사항) |
> | NAMESPACE   | default | 리소스를 배포할 네임스페이스 (필수) |

* 상단 CREATE 선택

### Application 배포
* 상단 `Sync` > `SYNCHRONIZE` 로 배포합니다.

### Image Updater 연동
* 상단 `DETAILS` > `SUMMARY` > `EDIT` 으로 진행합니다.
* `ANNOTATIONS` 필드의 No itmes 하단의 `+` 를 선택합니다.
* 다음을 차례로 입력합니다
> | Name | Value (예시) |
> | ---- | ----- | 
> | argocd-image-updater.argoproj.io/image-list | registry.example.com/project/sample |
> | argocd-image-updater.argoproj.io/write-back-method | git |
* 우측 상단 `SAVE` 를 선택하고 저장합니다.