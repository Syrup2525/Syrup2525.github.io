# CI/CD

::: warning
해당 문서는 IOS 앱을 GitLab 과 연동하여 자동 배포하는 방법을 설명합니다. 때문에 먼저 아래 사항들이 선행 되어야 합니다.
* GitLab 사설서버 [설치방법](../dockerswarm/gitlab.md)
:::

::: tip
해당 문서에서는 컴파일 및 배포를 수행할 `Machine` 을 `Host Machine`, 실제 소스코드 작업하여 git push 작업을 수행할 머신을 `Local Machine` 으로 정의합니다.
:::

## Host Machine
### GitLab-Runner 설치
* [GitLab-Runner 설치](./gitlab-runner.md) 문서를 참고하여 MacOS `Host Machine` 에 `GitLab-Runner` 를 설치합니다.

### Apple 인증서 설치
::: warning
`Host Machine` 에 [fastlane](https://github.com/fastlane/fastlane) 이 설치 되어 있어야 합니다.
:::

::: warning
[fastlane match](./fastlane-match.md) 를 사용하여 GitLab Repository 에 인증서 발급을 마친것으로 가정합니다. 
:::

`Host Machine` 에서 컴파일 및 배포 하는데 필요한 인증서를 내려받습니다.
``` bash
fastlane match development --readonly
```

* `URL to the git repo containing all the certificates:`
  - gitlab repo URL 입력

* `The bundle identifier(s) of your app (comma-separated string or array of strings):`
  - 앱 Bundle id 입력

* `All required keys, certificates and provisioning profiles are installed 🙌`
  - 해당 문구가 나온다면 성공한것 입니다.

## Local Machine
### 프로젝트에 fastlane 적용

1. .xcodeproj 파일이 위치한 프로젝트 최상위 폴더로 이동 후 프로젝트에 fastlane 을 적용 합니다.

``` bash
cd /path/myapp
fastlane init
```

2. fastlane 설정을 묻는 대화에서 `4. Menual setup` 을 선택합니다.

3. 아래와 같이 fastlane 하위에 `Appfile`, `Fastfile` 프로젝트 폴더 하위에 `Gemfile`, `Gemfile.lock` 이 생성됩니다. 

``` txt {4-8}
.
├─ myapp
├─ myapp.xcodeproj
├─ fastlane
│ ├─ Appfile // [!code warning]
│ └─ Fastfile // [!code warning]
├─ Gemfile
└─ Gemfile.lock
```

### Appfile

::: code-group
``` txt [Appfile]
app_identifier com.example.myapp
apple_id apple@example.com
team_id 9TEAMIDA12
```
:::

* `app_identifier` app 의 bundle id 를 작성합니다.
* `apple_id` Apple 계정 아이디(이메일) 을 입력합니다.
* `team_id` [Apple Developer Account](https://developer.apple.com/account) 의 `멤버십 세부 사항` 색션의 `팀 ID` 를 확인합니다. 

### Fastfile
::: tip
`app_store_connect_api_key` 를 이용한 방식을 설명합니다.
:::

1. API KEY 발급
    1. [Apple App Store Connect](https://appstoreconnect.apple.com/) 로 이동하여 로그인합니다.
    2. `사용자 및 액세스` > `통합` 으로 이동합니다.
    3. `App Store Connect API` 에서 새 키를 발급합니다.
    4. 발급받은 키 정보를 나타내는 레코드에서 `다운로드` 버튼을 눌러 키를 다운로드 합니다.

2. 아래 예시를 참고하여 `Fastfile` 을 수정합니다.

::: code-group
``` txt [Fastfile] {6-10,12-16}
default_platform(:ios)

platform :ios do
  desc "Build Development"
  lane :build_test do
    app_store_connect_api_key(
      key_id: "AB12345C67",
      issuer_id: "12345678-abcd-1234-5678-123a45b678cd",
      key_content: "-----BEGIN PRIVATE KEY-----\nn71bPtn68iah8pyRbjmN55ArYDDsu0z5S1Pfm93mXhvEVoHv5oRg8fX3HC8ar7D0\n8IRPujQABnVbn4aHD1ozp5ZLYihhpQNfgcEuikbAY6KDVZ3OGNcGpy1mKWe8sPQX\nYO09bzo9qkRuMPKC6IU9a6IszeiiR9UD5Hwd6rFNcdHCslaL9ZhCnUMJNeyK147j\nLZUZUiDc\n-----END PRIVATE KEY-----"
    )

    match(
      git_url: "https://gitlab.example.com/project/fastlane-match.git",
      storage_mode: "git",
      type: "development"
    ) 

    ## 이후 필요 내용을 작성

  end
end
```
:::

* `key_id` [Apple App Store Connect](https://appstoreconnect.apple.com/) > 사용자 및 액세스 > 통합 > App Store Connect API > `키 ID` 에서 확인합니다
* `issuer_id` [Apple App Store Connect](https://appstoreconnect.apple.com/) > 사용자 및 액세스 > 통합 > App Store Connect API > `Issuer ID` 에서 확인합니다
* `key_content`
    > 1. [Apple App Store Connect](https://appstoreconnect.apple.com/) 로 이동하여 로그인합니다.
    > 2. `사용자 및 액세스` > `통합` 으로 이동합니다.
    > 3. `App Store Connect API` 에서 새 키를 발급합니다.
    > 4. 발급받은 키 정보를 나타내는 레코드에서 `다운로드` 버튼을 눌러 키를 다운로드 합니다.
    > 5. 다운받은 p8 파일을 열고 키 내용을 아래와 같이 수정하여 적용합니다.
    
    #### 기존
    ::: code-group
    ``` txt [AuthKey_AB12345C67.p8]
    -----BEGIN PRIVATE KEY-----
    n71bPtn68iah8pyRbjmN55ArYDDsu0z5S1Pfm93mXhvEVoHv5oRg8fX3HC8ar7D0
    8IRPujQABnVbn4aHD1ozp5ZLYihhpQNfgcEuikbAY6KDVZ3OGNcGpy1mKWe8sPQX
    YO09bzo9qkRuMPKC6IU9a6IszeiiR9UD5Hwd6rFNcdHCslaL9ZhCnUMJNeyK147j
    LZUZUiDc
    -----END PRIVATE KEY-----
    ```
    :::

    #### 변경
    ::: code-group
    ``` txt [key_content]
    -----BEGIN PRIVATE KEY-----\nn71bPtn68iah8pyRbjmN55ArYDDsu0z5S1Pfm93mXhvEVoHv5oRg8fX3HC8ar7D0\n8IRPujQABnVbn4aHD1ozp5ZLYihhpQNfgcEuikbAY6KDVZ3OGNcGpy1mKWe8sPQX\nYO09bzo9qkRuMPKC6IU9a6IszeiiR9UD5Hwd6rFNcdHCslaL9ZhCnUMJNeyK147j\nLZUZUiDc\n-----END PRIVATE KEY-----
    ```
    :::
* `git_url` [fastlane match](./fastlane-match.md) 를 적용한 git repository url
* `storage_mode` 인증서가 저장된 방식 git(생략시 기본값), google_cloud 또는 s3
* `type` match 인증서의 종류 development, appstore, enterprise 또는 adhoc

### .gitlab-ci.yml 설정
1. `.gitlab-ci.yml` 파일이 없다면 생성합니다. 디렉터리 구조는 다음과 같아야 합니다.

``` txt {7}
.
├─ myapp
├─ myapp.xcodeproj
├─ fastlane
│ ├─ Appfile
│ └─ Fastfile
├─ .gitlab-ci.yml
├─ Gemfile
└─ Gemfile.lock
```

2. 아래 예시를 참고하여 `.gitlab-ci.yml` 파일을 작성합니다.

::: code-group
```yml:line-numbers [.gitlab-ci.yml] {7-10,12}
stages:
  - build

run_fastlane:
  stage: build
  script:
    - export LC_ALL=en_US.UTF-8
    - export LANG=en_US.UTF-8
    - export PATH="$PATH:/opt/homebrew/bin" 
    - fastlane build_test
  tags:
    - macos
```
:::

> * `7, 8` shell charset 을 UTF-8 로 변경
> * `9`  Host Machine 에 fastlane 이 설치된 경로
> * `10` [Fastfile](#fastfile) 에서 작성한 lane 작업 이름
> * `12` `Host Machine` 에 설치된 Runner 에 지정된 태그