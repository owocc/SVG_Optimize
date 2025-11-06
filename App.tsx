import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { SvgOptions, Theme } from './types';
import { SettingsIcon, CopyIcon, DownloadIcon, SunIcon, MoonIcon, SystemIcon, CloseIcon, CheckIcon, PaletteIcon } from './components/icons';

const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gem">
  <path d="M6 3h12l4 6-10 13L2 9Z"/>
  <path d="M12 22V9"/>
  <path d="m3.5 8.5 17 0"/>
  <path d="M2 9h20"/>
</svg>`;

const optimizeSvgBase = (svgString: string, options: Omit<SvgOptions, 'previewColor' | 'applyPreviewColor' | 'outputSizes'>): string => {
  if (!svgString.trim()) {
    return '';
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = doc.documentElement;

    if (svgElement.tagName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
      console.error('Invalid SVG input');
      return svgString;
    }
    
    if (options.removeXmlns) {
      svgElement.removeAttribute('xmlns');
    }

    if (options.removeWidth) {
      svgElement.removeAttribute('width');
    }

    if (options.removeHeight) {
      svgElement.removeAttribute('height');
    }
    
    if (options.removeClasses) {
      svgElement.querySelectorAll('*').forEach(el => {
        el.removeAttribute('class');
      });
      svgElement.removeAttribute('class');
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  } catch (error) {
    console.error("Error optimizing SVG:", error);
    return svgString;
  }
};

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const CustomSwitch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`${
          checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-slate-800`}
      >
        <span
          aria-hidden="true"
          className={`${
            checked ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </label>
  );
};

interface SettingsPopoverProps {
  options: SvgOptions;
  setOptions: React.Dispatch<React.SetStateAction<SvgOptions>>;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  onClose: () => void;
}

const SettingsPopover: React.FC<SettingsPopoverProps> = ({ options, setOptions, theme, setTheme, onClose }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div ref={popoverRef} className="absolute top-16 right-4 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl ring-1 ring-slate-900/5 z-50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Settings</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="p-4 space-y-4">
                <div className="space-y-3">
                    <CustomSwitch label="Remove class attributes" checked={options.removeClasses} onChange={c => setOptions(o => ({...o, removeClasses: c}))} />
                    <CustomSwitch label="Remove width attribute" checked={options.removeWidth} onChange={c => setOptions(o => ({...o, removeWidth: c}))} />
                    <CustomSwitch label="Remove height attribute" checked={options.removeHeight} onChange={c => setOptions(o => ({...o, removeHeight: c}))} />
                    <CustomSwitch label="Remove xmlns attribute" checked={options.removeXmlns} onChange={c => setOptions(o => ({...o, removeXmlns: c}))} />
                    <CustomSwitch label="Apply color to output" checked={options.applyPreviewColor} onChange={c => setOptions(o => ({...o, applyPreviewColor: c}))} />
                </div>
                <div>
                    <label htmlFor="sizes" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Preview Sizes</label>
                    <input type="text" id="sizes" placeholder="e.g. 16, 24, 32" value={options.outputSizes} onChange={e => setOptions(o => ({...o, outputSizes: e.target.value}))} className="w-full bg-slate-100 dark:bg-slate-700 text-sm rounded-md border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div className="pt-2">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Theme</label>
                    <div className="flex items-center justify-around bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button onClick={() => setTheme('light')} className={`w-full flex justify-center items-center p-2 rounded-md text-sm ${theme === 'light' ? 'bg-white dark:bg-slate-800 shadow' : 'hover:bg-white/50 dark:hover:bg-slate-600/50'}`}>
                           <SunIcon className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300"/> Light
                        </button>
                         <button onClick={() => setTheme('dark')} className={`w-full flex justify-center items-center p-2 rounded-md text-sm ${theme === 'dark' ? 'bg-white dark:bg-slate-800 shadow' : 'hover:bg-white/50 dark:hover:bg-slate-600/50'}`}>
                           <MoonIcon className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300"/> Dark
                        </button>
                         <button onClick={() => setTheme('system')} className={`w-full flex justify-center items-center p-2 rounded-md text-sm ${theme === 'system' ? 'bg-white dark:bg-slate-800 shadow' : 'hover:bg-white/50 dark:hover:bg-slate-600/50'}`}>
                           <SystemIcon className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300"/> System
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PanelProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  titleControls?: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({ title, children, actions, titleControls }) => {
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm flex flex-col h-full ring-1 ring-slate-900/5">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{title}</h2>
                    {titleControls}
                </div>
                <div className="flex items-center space-x-2">
                    {actions}
                </div>
            </div>
            <div className="flex-grow relative">
                {children}
            </div>
        </div>
    );
};

interface ColorInputProps {
    value: string;
    onChange: (value: string) => void;
}
const ColorInput: React.FC<ColorInputProps> = ({ value, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0">
                <input
                    type="color"
                    aria-label="Pick a color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                    className="w-full h-full rounded-md border border-slate-300 dark:border-slate-600 pointer-events-none"
                    style={{ backgroundColor: value }}
                ></div>
            </div>
            <input
                type="text"
                aria-label="Color hex value"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-24 bg-slate-100 dark:bg-slate-700 text-sm rounded-md border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    )
}

export default function App() {
  const [inputSvg, setInputSvg] = useState<string>(defaultSvg);
  const [options, setOptions] = useState<SvgOptions>({
    removeClasses: true,
    removeWidth: true,
    removeHeight: true,
    removeXmlns: false,
    previewColor: '#3b82f6',
    applyPreviewColor: false,
    outputSizes: '24, 32, 48',
  });
  const [theme, setTheme] = useState<Theme>('system');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const [singlePreviewSize, setSinglePreviewSize] = useState(24);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') {
            root.classList.toggle('dark', mediaQuery.matches);
        }
    }
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const parsedSizes = useMemo(() => {
    return options.outputSizes
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n > 0);
  }, [options.outputSizes]);

  useEffect(() => {
    if (parsedSizes.length === 1 && singlePreviewSize !== parsedSizes[0]) {
        setSinglePreviewSize(parsedSizes[0]);
    }
  }, [parsedSizes, singlePreviewSize]);

  const { previewColor, applyPreviewColor, outputSizes, ...baseOptions } = options;
  const baseOptimizedSvg = useMemo(() => optimizeSvgBase(inputSvg, baseOptions), [inputSvg, baseOptions]);

  const previewRenderSvg = useMemo(() => {
    if (!baseOptimizedSvg) return '';
    const svgTagRegex = /<svg([^>]*?)>/;
    const match = baseOptimizedSvg.match(svgTagRegex);
    if (!match) return baseOptimizedSvg;

    let attributes = match[1];
    attributes = attributes.replace(/fill="[^"]*"/, '').replace(/stroke="[^"]*"/, '');
    const newSvgTag = `<svg${attributes} fill="${options.previewColor}">`;
    return baseOptimizedSvg.replace(svgTagRegex, newSvgTag);
  }, [baseOptimizedSvg, options.previewColor]);

  const outputSvg = useMemo(() => {
    return options.applyPreviewColor ? previewRenderSvg : baseOptimizedSvg;
  }, [baseOptimizedSvg, previewRenderSvg, options.applyPreviewColor]);

  const svgPreviewUrl = useMemo(() => {
    if (!previewRenderSvg) return '';
    try {
        const base64 = btoa(unescape(encodeURIComponent(previewRenderSvg)));
        return `data:image/svg+xml;base64,${base64}`;
    } catch (e) {
        console.error("Error creating SVG data URL", e);
        return '';
    }
  }, [previewRenderSvg]);
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(outputSvg).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }, [outputSvg]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([outputSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [outputSvg]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent">
        <div className="max-w-screen-2xl mx-auto">
            <div className="py-4 px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center">
                     <a className="mr-3 flex-none" href="/">
                        <h1 className="text-xl font-bold">SVG Optimizer</h1>
                     </a>
                     <div className="relative flex-grow"></div>
                     <button onClick={() => setIsSettingsOpen(o => !o)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700">
                        <SettingsIcon className="w-6 h-6"/>
                     </button>
                </div>
            </div>
        </div>
      </header>
      
      {isSettingsOpen && <SettingsPopover options={options} setOptions={setOptions} theme={theme} setTheme={setTheme} onClose={() => setIsSettingsOpen(false)} />}

      <main className="flex-grow p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Panel title="Input SVG">
            <textarea
                value={inputSvg}
                onChange={(e) => setInputSvg(e.target.value)}
                placeholder="Paste your SVG code here"
                className="w-full h-full p-4 resize-none bg-transparent text-sm font-mono focus:outline-none absolute inset-0 text-slate-700 dark:text-slate-300"
            />
        </Panel>

        <div className="grid grid-rows-2 gap-8">
            <Panel 
              title="Preview"
              titleControls={<ColorInput value={options.previewColor} onChange={c => setOptions(o => ({...o, previewColor: c}))} />}
            >
              <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                  {svgPreviewUrl ? (
                      <div className="flex flex-wrap justify-center items-end gap-6">
                          {parsedSizes.length > 1 ? (
                              parsedSizes.map(size => (
                                  <div key={size} className="text-center shrink-0">
                                      <div className="p-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center mx-auto" style={{ width: Math.max(size, 32) + 16, height: Math.max(size, 32) + 16 }}>
                                          <img src={svgPreviewUrl} alt={`Preview at ${size}px`} style={{ width: size, height: size }} />
                                      </div>
                                      <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">{size}px</p>
                                  </div>
                              ))
                          ) : parsedSizes.length === 1 ? (
                              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                                  <div className="p-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center" style={{ width: Math.max(singlePreviewSize, 64) + 32, height: Math.max(singlePreviewSize, 64) + 32 }}>
                                      <img src={svgPreviewUrl} alt={`Preview at ${singlePreviewSize}px`} style={{ width: singlePreviewSize, height: singlePreviewSize }} />
                                  </div>
                                  <div className="w-full">
                                      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                          <span>Size</span>
                                          <span>{singlePreviewSize}px</span>
                                      </div>
                                      <input
                                          type="range"
                                          min="8"
                                          max="256"
                                          step="1"
                                          value={singlePreviewSize}
                                          onChange={e => setSinglePreviewSize(parseInt(e.target.value, 10))}
                                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                                      />
                                  </div>
                              </div>
                          ) : (
                               <p className="text-slate-500">Enter valid sizes in settings to see a preview.</p>
                          )}
                      </div>
                  ) : <p className="text-slate-500">Invalid or empty SVG input.</p>}
              </div>
            </Panel>
            
            <Panel 
                title="Optimized Output"
                actions={
                    <>
                         <button onClick={handleCopy} className="flex items-center text-sm font-semibold p-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                           {copyStatus === 'copied' ? <CheckIcon className="w-5 h-5 text-green-500"/> : <CopyIcon className="w-5 h-5"/>}
                           <span className="ml-2">{copyStatus === 'copied' ? 'Copied!' : 'Copy'}</span>
                        </button>
                         <button onClick={handleDownload} className="flex items-center text-sm font-semibold p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                           <DownloadIcon className="w-5 h-5"/>
                           <span className="ml-2">Save</span>
                        </button>
                    </>
                }
            >
                 <textarea
                    value={outputSvg}
                    readOnly
                    placeholder="Optimized SVG will appear here"
                    className="w-full h-full p-4 resize-none bg-transparent text-sm font-mono focus:outline-none absolute inset-0 text-slate-700 dark:text-slate-300"
                />
            </Panel>
        </div>
      </main>
    </div>
  );
}
