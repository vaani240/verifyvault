const QRCode = require('qrcode');

const generateQR = async (verifyCode) => {
  try {
    if (!verifyCode) {
      throw new Error('Verify code is required');
    }

    const baseUrl = process.env.PUBLIC_VERIFY_BASE_URL;

    if (!baseUrl) {
      throw new Error('PUBLIC_VERIFY_BASE_URL not defined');
    }

    const normalizedBase = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;

    const url = `${normalizedBase}/verify/${verifyCode}`;

    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 320,
    });

    return {
      url,
      qrCodeDataUrl,
    };

  } catch (error) {
    throw new Error(`QR generation failed: ${error.message}`);
  }
};

module.exports = generateQR;