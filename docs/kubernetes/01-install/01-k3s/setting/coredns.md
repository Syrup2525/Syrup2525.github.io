# Core DNS
::: warning
먼저 `k3s` 설치 및 `Rancher` 세팅이 완료되어 있어야 합니다. [k3s 구성](/kubernetes/01-install/01-k3s/install/install) 및 [Rancher 설치](/kubernetes/01-install/03-base/rancher.md)
:::

## DNS 내용 편집 방법
### configmap 수정
``` bash
kubectl -n kube-system edit configmap coredns
```

::: tip
`test.example.com` 도메인을 `192.168.1.2` 에 매핑 하는 경우
:::

``` yaml
apiVersion: v1
data:
    .:53 {
        errors
        health
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
          pods insecure
          fallthrough in-addr.arpa ip6.arpa
        }
        hosts /etc/coredns/NodeHosts {
          ttl 60
          reload 15s
          192.168.1.2 test.example.com         // [!code ++]
          fallthrough
        }
        prometheus :9153
        forward . /etc/resolv.conf
        cache 30
        loop
        reload
        loadbalance
        import /etc/coredns/custom/*.override
    }
```

``` bash
:wq
```

### Core DNS Pod 재시작
``` bash
kubectl delete pod -n kube-system -l k8s-app=kube-dns
```

### Core DNS Pod 상태 확인
``` bash
kubectl get pod -n kube-system -l k8s-app=kube-dns
```

### 테스트
``` bash
kubectl run busybox --image=busybox --restart=Never -- sleep 3600
kubectl exec -it busybox -- nslookup test.example.com
```

* 정상 결과
``` txt
Server:		10.43.0.10
Address:	10.43.0.10:53


Name:	test.example.com
Address: 192.168.1.2

```

* 삭제
``` bash
kubectl delete pods busybox
```