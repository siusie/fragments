// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// https://www.npmjs.com/package/mime-types
const mime = require('mime-types');

// const logger = require('../logger');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

// Accepted content types
const validTypes = [
  `text/plain`,
  `text/plain; charset=utf-8`,
  /*
   Currently, only text/plain is supported. 
   Others will be added later...
      `text/markdown`,
      `text/html`,
      `application/json`,
      `image/png`,
      `image/jpeg`,
      `image/webp`,
      `image/gif`,
  */
];

// Generate an ISO 8601 Date string
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
const isoDate = () => (new Date).toISOString()

// ownerId and type are required
class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    typeof id === 'string' ? this.id = id : this.id = randomUUID(id);

    if (!ownerId) throw new Error(`ownerId is required`);
    this.ownerId = ownerId;    

    // Converting an invalid date will generate an error 
    if (created) {
      this.created = created.toISOString();
    }
    else if (updated) {
      this.updated = updated.toISOString();
    }
    else {
      this.created = isoDate();
      this.updated = isoDate();
    }   
    
    // checks if the content-type used to instantiate this fragment is of valid MIME type
    const validType = mime.contentType(type);

    // throw an error if:
    // type is valid but not supported OR
    // type is not valid at all
    if (!validType) {
      throw new Error(`Invalid fragment type`);
    }
    else if ((validType && !Fragment.isSupportedType(validType))) {
      throw new Error(`Invalid type; received ${validType}`);
    }
    this.type = type;

    // size must be a number
    if (typeof size !== 'number' || size < 0) {
      throw new Error(`size must be a non-negative number; got ${size}`);
    }
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) { 
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    let fragment = await readFragment(ownerId, id);
    if (!(await readFragment((ownerId), id))) {
      throw new Error(`fragment does not exist for this user`);
    }
    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    await writeFragment(this);
    this.updated = isoDate();
    return Promise.resolve();   
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Sets the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {  
    if (!Buffer.isBuffer(data)) {
      throw new Error(
        `data must be a Buffer`
      );
    }

    let promise = writeFragmentData(this.ownerId, this.id, data);
    this.size = Buffer.byteLength(data);
    this.updated = isoDate();
    return promise;
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return (/^text\/[a-z]/).test(this.type);
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */

  // currently only supports plain text
  get formats() {
    const formats = ['text/plain',];
    return formats;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    return (validTypes.includes(value));
  }
}

module.exports.Fragment = Fragment;
