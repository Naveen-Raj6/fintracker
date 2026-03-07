# Step 1: Use Node.js to build/run the React app
FROM node:18-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files and install
COPY package*.json ./
RUN npm install

# Step 4: Copy the frontend source code
COPY . .

# Step 5: Vite runs on 5173 by default
EXPOSE 5173

# Step 6: Start the Vite dev server
CMD ["npm", "run", "dev"]