# kafka 설치

## Docker run

::: tip
[버전 목록 바로가기](https://kafka.apache.org/downloads)
:::

아래는 `3.7.1` 버전 예시

``` bash
docker run --name kafka -d -p 9092:9092 apache/kafka:3.7.1
```

## docker-compose 사용
::: tip
[Kafka Docker Image Usage Guide](https://github.com/apache/kafka/blob/trunk/docker/examples/README.md) 공식문서 예제파일
:::

기존 예재파일 (single node)

``` yaml
version: '2'
services:
  broker:
    image: apache/kafka
    hostname: broker
    container_name: broker
    ports:
      - '9092:9092'
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT_HOST://localhost:9092,PLAINTEXT://broker:19092'
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@broker:29093'
      KAFKA_LISTENERS: 'CONTROLLER://:29093,PLAINTEXT_HOST://:9092,PLAINTEXT://:19092'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      CLUSTER_ID: '4L6g3nShT-eMCtK--X86sw'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
```

아래는 `localhost` 의 경우 `INTERNAL` 로 정의하여 `9092` 포트로 수신, `192.168.1.3` 의 경우 `EXTERNAL` 로 정의하여 `9093` 포트로 수신하는 예제

| PROTOCOL MAP       | host (ip)    | port |
| ------------------ | ------------ | ---- |
| INTERNAL:PLAINTEXT | localhost    | 9092 |
| EXTERNAL:PLAINTEXT | 192.168.1.3  | 9093 |

``` yaml
version: '2'
services:
  broker:
    image: apache/kafka
    hostname: broker
    container_name: broker
    ports:
      - '9092:9092'
      - '9093:9093'
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,INTERNAL:PLAINTEXT,EXTERNAL:PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: 'INTERNAL://localhost:9092,PLAINTEXT://broker:19092,EXTERNAL://192.168.1.3:9093'
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@broker:29093'
      KAFKA_LISTENERS: 'CONTROLLER://:29093,INTERNAL://:9092,PLAINTEXT://:19092,EXTERNAL://:9093'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      CLUSTER_ID: '4L6g3nShT-eMCtK--X86sw'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
```

::: tip
::: details confluentinc/cp-kafka 이미지 사용하기

`/docker/kafka/data/broker` data volume 권한 수정

``` bash
sudo chown -R 1000:1000 /docker/kafka/data/broker
sudo chmod -R 755 /docker/kafka/data/broker
```

::: code-group
``` conf [docker-compose.yml]
services:
  broker:
    image: confluentinc/cp-kafka:latest
    hostname: broker
    ports:
      - '9092:9092'
      - '9093:9093'
    networks:
      - network
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,INTERNAL:PLAINTEXT,EXTERNAL:PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: 'INTERNAL://localhost:9092,PLAINTEXT://broker:19092,EXTERNAL://broker:9093'
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@broker:29093'
      KAFKA_LISTENERS: 'CONTROLLER://:29093,INTERNAL://:9092,PLAINTEXT://:19092,EXTERNAL://:9093'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_LOG_DIRS: /var/lib/kafka/data
      KAFKA_KRAFT_MODE: 'true'
      CLUSTER_ID: '4L6g3nShT-eMCtK--X86sw'
      TZ: 'Asia/Seoul'
    volumes:
      - /docker/kafka/data/broker:/var/lib/kafka/data

networks:
  network:
    driver: overlay
    attachable: true
```
:::

## 기본 명령어
::: tip
bash 접속
``` bash
docker exec -it kafka /bin/bash
```
:::

### topics
* 토픽 목록 조회
``` bash
/opt/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

* 토픽 생성
``` bash
/opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic <topic_name> --partitions <number_of_partitions> --replication-factor <number_of_replication_factor>
```
> * `topic_name` 토픽 이름
> * `number_of_partitions` 토픽의 파티션 수
> * `number_of_replication_factor` 레플리카 수

* 토픽 삭제
``` bash
/opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic <topic_name>
```

### consumer
* 메시지 소비 (consume)
``` bash
/opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic <topic_name>
```

* 컨슈머 그룹 현재 상태 조회

``` bash
/opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group <consumer_group_id> --describe 
```
> * `GROUP` consumer 그룹의 ID
> * `TOPIC` 해당 consumer 그룹이 구독중인 토픽의 이름 
> * `PARTITION` 토픽 내에서 해당 파티션의 숫자
> * `CURRENT-OFFSET` 현재 consumer 그룹의 오프셋 커밋 위치
> * `LOG-END-OFFSET` 로그 끝 오프셋, 가장 최근에 기록된 메시지의 오프셋 위치
> * `LAG` 처리되지 않은 메시지 개수 (`CURRENT-OFFSET` 와 `LOG-END-OFFSET` 의 차이)
> * `CONSUMER-ID` consumer 고유 식별자
> * `HOST` consumer 가 실행중인 호스트의 IP 주소
> * `CLIENT-ID` consumer 클라이언트 식별자

### producer
* 메시지 생성 (producer)
``` bash
/opt/kafka/bin/kafka-console-producer.sh --broker-list localhost:9092 --topic <topic_name>
```