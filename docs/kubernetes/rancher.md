# Rancher 설치

::: danger 주의
아래에서 실행하는 명령어는 Master Node 에서 실행해야 됩니다.
:::

## Helm 설치
```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

## cert-manager 설치 (선택 사항)
::: tip
공식 문서는 [cert-manager docs](https://cert-manager.io/docs/installation/helm/) 참고
:::

인증서 종류에 따른 필수 설치 유무

| 인증서 종류                 | 필수 |
| ------------------------ | ----: |
| Rancher 생성 TLS 인증서     | O    |
| Let's Encrypt 인증서       | O    |
| 공용 또는 개인 CA 서명 인증서  | X    |

자세한 설명은 [여기](https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/install-upgrade-on-a-kubernetes-cluster#3-choose-your-ssl-configuration) 참고

::: details cert-manager 설치 방법

저장소 추가
```bash
helm repo add jetstack https://charts.jetstack.io --force-update
```

cert-manager 설치
```bash
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.17.0 \
  --set crds.enabled=true
```

실행 결과
```bash
NAME: cert-manager
LAST DEPLOYED: Mon May 20 14:07:04 2024
NAMESPACE: cert-manager
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
cert-manager v1.14.5 has been deployed successfully!

In order to begin issuing certificates, you will need to set up a ClusterIssuer
or Issuer resource (for example, by creating a 'letsencrypt-staging' issuer).

More information on the different types of issuers and how to configure them
can be found in our documentation:

https://cert-manager.io/docs/configuration/

For information on how to configure cert-manager to automatically provision
Certificates for Ingress resources, take a look at the `ingress-shim`
documentation:

https://cert-manager.io/docs/usage/ingress/
```
:::

## Rancher 설치
::: tip
공식 문서는 [Install/Upgrade Rancher on a Kubernetes Cluster](https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/install-upgrade-on-a-kubernetes-cluster) 참고
:::

### 저장소 추가 (stable)
```bash
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
```

::: details 저장소 종류
- Latest : 최신 기능을 사용해 볼 수 있는 권장 사항
```bash
helm repo add rancher-latest https://releases.rancher.com/server-charts/latest
```

- Stable : 운영 환경에 적합한 제품
```bash
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
```

- Alpha : 출시 예정작의 실험적 미리보기
```bash
helm repo add rancher-alpha https://releases.rancher.com/server-charts/alpha
```
:::

### namespace 생성
```bash
kubectl create namespace cattle-system
```


### Rnacher 설치
* `공용 또는 개인 CA 서명 인증서` 를 이용하여 설치
* `Let's Encrypt 인증서` 를 이용하여 설치
> 위 사항중 원하는 방식을 선택하여 진행합니다. 

::: tip
`Rancher 생성 TLS 인증서` 를 사용하는 경우 [여기](https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/install-upgrade-on-a-kubernetes-cluster#5-install-rancher-with-helm-and-your-chosen-certificate-option) 참고
:::

::: warning
`Let's Encrypt 인증서` 를 이용하여 설치 하는 경우 TCP 80 포트의 방화벽 개방이 필요합니다.
:::

::: details `공용 또는 개인 CA 서명 인증서` 를 이용하여 설치
crt, key 파일을 이용하여 secret 생성
``` bash
kubectl -n cattle-system create secret tls tls-rancher-ingress \
  --cert=tls.crt \
  --key=tls.key
```
rancher 설치 (`공용 CA 서명 인증서`)
``` bash
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --set hostname=rancher.my.org \
  --set bootstrapPassword=admin \
  --set ingress.tls.source=secret
```
::: tip
rancher 설치 (`개인 CA 서명 인증서`)
``` bash
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --set hostname=rancher.my.org \
  --set bootstrapPassword=admin \
  --set ingress.tls.source=secret \
  --set privateCA=true
```
:::

::: details `Let's Encrypt 인증서` 를 이용하여 설치
```bash
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --set hostname=rancher.my.org \
  --set bootstrapPassword=admin \
  --set ingress.tls.source=letsEncrypt \
  --set letsEncrypt.email=me@example.org \
  --set letsEncrypt.ingress.class=nginx
```
:::

### 실행결과
```bash
NAME: rancher
LAST DEPLOYED: Mon May 20 15:40:15 2024
NAMESPACE: cattle-system
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Rancher Server has been installed.

NOTE: Rancher may take several minutes to fully initialize. Please standby while Certificates are being issued, Containers are started and the Ingress rule comes up.

Check out our docs at https://rancher.com/docs/

If you provided your own bootstrap password during installation, browse to https://rancher.my.org to get started.

If this is the first time you installed Rancher, get started by running this command and clicking the URL it generates:

echo https://rancher.my.org/dashboard/?setup=$(kubectl get secret --namespace cattle-system bootstrap-secret -o go-template='{{.data.bootstrapPassword|base64decode}}')

To get just the bootstrap password on its own, run:

kubectl get secret --namespace cattle-system bootstrap-secret -o go-template='{{.data.bootstrapPassword|base64decode}}{{ "\n" }}'


Happy Containering!
```
