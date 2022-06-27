export async function writeBlobToFile(
  blob: Blob,
  fileHandle: FileSystemFileHandle
) {
  const writableStream = await fileHandle.createWritable();
  await writableStream.write(blob);
  await writableStream.close();
  return fileHandle;
}

export async function fileToDataUrl(file: File) {
  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export async function createNewFileInDirectory(
  fileName: string,
  directoryHandle: FileSystemDirectoryHandle
) {
  return directoryHandle.getFileHandle(fileName, {
    create: true,
  });
}
