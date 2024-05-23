# Woker 구성
## 사전 작업
### 메모리 swap off
메모리 swap off
```bash
swapoff -a
```

메모리 swapp off (재부팅 후 설정 초기화 방지)
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
### RKE2 agent 설치
명령어 실행 전 root 계정 전환 필요
```bash
su root
```

curl 명령어 실행
```bash
curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE="agent" sh -
```

실행 결과
```bash
[INFO]  finding release for channel stable
[INFO]  using 1.28 series from channel stable
Rancher RKE2 Common (stable)                                                                                                                        1.6 kB/s | 2.9 kB     00:01    
Rancher RKE2 1.28 (stable)                                                                                                                          2.4 kB/s | 4.6 kB     00:01    
Dependencies resolved.

...

Installed:
  rke2-agent-1.28.9~rke2r1-0.el8.x86_64                        rke2-common-1.28.9~rke2r1-0.el8.x86_64                        rke2-selinux-0.18-1.el8.noarch                       

Complete!
```

config.yaml 설정
```bash
mkdir -p /etc/rancher/rke2/
vi /etc/rancher/rke2/config.yaml
```

```yaml title="config.yaml"
server: https://<server>:9345
token: <token from server node> # 마스터 노드 토큰
node-name: woker1 # agent 이름
```

::: tip
token 값은 [Woker 노드 등록에 필요한 token 확인](/k8s/install/step1-master.html#woker-노드-등록에-필요한-token-확인) 에서 확인
:::

### 서비스 시작 및 등록
```bash
systemctl enable rke2-agent
```
```bash
systemctl start rke2-agent
```
```bash
systemctl status rke2-agent
```

실행 결과
```bash
● rke2-agent.service - Rancher Kubernetes Engine v2 (agent)
   Loaded: loaded (/usr/lib/systemd/system/rke2-agent.service; disabled; vendor preset: disabled)
   Active: active (running)
   ...
```

::: tip
로그 확인 명령어
```bash
journalctl -u rke2-agent -f
```
:::

노드 확인 (Master 에서 확인)
```bash
kubectl get nodes
```

실행 결과
```bash
NAME      STATUS   ROLES                       AGE     VERSION
master1   Ready    control-plane,etcd,master   9m46s   v1.28.9+rke2r1
woker1    Ready    <none>                      46s     v1.28.9+rke2r1
```
