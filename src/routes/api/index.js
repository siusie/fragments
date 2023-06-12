// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

const contentType = require('content-type');

const { Fragment} = require('../../model/fragment');

const logger = require('../../logger');

// Support sending various Content-Types on the body up to 5M in size
// https://expressjs.com/en/api.html#express.raw
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      logger.debug(`[In src/routes/api/index.js] parsed content type: ${type} | is a supported type? ${Fragment.isSupportedType(type)}`);      
      return Fragment.isSupportedType(type);
    },
  });


// GET /v1/fragments
router.get('/fragments', require('./get'));

// GET /v1/fragments/:id
router.get('/fragments/:id', require('./get'));

// POST /v1/fragments
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
