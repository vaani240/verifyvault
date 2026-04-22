const Document = require('../models/Document');
const crypto = require('crypto');
const axios = require('axios');

const hashDocumentFromUrl = async (fileUrl) => {
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  return crypto.createHash('sha256').update(Buffer.from(response.data)).digest('hex');
};

const verifyDocument = async (req, res) => {
  try {
    const { verifyCode } = req.params;

    const document = await Document.findOne({ verifyCode })
      .populate('issuedTo', 'name')
      .populate('issuedBy', 'organisation');

    if (!document) {
      return res.status(200).json({ result: 'NOT_FOUND' });
    }

    if (document.status === 'revoked') {
      return res.status(200).json({
        result: 'REVOKED',
        document: {
          title: document.title,
          documentType: document.documentType,
          issuedTo: document.issuedTo?.name || 'Unknown',
          issuedBy: document.issuedBy?.organisation || 'Unknown',
          createdAt: document.createdAt,
        },
      });
    }

    const currentFileHash = await hashDocumentFromUrl(document.fileUrl);
    const savedHash = String(document.fileHash || '').trim().toLowerCase();

    if (savedHash && currentFileHash.toLowerCase() !== savedHash) {
      return res.status(200).json({ result: 'TAMPERED' });
    }

    return res.status(200).json({
      result: 'GENUINE',
      document: {
        title: document.title,
        documentType: document.documentType,
        issuedTo: document.issuedTo?.name || 'Unknown',
        issuedBy: document.issuedBy?.organisation || 'Unknown',
        fileUrl: document.fileUrl,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ result: 'NOT_FOUND' });
  }
};

module.exports = {
  verifyDocument,
};
