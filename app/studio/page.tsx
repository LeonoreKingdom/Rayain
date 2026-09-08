"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type StepId = "template" | "content" | "style" | "preview";
type PreviewMode = "desktop" | "mobile";
type PreviewVariant = "floral" | "terracotta" | "sage" | "lilac";
type TemplateFilter = "Semua acara" | "Pernikahan" | "Ulang tahun" | "Anniversary" | "Pertunangan";
type InvitationDraft = { coupleName: string; date: string; time: string; location: string; message: string };
type FontChoice = "playfair" | "sans";
type LayoutChoice = "centered" | "editorial";
type PhotoChoice = "none" | "garden";
type StyleSettings = { color: PreviewVariant; font: FontChoice; layout: LayoutChoice; photo: PhotoChoice };
type SaveState = "saved" | "saving" | "published" | "publishing";
type StudioIconName = "arrow-left" | "arrow-right" | "check" | "chevron-down" | "eye" | "heart" | "image" | "layout" | "map-pin" | "more" | "music" | "palette" | "pause" | "play" | "save" | "sparkle" | "text" | "volume";

const steps: { id: StepId; number: string; label: string; caption: string }[] = [
  { id: "template", number: "01", label: "Pilih template", caption: "Mulai dari gaya yang kamu suka" },
  { id: "content", number: "02", label: "Isi undangan", caption: "Ceritakan momen spesialmu" },
  { id: "style", number: "03", label: "Gaya tampilan", caption: "Buat terasa lebih personal" },
  { id: "preview", number: "04", label: "Pratinjau", caption: "Lihat sebelum dibagikan" },
];

const templateFilters: TemplateFilter[] = ["Semua acara", "Pernikahan", "Ulang tahun", "Anniversary", "Pertunangan"];

const templateOptions: { id: string; name: string; description: string; eventType: Exclude<TemplateFilter, "Semua acara">; variant: PreviewVariant }[] = [
  { id: "garden", name: "The Garden", description: "Lembut & romantis", eventType: "Pernikahan", variant: "floral" },
  { id: "sunday", name: "Sunday Club", description: "Hangat & ceria", eventType: "Ulang tahun", variant: "terracotta" },
  { id: "ever-after", name: "Ever After", description: "Tenang & timeless", eventType: "Anniversary", variant: "sage" },
  { id: "soft-promise", name: "Soft Promise", description: "Manis & intimate", eventType: "Pertunangan", variant: "lilac" },
];

const initialDraft: InvitationDraft = { coupleName: "Alya & Reza", date: "2026-10-12", time: "10:00", location: "The Alana Hotel, Yogyakarta", message: "with love, Alya & Reza" };
const initialStyle: StyleSettings = { color: "floral", font: "playfair", layout: "centered", photo: "none" };
const musicTracks: MusicTrack[] = [
  { id: "first-dance", title: "First Dance", artist: "The Rayain Library", duration: "03:24", mood: "Romantic & warm", previewNotes: [261.63, 329.63, 392, 329.63] },
  { id: "morning-light", title: "Morning Light", artist: "The Rayain Library", duration: "02:48", mood: "Soft & hopeful", previewNotes: [392, 440, 523.25, 440] },
  { id: "garden-notes", title: "Garden Notes", artist: "The Rayain Library", duration: "03:07", mood: "Intimate & calm", previewNotes: [329.63, 293.66, 261.63, 293.66] },
];

type MusicTrack = { id: string; title: string; artist: string; duration: string; mood: string; previewNotes: number[] };

function formatDate(date: string) {
  if (!date) return "Tanggal belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function formatPreviewDate(date: string) {
  if (!date) return "DD . MM . YYYY";
  const [year, month, day] = date.split("-");
  return `${day} . ${month} . ${year}`;
}

const stepContent: Record<StepId, { eyebrow: string; title: string; body: string }> = {
  template: { eyebrow: "LANGKAH 01 / 04", title: "Pilih fondasi ceritamu", body: "Semua template dibuat untuk terasa hangat sejak pertama kali dibuka." },
  content: { eyebrow: "LANGKAH 02 / 04", title: "Isi detail momenmu", body: "Data contoh di samping bisa kamu ganti kapan saja di studio." },
  style: { eyebrow: "LANGKAH 03 / 04", title: "Beri sentuhan personal", body: "Pilih warna dan nuansa yang paling dekat dengan ceritamu." },
  preview: { eyebrow: "LANGKAH 04 / 04", title: "Satu langkah sebelum dibagikan", body: "Pastikan semuanya sudah terasa seperti kamu dan pasanganmu." },
};

function StudioIcon({ name, size = 17 }: { name: StudioIconName; size?: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8 };
  const paths: Record<StudioIconName, React.ReactNode> = {
    "arrow-left": <path {...common} d="M19 12H5m6 6-6-6 6-6" />,
    "arrow-right": <path {...common} d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path {...common} d="m5 12 4.3 4.3L19 6.7" />,
    "chevron-down": <path {...common} d="m6 9 6 6 6-6" />,
    eye: <><path {...common} d="M3.5 12s3.1-5 8.5-5 8.5 5 8.5 5-3.1 5-8.5 5-8.5-5-8.5-5Z" /><circle {...common} cx="12" cy="12" r="2" /></>,
    heart: <path {...common} d="M20.8 8.9c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.9Z" />,
    image: <><rect {...common} x="3" y="4" width="18" height="16" rx="2" /><circle {...common} cx="8.3" cy="9" r="1.4" /><path {...common} d="m4 17 4.8-4.6a1.5 1.5 0 0 1 2.1 0l2.2 2.1 1.4-1.3a1.5 1.5 0 0 1 2.1 0L21 16.5" /></>,
    layout: <><rect {...common} x="3.5" y="4" width="17" height="16" rx="2" /><path {...common} d="M3.5 9.5h17M9 9.5V20" /></>,
    "map-pin": <><path {...common} d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /><circle {...common} cx="12" cy="10" r="2" /></>,
    more: <><circle cx="5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="12" r="1.2" fill="currentColor" /></>,
    music: <><path {...common} d="M9 18V5l10-2v13" /><circle {...common} cx="6" cy="18" r="3" /><circle {...common} cx="16" cy="16" r="3" /></>,
    pause: <><rect {...common} x="6" y="5" width="4" height="14" rx="1" /><rect {...common} x="14" y="5" width="4" height="14" rx="1" /></>,
    palette: <><path {...common} d="M12 4a8 8 0 1 0 0 16h1.2a1.8 1.8 0 0 0 1-3.3 1.8 1.8 0 0 1 1-3.3H17a3 3 0 0 0 3-3c0-3.5-3.6-6.4-8-6.4Z" /><circle cx="7.5" cy="11" r="1" fill="currentColor" /><circle cx="9" cy="7.8" r="1" fill="currentColor" /><circle cx="13" cy="7" r="1" fill="currentColor" /></>,
    play: <path {...common} d="m8 5 11 7-11 7V5Z" />,
    save: <><path {...common} d="M5 4h12l2 2v14H5V4Z" /><path {...common} d="M8 4v5h8V4M8 20v-6h8v6" /></>,
    sparkle: <path {...common} d="m12 3 1.1 4.2a4.9 4.9 0 0 0 3.5 3.5L21 12l-4.4 1.3a4.9 4.9 0 0 0-3.5 3.5L12 21l-1.1-4.2a4.9 4.9 0 0 0-3.5-3.5L3 12l4.4-1.3a4.9 4.9 0 0 0 3.5-3.5L12 3Z" />,
    text: <><path {...common} d="M5 5h14M12 5v14M8.5 19h7" /></>,
    volume: <><path {...common} d="M4 10v4h3l4 3V7l-4 3H4Z" /><path {...common} d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">{paths[name]}</svg>;
}

function TemplateThumbnail({ variant, selected = false, compact = false }: { variant: PreviewVariant; selected?: boolean; compact?: boolean }) {
  return <div className={`studio-template-thumbnail studio-thumb-${variant} ${selected ? "studio-thumb-selected" : ""} ${compact ? "studio-thumb-compact" : ""}`}><span className="studio-thumb-line" /><span className="studio-thumb-orbit" /><span className="studio-thumb-label">the beginning of</span><strong>A <i>&</i> R</strong><span className="studio-thumb-date">12 . 10 . 2026</span></div>;
}

function InvitationMusicPlayer({ track, isPlaying, autoplay, onToggle }: { track: MusicTrack; isPlaying: boolean; autoplay: boolean; onToggle: () => void }) {
  return <div className="invitation-music-player"><span className="invitation-music-icon"><StudioIcon name="music" size={11} /></span><span className="invitation-music-copy"><small>Musik latar</small><strong>{track.title}</strong><em>{autoplay ? "Putar otomatis" : "Tekan untuk memutar"}</em></span><button className="invitation-music-button" type="button" aria-label={isPlaying ? `Jeda ${track.title}` : `Putar ${track.title}`} aria-pressed={isPlaying} onClick={onToggle}><StudioIcon name={isPlaying ? "pause" : "play"} size={11} /></button></div>;
}

function InvitationPreview({ variant, mode, draft, style, musicTrack, musicPlaying, musicAutoplay, onToggleMusic }: { variant: PreviewVariant; mode: PreviewMode; draft: InvitationDraft; style: StyleSettings; musicTrack: MusicTrack; musicPlaying: boolean; musicAutoplay: boolean; onToggleMusic: () => void }) {
  return <div className={`invitation-preview preview-${mode}`}><div className={`preview-paper preview-paper-${variant} preview-font-${style.font} preview-layout-${style.layout}`}>{style.photo === "garden" ? <div className="preview-photo-placeholder" aria-hidden="true"><span>✽</span></div> : null}<div className="preview-paper-top"><span>✦</span><span>{draft.coupleName || "YOUR STORY"}</span><span>✦</span></div><div className="preview-flower preview-flower-left">✽</div><div className="preview-flower preview-flower-right">✽</div><div className="preview-hero-copy"><span>the beginning of</span><h3>{draft.coupleName || "Nama pasangan"}</h3><div className="preview-divider" /><strong>WE&apos;RE GETTING MARRIED</strong><p>{formatPreviewDate(draft.date)}</p></div><InvitationMusicPlayer track={musicTrack} isPlaying={musicPlaying} autoplay={musicAutoplay} onToggle={onToggleMusic} /><div className="preview-bottom-copy">Save the date<br /><span>{draft.message || "with love, your story"}</span></div></div></div>;
}

function GuestPreview({ draft, style, musicTrack, musicPlaying, musicAutoplay, onToggleMusic, onClose, onNotify }: { draft: InvitationDraft; style: StyleSettings; musicTrack: MusicTrack; musicPlaying: boolean; musicAutoplay: boolean; onToggleMusic: () => void; onClose: () => void; onNotify: (message: string) => void }) {
  return <div className="guest-preview-backdrop" role="presentation" onClick={onClose}><div className="guest-preview-window" role="dialog" aria-modal="true" aria-labelledby="guest-preview-title" onClick={(event) => event.stopPropagation()}><div className="guest-preview-header"><div><span className="sample-label">PRATINJAU SEBAGAI TAMU</span><h2 id="guest-preview-title">Begini undanganmu akan terlihat.</h2></div><button className="guest-close" type="button" aria-label="Tutup pratinjau tamu" onClick={onClose}>×</button></div><div className="guest-preview-content"><div className="guest-viewport"><div className="guest-browser-bar"><span /><span /><span /><small>rayain.id/undangan/{draft.coupleName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cerita-kita"}</small></div><div className="guest-page"><InvitationPreview variant={style.color} mode="mobile" draft={draft} style={style} musicTrack={musicTrack} musicPlaying={musicPlaying} musicAutoplay={musicAutoplay} onToggleMusic={onToggleMusic} /></div></div><aside className="guest-preview-aside"><span className="section-kicker">THE GUEST VIEW</span><h3>Hangat, personal, dan siap dibagikan.</h3><p>Tamu akan melihat undangan ini, lalu bisa mengonfirmasi kehadiran dari halaman yang sama.</p><div className="guest-music-status"><span className="guest-music-status-icon"><StudioIcon name="music" size={15} /></span><div><span>Musik latar</span><strong>{musicTrack.title}</strong><small>{musicAutoplay ? "Akan mulai otomatis saat dibuka." : "Tamu menekan tombol play."}</small></div></div><div className="guest-rsvp-card"><span className="guest-rsvp-icon"><StudioIcon name="heart" size={15} /></span><div><span>Untuk tamu</span><strong>Konfirmasi kehadiran</strong></div><button type="button" onClick={() => onNotify("Form RSVP akan hadir di langkah berikutnya.")}>RSVP <StudioIcon name="arrow-right" size={13} /></button></div><div className="guest-share-note"><StudioIcon name="sparkle" size={14} /><span>Preview ini memakai data contoh dan belum punya tautan publik.</span></div></aside></div></div></div>;
}

function MusicPanel({ open, onClose, selectedTrackId, isPlaying, autoplay, onSelectTrack, onPreviewTrack, onTogglePlayback, onToggleAutoplay, tracks = musicTracks, errorMessage }: { open: boolean; onClose: () => void; selectedTrackId: string; isPlaying: boolean; autoplay: boolean; onSelectTrack: (id: string) => void; onPreviewTrack: (id: string) => void; onTogglePlayback: () => void; onToggleAutoplay: () => void; tracks?: MusicTrack[]; errorMessage?: string }) {
  if (!open) return null;
  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? tracks[0];
  if (errorMessage || !selectedTrack) {
    return <div className="music-panel-backdrop" role="presentation" onClick={onClose}><aside className="music-panel" role="dialog" aria-modal="true" aria-labelledby="music-panel-title" onClick={(event) => event.stopPropagation()}><div className="music-panel-header"><div><span className="sample-label">MUSIK LATAR</span><h2 id="music-panel-title">Beri irama pada ceritamu.</h2><p>Pilih soundtrack yang akan menemani tamu membuka undangan.</p></div><button className="music-panel-close" type="button" aria-label="Tutup panel musik" onClick={onClose}>×</button></div><div className={`music-feedback ${errorMessage ? "music-feedback-error" : ""}`} role={errorMessage ? "alert" : "status"}><span className="music-feedback-icon"><StudioIcon name={errorMessage ? "more" : "music"} size={17} /></span><div><strong>{errorMessage ? "Musik belum bisa dimuat" : "Belum ada pilihan musik"}</strong><p>{errorMessage ?? "Tambahkan soundtrack untuk memberi irama pada undanganmu."}</p>{errorMessage ? <button className="music-feedback-action" type="button" onClick={() => window.location.reload()}>Coba lagi</button> : null}</div></div></aside></div>;
  }

  return <div className="music-panel-backdrop" role="presentation" onClick={onClose}><aside className="music-panel" role="dialog" aria-modal="true" aria-labelledby="music-panel-title" onClick={(event) => event.stopPropagation()}><div className="music-panel-header"><div><span className="sample-label">MUSIK LATAR</span><h2 id="music-panel-title">Beri irama pada ceritamu.</h2><p>Pilih soundtrack yang akan menemani tamu membuka undangan.</p></div><button className="music-panel-close" type="button" aria-label="Tutup panel musik" onClick={onClose}>×</button></div><div className="music-player"><button className="music-play-button" type="button" aria-label={isPlaying ? `Jeda ${selectedTrack.title}` : `Putar ${selectedTrack.title}`} onClick={onTogglePlayback}><StudioIcon name={isPlaying ? "pause" : "play"} size={18} /></button><div className="music-player-copy"><span>Sekarang dipilih</span><strong>{selectedTrack.title}</strong><small>{selectedTrack.artist} · {selectedTrack.duration}</small></div><StudioIcon name="volume" size={17} /></div><div className="music-section-heading"><span className="sample-label">PILIH SOUNDTRACK</span><span>{tracks.length} pilihan</span></div><div className="music-track-list">{tracks.map((track) => <button className={`music-track ${selectedTrackId === track.id ? "music-track-active" : ""}`} type="button" key={track.id} aria-label={`Dengarkan cuplikan ${track.title}`} aria-pressed={selectedTrackId === track.id} onClick={() => { onSelectTrack(track.id); onPreviewTrack(track.id); }}><span className="music-track-icon"><StudioIcon name={selectedTrackId === track.id && isPlaying ? "pause" : "play"} size={13} /></span><span className="music-track-copy"><strong>{track.title}</strong><small>{track.mood} · {track.artist} · Cuplikan 2 detik</small></span><span className="music-track-duration">{track.duration}</span></button>)}</div><div className="music-autoplay"><div><strong>Putar otomatis</strong><small>Mulai saat tamu membuka undangan</small></div><button className={`music-switch ${autoplay ? "music-switch-on" : ""}`} type="button" role="switch" aria-checked={autoplay} aria-label="Aktifkan putar otomatis" onClick={onToggleAutoplay}><span /></button></div><div className="music-panel-note"><StudioIcon name="sparkle" size={14} /><span>Data contoh — klik track untuk dengarkan cuplikannya.</span></div></aside></div>;
}

function StepDetails({ activeStep, selectedTemplate, templateFilter, draft, style, onSelectTemplate, onFilterTemplate, onDraftChange, onStyleChange, onNext }: { activeStep: StepId; selectedTemplate: string; templateFilter: TemplateFilter; draft: InvitationDraft; style: StyleSettings; onSelectTemplate: (id: string) => void; onFilterTemplate: (filter: TemplateFilter) => void; onDraftChange: (field: keyof InvitationDraft, value: string) => void; onStyleChange: (field: keyof StyleSettings, value: StyleSettings[keyof StyleSettings]) => void; onNext: () => void }) {
  if (activeStep === "template") {
    const visibleTemplates = templateOptions.filter((template) => templateFilter === "Semua acara" || template.eventType === templateFilter);
    return <div className="template-catalog"><div className="template-catalog-toolbar"><span className="sample-label">TAMPILKAN UNTUK</span><span className="template-count">{visibleTemplates.length} template</span></div><div className="event-filter-pills" role="tablist" aria-label="Filter jenis acara">{templateFilters.map((filter) => <button className={templateFilter === filter ? "event-filter-active" : ""} key={filter} type="button" role="tab" aria-selected={templateFilter === filter} onClick={() => onFilterTemplate(filter)}>{filter}</button>)}</div>{visibleTemplates.length ? <div className="template-options">{visibleTemplates.map((template) => <button className={`template-option ${selectedTemplate === template.id ? "template-option-active" : ""}`} key={template.id} type="button" onClick={() => onSelectTemplate(template.id)}><TemplateThumbnail variant={template.variant} selected={selectedTemplate === template.id} /><span className="template-option-copy"><strong>{template.name}</strong><small>{template.description}</small></span>{selectedTemplate === template.id ? <span className="selected-check"><StudioIcon name="check" size={13} /></span> : null}</button>)}</div> : <div className="template-empty">Belum ada template untuk jenis acara ini.</div>}</div>;
  }

  if (activeStep === "content") {
    return <form className="invitation-form" onSubmit={(event) => { event.preventDefault(); onNext(); }}><div className="sample-fields-head"><span className="sample-label">DATA CONTOH</span><span className="sample-ready"><span /> Siap diedit</span></div><label htmlFor="couple-name">Nama pasangan atau acara<input id="couple-name" name="coupleName" type="text" value={draft.coupleName} onChange={(event) => onDraftChange("coupleName", event.target.value)} placeholder="Contoh: Alya & Reza" /></label><div className="form-row"><label htmlFor="event-date">Tanggal acara<input id="event-date" name="date" type="date" value={draft.date} onChange={(event) => onDraftChange("date", event.target.value)} /></label><label htmlFor="event-time">Waktu<input id="event-time" name="time" type="time" value={draft.time} onChange={(event) => onDraftChange("time", event.target.value)} /></label></div><label htmlFor="event-location">Lokasi acara<input id="event-location" name="location" type="text" value={draft.location} onChange={(event) => onDraftChange("location", event.target.value)} placeholder="Contoh: The Alana Hotel" /></label><label htmlFor="event-message">Pesan pembuka<textarea id="event-message" name="message" rows={2} value={draft.message} onChange={(event) => onDraftChange("message", event.target.value)} placeholder="Tulis pesan singkat untuk tamumu" /></label><button className="mini-action" type="submit">Lanjut ke gaya tampilan <StudioIcon name="arrow-right" size={14} /></button></form>;
  }

  if (activeStep === "style") {
    return <div className="customize-panel"><div className="customize-section"><div className="customize-section-head"><span className="sample-label">WARNA UTAMA</span><span className="customize-value">{style.color === "floral" ? "Blush pink" : style.color === "terracotta" ? "Warm sand" : style.color === "sage" ? "Soft sage" : "Dusty lilac"}</span></div><div className="swatches"><button className={`swatch swatch-blush ${style.color === "floral" ? "swatch-active" : ""}`} type="button" aria-label="Blush pink" aria-pressed={style.color === "floral"} onClick={() => onStyleChange("color", "floral")} /><button className={`swatch swatch-sand ${style.color === "terracotta" ? "swatch-active" : ""}`} type="button" aria-label="Warm sand" aria-pressed={style.color === "terracotta"} onClick={() => onStyleChange("color", "terracotta")} /><button className={`swatch swatch-sage ${style.color === "sage" ? "swatch-active" : ""}`} type="button" aria-label="Soft sage" aria-pressed={style.color === "sage"} onClick={() => onStyleChange("color", "sage")} /><button className={`swatch swatch-lilac ${style.color === "lilac" ? "swatch-active" : ""}`} type="button" aria-label="Dusty lilac" aria-pressed={style.color === "lilac"} onClick={() => onStyleChange("color", "lilac")} /></div></div><div className="customize-section"><div className="customize-section-head"><span className="sample-label">FONT UTAMA</span><span className="customize-value">{style.font === "playfair" ? "Playfair Display" : "DM Sans"}</span></div><div className="font-choice-grid"><button className={`font-choice ${style.font === "playfair" ? "font-choice-active" : ""}`} type="button" aria-pressed={style.font === "playfair"} onClick={() => onStyleChange("font", "playfair")}><span className="font-serif">Aa</span><span><strong>Playfair Display</strong><small>Elegan & timeless</small></span>{style.font === "playfair" ? <span className="font-check">✓</span> : null}</button><button className={`font-choice ${style.font === "sans" ? "font-choice-active" : ""}`} type="button" aria-pressed={style.font === "sans"} onClick={() => onStyleChange("font", "sans")}><span className="font-sans">Aa</span><span><strong>DM Sans</strong><small>Modern & ringan</small></span>{style.font === "sans" ? <span className="font-check">✓</span> : null}</button></div></div><div className="customize-section"><div className="customize-section-head"><span className="sample-label">FOTO SAMPUL</span><span className="customize-value">{style.photo === "garden" ? "Ditambahkan" : "Opsional"}</span></div><button className={`photo-option ${style.photo === "garden" ? "photo-option-active" : ""}`} type="button" aria-pressed={style.photo === "garden"} onClick={() => onStyleChange("photo", style.photo === "garden" ? "none" : "garden")}><span className="photo-option-icon"><StudioIcon name="image" size={16} /></span><span><strong>{style.photo === "garden" ? "Foto contoh terpasang" : "Tambah foto contoh"}</strong><small>Mockup foto untuk area sampul</small></span><span className="photo-toggle">{style.photo === "garden" ? "✓" : "+"}</span></button></div><div className="customize-section"><div className="customize-section-head"><span className="sample-label">TATA LETAK</span><span className="customize-value">{style.layout === "centered" ? "Centered" : "Editorial"}</span></div><div className="layout-options"><button className={style.layout === "centered" ? "layout-active" : ""} type="button" aria-pressed={style.layout === "centered"} onClick={() => onStyleChange("layout", "centered")}><StudioIcon name="layout" size={14} /> Centered</button><button className={style.layout === "editorial" ? "layout-active" : ""} type="button" aria-pressed={style.layout === "editorial"} onClick={() => onStyleChange("layout", "editorial")}><StudioIcon name="text" size={14} /> Editorial</button></div></div><button className="mini-action" type="button" onClick={onNext}>Lihat pratinjau <StudioIcon name="arrow-right" size={14} /></button></div>;
  }

  return <div className="final-check"><span className="final-check-icon"><StudioIcon name="sparkle" size={19} /></span><strong>Preview terasa pas.</strong><p>Undanganmu masih menggunakan data contoh. Kamu bisa mengedit semua detail sebelum menerbitkannya.</p><button className="mini-action" type="button" onClick={onNext}>Simpan sebagai draf <StudioIcon name="save" size={14} /></button></div>;
}

export default function StudioPage() {
  const [activeStep, setActiveStep] = useState<StepId>("template");
  const [selectedTemplate, setSelectedTemplate] = useState("garden");
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>("Semua acara");
  const [draft, setDraft] = useState<InvitationDraft>(initialDraft);
  const [style, setStyle] = useState<StyleSettings>(initialStyle);
  const [guestPreview, setGuestPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [musicPanel, setMusicPanel] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(musicTracks[0].id);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicAutoplay, setMusicAutoplay] = useState(false);
  const previewAudioRef = useRef<AudioContext | null>(null);
  const previewTimerRef = useRef<number | null>(null);
  const musicPlayingRef = useRef(false);
  const [toast, setToast] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const selected = useMemo(() => templateOptions.find((template) => template.id === selectedTemplate) ?? templateOptions[0], [selectedTemplate]);
  const selectedMusicTrack = useMemo(() => musicTracks.find((track) => track.id === selectedMusic) ?? musicTracks[0], [selectedMusic]);
  const activeIndex = steps.findIndex((step) => step.id === activeStep);
  const content = stepContent[activeStep];

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("panel") === "music") {
      setMusicPanel(true);
    }
  }, []);

  const isBusy = saveState === "saving" || saveState === "publishing";
  const saveDraft = () => {
    if (isBusy) return;
    setSaveState("saving");
    window.setTimeout(() => { setSaveState("saved"); setToast("Draf tersimpan di workspace mock."); }, 550);
  };
  const publishDraft = () => {
    if (isBusy || saveState === "published") return;
    setSaveState("publishing");
    window.setTimeout(() => { setSaveState("published"); setToast("Undangan berhasil diterbitkan di workspace mock."); }, 700);
  };
  const goNext = () => {
    if (activeIndex < steps.length - 1) setActiveStep(steps[activeIndex + 1].id);
    else saveDraft();
  };

  const saveStateLabel = saveState === "saving" ? "Menyimpan perubahan..." : saveState === "publishing" ? "Menyiapkan terbitan..." : saveState === "published" ? "Undangan sudah terbit" : "Semua perubahan tersimpan";
  const saveButtonLabel = saveState === "saving" ? "Menyimpan..." : "Simpan draf";
  const publishButtonLabel = saveState === "publishing" ? "Menerbitkan..." : saveState === "published" ? "Sudah terbit" : "Terbitkan";

  const updateDraft = (field: keyof InvitationDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const updateStyle = (field: keyof StyleSettings, value: StyleSettings[keyof StyleSettings]) => setStyle((current) => ({ ...current, [field]: value }) as StyleSettings);
  const stopMusicPreview = () => {
    if (previewTimerRef.current !== null) window.clearTimeout(previewTimerRef.current);
    previewTimerRef.current = null;
    const context = previewAudioRef.current;
    previewAudioRef.current = null;
    if (context) void context.close();
    musicPlayingRef.current = false;
    setMusicPlaying(false);
  };
  const previewMusic = (trackId: string) => {
    const track = musicTracks.find((item) => item.id === trackId) ?? musicTracks[0];
    stopMusicPreview();
    if (!window.AudioContext) {
      setToast("Preview audio belum didukung di browser ini.");
      return;
    }
    const context = new window.AudioContext();
    const startAt = context.currentTime + 0.04;
    track.previewNotes.forEach((frequency, index) => {
      const start = startAt + index * 0.36;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.09, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.31);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.33);
    });
    previewAudioRef.current = context;
    musicPlayingRef.current = true;
    setMusicPlaying(true);
    previewTimerRef.current = window.setTimeout(() => {
      if (previewAudioRef.current === context) {
        previewAudioRef.current = null;
        musicPlayingRef.current = false;
        setMusicPlaying(false);
        void context.close();
      }
    }, track.previewNotes.length * 360 + 180);
  };
  useEffect(() => () => {
    if (previewTimerRef.current !== null) window.clearTimeout(previewTimerRef.current);
    if (previewAudioRef.current) void previewAudioRef.current.close();
    musicPlayingRef.current = false;
  }, []);
  const selectMusic = (id: string) => setSelectedMusic(id);
  const toggleMusicPlayback = () => {
    if (musicPlayingRef.current) stopMusicPreview();
    else previewMusic(selectedMusic);
  };
  const toggleMusicAutoplay = () => {
    const nextAutoplay = !musicAutoplay;
    setMusicAutoplay(nextAutoplay);
    if (guestPreview) {
      if (nextAutoplay) previewMusic(selectedMusic);
      else stopMusicPreview();
    }
  };

  return <div className="studio-shell"><header className="studio-topbar"><Link className="studio-back" href="/"><StudioIcon name="arrow-left" size={16} /> Kembali ke dasbor</Link><div className="studio-brand"><span className="studio-brand-mark"><StudioIcon name="heart" size={16} /></span><strong>rayain</strong><span>Studio</span></div><div className="studio-top-actions"><button className={`studio-music-button ${musicPanel ? "studio-music-button-active" : ""}`} type="button" aria-expanded={musicPanel} onClick={() => setMusicPanel(true)}><StudioIcon name="music" size={15} /> Musik</button><span className={`studio-save-state studio-save-state-${saveState}`} aria-live="polite"><span /> {saveStateLabel}</span><button className="studio-save-button" type="button" disabled={isBusy} aria-busy={saveState === "saving"} onClick={saveDraft}><StudioIcon name="save" size={15} /> {saveButtonLabel}</button><button className="studio-publish-button" type="button" disabled={isBusy || saveState === "published"} aria-busy={saveState === "publishing"} onClick={publishDraft}>{publishButtonLabel} {saveState !== "published" ? <StudioIcon name="arrow-right" size={15} /> : <StudioIcon name="check" size={15} />}</button><span className="avatar studio-avatar">SA</span></div></header><div className="studio-body"><aside className="studio-sidebar"><div className="studio-sidebar-intro"><span className="section-kicker">STUDIO DESAIN</span><h1>Buat undanganmu.</h1><p>Mulai dari template, lalu jadikan setiap detail terasa milikmu.</p></div><nav className="studio-steps" aria-label="Langkah studio">{steps.map((step, index) => <button className={`studio-step ${activeStep === step.id ? "studio-step-active" : ""} ${index < activeIndex ? "studio-step-done" : ""}`} key={step.id} type="button" onClick={() => setActiveStep(step.id)} aria-current={activeStep === step.id ? "step" : undefined}><span className="step-number">{index < activeIndex ? <StudioIcon name="check" size={13} /> : step.number}</span><span className="step-copy"><strong>{step.label}</strong><small>{step.caption}</small></span></button>)}</nav><div className="studio-sidebar-note"><span><StudioIcon name="sparkle" size={15} /></span><p><strong>Pro tip</strong><br />Pilih template yang paling dekat dengan suasana momenmu.</p></div></aside><main className="studio-main"><div className="studio-heading"><div><span className="section-kicker">{content.eyebrow}</span><h2>{content.title}</h2><p>{content.body}</p></div><div className="studio-heading-actions"><button className="studio-icon-action" type="button" aria-label="Pengaturan tampilan" onClick={() => setToast("Pengaturan tampilan siap dikembangkan.")}><StudioIcon name="more" size={18} /></button></div></div><div className="studio-workspace"><section className="studio-controls"><div className="controls-header"><div><span className="sample-label">{activeStep === "template" ? "PILIHAN TEMPLATE" : "DETAIL LANGKAH"}</span><h3>{activeStep === "template" ? "Yang mana paling kamu?" : steps[activeIndex].label}</h3></div><span className="step-counter">{String(activeIndex + 1).padStart(2, "0")} <i>/ 04</i></span></div><StepDetails activeStep={activeStep} selectedTemplate={selectedTemplate} templateFilter={templateFilter} draft={draft} style={style} onSelectTemplate={setSelectedTemplate} onFilterTemplate={setTemplateFilter} onDraftChange={updateDraft} onStyleChange={updateStyle} onNext={goNext} /><div className="controls-footer"><button className="back-step" type="button" disabled={activeIndex === 0} onClick={() => setActiveStep(steps[activeIndex - 1].id)}><StudioIcon name="arrow-left" size={14} /> Kembali</button><button className="next-step" type="button" onClick={goNext}>{activeIndex === steps.length - 1 ? "Simpan draf" : "Lanjutkan"} <StudioIcon name="arrow-right" size={14} /></button></div></section><section className="studio-preview-panel"><div className="preview-panel-header"><div><span className="sample-label">LIVE PREVIEW</span><strong>{selected.name}</strong><span className="preview-music-mode"><StudioIcon name="music" size={10} /> {selectedMusicTrack.title} · {musicAutoplay ? "Otomatis" : "Manual"}</span></div><div className="preview-panel-actions"><button className="guest-preview-button" type="button" onClick={() => { setGuestPreview(true); if (musicAutoplay) previewMusic(selectedMusic); }}><StudioIcon name="eye" size={13} /> Lihat sebagai tamu</button><div className="preview-mode-toggle"><button className={previewMode === "desktop" ? "mode-active" : ""} type="button" onClick={() => setPreviewMode("desktop")}>Desktop</button><button className={previewMode === "mobile" ? "mode-active" : ""} type="button" onClick={() => setPreviewMode("mobile")}>Mobile</button></div></div></div><div className="preview-stage"><InvitationPreview variant={style.color} mode={previewMode} draft={draft} style={style} musicTrack={selectedMusicTrack} musicPlaying={musicPlaying} musicAutoplay={musicAutoplay} onToggleMusic={toggleMusicPlayback} /><span className="preview-stage-note"><StudioIcon name="eye" size={13} /> Preview dengan data contoh</span></div></section></div><div className="studio-bottom-note"><span><StudioIcon name="heart" size={14} /></span><p>Undanganmu akan terlihat seperti ini saat dibuka oleh tamu.</p><button type="button" onClick={() => setToast("Tautan bantuan belum tersedia di mock studio.")}>Pelajari cara kerja studio <StudioIcon name="arrow-right" size={13} /></button></div></main><aside className="studio-inspector"><div className="inspector-heading"><div><span className="sample-label">RINGKASAN</span><h3>Data contoh</h3></div><button className="inspector-more" type="button" aria-label="Menu ringkasan" onClick={() => setToast("Menu ringkasan siap dikembangkan.")}><StudioIcon name="more" size={17} /></button></div><div className="inspector-preview"><TemplateThumbnail variant={style.color} compact /><div className="inspector-template-copy"><span>Template terpilih</span><strong>{selected.name}</strong><small>{selected.description}</small></div></div><div className="inspector-divider" /><dl className="data-summary"><div><dt>Nama acara</dt><dd>{draft.coupleName || "Belum diisi"}</dd></div><div><dt>Tanggal</dt><dd>{formatDate(draft.date)}</dd></div><div><dt>Lokasi</dt><dd>{draft.location || "Belum diisi"}</dd></div></dl><button className="edit-data-button" type="button" onClick={() => setActiveStep("content")}><StudioIcon name="text" size={14} /> Edit data contoh</button><div className="inspector-status"><span className="status-icon"><StudioIcon name="sparkle" size={14} /></span><div><strong>Siap dikustomisasi</strong><p>{saveState === "published" ? "Terbit secara lokal di workspace mock." : "Data ini hanya contoh dan belum tersimpan ke server."}</p></div></div></aside></div><MusicPanel open={musicPanel} onClose={() => setMusicPanel(false)} selectedTrackId={selectedMusic} isPlaying={musicPlaying} autoplay={musicAutoplay} onSelectTrack={selectMusic} onPreviewTrack={previewMusic} onTogglePlayback={toggleMusicPlayback} onToggleAutoplay={toggleMusicAutoplay} />{guestPreview ? <GuestPreview draft={draft} style={style} musicTrack={selectedMusicTrack} musicPlaying={musicPlaying} musicAutoplay={musicAutoplay} onToggleMusic={toggleMusicPlayback} onClose={() => { setGuestPreview(false); stopMusicPreview(); }} onNotify={setToast} /> : null}{toast ? <div className="toast" role="status"><span className="toast-check">✓</span>{toast}</div> : null}</div>;
}
