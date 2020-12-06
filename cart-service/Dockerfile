FROM node:12-slim as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
# -- npm install results are cached --


COPY . ./
RUN npm run build
# -- build results are cached --


FROM node:12-alpine as app
WORKDIR /app
COPY --from=builder /app/dist /app/package.json /app/package-lock.json ./
# copy production only dependencies:
RUN npm ci --production

USER node
EXPOSE 4000
CMD ["node", "main.js"]

