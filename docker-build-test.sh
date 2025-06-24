#!/bin/bash

# Local Docker build and test script for Veridect
echo "🐳 Building Veridect Docker container locally..."

# Build the Docker image
docker build -t veridect:latest . --no-cache

echo "✅ Docker build completed"

# Test the container locally
echo "🧪 Testing container locally on port 8080..."
docker run -d \
    --name veridect-test \
    -p 8080:8080 \
    -e NODE_ENV=production \
    -e PORT=8080 \
    veridect:latest

echo "⏳ Waiting for container to start..."
sleep 5

# Check if container is running
if docker ps | grep -q veridect-test; then
    echo "✅ Container is running successfully"
    echo "🌐 Test the app at: http://localhost:8080"
    echo ""
    echo "📋 To view logs: docker logs veridect-test"
    echo "🛑 To stop container: docker stop veridect-test && docker rm veridect-test"
else
    echo "❌ Container failed to start"
    echo "📋 Checking logs:"
    docker logs veridect-test
    docker rm veridect-test
    exit 1
fi