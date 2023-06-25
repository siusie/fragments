// src/routes/api/get-data.js
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const path = require('node:path'); 

// GET /v1/fragments/:id

module.exports = async (req, res) => { 
  const extension = path.extname(req.params.id);
  logger.debug(`[get.js] got extension: ${extension}`);

  // need to modify this so that it works for other file types
  if (extension !== '' && extension !== '.txt') {
    return res.status(415).json(createErrorResponse(415, `Unable to convert to ${extension}`));
  }

  // extract fragment id w/o extension
  const id = (extension === '.txt') ? (req.params.id).split('.txt')[0] : req.params.id;
  logger.debug(`got fragment id: ${id}, original URL: ${req.originalUrl}`);

  try {      
    const fragment = await Fragment.byId(req.user, id); // retrieve the fragment
    const data = await fragment.getData();  // retrieve the fragment's data
    logger.info(`got fragment data: ${data}`);
    return res.status(200).setHeader('Content-Type', fragment.type).send(data);
  } catch (err) {
    logger.error(err);
    return res.status(404).json(createErrorResponse(404, err.message));
  } 
};
