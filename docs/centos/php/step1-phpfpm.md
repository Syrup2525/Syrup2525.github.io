# php-fpm 설치

## php-fpm 설치

* REMI 리포지트리 추가

    ```bash
    yum install -y https://rpms.remirepo.net/enterprise/remi-release-7.rpm
    ```

* php-fpm 7.4 설치

    ```bash
    yum install -y php74-php-fpm php74-php-common php74-php-mysqlnd php74-php-mbstring php74-php-pdo php74-php-xml
    ```

## 설정

* www.conf 파일 수정

    ```bash
    vi /etc/opt/remi/php74/php-fpm.d/www.conf
    ```

    ::: code-group
    ```bash [www.conf]
    user = nginx 
    group = nginx
    listen.owner = nginx
    listen.group = nginx
    ```
    :::

* php.ini 파일 수정 (필요한 경우)

    짧은 태그 설정

    ```bash
    vi /etc/opt/remi/php74/php.ini
    ```

    ::: code-group
    ```bash [php.ini]
    short_open_tag=On
    ```
    :::

* 서비스 시작 및 등록

    ```bash
    systemctl start php74-php-fpm
    ```

    ```bash
    systemctl enable php74-php-fpm
    ```
