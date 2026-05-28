FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Fly.io injects PORT via env; default to 5000 for local
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
