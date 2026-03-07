# Step 1: Use an official Node.js runtime as the base image
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json first
# (This is a trick to make builds faster by caching dependencies)
COPY package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of your server source code
COPY . .

# Step 6: Inform Docker that the container listens on port 3000
EXPOSE 3000

# Step 7: The command to run your app
CMD ["npm", "run", "dev"]