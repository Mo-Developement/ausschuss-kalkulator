ARG version=1.0.0

FROM node:20-alpine AS build-stage
WORKDIR /app

# install npm packages
COPY package*.json .
RUN npm install

# copy application data
COPY . .

# build downloadable version
RUN npm run build-offline
RUN cp ./LICENSE*.txt ./dist
RUN mv ./dist ./ausschuss-kalkulator-$version
RUN apk add zip
RUN zip -r ./ausschuss-kalkulator-$version.zip ./ausschuss-kalkulator-$version -x \.\*

# build online version
RUN npm run build
RUN cp ./LICENSE.txt ./dist
RUN mv ./ausschuss-kalkulator-$version.zip ./dist

# setup nginx as new stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
