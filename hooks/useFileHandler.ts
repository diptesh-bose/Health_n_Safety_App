
import { useState } from 'react';

export const useFileHandler = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [base64File, setBase64File] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFileContent(text);
        resolve(text);
      };
      reader.onerror = (error) => {
        setFileError('Failed to read file.');
        console.error('File reading error:', error);
        reject('Failed to read file.');
      };
      reader.readAsText(file);
    });
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1]; // Remove data:mime/type;base64, part
        setBase64File(base64);
        resolve(base64);
      };
      reader.onerror = (error) => {
        setFileError('Failed to read file as Base64.');
        console.error('Base64 reading error:', error);
        reject('Failed to read file as Base64.');
      };
      reader.readAsDataURL(file);
    });
  };

  const resetHandler = () => {
    setFileContent(null);
    setBase64File(null);
    setFileError(null);
  }

  return { readFileAsText, fileContent, readFileAsBase64, base64File, fileError, resetHandler };
};
