import Tesseract from 'tesseract.js';

export async function getTextFromFile(file: File) {
  const result = await Tesseract.recognize(file, 'eng', {
    logger: m => console.log(m),
  });
  console.log('result from Tesseract.recognize() with file', file.name);
  console.log(result);
  return result.data.text;
}

export async function getTextFromFiles(files: File[]) {
  const textPromises = files.map(file => getTextFromFile(file));
  return Promise.all(textPromises);
}
