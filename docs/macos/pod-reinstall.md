# Pod 재설치 방법

## deintegrate, clean 설치 (필요시)

```
sudo gem install cocoapods-deintegrate cocoapods-clean
```

## deintegrate 명령어 실행

```
pod deintegrate <proect name>.xcodeproj
```

## clean 실행

이전 명령어

```
pod clean
```

변경된 명령어

```
pod cache clean --all
```

## pod 재설치

```
pod install
```