// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

// A function to get the file extension
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

/**
 * Get a list of fragments belonging to the current user
 */
module.exports = (req, res) => {

  // an ID is present in the url
  // TODO: GET /:id/info
  if (req.params.id) {
    const extension = getFileExtension(req.params.id);
    logger.debug(`[get.js] got extension: ${extension}`);
    
    // attempt to retrieve the fragment from db
    // currently only text/plain is supported
    if (extension === "" || extension === "txt") {

      // extract fragment id w/o extension
      const id = (extension === "txt") ? (req.params.id).split(".txt")[0] : req.params.id;
      logger.debug(`got fragment id: ${id}, original URL: ${req.originalUrl}`);

      // retrieve the fragment's metadata
      if (req.originalUrl === `/v1/fragments/${req.params.id}/info`) {
        Fragment.byId(req.user, id)
          .then((fragment) => {
            logger.info(`got fragment: ${JSON.stringify(fragment, null, 4)}`);
            res.status(200).json(createSuccessResponse({fragment})); 
          })
          .catch((err) => {
            logger.error(`${err}`);
            res.status(404).json(createErrorResponse(404, `${err}`));
          });
      }
      // retrieve the fragment's data
      else {
        Fragment.byId(req.user, id)
          .then((fragment) => {
          fragment.getData().then((data) => {
            logger.info(`got fragment data: ${data}`);
            res.status(200).setHeader("Content-Type", fragment.type).send(data);    
            });
          })
          .catch((err) => {
            logger.error(`${err}`);
            res.status(404).json(createErrorResponse(404, `${err}`));      
          });
      }  
    
    }
    else {
      res.status(415).json(createErrorResponse(415, `unable to convert to ${extension}`));
    }      
  }

  // No ID in URL
  else {
    // URL doesn't contain the `expand` option -> return an array of fragment IDs
    logger.info(`URL: ${req.originalUrl}`);
    if (req.originalUrl === '/v1/fragments') {
      Fragment.byUser(req.user)
        .then((fragment) => {
          const data = { fragments: fragment };   
          // logger.debug(`[get.js] retrieved fragments: ${data}`);
          res.status(200).json(createSuccessResponse(data));
        })
        .catch((err) => {
          `Unable to retrieve fragments: ${err}`;
        });  
    }
    else if (req.originalUrl === '/v1/fragments?expand=1') {
      Fragment.byUser(req.user, true)
        .then((fragment) => {
          const data = { fragments: fragment };
          logger.debug(`[get.js] retrieved fragments + metadata: ${JSON.stringify(data, null, 4)}`);
          res.status(200).json(createSuccessResponse(data));
        })
        .catch((err) => {
          `Unable to retrieve fragments: ${err}`;
        });
    }
    else {
      res.status(404).json(createErrorResponse(404, `invalid URL`));
    }
  }
};
