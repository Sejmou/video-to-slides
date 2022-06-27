import { createNewFileInDirectory, writeBlobToFile } from './files';

export async function pdfOCR(pdfFile: File) {
  const data = new FormData();
  data.append('File', pdfFile);

  const response = await fetch(
    'https://v2.convertapi.com/convert/pdf/to/ocr?Secret=IY58j20e5lntKntE&StoreFile=true',
    {
      method: 'POST',
      body: data,
    }
  );

  return response.blob();
}

export async function createOcrPdf(
  pdfFileHandle: FileSystemFileHandle,
  directoryHandle: FileSystemDirectoryHandle
) {
  const pdfFile = await pdfFileHandle.getFile();
  const pdfOcrBlob = await pdfOCR(pdfFile);
  const pdfOcrFileName = pdfFile.name.replace('.pdf', '_ocr.pdf');
  const pdfOcrFileHandle = await createNewFileInDirectory(
    `${pdfOcrFileName}.pdf`,
    directoryHandle
  );
  return writeBlobToFile(pdfOcrBlob, pdfOcrFileHandle);
}
