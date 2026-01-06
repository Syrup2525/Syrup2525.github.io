# Redis

### 설치
``` bash
sudo dnf -y update
sudo dnf -y install redis
```

``` bash
sudo systemctl start redis
sudo systemctl enable redis
```

### 동작 테스트
``` bash
redis-cli ping
```

``` bash
sudo ss -lntp | grep 6379
```