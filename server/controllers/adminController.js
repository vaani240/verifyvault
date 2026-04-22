const Document = require('../models/Document');
const User = require('../models/User');
const generateQR = require('../utils/generateQR');

const ADMIN_KEY = 'verifyvault-admin-maintenance';

const regenerateQrCodes = async (req, res) => {
  try {
    const adminKey = String(req.header('x-admin-key') || '').trim();

    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({ message: 'Unauthorized admin access' });
    }

    const documents = await Document.find({}, { verifyCode: 1 });

    const updates = await Promise.all(
      documents.map(async (document) => {
        const { qrCodeDataUrl } = await generateQR(document.verifyCode);

        return {
          updateOne: {
            filter: { _id: document._id },
            update: { $set: { qrCodeUrl: qrCodeDataUrl } },
          },
        };
      })
    );

    if (updates.length > 0) {
      await Document.bulkWrite(updates);
    }

    return res.status(200).json({
      message: 'QR codes regenerated successfully',
      updatedCount: documents.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to regenerate QR codes' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, role: 1, isApproved: 1 }).sort(
      { createdAt: -1 }
    );

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
};

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIssuers = await User.countDocuments({ role: 'issuer' });
    const totalRecipients = await User.countDocuments({ role: 'recipient' });
    const totalDocuments = await Document.countDocuments();

    return res.status(200).json({
      stats: {
        totalUsers,
        totalDocuments,
        totalIssuers,
        totalRecipients,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
};

const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(userId, { isApproved: true }, { new: true }).select(
      { name: 1, email: 1, role: 1, isApproved: 1 }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User approved successfully', user });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to approve user' });
  }
};

module.exports = {
  regenerateQrCodes,
  getUsers,
  getStats,
  approveUser,
};