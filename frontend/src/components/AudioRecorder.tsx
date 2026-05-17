"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Check } from "lucide-react";

interface Props {
  onRecordingComplete: (file: File) => void;
}

export default function AudioRecorder({ onRecordingComplete }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "paused" | "done">("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(32).fill(2));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current!);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: "audio/webm" });
        onRecordingComplete(file);
        setState("done");
        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(animFrameRef.current!);
      };

      mr.start();
      setState("recording");
      setSeconds(0);

      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

      const updateBars = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const normalized = Array.from(data).slice(0, 32).map((v) => Math.max(2, (v / 255) * 48));
        setBars(normalized);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Microphone access is required to record audio.");
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  };

  const pauseRecording = () => {
    if (state === "recording") {
      mediaRecorderRef.current?.pause();
      clearInterval(timerRef.current);
      setState("paused");
    } else {
      mediaRecorderRef.current?.resume();
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      setState("recording");
    }
  };

  const reset = () => {
    setAudioUrl(null);
    setSeconds(0);
    setState("idle");
    setIsPlaying(false);
    setBars(Array(32).fill(2));
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="w-full">
      {/* Waveform visualization */}
      <div className="flex items-center justify-center gap-0.5 h-16 mb-6">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all duration-75"
            style={{
              height: `${h}px`,
              background:
                state === "recording"
                  ? `hsl(${240 + i * 3}, 80%, 65%)`
                  : state === "done"
                  ? "rgba(99,102,241,0.4)"
                  : "rgba(255,255,255,0.08)",
              animationDelay: `${i * 30}ms`,
            }}
          />
        ))}
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <span
          className="text-4xl font-mono font-bold"
          style={{
            color: state === "recording" ? "#ef4444" : state === "done" ? "#10b981" : "#4f46e5",
          }}
        >
          {fmt(seconds)}
        </span>
        <p className="text-slate-500 text-xs mt-1">
          {state === "idle" && "Ready to record"}
          {state === "recording" && "Recording in progress..."}
          {state === "paused" && "Paused"}
          {state === "done" && "Recording complete"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {state === "idle" && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            <Mic size={18} />
            Start Recording
          </button>
        )}

        {(state === "recording" || state === "paused") && (
          <>
            <button
              onClick={pauseRecording}
              className="w-11 h-11 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 flex items-center justify-center transition-all"
            >
              {state === "recording" ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all"
            >
              <Square size={16} />
              Stop
            </button>
          </>
        )}

        {state === "done" && (
          <>
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 flex items-center justify-center transition-all"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Check size={16} />
              <span className="text-sm font-medium">Ready</span>
            </div>
            <button
              onClick={reset}
              className="w-11 h-11 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-all"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}
