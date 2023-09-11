import { VIDEOHEIGHT, VIDEOWIDTH } from './globals';

const canvas = initVideoCanvas();

export async function storeVideoSnapshot(
  video: HTMLVideoElement,
  fileHandle: FileSystemFileHandle
) {
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const snapshotBlob = await canvasToBlob(canvas);
  const writableStream = await fileHandle.createWritable();
  await writableStream.write(snapshotBlob!);
  await writableStream.close();
  return snapshotBlob;
}

function initVideoCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = VIDEOWIDTH;
  canvas.height = VIDEOHEIGHT;
  return canvas;
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve);
  });
}
