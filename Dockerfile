# Stage 0: install the base dependencies

# Install alpine Linux + node, being as specific as possible with version
FROM node:18-alpine3.17@sha256:4a55308cc855cba1a925d19ae4e45838741dad2fd7bb8949a93b2a0f2ae339e3 AS dependencies

LABEL maintainer="Xi Chen <xchen339@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Install the `dumb-init` tool which allows containers to stop gracefully
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

# Use /app as our working directory
WORKDIR /app

# Copy files into image, change the owner to node user, group
COPY --chown=node:node package*.json .

# Reads only package-lock.json, install exact versions specified there, ignore any dev dependencies (ex., Jest)
RUN npm ci --only=production

#####################################################################

# Stage 1: use dependencies to build the site
FROM node:18-bullseye-slim@sha256:4a55308cc855cba1a925d19ae4e45838741dad2fd7bb8949a93b2a0f2ae339e3 AS builder

ENV NODE_ENV production

# Copy the resulting /usr/bin/dumb-init file to the final container image
COPY --chown=node:node --from=dependencies /usr/bin/dumb-init /usr/bin/dumb-init

WORKDIR /app

# Copy cached dependencies from previous stage so we don't have to download
COPY --chown=node:node --from=dependencies /app /app

# Copy source code into the image
COPY --chown=node:node ./src ./src

#####################################################################

# Stage 2: running the server

# Switch to `node` user before starting server
USER node

# Invoke the node process directly, ensuring that it receives all of the signals sent to it, without it being wrapped in a shell interpreter
CMD ["dumb-init", "node", "./src/server.js"]

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1
