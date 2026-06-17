import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Card, { CardContent } from '../../components/ui/Card';
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function LiveClassroom() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [faces, setFaces] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  
  // Dynamic roster loaded from API with central fallback
  const [roster, setRoster] = useState([]);
  const [stats, setStats] = useState({ present: 0, unknown: 0, activeDetections: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [isIdle, setIsIdle] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [ws, setWs] = useState(null);

  const [sessionMetadata, setSessionMetadata] = useState({
    courseId: 'CS-301',
    courseName: 'Deep Learning',
    sessionId: `SESS-${new Date().getTime().toString().slice(-6)}`,
    startTime: new Date().toLocaleTimeString(),
    dbId: null
  });

  // 1. Load initial roster
  useEffect(() => {
    const loadRoster = async () => {
      try {
        const res = await api.get('/students');
        setRoster(res.data.map(s => ({ ...s, status: 'Absent', confidence: 0 })));
      } catch (err) {
        const saved = localStorage.getItem('smart_attendance_enrolled_students');
        if (saved) {
          try {
            setRoster(JSON.parse(saved).map(s => ({ ...s, status: 'Absent', confidence: 0 })));
          } catch (e) {
            setRoster([
              { id: '1', studentId: 'STU-1001', name: 'Ali Hamza', status: 'Absent', confidence: 0 },
              { id: '2', studentId: 'STU-1002', name: 'Ayesha Bibi', status: 'Absent', confidence: 0 }
            ]);
          }
        } else {
            setRoster([
              { id: '1', studentId: 'STU-1001', name: 'Ali Hamza', status: 'Absent', confidence: 0 },
              { id: '2', studentId: 'STU-1002', name: 'Ayesha Bibi', status: 'Absent', confidence: 0 }
            ]);
        }
      }
    };
    loadRoster();
  }, []);

  // 2. Initialize Session
  const startSession = async () => {
    try {
      const res = await api.post('/sessions', { course_id: sessionMetadata.courseId });
      setSessionMetadata(prev => ({ ...prev, dbId: res.data.id }));
      connectWebSocket(res.data.id);
    } catch (err) {
      console.warn("API unavailable, falling back to mock session.");
      setIsOfflineMode(true);
      setSessionActive(true);
      setIsConnected(true);
    }
  };

  const connectWebSocket = (dbId) => {
    const socket = new WebSocket(`ws://localhost:8000/api/v1/sessions/${dbId}/detect`);
    
    socket.onopen = () => {
      setIsConnected(true);
      setSessionActive(true);
      toast.success("Connected to ML Engine");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.faces) {
         setFaces(data.faces);
         setRoster(prev => {
            const newRoster = [...prev];
            data.faces.forEach(face => {
               if (face.status === 'Present') {
                  const idx = newRoster.findIndex(s => s.studentId === face.studentId);
                  if (idx >= 0) newRoster[idx].status = 'Present';
               }
            });
            return newRoster;
         });
         
         const unknownCount = data.faces.filter(f => f.status === 'Unknown').length;
         setStats(prev => ({
           ...prev,
           unknown: unknownCount,
           activeDetections: data.faces.length
         }));
         setIsIdle(data.faces.length === 0);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setIsOfflineMode(true); // Fallback to mock loop
      setSessionActive(true);
      setIsConnected(true);
    };

    socket.onclose = () => {
      // Only set disconnected if we aren't falling back to mock mode
      setIsOfflineMode(prev => {
        if (!prev) setIsConnected(false);
        return prev;
      });
    };

    setWs(socket);
  };

  // Start on mount
  useEffect(() => {
    if (!sessionActive && !isOfflineMode) {
       startSession();
    }
    return () => {
      if (ws) ws.close();
    }
  }, []); // eslint-disable-line

  // 3. Mock Engine Fallback (When API is down)
  useEffect(() => {
    if (!isOfflineMode || !sessionActive) return;

    // Just keep the camera open and live without any fake bounding boxes.
    // The ML detection will be handled by the backend engineer's WebSocket later.
    setIsIdle(false);
    
  }, [isOfflineMode, sessionActive]);

  // Sync Global Stats
  useEffect(() => {
    const presentCount = roster.filter(s => s.status === 'Present').length;
    setStats(prev => ({ ...prev, present: presentCount }));
  }, [roster]);

  // Frame pushing (only if real WebSocket is active)
  const captureAndSendFrame = useCallback(() => {
    if (isProcessing || isOfflineMode || ws?.readyState !== WebSocket.OPEN) return;
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsProcessing(true);
      ws.send(JSON.stringify({ type: 'frame', image: imageSrc }));
      setTimeout(() => setIsProcessing(false), 200);
    }
  }, [isProcessing, ws, isOfflineMode]);

  useEffect(() => {
    let interval;
    if (isConnected && !isOfflineMode) {
      interval = setInterval(captureAndSendFrame, 200);
    }
    return () => clearInterval(interval);
  }, [captureAndSendFrame, isConnected, isOfflineMode]);

  // 4. Handle manual override
  const toggleAttendance = async (studentId) => {
    try {
      const student = roster.find(s => s.studentId === studentId);
      const newStatus = student.status === 'Present' ? 'Absent' : 'Present';
      
      if (!isOfflineMode && sessionMetadata.dbId) {
         await api.put(`/attendance/${student.id}`, { status: newStatus, override: true });
      }
      setRoster(prev => prev.map(s => s.studentId === studentId ? { ...s, status: newStatus } : s));
      toast.success('Manual override applied');
    } catch (error) {
      console.warn("API unavailable, updating locally.", error);
      const student = roster.find(s => s.studentId === studentId);
      const newStatus = student.status === 'Present' ? 'Absent' : 'Present';
      setRoster(prev => prev.map(s => s.studentId === studentId ? { ...s, status: newStatus } : s));
      toast.success('Manual override applied (Local)');
    }
  };

  // 5. End Session
  const endSession = async () => {
    if (window.confirm("Are you sure you want to finalize this session and generate reports?")) {
      setSessionActive(false);
      setIsConnected(false);
      if (ws) ws.close();

      const finalAttendance = {
        ...sessionMetadata,
        endTime: new Date().toLocaleTimeString(),
        stats: { ...stats },
        roster: roster.map(s => ({ id: s.studentId, name: s.name, status: s.status }))
      };

      try {
        if (!isOfflineMode && sessionMetadata.dbId) {
           await api.put(`/sessions/${sessionMetadata.dbId}/close`, finalAttendance);
        }
      } catch (err) {
        console.warn("API unavailable, saving to local storage.");
      } finally {
        const existingLogs = JSON.parse(localStorage.getItem('smart_attendance_session_logs') || '[]');
        localStorage.setItem('smart_attendance_session_logs', JSON.stringify([...existingLogs, finalAttendance]));
        toast.success('Session finalized. Attendance logs saved.');
      }
    }
  };

  // Draw bounding boxes
  useEffect(() => {
    if (!canvasRef.current || !webcamRef.current || !webcamRef.current.video) return;

    const canvas = canvasRef.current;
    const video = webcamRef.current.video;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faces.forEach(face => {
      const x = (face.x / 100) * canvas.width;
      const y = (face.y / 100) * canvas.height;
      const width = (face.width / 100) * canvas.width;
      const height = (face.height / 100) * canvas.height;

      ctx.lineWidth = 3;
      if (face.status === 'Present') {
        ctx.strokeStyle = '#22c55e'; // Green
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      } else {
        ctx.strokeStyle = '#ef4444'; // Red
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      }

      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 8);
      ctx.stroke();
      ctx.fill();

      ctx.fillStyle = face.status === 'Present' ? '#22c55e' : '#ef4444';
      const labelText = face.status === 'Present' ? `✓ ${face.studentId}` : '⚠ Unknown';
      
      ctx.fillRect(x, y - 30, ctx.measureText(labelText).width + 20, 24);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(labelText, x + 10, y - 13);
    });
  }, [faces]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live Classroom</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time attendance tracking via facial recognition</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full flex items-center gap-3 text-sm font-semibold shadow-sm transition-all ${
            !isConnected ? 'bg-rose-50 text-rose-600 border border-rose-100' :
            isOfflineMode ? 'bg-amber-50 text-amber-600 border border-amber-100' :
            isIdle ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 
            'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${
              !isConnected ? 'bg-rose-500' :
              isOfflineMode ? 'bg-amber-500 animate-pulse' :
              isIdle ? 'bg-indigo-500' : 
              'bg-emerald-500 animate-pulse'
            }`} />
            <div className="flex flex-col leading-none">
               <span>{isConnected ? (isOfflineMode ? 'ML Engine: MOCK MODE' : (isIdle ? 'ML Engine: IDLE' : 'ML Engine: RUNNING')) : 'System Disconnected'}</span>
               {isConnected && <span className="text-[10px] opacity-70 mt-1 uppercase tracking-tighter">Cam: 1280x720 @ 30fps</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Camera Feed */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden border-slate-100 shadow-sm relative rounded-[24px]">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                LIVE • {sessionMetadata.courseName}
              </div>
              <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-medium text-white shadow-sm">
                ID: {sessionMetadata.sessionId} | Start: {sessionMetadata.startTime}
              </div>
            </div>

            <CardContent className="p-0 relative bg-slate-950 aspect-video flex items-center justify-center overflow-hidden">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Real-time Stats & Roster */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <Card className="border-emerald-100 shadow-sm rounded-2xl bg-emerald-50/30">
               <CardContent className="p-4">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                     <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest">Present</p>
                 </div>
                 <p className="text-2xl font-bold text-emerald-700 ml-1">{stats.present}</p>
               </CardContent>
             </Card>

             <Card className="border-rose-100 shadow-sm rounded-2xl bg-rose-50/30">
               <CardContent className="p-4">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                     <AlertCircle className="w-4 h-4" />
                   </div>
                   <p className="text-[10px] font-bold text-rose-600/80 uppercase tracking-widest">Unknown</p>
                 </div>
                 <p className="text-2xl font-bold text-rose-700 ml-1">{stats.unknown}</p>
               </CardContent>
             </Card>
          </div>

          <Card className="border-slate-100 shadow-sm rounded-[24px]">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-[24px]">
                <h3 className="font-semibold text-slate-800">Session Roster</h3>
                <p className="text-xs text-slate-500">Live attendance status</p>
             </div>
             <div className="max-h-[300px] overflow-y-auto p-2">
                {roster.map(student => (
                   <div key={student.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                      <div>
                         <p className="font-semibold text-sm text-slate-800">{student.name}</p>
                         <p className="text-xs text-slate-400">{student.id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`text-xs font-semibold px-2 py-1 rounded-md ${student.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {student.status}
                         </span>
                         {/* Manual Override Toggle */}
                         <button 
                            onClick={() => toggleAttendance(student.studentId)}
                            className={`w-10 h-6 rounded-full relative transition-colors ${student.status === 'Present' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                         >
                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${student.status === 'Present' ? 'translate-x-4' : 'translate-x-0'}`} />
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </Card>
          
          <div className="pt-2">
            <button 
              onClick={endSession}
              disabled={!sessionActive}
              className={`w-full py-3 rounded-xl font-medium transition-all shadow-sm ${
                sessionActive 
                ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {sessionActive ? 'End Session' : 'Session Completed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
