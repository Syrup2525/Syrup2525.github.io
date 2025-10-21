::: tip
`DNS-01` 을 이용하여 `Technitium DNS` 온프레미스 환경에서 `acme` 및 `Let's Encrypt` 를 사용하여 SSL/TLS 인증서를 자동으로 발급하고 `rsync` 를 이용, 이중화 되어있는 `Nginx` 에 Reverse Proxy 를 구축하는 방법을 설명합니다.
:::

::: tip
SSL/TLS 인증을 받을 주체 서버를 `Primary`, 그 이외 서버를 `Secondary` 라고 칭합니다.
:::

::: tip
[ACME 공식문서](https://github.com/acmesh-official/acme.sh)
:::

## `Primary` `Secondary` 공통
1. 필요 패키지 설치 
``` bash
dnf install -y curl rsync nginx
```

2. nginx 실행 및 enable 처리
``` bash
systemctl start nginx
systemctl enable nginx
```

3. 인증서 경로 준비
``` bash
mkdir -p /etc/nginx/ssl
```

4. Nginx HTTP 서버 블록 생성
``` bash
vi /etc/nginx/conf.d/example.com.conf
```
``` txt
# /etc/nginx/conf.d/example.com.conf
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/nginx/ssl/example.com/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/example.com/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}
```

5. Nginx 리로드
``` bash
sudo nginx -t && sudo systemctl reload nginx
```

## Primary
1. acme.sh 설치
``` bash
curl https://get.acme.sh | sh
```
> acme.sh 설치시 cron 자동 등록됨

2. 현재 shell 에 환경변수 파일 로드
``` bash
source ~/.bashrc 2>/dev/null || source ~/.bash_profile 2>/dev/null || true
```

3. acme.sh의 기본 발급 기관을 Let’s Encrypt로 지정
``` bash
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt
```

4. DNS Server 및 Token 환경변수 지정
``` bash
export Technitium_Server='https://dns.example.com:8443'
export Technitium_Token='토큰값'
```

::: tip
- 처음에 export Technitium_Server=... export Technitium_Token=... 하고 발급을 한 번 하면,
- acme.sh가 내부적으로 ~/.acme.sh/account.conf 에 자동 저장
:::

5. 스테이징으로 리허설
``` bash
~/.acme.sh/acme.sh \
  --issue --server letsencrypt --test \
  --dns dns_technitium --dnssleep 60 \
  -d example.com -d www.example.com
```

::: details SSL 인증서 무시 옵션
``` txt
~/.acme.sh/acme.sh \
  --issue --server letsencrypt --test \
  --dns dns_technitium --dnssleep 60 \
  --insecure \ // [!code ++]
  -d example.com -d www.example.com
```
:::

6. 본 발급
``` bash
~/.acme.sh/acme.sh \
  --issue --server letsencrypt \
  --dns dns_technitium --dnssleep 60 \ 
  -d example.com
```

7. SSH 무비번 준비
> #### Secondary 에서 실행
> **Key 생성을 위해 Secondary 에서 root 비밀번호 접근 잠시 허용**
> ``` bash
> vi /etc/ssh/sshd_config
> ```
>
> ``` ini
> PermitRootLogin yes
> 
> PasswordAuthentication yes
> ```
>
> ``` bash
> sudo systemctl reload sshd
> ```

> #### Primary 에서 실행 
> Key 생성
> ``` bash
> ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519
> ssh-copy-id -i ~/.ssh/id_ed25519.pub root@세컨더리_IP
> ```

> #### Secondary 에서 실행
> **설정 원복**
> ``` bash
> vi /etc/ssh/sshd_config
> ```
> 
> ``` ini
> PermitRootLogin prohibit-password
> 
> PasswordAuthentication no
> ```
>
> ``` bash
> sudo systemctl reload sshd
> ```

> #### Primary 에서 실행 
> 테스트
> ``` bash
> ssh -i ~/.ssh/id_ed25519 root@세컨더리_IP 'echo ok'
> ```

8. 동기화 스크립트 생성
``` bash
sudo vi /usr/local/bin/sync-nginx-certs.sh
```
``` sh
#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:?Usage: sync-nginx-certs.sh <domain> [secondary1] [secondary2...]}"
shift || true

NGINX_CERT_DIR="/etc/nginx/ssl"
SRC_DIR="${NGINX_CERT_DIR}/${DOMAIN}"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "[-] ${SRC_DIR} not found"; exit 1
fi

# 권한 정돈(SELinux 없음)
chown -R root:root "$SRC_DIR"
chmod 600 "${SRC_DIR}/key.pem"  || true
chmod 644 "${SRC_DIR}/cert.pem" || true

# 프라이머리 nginx 테스트/리로드
if nginx -t; then
  systemctl reload nginx
else
  echo "[!] nginx -t failed (primary)"
fi

# 세컨더리들에 동기화
for PEER in "$@"; do
  # 원격 경로 보장
  ssh -o StrictHostKeyChecking=no "${PEER}" "sudo mkdir -p '${SRC_DIR}'"

  # rsync 전송(권한/타임스탬프 유지)
  rsync -a --delete -e "ssh -o StrictHostKeyChecking=no" "${SRC_DIR}/" "${PEER}:${SRC_DIR}/"

  # 원격 권한 정돈 및 nginx 리로드
  ssh -o StrictHostKeyChecking=no "${PEER}" \
    "sudo chown -R root:root '${SRC_DIR}'; \
     sudo chmod 600 '${SRC_DIR}/key.pem'  || true; \
     sudo chmod 644 '${SRC_DIR}/cert.pem' || true; \
     sudo nginx -t && sudo systemctl reload nginx || echo '[!] nginx -t failed (secondary: ${PEER})'"
done
```
``` bash
sudo chmod +x /usr/local/bin/sync-nginx-certs.sh
```

9. 설치
``` bash
~/.acme.sh/acme.sh \
  --install-cert -d example.com \
  --key-file       /etc/nginx/ssl/example.com/key.pem \
  --fullchain-file /etc/nginx/ssl/example.com/cert.pem \
  --reloadcmd     "/usr/local/bin/sync-nginx-certs.sh example.com root@세컨더리_IP"
```

::: tip
Secondary 가 여러개인 경우
``` bash
~/.acme.sh/acme.sh \
  --install-cert -d example.com \
  --key-file       /etc/nginx/ssl/example.com/key.pem \
  --fullchain-file /etc/nginx/ssl/example.com/cert.pem \
  --reloadcmd     "/usr/local/bin/sync-nginx-certs.sh example.com root@세컨더리_IP1 root@세컨더리_IP2 root@세컨더리_IP3"
```
:::

::: tip
acme 등록된 도메인 제거
``` bash
~/.acme.sh/acme.sh --remove -d example.com
```
> - `-d` 에 지정한 도메인이 **대표 도메인(primary)** 인 인증서가 삭제
> - 예를 들어 example.com 과 www.example.com 을 같이 발급했을 경우, example.com 을 지정하면 두 개 다 같이 제거
> - 삭제되면 ~/.acme.sh/example.com/ 디렉터리와 account.conf 의 등록 정보가 정리

conf 파일 제거
``` bash
sudo rm -rf /etc/nginx/ssl/example.com
```

Nginx 리로드
``` bash
sudo nginx -t && sudo systemctl reload nginx
```
:::
