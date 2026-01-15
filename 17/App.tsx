import React, { useState } from "react";
import GridDistortion from "./components/GridDistortion";
import Controls, { GridDistortionConfig } from "./components/Controls";
import backgroundImage from "./img/background.jpeg";

const App: React.FC = () => {
  const [config, setConfig] = useState<GridDistortionConfig>({
    grid: 15,
    mouse: 0.1,
    strength: 0.15,
    relaxation: 0.9,
  });

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <GridDistortion
        grid={config.grid}
        mouse={config.mouse}
        strength={config.strength}
        relaxation={config.relaxation}
        imageSrc={backgroundImage}
      />
      <Controls config={config} onChange={setConfig} />
    </div>
  );
};

export default App;
