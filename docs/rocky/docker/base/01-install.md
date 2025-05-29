# Docker
## Install
1. 종속 패키지 설치
``` bash
sudo dnf -y install dnf-plugins-core
```

2. Docker 공식 저장소 추가
``` bash
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

3. Docker 설치
``` bash
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

::: tip
#### 특정 버전 설치시
1. 사용 가능한 Docker 버전 확인하기
``` bash
dnf list docker-ce --showduplicates | sort -r
```
2. 원하는 버전 설치
``` bash
sudo dnf install -y docker-ce-25.0.5 docker-ce-cli-25.0.5 containerd.io docker-buildx-plugin docker-compose-plugin
```
:::

4. Docker 서비스 시작 및 부팅 시 자동 실행 설정
``` bash
sudo systemctl start docker
sudo systemctl enable docker
```

5. Docker 동작 확인
``` bash
sudo docker run hello-world
```

::: tip 
sudo 권한 없이 실행하기
``` bash
sudo usermod -aG docker $USER
newgrp docker
```
:::