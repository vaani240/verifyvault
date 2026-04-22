const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
  type: String,
  required: false,
  default: 'General Document',
  trim: true,
},
    issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileHash: {
      type: String,
      required: true,
      trim: true,
    },
    verifyCode: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
      maxlength: 8,
      uppercase: true,
      trim: true,
    },
    qrCodeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
