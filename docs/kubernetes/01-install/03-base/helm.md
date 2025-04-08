# Helm 설치

## Helm 설치
```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

::: tip 
`helm not found. is /usr/local/bin on your $path` 오류 발생시
> `/usr/local/bin` 환경변수 추가
> ::: details `.bash_profile` 을 사용하는 경우
> ``` bash
> export PATH=$PATH:/usr/local/bin
> echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bash_profile
> source ~/.bash_profile
> ```
> :::
> 
> ::: details `.bashrc` 를 사용하는 경우
> ``` bash
> export PATH=$PATH:/usr/local/bin
> echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
> source ~/.bashrc
> ```
:::