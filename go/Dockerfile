FROM golang:alpine AS base

WORKDIR /go/src/app

COPY . .

RUN apk add --no-cache curl

# development stage
FROM base AS development

RUN go get -d -v ./... && go install github.com/air-verse/air@latest

CMD ["air", "-c", ".air.toml"]

# build stage
FROM base AS builder
RUN apk add --no-cache git

RUN go get -d -v ./... 

RUN go build -o /go/bin/app -v cmd/server/main.go

# final stage
FROM alpine:latest as production
RUN apk --no-cache add ca-certificates curl

COPY --from=builder /go/bin/app /app

ENTRYPOINT /app

LABEL Name=personalaichatbot Version=0.0.1

EXPOSE 3000
