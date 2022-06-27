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
