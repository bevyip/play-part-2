import React, { useCallback } from 'react';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  isLoading: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileAccepted, isLoading }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isLoading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          onFileAccepted(file);
        }
      }
    },
    [onFileAccepted, isLoading]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileAccepted(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-56 bg-neutral-900 ${
        isLoading
          ? 'border-neutral-800 opacity-60 cursor-not-allowed'
          : 'border-neutral-800 hover:border-emerald-500 hover:bg-neutral-800/80 hover:shadow-lg hover:shadow-emerald-900/10'
      }`}
      onClick={() => !isLoading && document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={isLoading}
      />
      <div className="text-4xl mb-4 grayscale opacity-80">👾</div>
      <p className="text-white font-semibold text-lg">
        {isLoading ? 'Processing...' : 'Drop Pixel Art Here'}
      </p>
      <p className="text-neutral-500 text-sm mt-2">
        PNG, JPG (Max 2MB recommended)
      </p>
    </div>
  );
};

export default DropZone;