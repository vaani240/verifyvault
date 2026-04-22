const express = require('express');
const {
  uploadDocument,
  getIssuerDocuments,
  getRecipientDocuments,
  revokeDocument,
} = require('../controllers/documentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post(
  '/upload',
  protect,
  authorizeRoles('issuer'),
  upload.single('file'),
  uploadDocument
);

router.get('/issuer', protect, authorizeRoles('issuer'), getIssuerDocuments);
router.get('/recipient', protect, authorizeRoles('recipient'), getRecipientDocuments);
router.patch('/revoke/:id', protect, authorizeRoles('issuer'), revokeDocument);

module.exports = router;
