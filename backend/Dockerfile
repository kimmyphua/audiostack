# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
# Install OpenSSL and other dependencies
RUN apk add --no-cache openssl
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN mkdir -p uploads
RUN npm install --omit=dev
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "dist/index.js"] 