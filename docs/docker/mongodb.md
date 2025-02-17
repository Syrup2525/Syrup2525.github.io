# MongoDB 설치

## Docker run

::: tip
[공식 저장소 바로가기](https://hub.docker.com/_/mongo)
:::

mongo 이미지와 함께 `mongoadmin` 아이디, `secret` 패스워드를 가진 슈퍼유저를 생성

``` bash
docker run -d -p 27017:27017 --name mongo \
	-e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
	-e MONGO_INITDB_ROOT_PASSWORD=secret \
	mongo
```

## shell 접속

::: tip
* mongo 6.0 이상 `mongosh`
* mongo 6.0 미만 `mongo`
:::

``` bash
mongosh --username mongoadmin --password secret
```

### 데이터 베이스를 생성후 동명의 사용자를 생성하여 모든 권한을 부여

::: tip
아래 예시는 `testuser` 사용자 및 DB 생성을 예시로 합니다.
:::

``` bash
use testuser
```

``` javascript
db.createUser({
  user: "testuser",
  pwd: "testpassword",
  roles: [{ role: "dbOwner", db: "testuser" }]
});
```