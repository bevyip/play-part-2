import { useState } from 'react';
import { AsciiRenderer } from './components/AsciiRenderer';
import { Controls } from './components/Controls';
import { AsciiSettings, DEFAULT_SETTINGS } from './types';

export default function App() {
  const [settings, setSettings] = useState<AsciiSettings>(DEFAULT_SETTINGS);

  const updateSetting = <K extends keyof AsciiSettings>(key: K, value: AsciiSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex bg-black">
      
      {/* Main Visual Area */}
      <div className="absolute inset-0 z-0">
        <AsciiRenderer settings={settings} />
      </div>

      {/* Bottom Controls Layer */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 pointer-events-none flex flex-col items-center justify-end">
         <div className="pointer-events-auto">
             <Controls settings={settings} updateSetting={updateSetting} />
         </div>
      </div>

    </div>
  );
}