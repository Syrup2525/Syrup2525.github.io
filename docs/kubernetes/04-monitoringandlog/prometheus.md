# Grafana & Prometheus 설치

## Namespace
``` bash
kubectl create ns prometheus
```

## 저장소 추가
``` bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

``` bash
helm repo update
```

## 설치
``` bash
helm install prometheus prometheus-community/kube-prometheus-stack -n prometheus
```

## Issuer & Ingress
### Issuer
::: code-group
``` yaml [issuer.yaml]
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: prometheus
  namespace: prometheus
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

### Ingress
::: code-group
``` yaml [ingress.yaml]
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/issuer: prometheus
    cert-manager.io/issuer-kind: Issuer
  name: grafana
  namespace: prometheus
spec:
  ingressClassName: nginx
  rules:
    - host: grafana.example.com
      http:
        paths:
          - backend:
              service:
                name: prometheus-grafana
                port:
                  number: 80
            path: /
            pathType: Prefix
  tls:
    - hosts:
        - grafana.example.com
      secretName: tls-grafana-ingress
```
:::
``` bash
kubectl apply -f ingress.yaml
```

## Grafana WEB UI 접속
``` txt
https://grafana.example.com
```

::: tip
### 초기 아이디 & 비밀번호
* ID: admin
* PW: 
> ``` bash
> kubectl --namespace prometheus get secrets prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo
> ```
:::