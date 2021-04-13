FROM public.ecr.aws/lambda/nodejs:12

COPY package.json /var/task/

RUN npm install

COPY scripts /var/task/scripts
COPY lib /var/task/lib

# Set the CMD to your handler
CMD [ "scripts/loanMarketData.handler" ]
