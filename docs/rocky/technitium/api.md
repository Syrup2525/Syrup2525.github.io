# Technitium DNS

::: tip
[공식문서 바로가기](https://raw.githubusercontent.com/TechnitiumSoftware/DnsServer/master/APIDOCS.mㅓ)
:::

::: tip
`Technitium DNS` 가 `Primary`, `Secondary` 형태로 구축되어 있다고 가정하고 `API`를 활용하는 방법을 기술합니다.
:::
---

::: warning
- 먼저 `Web UI` 등에서 `API Token` 을 발급해야 합니다.
- 본문에서는 `https` 사용을 위해 `8443` 포트를 지정했지만 `http` 를 사용하는 경우 `5380` 포트를 지정하여야 합니다.
- 본문에서는 내부 내트워크간 사설 IP 및 사설 인증서 사용으로 `-k` 옵션으로 인증서 검증 안함을 사용했습니다.
:::

::: tip
다음 각 용어를 설명합니다.
- `Primary_IP` Primary 머신의 사설 ip 또는 Primary API URL
- `Primary_Token` Primary 에서 발급 받은 토큰
- `Secondary_IP` Secondary 머신의 사설 ip 또는 Secondary API URL
- `Secondary_Token` Secondary 에서 발급 받은 토큰
- `Secondary_DNS_domain` Secondary DNS 도메인 (예. dns2.example.com)
:::

## Zone
### 생성
#### Primary 설정
1. zone 생성
``` bash
curl -k -X POST \
  "https://Primary_IP:8443/api/zones/create?\
token=Primary_Token\
&zone=example.com\
&type=Primary\
&useSoaSerialDateScheme=true"
```

2. `notify` 설정 및 `zoneTransfer` 설정
``` bash
curl -k \
  "https://Primary_IP:8443/api/zones/options/set\
?token=Primary_Token\
&zone=example.com\
&notify=SpecifiedNameServers\
&notifyNameServers=Secondary_IP\
&zoneTransfer=UseSpecifiedNetworkACL\
&zoneTransferNetworkACL=Secondary_IP"
```

3. NS 레코드 추가
``` bash
curl -k \
  "https://Primary_IP:8443/api/zones/records/add\
?token=Primary_Token\
&domain=example.com\
&type=NS
&nameServer=dns2.isnungdata.net"
```

#### Secondary 설정
1. zone 생성
``` bash
curl -k -X POST \
  "https://Secondary_IP:8443/api/zones/create\
?token=Secondary_Token\
&zone=example.com\
&type=Secondary\
&primaryNameServerAddresses=Primary_IP"
```

2. 설정 반영 (Resync)
``` bash
curl -k \
  "https://Secondary_IP:8443/api/zones/resync\
?token=Primary_Token\
&zone=example.com"
```

### 조회
``` bash
curl -k \
  "https://Primary_IP:8443/api/zones/list\
?token=Primary_Token"
```

### 삭제
``` bash
curl -k -X POST \
  "https://Secondary_IP:8443/api/zones/delete\
?token=Secondary_Token\
&zone=example.com"
```

## Recored
### 추가
``` bash
curl -k \
  "https://Primary_IP:8443/api/zones/records/add\
?token=Primary_Token\
&domain=example.com\
&type=A
&IPAddress=222.231.63.241"
```

### 조회
``` bash
curl -k \
  "https://Primary_IP:8443/api/zones/records/get\
?token=Primary_Token\
&domain=example.com\
&listZone=true"
```

<!-- ### 삭제
``` bash
curl -k -X POST \
  "https://Primary_IP:8443/api/zones/records/delete\
?token=Primary_Token\
&domain=example.com\
&zone=example.com\
&type=A\
&value=127.0.0.1"
``` -->