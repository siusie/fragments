## [Node.js](https://nodejs.org)-based REST API using [Express](https://expressjs.com/)
The _fragments_ microservice allows authenticated users to manage text and image data over HTTP. Users are able to create, retrieve, update, and delete text/image data, as well as convert them into different formats. The current accepted MIME types are:

| Name       | Type               | Extension |
| ---------- | ------------------ | --------- |
| Plain Text | `text/plain`       | `.txt`    |
| Markdown   | `text/markdown`    | `.md`     |
| HTML       | `text/html`        | `.html`   |
| JSON       | `application/json` | `.json`   |
| PNG Image  | `image/png`        | `.png`    |
| JPEG Image | `image/jpeg`       | `.jpg`    |
| WebP Image | `image/webp`       | `.webp`   |
| GIF Image  | `image/gif`        | `.gif`    |

Valid conversions for each fragment type (others may be added in the future):

| Type               | Valid Conversion Extensions     |
| ------------------ | ------------------------------- |
| `text/plain`       | `.txt`                          |
| `text/markdown`    | `.md`, `.html`, `.txt`          |
| `text/html`        | `.html`, `.txt`                 |
| `application/json` | `.json`, `.txt`                 |
| `image/png`        | `.png`, `.jpg`, `.webp`, `.gif` |
| `image/jpeg`       | `.png`, `.jpg`, `.webp`, `.gif` |
| `image/webp`       | `.png`, `.jpg`, `.webp`, `.gif` |
| `image/gif`        | `.png`, `.jpg`, `.webp`, `.gif` |


## About
The web application can be accessed [here](). There is an UI to test the _fragments_ server, [here](https://github.com/siusie/fragments-ui).

The `fragments` microservice consists of:

- Amazon Cognito User Pool
- simple client Web App that authenticates and gets tokens
- microservice that can secure HTTP access via JWT tokens

# Running this server as a Docker container
The _fragments_ server can be run locally as a Docker container. Pull the Docker image from [Docker Hub](https://hub.docker.com/repository/docker/siusie/fragments)

## Deploying to AWS
Every time we deploy a new release to ECS, we have to update our GitHub repo's secrets!
