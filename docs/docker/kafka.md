# kafka 설치

## Docker run

::: tip
[버전 목록 바로가기](https://kafka.apache.org/downloads)
:::

아래는 `3.7.1` 버전 예시

``` bash
docker run --name kafka -d -p 9092:9092 apache/kafka:3.7.1
```

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