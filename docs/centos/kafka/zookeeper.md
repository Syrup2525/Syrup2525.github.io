# Kafka 환경 구성 (Kraft)

## JAVA 설치 (필요한 경우)
* JAVA 설치
    ```bash
    yum install java-1.8.0-openjdk
    ```

* JAVA 설치 확인
    ```bash
    java -version
    ```

## Kafka 설치
* wget 설치 (필요한 경우) 
    ```bash
    yum install wget
    ```

* kafka 다운
    ```bash
    wget https://downloads.apache.org/kafka/3.5.1/kafka_2.13-3.5.1.tgz
    ```

* 압축 해제
    ```bash
    tar xvf kafka_2.13-3.5.1.tgz
    ```

* 심볼릭 링크 생성
    ```bash
    ln -s kafka_2.13-3.5.1 kafka
    ```

## kafka config 파일 수정
* IP 확인 (사설 IP 등으로 설정을 원하는 경우, localhost 일때는 필요없음)
    ```bash
    ifconfig
    ```

* ifconfig Command not found 시 net-tools 설치
    ```bash
    yum install net-tools
    ```

* server.properties 수정
    ```bash
    vi kafka/config/server.properties
    ```

    ::: code-group
    ```bash [server.properties]
    broker.id=1
    listeners=PLAINTEXT://<IP>:9092
    advertised.listeners=PLAINTEXT://<IP>:9092
    ```
    :::

## 테스트
* zookeeper 실행
    ```bash
    kafka/bin/zookeeper-server-start.sh kafka/config/zookeeper.properties
    ```

* kafka (별도 터미널에서) 실행
    ```bash
    kafka/bin/kafka-server-start.sh kafka/config/server.properties
    ```

## 서비스 등록
### zookeeper
* zookeeper 스크립트 작성
    ```bash
    vi /usr/lib/systemd/system/zookeeper.service
    ```

    ::: code-group
    ```bash [zookeeper.service]
    [Unit]
    Description=zookeeper
    After=network.target

    [Service]
    Type=forking
    User=user
    Group=user
    SyslogIdentifier=zookeeper
    WorkingDirectory=/home/user/kafka
    Restart=always
    RestartSec=0s
    ExecStart=/home/user/kafka/bin/zookeeper-server-start.sh /home/user/kafka/config/zookeeper.properties
    ExecStop=/home/user/kafka/bin/zookeeper-server-stop.sh

    [Install]
    WantedBy=multi-user.target
    ```
    :::

* zookeeper 서비스 등록 및 시작
    ```bash
    systemctl start zookeeper
    ```
    ```bash
    systemctl status zookeeper
    ```
    ```bash
    systemctl enable zookeeper
    ```

### kafka
* kafka 스크립트 작성
    ```bash
    vi /usr/lib/systemd/system/kafka.service
    ```

    ::: code-group
    ```bash [kafka.service]
    [Unit]
    Description=kafka
    After=network.target

    [Service]
    Type=simple
    User=user
    Group=user
    SyslogIdentifier=kafka
    WorkingDirectory=/home/user/kafka
    Restart=always
    RestartSec=0s
    ExecStart=/home/user/kafka/bin/kafka-server-start.sh /home/user/kafka/config/server.properties
    ExecStop=/home/user/kafka/bin/kafka-server-stop.sh

    [Install]
    WantedBy=multi-user.target
    ```

* kafka 서비스 등록 및 시작
    ```bash
    systemctl start kafka
    ```
    ```bash
    systemctl status kafka
    ```
    ```bash
    systemctl enable kafka
    ```