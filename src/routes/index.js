// src/routes/index.js

const express = require('express');

// version and author from package.json
const { version, author } = require('../../package.json');
const { hostname } = require('os'); //os.hostname()

// Create a router that we can use to mount our API
const router = express.Router();

// Our authentication middleware
const { authenticate } = require('../authorization');

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all so you have to be authenticated in order to access.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Clients shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');

  res.status(200).json(
    {
      status: "ok",
      author,
      githubUrl: 'https://github.com/siusie/fragments',
      version,
      // Include the host name in the response
      hostname: hostname(),
    }
  );
});

module.exports = router;
