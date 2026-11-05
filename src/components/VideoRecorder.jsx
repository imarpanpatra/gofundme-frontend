import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api.js';
import { CloseIcon } from './icons.jsx';
import Spinner from './Spinner.jsx';

const MAX_SECONDS = 30;
const MAX_BYTES = 4 * 1024 * 1024;

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

export default function VideoRecorder({ onClose, onDone }) {
  const liveRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileRef = useRef(null);
  const [phase, setPhase] = useState('starting');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [clip, setClip] = useState(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError('');
    setPhase('starting');
    if (!navigator.mediaDevices?.getUserMedia || pickMimeType() === null) {
      setError("Your browser can't record video here. You can upload a video file instead.");
      setPhase('error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 854 } },
        audio: true,
      });
      streamRef.current = stream;
      if (liveRef.current) liveRef.current.srcObject = stream;
      setPhase('ready');
    } catch {
      setError('Camera or microphone access was blocked. Allow access in your browser, or upload a video file instead.');
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    startCamera();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      clearInterval(timerRef.current);
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      stopStream();
    };
  }, [startCamera, stopStream, onClose]);

  useEffect(() => () => clip && URL.revokeObjectURL(clip.url), [clip]);

  useEffect(() => {
    if (liveRef.current && streamRef.current && liveRef.current.srcObject !== streamRef.current) {
      liveRef.current.srcObject = streamRef.current;
    }
  }, [phase]);

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const startRecording = () => {
    const mimeType = pickMimeType();
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: 650000,
      audioBitsPerSecond: 64000,
    });
    recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const type = (recorder.mimeType || mimeType || 'video/webm').split(';')[0];
      const blob = new Blob(chunksRef.current, { type });
      stopStream();
      setClip({ blob, url: URL.createObjectURL(blob), type });
      setPhase('review');
    };
    recorderRef.current = recorder;
    recorder.start(1000);
    setSeconds(0);
    setPhase('recording');
    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS) stopRecording();
    }, 250);
  };

  const retake = () => {
    setClip(null);
    startCamera();
  };

  const pickFile = (file) => {
    if (!file) return;
    if (!/^video\/(webm|mp4|quicktime)$/.test(file.type)) {
      setError('Choose a WEBM, MP4 or MOV video.');
      return;
    }
    stopStream();
    setClip({ blob: file, url: URL.createObjectURL(file), type: file.type });
    setError('');
    setPhase('review');
  };

  const useClip = async () => {
    if (clip.blob.size > MAX_BYTES) {
      setError('This video is larger than 4MB. Record a shorter one, or choose a smaller file.');
      return;
    }
    setPhase('uploading');
    setError('');
    try {
      const form = new FormData();
      const ext = clip.type.includes('mp4') ? 'mp4' : clip.type.includes('quicktime') ? 'mov' : 'webm';
      form.append('video', new File([clip.blob], `message.${ext}`, { type: clip.type }));
      const { url } = await api('/payments/video', { method: 'POST', form });
      onDone(url);
    } catch (err) {
      setError(err.message);
      setPhase('review');
    }
  };

  return createPortal(
    <div className="recorder" role="dialog" aria-modal="true" aria-label="Record a video message">
      <button type="button" className="recorder-close" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>
      <aside className="recorder-tips">
        <p className="recorder-tips-title">🙂 Tips</p>
        <ul>
          <li>Be kind and respectful</li>
          <li>Keep it family-friendly</li>
          <li>Respect everyone's privacy</li>
          <li>Spread positivity!</li>
        </ul>
      </aside>

      <div className="recorder-stage">
        {phase === 'review' || phase === 'uploading' ? (
          <video key={clip?.url} src={clip?.url} className="recorder-video" controls autoPlay playsInline />
        ) : (
          <video ref={liveRef} className="recorder-video recorder-mirror" autoPlay muted playsInline />
        )}

        {phase === 'starting' && <div className="recorder-center"><Spinner /></div>}
        {phase === 'error' && <div className="recorder-center recorder-error">{error}</div>}

        {phase === 'recording' && (
          <span className="recorder-timer">
            <i /> 0:{String(seconds).padStart(2, '0')} / 0:{MAX_SECONDS}
          </span>
        )}

        <div className="recorder-controls">
          {phase === 'ready' && (
            <>
              <p>
                Hit <b>RECORD</b> to start!
              </p>
              <button type="button" className="record-btn" onClick={startRecording} aria-label="Start recording">
                <span />
              </button>
            </>
          )}
          {phase === 'recording' && (
            <button type="button" className="record-btn is-recording" onClick={stopRecording} aria-label="Stop recording">
              <span />
            </button>
          )}
          {(phase === 'review' || phase === 'uploading') && (
            <div className="recorder-actions">
              <button type="button" className="pill-btn pill-outline" onClick={retake} disabled={phase === 'uploading'}>
                Retake
              </button>
              <button type="button" className="pill-btn recorder-use" onClick={useClip} disabled={phase === 'uploading'}>
                {phase === 'uploading' ? <Spinner small /> : 'Use this video'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="recorder-footer">
        {error && phase !== 'error' && <p className="recorder-error">{error}</p>}
        {phase !== 'uploading' && (
          <button type="button" className="text-link recorder-upload" onClick={() => fileRef.current.click()}>
            or upload a video file (max 4MB)
          </button>
        )}
        <input ref={fileRef} type="file" accept="video/webm,video/mp4,video/quicktime" hidden onChange={(e) => pickFile(e.target.files[0])} />
      </div>
    </div>,
    document.body
  );
}
