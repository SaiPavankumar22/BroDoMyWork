import React from 'react';
import { Type, Check } from 'lucide-react';

interface Font {
  id: string;
  name: string;
  family: string;
  style: React.CSSProperties;
}

interface FontSelectorProps {
  selectedFont: string;
  onFontSelect: (fontId: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ 
  selectedFont, 
  onFontSelect 
}) => {
  const fonts: Font[] = [
    {
      id: 'homemade',
      name: 'Homemade Apple',
      family: 'Homemade Apple',
      style: { fontFamily: 'cursive', fontSize: '14px' }
    },
    {
      id: 'dancing',
      name: 'Dancing Script',
      family: 'Dancing Script',
      style: { fontFamily: 'cursive', fontSize: '16px', fontWeight: '400' }
    },
    {
      id: 'patrick',
      name: 'Patrick Hand',
      family: 'Patrick Hand',
      style: { fontFamily: 'cursive', fontSize: '14px' }
    },
    {
      id: 'indie',
      name: 'Indie Flower',
      family: 'Indie Flower',
      style: { fontFamily: 'cursive', fontSize: '14px' }
    }
  ];

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Type className="w-5 h-5 text-blue-600" />
        Handwriting Style
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fonts.map((font) => (
          <div
            key={font.id}
            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
              selectedFont === font.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => onFontSelect(font.id)}
          >
            {selectedFont === font.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className="text-center">
              <h4 className="font-medium text-gray-800 mb-3">{font.name}</h4>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-20 flex items-center justify-center">
                <p style={font.style} className="text-gray-700">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                Sample handwriting preview
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};