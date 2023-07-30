// src/routes/api/put.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

/**
 * PUT /v1/fragments/:id
 * Update the data for a fragment, given its id.
 * The type of the fragment cannot be changed.
 */
module.exports = async (req, res) => { 
  try {
    // Generate an error response if
    // Content-Type is invalid (req.body is not a buffer)
    if (!Buffer.isBuffer(req.body)) { 
      return res.status(415).json(createErrorResponse(415, 'Content-Type is not supported'));
    }
    
    // Empty fragments are not allowed
    if (!req.body.toString().replace(/\s/g, '').length || !Buffer.byteLength(req.body)) {
      return res.status(400).json(createErrorResponse(400, 'fragment data cannot be empty'));
    }
    
    // Attempt to retrieve the fragment
    let fragment = await Fragment.byId(req.user, req.params.id);

    // Parse the Content-Type from the request, which may or may not contain a charset.
    // Either way, we would have to convert `parsedType` from an object to string
    // to compare it with the existing fragment's Content-Type
    const parsedType = contentType.parse(req);
    const type = parsedType.parameters.charset ? parsedType.type + '; charset=' + parsedType.parameters.charset : parsedType.type;

    if (type !== fragment.type) {
      return res.status(400).json(createErrorResponse(400, 'A fragment\'s type cannot be changed!'));
    }

    // At this point, the fragment exists and the data & Content-Type in the request are valid 
    await fragment.save();
    await fragment.setData(req.body);

    // Modify the response body to include a list of valid fragment type conversions
    let updatedSuccessResponse = ({ ...fragment });
    updatedSuccessResponse.formats = fragment.formats;
    res
      .setHeader('Access-Control-Expose-Headers', 'Location')
      .status(200)
      .json(createSuccessResponse({fragment: updatedSuccessResponse})); 

  } catch (err) {
    logger.error(err);
    return res.status(404).json(createErrorResponse(404, err.message));
  }
};
