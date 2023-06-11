// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

// a function to get the file extension
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {

  // an ID is present in the url
  if (req.params.id) {
    const extension = getFileExtension(req.params.id);
    logger.debug(`[get.js] got extension: ${extension}`);
    
    // attempt to retrieve the fragment from db
    // currently only text/plain is supported
    if (extension === "" || extension === "txt") {

      // extract the filename w/o extension
      const id = (extension === "txt") ? (req.params.id).split(".txt")[0] : req.params.id;
      logger.debug(`chopped fragment id: ${id}`);

      Fragment.byId(req.user, id).then((fragment) => {
      fragment.getData().then((data) => {
        logger.info(`got fragment data: ${data}`);
        res.status(200).setHeader('Content-Type', fragment.type).send(data);    
      });
    }
    ).catch((err) => {
      logger.error(`${err}`);
      res.status(404).json(createErrorResponse(404, `${err}`));      
    }
    );
    } else {
      res.status(415).json(createErrorResponse(415, `unable to convert to ${extension}`));
    }      
  }

  // no ID, retrieve a list of fragments belonging to the current user
  else {
    // currently retrieves an array of fragment IDs
    // still need to implement the `expand` functionality
    // i.e., GET /fragments?expand=1
    Fragment.byUser(req.user)
      .then((fragment) => {
        const data = {fragments:fragment}       
        logger.info(`[get.js] retrieved fragments: ${data}`);
        res.status(200).json(createSuccessResponse(data));
      })
      .catch((err) => {
        `Unable to retrieve fragments: ${err}`
      });
  }
};
