// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// for hashing emails (we are NOT storing the user's actual email address):
const hash = require('../hash');

// fragment metadata details:
// https://github.com/humphd/cloud-computing-for-programmers-summer-2023/blob/main/assignments/README.md#421-fragment-overview

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
  /*
   Currently, only text/plain is supported. Others will be added later.

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
const isoDate = (new Date).toISOString();

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    typeof id === 'string' ? this.id = id : this.id = randomUUID(id);
    this.ownerId = hash(ownerId);

    // Converting an invalid date will generate an error 
    if (created) {
      this.created = created.toISOString();
    }
    else if (updated) {
      this.updated = updated.toISOString();
    }
    else {
      this.created = isoDate;
      this.updated = isoDate;
    }   
 
    // Parsing the content-type header
    const c = contentType.parse(type);

    if (!validTypes.includes(c.type)) {
      throw new Error(`Invalid type; got ${c.type}`);
    }
    // Check if the passed-in type contains a parameter
    if (Object.keys(c.parameters).length === 0) {
      this.type = c.type;
    } else {
      this.type = type;
    }

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
    let fragmentsList = await listFragments(hash(ownerId), expand);
    return fragmentsList;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    let fragment = await readFragment(hash(ownerId), id);
    if (!(await readFragment(hash(ownerId), id))) {
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
    let promise = deleteFragment(hash(ownerId), id);
    return promise;
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    writeFragment(this).then();
    this.updated = (new Date).toISOString();
    return Promise.resolve();
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    let data = readFragmentData(this.ownerId, this.id);
    return Promise.resolve(data);
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
    this.updated = (new Date).toISOString();
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

  // TODO: update according to 
  // https://github.com/humphd/cloud-computing-for-programmers-summer-2023/blob/main/assignments/README.md#451-valid-fragment-conversions
  get formats() {
    const formats = ['text/plain'];
    return formats;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    return (value === 'text/plain' || value ==='text/plain; charset=utf-8');
  }
}

module.exports.Fragment = Fragment;
