import treatmentsData from '../data/treatments.json';

const DISEASE_KEYS = Object.keys(treatmentsData);

export const analyzeImage = async (imageUri) => {
  try {
    console.log('Sending image to V6 model server...', imageUri);

    // Fetch the image to convert it into a Blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const formData = new FormData();
    // Provide a default filename
    formData.append('file', blob, 'crop.jpg');

    const apiRes = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      body: formData,
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      console.log('Real V6 Model Result:', data);
      return {
        diseaseId: data.diseaseId,
        confidence: data.confidence,
      };
    } else {
      throw new Error('API returned non-200 status');
    }
  } catch (err) {
    console.error('Backend inference failed:', err);
    throw err;
  }
};
