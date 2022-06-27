import jsPDF from 'jspdf';
import { fileToDataUrl } from './files';
import { VIDEOHEIGHT, VIDEOWIDTH } from './globals';

export function createEmptyJsPdf() {
  const doc = new jsPDF();
  doc.deletePage(1);
  return doc;
}

export async function addImageToJsPdf(
  imgFile: File,
  doc: jsPDF,
  ocrText?: string
) {
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
  if (ocrText) {
    doc.text(
      ocrText,
      VIDEOWIDTH / 2,
      VIDEOHEIGHT / 2, // place text roughly in the middle to make text search more convenient (should focus into center of slide where text was found)
      {
        renderingMode: 'invisible',
      }
    );
  }
}
