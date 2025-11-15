
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LandingPage from './components/LandingPage';

const Root: React.FC = () => {
    const [showEngine, setShowEngine] = useState(false);

    if (showEngine) {
        return <App />;
    }

    return <LandingPage onEnter={() => setShowEngine(true)} />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
