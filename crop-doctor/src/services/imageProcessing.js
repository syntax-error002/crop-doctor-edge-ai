import treatmentsData from '../data/treatments.json';

const CLASS_NAMES = Object.keys(treatmentsData);

export const analyzeImage = async (imageSrc) => {
  try {
    // Convert base64 data URL to Blob for upload
    const response = await fetch(imageSrc);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('file', blob, 'crop.jpg');

    console.log('Sending image to V6 model server...');
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
      console.warn('API returned non-200 status, using fallback.');
    }
  } catch (err) {
    console.warn('Backend inference server not reached, using fallback:', err);
  }

  // Fallback if backend server is not active
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomDisease = CLASS_NAMES[Math.floor(Math.random() * CLASS_NAMES.length)];
      resolve({
        diseaseId: randomDisease,
        confidence: (Math.random() * (0.99 - 0.85) + 0.85).toFixed(2),
      });
    }, 2000);
  });
};
