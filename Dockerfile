FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g npm@11.19.0 && npm ci --include=dev

FROM dependencies AS test
COPY . .
CMD ["npm", "test"]

FROM test AS development
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000", "--strictPort"]
