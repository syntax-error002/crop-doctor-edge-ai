import React from 'react';
import { Loader2 } from 'lucide-react';

const AnalysisScreen = () => {
  return (
    <div className="card animate-slide-up flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 border-4 border-primary-light rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        <Loader2 className="text-primary animate-pulse" size={32} />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-dark mb-2">Analyzing Image...</h3>
        <p className="text-muted text-sm">Our ML model is scanning the leaf structure for disease markers.</p>
      </div>
    </div>
  );
};

export default AnalysisScreen;
