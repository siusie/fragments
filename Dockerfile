# Stage 0: install the base dependencies

# Install alpine Linux + node, being as specific as possible with version + the image's ID, as a SHA256 digest
FROM node:18 AS dependencies

LABEL description="Fragments node.js microservice"

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy files into image, change the owner to node user, node group
COPY --chown=node:node package*.json .

# Read only package-lock.json, install exact versions specified there, ignore any devDependencies (ex., Jest)
RUN npm ci --only=production

#####################################################################

# Stage 1: use dependencies to build the server
FROM node:18-alpine3.17@sha256:4a55308cc855cba1a925d19ae4e45838741dad2fd7bb8949a93b2a0f2ae339e3 AS builder

ENV NODE_ENV production

# Copy cached dependencies from previous stage so we don't have to download
COPY --chown=node:node --from=dependencies /app /app

WORKDIR /app

# Copy source code into the image
COPY --chown=node:node ./src ./src

#####################################################################

# Stage 2: running the server

# Switch to `node` user before starting server
USER node

# Invoke the node process directly rather than wrapped in a shell interpreter, ensuring that it receives all of the signals sent to it
CMD ["node", "./src/server.js"]

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1
