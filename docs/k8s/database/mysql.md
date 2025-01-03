# MySQL 8 설치

## Namespace
``` bash
kubectl create ns mysql
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
> * `STORAGE_CLASS_NAME` storage class 이름 `ex) mysql-storage`
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
> * `STORAGE_CLASS_NAME` storage class 이름 `ex) mysql-storage`
> * `LOCAL_PATH` path 경로 `ex) /mnt/path`
> * `NODE_NAME` NODE 이름 `ex) master1`

``` bash
kubectl apply -f pv.yaml
```

## values.yaml 작성
::: code-group
``` yaml:line-numbers [values.yaml] {2,4-5,7,10,11,31-33,44-45,50,64,67,69}
global:
  defaultStorageClass: "STORAGE_CLASS_NAME"

image:
  tag: 8.0.38

architecture: standalone

auth:
  rootPassword: "ROOT_PASSWORD"
  createDatabase: false

primary:
  configuration: |-
    [mysqld]
    authentication_policy='{{- .Values.auth.authenticationPolicy | default "* ,," }}'
    skip-name-resolve
    explicit_defaults_for_timestamp
    basedir=/opt/bitnami/mysql
    plugin_dir=/opt/bitnami/mysql/lib/plugin
    port={{ .Values.primary.containerPorts.mysql }}
    mysqlx={{ ternary 1 0 .Values.primary.enableMySQLX }}
    mysqlx_port={{ .Values.primary.containerPorts.mysqlx }}
    socket=/opt/bitnami/mysql/tmp/mysql.sock
    datadir=/bitnami/mysql/data
    tmpdir=/opt/bitnami/mysql/tmp
    max_allowed_packet=16M
    bind-address=*
    pid-file=/opt/bitnami/mysql/tmp/mysqld.pid
    log-error=/opt/bitnami/mysql/logs/mysqld.log
    character-set-server=utf8mb4
    collation-server=utf8mb4_unicode_ci
    default-time-zone="+09:00"
    slow_query_log=0
    long_query_time=10.0
    {{- if .Values.tls.enabled }}
    ssl_cert=/opt/bitnami/mysql/certs/{{ .Values.tls.certFilename }}
    ssl_key=/opt/bitnami/mysql/certs/{{ .Values.tls.certKeyFilename }}
    {{- if (include "mysql.tlsCACert" .) }}
    ssl_ca={{ include "mysql.tlsCACert" . }}
    {{- end }}
    {{- end }}

    [mysql]
    default-character-set=utf8mb4

    [client]
    port={{ .Values.primary.containerPorts.mysql }}
    socket=/opt/bitnami/mysql/tmp/mysql.sock
    default-character-set=utf8mb4
    plugin_dir=/opt/bitnami/mysql/lib/plugin

    [manager]
    port={{ .Values.primary.containerPorts.mysql }}
    socket=/opt/bitnami/mysql/tmp/mysql.sock
    pid-file=/opt/bitnami/mysql/tmp/mysqld.pid
    
  resources:
    requests:
      cpu: 10m
      memory: 10Mi

  service:
    type: NodePort
    ports:
      mysql: 3306
      mysqlx: ""
    nodePorts:
      mysql: 30000 # The range of valid ports is 30000-32767
      mysqlx: ""
```
:::
> * `2 line` 이전 단계에서 생성한 storage class 이름 `ex) mysql-storage`
> * `4, 5 line` mysql 버전 명시 (미지정시 가장 최신 버전)
> * `7 line` 단일 Node 실행을 위해 `standalone` 지정
> * `10 line` root 게정 비밀번호 지정
> * `11 line` 기본 데이터 베이스 생성 안함 (기본값 `true`)
> * `31, 32, 33, 44, 45, 50 line` character-set 및 time-zone 지정
> * `64 line` 외부 접근을 위해 `NodePort` 지정 (기본값 `ClusterIP`)
> * `67 line` mysqlx 사용 안함 (기본값 `33060`)
> * `69 line` 외부 접근을 위한 port 지정

## 설치
``` bash
helm install mysql bitnami/mysql -n mysql -f values.yaml
```

::: tip
클러스터 내부에서 접근시
``` txt
mysql.mysql.svc.cluster.local:3306
```
:::