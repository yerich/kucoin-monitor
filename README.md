# kucoin-monitor

A script to monitor cryptocurrency lending on the [Kucoin](https://kucoin.com/) cryptocurrency exchange.

A personal exercise for the following:

- Bootstraping an Express.js server with a React-based FE
- Generating Docker images from scratch (using Dockerfiles and docker-compose)
- Supporting fast local development as well as containerized deployment
- Automated deployment onto AWS Lambda for cron scripts
- Using DynamoDB and the AWS SDK


## Environment

Create a `.env` file in the project root after cloning with the following configuration:

```
ENV_FILE_LOADED=1

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=...
AWS_REGION=...
AWS_ACCOUNT_ID=...
KUCOIN_API_BASEURL=...
KUCOIN_API_KEY=...
KUCOIN_API_SECRET=...
KUCOIN_API_PASSPHRASE=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT=...
```

## Deploy

```
docker --context CONTEXT compose up -d --build kucoin-monitor-server
```
