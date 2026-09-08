"use client";

import Link from "next/link";
import { useState } from "react";

type SettingIconName = "arrow-left" | "calendar" | "check" | "clock" | "heart" | "home" | "layout" | "more" | "sparkle" | "users" | "whatsapp";

function SettingIcon({ name, size = 17 }: { name: SettingIconName; size?: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8 };
  const paths: Record<SettingIconName, React.ReactNode> = {
    "arrow-left": <path {...common} d="M19 12H5m6 6-6-6 6-6" />,
    calendar: <><rect {...common} x="3.5" y="5" width="17" height="16" rx="2" /><path {...common} d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17" /></>,
    check: <path {...common} d="m5 12 4.3 4.3L19 6.7" />,
    clock: <><circle {...common} cx="12" cy="12" r="8.5" /><path {...common} d="M12 7v5l3.2 2" /></>,
    heart: <path {...common} d="M20.8 8.9c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.9Z" />,
    home: <><path {...common} d="m3.5 10.8 8.5-7 8.5 7" /><path {...common} d="M5.5 9.5v9.8h13V9.5M9.5 19.3v-5.8h3v5.8" /></>,
    layout: <><rect {...common} x="3.5" y="4" width="17" height="16" rx="2" /><path {...common} d="M3.5 9.5h17M9 9.5V20" /></>,
    more: <><circle cx="5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="12" r="1.2" fill="currentColor" /></>,
    sparkle: <path {...common} d="m12 3 1.1 4.2a4.9 4.9 0 0 0 3.5 3.5L21 12l-4.4 1.3a4.9 4.9 0 0 0-3.5 3.5L12 21l-1.1-4.2a4.9 4.9 0 0 0-3.5-3.5L3 12l4.4-1.3a4.9 4.9 0 0 0 3.5-3.5L12 3Z" />,
    users: <><path {...common} d="M16 20v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.6A3.6 3.6 0 0 0 4 18.6V20" /><circle {...common} cx="10" cy="8" r="3.2" /><path {...common} d="M16 8.2a3 3 0 0 1 0 5.7M18.2 15a3.6 3.6 0 0 1 2.3 3.4V20" /></>,
    whatsapp: <><path {...common} d="M19.8 4.3A9.5 9.5 0 0 0 4.6 16.2L3 21l4.9-1.6A9.5 9.5 0 1 0 19.8 4.3Z" /><path {...common} d="M8.3 7.8c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.6.7c.6 1.2 1.5 2.1 2.7 2.7l.7-.6c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5 0 .4-.2 1-.5 1.2-.4.4-1 .6-1.7.5-1.2-.2-2.6-.9-3.9-2.1-1.3-1.2-2.1-2.5-2.5-3.7-.3-.9-.1-1.6.2-2.1Z" /></>,
  };

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">{paths[name]}</svg>;
}

function SettingToggle({ label, description, enabled, onChange, icon }: { label: string; description: string; enabled: boolean; onChange: () => void; icon: SettingIconName }) {
  return (
    <div className="rsvp-setting-row">
      <span className="rsvp-setting-icon"><SettingIcon name={icon} size={16} /></span>
      <span className="rsvp-setting-copy"><strong>{label}</strong><small>{description}</small></span>
      <button className={`rsvp-toggle ${enabled ? "rsvp-toggle-on" : ""}`} type="button" role="switch" aria-checked={enabled} aria-label={label} onClick={onChange}><span /></button>
    </div>
  );
}

export default function RSVPSettingsPage() {
  const [rsvpEnabled, setRsvpEnabled] = useState(true);
  const [plusOneEnabled, setPlusOneEnabled] = useState(true);
  const [partySizeEnabled, setPartySizeEnabled] = useState(true);
  const [deadlineEnabled, setDeadlineEnabled] = useState(false);
  const [deadline, setDeadline] = useState("2026-09-30");
  const [successMessage, setSuccessMessage] = useState("Terima kasih, sampai jumpa di hari bahagia kami.");
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  return (
    <div className="guests-shell settings-shell">
      <aside className="guests-sidebar">
        <div className="brand guests-brand"><span className="brand-mark"><SettingIcon name="heart" size={19} /></span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></div>
        <div className="sidebar-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          <Link className="nav-item" href="/"><SettingIcon name="home" size={18} /><span>Dasbor</span></Link>
          <Link className="nav-item" href="/#invitations"><SettingIcon name="layout" size={18} /><span>Undangan saya</span></Link>
          <Link className="nav-item" href="/studio"><SettingIcon name="layout" size={18} /><span>Template</span></Link>
          <Link className="nav-item nav-item-active" href="/guests"><SettingIcon name="users" size={18} /><span>Tamu &amp; RSVP</span><span className="nav-count">8</span></Link>
        </nav>
        <div className="sidebar-label sidebar-label-spaced">Kelola</div>
        <nav className="sidebar-nav">
          <Link className="nav-item" href="/share"><SettingIcon name="whatsapp" size={18} /><span>Sebar undangan</span></Link>
          <Link className="nav-item nav-item-active" href="/guests/settings"><SettingIcon name="more" size={18} /><span>Pengaturan RSVP</span></Link>
        </nav>
        <div className="sidebar-bottom"><div className="sidebar-tip"><span className="tip-icon"><SettingIcon name="sparkle" size={16} /></span><p><strong>Atur dengan hati.</strong><br />Buat tamu merasa disambut.</p></div><Link className="profile-card" href="/profile"><span className="avatar avatar-small">SA</span><span className="profile-copy"><strong>Sarah Anindita</strong><small>sarah@rayain.id</small></span><SettingIcon name="more" size={17} /></Link></div>
      </aside>

      <main className="guests-main settings-main">
        <header className="guests-topbar"><Link className="guests-back" href="/guests"><SettingIcon name="arrow-left" size={16} /> Kembali ke tamu &amp; RSVP</Link><div className="guests-brand-center"><span className="brand-mark"><SettingIcon name="heart" size={15} /></span><strong>rayain</strong><span>Pengaturan RSVP</span></div><div className="guests-top-actions"><span className="guests-save-state"><span /> Semua perubahan tersimpan</span><span className="avatar">SA</span></div></header>
        <div className="settings-content">
          <section className="settings-heading"><div><span className="section-kicker">RSVP SETTINGS</span><h1>Atur pengalaman RSVP.</h1><p>Sesuaikan cara tamu memberi kabar untuk undangan Alya &amp; Reza.</p></div><span className="settings-heading-mark"><SettingIcon name="heart" size={25} /></span></section>
          <section className="settings-invitation-bar"><span className="settings-invitation-cover"><span>the beginning of</span><strong>A <i>&amp;</i> R</strong><small>12 . 10 . 2026</small></span><span><small className="sample-label">UNDANGAN AKTIF</small><strong>Alya &amp; Reza</strong><em><SettingIcon name="calendar" size={12} /> 12 Oktober 2026 · The Alana Hotel</em></span><Link href="/undangan/alya-reza">Lihat undangan <SettingIcon name="arrow-left" size={12} /></Link></section>
          <div className="settings-layout">
            <div className="settings-card settings-options-card"><div className="settings-card-heading"><div><span className="sample-label">KONFIGURASI</span><h2>Opsi konfirmasi</h2><p>Kontrol informasi yang bisa diberikan oleh tamu.</p></div><span className="settings-card-number">01</span></div><div className="rsvp-setting-list"><SettingToggle icon="check" label="Terima RSVP" description="Tamu dapat mengirim konfirmasi kehadiran." enabled={rsvpEnabled} onChange={() => setRsvpEnabled((value) => !value)} /><SettingToggle icon="users" label="Izinkan pendamping" description="Tamu dapat mengajak pasangan atau pendamping." enabled={plusOneEnabled} onChange={() => setPlusOneEnabled((value) => !value)} /><SettingToggle icon="users" label="Tanyakan jumlah tamu" description="Minta jumlah orang yang akan hadir bersama mereka." enabled={partySizeEnabled} onChange={() => setPartySizeEnabled((value) => !value)} /><SettingToggle icon="clock" label="Batas waktu RSVP" description="Tutup konfirmasi secara otomatis pada tanggal tertentu." enabled={deadlineEnabled} onChange={() => setDeadlineEnabled((value) => !value)} /></div>{deadlineEnabled ? <label className="settings-date-field"><span>Konfirmasi paling lambat</span><span><SettingIcon name="calendar" size={14} /><input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></span></label> : <div className="settings-inline-note"><SettingIcon name="sparkle" size={14} /><span>Tanpa batas waktu, tamu tetap bisa memberi kabar kapan saja.</span></div>}</div>
            <div className="settings-card settings-message-card"><div className="settings-card-heading"><div><span className="sample-label">PESAN PENUTUP</span><h2>Ucapkan terima kasih</h2><p>Pesan ini muncul setelah tamu mengirim RSVP.</p></div><span className="settings-card-number">02</span></div><label className="settings-message-field"><span>Pesan sukses</span><textarea aria-label="Pesan sukses" value={successMessage} maxLength={120} onChange={(event) => setSuccessMessage(event.target.value)} /><small>{successMessage.length}/120 karakter</small></label><div className="settings-message-preview"><span className="settings-preview-icon"><SettingIcon name="check" size={15} /></span><span><small>PRATINJAU PESAN</small><strong>{successMessage || "Tulis pesan untuk tamu kamu."}</strong></span></div></div>
          </div>
          <section className="settings-save-bar"><span><SettingIcon name="sparkle" size={14} /><span>Perubahan hanya berlaku untuk undangan ini.</span></span><button className="button button-primary settings-save-button" type="button" onClick={saveSettings}><SettingIcon name="check" size={14} /> {saved ? "Tersimpan" : "Simpan pengaturan"}</button></section>
          <div className="settings-bottom-note"><SettingIcon name="users" size={14} /><p>Pengaturan ini masih berupa contoh dan belum tersimpan ke server.</p></div>
        </div>
      </main>
      {saved ? <div className="toast" role="status"><span className="toast-check">✓</span>Pengaturan RSVP tersimpan di sesi ini.</div> : null}
    </div>
  );
}
