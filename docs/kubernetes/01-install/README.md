# REAMD.md

## 들어가며
> kubernetes (쿠버네티스) 클러스터 운영을 위해서는 [`k3s`](/kubernetes/01-install/01-k3s/install/install.md) 혹은 [`k8s (RKE2 사용)`](/kubernetes/01-install/02-k8s/install/step1-master.md) 중 하나를 택하여 환경을 구축하는 방법을 제공합니다. 해당 `GithubPage` 에서는 `k3s` 또는 `k8s` 로 설치된 쿠버네티스 환경을 `kubernetes` 혹은 `쿠버네티스` 라고 지칭합니다. `k3s` 로 구축된 쿠버네티스의 경우 `k3s`, `k8s` 로 구축된 경우는 `k8s` 로 표기합니다.
>
> * `k3s` k3s 환경으로 구축된 쿠버네티스
> * `k8s` RKE2 를 사용하여 구축된 쿠버네티스
> * `kubernetes` `쿠버네티스` k3s 또는 k8s 로 구축된 환경

## 구성 가이드
구성 순서는 다음과 같습니다
1. [`k3s`](/kubernetes/01-install/01-k3s/install/install.md) 혹은 [`k8s`](/kubernetes/01-install/02-k8s/install/step1-master.md) 로 쿠버네티스 환경 구축
2. `쿠버네티스` 패키지 관리 도구 [`helm`](/kubernetes/01-install/03-base/helm.md) 설치
3. `쿠버네티스` 관리 웹 UI 도구 [`rancher`](/kubernetes/01-install/03-base/rancher.md) 설치
4. 하드웨어 리소스 모니터링 도구 [`prometheus & grafana`](/kubernetes/04-monitoringandlog/prometheus.md) 설치
5. 로그 수집 도구 [`EFK Stack`](/kubernetes/04-monitoringandlog/efk.md) 구축
6. 소스 형상관리 및 자동 빌드/테스트/배포 파이프라인 [`GitOps, CI/CD`](/kubernetes/05-gitops/gitlab.md) 구축

> 다음 오픈소스를 활용합니다.
> * `EFK` elasticsearch, fluent-bit, kibana
> * `Git` `Container Registry` gitlab
> * `CI` gitlab-runner
> * `CD` ArgoCD

[`mysql`](/kubernetes/06-database/mysql.md) [`redis`](/kubernetes/06-database/redis.md) [`mongodb`](/kubernetes/06-database/mongodb.md) 등과 같은 데이터베이스나, [`apache kafka`](/kubernetes/07-kafka/install.md) 와 같은 Application 을 를 `쿠버네티스` 위에 손쉽게 구축하고 구동 할 수 있습니다.

`쿠버네티스` 위에 올라간 모든 서비스들은 `GitOps` 를 통하여 형상관리 되며, `CI/CD` 파이프라인으로 자동 빌드/테스트/배포 가 이루어지고, `grafana` 를 통하여 웹에서 차트로 서비스별로 하드웨어 자원 사용 리소스를 확인하고, `Kibana` 에서 각 서비스들에 대한 로그를 실시간으로 확인 할 수 있습니다. 그리고 이러한 서비스들을 관리하는 `쿠버네티스` 를 `rancher` 에서 웹으로 관리 할 수 있습니다.

## k3s vs k8s
### 기본 개념
| 항목 | k8s (Kubernetes) | k3s (Lightweight Kubernetes) |
| --- | --- | --- |
| 정식 명칭 | Kubernetes | Lightweight Kubernetes (k3s) |
| 개발 주체 | CNCF (Cloud Native Computing Foundation) | Rancher Labs (현재는 SUSE 소속) |
| 목적 | 대규모 클러스터 운영 및 유연한 확장 | 경량화된 환경, IoT, Edge, 개발환경 등에 적합 |

### 구조 차이
| 항목 | k8s | k3s |
| --- | --- | --- |
| 구성 요소 | kube-apiserver, kube-scheduler, kube-controller-manager, kubelet, kube-proxy 등등 여러 컴포넌트가 별도 실행 | 여러 컴포넌트를 하나의 바이너리에 통합해서 더 간단하게 제작 |
| etcd | 기본적으로 etcd 사용 (데이터 저장) | 기본은 SQLite 사용 (외부 etcd, MySQL, Postgres도 가능) |
| 설치 용량 | 약 1GB 이상 | 약 100MB 미만 |
| 플러그인 | CNI, CSI 등 수동 설치 | 기본으로 많이 포함됨 (예: flannel, servicelb, traefik 등)

### 설치 및 운영
| 항목 | k8s | k3s |
| --- | --- | --- |
| 설치 방식	| kubeadm 또는 kops, kind, minikube 등 다양하게 가능하지만 복잡하다 | 단일 바이너리로 설치
| 운영 복잡도 | 고가용성 구성, 컴포넌트 버전 관리, 인증 구성 등 복잡 | 기본적으로 간편하게 구성되며, 경량화된 옵션들로 운영이 비교적 쉬움 |

### 사용 대상 및 환경
| 항목 | k8s | k3s |
| --- | --- | --- |
| 주요 대상 | 대기업, 클라우드 서비스, 대규모 시스템 | IoT, Edge, 개발용, 테스트용, 소규모 클러스터 |
| 요구 리소스 | 고사양 VM/서버 필요 | 라즈베리파이에서도 구동 가능 |
| 상용 활용 | AWS EKS, GCP GKE, Azure AKS 등 클라우드에서 많이 사용 | 리소스 적은 현장 (공장, Edge)에서 장점 |

### 기타 특징
| 항목 | k8s | k3s |
| --- | --- | --- |
| CRI 지원 | 다양하게 설정 가능 (Docker, containerd, CRI-O 등) | 기본 containerd 만 지원 |
| 인증서 관리 | 복잡 (CA 구성, cert-manager 권장) | 자동 인증서 생성 및 관리 지원 |
| 보안 모델 | RBAC, PSP, NetworkPolicy 등 복잡하게 구성 | 기본적으로 간단한 보안 모델 적용됨 |

### 정리
* `k8s` 프로덕션 환경에서 큰 규모로 쓰기 좋은 성숙한 플랫폼
* `k3s` 가볍고 빠르고 간단하게 쓰기 좋아서 테스트나 개발용, 혹은 IoT, Edge 환경