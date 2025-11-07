::: tip
`p7b`, `pfx` 파일을 리눅스에서 사용 가능한 `fullchain tls` 와 `key` 파일로 변환하는 방법을 설명합니다.
:::
::: tip
`Docker` 가 필요합니다.
:::

docker 실행
``` bash
docker run --rm -it -v "$(pwd)":/work -w /work alpine:3.16 sh
```

개인키 추출
``` bash
openssl pkcs12 -in WILD.gobikebank.com.pfx -nocerts -out tls.key.encrypted
```

비밀번호 제거
``` bash
openssl rsa -in tls.key.encrypted -out tls.key
```

서버 인증서 추출
``` bash
openssl pkcs12 -in WILD.gobikebank.com.pfx -clcerts -nokeys -out server.crt
```

p7b (CA 체인) 파일을 PEM 형식으로 변환
``` bash
openssl pkcs7 -print_certs -in DigiCertCABundle.p7b -out ca-chain.crt
```

`ca-chain` 파일 검증
``` bash
openssl x509 -in ca-chain.crt -noout -subject -issuer
```

서버 인증서 + 체인 합치기 (풀체인 만들기)
``` bash
cat server.crt ca-chain.crt > tls.crt
```