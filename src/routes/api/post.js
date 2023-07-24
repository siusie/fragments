// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

module.exports = async (req, res) => {
  // Generate an error response if:
  // content type is invalid (req.body is not a buffer),
  // file is empty (buffer bytes = 0)
  if (!Buffer.isBuffer(req.body) || !Buffer.byteLength(req.body)) { 
    return res.status(415).json(createErrorResponse(415, 'content-type is not supported'));
  }

  // Empty fragments are not allowed 
  if (!req.body.toString().replace(/\s/g, '').length) {
    return res.status(403).json(createErrorResponse(403, 'fragment data cannot be empty'));
  }

  // getting the content type (specified by the client)
  const type = contentType.parse(req);
  logger.debug(`[post.js] parsed type: ${ JSON.stringify(type, null, 4) }`);

  
  // Create a new fragment object, making sure to include any character sets included with content-type
  let fragment = new Fragment({ ownerId: req.user, type: type.parameters.charset ? type.type + '; charset=' +  type.parameters.charset : type.type });

  // Attempt to save fragment to the db
  try {
    await fragment.save();
    await fragment.setData(req.body);

    res
      .setHeader('Location', `${req.protocol + `://` + (process.env.API_URL == 'localhost:8080' ? process.env.API_URL : req.headers.host)}/v1/fragments/${fragment.id}`)
      .setHeader('Access-Control-Expose-Headers', 'Location')
      .status(201)
      .json(createSuccessResponse({fragment}));  
  }
  catch (err) {
    logger.error(err);    
    throw new Error('Error saving fragment');
  }
};
