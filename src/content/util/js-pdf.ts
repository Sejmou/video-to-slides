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
  const scaleFactor = 297 / VIDEOWIDTH; // PDF pages use mm as unit per default; an A4 format landscape page is 297 mm wide -> scale down images to that size (in mm)
  const pageWidth = VIDEOWIDTH * scaleFactor;
  const pageHeight = VIDEOHEIGHT * scaleFactor;

  doc.addPage([pageHeight, pageWidth], 'landscape');
  const imgDataUrl = await fileToDataUrl(imgFile);
  const img = document.createElement('img');
  img.src = imgDataUrl;
  doc.addImage({
    imageData: img,
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    compression: 'SLOW',
  });
  if (ocrText) {
    doc.text(
      ocrText,
      pageWidth / 2,
      pageHeight / 2, // place text roughly in the middle to make text search more convenient (should focus into center of slide where text was found)
      {
        renderingMode: 'invisible',
      }
    );
  }
}
