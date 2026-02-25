// src/pages/BreathingPage.tsx
import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import NavBar from "../components/NavBar";
import { BreathingCircle, Phase } from "../components/BreathingCircle";
import { SettingsModal } from "../components/SettingsModal";
import { VideoBackground } from "../components/VideoBackground";
import api from "../api";
import { toast } from "sonner";
import Footer from "../components/Footer";
import { SessionStats } from "../components/SessionStats"; 
import { SessionFeedbackModal } from "../components/SessionFeedbackModal"; 

interface Session {
  _id: string;
  sessionDate: string;
  moodBefore: number;
  moodAfter: number;
  focusLevel: number;
  stressLevel: number;
  breathingDepth: number;
  calmnessScore: number;
  distractionCount: number;
  timeOfDay: string;
  noiseLevel: string;
  sessionLength: number;
  cycles: number;
  notes?: string;
}

export default function BreathingPage() {
  const [isActive, setIsActive] = useState(false);
  const [phaseDurations, setPhaseDurations] = useState({ inhale: 4, hold: 2, exhale: 5, pause: 3 });
  const [videoOpacity, setVideoOpacity] = useState(0.55);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [videoSpeed] = useState(1);
  const [videoBrightness, setVideoBrightness] = useState(1.05);
  const [pauseBetween, setPauseBetween] = useState(1.8);
  const startTimeRef = useRef<number | null>(null);
  const wasActiveRef = useRef(isActive);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [totalStats, setTotalStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    streak: 0,
  });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);
  const savedClientIdsRef = useRef(new Set<string>());

  const videos = [
    "/videos/med-01.mp4",
    "/videos/med-02.mp4",
    "/videos/med-03.mp4",
    "/videos/med-04.mp4",
    "/videos/med-05.mp4",
    "/videos/med-06.mp4",
    "/videos/med-07.mp4",
  ];

  const [visualIntensity, setVisualIntensity] = useState(0.6);
  const [phase, setPhase] = useState<Phase | null>(null);

  const handlePhaseChange = useCallback((p: Phase, intensity: number) => {
    setPhase(p);
    setVisualIntensity(prev => prev * 0.7 + intensity * 0.3);
  }, []);

  const desiredPlaySeconds = useMemo(() => {
    const total = phaseDurations.inhale + phaseDurations.hold + phaseDurations.exhale + phaseDurations.pause;
    return total / 2;
  }, [phaseDurations]);

  const [circleSize, setCircleSize] = useState(() => {
  const w = window.innerWidth, h = window.innerHeight;
      return Math.round(Math.min(w,h) * 0.5); // size at the begining
    });

    useEffect(()=>{
      const onResize = () => {
        const w = window.innerWidth, h = window.innerHeight;
        setCircleSize(Math.round(Math.min(w,h) * 0.5)); // re-size
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);


  const calculateStreak = (sessions: Session[]) => {
    if (sessions.length === 0) return 0;

    const todayStr = new Date().toDateString();
    const hasToday = sessions.some(s => new Date(s.sessionDate).toDateString() === todayStr);
    if (!hasToday) return 0;

    const uniqueDates = [...new Set(sessions.map(s => new Date(s.sessionDate).toDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1; // today
    let current = new Date();
    current.setDate(current.getDate() - 1);

    while (true) {
      const nextDateStr = current.toDateString();
      if (uniqueDates.includes(nextDateStr)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const fetchTotalStats = async () => {
    try {
      const res = await api.get("/sessions");
      const sessions: Session[] = res.data;
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum, s) => sum + s.sessionLength, 0);
      const streak = calculateStreak(sessions);
      setTotalStats({ totalSessions, totalMinutes: Math.round(totalMinutes), streak });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    fetchTotalStats();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      interval = setInterval(() => {
        if (startTimeRef.current) {
          setCurrentDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

    const saveSession = async (payload: any) => {
      try {
        // if  payload contains clientId — dubles protection
        const clientId = payload?.clientId;
        if (clientId && savedClientIdsRef.current.has(clientId)) {
          console.info('saveSession: already saved (clientId)', clientId);
          return; // ignore
        }

        // in procces
        if (clientId) savedClientIdsRef.current.add(clientId);

        await api.post("/sessions", payload);
        toast.success("Session saved");

        // post-success: ensure clientId left in set to prevent future duplicates
        if (clientId) savedClientIdsRef.current.add(clientId);

        setCycles(0);
        setCurrentDuration(0);
        fetchTotalStats();
      } catch (err: any) {
        // in case of error — delete clientId из set, we can fix now
        const clientId = payload?.clientId;
        if (clientId) savedClientIdsRef.current.delete(clientId);
        console.error("Failed saving session:", err?.response?.data || err);
        toast.error("Failed to save session");
      }
    };


    const handleFeedbackSubmit = async (feedback: any) => {
      if (!pendingPayload) return;
      const updatedPayload = { ...pendingPayload, ...feedback, feedbackSubmitted: true };

      await saveSession(updatedPayload);

      // clear pending only after save 
      setPendingPayload(null);
      setFeedbackOpen(false);
    };


  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
    } else {
      if (wasActiveRef.current && startTimeRef.current) {
        const now = Date.now();
        const durationMs = now - startTimeRef.current;
        const sessionLength = Math.round((durationMs / 60000) * 10) / 10 || 0.1;

        const payload = {
          sessionDate: new Date().toISOString(),
          moodBefore: 5,
          moodAfter: 5,
          focusLevel: 5,
          stressLevel: 5,
          breathingDepth: 5,
          calmnessScore: 5,
          distractionCount: 0,
          timeOfDay: new Date().toLocaleTimeString([], { hour12: false }),
          noiseLevel: "Quiet",
          sessionLength,
          cycles,
          notes: "",
        };

        if (sessionLength >= 0.5) {
          const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
          setPendingPayload({ ...payload, clientId, feedbackSubmitted: false });
          // ensure saved flag for this id is false (in case)
          savedClientIdsRef.current.delete(clientId);
          setFeedbackOpen(true);
        } else {
          // add a clientId for consistency
          const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
          saveSession({ ...payload, clientId, feedbackSubmitted: true });
        }


      }
      startTimeRef.current = null;
    }
    wasActiveRef.current = isActive;
  }, [isActive]); 

  return (
    <div className="relative h-screen overflow-hidden"> 
      {/* Background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url('/public/Background_img_Meditation.jpg')`,
        }}
      />

      <VideoBackground
        videoFiles={videos}
        isActive={isActive}
        baseImage="/images/background.jpg"
        targetOpacity={videoOpacity}
        playbackRate={videoSpeed}
        crossfadeSeconds={2.0}
        pauseBetweenVideos={pauseBetween}
        brightness={videoBrightness}
        phase={phase}
        desiredPlaySeconds={desiredPlaySeconds}
        maxSpeed={1.2}
      />

      <NavBar />

      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"> 
        <div className="pointer-events-auto"> 
          <BreathingCircle
            isActive={isActive}
            phaseDurations={phaseDurations}
            onCycleComplete={() => setCycles(c => c + 1)}
            onPhaseChange={handlePhaseChange}
            onToggle={() => setIsActive(a => !a)}
            size={circleSize}
            glowIntensity={1.0}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div
        className="fixed bottom-20 right-6 z-40 flex flex-col items-end gap-3"
        style={{ pointerEvents: "auto" }}
      >
        <button
          onClick={() => setIsActive(a => !a)}
          className="px-5 py-2.5 rounded-full bg-[#2e6fbf] text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          {isActive ? "Pause" : "Start"}
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-3 rounded-full bg-[#0F2A45] border border-[#23364a] text-[#AEE6FF] shadow-md hover:shadow-lg transition-shadow"
        >
          ⚙
        </button>
      </div>

      {/* Session Stats */}
      <div className="fixed bottom-20 left-6 z-40">
        <SessionStats
          currentSession={{ duration: currentDuration, cycles }}
          totalStats={totalStats}
        />
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        phaseDurations={phaseDurations}
        onChangeDurations={setPhaseDurations}
        videoOpacity={videoOpacity}
        onVideoOpacityChange={setVideoOpacity}
        videoSpeed={videoSpeed}
        onVideoSpeedChange={() => {}}
      />

        <SessionFeedbackModal
        open={feedbackOpen}
        onClose={async () => {
          setFeedbackOpen(false);
          if (pendingPayload) {
            const cid = pendingPayload.clientId;
            if (cid && !savedClientIdsRef.current.has(cid)) {
              savedClientIdsRef.current.add(cid);
              await saveSession({ ...pendingPayload, feedbackSubmitted: false });
            }
            setPendingPayload(null);
          }
        }}
        initialData={{
          moodBefore: 5,
          moodAfter: 5,
          focusLevel: 5,
          stressLevel: 5,
          breathingDepth: 5,
          calmnessScore: 5,
          distractionCount: 0,
          noiseLevel: "Quiet",
          notes: "",
        }}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20"> 
        <Footer />
      </div>
    </div>
  );
}