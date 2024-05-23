# 개발 환경 구성

## node 및 npm 설치

* node 설치

    ```bash
    yum install nodejs
    ```
    ```
    node --version
    ```

* npm 설치

    ```bash
    yum install npm
    ```
    ```bash
    npm --version
    ```

## npm global module 설치 (sudo 권한 필요)

* pm2 설치 (node 프로세스 매니저)

    ```bash
    npm install -g pm2
    ```

* n 설치 (node 버전 관리)

    ```bash
    npm install -g n
    ```

## node 특정 버전 설치 (sudo 권한 필요)

* node 원하는 버전 설치

    * 특정 버전 설치

        ```bash
        n 16.19.1
        ```

    * lts 설치 

        ```bash
        n lts
        ```

    * latest 설치

        ```bash
        n latest
        ```

* node 버전 확인

    ```bash
    node --version
    ```

## node example 파일 작성

* 폴더 생성

    ```bash
    mkdir express
    ```
    ```bash
    cd express
    ```

* express 모듈 설치

    ```bash
    npm i express
    ```

* 예제 코드 작성

    ```bash
    vi index.js
    ```
    ```js
    const express = require('express')
    const app = express()
    const port = 3000

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
    ```

* express example 실행 확인

    ```bash
    node index.js
    ```

* pm2 서비스 등록

    ```bash
    pm2 start index.js
    ```

* 코드 실행 확인

    ```bash
    curl -X GET localhost:3000
    ```
