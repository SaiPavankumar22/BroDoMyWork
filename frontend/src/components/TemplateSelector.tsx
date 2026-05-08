import React from 'react';
import { Layout, Check } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
}

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  selectedTemplate, 
  onTemplateSelect 
}) => {
  const templates: Template[] = [
    {
      id: 'ruled',
      name: 'Ruled Paper',
      description: 'Standard lined paper with horizontal rules',
      preview: 'ruled-preview'
    },
    {
      id: 'double-ruled',
      name: 'Double Ruled',
      description: 'Double-lined paper with margin',
      preview: 'double-ruled-preview'
    },
    {
      id: 'blank',
      name: 'Blank A4',
      description: 'Clean white paper without lines',
      preview: 'blank-preview'
    },
    {
      id: 'notebook',
      name: 'Notebook Style',
      description: 'College-ruled notebook paper',
      preview: 'notebook-preview'
    }
  ];

  const TemplatePreview: React.FC<{ template: Template }> = ({ template }) => {
    return (
      <div className="w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-white relative">
        {template.id === 'ruled' && (
          <div className="h-full p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-b border-blue-200 h-3 mb-1" />
            ))}
          </div>
        )}
        {template.id === 'double-ruled' && (
          <div className="h-full p-2 border-l-2 border-red-300 ml-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-b border-blue-200 h-3 mb-1" />
            ))}
          </div>
        )}
        {template.id === 'blank' && (
          <div className="h-full bg-white" />
        )}
        {template.id === 'notebook' && (
          <div className="h-full p-2 border-l-2 border-red-300 ml-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-b border-blue-300 h-4 mb-1" />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Layout className="w-5 h-5 text-blue-600" />
        Select Template
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            {selectedTemplate === template.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            
            <TemplatePreview template={template} />
            
            <div className="mt-3">
              <h4 className="font-medium text-gray-800">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};