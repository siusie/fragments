node.js based REST API using Express

## running scripts
The scripts created in this lab are found in `package.json`

`lint` - ensures that there aren't any errors which need to be fixed

```sh
npm run lint
```

The following will automatically start the server:

`start`: starts the server normally

`dev`: starts the server via `nodemon`

`debug`:  same as `dev` + starts [node inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/) on port `9229`, allowing a debugger to be attached

`test`: run unit tests

`test:watch`: re-run tests when code is updated

```sh
npm start
npm run dev
npm run debug
npm run test
npm run test:watch
```

While the server is running, executing `curl -s localhost:8080 | jq` in another terminal pipes the server response to `jq`, transforming it into a more human-readable format

(Windows environment) A note on `nodemon`, for future reference: to run it (i.e., with `npm run dev`), the [cross-env](https://www.npmjs.com/package/cross-env) package must be installed first

`npm run coverage`: outputs information on which files and lines of code were run and generates a folder called *coverage*. Access `coverage/lcov-report/index.html` in a browser for a more detailed report

## switching between different versions of node.js
`nvm use --lts`: uses the LTS version of node

`nvm use {whatever version has been installed}`: switch to another version, installed using `nvm install {version}`

*\**Note that these commands are ran on the EC2 instance, while connected via SSH. Reference: [Lab 4](https://github.com/humphd/cloud-computing-for-programmers-summer-2023/tree/main/labs/lab-04#installing-packages)*

`ssh -i {filename}.pem ec2-user@{public-dns}`

When connecting to an EC2 instance using SSH (including copying files from the local computer to a remote computer), remember to specify the .pem file after `-i` 

## authentication
```sh
src/
├─ auth.js
├─ auth/
│  ├─ cognito.js
│  ├─ basic-auth.js
│  ├─ index.js
...
```
`src/auth/index.js` chooses the authentication strategy - Cognito or Basic Authentication

## Deploying to AWS
Every time we deploy a new release to ECS, we have to update our GitHub repo's secrets!
