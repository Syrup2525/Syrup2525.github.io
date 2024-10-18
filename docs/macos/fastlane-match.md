# fastlane match

::: tip
GitLab (Git) 저장소를 활용, [fastlane](https://github.com/fastlane/fastlane) [match](https://docs.fastlane.tools/actions/match/) 를 적용하여 인증서를 원격지 저장소에서 관리하는 방법이 포함되어 있습니다. Git 저장소로 사설 GitLab 저장소가 필요한 경우 [Gitlab](../dockerswarm/gitlab.md) 문서를 참고해주세요.
:::

## match 설정

::: warning
match 를 사용한 인증서가 최초 발급이라면 `최초 발급 match 설정` 을, 이미 match 로 생성한 인증서가 원격지 저장소에 존재한다면 `신규 기기 match 설정` 단계를 진행해 주세요. 상황에 맞게 두 개 중 하나의 단계를 수행 후, `공통 Xcode 설정` 을 진행합니다.
:::

### `최초 발급` match 설정
``` bash
fastlane match development
```
> fastlane match 뒤에 올 수 있는 값은 `development` `appstore` `adhoc` `enterprise` 입니다.

* `URL to the git repo containing all the certificates:`
  - git repo url 입력

* `Username:`
  - apple 계정 아이디(이메일) 입력

* `The bundle identifier(s) of your app (comma-separated string or array of strings):`
  - Bundle Id 입력
  - 예시
    + com.exmaple.myapp
    + com.example.myapp,com.exmaple.myapp2

* `Your Apple ID Username:`
  - apple 계정 아이디(이메일) 입력

* `All required keys, certificates and provisioning profiles are installed 🙌`
  - 해당 문구가 나온다면 성공한것 입니다.

### `신규 기기` match 설정

``` bash
fastlane match development --readonly
```

* `URL to the git repo containing all the certificates:`
  - gitlab repo URL 입력

* `The bundle identifier(s) of your app (comma-separated string or array of strings):`
  - 앱 Bundle id 입력

* `All required keys, certificates and provisioning profiles are installed 🙌`
  - 해당 문구가 나온다면 성공한것 입니다.

### `공통` Xcode 설정
* Xcode 를 실행하여 `Signing & Capabilities` 로 이동 후 `Signing` 색션에서 `Automatically manage signing` 항목을 해제합니다.
*  `Provisioning Profile` 에서 match 를 통해 받은 Profile 을 선택합니다.
