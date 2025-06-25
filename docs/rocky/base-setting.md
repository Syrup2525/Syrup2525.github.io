# 기본 설정

[[toc]]

## 시스템 시간 변경
1. 현재 시간대 확인하기
``` bash
timedatectl
```

2. 사용 가능한 시간대 목록 확인
``` bash
timedatectl list-timezones
```

3. 한국 시간(Asia/Seoul)으로 변경
``` bash
sudo timedatectl set-timezone Asia/Seoul
```

4. 변경 결과 확인
``` bash
timedatectl
```
