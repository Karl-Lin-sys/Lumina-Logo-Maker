import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, Download, Wand2, RefreshCcw } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setLogoBase64(null);

    try {
      // Create a better prompt for a logo
      const enhancedPrompt = `A professional, clean, minimalist abstract logo for a company. ${prompt}. High quality, white background, vector art style, flat design, modern, sleek.`;
      
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        }
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const image = response.generatedImages[0].image;
        if (image && image.imageBytes) {
          setLogoBase64(image.imageBytes);
        } else {
          setError("Failed to extract image from response.");
        }
      } else {
        setError('No image was generated. Please try again.');
      }
    } catch (err: any) {
      console.error("Logo Generation Error:", err);
      setError(err.message || 'An error occurred while generating the logo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!logoBase64) return;
    const a = document.createElement('a');
    a.href = `data:image/jpeg;base64,${logoBase64}`;
    a.download = 'generated-logo.jpeg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#00FF00] selection:text-black">
      {/* Brutalist Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        {/* Left Control Panel */}
        <div className="w-full md:w-1/3 lg:w-[400px] border-b md:border-b-0 md:border-r border-[#333] bg-[#111] p-8 flex flex-col h-screen overflow-y-auto">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-sm bg-[#00FF00] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase">LogoForge</h1>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-display font-medium leading-tight tracking-[-0.02em] mb-2 uppercase">
              Design your identity.
            </h2>
            <p className="text-[#888] text-sm mb-8">
              Describe your company and let AI craft a unique, minimalist logo tailored to your brand.
            </p>

            <form onSubmit={generateLogo} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="prompt" className="text-xs uppercase tracking-widest font-semibold text-[#888]">
                  Company Description
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A modern coffee shop specializing in cold brew, using a teardrop and coffee bean motif..."
                  className="w-full h-32 bg-[#1a1a1a] border border-[#333] rounded-none p-4 text-sm focus:border-[#00FF00] focus:ring-1 focus:ring-[#00FF00] outline-none transition-all resize-none font-mono"
                  disabled={isGenerating}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full h-12 bg-white text-black hover:bg-[#00FF00] disabled:bg-[#333] disabled:text-[#666] disabled:cursor-not-allowed uppercase font-bold tracking-wider text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Logo
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-[#333] text-xs font-mono text-[#666] uppercase">
            Powered by Imagen 3
          </div>
        </div>

        {/* Right Output Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0a] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!logoBase64 && !isGenerating && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-[#444] flex flex-col items-center gap-4"
              >
                <div className="w-24 h-24 border border-dashed border-[#333] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-mono text-sm uppercase tracking-widest">Awaiting Input</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-t-[#00FF00] border-r-transparent border-b-transparent border-l-transparent rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border border-b-[#00FF00]/50 border-r-transparent border-t-transparent border-l-transparent rounded-full"
                  />
                  <Sparkles className="w-8 h-8 text-[#00FF00] animate-pulse" />
                </div>
                <p className="font-mono text-sm uppercase tracking-widest text-[#00FF00]">Forging Logo...</p>
              </motion.div>
            )}

            {logoBase64 && !isGenerating && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative group"
              >
                {/* The "Animation" Part of the Request */}
                {/* We apply continuous motion to make the logo feel alive */}
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotateZ: [0, 1, -1, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative p-2 border border-[#333] bg-white rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.1)] group-hover:shadow-[0_0_80px_rgba(0,255,0,0.2)] transition-shadow duration-500"
                >
                  <img 
                    src={`data:image/jpeg;base64,${logoBase64}`} 
                    alt="Generated Logo" 
                    className="w-80 h-80 object-cover rounded-md"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Sweep light effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-lg z-20 pointer-events-none">
                    <motion.div
                      animate={{ 
                        x: ['-200%', '200%'],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        repeatDelay: 5,
                        ease: "easeInOut" 
                      }}
                      className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                    />
                  </div>
                </motion.div>

                {/* Controls that appear on hover */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4"
                >
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white hover:bg-[#333] hover:border-[#00FF00] transition-colors rounded-full text-xs font-mono uppercase tracking-wider"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={(e) => generateLogo(e as unknown as React.FormEvent)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white hover:bg-[#333] hover:border-[#00FF00] transition-colors rounded-full text-xs font-mono uppercase tracking-wider"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Regenerate
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

