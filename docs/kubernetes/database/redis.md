# Redis 설치

## Namespace
``` bash
kubectl create ns redis
```

## 저장소 추가
``` bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

``` bash
helm repo update
```

## StorageClass 및 PV 생성
### StorageClass
::: code-group
``` yaml [storageClass.yaml]
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: STORAGE_CLASS_NAME // [!code warning]
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```
:::
> * `STORAGE_CLASS_NAME` storage class 이름 `ex) redis-storage`
``` bash
kubectl apply -f storageClass.yaml
```

### PV
::: code-group
``` yaml [pv.yaml]
apiVersion: v1
kind: PersistentVolume
metadata:
  name: PV_NAME // [!code warning]
spec:
  capacity:
    storage: 256Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: STORAGE_CLASS_NAME // [!code warning]
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
::: 
> * `PV_NAME` PV 의 이름
> * `STORAGE_CLASS_NAME` storage class 이름 `ex) redis-storage`
> * `LOCAL_PATH` path 경로 `ex) /mnt/path`
> * `NODE_NAME` NODE 이름 `ex) master1`

``` bash
kubectl apply -f pv.yaml
```

::: code-group
``` yaml:line-numbers [values.yaml] {2,4,7,11,14-15,17,20}
global:
  defaultStorageClass: "STORAGE_CLASS_NAME"

architecture: standalone

auth:
  enabled: false

master:
  persistence:
    enabled: true
  resources:
    requests:
      cpu: "10m"
      memory: "10Mi"
  nodeSelector:
    kubernetes.io/hostname: "master1"

replica:
  replicaCount: 0
```
:::
> * `2 line` 이전 단계에서 생성한 storage class 이름 `ex) redis-storage`
> * `4 line` 단일 노드로 실행을 위해 `standalone` 지정 (기본값 `replication`)
> * `7 line` 클러스터 내에서만 사용할 것이기 때문에 보안 `false` 설정 (기본값 `true`)
> * `11 line` 데이터 지속 여부 (기본값 `true`)
> * `14-15 line` 현재 시스템 상황에 맞게 적절히 수정
> * `17 line` Node 지정 (지정 필요없는 경우 해당 라인 삭제)
> * `20 line` replica 개수 지정 (기본값 `3`)

## 설치
``` bash
helm install redis bitnami/redis -n redis -f values.yaml
```

::: tip
클러스터 내부에서 접근시
``` txt
redis-master.redis.svc.cluster.local:6379
```
:::