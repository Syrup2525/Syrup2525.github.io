# Procedure Clone

::: tip
[GitHub](https://github.com/Syrup2525/mysql-proc-clone)
:::

::: warning
`MySQL 8` 기준으로 작성되었습니다.
:::

[[toc]]

## Motivation
`OLD_SUFFIX` 로 끝나는 `Stored Procedure` 를 대상으로 `OLD_SUFFIX` 접미사를 `NEW_SUFFIX` 로 치환하여 복제하는 `Container` 기반 도구입니다.

예를들어 `OLD_SUFFIX`=`v0_13_0`, `NEW_SUFFIX`=`v0_13_1` 로 지정했을 다음처럼 동작합니다.

| 실행 이전 | 실행 이후 |
| --- | --- |
| Some_Procedure_A_v0_13_0 | Some_Procedure_A_v0_13_0 |
| Some_Procedure_B_v0_13_0 | `Some_Procedure_A_v0_13_1` |
| Some_Procedure_C | Some_Procedure_B_v0_13_0 |
| | `Some_Procedure_B_v0_13_1` |
| | Some_Procedure_C |

## Quick Start
``` bash
docker run --rm \
  -e MYSQL_HOST=MYSQL_HOST \
  -e MYSQL_PORT=3306 \
  -e MYSQL_USER=MYSQL_USER \
  -e MYSQL_PASSWORD=MYSQL_PASSWORD \
  -e MYSQL_DATABASE=MYSQL_DATABASE \
  -e OLD_SUFFIX=v0_13_0 \
  -e NEW_SUFFIX=v0_13_1 \
  syrup2525/proc-clone:latest
```
> - `MYSQL_HOST` MySQL HOST 를 입력합니다 예를들어 `example.com`
> - `MYSQL_PORT` MySQL PORT 를 입력합니다 예를들어 `3306`
> - `MYSQL_USER` MySQL USERT 를 입력합니다 예를들어 `tesetuser`
> - `MYSQL_PASSWORD` MySQL PASSWORD 를 입력합니다 예를들어 `tesetuserpassword`
> - `MYSQL_DATABASE` MySQL DATABASE 를 입력합니다 예를들어 `testdatabase`
> - `OLD_SUFFIX` 복제할 프로시저의 접미사 문자열을 입력합니다 예를들어 `v0_13_0`
> - `NEW_SUFFIX` 복제된 프로시저의 접미사 문자열을 입력합니다 예를들어 `v0_13_1`

## Usage
### Docker Compose
::: code-group
``` yaml [docker-compose.yaml]
version: '3'

services:
  proc-clone-init:
    image: syrup2525/proc-clone-init:latest
    container_name: proc-clone-init
    environment:
      MYSQL_HOST: 'MYSQL_HOST'
      MYSQL_PORT: 3306
      MYSQL_USER: 'MYSQL_USER'
      MYSQL_PASSWORD: 'MYSQL_PASSWORD'
      MYSQL_DATABASE: 'MYSQL_DATABASE'
      OLD_SUFFIX: 'v0_13_0'
      NEW_SUFFIX: 'v0_13_1'
```
:::

> - `MYSQL_HOST` MySQL HOST 를 입력합니다. 예를들어 `example.com`
> - `MYSQL_PORT` MySQL PORT 를 입력합니다. 예를들어 `3306`
> - `MYSQL_USER` MySQL USERT 를 입력합니다. 예를들어 `tesetuser`
> - `MYSQL_PASSWORD` MySQL PASSWORD 를 입력합니다. 예를들어 `tesetuserpassword`
> - `MYSQL_DATABASE` MySQL DATABASE 를 입력합니다. 예를들어 `testdatabase`
> - `OLD_SUFFIX` 복제할 프로시저의 접미사 문자열을 입력합니다. 예를들어 `v0_13_0`
> - `NEW_SUFFIX` 복제된 프로시저의 접미사 문자열을 입력합니다. 예를들어 `v0_13_1`

``` bash
docker compose up
```

### Run directly
::: tip
직접 `local` 환경에서 실행하는 방법을 설명합니다.
:::

#### 1. git clone
``` bash
git clone https://github.com/Syrup2525/mysql-proc-clone.git 
```

#### 2. Container build
``` bash
docker build -t proc-cloner . 
```

#### 3. Create .env 
``` txt
MYSQL_HOST=mysql.example.com
MYSQL_PORT=3306
MYSQL_USER=user
MYSQL_PASSWORD=password
MYSQL_DATABASE=somedatabase

OLD_SUFFIX=_v0_13_0
NEW_SUFFIX=_v0_13_1
```

#### 4. Run Container
``` bash
docker run --rm --env-file .env -v "$(pwd)/output:/tmp" proc-cloner
```
