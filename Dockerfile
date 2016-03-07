FROM node:argon

RUN mkdir -p /home/osboxes/project2/app
WORKDIR /home/osboxes/project2/app

COPY package.json /home/osboxes/project2/app/
RUN npm install

COPY . /home/osboxes/project2/app

EXPOSE 8080

CMD ["npm","start"]
