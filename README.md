## The _fragments_ Microservice
The _fragments_ micro-service is a [Node.js](https://nodejs.org)-based REST API using [Express](https://expressjs.com/). It allows authenticated users to manage text and image data over HTTP. Users are able to create, retrieve, update, and delete text/image data, as well as convert them into different formats. The current accepted MIME types are:

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

The text and image data may be converted to a different format, by specifying the extensionValid conversions for each fragment type (others may be added in the future):

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

## Tools Used

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)
- [Jest](https://jestjs.io/)
- [Docker](https://www.docker.com/)
- [Pino logger](https://getpino.io/#/)


## About
There is an UI to test the _fragments_ server, [here](https://github.com/siusie/fragments-ui).

The `fragments` micro-service consists of:

- Amazon Cognito User Pool
- simple client Web App that authenticates and gets tokens
- microservice that can secure HTTP access via JWT tokens

### User Interface
The UI to test this microservice:

![image](https://github.com/siusie/fragments/assets/93149998/370e409d-9e1d-40ab-a5a1-c9fed1ba1415)

Existing images, text data, JSON are found under the 'Fragments' tab:

![image](https://github.com/siusie/fragments/assets/93149998/47ac9ea8-0b94-490e-a15c-635edb5a0d92)

Search for a fragment by its ID:

![image](https://github.com/siusie/fragments/assets/93149998/03636bda-42f0-4c49-b12b-b503732671c1)

The displayed data can also be converted by affixing an accepted extension (for example, markdown --> HTML):

![image](https://github.com/siusie/fragments/assets/93149998/4ca3ff59-fd85-4d48-bfad-bbbd7b4d7065)


# Running this server as a Docker container
The _fragments_ server can be run locally as a Docker container. Pull the Docker image from [Docker Hub](https://hub.docker.com/repository/docker/siusie/fragments)

## Scaling Design Considerations
The Docker containers were created and run on AWS with these in mind:
- we should be able to run 1 or 1000 instances of our container (horizontal scaling)
- use lightweight compute/memory resources per instance (avoid using unnecessary cloud resources)
- include a Docker health check to periodically check if app is running and healthy
- use a _stateless design_:
  - server needs to be able to be shut down at any time
  - data needs to be stored outside the instance
  - nothing gets saved on the instance's disk
- use external storage services (S3, DynamoDB, etc.)
- cloud instances are throw-away, not forever

## Auto-deployments to Amazon Web Services
Pushing git tags to this repository triggers GitHub Actions to automatically deploy an updated Docker image to [Amazon ECR](https://aws.amazon.com/ecr/), which is then ran as a container by [Amazon ECS](https://aws.amazon.com/ecs). The server is running [here](http://ec2-34-203-221-119.compute-1.amazonaws.com:8080/). 

```Server status: UP```

## Persistent store
This micro-service uses two types of backend data models: 
  1. an in-memory database, for testing purposes
  2. an external, permanent storage service, for production

The storage option used is determined at run-time.

## The _fragment_
A fragment consists of two parts, metadata and data. *Metadata* is the details about the fragment, like its UUID, the email of the owner (stored as a SHA256 hash), its size and type, and timestamps of when it was created or updated. *Data* refers to the contents of the fragment, stored as a binary blob. In our design, a fragment will be split across AWS S3 (data) and Amazon DynamoDB (metadata).
