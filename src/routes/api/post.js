// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

module.exports = async (req, res) => {
  
  // generate an error response if:
  // content type is invalid (req.body is not a buffer),
  // file is empty (buffer bytes = 0)
  if (!Buffer.isBuffer(req.body) || Buffer.byteLength(req.body) === 0) { 
    return res.status(415).json(createErrorResponse(415, 'content-type is not supported'));
  } 

  // getting the content type (specified by the client)
  const { type } = contentType.parse(req);
  logger.debug(`[post.js] type: ${type}`);
  
  // create a new fragment object
  let fragment = new Fragment({ ownerId: req.user, type: type });

  // Attempt to save fragment to the db
  try {
    await fragment.save();
    await fragment.setData(req.body);
    logger.debug(`SAVED DATA SUCCESSFULLY`);

    res
      .setHeader('Location', `${req.protocol}://${process.env.API_URL}/v1/fragments/${fragment.id}`)
      .setHeader('Access-Control-Expose-Headers', 'Location')
      .status(201)
      .json(createSuccessResponse({fragment}));  
  }
  catch (err) {
      logger.error(`Error saving fragment - ${err}`);    
  }
};
