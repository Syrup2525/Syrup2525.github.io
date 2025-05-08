## Nexus UI 설정
### Create repository
* `Repository` > `Repositories` > `Create repository`

> | 항목 | 값 |
> | --- | --- |
> | Name | `docker-hub-proxy` (혹은 원하는 이름) |
> | HTTP | `5000` |
> | Allow anonymous docker pull | `true` |
> | Enable Docker V1 | `false` |
> | Remote storage | `https://registry-1.docker.io` |
> | Docker Index | `Use Docker Hub` |
> | Blob store | default |

### Security 설정
* `Security` > `Realms`
> `Docker Bearer Token Realm` + 버튼 선택하여 Active 항목에 추가

* `Security` > `Anonymous Access`
> `Access` `Allow anonymous users to access the server` 항목 체크

## kubernetes 설정
### service 추가
::: code-group
``` yaml [service.yaml]
apiVersion: v1
kind: Service
metadata:
  name: nexus-docker-registry
  namespace: nexus
spec:
  type: NodePort
  selector:
    app.kubernetes.io/instance: nexus
    app.kubernetes.io/name: nexus-repository-manager
  ports:
    - name: docker-registry
      port: 5000
      targetPort: 5000
      nodePort: 30500  # k8s 외부 접근 포트
```
:::

### registries mirrors 설정
::: tip
RKE2 [Private Registry Configuration](https://docs.rke2.io/install/private_registry)
:::

``` bash
vi /etc/rancher/rke2/registries.yaml
```

::: code-group
``` yaml [registries.yaml]
mirrors:
  docker.io:
    endpoint:
      - "http://registry.example.com:5000"
```
:::

::: details user 설정시
``` yaml
mirrors:
  docker.io:
    endpoint:
      - "http://registry.example.com:5000"
configs:
  "registry.example.com:5000":
    auth:
      username: xxxxxx # this is the registry username
      password: xxxxxx # this is the registry password
```
:::