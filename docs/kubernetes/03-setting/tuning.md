# 설정 튜닝

## Node.js Express 기반 Application 무중단 배포

### Deployment.yaml
``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      terminationGracePeriodSeconds: 120
      containers:
        readinessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 2
          failureThreshold: 1
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 20"]
```

### main.js
``` js
    let connections = new Set();
    let isShuttingDown = false;

    server.on('connection', (conn) => {
        connections.add(conn);
        conn.on('close', () => {
            connections.delete(conn);
        });
    });

    app.get('/healthz', (req, res) => {
        if (isShuttingDown) {
            return res.status(503).send('Shutting down');
        }

        res.status(200).send('OK');
    });

    // SIGTERM graceful shutdown
    process.on('SIGTERM', () => {
        isShuttingDown = true;
        console.log('Received SIGTERM, stopping accepting new connections');

        server.close(() => {
            setTimeout(() => {
                console.log('All existing connections closed');
                process.exit(0);
            }, 10 * 1000); // 10초 유예
        });

        // 연결을 강제로 닫을 필요가 있을 경우
        setTimeout(() => {
            console.log('Forcefully closing remaining connections');
            connections.forEach((conn) => conn.destroy());
            process.exit(1);
        }, 60 * 1000); // 60초 후 강제 종료
    });
```

### Ingress.yaml
``` yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/connection-proxy-header: close
    nginx.ingress.kubernetes.io/proxy-buffer-size: 16k
    nginx.ingress.kubernetes.io/proxy-buffers-number: '8'
    nginx.ingress.kubernetes.io/proxy-connect-timeout: '10'
    nginx.ingress.kubernetes.io/proxy-next-upstream: error timeout http_502 http_503 http_504
    nginx.ingress.kubernetes.io/proxy-read-timeout: '60'
    nginx.ingress.kubernetes.io/proxy-send-timeout: '60'
```