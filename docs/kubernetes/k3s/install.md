# K3s 구성

::: tip
다음은 `Rocky Linux 8` 환경에서 진행되었습니다.
:::

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



## K3s 설치
::: tip
공식 문서는 [Quick-Start Guide](https://docs.k3s.io/quick-start) 참고
:::

명령어 실행 전 root 계정 전환 필요
```bash
su root
```

curl 명령어 실행
```bash
curl -sfL https://get.k3s.io | sh -
```

::: details Node 이름을 지정하여 설치
``` bash
curl -sfL https://get.k3s.io | K3S_NODE_NAME=YOUR_NODE_NAME sh -
```
:::

실행 결과
``` bash
Complete!
[INFO]  Creating /usr/local/bin/kubectl symlink to k3s
[INFO]  Creating /usr/local/bin/crictl symlink to k3s
[INFO]  Creating /usr/local/bin/ctr symlink to k3s
[INFO]  Creating killall script /usr/local/bin/k3s-killall.sh
[INFO]  Creating uninstall script /usr/local/bin/k3s-uninstall.sh
[INFO]  env: Creating environment file /etc/systemd/system/k3s.service.env
[INFO]  systemd: Creating service file /etc/systemd/system/k3s.service
[INFO]  systemd: Enabling k3s unit
Created symlink /etc/systemd/system/multi-user.target.wants/k3s.service → /etc/systemd/system/k3s.service.
[INFO]  systemd: Starting k3s
```

설치 확인
``` bash
systemctl status k3s
```

``` bash
● k3s.service - Lightweight Kubernetes
   Loaded: loaded (/etc/systemd/system/k3s.service; enabled; vendor preset: disabled)
   Active: active (running) since Mon 2025-04-07 14:26:01 KST; 1min 50s ago
     Docs: https://k3s.io
  Process: 38061 ExecStartPre=/sbin/modprobe overlay (code=exited, status=0/SUCCESS)
  Process: 38053 ExecStartPre=/sbin/modprobe br_netfilter (code=exited, status=0/SUCCESS)
  Process: 38050 ExecStartPre=/bin/sh -xc ! /usr/bin/systemctl is-enabled --quiet nm-cloud-setup.service 2>/dev/null (code=e>
 Main PID: 38064 (k3s-server)
```


## 환경변수 설정
### k3s 환경변수 설정
``` bash
export PATH=$PATH:/usr/local/bin
echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
source ~/.bashrc
```

#### 설정 확인
``` bash
k3s kubectl get nodes
```

``` bash
NAME       STATUS   ROLES                  AGE     VERSION
master01   Ready    control-plane,master   8m26s   v1.32.3+k3s1
```