# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /goevoli ./cmd/server

# Run stage
FROM alpine:latest

WORKDIR /app

# Install CA certificates for MongoDB TLS
RUN apk --no-cache add ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /goevoli .

EXPOSE 8080

CMD ["./goevoli"]
