"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ShareIconName =
  | "arrow-left"
  | "arrow-right"
  | "calendar"
  | "check"
  | "chevron-down"
  | "clock"
  | "copy"
  | "edit"
  | "external"
  | "heart"
  | "home"
  | "layout"
  | "link"
  | "menu"
  | "message"
  | "more"
  | "phone"
  | "plus"
  | "send"
  | "sparkle"
  | "users"
  | "video"
  | "whatsapp";

const recipientGroups = [
  {
    id: "family",
    label: "Keluarga inti",
    detail: "Orang tua, saudara, dan keluarga dekat",
    count: 14,
  },
  {
    id: "friends",
    label: "Teman dekat",
    detail: "Teman yang ingin ikut merayakan",
    count: 38,
  },
  {
    id: "colleagues",
    label: "Rekan kerja",
    detail: "Kontak dari kantor dan komunitas",
    count: 24,
  },
  {
    id: "vip",
    label: "Tamu spesial",
    detail: "Tamu yang kamu tandai penting",
    count: 8,
  },
];

const invitation = {
  title: "Alya & Reza",
  date: "12 Oktober 2026",
  location: "The Alana Hotel, Yogyakarta",
  slug: "alya-reza",
};
const initialMessage =
  "Halo {{nama}}, kami ingin berbagi kabar bahagia. Dengan penuh sukacita, kami mengundangmu untuk hadir di hari spesial kami.\n\nLihat undangan lengkapnya di sini: {{tautan}}\n\nSampai jumpa! 🤍\nAlya & Reza";

function ShareIcon({
  name,
  size = 17,
}: {
  name: ShareIconName;
  size?: number;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };
  const paths: Record<ShareIconName, React.ReactNode> = {
    "arrow-left": <path {...common} d="M19 12H5m6 6-6-6 6-6" />,
    "arrow-right": <path {...common} d="M5 12h14m-6-6 6 6-6 6" />,
    calendar: (
      <>
        <rect {...common} x="3.5" y="5" width="17" height="16" rx="2" />
        <path {...common} d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17" />
      </>
    ),
    check: <path {...common} d="m5 12 4.3 4.3L19 6.7" />,
    "chevron-down": <path {...common} d="m6 9 6 6 6-6" />,
    clock: (
      <>
        <circle {...common} cx="12" cy="12" r="8.5" />
        <path {...common} d="M12 7v5l3.2 2" />
      </>
    ),
    copy: (
      <>
        <rect {...common} x="8" y="8" width="11" height="11" rx="2" />
        <path
          {...common}
          d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
        />
      </>
    ),
    edit: (
      <>
        <path {...common} d="M4 20h4l10.8-10.8a2.1 2.1 0 0 0-3-3L5 17v3Z" />
        <path {...common} d="m14.5 7.5 3 3" />
      </>
    ),
    external: (
      <>
        <path {...common} d="M13 5h6v6M19 5l-8 8" />
        <path
          {...common}
          d="M18 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"
        />
      </>
    ),
    heart: (
      <path
        {...common}
        d="M20.8 8.9c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.9Z"
      />
    ),
    home: (
      <>
        <path {...common} d="m3.5 10.8 8.5-7 8.5 7" />
        <path {...common} d="M5.5 9.5v9.8h13V9.5M9.5 19.3v-5.8h3v5.8" />
      </>
    ),
    layout: (
      <>
        <rect {...common} x="3.5" y="4" width="17" height="16" rx="2" />
        <path {...common} d="M3.5 9.5h17M9 9.5V20" />
      </>
    ),
    link: (
      <>
        <path
          {...common}
          d="M10 13.9 8.3 15.6a3 3 0 0 1-4.2-4.2l2.3-2.3a3 3 0 0 1 4.2 0"
        />
        <path
          {...common}
          d="m14 10.1 1.7-1.7a3 3 0 0 1 4.2 4.2l-2.3 2.3a3 3 0 0 1-4.2 0"
        />
        <path {...common} d="m8.5 12 7-2" />
      </>
    ),
    menu: (
      <>
        <path {...common} d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    message: (
      <>
        <path
          {...common}
          d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        />
        <path {...common} d="M7 9h10M7 13h6" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1.2" fill="currentColor" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        <circle cx="19" cy="12" r="1.2" fill="currentColor" />
      </>
    ),
    phone: (
      <>
        <path
          {...common}
          d="M7.2 4.5 5.6 5.8a2 2 0 0 0-.6 2.2c1.5 4.7 4.7 8 9.4 9.4a2 2 0 0 0 2.2-.6l1.3-1.6a1.5 1.5 0 0 0-.3-2.2l-2-1.3a1.5 1.5 0 0 0-1.9.2l-.6.6a10 10 0 0 1-3.7-3.7l.6-.6a1.5 1.5 0 0 0 .2-1.9l-1.3-2a1.5 1.5 0 0 0-2.2-.3Z"
        />
      </>
    ),
    plus: <path {...common} d="M12 5v14M5 12h14" />,
    send: (
      <>
        <path {...common} d="m4 5 16 7-16 7 3-7-3-7Z" />
        <path {...common} d="M7 12h13" />
      </>
    ),
    sparkle: (
      <path
        {...common}
        d="m12 3 1.1 4.2a4.9 4.9 0 0 0 3.5 3.5L21 12l-4.4 1.3a4.9 4.9 0 0 0-3.5 3.5L12 21l-1.1-4.2a4.9 4.9 0 0 0-3.5-3.5L3 12l4.4-1.3a4.9 4.9 0 0 0 3.5-3.5L12 3Z"
      />
    ),
    users: (
      <>
        <path
          {...common}
          d="M16 20v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.6A3.6 3.6 0 0 0 4 18.6V20"
        />
        <circle {...common} cx="10" cy="8" r="3.2" />
        <path
          {...common}
          d="M16 8.2a3 3 0 0 1 0 5.7M18.2 15a3.6 3.6 0 0 1 2.3 3.4V20"
        />
      </>
    ),
    video: (
      <>
        <rect {...common} x="3" y="6" width="13" height="12" rx="2" />
        <path {...common} d="m16 10 5-3v10l-5-3" />
      </>
    ),
    whatsapp: (
      <>
        <path
          {...common}
          d="M19.8 4.3A9.5 9.5 0 0 0 4.6 16.2L3 21l4.9-1.6A9.5 9.5 0 1 0 19.8 4.3Z"
        />
        <path
          {...common}
          d="M8.3 7.8c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.6.7c.6 1.2 1.5 2.1 2.7 2.7l.7-.6c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5 0 .4-.2 1-.5 1.2-.4.4-1 .6-1.7.5-1.2-.2-2.6-.9-3.9-2.1-1.3-1.2-2.1-2.5-2.5-3.7-.3-.9-.1-1.6.2-2.1Z"
        />
      </>
    ),
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function PhonePreview({ message }: { message: string }) {
  const previewMessage = message
    .replaceAll("{{nama}}", "Rani")
    .replaceAll("{{tautan}}", "rayain.id/undangan/alya-reza");
  return (
    <div className="share-phone">
      <div className="phone-notch" />
      <div className="phone-status">
        <span>09:41</span>
        <span>● ◔ ▰</span>
      </div>
      <div className="phone-whatsapp-bar">
        <span className="phone-avatar">AR</span>
        <div>
          <strong>Alya &amp; Reza</strong>
          <small>online</small>
        </div>
        <span className="phone-actions">
          <ShareIcon name="video" size={15} />
          <ShareIcon name="phone" size={15} />
          <ShareIcon name="more" size={15} />
        </span>
      </div>
      <div className="phone-chat">
        <span className="chat-date">HARI INI</span>
        <div className="chat-bubble">
          <p>{previewMessage}</p>
          <small>
            09:41 <span>✓✓</span>
          </small>
        </div>
        <div className="chat-link-card">
          <span className="chat-link-cover">
            <ShareIcon name="heart" size={18} />
          </span>
          <span>
            <strong>Undangan Alya &amp; Reza</strong>
            <small>rayain.id/undangan/alya-reza</small>
          </span>
        </div>
      </div>
      <div className="phone-input">
        <span>Pesan</span>
        <ShareIcon name="send" size={15} />
      </div>
    </div>
  );
}

type GuestContact = {
  id: string;
  name: string;
  phone: string;
  group: string;
  status: "Terkirim" | "Belum dikirim";
};

type BlastState = "idle" | "sending" | "completed";
type ScheduleState = "idle" | "scheduled";

const guestContacts: GuestContact[] = [
  { id: "rani", name: "Rani Kusuma", phone: "+62 812-4455-9012", group: "Keluarga inti", status: "Belum dikirim" },
  { id: "dimas", name: "Dimas Pratama", phone: "+62 813-7788-1023", group: "Teman dekat", status: "Belum dikirim" },
  { id: "sinta", name: "Sinta Maharani", phone: "+62 852-1102-8741", group: "Teman dekat", status: "Terkirim" },
  { id: "bagus", name: "Bagus Santoso", phone: "+62 821-6654-3308", group: "Rekan kerja", status: "Belum dikirim" },
  { id: "naya", name: "Naya & Fajar", phone: "+62 878-9012-3344", group: "Tamu spesial", status: "Belum dikirim" },
  { id: "ibu-rina", name: "Ibu Rina", phone: "+62 811-2040-7788", group: "Keluarga inti", status: "Terkirim" },
];

function GuestManager({ open, onClose, onNotify }: { open: boolean; onClose: () => void; onNotify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  if (!open) return null;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleContacts = guestContacts.filter((contact) => `${contact.name} ${contact.phone} ${contact.group}`.toLowerCase().includes(normalizedQuery));

  return <div className="guest-manager-backdrop" role="presentation" onClick={onClose}><section className="guest-manager" role="dialog" aria-modal="true" aria-labelledby="guest-manager-title" onClick={(event) => event.stopPropagation()}><header className="guest-manager-header"><div><span className="sample-label">DAFTAR TAMU</span><h2 id="guest-manager-title">Kelola kontak tamu.</h2><p>Pastikan setiap orang yang penting untukmu sudah ada di daftar.</p></div><button className="guest-manager-close" type="button" aria-label="Tutup daftar tamu" onClick={onClose}>×</button></header><div className="guest-manager-toolbar"><label className="guest-search"><ShareIcon name="users" size={15} /><input type="search" aria-label="Cari kontak tamu" placeholder="Cari nama atau nomor..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><button className="add-guest-button" type="button" onClick={() => onNotify("Form tambah kontak siap dikembangkan.")}><ShareIcon name="plus" size={14} /> Tambah kontak</button></div><div className="guest-manager-meta"><span><strong>{guestContacts.length}</strong> kontak contoh</span><span><i className="guest-status-dot guest-status-sent" /> {guestContacts.filter((contact) => contact.status === "Terkirim").length} sudah dikirim</span></div><div className="guest-contact-list">{visibleContacts.length ? visibleContacts.map((contact) => <div className="guest-contact-row" key={contact.id}><span className="guest-contact-avatar">{contact.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span className="guest-contact-copy"><strong>{contact.name}</strong><small>{contact.phone}</small></span><span className="guest-contact-group">{contact.group}</span><span className={`guest-contact-status ${contact.status === "Terkirim" ? "guest-contact-status-sent" : ""}`}><i className="guest-status-dot" />{contact.status}</span><button className="guest-contact-action" type="button" aria-label={`Edit ${contact.name}`} onClick={() => onNotify(`Edit kontak ${contact.name} siap dikembangkan.`)}><ShareIcon name="edit" size={14} /></button></div>) : <div className="guest-manager-empty"><span className="guest-manager-empty-icon"><ShareIcon name="users" size={18} /></span><strong>Kontak tidak ditemukan</strong><p>Coba kata kunci atau nomor yang berbeda.</p></div>}</div><footer className="guest-manager-footer"><span><ShareIcon name="sparkle" size={14} /> Data contoh untuk preview</span><button type="button" onClick={onClose}>Selesai</button></footer></section></div>;
}

type SendHistoryItem = { id: string; label: string; date: string; recipients: number; sent: number; failed: number; status: "Selesai" | "Terjadwal" | "Dibatalkan" };
const sendHistory: SendHistoryItem[] = [
  { id: "blast-1", label: "Pengumuman awal", date: "02 September 2026 · 14:20", recipients: 42, sent: 42, failed: 0, status: "Selesai" },
  { id: "blast-2", label: "Reminder keluarga", date: "28 Agustus 2026 · 09:15", recipients: 18, sent: 17, failed: 1, status: "Selesai" },
  { id: "blast-3", label: "Draft pesan", date: "25 Agustus 2026 · 18:40", recipients: 24, sent: 0, failed: 0, status: "Dibatalkan" },
];

function SendHistory({ onNotify }: { onNotify: (message: string) => void }) {
  return <section className="send-history"><div className="send-history-heading"><div><span className="sample-label">AKTIVITAS BLAST</span><h2>Riwayat pengiriman</h2><p>Lihat status setiap pesan yang pernah kamu kirim.</p></div><button type="button" onClick={() => onNotify("Semua riwayat pengiriman sudah ditampilkan.")}>Lihat semua <ShareIcon name="arrow-right" size={13} /></button></div><div className="send-history-list">{sendHistory.map((item) => <div className="send-history-row" key={item.id}><span className="send-history-icon"><ShareIcon name="whatsapp" size={16} /></span><span className="send-history-copy"><strong>{item.label}</strong><small>{item.date}</small></span><span className="send-history-recipients"><strong>{item.sent}/{item.recipients}</strong><small>pesan terkirim{item.failed ? ` · ${item.failed} gagal` : ""}</small></span><span className={`send-history-status send-history-status-${item.status.toLowerCase()}`}><i />{item.status}</span><button className="send-history-action" type="button" aria-label={`Lihat detail ${item.label}`} onClick={() => onNotify(`Detail ${item.label} siap dikembangkan.`)}><ShareIcon name="external" size={14} /></button></div>)}</div></section>;
}

function ScheduleDialog({ open, date, time, onDateChange, onTimeChange, onClose, onSubmit }: { open: boolean; date: string; time: string; onDateChange: (value: string) => void; onTimeChange: (value: string) => void; onClose: () => void; onSubmit: () => void }) {
  if (!open) return null;
  return <div className="schedule-backdrop" role="presentation" onClick={onClose}><section className="schedule-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-dialog-title" onClick={(event) => event.stopPropagation()}><header className="schedule-dialog-header"><div><span className="sample-label">JADWALKAN BLAST</span><h2 id="schedule-dialog-title">Pilih waktu terbaik.</h2><p>Pesan akan dikirim otomatis ke semua tamu terpilih.</p></div><button className="schedule-close" type="button" aria-label="Tutup jadwal kirim" onClick={onClose}>×</button></header><div className="schedule-form"><label htmlFor="schedule-date"><span><ShareIcon name="calendar" size={14} /> Tanggal kirim</span><input id="schedule-date" type="date" value={date} onChange={(event) => onDateChange(event.target.value)} /></label><label htmlFor="schedule-time"><span><ShareIcon name="clock" size={14} /> Waktu kirim</span><input id="schedule-time" type="time" value={time} onChange={(event) => onTimeChange(event.target.value)} /></label></div><div className="schedule-dialog-note"><ShareIcon name="sparkle" size={14} /><span>Jadwal menggunakan zona waktu perangkatmu. Kamu masih bisa membatalkannya sebelum waktu kirim.</span></div><footer className="schedule-dialog-footer"><button type="button" onClick={onClose}>Batal</button><button className="schedule-submit" type="button" disabled={!date || !time} onClick={onSubmit}><ShareIcon name="clock" size={14} /> Simpan jadwal</button></footer></section></div>;
}

export default function SharePage() {
  const [message, setMessage] = useState(initialMessage);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    recipientGroups.map((group) => group.id),
  );
  const [guestManagerOpen, setGuestManagerOpen] = useState(false);
  const [blastState, setBlastState] = useState<BlastState>("idle");
  const [scheduleState, setScheduleState] = useState<ScheduleState>("idle");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("2026-09-12");
  const [scheduleTime, setScheduleTime] = useState("19:00");
  const [toast, setToast] = useState("");
  const selectedCount = useMemo(
    () =>
      recipientGroups
        .filter((group) => selectedGroups.includes(group.id))
        .reduce((total, group) => total + group.count, 0),
    [selectedGroups],
  );
  const messageLength = message.length;

  const toggleGroup = (groupId: string) =>
    setSelectedGroups((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );
  const showToast = (text: string) => setToast(text);
  const sendNow = () => {
    if (!selectedCount || !message.trim() || blastState !== "idle" || scheduleState !== "idle") return;
    setBlastState("sending");
    window.setTimeout(() => {
      setBlastState("completed");
      showToast(`${selectedCount} pesan berhasil dikirim via WhatsApp.`);
    }, 900);
  };
  const scheduleNow = () => {
    if (!selectedCount || !message.trim() || blastState !== "idle" || !scheduleDate || !scheduleTime) return;
    setScheduleState("scheduled");
    setScheduleOpen(false);
    showToast(`Blast dijadwalkan pada ${scheduleDate.split("-").reverse().join("/")} pukul ${scheduleTime}.`);
  };
  const cancelSchedule = () => {
    setScheduleState("idle");
    showToast("Jadwal blast dibatalkan.");
  };
  const insertToken = (token: "{{nama}}" | "{{tautan}}") =>
    setMessage((current) =>
      current.includes(token) ? current : `${current.trimEnd()}\n\n${token}`,
    );

  return (
    <div className="share-shell">
      <aside className="share-sidebar">
        <div className="brand share-brand">
          <span className="brand-mark">
            <ShareIcon name="heart" size={19} />
          </span>
          <span>
            <strong>rayain</strong>
            <small>UNDANGAN DIGITAL</small>
          </span>
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          <Link className="nav-item" href="/">
            <ShareIcon name="home" size={18} />
            <span>Dasbor</span>
          </Link>
          <Link className="nav-item" href="/#invitations">
            <ShareIcon name="layout" size={18} />
            <span>Undangan saya</span>
          </Link>
          <Link className="nav-item" href="/studio">
            <ShareIcon name="layout" size={18} />
            <span>Template</span>
          </Link>
          <Link className="nav-item" href="/guests">
            <ShareIcon name="users" size={18} />
            <span>Tamu &amp; RSVP</span>
          </Link>
        </nav>
        <div className="sidebar-label sidebar-label-spaced">Kelola</div>
        <nav className="sidebar-nav">
          <Link className="nav-item nav-item-active" href="/share">
            <ShareIcon name="whatsapp" size={18} />
            <span>Sebar undangan</span>
          </Link>
          <Link className="nav-item" href="/profile">
            <ShareIcon name="more" size={18} />
            <span>Pengaturan</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">
              <ShareIcon name="sparkle" size={16} />
            </span>
            <p>
              <strong>Bagikan hangatnya.</strong>
              <br />
              Satu pesan untuk banyak cerita.
            </p>
          </div>
          <Link className="profile-card" href="/profile">
            <span className="avatar avatar-small">SA</span>
            <span className="profile-copy">
              <strong>Sarah Anindita</strong>
              <small>sarah@rayain.id</small>
            </span>
            <ShareIcon name="more" size={17} />
          </Link>
        </div>
      </aside>
      <main className="share-main">
        <header className="share-topbar">
          <Link className="share-back" href="/">
            <ShareIcon name="arrow-left" size={16} /> Kembali ke dasbor
          </Link>
          <div className="share-brand-center">
            <span className="brand-mark">
              <ShareIcon name="heart" size={15} />
            </span>
            <strong>rayain</strong>
            <span>Bagikan</span>
          </div>
          <div className="share-topbar-actions">
            <span className="share-save-state">
              <span /> Semua perubahan tersimpan
            </span>
            <button
              className="icon-button"
              type="button"
              aria-label="Menu halaman"
              onClick={() => showToast("Menu halaman siap dikembangkan.")}
            >
              <ShareIcon name="more" size={18} />
            </button>
            <span className="avatar">SA</span>
          </div>
        </header>
        <div className="share-content">
          <div className="share-heading">
            <div>
              <span className="section-kicker">SEBAR VIA WHATSAPP</span>
              <h1>Bagikan momenmu.</h1>
              <p>
                Kirim undangan yang terasa personal kepada orang-orang yang
                ingin kamu ajak merayakan.
              </p>
            </div>
            <div className="share-heading-art" aria-hidden="true">
              <span className="share-art-ring" />
              <span className="share-art-flower">✽</span>
              <span className="share-art-card">
                <ShareIcon name="whatsapp" size={20} />
              </span>
            </div>
          </div>
          <section className="share-invitation-bar">
            <div className="share-invitation-cover">
              <span>the beginning of</span>
              <strong>
                A <i>&amp;</i> R
              </strong>
              <small>12 . 10 . 2026</small>
            </div>
            <div className="share-invitation-copy">
              <span className="sample-label">UNDANGAN TERPILIH</span>
              <h2>{invitation.title}</h2>
              <p>
                <ShareIcon name="calendar" size={13} /> {invitation.date}{" "}
                <span>·</span> <ShareIcon name="link" size={13} />{" "}
                rayain.id/undangan/{invitation.slug}
              </p>
            </div>
            <button
              className="share-change-button"
              type="button"
              onClick={() => showToast("Pemilih undangan siap dikembangkan.")}
            >
              <ShareIcon name="chevron-down" size={14} /> Ganti undangan
            </button>
          </section>
          <section className="share-stats">
            <div>
              <span className="share-stat-icon">
                <ShareIcon name="users" size={17} />
              </span>
              <span>
                <small>Tamu terpilih</small>
                <strong>{selectedCount}</strong>
              </span>
            </div>
            <div>
              <span className="share-stat-icon share-stat-icon-green">
                <ShareIcon name="send" size={17} />
              </span>
              <span>
                <small>Pesan terkirim</small>
                <strong>{blastState === "completed" ? selectedCount : 0}</strong>
              </span>
            </div>
            <div>
              <span className="share-stat-icon share-stat-icon-yellow">
                <ShareIcon name="clock" size={17} />
              </span>
              <span>
                <small>Status blast</small>
                <strong>{blastState === "sending" ? "Sedang mengirim" : blastState === "completed" ? "Selesai" : scheduleState === "scheduled" ? "Terjadwal" : "Belum dimulai"}</strong>
              </span>
            </div>
          </section>
          <div className="share-workspace">
            <section className="share-builder">
              <div className="share-card-heading">
                <div>
                  <span className="sample-label">LANGKAH 01</span>
                  <h2>Pilih siapa yang diundang</h2>
                  <p>Kamu bisa mengubah daftar penerima sebelum mengirim.</p>
                </div>
                <span className="share-step-number">01</span>
              </div>
              <div className="recipient-list">
                {recipientGroups.map((group) => {
                  const isSelected = selectedGroups.includes(group.id);
                  return (
                    <button
                      className={`recipient-row ${isSelected ? "recipient-row-selected" : ""}`}
                      type="button"
                      key={group.id}
                      onClick={() => toggleGroup(group.id)}
                      aria-pressed={isSelected}
                    >
                      <span
                        className={`recipient-check ${isSelected ? "recipient-check-active" : ""}`}
                      >
                        {isSelected ? (
                          <ShareIcon name="check" size={12} />
                        ) : null}
                      </span>
                      <span className="recipient-copy">
                        <strong>{group.label}</strong>
                        <small>{group.detail}</small>
                      </span>
                      <span className="recipient-count">
                        {group.count} tamu
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                className="manage-guest-button"
                type="button"
                onClick={() => setGuestManagerOpen(true)}
              >
                <ShareIcon name="users" size={14} /> Atur daftar tamu{" "}
                <ShareIcon name="arrow-right" size={13} />
              </button>
              <div className="share-divider" />
              <div className="share-card-heading share-message-heading">
                <div>
                  <span className="sample-label">LANGKAH 02</span>
                  <h2>Tambahkan pesan hangat</h2>
                  <p>
                    Gunakan <code>{"{{nama}}"}</code> untuk menyapa setiap tamu
                    secara personal.
                  </p>
                </div>
                <span className="share-step-number">02</span>
              </div>
              <label className="message-label" htmlFor="whatsapp-message">
                <span>Pesan WhatsApp</span>
                <span>{messageLength}/500</span>
              </label>
              <textarea
                id="whatsapp-message"
                value={message}
                maxLength={500}
                onChange={(event) => setMessage(event.target.value)}
              />
              <div className="message-tools">
                <button
                  type="button"
                  onClick={() => insertToken("{{tautan}}")}
                >
                  <ShareIcon name="link" size={13} /> Sisipkan tautan
                </button>
                <button
                  type="button"
                  onClick={() => insertToken("{{nama}}")}
                >
                  <ShareIcon name="sparkle" size={13} /> Sisipkan nama tamu
                </button>
              </div>
              <div className="share-info-note">
                <ShareIcon name="message" size={14} />
                <span>
                  Setiap penerima akan mendapatkan pesan pribadi dengan tautan
                  undangan yang sama.
                </span>
              </div>
            </section>
            <aside className="share-preview">
              <div className="share-preview-heading">
                <div>
                  <span className="sample-label">LIVE PREVIEW</span>
                  <h2>Pesan yang akan diterima</h2>
                </div>
                <span className="whatsapp-badge">
                  <ShareIcon name="whatsapp" size={13} /> WhatsApp
                </span>
              </div>
              <PhonePreview message={message} />
              <div className="share-preview-note">
                <ShareIcon name="sparkle" size={14} />
                <p>
                  Preview menggunakan nama contoh <strong>Rani</strong>. Tautan
                  akan otomatis aktif saat dikirim.
                </p>
              </div>
              <button
                className="share-next-button"
                type="button"
                disabled={!selectedCount || !message.trim() || blastState !== "idle" || scheduleState !== "idle"}
                aria-busy={blastState === "sending"}
                onClick={sendNow}
              >
                {blastState === "sending" ? "Mengirim..." : blastState === "completed" ? "Sudah terkirim" : "Kirim sekarang"}{" "}
                <ShareIcon name={blastState === "completed" ? "check" : "arrow-right"} size={15} />
              </button>
              {scheduleState === "scheduled" ? (
                <div className="scheduled-blast-card">
                  <span className="scheduled-blast-icon"><ShareIcon name="clock" size={15} /></span>
                  <span><small>BLAST TERJADWAL</small><strong>{scheduleDate.split("-").reverse().join("/")} · {scheduleTime}</strong></span>
                  <button type="button" onClick={cancelSchedule}>Batalkan</button>
                </div>
              ) : (
                <button className="schedule-button" type="button" disabled={!selectedCount || !message.trim() || blastState !== "idle"} onClick={() => setScheduleOpen(true)}><ShareIcon name="clock" size={14} /> Jadwalkan kirim</button>
              )}
              <button
                className="share-copy-link"
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(
                    `rayain.id/undangan/${invitation.slug}`,
                  );
                  showToast("Tautan undangan disalin.");
                }}
              >
                <ShareIcon name="copy" size={13} /> Salin tautan undangan
              </button>
            </aside>
          </div>
          <SendHistory onNotify={showToast} />
        </div>
      </main>
      <GuestManager
        open={guestManagerOpen}
        onClose={() => setGuestManagerOpen(false)}
        onNotify={showToast}
      />
      <ScheduleDialog
        open={scheduleOpen}
        date={scheduleDate}
        time={scheduleTime}
        onDateChange={setScheduleDate}
        onTimeChange={setScheduleTime}
        onClose={() => setScheduleOpen(false)}
        onSubmit={scheduleNow}
      />
      {toast ? (
        <div className="toast" role="status">
          <span className="toast-check">✓</span>
          {toast}
        </div>
      ) : null}
    </div>
  );
}
