# MySQL 8

## 설치
### MySQL 8 설치
1. MySQL 공식 리포지터리 설정
``` bash
sudo dnf install https://dev.mysql.com/get/mysql80-community-release-el9-1.noarch.rpm -y
```

2. MySQL 8.0 설치
``` bash
sudo dnf install mysql-community-server --nogpgcheck -y
```

::: tip
#### 특정 버전으로 설치
1. 필요한 패키지 사전 설치
``` bash
sudo dnf install -y wget libaio perl
```

2. 설치 디렉토리 준비
``` bash
mkdir -p ~/mysql-8.0.39
cd ~/mysql-8.0.39
```

3. MySQL 8.0.39 RPM 패키지 다운로드
``` bash
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-community-common-8.0.39-1.el9.x86_64.rpm
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-community-libs-8.0.39-1.el9.x86_64.rpm
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-community-client-plugins-8.0.39-1.el9.x86_64.rpm
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-community-client-8.0.39-1.el9.x86_64.rpm
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-community-icu-data-files-8.0.39-1.el9.x86_64.rpm
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-community-server-8.0.39-1.el9.x86_64.rpm
```

> 아카이브 링크 [바로가기](https://downloads.mysql.com/archives/community/)

4. 설치
``` bash
sudo dnf install ./*.rpm --nogpgcheck -y
```
:::

### 기본 캐릭터셋 및 시간대 설정
1. 설정 파일 수정
``` bash
sudo vi /etc/my.cnf.d/mysql-server.cnf
```

``` ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
init_connect='SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci'
default-time-zone = '+09:00'

[client]
default-character-set=utf8mb4

[mysql]
default-character-set = utf8mb4
```

2. MySQL 서비스 시작 및 자동 시작 등록
``` bash
sudo systemctl enable --now mysqld
```

### 접속
1. root 초기 비밀번호 확인
``` bash
sudo grep 'temporary password' /var/log/mysqld.log
```

2. MySQL 접속
``` bash
mysql -u root -p
```

3. 비밀번호 변경
``` bash
ALTER USER 'root'@'localhost' IDENTIFIED BY '원하는!강력한!비밀번호!';
```

4. 확인 후 종료
``` bash
SELECT user, host, authentication_string FROM mysql.user;
EXIT;
```