const express = require('express');
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// Gelen veriyi (JSON) okuyabilmek için ayar
app.use(express.json());
app.use(express.static('public')); // public klasörünü dışarı açar

// Ana sayfa rotası
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Rotası: Mail Gönderme
app.post('/api/send', async (req, res) => {
  const { emails, subject, message } = req.body;

  if (!emails || emails.length === 0) {
    return res.status(400).json({ error: 'Mail listesi boş.' });
  }

  try {
    // Resend Batch gönderim (Tek seferde çoklu gönderim)
    // Not: Ücretsiz planda günlük limitler olabilir.
    const data = await resend.batch.send(
      emails.map((email) => ({
        from: 'Onboarding <onboarding@resend.dev>', // Domain doğrulayınca burayı değiştir: 'Haber <info@site.com>'
        to: email,
        subject: subject,
        html: `<p>${message}</p><br><br><small><a href="#">Abonelikten Çık</a></small>`,
      }))
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));

module.exports = app; // Vercel için gerekli
