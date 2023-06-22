// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments belonging to the current user
 */
module.exports = async (req, res) => {
  
  // if (req.originalUrl === '/v1/fragments?expand=1') {
  //   // const fragment = await Fragment.byUser(req.user, true);
  //   try {
  //     const data = { fragments: await Fragment.byUser(req.user, true) };
  //     return res.status(200).json(createSuccessResponse(data));
  //   } catch (err) {
  //     return err;
  //   }
  // }


// last case: get all fragment IDs
  
  // An ID is present in the url:
  // GET /fragments/:id (data of 1 fragment)
  // GET /fragments/:id/info (metadata of 1 fragment)
  // if (req.params.id) {
  //   const extension = getFileExtension(req.params.id);
  //   logger.debug(`[get.js] got extension: ${extension}`);
    
  //     // if the URL endpoint contains /:id/info,
  //     // retrieve that fragment's metadata
  //   if (req.originalUrl === `/v1/fragments/${req.params.id}/info`) {

  //     // the id cannot contain an extension
  //     if (extension) {
  //       res.status(404).json(createErrorResponse(404, `Invalid ID, got ${req.params.id}`)); //add return here
  //     }
  //     else {
  //       Fragment.byId(req.user, req.params.id)
  //         .then((fragment) => {
  //           logger.info(`got fragment: ${JSON.stringify(fragment, null, 4)}`);
  //           res.status(200).json(createSuccessResponse({ fragment }));
  //         })
  //         .catch((err) => {
  //           logger.error(`${err}`);
  //           res.status(404).json(createErrorResponse(404, `${err}`));
  //         });
  //     }
  //   }
    
  //   // ONLY /:id --> retrieve fragment
  //   // attempt to retrieve the fragment from db
  //   // currently only text/plain is supported
  //   else if (extension === "" || extension === "txt") {

  //     // extract fragment id w/o extension
  //     const id = (extension === "txt") ? (req.params.id).split(".txt")[0] : req.params.id;
  //     logger.debug(`got fragment id: ${id}, original URL: ${req.originalUrl}`);

  //     // retrieve the fragment's data
  //       Fragment.byId(req.user, id)
  //         .then((fragment) => {
  //         fragment.getData().then((data) => {
  //           logger.info(`got fragment data: ${data}`);
  //           res.status(200).setHeader("Content-Type", fragment.type).send(data);
  //           });
  //         })
  //         .catch((err) => {
  //           logger.error(`${err}`);
  //           res.status(404).json(createErrorResponse(404, `${err}`));
  //         });
  //   }
  //   else {
  //     res.status(415).json(createErrorResponse(415, `unable to convert to ${extension}`));
  //   }
  // }

  // No ID in URL: return an array of fragment IDs, an array of fragment metadata, or error  
  try {
    let data;

    if (req.originalUrl === '/v1/fragments') {
      data = { fragments: await Fragment.byUser(req.user) };
      return res.status(200).json(createSuccessResponse(data));
    }
    // /v1/fragments?expand=1
    data = { fragments: await Fragment.byUser(req.user, true) };
    return res.status(200).json(createSuccessResponse(data));
  }
  catch (err) {
      logger.error(err);
      return err;
  }
};
