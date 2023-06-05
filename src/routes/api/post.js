// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

module.exports = (req, res) => {

  logger.info(`[post.js] Incoming req.body is a buffer? ${Buffer.isBuffer(req.body)}`);

  if (!Buffer.isBuffer(req.body)) { 
    res.status(415).json(createErrorResponse(415, `content-type is not supported`));
  } else {
    // https://fragments-api.com/v1/fragments/30a84843-0cd4-4975-95ba-b96112aea189
    // logger.info(`request: ${(req.user)}`);

    // Use info from req to initiate a fragment object
    const { type } = contentType.parse(req);
    const fragment = new Fragment({ ownerId: req.user, type: type });
    fragment.save().then(fragment.setData(req.body)).catch(`error saving fragment object`);  // maybe here create an error message

    // const baseUrl = (process.env.API_URL || req.headers.host);
    // let url = new URL("/fragments", baseUrl);
    // logger.info(`created URL: ${url}`);
    

    res
      .setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`)
      .setHeader('Content-Type', type)
      .status(201)
      .json(createSuccessResponse({ fragment }));
  }
};
