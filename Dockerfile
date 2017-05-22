FROM node:7-alpine

RUN apk add --update curl bash && \
    rm -rf /var/cache/apk/*

COPY docker-entrypoint.sh /bin

WORKDIR /var/service

COPY package.json .
COPY dist/app/index.js .
COPY node_modules ./node_modules

ENV NODE_ENV production
EXPOSE 5000

HEALTHCHECK CMD curl --fail http://localhost:5000/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["deploy-webhook"]
