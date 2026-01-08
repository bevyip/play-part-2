import React from 'react';
import { DEFAULT_CONFIG } from './constants';
import WaterPool from './components/WaterPool';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#87CEEB] items-center justify-center relative">
      {/* Main Content Area - Centered Pool */}
      <main className="relative flex items-center justify-center w-full h-full p-4">
        <WaterPool config={DEFAULT_CONFIG} resetTrigger={0} />
      </main>
    </div>
  );
};

export default App;