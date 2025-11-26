# Nexus Repository 설치

::: tip
`x86 기반` `Rocky 8 리눅스` 배포판에 `Neuxs Repository`를 구축하는 방법을 설명합니다.
:::

## 필요 패키지 설치
``` bash
sudo dnf install -y java-11-openjdk java-11-openjdk-devel
java -version
```

## Nexus 전용 계정 만들기
``` bash
sudo useradd --system --no-create-home --shell /bin/false nexus
```

## Nexus 다운로드
[Nexus 최신 버전 링크 확인](https://help.sonatype.com/repomanager3/download)
아래는 `3.86.2` 버전 기준으로 설명합니다.
``` bash
cd /opt
sudo wget https://cdn.download.sonatype.com/repository/downloads-prod-group/3/nexus-3.86.2-01-linux-x86_64.tar.gz
sudo tar -xzvf nexus-3.86.2-01-linux-x86_64.tar.gz
sudo mv nexus-3.86.2-01 nexus
sudo chown -R nexus:nexus nexus sonatype-work
sudo rm nexus-3.86.2-01-linux-x86_64.tar.gz
```

## systemd 서비스 등록
``` bash
sudo vi /etc/systemd/system/nexus.service
```
::: code-group
``` bash [nexus.service]
[Unit]
Description=Nexus Repository Manager
After=network.target

[Service]
Type=forking
LimitNOFILE=65536
User=nexus
Group=nexus
ExecStart=/opt/nexus/bin/nexus start
ExecStop=/opt/nexus/bin/nexus stop
Restart=on-abort

[Install]
WantedBy=multi-user.target
```
:::

## Nexus 실행 및 자동부팅 설정
``` bash
sudo systemctl enable nexus
sudo systemctl start nexus
sudo systemctl status nexus
```

## 웹에서 접속
``` txt
http://YOUR_SERVER_IP:8081
```
::: tip
- 계정 : admin
- 비밀번호 : `cat /opt/sonatype-work/nexus3/admin.password`
:::
