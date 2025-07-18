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
::: tip 
argocd-server PORT 확인
``` bash
kubectl get svc -n argocd
```
:::

::: details Let's Encrypt 사용시

#### Issuer 생성
> ::: code-group
> ``` yaml [issuer.yaml]
> apiVersion: cert-manager.io/v1
> kind: Issuer
> metadata:
>  name: argocd
>  namespace: argocd
> spec:
>  acme:
>    email: example@email.com
>    privateKeySecretRef:
>      name: letsencrypt-production
>    server: https://acme-v02.api.letsencrypt.org/directory
>    solvers:
>      - http01:
>          ingress:
>            class: nginx
> ```
> :::
> ``` bash
> kubectl apply -f issuer.yaml
> ```

#### Ingress 생성
> ::: code-group
> ``` yaml [ingress.yaml]
> apiVersion: networking.k8s.io/v1
> kind: Ingress
> metadata:
>    annotations:
>      cert-manager.io/issuer: argocd
>      cert-manager.io/issuer-kind: Issuer
>    name: argocd-server
>    namespace: argocd
> spec:
>   ingressClassName: nginx
>   rules:
>     - host: argocd.example.com
>       http:
>         paths:
>           - backend:
>               service:
>                 name: argocd-server
>                 port:
>                   number: 80 # tip 에서 확인된 argocd-server PORT
>             path: /
>             pathType: Prefix
>   tls:
>     - hosts:
>         - argocd.example.com
>       secretName: tls-argocd-ingress
> ```
> :::
> ``` bash
> kubectl apply -f ingress.yaml
> ```
:::

::: details 공용 CA 인증서 사용시
> ::: code-group
> ``` yaml [ingress.yaml]
> apiVersion: networking.k8s.io/v1
> kind: Ingress
> metadata:
>   name: argocd
>   namespace: argocd
> spec:
>   ingressClassName: nginx
>   rules:
>     - host: argocd.example.com
>       http:
>         paths:
>           - backend:
>               service:
>                 name: argocd-server
>                 port:
>                   number: 80 # tip 에서 확인된 argocd-server PORT
>             path: /
>             pathType: Prefix
>   tls:
>     - hosts:
>         - argocd.example.com
>       secretName: example-com-tls
> ```
> :::
> ``` bash
> kubectl apply -f ingress.yaml
> ```
:::

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

::: tip
::: details 개발, 운영 별로 다른 Kustomize 적용하기
path 의 에시입니다.

``` txt {3-14}
sample/
├── README.md
├── manifests/
│   ├── base/                       # 공통으로 적용될 파일
│   │   ├── deployment.yaml
│   │   ├── kustomization.yaml
│   │   └── service.yaml
│   └── overlays/                   # 환경에 따른 각 설정 파일
│       ├── development/            # 개발 환경
│       │   ├── deployment.yaml
│       │   └── kustomization.yaml
│       └── release/                # 운영 환경
│           ├── deployment.yaml
│           └── kustomization.yaml
├── scripts/
│   ├── build.sh
│   └── deploy.sh
└── docs/
    └── architecture.md

```

#### manifests/base
`manifests/base` 는 공통으로 사용되는 yaml 설정 값을 입력합니다.

* `manifests/base/deployment.yaml` 예시
> ::: code-group 
> ``` yaml [deployment.yaml]
> apiVersion: apps/v1
> kind: Deployment
> metadata:
>   name: api-server
>   namespace: example-namespace
> spec:
>   replicas: 2
>   selector:
>     matchLabels:
>       app: api-server
>   template:
>     metadata:
>       labels:
>         app: api-server
>     spec:
>       imagePullSecrets:
>         - name: gitlab-registry
>       containers:
>         - name: api-server
>           image: registry.example.com/project/api-server:latest
>           imagePullPolicy: Always
>           env:
>             - name: MODE
>               valueFrom:
>                 configMapKeyRef:
>                   name: deployment
>                   key: MODE
> ```
> :::

* `manifests/base/service.yaml` 예시
> ::: code-group
> ``` yaml [kustomization.yaml]
> apiVersion: v1
> kind: Service
> metadata:
>   name: api-server
>   namespace: example-namespace
> spec:
>   ports:
>     - port: 80
>       protocol: TCP
>       targetPort: 3000
>   selector:
>     app: api-server
>   type: ClusterIP
> :::

* `manifests/base/kustomization.yaml` 예시
> ::: code-group
> ``` yaml [kustomization.yaml]
> resources:
>  - deployment.yaml
>  - service.yaml
> ```
> :::


#### manifests/overlays
`manifests/overlays` 는 `manifests/base` 를 상속받은 이후 덮어쓸 설정을 입력합니다.

* `manifests/overlays/development/deployment.yaml` 예시
> ::: code-group
> ``` yaml [deployment.yaml] {7,18-21}
> apiVersion: apps/v1
> kind: Deployment
> metadata:
>   name: api-server
> spec:
>   replicas: 2
>   template:
>     spec:
>       affinity:
>         nodeAffinity:
>           requiredDuringSchedulingIgnoredDuringExecution:
>             nodeSelectorTerms:
>               - matchExpressions:
>                 - key: kubernetes.io/hostname
>                   operator: In
>                   values:
>                     - worker1
>                     - worker2
>       containers:
>         - name: api-server
>           image: registry.example.com/project/api-server:1.7.2-dev
>           resources:
>             limits:
>               memory: "300Mi"
> :::

* `manifests/overlays/development/kustomization.yaml` 예시
> ::: code-group
> ``` yaml [kustomization.yaml]
> resources:
>   - ../../base            # base path 의 모든 항목을 상속받음
> 
> patches:
>   - target:
>       kind: Deployment
>       name: api-server
>     path: deployment.yaml
> ```
> :::

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
  registries.conf: |                                          // [!code ++]
    registries:                                               // [!code ++]
      - name: gitlab                                          // [!code ++]
        api_url: https://registry.gitlab.com                  // [!code ++]
        prefix: registry.gitlab.com                           // [!code ++]
        credentials: pullsecret:argocd/gitlab-registry-secret // [!code ++]
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

::: tip
credentials 값은 pullsecret:`namesapce`/`secret` 입니다.
:::

Secret 적용
``` bash
kubectl rollout restart deployment argocd-image-updater -n argocd
```

## ArgoCD notifications (선택)
::: tip
Slack 으로 상태를 메시지로 전송하는 방법을 설명합니다.
:::

::: tip 
- [slack notification 공식문서](https://argo-cd.readthedocs.io/en/stable/operator-manual/notifications/services/slack/)
- [triggers 설정 공식문서](https://argo-cd.readthedocs.io/en/stable/operator-manual/notifications/triggers)
:::

### secret 생성
::: code-group
``` yaml [argocd-notifications-secret.yaml]
apiVersion: v1
kind: Secret
metadata:
  name: argocd-notifications-secret
  namespace: argocd
stringData:
  slack-token: <Oauth-access-token>
```
:::

::: tip
#### Oauth-access-token 확인 방법
https://api.slack.com/apps/ 접속하여 `앱 선택 (또는 생성)` > `Features` > `OAuth & Permissions` > `OAuth Tokens` > `Bot User OAuth Token`
:::
::: danger
`Scopes` > `Bot Token Scopes` 에서 `chat:write` OAuth Scope 가 반드시 필요합니다.
:::
``` bash
kubectl apply -f argocd-notifications-secret.yaml
```

### notifications-cm 설정
::: code-group
``` yaml [argocd-notifications-cm.yaml]
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  service.slack: |
    token: $slack-token

  trigger.on-sync-succeeded: |
    - when: app.status.operationState.phase in ['Succeeded'] and app.status.sync.status == 'Synced'
      send: [app-sync-succeeded]

  trigger.on-sync-failed: |
    - when: app.status.operationState.phase in ['Error', 'Failed']
      send: [app-sync-failed]

  template.app-sync-succeeded: |
    message: |
      🎉 Application {{.app.metadata.name}} 동기화 성공했어요!
    slack:
      attachments: |
        [{
          "title": "{{.app.metadata.name}}",
          "title_link": "{{.context.argocdUrl}}/applications/{{.app.metadata.name}}",
          "color": "#18be52",
          "fields": [{
            "title": "동기화 상태",
            "value": "{{.app.status.sync.status}}",
            "short": true
          }, {
            "title": "저장소",
            "value": "🔗 {{.app.spec.source.repoURL}}/{{.app.spec.source.path}}",
            "short": true
          }]
        }]

  template.app-sync-failed: |
    message: |
      ❌ Application {{.app.metadata.name}} 동기화 실패했어요...
    slack:
      attachments: |
        [{
          "title": "{{.app.metadata.name}}",
          "title_link": "{{.context.argocdUrl}}/applications/{{.app.metadata.name}}",
          "color": "#e53935",
          "fields": [{
            "title": "동기화 상태",
            "value": "{{.app.status.sync.status}}",
            "short": true
          }, {
            "title": "에러 메시지",
            "value": "{{with .app.status.operationState.message}}{{.}}{{else}}(에러 메시지 없음){{end}}",
            "short": false
          }]
        }]
```
:::
``` bash
kubectl apply -f argocd-notifications-cm.yaml
```
``` bash
kubectl rollout restart deployment argocd-notifications-controller -n argocd
```

## Argo CD 애플리케이션 생성
### Argo CD 접속
``` txt
https://argocd.example.com
```

> * ID : `admin`
> * PW :
> ``` bash
> kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
> ```

### Repositories 추가
* `Settings` > `Repositories` > `Connect Repo`

* 값 입력
> | Key                           | Value                                           |
> | ----------------------------- | ----------------------------------------------- |
> | Choose your connection method | `VIA HTTPS`                                     |
> | Type                          | `git`                                           |
> | Project                       | `default`                                       |
> | Repository URL                | `https://gitlab.example.com/project/sample.git` |
> | Username                      | GITLAB_USER_NAME                                |
> | Password                      | GITLAB_USER_PASSOWRD                            |

* 상단 `CONNET` 선택

### Application 생성
* `Applications` > `NEW APP`

* 값 입력
> GENERAL
> | Key              | Value       |
> | ---------------- | ----------- |
> | Application Name | `example`   |
> | Project Name     | `default`   |
> | SYNC POLICY      | `Automatic` |
>
> SOURCE
> | Key            | Value                                         |
> | -------------- | --------------------------------------------- |
> | Repository URL | https://gitlab.example.com/project/sample.git |
> | Path           | manifests                                     |
> ::: tip
> `개발, 운영 별로 다른 Kustomize 적용하기` 를 적용한 경우 `Path` 를 환경별로 kustomization.yaml 파일이 존재하는 적절한 (예 `manifests/overlays/development`) 경로를 입력합니다. 
> :::
> DESTINATION
> | Key         | Value                          |
> | ----------- | ------------------------------ |
> | Cluster URL | https://kubernetes.default.svc |
> | Namespace   | default                        |
>

* Directory 를 Kustomization 로 변경 후 값 입력
> | Key         | Value   | 설명                                 |
> | ----------- | ------- | ----------------------------------- |
> | VERSION     | default | Kustomize의 버전 (대부분 default로 유지) |
> | NAME PREFIX |         | 모든 리소스 이름 앞에 붙일 접두사 (선택 사항) |
> | NAME SUFFIX |         | 모든 리소스 이름 뒤에 붙일 접미사 (선택 사항) |
> | NAMESPACE   | default | 리소스를 배포할 네임스페이스 (필수)         |

* 상단 CREATE 선택

### Application 배포
* 상단 `Sync` > `SYNCHRONIZE` 로 배포합니다.

### Image Updater 연동
* 상단 `DETAILS` > `SUMMARY` > `EDIT` 으로 진행합니다.
* `ANNOTATIONS` 필드의 No itmes 하단의 `+` 를 선택합니다.
* 다음을 차례로 입력합니다
> | Name | Value (예시) |
> | ------------------------------------------------------------ | ----------------------------------------------- | 
> | argocd-image-updater.argoproj.io/image-list                  | ***alias***=registry.example.com/project/sample |
> | argocd-image-updater.argoproj.io/***alias***.update-strategy | `newest-build`                                  |
> ::: details update-strategy 전략 선택
>
> [공식문서 바로가기](https://argocd-image-updater.readthedocs.io/en/stable/basics/update-strategies/)
>
> * #### `semver` - 의미 버전으로 업데이트
>> Semver 전략을 사용하면 **시맨틱 버전 체계(Semantic Versioning)**를 따르는 태그를 가진 이미지를 추적하고 업데이트할 수 있습니다. 태그 이름은 반드시 X.Y.Z 형식의 시맨틱 버전 식별자를 포함해야 하며, 여기서 X, Y, Z는 모두 정수여야 합니다. 즉, `Major`.`Minor`.`Patch` 형태여야 합니다. vX.Y.Z와 같은 선택적 접두어(v)도 허용되며, 두 형식은 동일하게 처리됩니다(예: v1.x 제약 조건은 태그 1.0과 매칭되며, 1.x 제약 조건은 태그 v1.0과도 매칭됩니다).
>>
>> 프리릴리스 버전(예: -rc1)으로의 업데이트도 지원되지만, 이를 명시적으로 허용해야 합니다(아래 참고).
>>
>> 특정 버전을 지정하려면 `image-list` annotation 에서 시맨틱 버전 제약 조건을 설정하면 됩니다. 예를 들어, 1.2 버전의 `Minor` 브랜치 내에서만 업데이트를 허용하려면 다음과 같이 설정합니다.
>>
>> ``` txt
>> argocd-image-updater.argoproj.io/image-list: some/image:1.2.x
>> ```
>> 
>> 위의 예는 제약 조건과 일치하는 모든 태그(예 `1.2.5`, `1.2.12` 등)로는 업데이트 되지만, 새로운 `Minor` 버전(예: `1.3`)으로는 업데이트하지 않습니다.
>> 
>> ::: warning
>> `semver` 전략이 작동하려면 현재 애플리케이션 태그가 이미 `semver` 를 따라야 합니다. 그렇지 않으면 에러가 발생합니다. 
>> :::
>> 
>> 마찬가지로 `Major` 버전 `1`의 모든 하위 릴리스에 대한 업데이트를 허용하려면 다음을 사용하십시오.
>>
>> ``` txt
>> argocd-image-updater.argoproj.io/image-list: some/image:1.x
>> ```
>>
>> 위의 예는 제약 조건과 일치하는 모든 태그(예 `1.2.12`, `1.3.0`, `1.15.2` 등)로는 업데이트 되지만, 새로운 `Major` 버전(예: `2.0`)으로는 업데이트하지 않습니다.
>>
>> 사전 릴리스 버전(예: v2.0-rc1)에 대한 업데이트도 허용하려면 예를 들어, 제약 조건에 접미사 -0을 추가해야 합니다
>>
>> ``` txt
>> argocd-image-updater.argoproj.io/image-list: some/image:2.x-0
>> ```
>>
>> 허용된 이미지 목록에서 버전 제약 조건이 지정되지 않은 경우, Argo CD Image Updater는 레지스트리에서 발견된 가장 높은 버전 번호를 선택합니다.
>> 
>> `Semver` 업데이트 전략을 사용할 때, Argo CD Image Updater는 시맨틱 버전에 맞지 않는 태그를 사용시 에러가 발생합니다.
>>
> * #### `newest-build` - 최신 빌드 이미지 업데이트
>> 가장 최근에 빌드된 이미지를 업데이트할 수 있으며, 임의의 이름(예: Git 커밋 SHA 또는 랜덤 문자열)으로 태그가 지정된 이미지를 선택할 수 있습니다.
>>
>> 중요한 점은, 이 전략은 이미지가 레지스트리에 태그되거나 푸시된 날짜가 아닌 이미지의 **빌드 날짜**를 기준으로 한다는 것입니다. 동일한 이미지에 여러 태그를 지정하면 이러한 태그는 동일한 빌드 날짜를 가지게 됩니다. 이 경우 **Argo CD Image Updater**는 태그 **이름을 내림차순으로 정렬**한 후 목록의 마지막 태그 이름을 선택합니다. 예를 들어, `f33bacd`, `dev`, `latest` 태그가 지정된 이미지가 있다고 가정해 봅시다. 이 경우 `f33bacd` 태그를 애플리케이션에 설정하고 싶을 수 있지만, Image Updater는 `latest` 태그를 선택합니다. 
>>
>> 기본적으로 이 업데이트 전략은 이미지 저장소에서 찾은 모든 태그를 검사합니다. 업데이트에 고려할 특정 태그만 허용하려면 추가 설정이 필요합니다. 예를 들어,
>>
>> ``` txt
>> argocd-image-updater.argoproj.io/image-list: myimage=some/image
>> argocd-image-updater.argoproj.io/myimage.update-strategy: newest-build
>> argocd-image-updater.argoproj.io/myimage.allow-tags: regexp:^[0-9a-f]{7}$
>> ```
>>
>> 업데이트 시 특정 정규식을 만족하는 태그만 고려하도록 설정할 수 있습니다. 예를 들어, 이 경우 정규식은 7자리 16진수 문자열에 해당하는 태그를 매칭합니다. 이는 Git 커밋 SHA의 짧은 버전에 해당할 수 있으며, `a5fb3d3` 또는 `f7bb2e3`와 같은 태그는 매칭되지만, `latest`나 `master`와 같은 태그는 매칭되지 않습니다.
>>
>> 또한, 저장소에서 특정 태그 목록을 무시하도록 설정할 수도 있습니다.
>> 
>> ``` txt
>> argocd-image-updater.argoproj.io/image-list: myimage=some/image
>> argocd-image-updater.argoproj.io/myimage.update-strategy: newest-build
>> argocd-image-updater.argoproj.io/myimage.ignore-tags: latest, master
>> ```
>> 
>> 이 설정을 통해 발견된 모든 태그를 고려하되, `latest`와 `master` 태그는 제외할 수 있습니다. 태그 필터링에 대한 자세한 내용은 [여기](https://argocd-image-updater.readthedocs.io/en/stable/configuration/images/#filtering-tags)를 참고하세요.
> * #### `digest` - 특정 태그의 가장 최근에 푸시된 버전으로 업데이트
>> 단일 태그를 검사하여 변경 사항을 확인하고 이전 상태에 대한 변경 사항이 있을 경우 이미지를 업데이트합니다. 
>> 일반적으로 사용되는 태그와 같이 변경 가능한 태그를 따르려는 `latest` 경우나 CI 시스템에서 의도한 환경으로 명명된 태그를 생성하는 경우 이 업데이트 전략을 사용합니다. (예: `dev`, `stage`, `prod`).
>> 예를 들어, `latest` 태그가 있는 `some/image` 이미지를 새로 푸시할 때마다 애플리케이션의 이미지를 항상 업데이트합니다.
>> ``` txt
>> argocd-image-updater.argoproj.io/image-list: myimage=some/image:latest
>> argocd-image-updater.argoproj.io/myimage.update-strategy: digest
>> ```
> 
> * #### `alphabetical` - 사전식(어휘) 정렬에 따른 업데이트
>> 이 업데이트 전략은 레지스트리에서 반환된 태그를 사전식 정렬(내림차순) 방식으로 정렬하고, 목록에서 마지막 태그를 업데이트 대상으로 선택합니다. 이 방식은 추적하려는 이미지가 `YYYY-MM-DD` 형식이나 이와 유사한 사전식으로 정렬 가능한 문자열을 사용하는 `Calver` 버전 관리 방식일 경우 유용할 수 있습니다.
>>
>> 기본적으로 이 업데이트 전략은 이미지 저장소에서 발견된 모든 태그를 검사합니다. 특정 태그만 업데이트 대상으로 고려하고 싶다면 추가 설정이 필요합니다. 예를 들어, 
>> ``` txt
>> argocd-image-updater.argoproj.io/image-list: myimage=some/image
>> argocd-image-updater.argoproj.io/myimage.update-strategy: alphabetical
>> argocd-image-updater.argoproj.io/myimage.allow-tags: regexp:^[0-9]{4}-[0-9]{2}-[0-9]{2}$
>> ```
>> 
>> 업데이트 시 특정 정규식을 만족하는 태그만 고려하도록 설정할 수 있습니다. 이 경우 `YYYY-MM-DD` 형식의 날짜를 나타내는 태그만 업데이트 대상으로 고려됩니다.
>> 
> ::: tip
> x.y.z 형태만 배포하는 방법
> | Key | Value |
> | --- | ----- |
> | argocd-image-updater.argoproj.io/myimage.allow-tags | regexp:^([0-9]{1,3}\.){2}[0-9]{1,3}$ |
> 
> *-dev 형태만 배포하는 방법
> | Key | Value |
> | --- | ----- |
> | argocd-image-updater.argoproj.io/myimage.allow-tags | regexp:.*-dev$ |
> :::

* 우측 상단 `SAVE` 를 선택하고 저장합니다.

### Argo Notification 연동 (선택)
* 상단 `DETAILS` > `SUMMARY` > `EDIT` 으로 진행합니다.
* `ANNOTATIONS` 필드의 No itmes 하단의 `+` 를 선택합니다.
* 다음을 차례로 입력합니다
> | Name | Value (예시) |
> | ------------------------------------------------------------ | ---------- | 
> | notifications.argoproj.io/subscribe.on-sync-succeeded.slack  | my_channel |
> | notifications.argoproj.io/subscribe.on-sync-failed.slack | my_channel |
>
> [공식문서 바로가기](https://argo-cd.readthedocs.io/en/stable/operator-manual/notifications/services/slack/)
>
* 우측 상단 `SAVE` 를 선택하고 저장합니다.