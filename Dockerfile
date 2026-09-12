FROM node:20-bookworm

RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN g++ -std=c++11 algorithm_engine.cpp -O2 -o algorithm_engine

EXPOSE 3000

CMD ["npm", "start"]
