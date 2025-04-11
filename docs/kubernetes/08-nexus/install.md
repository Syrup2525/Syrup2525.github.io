# Kafka 설치

## Namespace
``` bash
kubectl create namespace nexus
```

## 저장소 추가
``` bash
helm repo add sonatype https://sonatype.github.io/helm3-charts/
```

``` bash
helm repo update
```

## values.yaml 작성
::: code-group
``` yaml:line-numbers [values.yaml] {6}
image:
  repository: sonatype/nexus3
  tag: "3.68.1"

ingress:
  enabled: false

service:
  type: ClusterIP

```
* `6 line` 직접 Ingress 구성을 할 것이기 때문에 `false` 지정
:::

## 설치
``` bash
helm install nexus sonatype/nexus-repository-manager \
  --namespace nexus \
  --create-namespace \
  -f values.yaml
```

## 관리자 초기 비밀번호 확인
``` bash
kubectl exec -it -n nexus <nexus-pod-name> -- cat /nexus-data/admin.password
```

## Ingress 구성
::: tip
아래는 `k3s` `와일드카드 인증서` 기준입니다. `k8s` 혹은 `Let's Encrypt` 인증서를 이용한 Ingress 구성이 필요한 경우 [Ingress](/kubernetes/03-setting/ingress) 를 참고 해주세요.
:::

::: code-group
``` yaml:line-numbers [ingress.yaml]
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nexus
  namespace: nexus
spec:
  ingressClassName: traefik
  rules:
    - host: nexus.example.com
      http:
        paths:
          - backend:
              service:
                name: nexus-nexus-repository-manager
                port:
                  number: 8081
            path: /
            pathType: Prefix
  tls:
    - hosts:
        - nexus.example.com
      secretName: example-com-tls
```
:::
