# Portainer CE 설치

## Portainer CE 설치
::: tip
[공식 문서 바로가기](https://docs.portainer.io/start/install-ce/server/docker/linux)
:::

::: warning
2.19.5 기준 Portainer 자체 버그로인해 `Docker 26 버전` 사용시 컨테이너 bash 사용이 불가능합니다. 컨테이너 bash 를 Portainer 에서 사용을 원하면 `Docker 25 버전` 으로 설치해주세요.
:::

볼륨 생성
``` bash
sudo docker volume create portainer_data
```

컨테이너 실행
::: tip
* http port `9000`
* https port `9443`
:::
``` bash
sudo docker run -d -p 8000:8000 -p 9443:9443 -p 9000:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
```

## Nginx 리버스 프록시 환경 설정 방법
::: tip
아래는 https://example.domain.com/portainer 로 URL 을 설정하는 방법을 설명합니다.
:::

컨테이너 실행
::: tip
`--base-url` 옵션을 추가합니다.

[cli 옵션 목록](https://docs.portainer.io/advanced/cli)
:::
``` bash
sudo docker run -d -p 8000:8000 -p 9443:9443 -p 9000:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest --base-url /portainer
```

* Nginx config 설정
``` bash
sudo vi /etc/nginx/conf.d/default.conf
```

* 아래의 예제를 conf 파일 적절한 곳에 삽입합니다.
::: code-group
```conf [default.conf]
location /portainer {
    set $upstream_endpoint http://127.0.0.1:9000;
    rewrite ^/portainer/(.*) /$1 break;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_pass $upstream_endpoint;
}

location /portainer/api/websocket/exec {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;

    proxy_pass http://127.0.0.1:9000/api/websocket/exec;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```
:::

* Nginx 재시작 (conf 변경 내용 반영)
``` bash
sudo nginx -t
```

``` bash
sudo systemctl restart nginx
```