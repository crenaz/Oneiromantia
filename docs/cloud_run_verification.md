# Cloud Run Deployment Verification Guide

This guide documents three methods to inspect and verify the contents, configuration, and API status of the deployed **`oneiromantia-api`** Cloud Run container.

---

## Service Quick Reference

* **Service Name:** `oneiromantia-api`
* **GCP Project:** `oneiromantia`
* **Region:** `us-central1`
* **Service URL:** `https://oneiromantia-api-752539001569.us-central1.run.app`
* **Swagger UI:** `https://oneiromantia-api-752539001569.us-central1.run.app/docs`

---

## Method 1: Inspect Live API Endpoints & OpenAPI Schema

Use this method to quickly verify that the application is running properly and serving the expected API routes.

### 1. View Interactive Swagger Documentation
Open in browser:
```text
https://oneiromantia-api-752539001569.us-central1.run.app/docs
```

### 2. Fetch the OpenAPI JSON Schema
```zsh
curl -s https://oneiromantia-api-752539001569.us-central1.run.app/openapi.json | jq .
```

**Expected Endpoints:**
* `POST /api/analyze` — Primary Dream Analysis endpoint.
* `GET /health` — Health check endpoint.
* `GET /healthz` — Alternative health check endpoint.

### 3. Test Health Check
```zsh
curl -s https://oneiromantia-api-752539001569.us-central1.run.app/health
```

---

## Method 2: Pull and Inspect Container Image Locally with Docker

Use this method to inspect the actual filesystem, installed packages, and application code inside the deployed container image.

### Step 1: Authenticate Docker with Artifact Registry
```zsh
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Step 2: Get Deployed Image URI
Retrieve the image digest currently running in Cloud Run:
```zsh
IMAGE_URI=$(gcloud run services describe oneiromantia-api \
  --region us-central1 \
  --project oneiromantia \
  --format="value(spec.template.spec.containers[0].image)")

echo "Deployed Image: $IMAGE_URI"
```

### Step 3: Pull Image Digest
```zsh
docker pull $IMAGE_URI
```

### Step 4: Explore Files Inside Container
```zsh
# List files inside /app directory
docker run --rm $IMAGE_URI ls -la /app/apps/api

# Run interactive shell inside container
docker run --rm -it $IMAGE_URI sh
```

---

## Method 3: Inspect Deployment & Cloud Build Metadata

Use this method to verify Cloud Run runtime configurations, revision history, and build sources.

### 1. Check Service Configuration & Safety Limits
```zsh
gcloud run services describe oneiromantia-api \
  --region us-central1 \
  --project oneiromantia \
  --format="yaml(spec.template.metadata.annotations, spec.template.spec.containers[0].resources)"
```

### 2. Check Build Source Location & SHA
```zsh
gcloud run services describe oneiromantia-api \
  --region us-central1 \
  --project oneiromantia \
  --format="yaml(metadata.annotations['run.googleapis.com/build-source-location'], metadata.annotations['run.googleapis.com/build-id'])"
```

---

## Resource Safety & Free Tier Checklist

Verify these safety parameters periodically to remain within Google Cloud's Always Free tier:

* **Min Scale:** `0` (Scales down to 0 instances when idle).
  * `gcloud run services describe oneiromantia-api --region us-central1 --project oneiromantia --format="value(spec.template.metadata.annotations['autoscaling.knative.dev/minScale'])"` *(should be empty or 0)*
* **Max Scale:** `2` (Budget ceiling safeguard).
  * `gcloud run services update oneiromantia-api --max-instances=2 --region us-central1 --project oneiromantia`
* **Region:** `us-central1` (Free Tier supported region).
