// src/routes/api/get-data.js
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const path = require('node:path'); 
const mime = require('mime-types');

/**
* GET /v1/fragments/:id
* GET /v1/fragments/:id.ext
*/

module.exports = async (req, res) => { 
 
  const extension = path.extname(req.params.id).toLowerCase();
  const type = mime.lookup(extension); // false if extension is invalid or nonexistent
  logger.debug(`[get.js] The content-type associated with ${extension} is ${type}`);
  
  // Return a 415 error response if the extension is unknown
  if (extension !== '' && !type) {
    return res.status(415).json(createErrorResponse(415, `The extension ${extension} is invalid`));
  }

  // Extract fragment id w/o extension.
  // Note: path.basename() treats the extension as a case-sensitive string 
  // and won't extract id if extension's case and req.originalUrl's case do not match, 
  // so they're both in lowercase
  const id = extension ? path.basename(req.originalUrl.toLowerCase(), extension) : req.params.id;
  logger.debug(`got fragment id: ${id}, original URL: ${req.originalUrl}`);

  // At this point, id contains either no extension or a valid extension (which may or may not be supported)
  try {
    const fragment = await Fragment.byId(req.user, id); // retrieve the fragment
    let data;

    // If type === false here, it would mean that there's no extension --> retrieve the binary data
    // else there is an extension --> attempt to convert to that type
    data = type ? await fragment.convertData(type) : await fragment.getData();
    logger.debug(`got fragment data: ${data}`);
    
    // `data` will be an empty string if attempting to convert to an unsupported content-type
    return data ? res.status(200).setHeader('Content-Type', type).send(data) : res.status(415).json(createErrorResponse(415, `Unable to convert to ${extension}`));
  } catch (err) {
    logger.error(err);
    return res.status(404).json(createErrorResponse(404, err.message));
  } 
}; 
