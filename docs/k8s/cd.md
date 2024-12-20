# CD (ArgoCD)

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

## Argo CD 접속
``` txt
https://argocd.example.com
```

> * ID : `admin`
> * PW :
> ``` bash
> kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
> ```