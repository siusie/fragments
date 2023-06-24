// src/routes/api/get.js

const { createSuccessResponse} = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments belonging to the current user
 */
module.exports = async (req, res) => {

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
