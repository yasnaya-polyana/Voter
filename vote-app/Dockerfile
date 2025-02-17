# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY contract-as/package*.json ./contract-as/

# Install dependencies
RUN npm install
RUN cd contract-as && npm install

# Copy project files
COPY . .

# Build the contract
RUN cd contract-as && npm run build

# Expose port
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "dev"] 