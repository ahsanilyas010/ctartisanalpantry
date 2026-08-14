const Busboy = require('busboy');
const { put } = require('@vercel/blob');
const { requireAdmin } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const result = await new Promise((resolve, reject) => {
      const bb = Busboy({ headers: req.headers });
      let settled = false;

      bb.on('file', (fieldName, file, info) => {
        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', async () => {
          if (settled) return;
          settled = true;
          try {
            const buffer = Buffer.concat(chunks);
            const filename = info.filename || `upload-${Date.now()}`;
            const blob = await put(filename, buffer, {
              access: 'public',
              contentType: info.mimeType || 'application/octet-stream',
            });
            resolve({ url: blob.url });
          } catch (err) {
            reject(err);
          }
        });
      });

      bb.on('error', (err) => { if (!settled) { settled = true; reject(err); } });
      bb.on('finish', () => { if (!settled) { settled = true; reject(new Error('No file received')); } });
      req.pipe(bb);
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('upload error:', err);
    res.status(500).json({ error: String(err.message || err) });
  }
};

module.exports.config = { api: { bodyParser: false } };
