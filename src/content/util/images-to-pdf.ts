import { createNewFileInDirectory, writeBlobToFile } from './files';
import { addImageToJsPdf, createEmptyJsPdf } from './js-pdf';

export async function createPdfFileFromImgFileHandles(
  fileName: string,
  directoryHandle: FileSystemDirectoryHandle,
  imgFileHandles: FileSystemFileHandle[]
) {
  const pdfBlob = await createPdfBlobFromImgFileHandles(imgFileHandles);
  const pdfFileHandle = await createNewFileInDirectory(
    fileName,
    directoryHandle
  );
  return writeBlobToFile(pdfBlob, pdfFileHandle);
}

export async function createPdfBlobFromImgFileHandles(
  imgFileHandles: FileSystemFileHandle[]
) {
  const doc = createEmptyJsPdf();

  for (const imgFileHandle of imgFileHandles) {
    const imgFile = await imgFileHandle.getFile();
    await addImageToJsPdf(imgFile, doc);
  }

  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
