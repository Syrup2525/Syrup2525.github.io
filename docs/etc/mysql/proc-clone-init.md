# Procedure Clone Init

::: tip
[GitHub](https://github.com/Syrup2525/mysql-proc-clone-init)
:::

::: warning
`MySQL 8` 기준으로 작성되었습니다.
:::

[[toc]]

## Motivation
`Stored Procedure` 이름에 접미사를 붙여서 복제하는 `Container` 기반 도구입니다.

예를들어 `VERSION_SUFFIX` 를 `_v0_13_0` 로 지정한 경우 다음처럼 동작합니다.

| 실행 이전 | 실행 이후 |
| --- | --- |
| Some_Procedure_A | Some_Procedure_A |
| Some_Procedure_B | `Some_Procedure_A_v0_13_0` |
| Some_Procedure_C | Some_Procedure_B |
| | `Some_Procedure_B_v0_13_0` |
| | Some_Procedure_C |
| | `Some_Procedure_C_v0_13_0` |

## Quick Start
``` bash
docker run --rm \
  -e MYSQL_HOST=MYSQL_HOST \
  -e MYSQL_PORT=3306 \
  -e MYSQL_USER=MYSQL_USER \
  -e MYSQL_PASSWORD=MYSQL_PASSWORD \
  -e MYSQL_DATABASE=MYSQL_DATABASE \
  -e VERSION_SUFFIX=_v0_13_0 \
  syrup2525/proc-clone-init:latest
```
> - `MYSQL_HOST` MySQL HOST 를 입력합니다 예를들어 `example.com`
> - `MYSQL_PORT` MySQL PORT 를 입력합니다 예를들어 `3306`
> - `MYSQL_USER` MySQL USERT 를 입력합니다 예를들어 `tesetuser`
> - `MYSQL_PASSWORD` MySQL PASSWORD 를 입력합니다 예를들어 `tesetuserpassword`
> - `MYSQL_DATABASE` MySQL DATABASE 를 입력합니다 예를들어 `testdatabase`
> - `VERSION_SUFFIX` 접미사로 붙일 문자열을 입력합니다 예를들어 `_v0_13_0`

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
      VERSION_SUFFIX: '_v0_13_0'
```
:::

> - `MYSQL_HOST` MySQL HOST 를 입력합니다 예를들어 `example.com`
> - `MYSQL_PORT` MySQL PORT 를 입력합니다 예를들어 `3306`
> - `MYSQL_USER` MySQL USERT 를 입력합니다 예를들어 `tesetuser`
> - `MYSQL_PASSWORD` MySQL PASSWORD 를 입력합니다 예를들어 `tesetuserpassword`
> - `MYSQL_DATABASE` MySQL DATABASE 를 입력합니다 예를들어 `testdatabase`
> - `VERSION_SUFFIX` 접미사로 붙일 문자열을 입력합니다 예를들어 `_v0_13_0`

``` bash
docker compose up
```

### Run directly
::: tip
직접 `local` 환경에서 실행하는 방법을 설명합니다.
:::

#### 1. git clone
``` bash
git clone https://github.com/Syrup2525/mysql-proc-clone-init.git 
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

VERSION_SUFFIX=_v0_13_0
```

#### 4. Run Container
``` bash
docker run --rm --env-file .env -v "$(pwd)/output:/tmp" proc-cloner
```
