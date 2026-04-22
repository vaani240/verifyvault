const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const Document = require('../models/Document');
const User = require('../models/User');
const hashFile = require('../utils/hashFile');
const generateQR = require('../utils/generateQR');

const documentTypes = new Set([
  'Medical Certificate',
  'Experience Letter',
  'Degree Certificate',
  'Internship Certificate',
  'Identity Document',
  'Other',
]);

const mimeToExtension = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const looksLikePlaceholder = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  return !normalized || normalized.startsWith('your ') || normalized.includes('cloudinary');
};

const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  return (
    !looksLikePlaceholder(CLOUDINARY_CLOUD_NAME) &&
    !looksLikePlaceholder(CLOUDINARY_API_KEY) &&
    !looksLikePlaceholder(CLOUDINARY_API_SECRET)
  );
};

const configureCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary environment variables are not configured with valid values');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
};

const generateVerifyCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  let exists = true;

  while (exists) {
    code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    exists = await Document.exists({ verifyCode: code });
  }

  return code;
};

const uploadToCloudinary = async (file) => {
  try {
    if (!file || !file.buffer || !file.mimetype) {
      throw new Error('Valid file is required for Cloudinary upload');
    }

    configureCloudinary();

    const fileBase64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${fileBase64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: process.env.CLOUDINARY_FOLDER || 'verifyvault-documents',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return uploadResult.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const uploadToLocalStorage = async (file, req) => {
  try {
    if (!file || !file.buffer || !file.mimetype) {
      throw new Error('Valid file is required for local upload');
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const extension = mimeToExtension[file.mimetype] || 'bin';
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
  } catch (error) {
    throw new Error(`Local upload failed: ${error.message}`);
  }
};

const uploadDocumentFile = async (file, req) => {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file);
  }

  return uploadToLocalStorage(file, req);
};

const uploadDocument = async (req, res) => {
  try {
    const { title, issuedTo } = req.body;
let { documentType } = req.body;

if (!title || !issuedTo) {
  return res.status(400).json({ message: 'Title and issuedTo are required' });
}

if (!documentType) {
  documentType = 'General Document';
}

if (documentType !== 'General Document' && !documentTypes.has(documentType)) {
  return res.status(400).json({
    message: 'Document type must be one of the approved options',
  });
}

    if (!req.file) {
      return res.status(400).json({ message: 'Document file is required' });
    }

    // Accept either recipient Mongo _id or recipient email to make issuer input flexible.
    const issuedToValue = String(issuedTo || '').trim();
    const recipientLookupQuery = mongoose.Types.ObjectId.isValid(issuedToValue)
      ? { _id: issuedToValue }
      : { email: issuedToValue.toLowerCase() };

    const recipient = await User.findOne(recipientLookupQuery);

    if (!recipient) {
      return res.status(400).json({ message: 'Recipient account not found. Enter a valid recipient Mongo ID or recipient email.' });
    }

    if (recipient.role !== 'recipient') {
      return res.status(400).json({
        message: 'The provided account exists but is not a recipient. Register/login with a recipient role account and use that email.',
      });
    }

    const fileHash = await hashFile({ buffer: req.file.buffer });
    const fileUrl = await uploadDocumentFile(req.file, req);
    const verifyCode = await generateVerifyCode();
    const { qrCodeDataUrl } = await generateQR(verifyCode);

    const document = await Document.create({
      title,
      documentType,
      issuedTo: recipient._id,
      issuedBy: req.user._id,
      fileUrl,
      fileHash,
      verifyCode,
      qrCodeUrl: qrCodeDataUrl,
      status: 'active',
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('issuedTo', 'name email organisation')
      .populate('issuedBy', 'name email organisation');

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: populatedDocument,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Document upload failed' });
  }
};

const getIssuerDocuments = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'issuer') {
      return res.status(403).json({ message: 'Only issuers can view issued documents' });
    }

    const documents = await Document.find({ issuedBy: req.user._id })
      .populate('issuedTo', 'name email organisation')
      .sort({ createdAt: -1 });

    return res.status(200).json({ documents });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch issuer documents' });
  }
};

const getRecipientDocuments = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'recipient') {
      return res.status(403).json({ message: 'Only recipients can view received documents' });
    }

    const documents = await Document.find({ issuedTo: req.user._id })
      .populate('issuedBy', 'name email organisation')
      .sort({ createdAt: -1 });

    return res.status(200).json({ documents });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch recipient documents' });
  }
};

const revokeDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'issuer') {
      return res.status(403).json({ message: 'Only issuers can revoke documents' });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (String(document.issuedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only revoke your own documents' });
    }

    if (document.status === 'revoked') {
      return res.status(400).json({ message: 'Document is already revoked' });
    }

    document.status = 'revoked';
    await document.save();

    return res.status(200).json({
      message: 'Document revoked successfully',
      document,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to revoke document' });
  }
};

module.exports = {
  uploadDocument,
  getIssuerDocuments,
  getRecipientDocuments,
  revokeDocument,
};
