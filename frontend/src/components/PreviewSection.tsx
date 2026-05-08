import React from 'react';
import { Eye, Download, RefreshCw } from 'lucide-react';

interface PreviewSectionProps {
  isGenerating: boolean;
  generatedPages: string[];
  onRegenerate: () => void;
  onDownload: () => void;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  isGenerating,
  generatedPages,
  onRegenerate,
  onDownload
}) => {
  if (isGenerating) {
    return (
      <div className="w-full">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Generating Preview...
        </h3>
        
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Creating your handwritten assignment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (generatedPages.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Preview
        </h3>
        
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8">
          <div className="text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Preview will appear here after processing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Preview ({generatedPages.length} page{generatedPages.length !== 1 ? 's' : ''})
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {generatedPages.map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Page {index + 1}</span>
            </div>
            <div className="p-4">
              <div className="bg-white border border-gray-300 rounded aspect-[8.5/11] flex items-center justify-center">
                <p className="text-gray-500 text-sm">Generated page preview</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
