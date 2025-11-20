# Backend Makefile
IMAGE_NAME = nutri-backend
CONTAINER_NAME = backend-container

.PHONY: build run stop test logs

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the container in background (detached)
# We pass the .env file so your API Keys work
run:
	docker run -d -p 5000:5000 --name $(CONTAINER_NAME) --env-file .env $(IMAGE_NAME)

# Stop and remove the container
stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

# Run Tests inside Docker
test:
	docker run --rm --env-file .env $(IMAGE_NAME) npm test

# View logs
logs:
	docker logs -f $(CONTAINER_NAME)
