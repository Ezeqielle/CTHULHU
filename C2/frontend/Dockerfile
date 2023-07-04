# syntax=docker/dockerfile:1
FROM node:alpine
WORKDIR /app
COPY . .
RUN npm install --production
RUN npm run build
RUN npm install -g serve
EXPOSE 443
ENV PORT=443
ENV HTTPS=true
CMD ["serve", "-s", "build", "--ssl-cert", "./cert.pem", "--ssl-key", "./key.pem"]
