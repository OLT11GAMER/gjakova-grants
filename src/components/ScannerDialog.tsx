import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Check, Crop, ImagePlus, LoaderCircle, RotateCcw, X } from "lucide-react";

type ScanImage = { source: string; width: number; height: number };

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Nuk mund të hapet fotografia."));
    image.src = source;
  });
}

async function prepareImage(file: Blob): Promise<ScanImage> {
  const source = URL.createObjectURL(file);
  try {
    const image = await loadImage(source);
    const ratio = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * ratio);
    canvas.height = Math.round(image.naturalHeight * ratio);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Nuk mund të përgatitet fotografia.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { source: canvas.toDataURL("image/jpeg", 0.84), width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(source);
  }
}

function CropPreview({ image, scale, offsetX, offsetY, canvasRef, onReady }: { image: ScanImage; scale: number; offsetX: number; offsetY: number; canvasRef: React.RefObject<HTMLCanvasElement | null>; onReady: () => void }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let active = true;
    void loadImage(image.source).then((photo) => {
      if (!active) return;
      let cropWidth = image.width;
      let cropHeight = image.height;
      cropWidth *= scale;
      cropHeight *= scale;
      const maxX = Math.max(0, image.width - cropWidth);
      const maxY = Math.max(0, image.height - cropHeight);
      const x = Math.max(0, Math.min(maxX, maxX * (offsetX + 1) / 2));
      const y = Math.max(0, Math.min(maxY, maxY * (offsetY + 1) / 2));
      canvas.width = Math.round(cropWidth);
      canvas.height = Math.round(cropHeight);
      canvas.getContext("2d")?.drawImage(photo, x, y, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
      onReady();
    }).catch(() => undefined);
    return () => { active = false; };
  }, [image, scale, offsetX, offsetY, onReady]);
  return <canvas ref={canvasRef} className="scanner-preview__canvas" aria-label="Parapamje e prerë e dokumentit" />;
}

export function ScannerDialog({ onClose, onUse, returnFocusRef }: {
  onClose: () => void;
  onUse: (imageDataUrl: string) => boolean;
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<"opening" | "ready" | "unavailable">("opening");
  const [image, setImage] = useState<ScanImage | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [busy, setBusy] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [error, setError] = useState("");
  const markPreviewReady = useCallback(() => setPreviewReady(true), []);

  useEffect(() => {
    closeRef.current?.focus();
    return () => returnFocusRef?.current?.focus();
  }, [returnFocusRef]);

  useEffect(() => {
    let mounted = true;
    const stopCamera = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
    const openCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState("unavailable");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } });
        if (!mounted) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraState("ready");
      } catch {
        if (mounted) setCameraState("unavailable");
      }
    };
    void openCamera();
    return () => { mounted = false; stopCamera(); };
  }, []);

  useEffect(() => {
    if (cameraState === "ready" && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [cameraState]);

  useEffect(() => {
    const manageKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')]
        .filter((element) => element.tabIndex >= 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", manageKeys);
    return () => window.removeEventListener("keydown", manageKeys);
  }, [onClose]);

  const useFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const prepared = await prepareImage(file);
      setImage(prepared);
      setPreviewReady(false);
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nuk mund të hapet fotografia.");
    } finally {
      setBusy(false);
    }
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) { setCameraState("unavailable"); return; }
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const prepared = await prepareImage(await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Fotografia nuk u ruajt.")), "image/jpeg", 0.9)));
      setImage(prepared);
      setPreviewReady(false);
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Fotografia nuk u ruajt.");
    } finally {
      setBusy(false);
    }
  };

  const useCrop = async () => {
    const preview = cropCanvasRef.current;
    if (!preview || !previewReady) return;
    let output = preview;
    let imageDataUrl = output.toDataURL("image/jpeg", 0.84);
    let attempts = 0;
    while (imageDataUrl.length > 520_000 && attempts < 4) {
      attempts += 1;
      const reduced = document.createElement("canvas");
      reduced.width = Math.round(output.width * 0.78);
      reduced.height = Math.round(output.height * 0.78);
      reduced.getContext("2d")?.drawImage(output, 0, 0, reduced.width, reduced.height);
      output = reduced;
      imageDataUrl = output.toDataURL("image/jpeg", 0.78);
    }
    if (imageDataUrl.length > 520_000) { setError("Fotografia është shumë e madhe. Provo ta presësh më afër dokumentit."); return; }
    if (!onUse(imageDataUrl)) {
      setError("Dokumenti nuk u ruajt. Liro hapësirë në pajisje dhe provo sërish.");
      return;
    }
    onClose();
  };

  return <div className="scanner-backdrop" role="presentation">
    <section ref={dialogRef} className="scanner-dialog" role="dialog" aria-modal="true" aria-labelledby="scanner-title" aria-describedby="scanner-note">
      <header className="scanner-dialog__header"><div><span className="scanner-dialog__icon"><Camera size={20} aria-hidden="true" /></span><div><h2 id="scanner-title">Skanoni dokumentin</h2><p id="scanner-note">Fotografo vetëm ofertën sintetike të shembullit.</p></div></div><button ref={closeRef} type="button" className="scanner-close" aria-label="Mbyll skanerin" onClick={onClose}><X size={21} aria-hidden="true" /></button></header>
      {!image ? <>
        <div className="scanner-camera">
          {cameraState === "ready" ? <><video ref={videoRef} autoPlay playsInline muted aria-label="Pamja e kamerës" /><div className="scanner-camera__frame" aria-hidden="true" /><span className="scanner-camera__hint">Vendos dokumentin brenda kornizës</span></> : cameraState === "opening" ? <div className="scanner-camera__message" role="status"><LoaderCircle className="spin" aria-hidden="true" />Duke hapur kamerën…</div> : <div className="scanner-camera__message"><Camera aria-hidden="true" /><strong>Nuk mund të hapet kamera.</strong><span>Ngarko fotografi ose provo lejen e kamerës në shfletues.</span></div>}
        </div>
        {error ? <p className="scanner-error" role="alert">{error}</p> : null}
        <div className="scanner-actions"><button type="button" className="button button--secondary" onClick={() => fileRef.current?.click()}><ImagePlus size={18} aria-hidden="true" /> Ngarko fotografi</button><button type="button" className="button button--primary" disabled={cameraState !== "ready" || busy} onClick={() => void capture()}><Camera size={18} aria-hidden="true" /> {busy ? "Duke ruajtur…" : "Fotografo"}</button></div>
        <input ref={fileRef} className="sr-only" type="file" accept="image/*" capture="environment" aria-label="Ngarko fotografi të dokumentit" onChange={(event) => { void useFile(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />
      </> : <>
        <div className="scanner-preview"><CropPreview image={image} scale={scale} offsetX={offsetX} offsetY={offsetY} canvasRef={cropCanvasRef} onReady={markPreviewReady} /></div>
        <div className="scanner-crop-controls"><div className="scanner-crop-controls__heading"><Crop size={17} aria-hidden="true" /><strong>Rregullo prerjen</strong><button type="button" className="text-button" onClick={() => { setPreviewReady(false); setScale(1); setOffsetX(0); setOffsetY(0); }}><RotateCcw size={15} aria-hidden="true" /> Rivendos</button></div>
          <label><span>Madhësia</span><input type="range" min="0.62" max="1" step="0.01" value={scale} onChange={(event) => { setPreviewReady(false); setScale(Number(event.target.value)); }} /></label>
          <label><span>Majtas / djathtas</span><input type="range" min="-1" max="1" step="0.02" value={offsetX} onChange={(event) => { setPreviewReady(false); setOffsetX(Number(event.target.value)); }} /></label>
          <label><span>Lart / poshtë</span><input type="range" min="-1" max="1" step="0.02" value={offsetY} onChange={(event) => { setPreviewReady(false); setOffsetY(Number(event.target.value)); }} /></label>
        </div>
        {error ? <p className="scanner-error" role="alert">{error}</p> : null}
        <div className="scanner-actions"><button type="button" className="button button--secondary" onClick={() => { setImage(null); setPreviewReady(false); setCameraState("unavailable"); setError(""); }}><RotateCcw size={18} aria-hidden="true" /> Rishkano</button><button type="button" className="button button--primary" disabled={!previewReady} onClick={() => void useCrop()}><Check size={18} aria-hidden="true" /> Përdor këtë dokument</button></div>
      </>}
      {busy ? <span className="sr-only" role="status">Duke përgatitur fotografinë…</span> : null}
    </section>
  </div>;
}
