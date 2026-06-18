// Plays audio alerts using the Web Audio API — no external files needed.
// SOS = urgent descending tone. Missing = slower two-tone warning.

import { useEffect, useRef } from "react";
import socket from "../services/socket";

function playTone(frequency, duration, type = "sine", volume = 0.4) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type      = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available (user hasn't interacted with page yet) — silently skip
  }
}

function playSosAlert() {
  // 3 urgent descending beeps
  [0, 0.35, 0.7].forEach((delay) => {
    setTimeout(() => playTone(880, 0.3, "square", 0.5), delay * 1000);
  });
}

function playMissingAlert() {
  // 2 lower slower tones
  playTone(440, 0.5, "sine", 0.35);
  setTimeout(() => playTone(370, 0.5, "sine", 0.35), 600);
}

function playZoneBreachAlert() {
  playTone(660, 0.25, "sawtooth", 0.3);
  setTimeout(() => playTone(660, 0.25, "sawtooth", 0.3), 300);
}

export function useSoundAlerts() {
  const mutedRef = useRef(false);

  useEffect(() => {
    const onSos          = ()  => { if (!mutedRef.current) playSosAlert();         };
    const onMissing      = ()  => { if (!mutedRef.current) playMissingAlert();     };
    const onZoneBreach   = ()  => { if (!mutedRef.current) playZoneBreachAlert();  };

    socket.on("sos_alert",      onSos);
    socket.on("tracker_missing", onMissing);
    socket.on("zone_breach",    onZoneBreach);

    return () => {
      socket.off("sos_alert",       onSos);
      socket.off("tracker_missing", onMissing);
      socket.off("zone_breach",     onZoneBreach);
    };
  }, []);

  const toggleMute = () => { mutedRef.current = !mutedRef.current; };
  const isMuted    = ()  => mutedRef.current;

  return { toggleMute, isMuted };
}