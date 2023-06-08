// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

module.exports = (req, res) => {

  // logger.debug(`[post.js] Incoming req.body is a buffer? ${Buffer.isBuffer(req.body)} and its length is ${Buffer.byteLength(req.body)}`);
  // logger.debug(`current user: ${(req.user)}`);

  // generate an error response if:
  // content type is invalid (req.body is not a buffer),
  // file is empty (buffer bytes = 0)
  if (!Buffer.isBuffer(req.body) || Buffer.byteLength(req.body) === 0) { 
    res.status(415).json(createErrorResponse(415, `content-type is not supported`));
  } else {

    logger.debug(`[post.js] req.body: ${Buffer.isBuffer(req.body)}`);
    const { type } = contentType.parse(req);
    logger.debug(`[post.js] type: ${type}`);
    
    // create a new fragment object and save it to the db
    let fragment = new Fragment({ ownerId: req.user, type: type });

    fragment
      .save()
      .then(fragment.setData(req.body).then(() => {
        logger.debug(`SAVED DATA SUCCESSFULLY`);

        res
          .setHeader('Location', `${process.env.API_URL || req.headers.host}/v1/fragments/${fragment.id}`)
          .setHeader('Content-Type', type)
          .status(201)
          .json(createSuccessResponse({fragment}));
        // logger.debug(`got back: ${JSON.stringify(createSuccessResponse({fragment}))}`); 
        // const data = fragment.getData().then((d) => { d.string }).catch(logger.info(`ERROR`));
        // logger.debug(`created fragment - ownerId: ${fragment.ownerId}, type: ${fragment.type}, data: ${(data.then((d)=>{d.string}))}`);        
      }))      
      .catch((err) => {
        logger.error(`Error saving fragment: ${err}`);
      });
  }
};
