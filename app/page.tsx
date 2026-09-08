"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type InvitationStatus = "published" | "draft";
type InvitationVariant = "floral" | "terracotta" | "sage" | "lilac";
type Filter = "all" | InvitationStatus;
type IconName =
  | "archive"
  | "bell"
  | "calendar"
  | "check"
  | "chevron-down"
  | "chevron-right"
  | "clock"
  | "copy"
  | "edit"
  | "external"
  | "filter"
  | "grid"
  | "heart"
  | "home"
  | "image"
  | "layout"
  | "logout"
  | "menu"
  | "more"
  | "music"
  | "plus"
  | "search"
  | "settings"
  | "sparkle"
  | "trash"
  | "users";

type Invitation = {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  status: InvitationStatus;
  guests: number;
  slug: string;
  template: string;
  variant: InvitationVariant;
  updated: string;
};

type RSVPNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: "green" | "yellow" | "pink";
  read: boolean;
};

const initialInvitations: Invitation[] = [
  {
    id: "alya-reza",
    title: "Alya & Reza",
    type: "Pernikahan",
    date: "12 Oktober 2026",
    location: "The Alana Hotel, Yogyakarta",
    status: "published",
    guests: 124,
    slug: "alya-reza",
    template: "The Garden",
    variant: "floral",
    updated: "Diperbarui 2 jam lalu",
  },
  {
    id: "dinda-birthday",
    title: "Dinda’s 25th Birthday",
    type: "Ulang tahun",
    date: "08 November 2026",
    location: "Kopi Nako, Jakarta Selatan",
    status: "published",
    guests: 48,
    slug: "dindas-25th",
    template: "Sunday Club",
    variant: "terracotta",
    updated: "Diperbarui kemarin",
  },
  {
    id: "anniversary",
    title: "Lima Tahun Bersama",
    type: "Anniversary",
    date: "24 Desember 2026",
    location: "Private villa, Bandung",
    status: "draft",
    guests: 0,
    slug: "lima-tahun-bersama",
    template: "Ever After",
    variant: "sage",
    updated: "Diperbarui 3 hari lalu",
  },
  {
    id: "nisa-fikri",
    title: "Nisa & Fikri",
    type: "Pertunangan",
    date: "17 Januari 2027",
    location: "Pendopo Agung, Surabaya",
    status: "published",
    guests: 76,
    slug: "nisa-fikri",
    template: "Soft Promise",
    variant: "lilac",
    updated: "Diperbarui 1 minggu lalu",
  },
];

const navItems: { label: string; icon: IconName; href: string }[] = [
  { label: "Dasbor", icon: "home", href: "/" },
  { label: "Undangan saya", icon: "archive", href: "/#invitations" },
  { label: "Template", icon: "layout", href: "/studio" },
  { label: "Tamu & RSVP", icon: "users", href: "/guests" },
];

const rsvpSummary = {
  invitation: "Alya & Reza",
  date: "12 Oktober 2026",
  totalGuests: 8,
  responses: 6,
  attendance: 7,
  statuses: [
    { label: "Hadir", count: 4, tone: "green", percent: 50 },
    { label: "Tidak hadir", count: 2, tone: "gray", percent: 25 },
    { label: "Masih ragu", count: 1, tone: "yellow", percent: 12.5 },
    { label: "Belum menjawab", count: 1, tone: "pink", percent: 12.5 },
  ],
};

const initialNotifications: RSVPNotification[] = [
  {
    id: "rani-confirmed",
    title: "Rani Kusuma mengonfirmasi",
    body: "Hadir · 2 orang",
    time: "12 menit lalu",
    tone: "green",
    read: false,
  },
  {
    id: "dimas-confirmed",
    title: "Dimas Pratama mengonfirmasi",
    body: "Hadir · 1 orang",
    time: "1 jam lalu",
    tone: "green",
    read: false,
  },
  {
    id: "sinta-unsure",
    title: "Sinta Maharani masih ragu",
    body: "Belum menentukan kehadiran",
    time: "Kemarin",
    tone: "yellow",
    read: true,
  },
  {
    id: "waiting-guest",
    title: "1 tamu belum menjawab",
    body: "Ibu Rina · perlu ditindaklanjuti",
    time: "2 hari lalu",
    tone: "pink",
    read: true,
  },
];

function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth,
  };

  const paths: Record<IconName, React.ReactNode> = {
    archive: <><path {...common} d="M4 6.5h16" /><path {...common} d="M5.5 6.5h13l-.8 12.2a1.4 1.4 0 0 1-1.4 1.3H7.7a1.4 1.4 0 0 1-1.4-1.3L5.5 6.5Z" /><path {...common} d="M8.2 6.5V4.8A1.8 1.8 0 0 1 10 3h4a1.8 1.8 0 0 1 1.8 1.8v1.7M9 11.2h6" /></>,
    bell: <><path {...common} d="M18 9.8c0-3.4-1.5-5.5-4.1-6.2a2 2 0 0 0-3.8 0C7.5 4.3 6 6.4 6 9.8c0 4-1.7 5-2.2 5.7-.2.3 0 .8.5.8h15.4c.5 0 .7-.5.5-.8-.5-.7-2.2-1.7-2.2-5.7Z" /><path {...common} d="M10 19a2.2 2.2 0 0 0 4 0" /></>,
    calendar: <><rect {...common} x="3.5" y="5" width="17" height="16" rx="2" /><path {...common} d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17" /></>,
    check: <path {...common} d="m5 12 4.3 4.3L19 6.7" />,
    "chevron-down": <path {...common} d="m6 9 6 6 6-6" />,
    "chevron-right": <path {...common} d="m9 6 6 6-6 6" />,
    clock: <><circle {...common} cx="12" cy="12" r="8.5" /><path {...common} d="M12 7v5l3.2 2" /></>,
    copy: <><rect {...common} x="8" y="8" width="11" height="11" rx="2" /><path {...common} d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    edit: <><path {...common} d="M4 20h4l10.8-10.8a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path {...common} d="m14.5 7.5 3 3" /></>,
    external: <><path {...common} d="M13 5h6v6M19 5l-8 8" /><path {...common} d="M18 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3" /></>,
    filter: <><path {...common} d="M4 6h16M7 12h10M10 18h4" /></>,
    grid: <><rect {...common} x="4" y="4" width="6" height="6" rx="1" /><rect {...common} x="14" y="4" width="6" height="6" rx="1" /><rect {...common} x="4" y="14" width="6" height="6" rx="1" /><rect {...common} x="14" y="14" width="6" height="6" rx="1" /></>,
    heart: <path {...common} d="M20.8 8.9c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.9Z" />,
    home: <><path {...common} d="m3.5 10.8 8.5-7 8.5 7" /><path {...common} d="M5.5 9.5v9.8h13V9.5M9.5 19.3v-5.8h3v5.8" /></>,
    image: <><rect {...common} x="3" y="4" width="18" height="16" rx="2" /><circle {...common} cx="8.3" cy="9" r="1.4" /><path {...common} d="m4 17 4.8-4.6a1.5 1.5 0 0 1 2.1 0l2.2 2.1 1.4-1.3a1.5 1.5 0 0 1 2.1 0L21 16.5" /></>,
    layout: <><rect {...common} x="3.5" y="4" width="17" height="16" rx="2" /><path {...common} d="M3.5 9.5h17M9 9.5V20" /></>,
    logout: <><path {...common} d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" /><path {...common} d="m16 8 4 4-4 4M20 12H9" /></>,
    menu: <><path {...common} d="M4 7h16M4 12h16M4 17h16" /></>,
    more: <><circle cx="5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="12" r="1.2" fill="currentColor" /></>,
    music: <><path {...common} d="M9 18V6l10-2v12" /><circle {...common} cx="6.5" cy="18" r="2.5" /><circle {...common} cx="16.5" cy="16" r="2.5" /></>,
    plus: <><path {...common} d="M12 5v14M5 12h14" /></>,
    search: <><circle {...common} cx="10.8" cy="10.8" r="6.8" /><path {...common} d="m16 16 4.5 4.5" /></>,
    settings: <><circle {...common} cx="12" cy="12" r="3" /><path {...common} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.6 1.6-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2H11v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.6-1.6.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H5V11h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L8 6.4l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.2v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.6 1.6-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.2h-.2a1.7 1.7 0 0 0-1.6 1Z" /></>,
    sparkle: <><path {...common} d="m12 3 1.1 4.2a4.9 4.9 0 0 0 3.5 3.5L21 12l-4.4 1.3a4.9 4.9 0 0 0-3.5 3.5L12 21l-1.1-4.2a4.9 4.9 0 0 0-3.5-3.5L3 12l4.4-1.3a4.9 4.9 0 0 0 3.5-3.5L12 3Z" /></>,
    trash: <><path {...common} d="M5 7h14M10 3h4l1 4H9l1-4ZM7 7l.8 13h8.4L17 7M10 11v5M14 11v5" /></>,
    users: <><path {...common} d="M16 20v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.6A3.6 3.6 0 0 0 4 18.6V20" /><circle {...common} cx="10" cy="8" r="3.2" /><path {...common} d="M16 8.2a3 3 0 0 1 0 5.7M18.2 15a3.6 3.6 0 0 1 2.3 3.4V20" /></>,
  };

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">{paths[name]}</svg>;
}

function TemplateVisual({ invitation }: { invitation: Invitation }) {
  return (
    <div className={`template-visual cover-${invitation.variant}`}>
      <span className="cover-grain" />
      <span className="cover-orbit cover-orbit-one" />
      <span className="cover-orbit cover-orbit-two" />
      <div className="cover-copy">
        <span className="cover-eyebrow">{invitation.type}</span>
        <strong>{invitation.title}</strong>
        <span className="cover-date">{invitation.date}</span>
      </div>
      <span className="cover-template">{invitation.template}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: InvitationStatus }) {
  return <span className={`status-badge status-${status}`}><span className="status-dot" />{status === "published" ? "Terbit" : "Draf"}</span>;
}

function InvitationCard({
  invitation,
  menuOpen,
  onToggleMenu,
  onAction,
}: {
  invitation: Invitation;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onAction: (action: "open" | "edit" | "copy" | "delete") => void;
}) {
  return (
    <article className="invitation-card">
      <div className="card-cover-wrap">
        <TemplateVisual invitation={invitation} />
        <div className="cover-actions">
          <StatusBadge status={invitation.status} />
          <div className="menu-wrap">
            <button className="icon-button cover-menu-button" type="button" aria-label={`Buka menu ${invitation.title}`} aria-expanded={menuOpen} onClick={onToggleMenu}>
              <Icon name="more" size={19} />
            </button>
            {menuOpen ? (
              <div className="action-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => onAction("open")}><Icon name="external" size={16} /> Buka undangan</button>
                <button type="button" role="menuitem" onClick={() => onAction("edit")}><Icon name="edit" size={16} /> Edit undangan</button>
                <button type="button" role="menuitem" onClick={() => onAction("copy")}><Icon name="copy" size={16} /> Salin tautan</button>
                <button className="danger-action" type="button" role="menuitem" onClick={() => onAction("delete")}><Icon name="trash" size={16} /> Hapus</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <div>
            <p className="eyebrow">{invitation.type}</p>
            <h3>{invitation.title}</h3>
          </div>
          <button className="round-arrow" type="button" aria-label={`Lihat ${invitation.title}`} onClick={() => onAction("open")}><Icon name="chevron-right" size={16} /></button>
        </div>
        <div className="card-meta"><Icon name="calendar" size={15} /><span>{invitation.date}</span></div>
        <div className="card-meta"><Icon name="users" size={15} /><span>{invitation.guests ? `${invitation.guests} tamu terdaftar` : "Belum ada tamu"}</span></div>
        <div className="card-footer"><span className="last-updated"><Icon name="clock" size={14} />{invitation.updated}</span><button className="edit-link" type="button" onClick={() => onAction("edit")}>Edit <Icon name="chevron-right" size={13} /></button></div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState(initialInvitations);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [activeNav, setActiveNav] = useState("Dasbor");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const showToast = (message: string) => setToast(message);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const counts = useMemo(() => ({
    all: invitations.length,
    published: invitations.filter((invitation) => invitation.status === "published").length,
    draft: invitations.filter((invitation) => invitation.status === "draft").length,
  }), [invitations]);

  const filteredInvitations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return invitations.filter((invitation) => {
      const matchesFilter = filter === "all" || invitation.status === filter;
      const matchesQuery = !normalizedQuery || `${invitation.title} ${invitation.type} ${invitation.location}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, invitations, query]);

  const handleAction = (invitation: Invitation, action: "open" | "edit" | "copy" | "delete") => {
    setOpenMenu(null);
    if (action === "delete") {
      if (window.confirm(`Hapus undangan “${invitation.title}”?`)) {
        setInvitations((current) => current.filter((item) => item.id !== invitation.id));
        showToast("Undangan berhasil dihapus dari daftar mock.");
      }
      return;
    }
    if (action === "copy") {
      void navigator.clipboard?.writeText(`rayain.id/${invitation.slug}`);
      showToast("Tautan undangan disalin.");
      return;
    }
    showToast(action === "open" ? `Membuka pratinjau ${invitation.title}.` : `Membuka editor ${invitation.title}.`);
  };

  const goToStudio = () => router.push("/studio");
  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;
  const markNotificationRead = (id: string) => {
    setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true } : notification));
  };
  const markAllNotificationsRead = () => setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));

  return (
    <div className="app-shell" onClick={() => { if (openMenu) setOpenMenu(null); if (notificationsOpen) setNotificationsOpen(false); }}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Icon name="heart" size={19} strokeWidth={1.7} /></span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></div>
        <div className="sidebar-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {navItems.map((item) => <Link className={`nav-item ${activeNav === item.label ? "nav-item-active" : ""}`} href={item.href} key={item.label} onClick={(event) => { event.stopPropagation(); setActiveNav(item.label); }}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.label === "Undangan saya" && <span className="nav-count">{counts.all}</span>}</Link>)}
        </nav>
        <div className="sidebar-label sidebar-label-spaced">Kelola</div>
        <nav className="sidebar-nav" aria-label="Pengaturan workspace">
          <Link className="nav-item" href="/studio?panel=music"><Icon name="music" size={18} /><span>Musik latar</span></Link>
          <Link className="nav-item" href="/profile"><Icon name="settings" size={18} /><span>Pengaturan</span></Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span className="tip-icon"><Icon name="sparkle" size={16} /></span><p><strong>Rayakan momennya.</strong><br />Bagikan cerita yang paling berarti.</p></div>
          <button className="profile-card" type="button" onClick={() => router.push("/profile")}><span className="avatar avatar-small">SA</span><span className="profile-copy"><strong>Sarah Anindita</strong><small>sarah@rayain.id</small></span><Icon name="more" size={17} /></button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="mobile-menu icon-button" type="button" aria-label="Buka menu"><Icon name="menu" size={21} /></button>
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron-right" size={14} /><strong>{activeNav}</strong></div>
          <div className="topbar-actions"><button className="topbar-search" type="button" onClick={() => document.getElementById("search-invitations")?.focus()}><Icon name="search" size={17} /><span>Cari undangan</span><kbd>⌘ K</kbd></button><div className="notification-wrap"><button className="icon-button notification-button" type="button" aria-label="Notifikasi" aria-expanded={notificationsOpen} onClick={(event) => { event.stopPropagation(); setNotificationsOpen((open) => !open); }}><Icon name="bell" size={19} />{unreadNotificationCount ? <span className="notification-dot" /> : null}</button>{notificationsOpen ? <div className="notification-panel" onClick={(event) => event.stopPropagation()}><div className="notification-panel-head"><div><span className="section-kicker">UPDATES</span><h2>Notifikasi</h2></div><span className="notification-count">{unreadNotificationCount ? `${unreadNotificationCount} baru` : "Sudah dibaca"}</span></div><div className="notification-list">{notifications.map((notification) => <button className={`notification-item ${notification.read ? "notification-item-read" : ""}`} type="button" key={notification.id} onClick={() => markNotificationRead(notification.id)}><span className={`notification-icon notification-icon-${notification.tone}`}><Icon name={notification.tone === "green" ? "check" : notification.tone === "yellow" ? "clock" : "users"} size={14} /></span><span className="notification-copy"><strong>{notification.title}</strong><small>{notification.body}</small><em>{notification.time}</em></span>{!notification.read ? <i className="notification-unread" /> : null}</button>)}</div><div className="notification-panel-foot"><button type="button" onClick={markAllNotificationsRead}>Tandai semua sudah dibaca</button><button type="button" onClick={() => router.push("/guests")}>Lihat semua RSVP <Icon name="chevron-right" size={13} /></button></div></div> : null}</div><span className="avatar">SA</span></div>
        </header>

        <div className="content-wrap">
          <section className="welcome-banner">
            <div className="banner-copy"><span className="banner-kicker"><Icon name="sparkle" size={14} /> RAYAIN YOUR MOMENT</span><h1>Hai, Sarah <span>✦</span></h1><p>Setiap cerita layak dirayakan dengan cara yang istimewa.</p><button className="button button-light" type="button" onClick={goToStudio}><Icon name="plus" size={17} /> Buat undangan baru</button></div>
            <div className="banner-art" aria-hidden="true"><span className="art-ring ring-one" /><span className="art-ring ring-two" /><span className="art-flower flower-one">✽</span><span className="art-flower flower-two">✦</span><div className="art-card"><Icon name="heart" size={19} /><span>your story<br /><strong>starts here</strong></span></div></div>
            <div className="banner-stat"><span className="banner-stat-label">Total undangan</span><strong>{counts.all.toString().padStart(2, "0")}</strong><span className="banner-stat-note"><span className="pulse-dot" /> ruang untuk cerita</span></div>
          </section>

          <section className="section-heading"><div><span className="section-kicker">YOUR COLLECTION</span><h2>Undangan saya</h2><p>Kelola semua momen spesialmu di satu tempat.</p></div><button className="text-link" type="button" onClick={() => { setFilter("all"); setQuery(""); }}>Lihat semua <Icon name="chevron-right" size={15} /></button></section>

          <section className="stats-grid" aria-label="Ringkasan undangan"><div className="stat-card stat-card-main"><span className="stat-icon"><Icon name="grid" size={19} /></span><span className="stat-label">Semua undangan</span><strong>{counts.all}</strong><span className="stat-note">koleksi momenmu</span></div><div className="stat-card"><span className="stat-icon stat-icon-green"><Icon name="external" size={19} /></span><span className="stat-label">Sudah terbit</span><strong>{counts.published}</strong><span className="stat-note">siap dibagikan</span></div><div className="stat-card"><span className="stat-icon stat-icon-yellow"><Icon name="edit" size={19} /></span><span className="stat-label">Masih draf</span><strong>{counts.draft}</strong><span className="stat-note">lanjutkan kapan saja</span></div></section>

          <section className="rsvp-overview" aria-label="Ringkasan rekap kehadiran">
            <div className="rsvp-overview-heading">
              <div>
                <span className="section-kicker">RSVP SNAPSHOT</span>
                <h2>Rekap kehadiran</h2>
                <p>Lihat kabar terbaru dari tamu undangan aktifmu.</p>
              </div>
              <button className="text-link" type="button" onClick={() => router.push("/guests")}>
                Kelola RSVP <Icon name="chevron-right" size={15} />
              </button>
            </div>
            <div className="rsvp-overview-card">
              <div className="rsvp-overview-card-head">
                <div className="rsvp-overview-event">
                  <span className="rsvp-overview-icon"><Icon name="heart" size={17} /></span>
                  <span>
                    <strong>{rsvpSummary.invitation}</strong>
                    <small><Icon name="calendar" size={12} /> {rsvpSummary.date}</small>
                  </span>
                </div>
                <span className="rsvp-overview-live"><span /> Undangan aktif</span>
              </div>
              <div className="rsvp-overview-grid">
                <div className="rsvp-overview-total">
                  <span className="rsvp-overview-label">Total tamu</span>
                  <strong>{rsvpSummary.totalGuests}</strong>
                  <span className="rsvp-overview-note">{rsvpSummary.responses} sudah merespons</span>
                </div>
                <div className="rsvp-overview-chart" aria-label="Proporsi status RSVP">
                  <div className="rsvp-progress-bar">
                    {rsvpSummary.statuses.map((status) => <span className={`rsvp-progress-${status.tone}`} style={{ width: `${status.percent}%` }} key={status.label} />)}
                  </div>
                  <div className="rsvp-overview-statuses">
                    {rsvpSummary.statuses.map((status) => <div key={status.label}><span className={`rsvp-status-dot rsvp-status-dot-${status.tone}`} /><span>{status.label}</span><strong>{status.count}</strong></div>)}
                  </div>
                </div>
                <div className="rsvp-overview-confirmed">
                  <span className="rsvp-overview-label">Perkiraan hadir</span>
                  <strong>{rsvpSummary.attendance} <small>orang</small></strong>
                  <span className="rsvp-overview-note"><Icon name="check" size={12} /> termasuk yang masih ragu</span>
                </div>
              </div>
            </div>
          </section>

          <section className="collection-section" id="invitations">
            <div className="collection-toolbar"><div className="toolbar-copy"><h2>Semua undangan</h2><span>{filteredInvitations.length} dari {counts.all} undangan</span></div><div className="toolbar-controls"><label className="search-field"><Icon name="search" size={17} /><input id="search-invitations" type="search" placeholder="Cari undangan..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-control"><Icon name="filter" size={16} /><select aria-label="Filter status undangan" value={filter} onChange={(event) => setFilter(event.target.value as Filter)}><option value="all">Semua status</option><option value="published">Sudah terbit</option><option value="draft">Masih draf</option></select><Icon name="chevron-down" size={14} /></div></div></div>
            <div className="filter-tabs" role="tablist" aria-label="Filter koleksi undangan"><button className={filter === "all" ? "tab-active" : ""} type="button" role="tab" aria-selected={filter === "all"} onClick={() => setFilter("all")}>Semua <span>{counts.all}</span></button><button className={filter === "published" ? "tab-active" : ""} type="button" role="tab" aria-selected={filter === "published"} onClick={() => setFilter("published")}>Terbit <span>{counts.published}</span></button><button className={filter === "draft" ? "tab-active" : ""} type="button" role="tab" aria-selected={filter === "draft"} onClick={() => setFilter("draft")}>Draf <span>{counts.draft}</span></button></div>
            {filteredInvitations.length ? <div className="invitation-grid">{filteredInvitations.map((invitation) => <InvitationCard key={invitation.id} invitation={invitation} menuOpen={openMenu === invitation.id} onToggleMenu={() => { setOpenMenu(openMenu === invitation.id ? null : invitation.id); }} onAction={(action) => handleAction(invitation, action)} />)}<button className="new-card" type="button" onClick={goToStudio}><span className="new-card-icon"><Icon name="plus" size={22} /></span><strong>Buat undangan baru</strong><span>Mulai dari template pilihanmu</span></button></div> : <div className="empty-state"><span className="empty-icon"><Icon name="search" size={22} /></span><h3>Undangan tidak ditemukan</h3><p>Coba kata kunci atau filter yang berbeda.</p><button className="button button-soft" type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Reset pencarian</button></div>}
          </section>
        </div>
      </main>

      {toast ? <div className="toast" role="status"><span className="toast-check">✓</span>{toast}</div> : null}
    </div>
  );
}
