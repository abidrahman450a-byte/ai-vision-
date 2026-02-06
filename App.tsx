
import React, { useState, useRef, useEffect } from 'react';
import { USE_CASES } from './constants';
import { ChatMessage } from './types';
import { queryCore } from './services/geminiService';

interface SentinelLog extends ChatMessage {
  camId?: string;
  imageAtTurn?: string;
  videoAtTurn?: string;
  isMatch?: boolean;
}

const CameraNode: React.FC<{ 
  id: string, 
  title: string, 
  description: string,
  isActive: boolean, 
  onToggle: (id: string) => void,
  onCapture: (base64: string, id: string) => void,
  onRecordStart: (stream: MediaStream, id: string) => void,
  onRecordStop: () => void,
  isRecording: boolean,
  isAnalyzing: boolean,
  isSelected: boolean,
  onSelect: (id: string) => void
}> = ({ id, title, description, isActive, onToggle, onCapture, onRecordStart, onRecordStop, isRecording, isAnalyzing, isSelected, onSelect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      }).then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      }).catch(err => {
        console.error("Camera node error:", err);
      });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [isActive]);

  const handleCapture = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive || !videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    onCapture(canvasRef.current.toDataURL('image/jpeg', 0.7), id);
  };

  const handleToggleRecord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRecording) {
      onRecordStop();
    } else if (streamRef.current) {
      onRecordStart(streamRef.current, id);
    }
  };

  return (
    <div 
      onClick={() => onSelect(id)}
      className="flex flex-col space-y-3"
    >
      <div 
        className={`relative h-48 sm:h-56 w-full rounded-2xl border-2 overflow-hidden transition-all duration-300 group cursor-pointer ${
          isSelected ? 'border-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)]' : 'border-zinc-800 hover:border-zinc-700'
        } bg-[#050505]`}
      >
        {!isActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-zinc-950/90 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700 font-mono">NODE {id} OFF</span>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover brightness-75 contrast-125 grayscale sm:grayscale-0 transition-all duration-500" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>
            
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isRecording ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-red-600'}`}></span>
              <span className="text-[8px] font-black uppercase text-white tracking-[0.2em] font-mono">
                {isRecording ? 'RECORDING' : 'LIVE'} // {id}
              </span>
            </div>
          </>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(id); }}
            className={`px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${
              isActive ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            {isActive ? 'Zima' : 'Dara'}
          </button>
          {isActive && (
            <div className="flex space-x-2">
              <button 
                onClick={handleToggleRecord}
                className={`p-2 rounded-full shadow-lg border active:scale-90 transition-transform ${isRecording ? 'bg-white text-black border-zinc-200' : 'bg-zinc-900 text-red-500 border-zinc-700'}`}
              >
                {isRecording ? (
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                ) : (
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>
                )}
              </button>
              <button 
                onClick={handleCapture}
                disabled={isAnalyzing}
                className="bg-orange-600 text-white p-2 rounded-full shadow-lg border border-orange-400/30 active:scale-90 transition-transform"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Node Description Beneath */}
      <div className="px-1">
        <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-0.5">{title}</h4>
        <p className="text-[9px] text-zinc-500 leading-tight font-mono line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [logs, setLogs] = useState<SentinelLog[]>([
    { role: 'ai', text: 'AI Vision OS initialized. Dhammaan node-yada waa diyaar. Dooro kamarada aad rabto inaad kormeerto.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [activeNodes, setActiveNodes] = useState<Record<string, boolean>>({
    'CAM-01': true, 'CAM-02': false, 'CAM-03': false, 'CAM-04': false
  });
  const [selectedNode, setSelectedNode] = useState('CAM-01');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [targetDescription, setTargetDescription] = useState('');
  const [recordingNode, setRecordingNode] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, loading]);

  const toggleNode = (id: string) => {
    setActiveNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const processAnalysis = async (content: string, type: 'image' | 'video', id: string, mimeType: string) => {
    setLoading(true);
    const base64Data = content.split(',')[1];
    const prompt = type === 'image' 
      ? "AQOONSIGA QOFKA: Soo saar dharka uu xidhan yahay, waxa uu qabanayo iyo haddii uu yahay qofka la raadinayo."
      : "AQOONSIGA VIDEO: Kormeer dhaqdhaqaaqa qofka ku jira video-gan, aqoonso dharka uu xidhan yahay iyo haddii uu yahay qofka la raadinayo.";
    
    const result = await queryCore(prompt, base64Data, mimeType, targetDescription);
    const isMatch = result.text.toUpperCase().includes('MATCH FOUND');

    setLogs(prev => [...prev, { 
      role: 'ai', 
      text: result.text, 
      camId: id,
      isMatch: isMatch
    }]);
    setLoading(false);
  };

  const handleCapture = async (base64: string, id: string) => {
    setLogs(prev => [...prev, { 
      role: 'user', 
      text: targetDescription 
        ? `RAADINTA: "${targetDescription}" on Node ${id}...` 
        : `SCAN [${id}]: Hubinta qofka hortaagan.`, 
      imageAtTurn: base64,
      camId: id
    }]);
    if (!window.innerWidth || window.innerWidth < 1024) setIsTerminalOpen(true);
    await processAnalysis(base64, 'image', id, 'image/jpeg');
  };

  const handleRecordStart = (stream: MediaStream, id: string) => {
    recordedChunksRef.current = [];
    setRecordingNode(id);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setLogs(prev => [...prev, { 
          role: 'user', 
          text: `VIDEO_SCAN [${id}]: Falanqaynta muuqaalka la duubay...`, 
          videoAtTurn: url,
          camId: id
        }]);
        await processAnalysis(base64, 'video', id, 'video/webm');
      };
      reader.readAsDataURL(blob);
      setRecordingNode(null);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  const handleRecordStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const isVideo = file.type.startsWith('video');
      
      setLogs(prev => [...prev, { 
        role: 'user', 
        text: `UPLOAD_SCAN: Falanqaynta ${file.name}...`, 
        imageAtTurn: isVideo ? undefined : base64,
        videoAtTurn: isVideo ? URL.createObjectURL(file) : undefined,
        camId: 'UPLOAD'
      }]);

      await processAnalysis(base64, isVideo ? 'video' : 'image', 'UPLOAD', file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen flex flex-col h-screen text-white bg-black overflow-hidden font-mono selection:bg-orange-500/30">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ea580c22,transparent)]"></div>
      </div>

      <header className="h-16 sm:h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-orange-500/20 flex items-center justify-between px-4 sm:px-8 z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-orange-600 flex items-center justify-center font-black text-xl skew-x-[-10deg]">V</div>
          <div>
            <h1 className="text-sm sm:text-lg font-black tracking-widest uppercase">AI VISION <span className="text-orange-500">SYSTEM</span></h1>
            <p className="text-[7px] text-zinc-600 uppercase font-black">Intelligent Visual Surveillance</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-orange-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>Soo Geli</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
          <button 
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`lg:hidden p-2 rounded-lg border ${isTerminalOpen ? 'bg-orange-600 border-orange-500' : 'bg-zinc-900 border-zinc-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        <section className={`flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar ${isTerminalOpen && 'hidden lg:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
            {USE_CASES.map(cam => (
              <CameraNode 
                key={cam.id} 
                id={cam.id} 
                title={cam.somaliDescription} 
                description={cam.description}
                isActive={activeNodes[cam.id]}
                onToggle={toggleNode}
                onCapture={handleCapture}
                onRecordStart={handleRecordStart}
                onRecordStop={handleRecordStop}
                isRecording={recordingNode === cam.id}
                isAnalyzing={loading}
                isSelected={selectedNode === cam.id}
                onSelect={setSelectedNode}
              />
            ))}
          </div>
          
          <div className="mt-10 p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
             <div className="text-[10px] font-black uppercase text-orange-500 mb-2 tracking-widest flex items-center space-x-2">
                <span className="w-1 h-3 bg-orange-600"></span>
                <span>Qofka la Raadinayo (Target Search)</span>
             </div>
             <input 
                type="text" 
                value={targetDescription}
                onChange={(e) => setTargetDescription(e.target.value)}
                placeholder="Tusaale: Nin xidhan funaanad madow, surwaal jeans ah..."
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500 transition-colors"
             />
             <div className="mt-4 flex sm:hidden">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-zinc-800 border border-zinc-700 py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  <span>Upload File</span>
                </button>
             </div>
             <p className="text-[9px] text-zinc-600 mt-2 italic">Haddii aad faahfaahin halkan ku qorto, AI-da waxay isbarbardhigi doontaa qofka hortaagan ama ku jira muuqaalka.</p>
          </div>
        </section>

        <section className={`${isTerminalOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-[400px] xl:w-[450px] bg-zinc-950/90 backdrop-blur-md border-l border-zinc-900 flex-col shadow-2xl`}>
          <div className="p-4 sm:p-6 border-b border-zinc-900 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center space-x-2">
              <span className="w-1.5 h-3 bg-orange-600"></span>
              <span>AI Analytics Log</span>
            </h3>
            <button onClick={() => setIsTerminalOpen(false)} className="lg:hidden text-zinc-600 font-black uppercase text-[10px]">Back</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-black/40">
            {logs.map((log, idx) => (
              <div key={idx} className="flex flex-col space-y-2">
                <div className={`p-4 rounded-xl border text-[11px] leading-relaxed transition-all ${
                  log.isMatch 
                    ? 'bg-orange-900/20 border-orange-500 text-orange-100 shadow-[0_0_15px_rgba(234,88,12,0.2)]'
                    : log.role === 'user' 
                    ? 'bg-zinc-900/30 border-zinc-800 text-zinc-500 italic ml-4' 
                    : 'bg-zinc-900/60 border-orange-500/10 text-zinc-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2 text-[8px] font-black uppercase tracking-tighter opacity-40">
                    <span>{log.isMatch ? 'MATCH_ALERT' : log.role === 'user' ? 'INPUT' : 'ANALYSIS'}</span>
                    {log.camId && <span>// {log.camId}</span>}
                  </div>
                  
                  {log.imageAtTurn && (
                    <img src={log.imageAtTurn} className={`w-full rounded-lg mb-3 border border-white/5 ${log.isMatch ? '' : 'grayscale opacity-70'}`} alt="Buffer" />
                  )}
                  {log.videoAtTurn && (
                    <video src={log.videoAtTurn} controls className="w-full rounded-lg mb-3 border border-white/5" />
                  )}
                  
                  <p className="whitespace-pre-wrap">{log.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse">
                <div className="flex items-center space-x-2 text-[9px] font-black text-orange-500">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-ping"></div>
                  <span>SCANNING_MATRIX_DATA...</span>
                </div>
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </section>
      </main>

      <footer className="h-8 bg-black border-t border-zinc-900 hidden sm:flex items-center justify-between px-8 text-[8px] font-black uppercase text-zinc-800 tracking-widest shrink-0">
        <div>AI VISION - INTELLIGENT OS</div>
        <div className="flex space-x-6">
          <span>Encrypted: SSL-256</span>
          <span>Buffer: Optimized</span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea580c; }
        video::-webkit-media-controls { display:flex !important; }
        video { outline: none; }
      `}</style>
    </div>
  );
};

export default App;
