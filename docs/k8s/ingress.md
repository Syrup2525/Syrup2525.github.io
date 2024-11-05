# Ingress

::: info
해당 문서는 `Nginx Ingress` 를 활용하여 `Let's Encrypt` 를 사용해 HTTPS(TLS) 가 적용된 도메인 기반 라우팅 방법을 설명합니다.
:::

::: warning
먼저 `RKE2` 를 통한 `쿠버네티스` 설치 및 `Rancher` 세팅이 완료되어 있어야 합니다. [RKE2 를 통한 쿠버네티스 설치](./install/step1-master.md) 및 [Rancher 설치](./install/step3-rancher.md)
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

## Issuer 생성
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

## Ingress 생성
::: code-group
``` yaml [ingress.yaml]
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/issuer: k8s
    cert-manager.io/issuer-kind: Issuer
  name: k8s
  namespace: k8s
spec:
  ingressClassName: nginx
  rules:
    - host: k8s.yourdomain.com
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
        - k8s.yourdomain.com
      secretName: tls-k8s-ingress
```
:::
> * `metadata.annotations.cert-manager.io/issuer` issuer.yaml 에서 작성한 metadata.name
> * `spec.tls[0].hosts` TLS 를 적용할 도메인 이름
> * `spec.tls[0].secretName` 생성될 Secret 의 이름

``` bash
kubectl apply -f ingress.yaml 
```