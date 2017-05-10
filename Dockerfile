FROM node:7-alpine

RUN apk add --update curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY package.json .
COPY dist/app ./dist/app
COPY node_modules ./node_modules

ENV NODE_ENV production
EXPOSE 5000

HEALTHCHECK CMD curl --fail http://localhost:5000/health || exit 1

ENTRYPOINT ["npm", "start"]
