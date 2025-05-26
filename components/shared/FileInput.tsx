
import React, { useRef, useState } from 'react';
import { UploadCloud, FileText as FileIcon, X } from 'lucide-react'; // Added X for clearing file

interface FileInputProps {
  id: string;
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  fileTypeHelpText?: string;
}

const FileInput: React.FC<FileInputProps> = ({ id, label, accept, onChange, fileTypeHelpText }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFileName(file?.name || null);
    onChange(file);
  };

  const handleClearFile = () => {
    setFileName(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset native input
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      {fileName ? (
        <div className="flex items-center justify-between p-3 border border-slate-300 rounded-md bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileIcon className="h-5 w-5 text-slate-500" />
            <span className="text-sm text-slate-700">{fileName}</span>
          </div>
          <button
            type="button"
            onClick={handleClearFile}
            className="text-slate-500 hover:text-red-600"
            aria-label="Clear file"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-sky-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-1 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
            <div className="flex text-sm text-slate-600">
              <span className="font-medium text-sky-600 hover:text-sky-500">Upload a file</span>
              <input id={id} name={id} type="file" className="sr-only" accept={accept} onChange={handleFileChange} ref={fileInputRef} />
            </div>
            {fileTypeHelpText && <p className="text-xs text-slate-500">{fileTypeHelpText}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileInput;
