//  src/model/fragment.js

// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');

// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// https://github.com/markdown-it/markdown-it
const md = require('markdown-it')();

// For image manipulation; see https://sharp.pixelplumbing.com/
const sharp = require('sharp');

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
  'text/markdown',
  'text/html',
  'text/plain',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif'
];

// Generate an ISO 8601 Date string
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
const isoDate = (date) => (date || new Date).toISOString()

// ownerId and type are required
class Fragment {

  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    typeof id === 'string' ? this.id = id : this.id = randomUUID(id);
    if (!ownerId) {
      throw new Error(`ownerId is required`);
    }
    this.ownerId = ownerId;    

    // Converting an invalid date will generate an error 
    this.created = isoDate(created);
    this.updated = isoDate(updated);

    // Validating content-type
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Type is not supported; received ${type}`);
    }
    this.type = type;

    // Size must be a number
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
    if (!(fragment instanceof Fragment)) {
      // Convert to a Fragment object first if retrieving fragment data & metadata from the DB
      // otherwise, we can't use its methods
      let fragment2 = new Fragment({
        ownerId: fragment.ownerId,
        id: fragment.id,
        type: fragment.type,
        size: fragment.size
      });
      // Set these two properties separately since their values are already date strings
      fragment2.created = fragment.created;       
      fragment2.updated = fragment.updated;
      return fragment2;
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
    this.updated = isoDate();
    return writeFragment(this);   
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Converts the fragment's data to another type
   * @param {string} convertTo the content-type to convert to
   * @returns Promise<Buffer>
   */
  async convertData(convertTo) {
    // To convert the fragment's data,
    // `convertTo` must be one of the supported types
    // AND the current fragment's data type can be converted to it
    if (Fragment.isSupportedType(convertTo) && this.formats.includes(convertTo)) {

      const { type } = contentType.parse(this.type);
      const data = await this.getData();
      
      if (type === 'text/markdown' && convertTo === 'text/html') {
        return md.render(data.toString());
      }      
      else if (type !== convertTo && type.includes('image/')) {
        return sharp(data).toFormat(convertTo.split('/')[1]).toBuffer();          
      }
      // An extension can be the fragment's current type OR the extension is .txt --> return the unmodified data
      // Converting to plain text does not require further modification
      return data;
    }
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
    this.updated = isoDate();

    // If the type is a JPEG image, compress it.
    // Compression reduces file size without compromising image quality.
    if (this.type.includes('image/jpeg')) {
      const dataCompressed = await sharp(data).jpeg({ mozjpeg: true }).toBuffer();
      this.size = Buffer.byteLength(dataCompressed);
      return writeFragmentData(this.ownerId, this.id, dataCompressed);
    }
    this.size = Buffer.byteLength(data);
    return writeFragmentData(this.ownerId, this.id, data);   
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
  get formats() {
    const { type } = contentType.parse(this.type);
    switch (type) {
      case 'text/plain':
        return ['text/plain'];
      case 'text/markdown':
        return ['text/markdown', 'text/html', 'text/plain'];
      case 'text/html':
        return ['text/html', 'text/plain'];
      case 'application/json':
        return ['application/json', 'text/plain'];
      default:
        return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    }
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain; charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return validTypes.includes(type);
  }
}

module.exports.Fragment = Fragment;
