FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
COPY src/yaml-data /app/src/yaml-data

EXPOSE 3001

CMD ["npm", "run", "dev"]
