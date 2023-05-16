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

```sh
npm start
npm run dev
npm run debug
```

While the server is running, executing `curl -s localhost:8080 | jq` in another terminal pipes the server response to `jq`, transforming it into a more human-readable format

A note on `nodemon`, for future reference: to run it (i.e., with `npm run dev'), the [cross-env](https://www.npmjs.com/package/cross-env) package must be installed first
