# UI for Apache Kafka

## Namespace
``` bash
kubectl create ns kafkaui
```

## 저장소 추가
``` bash
helm repo add kafka-ui https://provectus.github.io/kafka-ui-charts
```

``` bash
helm repo update
```

## ConfigMap 작성
::: code-group
``` yaml:line-numbers [configMap.yaml] {8,9}
apiVersion: v1
kind: ConfigMap
metadata:
  name: kafka-ui-helm-values
  namespace: kafkaui
data:
  AUTH_TYPE: "LOGIN_FORM"
  SPRING_SECURITY_USER_NAME: admin
  SPRING_SECURITY_USER_PASSWORD: pass
```
> * `8 line` 유저 아이디
> * `9 line` 유저 비밀번호

:::
``` bash
kubectl apply -f configMap.yaml
```

## values.yaml 작성
::: code-group
``` yaml:line-numbers [values.yaml]
yamlApplicationConfig:
  kafka:
    clusters:
      - name: kafka
        bootstrapServers: kafka.kafka.svc.cluster.local:9092
  management:
    health:
      ldap:
        enabled: false
```
:::

## 설치
``` bash
helm install kafkaui kafka-ui/kafka-ui -f values.yaml -n kafkaui --set existingConfigMap="kafka-ui-helm-values"
```

## Issuer & Ingress
### Issuer
::: code-group
``` yaml [issuer.yaml]
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: kafkaui
  namespace: kafkaui
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
    cert-manager.io/issuer: kafkaui
    cert-manager.io/issuer-kind: Issuer
  name: kafkaui
  namespace: kafkaui
spec:
  ingressClassName: nginx
  rules:
    - host: kafkaui.example.com
      http:
        paths:
          - backend:
              service:
                name: kafkaui-kafka-ui
                port:
                  number: 80
            path: /
            pathType: Prefix
  tls:
    - hosts:
        - kafkaui.example.com
      secretName: kafkaui-example-tls
```
:::
``` bash
kubectl apply -f ingress.yaml
```