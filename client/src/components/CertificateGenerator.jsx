import { useRef, useEffect, useState } from 'react';
import { X, Download, Award } from 'lucide-react';

const CertificateGenerator = ({ participantName, eventName, eventDate, eventVenue, branch, onClose }) => {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const certId = `EB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1400, H = 1000;
    canvas.width = W; canvas.height = H;

    // ─── Background ────────────────────────────────
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, W, H);

    // Subtle warm gradient overlay
    const warmGlow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 700);
    warmGlow.addColorStop(0, 'rgba(255, 248, 230, 0.6)');
    warmGlow.addColorStop(1, 'rgba(255, 248, 230, 0)');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, W, H);

    // ─── Outer Border ──────────────────────────────
    const m = 30;
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    roundRect(ctx, m, m, W - m * 2, H - m * 2, 0);
    ctx.stroke();

    // Inner border
    ctx.strokeStyle = '#d1fae5';
    ctx.lineWidth = 1;
    roundRect(ctx, m + 10, m + 10, W - (m + 10) * 2, H - (m + 10) * 2, 0);
    ctx.stroke();

    // ─── Corner Decorations ────────────────────────
    drawCornerFlourish(ctx, m + 6, m + 6, 1, 1);
    drawCornerFlourish(ctx, W - m - 6, m + 6, -1, 1);
    drawCornerFlourish(ctx, m + 6, H - m - 6, 1, -1);
    drawCornerFlourish(ctx, W - m - 6, H - m - 6, -1, -1);

    // ─── Top accent line ───────────────────────────
    const lineGrad = ctx.createLinearGradient(250, 0, W - 250, 0);
    lineGrad.addColorStop(0, 'rgba(5, 150, 105, 0)');
    lineGrad.addColorStop(0.3, 'rgba(5, 150, 105, 0.4)');
    lineGrad.addColorStop(0.5, 'rgba(5, 150, 105, 0.6)');
    lineGrad.addColorStop(0.7, 'rgba(5, 150, 105, 0.4)');
    lineGrad.addColorStop(1, 'rgba(5, 150, 105, 0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(250, 80); ctx.lineTo(W - 250, 80); ctx.stroke();

    // ─── Logo ──────────────────────────────────────
    const logoY = 120;
    ctx.fillStyle = '#059669';
    ctx.beginPath(); ctx.arc(W / 2, logoY, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', W / 2, logoY);

    // ─── "EventBridge" ─────────────────────────────
    ctx.fillStyle = '#78716c';
    ctx.font = '500 13px Inter, system-ui, sans-serif';
    ctx.fillText('EVENTBRIDGE', W / 2, logoY + 44);

    // ─── CERTIFICATE OF ────────────────────────────
    const titleY = logoY + 90;
    ctx.fillStyle = '#57534e';
    ctx.font = '300 13px Inter, system-ui, sans-serif';
    ctx.fillText('C E R T I F I C A T E    O F', W / 2, titleY);

    // ─── PARTICIPATION ─────────────────────────────
    ctx.fillStyle = '#059669';
    ctx.font = '700 44px Inter, system-ui, sans-serif';
    ctx.fillText('PARTICIPATION', W / 2, titleY + 52);

    // ─── Divider ───────────────────────────────────
    const divY = titleY + 82;
    const divGrad = ctx.createLinearGradient(W / 2 - 120, 0, W / 2 + 120, 0);
    divGrad.addColorStop(0, 'rgba(5, 150, 105, 0)');
    divGrad.addColorStop(0.5, 'rgba(5, 150, 105, 0.35)');
    divGrad.addColorStop(1, 'rgba(5, 150, 105, 0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 120, divY); ctx.lineTo(W / 2 + 120, divY); ctx.stroke();

    // ─── "This is to certify that" ─────────────────
    const bodyY = divY + 38;
    ctx.fillStyle = '#78716c';
    ctx.font = '400 16px Inter, system-ui, sans-serif';
    ctx.fillText('This is to certify that', W / 2, bodyY);

    // ─── Participant Name ──────────────────────────
    const nameY = bodyY + 52;
    ctx.fillStyle = '#1c1917';
    ctx.font = '700 38px Inter, system-ui, sans-serif';
    ctx.fillText(participantName, W / 2, nameY);

    // Name underline
    const nameW = ctx.measureText(participantName).width;
    const nlGrad = ctx.createLinearGradient(W / 2 - nameW / 2 - 20, 0, W / 2 + nameW / 2 + 20, 0);
    nlGrad.addColorStop(0, 'rgba(5, 150, 105, 0)');
    nlGrad.addColorStop(0.3, 'rgba(5, 150, 105, 0.25)');
    nlGrad.addColorStop(0.7, 'rgba(5, 150, 105, 0.25)');
    nlGrad.addColorStop(1, 'rgba(5, 150, 105, 0)');
    ctx.strokeStyle = nlGrad; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - nameW / 2 - 20, nameY + 14); ctx.lineTo(W / 2 + nameW / 2 + 20, nameY + 14); ctx.stroke();

    // ─── "has successfully participated in" ────────
    const afterY = nameY + 46;
    ctx.fillStyle = '#78716c';
    ctx.font = '400 16px Inter, system-ui, sans-serif';
    ctx.fillText('has successfully participated in', W / 2, afterY);

    // ─── Event Name ────────────────────────────────
    const evY = afterY + 46;
    ctx.fillStyle = '#292524';
    ctx.font = '600 28px Inter, system-ui, sans-serif';
    let dispName = eventName;
    const maxW = W - 200;
    if (ctx.measureText(eventName).width > maxW) {
      while (ctx.measureText(dispName + '...').width > maxW && dispName.length > 0) dispName = dispName.slice(0, -1);
      dispName += '...';
    }
    ctx.fillText(dispName, W / 2, evY);

    // ─── Event details ─────────────────────────────
    const detY = evY + 46;
    ctx.fillStyle = '#a8a29e';
    ctx.font = '400 14px Inter, system-ui, sans-serif';
    ctx.fillText(`${formatDate(eventDate)}  •  ${eventVenue}  •  ${branch}`, W / 2, detY);

    // ─── Bottom divider ────────────────────────────
    const bDivY = detY + 50;
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(250, bDivY); ctx.lineTo(W - 250, bDivY); ctx.stroke();

    // ─── Signatures ────────────────────────────────
    const sigY = bDivY + 55;

    // Left - Date
    ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(240, sigY + 18); ctx.lineTo(480, sigY + 18); ctx.stroke();
    ctx.fillStyle = '#a8a29e'; ctx.font = '400 12px Inter, system-ui, sans-serif';
    ctx.fillText('Date of Issue', 360, sigY + 36);
    ctx.fillStyle = '#059669'; ctx.font = '500 14px Inter, system-ui, sans-serif';
    ctx.fillText(formatDate(new Date()), 360, sigY + 8);

    // Right - Coordinator
    ctx.strokeStyle = '#d6d3d1';
    ctx.beginPath(); ctx.moveTo(W - 480, sigY + 18); ctx.lineTo(W - 240, sigY + 18); ctx.stroke();
    ctx.fillStyle = '#a8a29e'; ctx.font = '400 12px Inter, system-ui, sans-serif';
    ctx.fillText('Event Coordinator', W - 360, sigY + 36);
    ctx.fillStyle = '#059669'; ctx.font = '600 14px Inter, system-ui, sans-serif';
    ctx.fillText('EventBridge', W - 360, sigY + 8);

    // ─── Certificate ID ────────────────────────────
    ctx.fillStyle = '#d6d3d1';
    ctx.font = '400 11px Inter, system-ui, sans-serif';
    ctx.fillText(`Certificate ID: ${certId}`, W / 2, H - 48);

    // Bottom accent line
    ctx.strokeStyle = lineGrad; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(250, H - 68); ctx.lineTo(W - 250, H - 68); ctx.stroke();

    setReady(true);
  }, [participantName, eventName, eventDate, eventVenue, branch]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Certificate_${eventName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-neutral-900">Participation Certificate</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} disabled={!ready} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors border border-neutral-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-elevated bg-white">
          <canvas ref={canvasRef} className="w-full h-auto" style={{ display: 'block' }} />
        </div>
      </div>
    </div>
  );
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function drawCornerFlourish(ctx, x, y, dx, dy) {
  ctx.strokeStyle = '#059669'; ctx.lineWidth = 2;
  const l = 28;
  ctx.beginPath(); ctx.moveTo(x, y + dy * l); ctx.lineTo(x, y); ctx.lineTo(x + dx * l, y); ctx.stroke();
  ctx.fillStyle = '#059669';
  ctx.beginPath(); ctx.arc(x + dx * 3, y + dy * 3, 3, 0, Math.PI * 2); ctx.fill();
}

export default CertificateGenerator;
