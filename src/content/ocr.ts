import 'convertapi-js';

export async function pdfOCR(pdfFile: File) {
  const convertApi = ConvertApi.auth({
    secret: 'IY58j20e5lntKntE',
    apiKey: '',
    token: '',
  });
  const params = convertApi.createParams();
  params.add('File', pdfFile);
  return await convertApi.convert('pdf', 'ocr', params);
}
