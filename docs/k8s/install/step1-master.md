# Master 구성
## 사전 작업
### 메모리 swap off
메모리 swapp off
```bash
swapoff -a
```

재부팅 후 설정 초기화 방지
```bash
vi /etc/fstab
```

해당 라인을 주석(삭제)처리 해준다.
```txt
UUID=1234-ABCD          /boot/efi               vfat    umask=0077,shortname=winnt 0 2
/dev/mapper/cs-home     /home                   xfs     defaults        0 0
/dev/mapper/cs-swap     none                    swap    defaults        0 0 // [!code --]
```

swap 영역 확인
```bash
free -h
```

실행 결과
```bash
              total        used        free      shared  buff/cache   available
Mem:           15Gi       255Mi        13Gi       773Mi       1.4Gi        13Gi
Swap:            0B          0B          0B
```

## RKE2 를 이용해 쿠버네티스 설치

::: tip
공식 문서는 [RKE2 Quick Start](https://docs.rke2.io/install/quickstart) 참고
:::

### RKE2 Server 설치
명령어 실행 전 root 계정 전환 필요
```bash
su root
```

curl 명령어 실행
```bash
curl -sfL https://get.rke2.io | sh -
```

실행 결과
```bash
[INFO]  finding release for channel stable
[INFO]  using 1.28 series from channel stable
Rancher RKE2 Common (stable)                                                                                                                                            5.0 kB/s | 2.9 kB     00:00    

...

Rancher RKE2 1.28 (stable)      
Installed:
  rke2-common-1.28.9~rke2r1-0.el8.x86_64                               rke2-selinux-0.18-1.el8.noarch                               rke2-server-1.28.9~rke2r1-0.el8.x86_64                              

Complete!
```

### 서비스 시작 및 등록
::: tip
::: details config.yaml 설정 (선택사항)
```bash
mkdir -p /etc/rancher/rke2/
vi /etc/rancher/rke2/config.yaml
```

node-name 변경
::: code-group
```yaml [config.yaml]
node-name: master1 # agent 이름
```
:::

```bash
systemctl enable rke2-server
```
```bash
systemctl start rke2-server
```
```bash
systemctl status rke2-server
```

실행 결과
```bash
● rke2-server.service - Rancher Kubernetes Engine v2 (server)
   Loaded: loaded (/usr/lib/systemd/system/rke2-server.service; enabled; vendor preset: disabled)
   Active: active (running)
   ...
```

::: tip
로그 확인 명령어
```bash
journalctl -u rke2-server -f
```
:::

## kubectl 환경변수 등록
root 계정 접속한 상태에서 실행
```bash
mkdir ~/.kube/
cp /etc/rancher/rke2/rke2.yaml ~/.kube/config
export PATH=$PATH:/var/lib/rancher/rke2/bin/
echo 'export PATH=/usr/local/bin:/var/lib/rancher/rke2/bin:$PATH' >> ~/.bashrc
```

정상 실행 확인
```bash
kubectl get nodes
```

실행 결과
```bash
NAME      STATUS   ROLES                       AGE    VERSION
master1   Ready    control-plane,etcd,master   111s   v1.28.9+rke2r1
```

## Woker 노드 등록에 필요한 token 확인
```bash 
cat /var/lib/rancher/rke2/server/node-token
```

실행 결과
```bash 
K10 ... 132::server:74 ... 39
```
