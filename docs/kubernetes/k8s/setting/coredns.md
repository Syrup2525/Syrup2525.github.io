# Core DNS
::: warning
먼저 `RKE2` 를 통한 `쿠버네티스` 설치 및 `Rancher` 세팅이 완료되어 있어야 합니다. [RKE2 를 통한 쿠버네티스 설치](/kubernetes/k8s/install/step1-master.md) 및 [Rancher 설치](/kubernetes/rancher.md)
:::

## DNS 내용 편집 방법
### configmap 수정
``` bash
kubectl -n kube-system edit configmap rke2-coredns-rke2-coredns
```

::: tip
`test.example.com` 도메인을 `192.168.1.2` 에 매핑 하는 경우
:::

``` yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: rke2-coredns-rke2-coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health
        ready
        hosts {                                  // [!code ++]
            192.168.1.2 test.example.com         // [!code ++]
            fallthrough                          // [!code ++]
        }                                        // [!code ++]
        kubernetes cluster.local in-addr.arpa ip6.arpa {
          pods insecure
          fallthrough in-addr.arpa ip6.arpa
          ttl 30
        }
        forward . /etc/resolv.conf
        cache 30
        loop
        reload
        loadbalance
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