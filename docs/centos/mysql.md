#  mysql 설치

## mysql 설치

* [여기](https://dev.mysql.com/downloads/repo/yum/) 에서 Red Hat Enterprise Linux 7 에 대응되는 버전 확인

* 저장소 설치
    ```
    yum install https://dev.mysql.com/get/mysql80-community-release-el7-10.noarch.rpm
    ```

* mysql 설치
    ```
    yum install mysql-server
    ```

* mysql 실행 및 서비스 등록
    ```
    systemctl start mysqld
    ```
    ```
    systemctl enable mysqld
    ```

* 설치 확인
    ```
    mysql --version
    ```

## mysql 초기 설정

* 임시 비밀번호 확인
    ```
    grep 'temporary password' /var/log/mysqld.log
    ```

* mysql 초기 설정 진행
    ```
    mysql_secure_installation
    ```

## mysql 기본 character-set 설정

* my.cnf 파일 수정
    ```
    vi /etc/my.cnf
    ```
    ```
    [mysqld]
    character-set-server=utf8mb4
    collation-server=utf8mb4_unicode_ci
    ```

* mysql 재실행
    ```
    systemctl restart mysqld
    ```

* 설정 확인
    ```
    mysql -u root -p
    ```
    ```
    show variables like 'char%';
    ```

## root 유저 비밀번호 변경 (옵션)

* 정책 확인
    ```
    show variables like 'validate_password%';
    ```

* validate_password_policy 정책 낮음으로 설정
    ```
    set global validate_password.policy=LOW;
    ```

* 비밀번호 변경
    ```
    ALTER USER 'root'@'localhost' IDENTIFIED BY '원하는비밀번호';
    ```

## 동명의 데이터베이스를 만들고 권한 부여하기 (옵션)

* 유저 생성
    ```
    CREATE USER '유저이름'@'%' IDENTIFIED BY '유저패스워드';
    ```

* DB 생성
    ```
    CREATE DATABASE IF NOT EXISTS 유저이름;
    ```

* 권한 부여
    ```
    GRANT ALL PRIVILEGES ON 유저이름.* TO '유저이름'@'%';
    ```