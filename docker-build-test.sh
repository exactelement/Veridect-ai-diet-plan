#!/bin/bash

# Local Docker Build Test Script for Veridect
# This script builds the Docker image locally for testing before Cloud Run deployment

set -e

IMAGE_NAME="veridect-app"
TAG="latest"

echo "Building Veridect Docker image locally..."
echo "Image: $IMAGE_NAME:$TAG"

# Build the Docker image
docker build -t $IMAGE_NAME:$TAG .

echo "Docker image built successfully!"
echo "Image size:"
docker images $IMAGE_NAME:$TAG

echo ""
echo "To test the image locally, run:"
echo "docker run -p 8080:8080 --env-file .env $IMAGE_NAME:$TAG"
echo ""
echo "To push to Google Container Registry for Cloud Run deployment:"
echo "1. Tag the image: docker tag $IMAGE_NAME:$TAG gcr.io/YOUR_PROJECT_ID/$IMAGE_NAME:$TAG"
echo "2. Push the image: docker push gcr.io/YOUR_PROJECT_ID/$IMAGE_NAME:$TAG"
echo "3. Or use the automated deployment: ./deploy-cloudrun.sh"