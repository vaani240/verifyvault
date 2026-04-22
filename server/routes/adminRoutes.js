const express = require('express');
const router = express.Router();

const generateQR = require('../utils/generateQR');
const Document = require('../models/Document');

// ✅ NO AUTH (as required)
router.get('/regenerate-qr', async (req, res) => {
  try {
    const documents = await Document.find({});

    let count = 0;

    for (const doc of documents) {
      if (!doc.verifyCode) continue;

      const { qrCodeDataUrl } = await generateQR(doc.verifyCode);

      await Document.findByIdAndUpdate(doc._id, {
        qrCodeUrl: qrCodeDataUrl,
      });

      count++;
    }

    res.json({
      message: `Regenerated QR for ${count} documents`,
      count,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'QR regeneration failed',
    });
  }
});

module.exports = router;