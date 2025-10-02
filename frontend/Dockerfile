FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm install

RUN np install -g @angular/cli

COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=1000"]
