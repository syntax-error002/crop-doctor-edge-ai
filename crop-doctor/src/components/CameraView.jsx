import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

const CameraView = ({ onImageCapture }) => {
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureClick = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = () => {
    if (image) {
      onImageCapture(image);
    }
  };

  return (
    <div className="card animate-slide-up flex flex-col items-center gap-4">
      <h2 className="text-gradient">Scan Your Crop</h2>
      <p className="text-muted text-center mb-4">
        Take a clear photo of the diseased leaf or upload one from your gallery.
      </p>

      {image ? (
        <div className="w-full relative rounded-lg overflow-hidden border border-border">
          <img src={image} alt="Captured Crop" className="w-full h-auto object-cover max-h-[300px]" />
          <button 
            className="btn btn-icon btn-secondary absolute top-2 right-2"
            onClick={() => setImage(null)}
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div 
          className="w-full h-[250px] border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center gap-4 cursor-pointer bg-primary-light"
          onClick={handleCaptureClick}
        >
          <div className="bg-white p-4 rounded-full text-primary shadow-sm animate-pulse">
            <Camera size={32} />
          </div>
          <span className="font-medium text-primary-dark">Tap to Open Camera</span>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />
      
      {!image && (
        <button className="btn btn-secondary w-full" onClick={() => {
          fileInputRef.current.removeAttribute('capture');
          fileInputRef.current.click();
        }}>
          <ImageIcon size={20} /> Upload from Gallery
        </button>
      )}

      {image && (
        <button className="btn btn-primary w-full mt-4" onClick={handleAnalyze}>
          Analyze Disease
        </button>
      )}
    </div>
  );
};

export default CameraView;
