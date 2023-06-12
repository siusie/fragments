// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

module.exports = (req, res) => {
  
  // generate an error response if:
  // content type is invalid (req.body is not a buffer),
  // file is empty (buffer bytes = 0)
  if (!Buffer.isBuffer(req.body) || Buffer.byteLength(req.body) === 0) { 
    res.status(415).json(createErrorResponse(415, `content-type is not supported`));
  } else {
    const { type } = contentType.parse(req);
    logger.debug(`[post.js] type: ${type}`);
    
    // create a new fragment object and save it to the db
    let fragment = new Fragment({ ownerId: req.user, type: type });

    fragment
      .save()
      .then(fragment.setData(req.body).then(() => {
        logger.debug(`SAVED DATA SUCCESSFULLY`);

        res
          .setHeader('Location', `${req.headers.host}/v1/fragments/${fragment.id}`)
          .status(201)
          .json(createSuccessResponse({fragment}));    
      }))      
      .catch((err) => {
        logger.error(`Error saving fragment: ${err}`);
      });
  }
};
