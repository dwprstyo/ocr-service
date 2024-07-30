const express = require('express');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const filePath = path.join(__dirname, req.file.path);

  
  (async () => {
    const worker = await createWorker('ind');
    const { data: { text } } = await worker.recognize(filePath);
    console.log(text);
    await worker.terminate();
    res.send(text);
  })().catch(err => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
