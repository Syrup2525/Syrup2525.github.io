# Procedure Delete

::: tip
[GitHub](https://github.com/Syrup2525/mysql-proc-delete)
:::

::: warning
`MySQL 8` 기준으로 작성되었습니다.
:::

[[toc]]

## Motivation
DB 에 존재하는 `FILTER_KEYWORD` 를 포함한 `Stored Procedure` 를 삭제 하는 `Container` 기반 도구 입니다.

예를들어 `FILTER_KEYWORD`=`v0_13_2` 로 지정했을 다음처럼 동작합니다.

| SOURCE DB | TARGET DB |
| --- | --- |
| Some_Procedure_A_v0_13_2 | Some_Procedure_C_v0_13_0 |
| Some_Procedure_B_v0_13_2 | |
| Some_Procedure_C_v0_13_0 | |

## Quick Start
``` bash
docker run --rm \
  -e MYSQL_HOST=MYSQL_HOST \
  -e MYSQL_PORT=3306 \
  -e MYSQL_USER=MYSQL_USER \
  -e MYSQL_PASSWORD=MYSQL_PASSWORD \
  -e MYSQL_DATABASE=MYSQL_DATABASE \
  -e FILTER_KEYWORD=v0_13_2 \
  syrup2525/proc-delete:latest
```
> - `MYSQL_HOST` MySQL HOST 를 입력합니다 예를들어 `example.com`
> - `MYSQL_PORT` MySQL PORT 를 입력합니다 예를들어 `3306`
> - `MYSQL_USER` MySQL USERT 를 입력합니다 예를들어 `tesetuser`
> - `MYSQL_PASSWORD` MySQL PASSWORD 를 입력합니다 예를들어 `tesetuserpassword`
> - `MYSQL_DATABASE` MySQL DATABASE 를 입력합니다 예를들어 `testdatabase`
> - `FILTER_KEYWORD` 삭제할 프로시저가 포함하고있는 문자열을 입력합니다 예를들어 `v0_13_2`

## Usage
### Docker Compose
::: code-group
``` yaml [docker-compose.yaml]
version: '3'

services:
  proc-delete:
    image: syrup2525/proc-delete:latest
    container_name: proc-delete
    environment:
      MYSQL_HOST: 'MYSQL_HOST'
      MYSQL_PORT: 3306
      MYSQL_USER: 'MYSQL_USER'
      MYSQL_PASSWORD: 'MYSQL_PASSWORD'
      MYSQL_DATABASE: 'MYSQL_DATABASE'
      FILTER_KEYWORD: 'v0_13_2'
```
:::
> - `MYSQL_HOST` MySQL HOST 를 입력합니다 예를들어 `example.com`
> - `MYSQL_PORT` MySQL PORT 를 입력합니다 예를들어 `3306`
> - `MYSQL_USER` MySQL USERT 를 입력합니다 예를들어 `tesetuser`
> - `MYSQL_PASSWORD` MySQL PASSWORD 를 입력합니다 예를들어 `tesetuserpassword`
> - `MYSQL_DATABASE` MySQL DATABASE 를 입력합니다 예를들어 `testdatabase`
> - `FILTER_KEYWORD` 삭제할 프로시저가 포함하고있는 문자열을 입력합니다 예를들어 `v0_13_2`

``` bash
docker compose up
```

### Run directly
::: tip
직접 `local` 환경에서 실행하는 방법을 설명합니다.
:::

#### 1. git clone
``` bash
git clone https://github.com/Syrup2525/mysql-proc-delete.git 
```

#### 2. Container build
``` bash
docker build -t proc-delete . 
```

#### 3. Create .env 
``` txt
# 삭제 프로시저가 존재하는 DB)
MYSQL_HOST=source.mysql.com
MYSQL_PORT=3306
MYSQL_USER=testuser
MYSQL_PASSWORD=userpassword
MYSQL_DATABASE=testdb

# 필터 키워드 (프로시저명에 이 문자열이 포함된 경우에만 삭제)
FILTER_KEYWORD=v0_13_2

```

#### 4. Run Container
``` bash
docker run --rm --env-file .env -v "$(pwd)/output:/tmp" proc-delete
```
