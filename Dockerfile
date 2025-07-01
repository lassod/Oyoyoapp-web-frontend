# Use the official Node.js:lts runtime as a base image
FROM node:lts-alpine AS base

RUN apk add --no-cache openssl

# Set the working directory in the container
WORKDIR /app

# Install turbo globally
RUN yarn global add turbo

# Copy the monorepo files to the container
COPY . .

# Prune the dependencies to optimize the Docker image
RUN turbo prune web --docker
# RUN turbo prune server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app



# Copy the pruned files from the base image
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/yarn.lock ./yarn.lock

# Install dependencies in the pruned environment
RUN yarn install

# RUN npx prisma generate

RUN cd apps/web && npx prisma generate

# Copy the full pruned monorepo to the container
COPY --from=base /app/out/full/ .

# Copy the turbo.json file
COPY turbo.json turbo.json

# Build the project and its dependencies
RUN yarn turbo build --filter=web...
# RUN yarn turbo build --filter=server...

FROM base AS runner
WORKDIR /app

# Copy the built files from the installer stage
COPY --from=installer /app .

# Install the dependencies using yarn (including production dependencies)
RUN yarn install --production=false

# Generate Prisma client
# RUN npx prisma generate

# RUN cd apps/server && npx prisma generate
# Set an environment variable
ENV PORT=3000

# Expose the port that the app will run on
EXPOSE 3000

# Tell Docker what command will start the application
# CMD [ "yarn", "start" ]