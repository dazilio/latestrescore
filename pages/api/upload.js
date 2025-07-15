import { IncomingForm } from 'formidable';
import fs from 'fs';
import extractText from '@/lib/extractText';

export const config = {
  api: { bodyParser: false },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return reject(err);
      }
      console.log('Form parsed:', files);
      resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  try {
    const { files } = await parseForm(req);
    if (!files?.file || !files.file[0]) {
      throw new Error('No file uploaded');
    }

    const file = files.file[0];
    console.log('File received:', file.originalFilename, file.filepath);

    const text = await extractText(file.filepath);
    console.log('Extracted text:', text.slice(0, 100));

    res.status(200).json({ text });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to parse or read resume.' });
  }
}
