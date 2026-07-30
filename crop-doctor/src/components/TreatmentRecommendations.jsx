import React from 'react';
import { Sprout, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import treatmentsData from '../data/treatments.json';

const TreatmentRecommendations = ({ diseaseId, onReset }) => {
  const diseaseInfo = treatmentsData[diseaseId] || {
    name: "Unknown Condition",
    description: "We couldn't positively identify this disease.",
    treatments: ["Please consult a local agricultural extension office."]
  };

  const isHealthy = diseaseId.includes('healthy');

  return (
    <div className="animate-slide-up flex flex-col gap-6">
      <div className={`card ${isHealthy ? 'border-primary' : 'border-warning'} border-2`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-full ${isHealthy ? 'bg-primary-light text-primary' : 'bg-warning/20 text-warning'}`}>
            {isHealthy ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
          </div>
          <div>
            <h2 className="text-xl font-bold">{diseaseInfo.name}</h2>
            <p className="text-sm text-muted">{isHealthy ? 'All clear!' : 'Action Required'}</p>
          </div>
        </div>
        
        <p className="text-text-main mb-4 leading-relaxed">
          {diseaseInfo.description}
        </p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-primary-dark mb-4 flex items-center gap-2">
          <Sprout size={20} />
          Organic Treatment Recommendations
        </h3>
        
        <ul className="flex flex-col gap-3">
          {diseaseInfo.treatments.map((treatment, idx) => (
            <li key={idx} className="flex gap-3 items-start bg-background p-3 rounded-md border border-border">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold mt-0.5">
                {idx + 1}
              </span>
              <span className="text-sm text-text-main leading-relaxed">
                {treatment}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button className="btn btn-secondary w-full" onClick={onReset}>
        <RefreshCw size={18} />
        Scan Another Crop
      </button>
    </div>
  );
};

export default TreatmentRecommendations;
