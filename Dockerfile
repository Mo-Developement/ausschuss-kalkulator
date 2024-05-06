FROM node:20-alpine AS build-stage
WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build-offline
RUN cp ./LICENSE*.txt ./dist
RUN mv ./dist ./ausschuss-kalkulator-0.1.0
RUN apk add zip
RUN zip -r ./ausschuss-kalkulator-0.1.0.zip ./ausschuss-kalkulator-0.1.0 -x \.\*

RUN npm run build
RUN cp ./LICENSE.txt ./dist
RUN mv ./ausschuss-kalkulator-0.1.0.zip ./dist

FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
