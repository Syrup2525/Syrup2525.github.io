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
    wget https://downloads.apache.org/kafka/3.6.0/kafka_2.12-3.6.0.tgz
    ```

* 압축 해제
    ```bash
    tar xvf kafka_2.12-3.6.0.tgz
    ```

* 심볼릭 링크 생성
    ```bash
    ln -s kafka_2.12-3.6.0 kafka
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

* Kafka 클러스터 ID 생성 및 포맷
    ```bash
    kafka/bin/kafka-storage.sh random-uuid
    ```

    ```bash
    jaShGO9YR12vntLHlWQQBA 
    ```

    ```bash
    kafka/bin/kafka-storage.sh format -t jaShGO9YR12vntLHlWQQBA -c kafka/config/kraft/server.properties

    ```
    ```bash
    vi kafka/config/kraft/server.properties
    ```

    ::: code-group
    ```bash [server.properties]
    broker.id=1
    listeners=PLAINTEXT://<IP>:9092
    advertised.listeners=PLAINTEXT://<IP>:9092
    ```
    :::

## 테스트
* kafka 실행
    ```bash
    kafka/bin/kafka-server-start.sh kafka/config/kraft/server.properties
    ```

## 서비스 등록
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
    ExecStart=/home/user/kafka/bin/kafka-server-start.sh /home/user/kafka/config/kraft/server.properties
    ExecStop=/home/user/kafka/bin/kafka-server-stop.sh

    [Install]
    WantedBy=multi-user.target
    ```
    :::

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