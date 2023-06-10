FROM node:16-alpine

LABEL maintainer="Martin HECQUE | Peter BALIVET | MATHIS DI MASCIO"

#Create App directory for project
RUN mkdir /app

#Changes directory to /app
WORKDIR /app

#Copy all necessary files for the python trading bot to project directory
COPY . .

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

#Set timezone
ENV TZ="Europe/Paris"

EXPOSE 5000

CMD [ "node", "app.js" ]