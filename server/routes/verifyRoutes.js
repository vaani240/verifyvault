const express = require('express');
const { verifyDocument } = require('../controllers/verifyController');

const router = express.Router();

router.get('/:verifyCode', verifyDocument);

module.exports = router;
