# GitLab Runner

::: tip
* 공식 가이드 문서 [바로가기](https://docs.gitlab.com/runner/install/osx.html)
:::

::: warning
GitLab 사설 서버가 필요합니다. [GitLab 세팅](./gitlab.md)을 완료한 것을 전재로 합니다.
:::

## 바이너리 Download
### Intel 기반 MacOS
``` bash
sudo curl --output /usr/local/bin/gitlab-runner "https://s3.dualstack.us-east-1.amazonaws.com/gitlab-runner-downloads/latest/binaries/gitlab-runner-darwin-amd64"
```

### Apple Silicon 기반 MacOS
``` bash
sudo curl --output /usr/local/bin/gitlab-runner "https://s3.dualstack.us-east-1.amazonaws.com/gitlab-runner-downloads/latest/binaries/gitlab-runner-darwin-arm64"
```

## 권한 부여
``` bash
sudo chmod +x /usr/local/bin/gitlab-runner
```

## Runner 생성
Gitlab Web 에서 root 계정으로 로그인 후 `admin > CI/CD > Runners > New instance runner` 를 선택하여 Mac 용 새 Runner 를 생성하고 `The runner authentication token` 을 확인합니다.

## Runner 설치
1. 터미널을 열고 gitlab-runner 를 실행할 유저로 로그인 합니다.
``` bash
su - username
```
2. Runner 설치
``` bash
cd ~
gitlab-runner install
```

3. Runner 등록
``` bash
gitlab-runner register
```

``` txt
Enter the GitLab instance URL (for example, https://gitlab.com/):
> http://gitlab

Enter the registration token:
> Runner 생성 단계에서 확인한 Token 정보

Enter a name for the runner. This is stored only in the local config.toml file:
> 러너 이름 입력

Enter an executor: ssh, parallels, virtualbox, docker, docker-windows, docker+machine, kubernetes, shell, docker-autoscaler, instance, custom:
> shell
```

4. Runner 실행
``` bash
gitlab-runner start
```

