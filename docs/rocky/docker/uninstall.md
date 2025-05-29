# 제거

1. Docker 서비스 중지 및 Swarm 초기화
``` bash
sudo docker swarm leave --force
sudo systemctl stop docker
sudo systemctl disable docker
```

2. Docker 패키지 및 관련 구성 제거
``` bash
sudo yum remove -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

3. 모든 Docker 관련 데이터 삭제
``` bash
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
sudo rm -rf /etc/docker
sudo rm -rf ~/.docker
```

4. 남아있을 수 있는 도커 설정 파일 및 소켓 정리
``` bash
sudo rm -rf /run/docker.sock
```