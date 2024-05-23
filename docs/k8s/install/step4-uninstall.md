# 기타 명령어
## RKE2 삭제
```bash
/usr/bin/rke2-uninstall.sh
```

::: tip
RKE2 Uninstall [공식 문서](https://docs.rke2.io/install/uninstall)
:::

## helm 삭제
```bash
rm -rf $HOME/.cache/helm
rm -rf $HOME/.config/helm
rm -rf $HOME/.local/share/helm
rm -rf /usr/local/bin/helm
```

::: tip
helm uninstalling [공식 문서](https://helm.sh/docs/faq/uninstalling/)
:::

## kubectl 환경변수 삭제
```bash
rm -rf ~/.kube/
```

::: tip
~/.bashrc 파일 변경 필요
```bashrc title=".bashrc"
#export PATH=/usr/local/bin:/var/lib/rancher/rke2/bin:$PATH # 구문 삭제
```
:::