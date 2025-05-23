# Ingress
::: warning
`쿠버네티스` 설치 및 `Rancher` 세팅이 완료되어 있어야 합니다.
> 쿠버네티스를 [k3s](/kubernetes/01-install/01-k3s/install/install.md) 로 설치

> 쿠버네티스를 [RKE2 를 통한 k8s](/kubernetes/01-install/02-k8s/install/step1-master.md) 로 설치

> [Rancher](/kubernetes/01-install/03-base/rancher.md) 설치 
:::

## Namespace 생성
ingress 작업을 진행할 namespace 를 생성합니다. 이 예제에서는 `k8s` 로 진행합니다.
``` bash
kubectl create ns k8s
```

## Pod 생성
ingress 테스트 진행을 위해 Nginx Pod 를 실행합니다.
``` bash
kubectl run mynginx --image nginx --expose --port 80 --namespace=k8s
```

아래 `Let's Encrypt 사용` 또는 `공용 CA wildcard 인증서 사용` 챕터중 하나를 선택하여 진행합니다.

### Let's Encrypt 사용
::: info
해당 챕터는 `Nginx Ingress` 를 활용하여 `Let's Encrypt` 를 사용해 HTTPS(TLS) 가 적용된 도메인 기반 라우팅 방법을 설명합니다.
:::

#### Issuer 생성
::: code-group
``` yaml [issuer.yaml]
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: k8s
  namespace: k8s
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

#### Ingress 생성
::: code-group
``` yaml [ingress.yaml]
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/issuer: k8s
    cert-manager.io/issuer-kind: Issuer
    acme.cert-manager.io/http01-ingress-class: nginx # k3s 클러스터의 경우 traefik 사용
  name: k8s
  namespace: k8s
spec:
  ingressClassName: nginx # k3s 클러스터의 경우 traefik 사용
  rules:
    - host: k8s.example.com
      http:
        paths:
          - backend:
              service:
                name: mynginx
                port:
                  number: 80
            path: /
            pathType: ImplementationSpecific
  tls:
    - hosts:
        - k8s.example.com
      secretName: tls-k8s-ingress
```
:::
> * `metadata.annotations.cert-manager.io/issuer` issuer.yaml 에서 작성한 metadata.name
> * `spec.tls[0].hosts` TLS 를 적용할 도메인 이름
> * `spec.tls[0].secretName` 생성될 Secret 의 이름

``` bash
kubectl apply -f ingress.yaml 
```

### 공용 CA wildcard 인증서 사용
::: info
`공용 CA wildcard 인증서` 를 사용해 HTTPS(TLS) 를 적용된 도메인 기반 라우팅 방법과 `default` namespace 에 `TLS Secret` 을 생성하고 `default` 에 생성된 `Secret` 을 모든 namespace에 자동으로 복사하는 방법을 설명합니다.
:::

#### Secret 생성
secret 생성
``` bash
kubectl create secret tls example-com-tls \
  --cert=fullchain.crt \
  --key=example.com.key \
  -n default
```

::: tip
`fullchain.crt` 는 `Leaf Certificate (인증서)` > `Intermediate Certificate (중간 인증서)` > `Root Certificate (Root 인증서)` 순서입니다. 예를들어 `example.com.crt` > `USERTrustRSACertificationAuthority.crt` > `AAAcertificateServices.crt` 순서로 모든 인증서가 체이닝된 파일 입니다.
:::

#### Secret 생성 자동화
::: code-group
``` sh [auto-secret-create.sh]
for ns in $(kubectl get namespaces -o jsonpath="{.items[*].metadata.name}"); do
  kubectl get secret example-com-tls -n default -o yaml | \
  sed "s/namespace: default/namespace: $ns/" | \
  kubectl apply -n $ns -f -
done
```
:::

::: tip
Project 에 포함되지 않은 namespace 에만 배포하는 방법
::: code-group
``` sh [auto-secret-create-only-not-in-a-project.sh]
for ns in $(kubectl get namespaces -o jsonpath="{.items[*].metadata.name}"); do
  project_id=$(kubectl get namespace $ns -o jsonpath="{.metadata.labels['field\.cattle\.io/projectId']}" 2>/dev/null)
  
  if [ -z "$project_id" ]; then
    echo "Applying configuration to namespace: $ns"
    kubectl get secret example-kr-tls -n default -o yaml | \
    sed "s/namespace: default/namespace: $ns/" | \
    kubectl apply -n $ns -f -
  else
    echo "Skipping namespace: $ns (field.cattle.io/projectId exists)"
  fi
done
```
:::

::: tip
* Project 에 포함되지 않은 namespace 에만 배포
* 이미 키가 존재하는 경우 삭제 후 재생성
::: code-group
``` sh [auto-secret-create-only-not-in-a-project-exists-delete.sh]
SECRET_NAME="example-kr-tls"

for ns in $(kubectl get namespaces -o jsonpath="{.items[*].metadata.name}"); do
  project_id=$(kubectl get namespace $ns -o jsonpath="{.metadata.labels['field\.cattle\.io/projectId']}" 2>/dev/null)

  if [ -z "$project_id" ]; then
    secret_exists=$(kubectl get secret $SECRET_NAME -n $ns --ignore-not-found)
    
    if [ -n "$secret_exists" ]; then
      echo "Existing secret found in namespace: $ns. Deleting existing secret..."
      kubectl delete secret $SECRET_NAME -n $ns
    fi
    
    echo "Applying new configuration to namespace: $ns"
    kubectl get secret $SECRET_NAME -n default -o yaml | \
    sed "s/namespace: default/namespace: $ns/" | \
    kubectl apply -n $ns -f -
    
  else
    echo "Skipping namespace: $ns (field.cattle.io/projectId exists)"
  fi
done
```
:::

::: tip
* Project 에 포함되지 않은 namespace 에만 배포
* 이미 키가 존재하는 경우 건너뛰기
::: code-group
``` sh [auto-secret-create-only-not-in-a-project-exists-skeep.sh]
SECRET_NAME="example-kr-tls"

for ns in $(kubectl get namespaces -o jsonpath="{.items[*].metadata.name}"); do
  project_id=$(kubectl get namespace $ns -o jsonpath="{.metadata.labels['field\.cattle\.io/projectId']}" 2>/dev/null)

  if [ -z "$project_id" ]; then
    secret_exists=$(kubectl get secret $SECRET_NAME -n $ns --ignore-not-found)
    
    if [ -n "$secret_exists" ]; then
      echo "Existing secret found in namespace: $ns. Skipping secret..."
    else
      echo "Applying new configuration to namespace: $ns"
      kubectl get secret $SECRET_NAME -n default -o yaml | \
      sed "s/namespace: default/namespace: $ns/" | \
      kubectl apply -n $ns -f -
    fi
    
  else
    echo "Skipping namespace: $ns (field.cattle.io/projectId exists)"
  fi
done
```
:::

#### Ingress 생성
::: code-group
``` yaml [ingress.yaml]
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: k8s
  namespace: k8s
spec:
  ingressClassName: nginx # k3s 클러스터의 경우 traefik 사용
  rules:
    - host: k8s.example.com
      http:
        paths:
          - backend:
              service:
                name: mynginx
                port:
                  number: 80
            path: /
            pathType: ImplementationSpecific
  tls:
    - hosts:
        - k8s.example.com
      secretName: example-com-tls
```
:::
> * `spec.tls[0].hosts` TLS 를 적용할 도메인 이름
> * `spec.tls[0].secretName` 참조할 TLS Secret 의 이름

``` bash
kubectl apply -f ingress.yaml
```