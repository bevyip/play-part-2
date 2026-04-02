import React, { useCallback, useEffect, useRef, useState } from "react";
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

  const defaultSrcRef = useRef(backgroundImage);
  const blobUrlRef = useRef<string | null>(null);

  const [imageSrc, setImageSrcState] = useState<string>(backgroundImage);

  const setImageSrc = useCallback((src: string) => {
    if (blobUrlRef.current && blobUrlRef.current !== src) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (src !== defaultSrcRef.current && src.startsWith("blob:")) {
      blobUrlRef.current = src;
    }
    setImageSrcState(src);
  }, []);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="app-root">
      <main className="stage-area">
        <GridDistortion
          grid={config.grid}
          mouse={config.mouse}
          strength={config.strength}
          relaxation={config.relaxation}
          imageSrc={imageSrc}
        />
      </main>
      <Controls
        config={config}
        onChange={setConfig}
        onImageSrcChange={setImageSrc}
      />
    </div>
  );
};

export default App;
