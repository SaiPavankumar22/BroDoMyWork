import React from 'react';
import { Brain, Zap, FileText, Download, ArrowRight, Sparkles, Target } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
  onGetStarted: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, isDark, onThemeToggle }) => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced OCR and NLP to understand your assignments perfectly"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Generate complete handwritten assignments in under 2 minutes"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Multiple Templates",
      description: "Choose from ruled, double-ruled, blank, and notebook styles"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "PDF Export",
      description: "Download high-quality PDFs that look authentically handwritten"
    }
  ];

  const stats = [
    { number: "50K+", label: "Assignments Generated" },
    { number: "98%", label: "Accuracy Rate" },
    { number: "2min", label: "Average Processing Time" },
    { number: "4.9★", label: "User Rating" }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' 
        : 'bg-gradient-to-br from-yellow-50 via-white to-yellow-100'
    }`}>
      {/* Header */}
      <header className={`${
        isDark ? 'bg-black/50' : 'bg-white/80'
      } backdrop-blur-md border-b ${
        isDark ? 'border-yellow-400/20' : 'border-yellow-400/30'
      } sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isDark 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' 
                  : 'bg-gradient-to-br from-black to-gray-800'
              } shadow-lg`}>
                <Brain className={`w-7 h-7 ${isDark ? 'text-black' : 'text-yellow-400'}`} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  isDark ? 'text-yellow-400' : 'text-black'
                }`}>
                  AssignmentAI
                </h1>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Handwritten assignments in minutes
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
              <button
                onClick={onGetStarted}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/25'
                    : 'bg-black text-yellow-400 hover:bg-gray-800 hover:shadow-lg hover:shadow-black/25'
                } transform hover:-translate-y-1`}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                isDark 
                  ? 'bg-yellow-400/10 border border-yellow-400/20 text-yellow-400' 
                  : 'bg-black/10 border border-black/20 text-black'
              }`}>
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Technology</span>
              </div>
            </div>
            
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              Transform Your
              <span className={`block ${
                isDark ? 'text-yellow-400' : 'text-yellow-500'
              }`}>
                Assignments
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Upload any assignment, select your style, and get a perfectly handwritten 
              PDF in minutes. No more hours of manual writing!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className={`group px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  isDark
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400'
                    : 'bg-gradient-to-r from-black to-gray-800 text-yellow-400 hover:from-gray-800 hover:to-black'
                } shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 flex items-center gap-3`}
              >
                Start Creating
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                isDark
                  ? 'border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
                  : 'border-2 border-black text-black hover:bg-black hover:text-yellow-400'
              } transform hover:-translate-y-1`}>
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className={`w-16 h-16 rounded-full ${
            isDark ? 'bg-yellow-400/20' : 'bg-black/10'
          } flex items-center justify-center`}>
            <FileText className={`w-8 h-8 ${
              isDark ? 'text-yellow-400' : 'text-black'
            }`} />
          </div>
        </div>
        
        <div className="absolute top-32 right-16 animate-pulse">
          <div className={`w-12 h-12 rounded-full ${
            isDark ? 'bg-yellow-400/20' : 'bg-black/10'
          } flex items-center justify-center`}>
            <Zap className={`w-6 h-6 ${
              isDark ? 'text-yellow-400' : 'text-black'
            }`} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 ${
        isDark ? 'bg-black/30' : 'bg-yellow-50/50'
      } backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                  isDark ? 'text-yellow-400' : 'text-black'
                }`}>
                  {stat.number}
                </div>
                <div className={`text-sm md:text-base ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              Powerful Features
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Everything you need to create perfect handwritten assignments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-3xl transition-all duration-300 ${
                  isDark
                    ? 'bg-gray-800/50 border border-yellow-400/20 hover:bg-gray-800/80 hover:border-yellow-400/40'
                    : 'bg-white/80 border border-yellow-400/30 hover:bg-white hover:border-yellow-400/50'
                } backdrop-blur-sm hover:shadow-2xl transform hover:-translate-y-2`}
              >
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                  isDark
                    ? 'bg-yellow-400/20 text-yellow-400 group-hover:bg-yellow-400/30'
                    : 'bg-black/10 text-black group-hover:bg-black/20'
                } transition-all duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className={`text-xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  {feature.title}
                </h3>
                
                <p className={`${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${
        isDark 
          ? 'bg-gradient-to-r from-yellow-400/10 to-yellow-500/10' 
          : 'bg-gradient-to-r from-black/5 to-gray-800/5'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            Ready to Get Started?
          </h2>
          
          <p className={`text-xl mb-8 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Join thousands of students who are already saving hours with AssignmentAI
          </p>
          
          <button
            onClick={onGetStarted}
            className={`group px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${
              isDark
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400'
                : 'bg-gradient-to-r from-black to-gray-800 text-yellow-400 hover:from-gray-800 hover:to-black'
            } shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 flex items-center gap-3 mx-auto`}
          >
            <Target className="w-6 h-6" />
            Create Your First Assignment
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${
        isDark ? 'bg-black border-yellow-400/20' : 'bg-gray-900 border-yellow-400/30'
      } border-t`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-bold text-yellow-400">AssignmentAI</span>
            </div>
            
            <p className="text-gray-400 mb-6">
              Transforming education with AI-powered handwriting technology
            </p>
            
            <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
              <span>Built with</span>
              <span className="text-yellow-400">❤️</span>
              <span>for students worldwide</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
