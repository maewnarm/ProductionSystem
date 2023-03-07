FROM node:12.18.3-alpine3.12 AS development
WORKDIR /code
COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json
RUN npm i
COPY . /code

CMD ["npm", "start"]

FROM development AS builder

RUN npm run build

FROM node:12.18.3-alpine3.12 AS runner
WORKDIR /code
COPY --from=builder /code/public /code/public
COPY --from=builder /code/build /code/build
RUN npm i -g serve@13.0.2

CMD ["serve","-s","build","-l","80"]