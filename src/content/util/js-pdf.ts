import jsPDF from 'jspdf';
import { fileToDataUrl } from './files';
import { VIDEOHEIGHT, VIDEOWIDTH } from './globals';

export function createEmptyJsPdf() {
  const doc = new jsPDF();
  doc.deletePage(1);
  return doc;
}

export async function addImageToJsPdf(imgFile: File, doc: jsPDF) {
  doc.addPage([VIDEOHEIGHT, VIDEOWIDTH], 'landscape');
  const imgDataUrl = await fileToDataUrl(imgFile);
  const img = document.createElement('img');
  img.src = imgDataUrl;
  doc.addImage({
    imageData: img,
    x: 0,
    y: 0,
    width: VIDEOWIDTH,
    height: VIDEOHEIGHT,
    compression: 'SLOW',
  });
}
