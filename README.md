# kucoin-monitor

Simple script to get and save market data for Kucoin lending


## Deployment

```
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${aws_id}.dkr.ecr.us-east-1.amazonaws.com"

docker-compose -f docker-compose.yml -f docker-compose.prod.yml build kucoin-monitor-scripts

docker tag kucoin-monitor-scripts:latest "${aws_id}.dkr.ecr.us-east-1.amazonaws.com/kucoin-monitor-scripts:latest"

docker push "${aws_id}.dkr.ecr.us-east-1.amazonaws.com/kucoin-monitor-scripts:latest"
```
