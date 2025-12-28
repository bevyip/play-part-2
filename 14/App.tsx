import React, { useState } from "react";
import DropZone from "./components/DropZone";
import SpriteCanvas from "./components/SpriteCanvas";
import CodePreview from "./components/CodePreview";
import { SpriteResult, ProcessingState, ProcessingStatus } from "./types";
import { generateSpriteFromImage } from "./logic/translation";
import { fileToBase64, getImageDimensions } from "./utils/imageUtils";

const App: React.FC = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: ProcessingStatus.IDLE,
  });
  const [spriteData, setSpriteData] = useState<SpriteResult | null>(null);

  const handleFileProcess = async (file: File) => {
    try {
      setProcessingState({ status: ProcessingStatus.PROCESSING });

      const base64 = await fileToBase64(file);
      const dimensions = await getImageDimensions(file);

      // Call Service (Algorithmic)
      const result = await generateSpriteFromImage(
        base64,
        dimensions.width,
        dimensions.height
      );

      setSpriteData(result);
      setProcessingState({ status: ProcessingStatus.COMPLETE });
    } catch (error: any) {
      console.error(error);
      setProcessingState({
        status: ProcessingStatus.ERROR,
        error: error.message || "An unknown error occurred",
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Image{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              to Sprite
            </span>
          </h1>
          <p className="text-neutral-400 max-w-md mx-auto font-medium">
            Image to Sprite Generator. Export ready-to-use sprite JavaScript
            code.
          </p>
        </header>

        {/* Input Section */}
        <section className="max-w-xl mx-auto">
          <DropZone
            onFileAccepted={handleFileProcess}
            isLoading={processingState.status === ProcessingStatus.PROCESSING}
          />
          {processingState.status === ProcessingStatus.ERROR && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-800 text-red-400 text-sm rounded text-center">
              Error: {processingState.error}
            </div>
          )}
        </section>

        {/* Results Section */}
        {spriteData && (
          <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-10 bg-neutral-900 rounded-2xl border border-neutral-800 flex-wrap">
              {/* Sprite Visuals */}
              <div className="flex flex-col items-center">
                <SpriteCanvas
                  pixels={spriteData.matrix.front}
                  label={`Front (${spriteData.dimensions.width}×${spriteData.dimensions.height})`}
                />
              </div>
              <div className="flex flex-col items-center">
                <SpriteCanvas
                  pixels={spriteData.matrix.back}
                  label={`Back (${spriteData.dimensions.width}×${spriteData.dimensions.height})`}
                />
              </div>
              <div className="flex flex-col items-center">
                <SpriteCanvas
                  pixels={spriteData.matrix.left}
                  label={`Left (${spriteData.matrix.left[0].length}×${spriteData.dimensions.height})`}
                />
              </div>
              <div className="flex flex-col items-center">
                <SpriteCanvas
                  pixels={spriteData.matrix.right}
                  label={`Right (${spriteData.matrix.right[0].length}×${spriteData.dimensions.height})`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1 md:col-span-1 space-y-4">
                {/* Stats Card */}
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-white font-bold mb-4 border-b border-neutral-800 pb-2">
                    Analysis
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Archetype</span>
                      <span className="text-emerald-400 capitalize font-medium">
                        {spriteData.type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Grid Size</span>
                      <span className="text-white">
                        {spriteData.dimensions.width}x
                        {spriteData.dimensions.height}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Colors</span>
                      <span className="text-white">
                        {spriteData.palette.length}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-neutral-500 text-xs font-bold mt-6 mb-3 uppercase tracking-wider">
                    Palette
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {spriteData.palette.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded border border-neutral-700 shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Output */}
              <div className="col-span-1 md:col-span-2">
                <CodePreview result={spriteData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
