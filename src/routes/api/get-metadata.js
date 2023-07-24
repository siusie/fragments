//  src/routes/api/get-metadata.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

/**
* GET /v1/fragments/:id/info
* Given a fragment ID, retrieve its metadata
*/
module.exports = async (req, res) => { 
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.info(`got fragment: ${JSON.stringify(fragment, null, 4)}`);
    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error(err);
    return res.status(404).json(createErrorResponse(404, `${err}. Got ID ${req.params.id}`));
  }
};
