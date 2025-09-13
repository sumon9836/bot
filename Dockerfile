# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (better caching for npm install)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy rest of the app
COPY . .

# Expose the port (Render usually uses 10000+ dynamically)
EXPOSE 3000

# Start the app
CMD ["node", "api/index.js"]
