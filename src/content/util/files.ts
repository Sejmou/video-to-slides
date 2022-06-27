export async function writeBlobToFile(
  blob: Blob,
  fileHandle: FileSystemFileHandle
) {
  const permissionState = await fileHandle.queryPermission();
  if (permissionState !== 'granted') {
    const updatedState = await fileHandle.requestPermission();
    if (updatedState !== 'granted') {
      console.warn(
        'could not write to file',
        fileHandle.name,
        ', permission denied'
      );
    }
    return;
  }
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
  const permissionState = await directoryHandle.queryPermission();
  if (permissionState !== 'granted') {
    const updatedState = await directoryHandle.requestPermission();
    if (updatedState !== 'granted') {
      console.warn(
        'lacking permission to create file',
        fileName,
        'in directory',
        directoryHandle.name
      );
    }
  }

  return directoryHandle.getFileHandle(fileName, {
    create: true,
  });
}

export async function getFiles(fileHandles: FileSystemFileHandle[]) {
  const filePromises = fileHandles.map(handle => handle.getFile());
  return Promise.all(filePromises);
}
