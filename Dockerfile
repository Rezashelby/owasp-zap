# Dockerfile
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY ./app/package*.json ./
RUN npm install

# Copy app source code
COPY ./app .

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
