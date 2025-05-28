# 설치 삭제
## K3s 삭제
``` bash
/usr/local/bin/k3s-uninstall.sh
```

### agent 삭제
``` bash
/usr/local/bin/k3s-agent-uninstall.sh
```

## kubectl 환경변수 삭제
``` bash
rm -rf ~/.kube/
```

## helm 삭제
```bash
rm -rf $HOME/.cache/helm
rm -rf $HOME/.config/helm
rm -rf $HOME/.local/share/helm
rm -rf /usr/local/bin/helm
```

::: tip
~/.bashrc 파일 변경 필요
::: code-group
```bash [.bashrc]
#export PATH=/usr/local/bin:/var/lib/k3s/k3s/bin:$PATH # 구문 삭제
```
:::