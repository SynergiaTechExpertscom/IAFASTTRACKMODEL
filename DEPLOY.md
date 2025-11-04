Deployment instructions
=======================

This document explains how to build a Docker image for the project and deploy it on a remote server either with Docker Compose or Kubernetes.

Prerequisites on remote server
- Docker Engine and Docker Compose installed (for docker-compose path)
- Or a Kubernetes cluster with kubectl access (for k8s path)
- Git and network access

High-level steps
1. SSH to the remote server and clone/pull this repository
2. Build the Docker image
3a. Use docker-compose to start the stack (simpler), or
3b. Push image to a registry and apply `k8s-deployment.yaml` in the cluster

SSH example (replace with your server and user):

```powershell
ssh user@your-server.example.com
cd /opt
git clone <repo-url> iafasttrack || (cd iafasttrack && git pull)
cd iafasttrack
```

Docker Compose deploy (single server)

```powershell
# Build the image locally on the server
docker build -t iafasttrackmodel:latest .

# Start services
docker-compose up -d --build

# Check logs
docker-compose logs -f web
```

Kubernetes deploy (recommended for production)

1. Build and push image to a registry (Docker Hub, GCR, ACR...)

```powershell
docker build -t yourregistry/iafasttrackmodel:latest .
docker push yourregistry/iafasttrackmodel:latest
```

2. Edit `k8s-deployment.yaml` to point image `yourregistry/iafasttrackmodel:latest` and to adjust secrets (DB credentials base64). Then apply:

```powershell
kubectl apply -f k8s-deployment.yaml
kubectl -n iafasttrack rollout status deployment/iafasttrack-web
```

Notes and production considerations
- Replace placeholder secrets with Kubernetes Secrets or an external secret manager.
- Ensure STATIC_ROOT is correctly set and that a web server (nginx) serves `/staticfiles` directly for performance.
- Use a production-ready WSGI (gunicorn is included) with proper process management and logging.
- When deploying with MySQL, create `/root/IAFASTTRACKMODEL/mysql-conf/my.cnf` on the target host to tune buffer sizes:

  ```bash
  sudo mkdir -p /root/IAFASTTRACKMODEL/mysql-conf
  sudo tee /root/IAFASTTRACKMODEL/mysql-conf/my.cnf >/dev/null <<'EOF'
  [mysqld]
  sort_buffer_size = 4M
  join_buffer_size = 4M
  read_rnd_buffer_size = 4M
  tmp_table_size = 128M
  max_heap_table_size = 128M
  EOF
  ```
