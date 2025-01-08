# Kafka 설치

## Namespace
``` bash
kubectl create ns kafka
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
> * `STORAGE_CLASS_NAME` storage class 이름 `ex) kafka-storage`
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
> * `STORAGE_CLASS_NAME` storage class 이름 `ex) kafka-storage`
> * `LOCAL_PATH` path 경로 `ex) /mnt/path`
> * `NODE_NAME` NODE 이름 `ex) worker1`

``` bash
kubectl apply -f pv.yaml
```

## values.yaml 작성
::: details 단일 Pod 배치시
> ::: code-group
> ``` yaml:line-numbers [values.yaml] {2,5,8,9,12-13,22,25,26,29,32,37,43,47,52,69,70,81,84}
> global:
>   defaultStorageClass: "STORAGE_CLASS_NAME"
> 
> image:
>   tag: 3.9.0-debian-12-r4
> 
> controller:
>   replicaCount: 1
>   controllerOnly: false
>   resources:
>     requests:
>       cpu: 10m
>       memory: 10Mi
>   affinity:
>     nodeAffinity:
>       requiredDuringSchedulingIgnoredDuringExecution:
>         nodeSelectorTerms:
>           - matchExpressions:
>             - key: kubernetes.io/hostname
>               operator: In
>               values:
>                 - master1
> 
> extraConfig: |
>   offsets.topic.replication.factor=1
>   default.replication.factor=1
> 
> broker:
>   replicaCount: 0
>
> externalAccess:
>   enabled: false
> 
> listeners:
>   client:
>     containerPort: 9092
>     protocol: PLAINTEXT
>     name: CLIENT
>     sslClientAuth: ""
>   controller:
>     name: CONTROLLER
>     containerPort: 9093
>     protocol: PLAINTEXT
>     sslClientAuth: ""
>   interbroker:
>     containerPort: 9094
>     protocol: PLAINTEXT
>     name: INTERNAL
>     sslClientAuth: ""
>   external:
>     containerPort: 9095
>     protocol: SASL_PLAINTEXT
>     name: EXTERNAL
>     sslClientAuth: ""
> 
> sasl:
>   interbroker:
>     user: inter_broker_user
>     password: ""
>     clientId: inter_broker_client
>     clientSecret: ""
>   controller:
>     user: controller_user
>     password: ""
>     clientId: controller_broker_client
>     clientSecret: ""
>   client:
>     users:
>       - user1
>    passwords: "USER_PASSWORD"
> 
> service:
>   type: ClusterIP
>   ports:
>     client: 9092      # Kafka svc port for client connections
>     controller: 9093  # Kafka svc port for controller connections. It is used if "kraft.enabled: true"
>     interbroker: 9094 # Kafka svc port for inter-broker connections
>     external: 9095    # Kafka svc port for external connections
> 
> kraft:
>   enabled: true
> 
> zookeeper:
>   enabled: false
> ```
> :::
> * `2 line` 이전 단계에서 생성한 storage class 이름 `ex) redis-storage`
> * `5 line` 버전 명시 (미지정시 가장 최신 버전)
> * `8 line` 단일 pod 사용을 위해 `1` 지정 (기본값 `3`)
> * `9 line` controller+broker 모드 사용시 `false` / controller 전용 모드 사용시 `true` (기본값 `false`)
> * `12, 13 line` 현재 시스템 상황에 맞게 적절히 수정
> * `22 line` Pod 가 실행될 node 지정 (필요없는 경우 해당 라인 삭제)
> * `25 line` controller.replicaCount 값과 동일하게 설정합니다
> * `26 line` controller.replicaCount 값과 동일하게 설정합니다
> * `29 line` Kraft & contoller+broker 모드 사용으로 broker 필요 없음 (기본값 `0`)
> * `32 line` 클러스터 내부에서만 접근 허용 (기본값 `false`)
> * `37 line` client 접속 protocol 지정 [`PLAINTEXT`, `SASL_PLAINTEXT`, `SASL_SSL`, `SSL`] (기본값 `SASL_PLAINTEXT`)
> * `43 line` controller 접속 protocol 지정 [`PLAINTEXT`, `SASL_PLAINTEXT`, `SASL_SSL`, `SSL`] (기본값 `SASL_PLAINTEXT`)
> * `47 line` interbroker 접속 protocol 지정 [`PLAINTEXT`, `SASL_PLAINTEXT`, `SASL_SSL`, `SSL`] (기본값 `SASL_PLAINTEXT`)
> * `52 line` external 접속 protocol 지정 [`PLAINTEXT`, `SASL_PLAINTEXT`, `SASL_SSL`, `SSL`] (기본값 `SASL_PLAINTEXT`)
> * `69, 70 line` client.protocol `SASL_PLAINTEXT` 지정시 사용할 ID/PW
> * `81 line` kraft 활성화 (기본값 `true`)
> * `84 line` zookeeper 비활성화 (기본값 `false`)
:::

::: details replica 구성시
> ::: code-group
> ``` yaml:line-numbers [values.yaml] {2,5,8,9,12-13,22-24,27,28,31,34,39,45,49,54,71,72,83,86}
> global:
>   defaultStorageClass: "STORAGE_CLASS_NAME"
> 
> image:
>   tag: 3.9.0-debian-12-r4
> 
> controller:
>   replicaCount: 3
>   controllerOnly: false
>   resources:
>     requests:
>       cpu: 10m
>       memory: 10Mi
>   affinity:
>     nodeAffinity:
>       requiredDuringSchedulingIgnoredDuringExecution:
>         nodeSelectorTerms:
>           - matchExpressions:
>             - key: kubernetes.io/hostname
>               operator: In
>               values:
>                 - worker1
>                 - worker2
>                 - worker3
> 
> extraConfig: |
>   offsets.topic.replication.factor=1
>   default.replication.factor=1
> 
> broker:
>   replicaCount: 0
>
> externalAccess:
>   enabled: false
> 
> listeners:
>   client:
>     containerPort: 9092
>     protocol: PLAINTEXT
>     name: CLIENT
>     sslClientAuth: ""
>   controller:
>     name: CONTROLLER
>     containerPort: 9093
>     protocol: PLAINTEXT
>     sslClientAuth: ""
>   interbroker:
>     containerPort: 9094
>     protocol: PLAINTEXT
>     name: INTERNAL
>     sslClientAuth: ""
>   external:
>     containerPort: 9095
>     protocol: SASL_PLAINTEXT
>     name: EXTERNAL
>     sslClientAuth: ""
> 
> sasl:
>   interbroker:
>     user: inter_broker_user
>     password: ""
>     clientId: inter_broker_client
>     clientSecret: ""
>   controller:
>     user: controller_user
>     password: ""
>     clientId: controller_broker_client
>     clientSecret: ""
>   client:
>     users:
>       - user1
>    passwords: "USER_PASSWORD"
> 
> service:
>   type: ClusterIP
>   ports:
>     client: 9092      # Kafka svc port for client connections
>     controller: 9093  # Kafka svc port for controller connections. It is used if "kraft.enabled: true"
>     interbroker: 9094 # Kafka svc port for inter-broker connections
>     external: 9095    # Kafka svc port for external connections
> 
> kraft:
>   enabled: true
> 
> zookeeper:
>   enabled: false
> ```
> :::
> * `2 line` 이전 단계에서 생성한 storage class 이름 `ex) redis-storage`
> * `5 line` 버전 명시 (미지정시 가장 최신 버전)
> * `8 line` Replica pod 사용을 위해 `3` 지정 (기본값 `3`)
> * `9 line` controller+broker 모드 사용시 `false` / controller 전용 모드 사용시 `true` (기본값 `false`)
> * `12, 13 line` 현재 시스템 상황에 맞게 적절히 수정
> * `22, 23, 24 line` Pod 가 실행될 node 지정 (필요없는 경우 해당 라인 삭제)
> * `27 line` controller.replicaCount 값과 동일하게 설정합니다
> * `28 line` controller.replicaCount 값과 동일하게 설정합니다
> * `31 line` Kraft & contoller+broker 모드 사용으로 broker 필요 없음 (기본값 `0`)
> * `34 line` 클러스터 내부에서만 접근 허용 (기본값 `false`)
> * `39 line` client 접속 protocol 지정 [`PLAINTEXT`, `SASL_PLAINTEXT`, `SASL_SSL`, `SSL`] (기본값 `SASL_PLAINTEXT`)
> * `45 line` controller 접속 protocol 지정 [`PLAINTEXT`, `SASL_PLAINTEXT`, `SASL_SSL`, `SSL`] (기본값 `SASL_PLAINTEXT`)
> * `49 line` interbroker 접속 protocol 지정 [`PLAINTEXT`, `SASL_PLAINTEXT`, `SASL_SSL`, `SSL`] (기본값 `SASL_PLAINTEXT`)
> * `54 line` external 접속 protocol 지정 [`PLAINTEXT`, `SASL_PLAINTEXT`, `SASL_SSL`, `SSL`] (기본값 `SASL_PLAINTEXT`)
> * `71, 72 line` client.protocol `SASL_PLAINTEXT` 지정시 사용할 ID/PW
> * `83 line` kraft 활성화 (기본값 `true`)
> * `86 line` zookeeper 비활성화 (기본값 `false`)
:::

## 설치
``` bash
helm install kafka bitnami/kafka -n kafka -f values.yaml
```

::: tip
클러스터 내부에서 접근시
``` txt
kafka.kafka.svc.cluster.local
```
:::

## 테스트
### pod 생성
``` bash
kubectl run kafka-client --restart='Never' --image docker.io/bitnami/kafka:3.9.0-debian-12-r4 --namespace kafka --command -- sleep infinity
```

``` bash
kubectl exec --tty -i kafka-client --namespace kafka -- bash
```

### topic 생성
``` bash
kafka-topics.sh \
  --bootstrap-server kafka.kafka.svc.cluster.local:9092 \
  --create \
  --topic test \
  --partitions 1 
```

### producer & consumer 테스트
::: details PRODUCER
``` bash
kafka-console-producer.sh \
    --bootstrap-server kafka.kafka.svc.cluster.local:9092 \
    --topic test
```
:::

::: details CONSUMER
``` bash
kafka-console-consumer.sh \
    --bootstrap-server kafka.kafka.svc.cluster.local:9092 \
    --topic test \
    --from-beginning
```
:::