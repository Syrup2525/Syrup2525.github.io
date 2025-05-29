# Traefik
::: warning
먼저 `k3s` 세팅이 완료되어 있어야 합니다. [k3s 구성](/kubernetes/01-install/01-k3s/install/install)
:::

## Timeout 시간 수정
1. HelmChartConfig 작성
::: code-group
``` yaml [traefik-timeout-config.yaml]
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
    additionalArguments:
      - "--entrypoints.websecure.transport.respondingTimeouts.readTimeout=60m"
      - "--entrypoints.websecure.transport.respondingTimeouts.writeTimeout=60m"
      - "--entrypoints.websecure.transport.respondingTimeouts.idleTimeout=60m"
```
:::

2. 설정 적용
``` bash
kubectl apply -f traefik-timeout-config.yaml
```

3. traefik 재시작
``` bash
kubectl delete pod -n kube-system -l app.kubernetes.io/name=traefik
```

4. 설정 적용 확인
``` bash
kubectl -n kube-system exec -it $(kubectl get pod -n kube-system -l app.kubernetes.io/name=traefik -o jsonpath="{.items[0].metadata.name}") -- cat /proc/1/cmdline | tr '\0' '\n'
```

5. 아래 내용이 출력되는지 확인
``` txt
--entrypoints.websecure.transport.respondingTimeouts.readTimeout=60m
--entrypoints.websecure.transport.respondingTimeouts.writeTimeout=60m
--entrypoints.websecure.transport.respondingTimeouts.idleTimeout=60m
```