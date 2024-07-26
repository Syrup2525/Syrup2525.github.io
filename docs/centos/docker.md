# Docker

## Docker 설치

::: tip
[공식 문서 바로가기](https://docs.docker.com/engine/install/centos/)
:::

저장소 추가
``` bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

도커 엔진 설치
``` bash
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

::: tip
::: details 특정 버전을 지정하여 설치 
```bash
sudo yum install docker-ce-<VERSION_STRING> docker-ce-cli-<VERSION_STRING> containerd.io docker-buildx-plugin docker-compose-plugin
```
:::

::: tip
`Fingerprint` 키값이 `060A 61C5 1B55 8A7F 742B 77AA C52F EB6B 621E 9F35` 값과 일치하는지 확인 후 계속 진행
``` bash
Retrieving key from https://download.docker.com/linux/centos/gpg
Importing GPG key 0x621E9F35:
 Userid     : "Docker Release (CE rpm) <docker@docker.com>"
 Fingerprint: 060a 61c5 1b55 8a7f 742b 77aa c52f eb6b 621e 9f35
 From       : https://download.docker.com/linux/centos/gpg
```
:::

도커 시작
``` bash
sudo systemctl start docker
```

설치 확인
``` bash
sudo docker run hello-world
```

도커 데몬 enable
``` bash
sudo systemctl enable docker
```

## Docker 삭제
``` bash
sudo yum remove docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
```

``` bash
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```