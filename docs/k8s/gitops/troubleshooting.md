# Troubleshooting

## 동일 데이터로 migration
### values.yaml 수정
비밀번호 없이 localhost 에서 postgresql 접속 가능하도록 수정
``` yaml

#####

postgresql:
  pgHbaConfiguration: |-
    local all all trust
    host all all localhost trust
    host all all 192.168.0.0/24 md5

#####
  
```

### DB 데이터 수정
1. gitlab user 비밀번호 확인
``` bash
kubectl get secret gitlab-postgresql-password -n gitlab -o json | jq -r '.data["postgresql-password"]' | base64 --decode
```

2. postgres user 비밀번호 확인
``` bash
kubectl get secret gitlab-postgresql-password -n gitlab -o json | jq -r '.data["postgresql-postgres-password"]' | base64 --decode
```

3. bash 접속 
``` bash
kubectl exec -n gitlab -it gitlab-postgresql-0 -- /bin/bash
```

4. postgresql 접속
``` bash
psql -U postgres
```

5. 비밀번호 변경
- postgres user 비밀번호 변경
``` bash
ALTER USER postgres WITH PASSWORD '1. 에서 확인한 비밀번호';
```

- gitlab user 비밀번호 변경
``` bash
ALTER USER gitlab WITH PASSWORD '2. 에서 확인한 비밀번호';
```

6. DB 선택
``` bash
\c gitlabhq_production
```

7. token 정보 제거
``` bash
UPDATE application_settings SET encrypted_customers_dot_jwt_signing_key = null, encrypted_customers_dot_jwt_signing_key_iv = null, error_tracking_access_token_encrypted = null;
```

8. project runner 토큰 정보 제거
``` bash
UPDATE projects SET runners_token_encrypted = NULL;
```

9. runner 정보 제거
``` bash
DELETE FROM ci_runners;
```

10. group ci variable 정보 제거
``` bash
DELETE FROM ci_group_variables;
```

### token 초기화
1. `gitlab-toolbox` pod 이름 확인
``` bash
kubectl get pods -n gitlab
```
> `gitlab-tollbox-1234567890-abcde`

2. `gitlab-toolbox` pod 접속
``` bash
kubectl exec -n gitlab -it gitlab-tollbox-1234567890-abcde -- /bin/bash
```

3. `gitlab-rails` 접속
``` bash
gitlab-rails console
```
> ``` txt
> --------------------------------------------------------------------------------
>  Ruby:         ruby 3.2.5 (2024-07-26 revision 31d0f1a2e7) [x86_64-linux]
>  GitLab:       17.7.0 (eedc7c560c9) FOSS
>  GitLab Shell: 14.39.0
>  PostgreSQL:   14.8
> ------------------------------------------------------------[ booted in 34.50s ]
> Loading production environment (Rails 7.0.8.6)
> irb(main):001:0> 
> ```

4. token 초기화 (irb(main):001:0> 접속한 상태에서)
``` bash
ApplicationSetting.first.delete
```

5. token 초기화 확인
``` bash
ApplicationSetting.first
```
> ``` txt
> nil
> ```