import { createNewFileInDirectory, getFiles, writeBlobToFile } from './files';
import { addImageToJsPdf, createEmptyJsPdf } from './js-pdf';
import { zip } from './py-emulation';
import { getTextFromFiles } from './tesseract-ocr';

export async function createPdfFileFromImgFileHandles(
  fileName: string,
  directoryHandle: FileSystemDirectoryHandle,
  imgFileHandles: FileSystemFileHandle[],
  ocr: boolean = false
) {
  // important: create file handle before blob!
  // if creating blob takes a lot of time (which it does when OCR is enabled), the browser seems to forget to ask the user for edit permission
  // afterwards, the  "User activation is required to request permissions" DOMException is thrown
  const pdfFileHandle = await createNewFileInDirectory(
    fileName,
    directoryHandle
  );
  const pdfBlob = await createPdfBlobFromImgFileHandles(imgFileHandles, ocr);
  return writeBlobToFile(pdfBlob, pdfFileHandle);
}

export async function createPdfBlobFromImgFileHandles(
  imgFileHandles: FileSystemFileHandle[],
  ocr: boolean
) {
  const doc = createEmptyJsPdf();

  const imgFiles = await getFiles(imgFileHandles);

  if (ocr) {
    console.time('img-ocr');
    const imgTexts = await getTextFromFiles(imgFiles);
    console.timeEnd('img-ocr');
    for (const [imgFile, ocrText] of zip(imgFiles, imgTexts)) {
      console.log('image', imgFile);
      console.log('ocrText', ocrText);
      await addImageToJsPdf(imgFile, doc, ocrText);
    }
  } else {
    for (const imgFile of imgFiles) {
      await addImageToJsPdf(imgFile, doc);
    }
  }

  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
