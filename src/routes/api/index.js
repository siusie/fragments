// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const router = express.Router();  // Create a router on which to mount our API endpoints
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

// Support sending various Content-Types on the body up to 5M in size
// https://expressjs.com/en/api.html#express.raw
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`).
      // If not, `req.body` will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`.
      // A try-catch block is used here to handle errors generated by contentType.parse().
      // The error will result in req.body === `{}`, which will be handled in post.js or put.js
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch (err) {
        logger.error(err);
      }      
    },
  });

// GET /fragments
router.get('/fragments', require('./get'));

// GET /fragments/:id
router.get('/fragments/:id', require('./get-data'));

// GET /fragments/:id/info
router.get('/fragments/:id/info', require('./get-metadata'));

// POST /fragments
router.post('/fragments', rawBody(), require('./post'));

// DELETE /fragments/:id
router.delete('/fragments/:id', require('./delete'));

// PUT /fragments/:id
router.put('/fragments/:id', rawBody(), require('./put'));

module.exports = router;
