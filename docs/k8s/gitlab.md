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

## values.yaml 작성
::: code-group
``` yaml:line-numbers [values.yaml] {2,4,6,9,12,15,18,26,124,132,135,140,159}
global:
  edition: ce
  hosts:
    domain: example.com
    gitlab: 
      name: gitlab.example.com
      https: true
    minio: 
      name: minio.example.com
      https: true
    registry:
      name: registry.example.com
      https: true
  ingress:
    class: rke2-ingress-nginx

certmanager:
  install: false

certmanager-issuer: 
  email: example@email.com

gitlab:
  gitaly:
    persistence:
      storageClass: CUSTOM_STORAGE_CLASS_NAME
      size: 50Gi
    resources:
      # We usually recommend not to specify default resources and to leave this as a conscious
      # choice for the user. This also increases chances charts run on environments with little
      # resources, such as Minikube. If you do want to specify resources, uncomment the following
      # lines, adjust them as necessary, and remove the curly braces after 'resources:'.
      # limits:
      #  cpu: 100m
      #  memory: 128Mi
      requests:
        cpu: 100m
        memory: 200Mi
  gitlab-exporter:
    resources:
      # limits:
      #  cpu: 1
      #  memory: 2G
      requests:
        cpu: 75m
        memory: 100M
  gitlab-pages:
    resources:
      requests:
        cpu: 900m
        memory: 2G
  gitlab-shell:
    resources:
      # We usually recommend not to specify default resources and to leave this as a conscious
      # choice for the user. This also increases chances charts run on environments with little
      # resources, such as Minikube. If you do want to specify resources, uncomment the following
      # lines, adjust them as necessary, and remove the curly braces after 'resources:'.
      # limits:
      #  cpu: 100m
      #  memory: 128Mi
      requests:
        cpu: 0
        memory: 6M
    maxUnavailable: 1
    minReplicas: 2
    maxReplicas: 10
  kas:
    resources:
      requests:
        cpu: 100m
        memory: 100M
  mailroom:
    resources:
      # limits:
      #  cpu: 1
      #  memory: 2G
      requests:
        cpu: 50m
        memory: 150M
  migrations:
    resources:
      requests:
        cpu: 250m
        memory: 200Mi
  praefect:
    resources:
       requests:
        cpu: 100m
       memory: 200Mi
  sidekiq:
    resources:
      # limits:
      #  memory: 5G
      requests:
        cpu: 900m
        memory: 2G
  spamcheck:
    resources:
      requests:
        cpu: 100m
        memory: 100M
  toolbox:
    resources:
      # limits:
      #  cpu: 1
      #  memory: 2G
      requests:
        cpu: 50m
        memory: 350M
  webservice:
    resources:
      # limits:
      #  cpu: 1.5
      #  memory: 3G
      requests:
        cpu: 300m
        memory: 2.5G
    maxUnavailable: 1
    minReplicas: 2
    maxReplicas: 10

minio:
  persistence:
    storageClass: CUSTOM_STORAGE_CLASS_NAME
    size: 10Gi
  resources:
    requests:
      memory: 128Mi
      cpu: 100m

gitlab-runner:
  install: false

prometheus:
  install: false

postgresql:
  primary:
    persistence:
      storageClass: CUSTOM_STORAGE_CLASS_NAME
    resources:
      limits: {}
      requests:
        memory: 256Mi
        cpu: 250m
  readReplicas:
    replicaCount: 1
    persistence:
      storageClass: CUSTOM_STORAGE_CLASS_NAME
    resources:
      limits: {}
      requests:
        memory: 256Mi
        cpu: 250m

redis:
  master:
    persistence:
      storageClass: CUSTOM_STORAGE_CLASS_NAME
      size: 5Gi
    resources:
      limits: {}
      requests: {}
  replica:
    replicaCount: 3
    resources:
      # We usually recommend not to specify default resources and to leave this as a conscious
      # choice for the user. This also increases chances charts run on environments with little
      # resources, such as Minikube. If you do want to specify resources, uncomment the following
      # lines, adjust them as necessary, and remove the curly braces after 'resources:'.
      limits: {}
      #   cpu: 250m
      #   memory: 256Mi
      requests: {}
      #   cpu: 250m
      #   memory: 256Mi

registry:
  # define some sane resource requests and limitations
  resources:
    # limits:
    #   cpu: 200m
    #   memory: 1024Mi
    requests:
      cpu: 50m
      memory: 32Mi
```
:::
> * `2 line` ee > cc 변경 (enterprise edition > community edition)
> * `4, 6, 9, 12 line` 사용할 도메인 지정 (미지정시 각 서비스별 서브도메인으로 domain 설정됨)
> * `15 line` RKE2 로 k8s 환경 구성시 `rke2-ingress-nginx` 로 지정
> * `18 line` RKE2 로 k8s 설치시 `certmanager` 서비스가 이미 설치되어 있으므로 `false` 설정
> * `26 line` storageClass 지정 `gitaly`
> * `124 line` storageClass 지정 `minio`
> * `132 line` 추후 `gitlab-runner` 설치를 위해 `false` 설정
> * `135 line` 추후 별도로 `prometheus` 설치 예정이므로 `false` 설정
> * `140 line` storageClass 지정 `postgresql`
> * `159 line` storageClass 지정 `redis`

> resources 는 각 chart 에서 제공하는 기본값이며 필요시 튜닝하여 사용하면 됩니다.

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

``` bash
helm install gitlab -f helm_options.yaml --namespace gitlab ./gitlab
```
