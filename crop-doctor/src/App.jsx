import React, { useState } from 'react';
import { Camera, Upload, Leaf, ShieldCheck, AlertTriangle, Sprout, RefreshCw, Loader2, MapPin, ChevronDown, Zap, Microscope, Menu } from 'lucide-react';
import { analyzeImage } from './services/imageProcessing';
import treatmentsData from './data/treatments.json';
import './App.css';

function App() {
  const [appState, setAppState] = useState('home');
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [statusText, setStatusText] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedImage(ev.target.result);
        setAppState('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setAppState('analyzing');
    setStatusText('Preprocessing image...');
    setTimeout(() => setStatusText('Running neural network...'), 800);
    setTimeout(() => setStatusText('Classifying disease markers...'), 1600);
    try {
      const res = await analyzeImage(capturedImage);
      setResult(res);
      setAppState('results');
    } catch {
      alert('Analysis failed. Please try again.');
      setAppState('home');
    }
  };

  const handleReset = () => {
    setAppState('home');
    setCapturedImage(null);
    setResult(null);
  };

  return (
    <div className="app-shell">
      <div className="phone-frame">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <Leaf className="header-icon" size={22} />
            <span className="header-title">Crop Doctor</span>
          </div>
          <span className="header-badge">AI v2.0</span>
        </header>

        {/* Home Screen */}
        {appState === 'home' && (
          <div className="screen home-screen">
            <div className="hero-section">
              <div className="hero-glow"></div>
              <div className="hero-icon-wrap">
                <Microscope size={36} />
              </div>
              <h1 className="hero-title">Identify Crop Diseases</h1>
              <p className="hero-sub">AI-powered diagnosis with organic treatment recommendations for 22 crop diseases.</p>
              <div className="stats-row">
                <div className="stat-pill"><Zap size={14}/> 22 Diseases</div>
                <div className="stat-pill"><Leaf size={14}/> Organic Only</div>
                <div className="stat-pill"><MapPin size={14}/> Localized</div>
              </div>
            </div>

            <div className="action-section">
              <label className="btn-primary-big">
                <Camera size={22} />
                <span>Scan with Camera</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} hidden />
              </label>
              <label className="btn-secondary-big">
                <Upload size={20} />
                <span>Upload from Gallery</span>
                <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
              </label>
            </div>

            <div className="steps-section">
              <h3 className="steps-title">How it works</h3>
              <div className="step-item"><div className="step-num">1</div><span>Take a photo of the affected leaf</span></div>
              <div className="step-item"><div className="step-num">2</div><span>AI identifies disease in seconds</span></div>
              <div className="step-item"><div className="step-num">3</div><span>Get organic treatment recommendations</span></div>
            </div>
          </div>
        )}

        {/* Preview Screen */}
        {appState === 'preview' && (
          <div className="screen preview-screen">
            <div className="preview-image-wrap">
              <img src={capturedImage} alt="Preview" className="preview-img" />
            </div>
            <div className="preview-actions">
              <button className="btn-primary-big" onClick={handleAnalyze}>
                <Microscope size={20} /> Analyze Disease
              </button>
              <button className="btn-ghost" onClick={handleReset}>
                <RefreshCw size={16} /> Choose Different Photo
              </button>
            </div>
          </div>
        )}

        {/* Analysis Screen */}
        {appState === 'analyzing' && (
          <div className="screen analysis-screen">
            <div className="analysis-image-wrap">
              <img src={capturedImage} alt="Analyzing" className="analysis-img" />
              <div className="analysis-overlay"></div>
            </div>
            <div className="analysis-content">
              <div className="spinner-wrap">
                <div className="spinner-ring"></div>
                <Loader2 className="spinner-icon" size={28} />
              </div>
              <h2 className="analysis-title">Analyzing Crop</h2>
              <p className="analysis-status">{statusText}</p>
              <div className="progress-dots">
                <span className="dot active"></span>
                <span className={`dot ${statusText !== 'Preprocessing image...' ? 'active' : ''}`}></span>
                <span className={`dot ${statusText === 'Classifying disease markers...' ? 'active' : ''}`}></span>
              </div>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {appState === 'results' && result && <ResultsView image={capturedImage} result={result} onReset={handleReset} />}
      </div>
    </div>
  );
}

function ResultsView({ image, result, onReset }) {
  const disease = treatmentsData[result.diseaseId] || {
    name: 'Unknown', crop: 'Unknown', severity: 'Unknown',
    description: 'Could not identify. Consult a local expert.',
    symptoms: [], treatments: [{ title: 'Consult Expert', desc: 'Visit your nearest agricultural center.' }], prevention: ''
  };
  const isHealthy = result.diseaseId.toLowerCase().includes('healthy');
  const conf = Math.round(result.confidence * 100);

  const severityColors = { None: '#10b981', Low: '#22d3ee', Moderate: '#f59e0b', High: '#ef4444', Unknown: '#94a3b8' };

  return (
    <div className="screen results-screen">
      <div className="results-hero">
        <img src={image} alt="Result" className="results-img" />
        <div className="results-overlay">
          <div className="results-badges">
            <span className={`badge ${isHealthy ? 'badge-healthy' : 'badge-disease'}`}>
              {isHealthy ? <ShieldCheck size={14}/> : <AlertTriangle size={14}/>}
              {isHealthy ? 'Healthy' : 'Disease Detected'}
            </span>
            <span className="badge badge-conf">{conf}%</span>
          </div>
        </div>
      </div>

      <div className="results-body">
        <div className="result-card">
          <div className="result-card-header">
            <div>
              <h2 className="disease-name">{disease.name}</h2>
              <span className="crop-name">{disease.crop}</span>
            </div>
            <span className="severity-pill" style={{ background: (severityColors[disease.severity] || '#94a3b8') + '20', color: severityColors[disease.severity] }}>
              <span className="severity-dot" style={{ background: severityColors[disease.severity] }}></span>
              {disease.severity === 'None' ? 'No Risk' : disease.severity}
            </span>
          </div>
          <p className="disease-desc">{disease.description}</p>
        </div>

        {disease.symptoms && disease.symptoms.length > 0 && (
          <div className="result-card">
            <h3 className="section-title">🔍 Symptoms</h3>
            <ul className="symptoms-list">
              {disease.symptoms.map((s, i) => <li key={i}><span className="symptom-dot"></span>{s}</li>)}
            </ul>
          </div>
        )}

        <div className="result-card">
          <h3 className="section-title"><Sprout size={18} className="inline-icon" /> {isHealthy ? 'Maintenance Tips' : 'Organic Treatments'}</h3>
          <div className="treatments-list">
            {disease.treatments.map((t, i) => (
              <div key={i} className="treatment-item">
                <div className="treatment-num">{i + 1}</div>
                <div className="treatment-body">
                  <strong>{t.title}</strong>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {disease.prevention && (
          <div className="result-card prevention-card">
            <ShieldCheck size={18} className="prevention-icon" />
            <div>
              <strong>Prevention</strong>
              <p>{disease.prevention}</p>
            </div>
          </div>
        )}

        <button className="btn-primary-big" onClick={onReset}>
          <RefreshCw size={18} /> Scan Another Crop
        </button>
      </div>
    </div>
  );
}

export default App;
