# GitLab

## Namespace
``` bash
kubectl create ns gitlab
```
> gitlab 을 설치할 `gitlab` 를 정의 합니다.

## 저장소 추가
``` bash
helm repo add gitlab https://charts.gitlab.io
```

``` bash
helm repo update
```

## values.yaml 수정
``` bash
helm fetch --untar gitlab/gitlab
```

### global.edition
::: code-group
``` yaml [values.yaml]

## ---

  pod:
    labels: {}

  ## https://docs.gitlab.com/charts/installation/deployment#deploy-the-community-edition
  edition: ce // [!code focus]

  ## https://docs.gitlab.com/charts/charts/globals#gitlab-version
  gitlabVersion: "17.5.1"

## ---

```
:::
> * `51 line` ee > ce 수정
> * enterprise edition > community edition

### global.hosts
::: code-group
``` yaml [values.yaml]

## ---

  hosts:
    domain: example.com // [!code focus]
    hostSuffix:
    https: true
    externalIP:
    ssh:
    gitlab: // [!code focus]
        name: gitalb.example.com // [!code focus]
        https: true // [!code focus]
    minio: 
        name: minio.example.com // [!code focus]
        https: true // [!code focus]
    registry: // [!code focus]
        name: registry.example.com // [!code focus]
        https: true // [!code focus]
    tls: {}
    smartcard: {}
    kas: {}
    pages: {}

## ---

```
:::
> * `63-74 line` domain 변경
> * `gitlab` `minio` `registry` 변경하지 않을시 domain 앞에 각자 이름 (`gitlab`, `minio`, `registry`) 으로 서브 도메인으로 생성됨

### global.ingress
::: code-group
``` yaml [values.yaml]

## ---

  ## https://docs.gitlab.com/charts/charts/globals#configure-ingress-settings
  ingress:
    apiVersion: ""
    configureCertmanager: true
    useNewIngressForCerts: false
    provider: nginx
    class: nginx // [!code focus]
    annotations: {}
    enabled: true
    tls: {}
    #   enabled: true
    #   secretName:
    path: /
    pathType: Prefix

## ---

```
:::
> * `82 line` class `nginx` 로 수정

### certmanager-issuer.email
::: code-group
``` yaml [values.yaml]

## ---

## Settings to for the Let's Encrypt ACME Issuer
certmanager-issuer: // [!code focus]
#   # The email address to register certificates requested from Let's Encrypt.
#   # Required if using Let's Encrypt.
  email: email@example.com // [!code focus]

## ---

```
:::
> * `928 line` Let's Encrypt ACME Issuer 설정
> * `931 line` email 입력

### certmanager
::: code-group
``` yaml [values.yaml]

## ---

## Installation & configuration of jetstack/cert-manager
## See requirements.yaml for current version
certmanager:
  installCRDs: true
  nameOverride: certmanager
  # Install cert-manager chart. Set to false if you already have cert-manager
  # installed or if you are not using cert-manager.
  install: false // [!code focus]
  # Other cert-manager configurations from upstream
  # See https://github.com/jetstack/cert-manager/blob/master/deploy/charts/cert-manager/README#configuration
  rbac:
    create: true

## ---
```
:::
> * `940 line` true > false 변경 
> * `cert-manager` 설치 필요시 true

### gitlab-runner
::: code-group
``` yaml [values.yaml]

## ---

## Installation & configuration of gitlab/gitlab-runner
## See requirements.yaml for current version
gitlab-runner:
  install: false // [!code focus]
  rbac:
    create: true
  runners:
    locked: false
    # Set secret to an arbitrary value because the runner chart renders the gitlab-runner.secret template only if it is not empty.
    # The parent/GitLab chart overrides the template to render the actual secret name.
    secret: "nonempty"
    config: |
      [[runners]]
        [runners.kubernetes]
        image = "ubuntu:22.04"
        {{- if .Values.global.minio.enabled }}
        [runners.cache]
          Type = "s3"
          Path = "gitlab-runner"
          Shared = true
          [runners.cache.s3]
            ServerAddress = {{ include "gitlab-runner.cache-tpl.s3ServerAddress" . }}
            BucketName = "runner-cache"
            BucketLocation = "us-east-1"
            Insecure = false
        {{ end }}
  podAnnotations:
    gitlab.com/prometheus_scrape: "true"
    gitlab.com/prometheus_port: 9252
  podSecurityContext:
    seccompProfile:
      type: "RuntimeDefault"

## ---

```
:::
> * `1313 line` true > false 변경

### gitlab, postgresql, minio, redis

::: details `StorageClass` 및 `PV` 생성
#### StorageClass
``` yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: gitlab-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```
> `local-storage.yaml` `StorageClass` 파일 작성
``` bash
kubectl apply -f gitlab-storage.yaml
```
> local-storage StorageClass 생성
#### PV
``` yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: PV_NAME // [!code warning]
spec:
  capacity:
    storage: 256Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: gitlab-storage
  local:
    path: LOCAL_PATH // [!code warning]
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - NODE_NAME // [!code warning]
```
> `pv-master1.yaml` `PV` 생성

> * `PV_NAME` 예시 local-pv-master1 과 같은 PV 의 이름
> * `LOCAL_PATH` 예시 /mnt/path 와 같은 path 경로
> * `NODE_NAME` 예시 master1 과 같은 NODE 이름 입력

``` bash
kubectl apply -f pv-master1.yaml
kubectl apply -f pv-master2.yaml
...
```
> 노드 별로 PV 를 생성하여 각각 배포
:::

::: code-group
``` yaml [helm_options.yaml]
gitlab:
  gitaly:
    persistence:
      storageClass: CUSTOM_STORAGE_CLASS_NAME
      size: 50Gi
postgresql:
  persistence:
    storageClass: CUSTOM_STORAGE_CLASS_NAME
    size: 8Gi
minio:
  persistence:
    storageClass: CUSTOM_STORAGE_CLASS_NAME
    size: 10Gi
redis:
  master:
    persistence:
      storageClass: CUSTOM_STORAGE_CLASS_NAME
      size: 5Gi
```
:::

``` bash
helm install gitlab -f helm_options.yaml --namespace gitlab ./gitlab
```