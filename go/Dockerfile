# development stage
FROM golang:alpine AS development

WORKDIR /go/src/app

COPY . .

RUN go get -d -v ./... && go install github.com/air-verse/air@latest

CMD ["air", "-c", ".air.toml"]

# build stage
FROM golang:alpine AS builder
RUN apk add --no-cache git

WORKDIR /go/src/app

COPY . .

RUN go get -d -v ./... 

RUN go build -o /go/bin/app -v ./...

# final stage
FROM alpine:latest as production
RUN apk --no-cache add ca-certificates

COPY --from=builder /go/bin/app /app

ENTRYPOINT /app

LABEL Name=personalaichatbot Version=0.0.1

EXPOSE 3000
