# MySQL 8 설치

## Docker run

* 기본 예시 명령어 형식

``` bash
docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag
```

::: tip
* [공식 저장소 바로가기](https://hub.docker.com/_/mysql)
* [tag 목록 바로가기](https://hub.docker.com/_/mysql/tags)
:::

* 컨테이너 이름 `mysql` 초기 root 비밀번호 `!test1234` mysql `8.0.38` 버전 으로 설치시 예시

``` bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=!test1234 -d mysql:8.0.38
```

## 초기 세팅

### character-set 변경

* bash 접속

``` bash
docker exec -it mysql /bin/bash
```

* cnf 파일 설정
``` bash
cd /etc/mysql/conf.d
```

``` bash
cat << 'EOF' > /etc/mysql/conf.d/my.cnf
```

::: code-group
```bash [my.cnf]
[client]
default-character-set = utf8mb4

[mysql]
default-character-set = utf8mb4

[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[client]
default-character-set = utf8mb4

[mysql]
default-character-set = utf8mb4

[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
EOF
```
:::

* 컨테이너 재시작
``` bash
docker restart mysql
```

### 데이터 베이스를 생성후 동명의 사용자를 생성하여 모든 권한을 부여

::: tip
아래 예시는 `testuser` 사용자 및 DB 생성을 예시로 합니다.
:::

* bash 접속

``` bash
docker exec -it mysql /bin/bash
```

* mysql console 접속
``` bash
mysql -u root -p
```

* 사용자 생성
``` sql
CREATE USER 'testuser'@'%' IDENTIFIED BY '!testuser1234';
```

* DB 생성
``` sql
CREATE DATABASE testuser;
```

* 권한 부여
``` sql
GRANT aLL PRIVILEGES ON testuser.* TO 'testuser'@'%';
```