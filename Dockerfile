FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

COPY frontEnd/package*.json frontEnd/
RUN npm install --prefix frontEnd --omit=dev

COPY backEnd/package*.json backEnd/
RUN npm install --prefix backEnd --omit=dev

COPY frontEnd/ frontEnd/
RUN npm run prod --prefix frontEnd

COPY backEnd/ backEnd/

CMD [ "npm", "start", "--prefix", "backEnd" ]

EXPOSE 3000