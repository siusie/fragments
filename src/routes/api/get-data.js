// src/routes/api/get-data.js
const { createErrorResponse, createSuccessResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const path = require('node:path'); 
const mime = require('mime-types');

/**
* GET /v1/fragments/:id
* GET /v1/fragments/:id.ext
* Given a fragment ID, retrieve its contents (data)
*/

module.exports = async (req, res) => { 
 
  const extension = path.extname(req.params.id).toLowerCase();
  const type = mime.lookup(extension); // false if extension is invalid or nonexistent
  logger.debug(`got extension: ${extension ? extension : 'none'}, type from mime.lookup: ${type ? type : 'none'}`);
  
  // Return a 415 error response if there is an extension, but is unknown
  if (extension !== '' && !type) {
    return res.status(415).json(createErrorResponse(415, `The extension ${extension} is invalid`));
  }

  // Extract fragment id w/o extension.
  // Note: path.basename() treats the extension as a case-sensitive string 
  // and won't extract id if extension's case and req.originalUrl's case do not match
  // so convert both to lowercase
  const id = extension ? path.basename(req.originalUrl.toLowerCase(), extension) : req.params.id;
  logger.debug(`got fragment id: ${id}, original URL: ${req.originalUrl}`);

  // At this point, id contains either no extension or a valid extension (which may or may not be supported)
  try {
    // attempt to retrieve the fragment
    const fragment = await Fragment.byId(req.user, id);     

    // If type === false here, it would mean that there's no extension --> retrieve the binary data
    // else there is an extension --> attempt to convert to that type
    let data = type ? await fragment.convertData(type) : await fragment.getData();

    // If the fragment type is an image, encode it as a Base64 string and include in the response obj
    if (fragment.type.includes('image/') && data) {
      var b64encoded = data.toString('base64');
      var dataURL = `data:${type ? type : fragment.type};base64,${b64encoded}`;
      return res.status(200).json(createSuccessResponse({dataURL}));
    }
    
    // `data` will be an empty string if attempting to convert to an unsupported content-type
    return data ? res.status(200).setHeader('Content-Type', type ? type : fragment.type).send(data) : res.status(415).json(createErrorResponse(415, `Unable to convert to ${extension}`));
  } catch (err) {
    logger.error({ err }, 'GET fragment/:id error');
    return res.status(404).json(createErrorResponse(404, err.message));
  } 
}; 
