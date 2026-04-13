# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (skip dev dependencies for production)
RUN npm install --only=production

# Copy source code
COPY . .

# Disable ESLint during build
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]