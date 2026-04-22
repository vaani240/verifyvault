const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const https = require('https');

const hashBuffer = async (buffer) => {
  try {
    if (!buffer) {
      throw new Error('Buffer is required for hashing');
    }

    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (error) {
    throw new Error(`Failed to hash buffer: ${error.message}`);
  }
};

const hashLocalFile = async (filePath) =>
  new Promise((resolve, reject) => {
    try {
      if (!filePath) {
        return reject(new Error('File path is required for hashing'));
      }

      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (error) => reject(new Error(`Failed to read local file: ${error.message}`)));

      return null;
    } catch (error) {
      return reject(new Error(`Failed to hash local file: ${error.message}`));
    }
  });

const hashRemoteFile = async (fileUrl) =>
  new Promise((resolve, reject) => {
    try {
      if (!fileUrl) {
        return reject(new Error('File URL is required for hashing'));
      }

      const client = fileUrl.startsWith('https') ? https : http;
      const hash = crypto.createHash('sha256');

      client
        .get(fileUrl, (response) => {
          if (response.statusCode && response.statusCode >= 400) {
            return reject(new Error(`Failed to fetch remote file, status: ${response.statusCode}`));
          }

          response.on('data', (chunk) => hash.update(chunk));
          response.on('end', () => resolve(hash.digest('hex')));
          response.on('error', (error) => reject(new Error(`Failed while reading remote file: ${error.message}`)));

          return null;
        })
        .on('error', (error) => reject(new Error(`Failed to fetch remote file: ${error.message}`)));

      return null;
    } catch (error) {
      return reject(new Error(`Failed to hash remote file: ${error.message}`));
    }
  });

const hashFile = async ({ buffer, filePath, fileUrl }) => {
  try {
    if (buffer) {
      return await hashBuffer(buffer);
    }

    if (filePath) {
      return await hashLocalFile(filePath);
    }

    if (fileUrl) {
      return await hashRemoteFile(fileUrl);
    }

    throw new Error('Provide one source: buffer, filePath, or fileUrl');
  } catch (error) {
    throw new Error(`Hash generation failed: ${error.message}`);
  }
};

module.exports = hashFile;
