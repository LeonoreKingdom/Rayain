"use client";

import { useState } from "react";

type AdminIconName =
  | "activity"
  | "arrow-right"
  | "bell"
  | "check"
  | "chevron-down"
  | "file"
  | "heart"
  | "layout"
  | "lock"
  | "logout"
  | "mail"
  | "music"
  | "pause"
  | "play"
  | "search"
  | "settings"
  | "sparkle"
  | "template"
  | "users";

type AdminView = "overview" | "users" | "invitations" | "templates" | "music" | "blasts" | "activity";

const demoAccessCode = "RAYAIN";

const primaryNavigation: Array<{ id: AdminView; label: string; icon: AdminIconName; count?: string }> = [
  { id: "overview", label: "Ringkasan", icon: "layout" },
  { id: "users", label: "Pengguna", icon: "users", count: "128" },
  { id: "invitations", label: "Undangan", icon: "file", count: "94" },
];

const contentNavigation: Array<{ id: AdminView; label: string; icon: AdminIconName }> = [
  { id: "templates", label: "Template", icon: "template" },
  { id: "music", label: "Pustaka musik", icon: "music" },
  { id: "blasts", label: "WA blast", icon: "mail" },
  { id: "activity", label: "Aktivitas", icon: "activity" },
];

const metrics = [
  { label: "Total pengguna", value: "128", note: "+12 bulan ini", tone: "rose", icon: "users" as AdminIconName },
  { label: "Undangan aktif", value: "94", note: "73,4% dari total", tone: "sage", icon: "heart" as AdminIconName },
  { label: "Respons RSVP", value: "1.248", note: "+18,6% minggu ini", tone: "peach", icon: "check" as AdminIconName },
  { label: "Pesan terkirim", value: "87%", note: "Delivery rate", tone: "lilac", icon: "mail" as AdminIconName },
];

type ChartPeriod = "7d" | "30d" | "90d";

const chartPeriods: Record<ChartPeriod, { label: string; title: string; total: string; change: string; data: Array<{ label: string; value: number }> }> = {
  "7d": { label: "7 hari", title: "Aktivitas tujuh hari terakhir.", total: "1.842", change: "14,8%", data: [{ label: "Sen", value: 46 }, { label: "Sel", value: 63 }, { label: "Rab", value: 51 }, { label: "Kam", value: 78 }, { label: "Jum", value: 68 }, { label: "Sab", value: 92 }, { label: "Min", value: 74 }] },
  "30d": { label: "30 hari", title: "Aktivitas tiga puluh hari terakhir.", total: "7.916", change: "21,4%", data: [{ label: "M1", value: 53 }, { label: "M2", value: 68 }, { label: "M3", value: 61 }, { label: "M4", value: 88 }, { label: "M5", value: 76 }, { label: "M6", value: 94 }, { label: "M7", value: 83 }] },
  "90d": { label: "90 hari", title: "Aktivitas sembilan puluh hari terakhir.", total: "21.483", change: "32,9%", data: [{ label: "Jun", value: 48 }, { label: "Jul", value: 57 }, { label: "Agu", value: 71 }, { label: "Sep", value: 86 }, { label: "Okt", value: 79 }, { label: "Nov", value: 93 }, { label: "Des", value: 89 }] },
};

const recentInvitations = [
  { initials: "AR", title: "Alya & Reza", owner: "Sarah Anindita", type: "Wedding", status: "published", updated: "12 menit lalu", tone: "rose" },
  { initials: "DN", title: "Dimas & Naya", owner: "Dimas Pratama", type: "Engagement", status: "published", updated: "38 menit lalu", tone: "sage" },
  { initials: "KM", title: "Kirana turns 25", owner: "Kirana Mahesa", type: "Birthday", status: "draft", updated: "1 jam lalu", tone: "peach" },
  { initials: "FA", title: "Fajar & Aulia", owner: "Fajar Nugraha", type: "Anniversary", status: "published", updated: "2 jam lalu", tone: "lilac" },
];

const adminUsers = [
  { initials: "SA", name: "Sarah Anindita", email: "sarah@rayain.id", role: "Super admin", invitations: 8, joined: "12 Jan 2026", status: "active", tone: "rose" },
  { initials: "DP", name: "Dimas Pratama", email: "dimas@rayain.id", role: "Pemilik", invitations: 4, joined: "21 Feb 2026", status: "active", tone: "sage" },
  { initials: "KM", name: "Kirana Mahesa", email: "kirana@rayain.id", role: "Pemilik", invitations: 2, joined: "03 Mar 2026", status: "active", tone: "peach" },
  { initials: "FN", name: "Fajar Nugraha", email: "fajar@rayain.id", role: "Pemilik", invitations: 3, joined: "18 Mar 2026", status: "active", tone: "lilac" },
  { initials: "RA", name: "Rani Adelia", email: "rani@rayain.id", role: "Editor", invitations: 1, joined: "05 Apr 2026", status: "invited", tone: "blue" },
  { initials: "BS", name: "Bagas Saputra", email: "bagas@rayain.id", role: "Pemilik", invitations: 0, joined: "09 Apr 2026", status: "active", tone: "gold" },
];

const adminTemplates = [
  { id: "soft-promise", initials: "SP", name: "Soft Promise", type: "wedding", typeLabel: "Wedding", description: "Romansa lembut dengan ruang putih yang terasa intim.", usage: 38, tone: "rose", active: true },
  { id: "the-garden", initials: "TG", name: "The Garden", type: "wedding", typeLabel: "Wedding", description: "Nuansa botanical untuk cerita yang tumbuh bersama.", usage: 26, tone: "sage", active: true },
  { id: "sunday-club", initials: "SC", name: "Sunday Club", type: "birthday", typeLabel: "Birthday", description: "Ceria, ringan, dan siap menemani pesta ulang tahun.", usage: 21, tone: "peach", active: true },
  { id: "ever-after", initials: "EA", name: "Ever After", type: "anniversary", typeLabel: "Anniversary", description: "Klasik dan hangat untuk merayakan perjalanan panjang.", usage: 17, tone: "lilac", active: true },
  { id: "paper-bloom", initials: "PB", name: "Paper Bloom", type: "engagement", typeLabel: "Engagement", description: "Editorial modern dengan detail yang manis dan personal.", usage: 12, tone: "blue", active: false },
];

type TemplateFilter = "all" | "wedding" | "birthday" | "anniversary" | "engagement";

const adminMusicTracks = [
  { id: "first-dance", title: "First Dance", artist: "The Rayain Library", mood: "Romantic & warm", moodKey: "romantic", duration: "03:24", usage: 42, tone: "rose", added: "07 Sep 2026", active: true, bars: [32, 54, 39, 72, 47, 64, 35, 81, 52, 68, 44, 75] },
  { id: "morning-light", title: "Morning Light", artist: "The Rayain Library", mood: "Soft & hopeful", moodKey: "soft", duration: "02:48", usage: 31, tone: "sage", added: "05 Sep 2026", active: true, bars: [44, 63, 51, 38, 72, 56, 78, 46, 65, 53, 70, 42] },
  { id: "garden-notes", title: "Garden Notes", artist: "The Rayain Library", mood: "Intimate & calm", moodKey: "intimate", duration: "03:07", usage: 27, tone: "lilac", added: "28 Agu 2026", active: true, bars: [58, 39, 66, 46, 76, 53, 34, 69, 47, 61, 42, 73] },
  { id: "little-spark", title: "Little Spark", artist: "The Rayain Library", mood: "Joyful & bright", moodKey: "joyful", duration: "02:35", usage: 18, tone: "peach", added: "21 Agu 2026", active: true, bars: [39, 72, 48, 84, 55, 68, 44, 77, 51, 88, 46, 70] },
  { id: "slow-sunday", title: "Slow Sunday", artist: "The Rayain Library", mood: "Soft & reflective", moodKey: "soft", duration: "03:42", usage: 9, tone: "blue", added: "14 Agu 2026", active: false, bars: [51, 36, 62, 42, 70, 48, 58, 33, 67, 45, 74, 40] },
];

type MusicFilter = "all" | "romantic" | "soft" | "intimate" | "joyful";

const activities = [
  { title: "RSVP baru masuk", detail: "Rani Kusuma · Alya & Reza", time: "12 menit lalu", tone: "green", icon: "check" as AdminIconName },
  { title: "Undangan diterbitkan", detail: "Dimas & Naya", time: "38 menit lalu", tone: "rose", icon: "sparkle" as AdminIconName },
  { title: "Template baru ditambahkan", detail: "Sunday Club · Birthday", time: "1 jam lalu", tone: "yellow", icon: "template" as AdminIconName },
  { title: "Blast selesai dikirim", detail: "Alya & Reza · 42 penerima", time: "2 jam lalu", tone: "blue", icon: "mail" as AdminIconName },
];

function AdminIcon({ name, size = 17 }: { name: AdminIconName; size?: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.7 };
  const paths: Record<AdminIconName, React.ReactNode> = {
    activity: <><path {...common} d="M3.5 12h4l2.3-6 4.5 12 2.3-6h4" /><path {...common} d="M3 5.5h.01M21 18.5h.01" /></>,
    "arrow-right": <path {...common} d="M5 12h14m-6-6 6 6-6 6" />,
    bell: <><path {...common} d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    check: <path {...common} d="m5 12 4.3 4.3L19 6.7" />,
    "chevron-down": <path {...common} d="m6 9 6 6 6-6" />,
    file: <><path {...common} d="M6 3.5h8l4 4v13H6z" /><path {...common} d="M14 3.5v4h4M9 12h6M9 16h6" /></>,
    heart: <path {...common} d="M20.8 8.9c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.9Z" />,
    layout: <><rect {...common} x="3.5" y="4" width="17" height="16" rx="2" /><path {...common} d="M3.5 9.5h17M9 9.5V20" /></>,
    lock: <><rect {...common} x="5" y="10" width="14" height="11" rx="2" /><path {...common} d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    logout: <><path {...common} d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" /></>,
    mail: <><rect {...common} x="3.5" y="5" width="17" height="14" rx="2" /><path {...common} d="m4.5 7 7.5 6 7.5-6" /></>,
    music: <><path {...common} d="M9 18V5l10-2v13" /><circle {...common} cx="6" cy="18" r="3" /><circle {...common} cx="16" cy="16" r="3" /></>,
    pause: <><rect {...common} x="6" y="5" width="4" height="14" rx="1" /><rect {...common} x="14" y="5" width="4" height="14" rx="1" /></>,
    play: <path {...common} d="m8 5 11 7-11 7V5Z" />,
    search: <><circle {...common} cx="10.8" cy="10.8" r="6.2" /><path {...common} d="m16 16 4.5 4.5" /></>,
    settings: <><circle {...common} cx="12" cy="12" r="3" /><path {...common} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.7v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
    sparkle: <path {...common} d="m12 3 1.1 4.2a4.9 4.9 0 0 0 3.5 3.5L21 12l-4.4 1.3a4.9 4.9 0 0 0-3.5 3.5L12 21l-1.1-4.2a4.9 4.9 0 0 0-3.5-3.5L3 12l4.4-1.3a4.9 4.9 0 0 0 3.5-3.5L12 3Z" />,
    template: <><rect {...common} x="4" y="4" width="16" height="16" rx="2" /><path {...common} d="M4 9h16M9 9v11" /></>,
    users: <><path {...common} d="M16 20v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.6A3.6 3.6 0 0 0 4 18.6V20" /><circle {...common} cx="10" cy="8" r="3.2" /><path {...common} d="M16 8.2a3 3 0 0 1 0 5.7M18.2 15a3.6 3.6 0 0 1 2.3 3.4V20" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">{paths[name]}</svg>;
}

function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");

  const submitAccess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (accessCode.trim().toUpperCase() !== demoAccessCode) {
      setError("Kode akses belum sesuai. Coba lagi.");
      return;
    }
    document.cookie = "rayain_admin_session=active; Path=/; Max-Age=86400; SameSite=Lax";
    onUnlock();
  };

  return (
    <main className="admin-gate">
      <div className="admin-gate-art admin-gate-art-one" />
      <div className="admin-gate-art admin-gate-art-two" />
      <section className="admin-gate-card" aria-labelledby="admin-gate-title">
        <div className="admin-gate-brand"><span className="admin-gate-mark"><AdminIcon name="heart" size={18} /></span><span><strong>rayain</strong><small>ADMIN CONSOLE</small></span></div>
        <div className="admin-gate-icon"><AdminIcon name="lock" size={21} /></div>
        <span className="admin-kicker">RUANG TERBATAS</span>
        <h1 id="admin-gate-title">Selamat datang di balik layar.</h1>
        <p>Panel ini hanya untuk pengelola Rayain. Masukkan kode akses untuk melihat ringkasan workspace.</p>
        <form className="admin-gate-form" onSubmit={submitAccess}>
          <label htmlFor="admin-access-code">Kode akses demo</label>
          <div className="admin-gate-input"><AdminIcon name="lock" size={15} /><input id="admin-access-code" type="password" autoComplete="off" value={accessCode} onChange={(event) => { setAccessCode(event.target.value); setError(""); }} placeholder="Masukkan kode akses" /></div>
          {error ? <small className="admin-gate-error" role="alert">{error}</small> : null}
          <button className="admin-gate-submit" type="submit"><span>Masuk ke panel</span><AdminIcon name="arrow-right" size={15} /></button>
        </form>
        <div className="admin-gate-note"><AdminIcon name="sparkle" size={13} /><span>Frontend demo · kode akses: <strong>{demoAccessCode}</strong></span></div>
      </section>
      <p className="admin-gate-footer">Rayain Admin Console <span>·</span> Akses tercatat untuk sesi ini</p>
    </main>
  );
}

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
  return <article className={`admin-metric admin-metric-${metric.tone}`}><span className="admin-metric-icon"><AdminIcon name={metric.icon} size={16} /></span><span className="admin-metric-label">{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></article>;
}

function Overview({ onNavigate }: { onNavigate: (view: AdminView) => void }) {
  const [period, setPeriod] = useState<ChartPeriod>("7d");
  const currentPeriod = chartPeriods[period];

  return (
    <>
      <section className="admin-metric-grid" aria-label="Metrik utama">
        {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-card admin-chart-card" aria-labelledby="growth-title">
          <div className="admin-card-heading"><div><span className="admin-kicker">PERTUMBUHAN WORKSPACE</span><h2 id="growth-title">{currentPeriod.title}</h2></div><label className="admin-period-select"><span className="sr-only">Filter periode statistik</span><select aria-label="Filter periode statistik" value={period} onChange={(event) => setPeriod(event.target.value as ChartPeriod)}><option value="7d">7 hari</option><option value="30d">30 hari</option><option value="90d">90 hari</option></select><AdminIcon name="chevron-down" size={13} /></label></div>
          <div className="admin-chart-summary"><strong>{currentPeriod.total}</strong><span><i /> +{currentPeriod.change} dari periode sebelumnya</span></div>
          <div className="admin-chart" role="img" aria-label={`Grafik aktivitas workspace selama ${currentPeriod.label}`}><div className="admin-chart-y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="admin-chart-bars">{currentPeriod.data.map((item) => <div className="admin-chart-bar-item" key={item.label}><div className="admin-chart-bar-track"><span style={{ height: `${item.value}%` }} /></div><small>{item.label}</small></div>)}</div></div>
          <div className="admin-chart-legend"><span><i className="admin-legend-rose" /> Undangan dibuat</span><span><i className="admin-legend-peach" /> RSVP masuk</span><button type="button" onClick={() => onNavigate("activity")}>Lihat aktivitas <AdminIcon name="arrow-right" size={13} /></button></div>
        </section>
        <section className="admin-card admin-health-card" aria-labelledby="health-title">
          <div className="admin-card-heading"><div><span className="admin-kicker">KESEHATAN SISTEM</span><h2 id="health-title">Semua terasa baik.</h2></div><span className="admin-live-pill"><i /> Live</span></div>
          <div className="admin-health-ring" style={{ background: "conic-gradient(#c8798d 0deg 327deg, #f3e5e4 327deg 360deg)" }}><div><strong>91%</strong><small>sehat</small></div></div>
          <div className="admin-health-list"><div><span className="admin-health-dot admin-health-dot-green" /><span>API &amp; database</span><strong>Normal</strong></div><div><span className="admin-health-dot admin-health-dot-yellow" /><span>WhatsApp delivery</span><strong>87%</strong></div><div><span className="admin-health-dot admin-health-dot-blue" /><span>Storage media</span><strong>64%</strong></div></div>
          <button className="admin-text-button" type="button" onClick={() => onNavigate("activity")}>Buka log sistem <AdminIcon name="arrow-right" size={13} /></button>
        </section>
      </div>
      <div className="admin-lower-grid">
        <section className="admin-card admin-table-card" aria-labelledby="recent-title">
          <div className="admin-card-heading"><div><span className="admin-kicker">TERBARU DIPERBARUI</span><h2 id="recent-title">Undangan terbaru.</h2></div><button className="admin-text-button" type="button" onClick={() => onNavigate("invitations")}>Lihat semua <AdminIcon name="arrow-right" size={13} /></button></div>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">Undangan</th><th scope="col">Tipe</th><th scope="col">Status</th><th scope="col">Diperbarui</th><th scope="col"><span className="sr-only">Aksi</span></th></tr></thead><tbody>{recentInvitations.map((invitation) => <tr key={invitation.title}><td><span className={`admin-invitation-avatar admin-invitation-avatar-${invitation.tone}`}>{invitation.initials}</span><span><strong>{invitation.title}</strong><small>{invitation.owner}</small></span></td><td>{invitation.type}</td><td><span className={`admin-status admin-status-${invitation.status}`}><i />{invitation.status === "published" ? "Aktif" : "Draft"}</span></td><td>{invitation.updated}</td><td><button className="admin-row-action" type="button" aria-label={`Buka ${invitation.title}`} onClick={() => onNavigate("invitations")}><AdminIcon name="arrow-right" size={14} /></button></td></tr>)}</tbody></table></div>
        </section>
        <section className="admin-card admin-activity-card" aria-labelledby="activity-title">
          <div className="admin-card-heading"><div><span className="admin-kicker">JEJAK TERKINI</span><h2 id="activity-title">Aktivitas terbaru.</h2></div><button className="admin-icon-button" type="button" aria-label="Pengaturan aktivitas"><AdminIcon name="settings" size={15} /></button></div>
          <div className="admin-activity-list">{activities.map((activity) => <div className="admin-activity-item" key={`${activity.title}-${activity.time}`}><span className={`admin-activity-icon admin-activity-icon-${activity.tone}`}><AdminIcon name={activity.icon} size={14} /></span><span><strong>{activity.title}</strong><small>{activity.detail}</small><em>{activity.time}</em></span></div>)}</div>
          <button className="admin-text-button" type="button" onClick={() => onNavigate("activity")}>Lihat semua aktivitas <AdminIcon name="arrow-right" size={13} /></button>
        </section>
      </div>
    </>
  );
}

function UsersView() {
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<(typeof adminUsers)[number] | null>(null);
  const [blockedEmails, setBlockedEmails] = useState<string[]>([]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredUsers = normalizedQuery
    ? adminUsers.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(normalizedQuery))
    : adminUsers;

  const toggleBlock = (email: string) => setBlockedEmails((current) => current.includes(email) ? current.filter((item) => item !== email) : [...current, email]);

  return <>
    <section className="admin-card admin-users-view" aria-labelledby="users-list-title">
      <div className="admin-users-heading"><div><span className="admin-kicker">DIRECTORY PENGGUNA</span><h2 id="users-list-title">Semua pengguna.</h2><p>Kelola pemilik workspace dan akses ke ekosistem Rayain.</p></div><span className="admin-users-total"><strong>128</strong><small>pengguna total</small></span></div>
      <div className="admin-users-toolbar"><label className="admin-users-search"><AdminIcon name="search" size={15} /><span className="sr-only">Cari pengguna</span><input aria-label="Cari pengguna" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, email, atau peran..." /></label><span className="admin-filter-result">{normalizedQuery ? `${filteredUsers.length} hasil` : "6 terbaru dari 128"}</span><button className="admin-primary-button" type="button"><AdminIcon name="users" size={14} /> Undang pengguna</button></div>
      {filteredUsers.length ? <div className="admin-user-table-wrap"><table className="admin-user-table"><thead><tr><th scope="col">Pengguna</th><th scope="col">Peran</th><th scope="col">Undangan</th><th scope="col">Bergabung</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Aksi</span></th></tr></thead><tbody>{filteredUsers.map((user) => { const blocked = blockedEmails.includes(user.email); return <tr key={user.email}><td><span className={`admin-user-avatar admin-user-avatar-${user.tone}`}>{user.initials}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></td><td>{user.role}</td><td><strong className="admin-user-invitation-count">{user.invitations}</strong><span className="admin-user-invitation-label">undangan</span></td><td>{user.joined}</td><td><span className={`admin-user-status admin-user-status-${blocked ? "blocked" : user.status}`}><i />{blocked ? "Diblokir" : user.status === "active" ? "Aktif" : "Menunggu"}</span></td><td><button className="admin-row-action" type="button" aria-label={`Buka profil ${user.name}`} onClick={() => setSelectedUser(user)}><AdminIcon name="arrow-right" size={14} /></button></td></tr>; })}</tbody></table></div> : <div className="admin-users-empty"><span><AdminIcon name="search" size={18} /></span><strong>Pengguna tidak ditemukan.</strong><p>Coba kata kunci lain untuk menemukan pengguna.</p><button type="button" onClick={() => setQuery("")}>Hapus pencarian</button></div>}
      <div className="admin-users-footer"><span><AdminIcon name="lock" size={13} /> Data pengguna hanya bisa diakses oleh admin.</span><button type="button">Export CSV <AdminIcon name="arrow-right" size={13} /></button></div>
    </section>
    {selectedUser ? <UserDetailModal user={selectedUser} blocked={blockedEmails.includes(selectedUser.email)} onClose={() => setSelectedUser(null)} onToggleBlock={() => toggleBlock(selectedUser.email)} /> : null}
  </>;
}

function UserDetailModal({ user, blocked, onClose, onToggleBlock }: { user: (typeof adminUsers)[number]; blocked: boolean; onClose: () => void; onToggleBlock: () => void }) {
  const userInvitations = recentInvitations.filter((invitation) => invitation.owner === user.name);
  return <div className="admin-modal-backdrop" role="presentation" onClick={onClose}><section className="admin-user-modal" role="dialog" aria-modal="true" aria-labelledby="admin-user-modal-title" onClick={(event) => event.stopPropagation()}><button className="admin-modal-close" type="button" aria-label="Tutup detail pengguna" onClick={onClose}>×</button><div className="admin-user-modal-header"><span className={`admin-user-modal-avatar admin-user-avatar-${user.tone}`}>{user.initials}</span><div><span className="admin-kicker">PROFIL PENGGUNA</span><h2 id="admin-user-modal-title">{user.name}</h2><p>{user.email}</p></div><span className={`admin-user-status admin-user-status-${blocked ? "blocked" : user.status}`}><i />{blocked ? "Diblokir" : user.status === "active" ? "Aktif" : "Menunggu"}</span></div><div className="admin-user-modal-stats"><div><small>Peran</small><strong>{user.role}</strong></div><div><small>Undangan</small><strong>{user.invitations}</strong></div><div><small>Bergabung</small><strong>{user.joined}</strong></div></div><div className="admin-user-modal-section"><span className="admin-kicker">WORKSPACE TERKAIT</span><h3>Undangan milik pengguna.</h3>{userInvitations.length ? <div className="admin-user-modal-invitations">{userInvitations.map((invitation) => <div key={invitation.title}><span className={`admin-invitation-avatar admin-invitation-avatar-${invitation.tone}`}>{invitation.initials}</span><span><strong>{invitation.title}</strong><small>{invitation.type} · {invitation.status === "published" ? "Aktif" : "Draft"}</small></span></div>)}</div> : <p className="admin-user-modal-muted">Belum ada undangan pada workspace ini.</p>}</div><div className={`admin-user-danger ${blocked ? "admin-user-danger-blocked" : ""}`}><span><strong>{blocked ? "Akses pengguna diblokir" : "Batasi akses pengguna"}</strong><small>{blocked ? "Pengguna ini tidak dapat mengakses workspace Rayain." : "Gunakan jika akun memerlukan peninjauan lebih lanjut."}</small></span><button type="button" onClick={onToggleBlock}><AdminIcon name="lock" size={14} />{blocked ? "Buka blokir" : "Blokir akses"}</button></div></section></div>;
}

function TemplatesView() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TemplateFilter>("all");
  const [inactiveTemplateIds, setInactiveTemplateIds] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof adminTemplates)[number] | null>(null);
  const [notice, setNotice] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTemplates = adminTemplates.filter((template) => {
    const matchesFilter = filter === "all" || template.type === filter;
    const matchesQuery = !normalizedQuery || `${template.name} ${template.typeLabel} ${template.description}`.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  });
  const activeCount = adminTemplates.filter((template) => template.active && !inactiveTemplateIds.includes(template.id)).length;

  const toggleTemplate = (id: string) => {
    setInactiveTemplateIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setNotice("");
  };

  return <>
    <section className="admin-card admin-templates-view" aria-labelledby="templates-list-title">
      <div className="admin-templates-heading"><div><span className="admin-kicker">DESIGN SYSTEM RAYAIN</span><h2 id="templates-list-title">Library template.</h2><p>Kelola tampilan undangan yang bisa dipilih oleh setiap cerita.</p></div><span className="admin-templates-total"><strong>{adminTemplates.length}</strong><small>template tersedia</small></span></div>
      <div className="admin-templates-toolbar"><label className="admin-templates-search"><AdminIcon name="search" size={15} /><span className="sr-only">Cari template</span><input aria-label="Cari template" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama template..." /></label><label className="admin-templates-filter"><span className="sr-only">Filter tipe acara</span><select aria-label="Filter tipe acara" value={filter} onChange={(event) => setFilter(event.target.value as TemplateFilter)}><option value="all">Semua tipe acara</option><option value="wedding">Wedding</option><option value="birthday">Birthday</option><option value="anniversary">Anniversary</option><option value="engagement">Engagement</option></select><AdminIcon name="chevron-down" size={13} /></label><span className="admin-filter-result">{filteredTemplates.length} hasil · {activeCount} aktif</span><button className="admin-primary-button" type="button" onClick={() => setNotice("Form template baru akan tersedia pada modul berikutnya.")}><AdminIcon name="sparkle" size={14} /> Tambah template</button></div>
      {notice ? <div className="admin-template-notice" role="status"><AdminIcon name="sparkle" size={13} />{notice}</div> : null}
      {filteredTemplates.length ? <div className="admin-template-grid">{filteredTemplates.map((template) => { const active = template.active && !inactiveTemplateIds.includes(template.id); return <article className={`admin-template-card ${active ? "" : "admin-template-card-inactive"}`} key={template.id}><button className={`admin-template-cover admin-template-cover-${template.tone}`} type="button" aria-label={`Pratinjau ${template.name}`} onClick={() => setSelectedTemplate(template)}><span>RAYAIN EDITION</span><strong>{template.initials}</strong><small>{template.typeLabel}</small><i /><i /></button><div className="admin-template-card-head"><span className={`admin-template-status ${active ? "admin-template-status-active" : "admin-template-status-inactive"}`}><i />{active ? "Aktif" : "Nonaktif"}</span><span className="admin-template-usage">{template.usage} digunakan</span></div><h3>{template.name}</h3><p>{template.description}</p><div className="admin-template-meta"><span><i />{template.typeLabel}</span><span>·</span><span>v1.0</span></div><div className="admin-template-actions"><button className="admin-template-action admin-template-action-primary" type="button" onClick={() => setSelectedTemplate(template)}>Pratinjau</button><button className="admin-template-action" type="button" onClick={() => toggleTemplate(template.id)}>{active ? "Nonaktifkan" : "Aktifkan"}</button></div></article>; })}</div> : <div className="admin-template-empty"><span><AdminIcon name="template" size={19} /></span><strong>Template tidak ditemukan.</strong><p>Coba kata kunci atau tipe acara lain.</p><button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Hapus filter</button></div>}
      <div className="admin-templates-footer"><span><AdminIcon name="sparkle" size={13} /> Perubahan status tersimpan untuk sesi demo ini.</span><span>Terakhir diperbarui hari ini</span></div>
    </section>
    {selectedTemplate ? <TemplatePreviewModal template={selectedTemplate} active={selectedTemplate.active && !inactiveTemplateIds.includes(selectedTemplate.id)} onClose={() => setSelectedTemplate(null)} onToggle={() => toggleTemplate(selectedTemplate.id)} /> : null}
  </>;
}

function TemplatePreviewModal({ template, active, onClose, onToggle }: { template: (typeof adminTemplates)[number]; active: boolean; onClose: () => void; onToggle: () => void }) {
  return <div className="admin-modal-backdrop" role="presentation" onClick={onClose}><section className="admin-template-modal" role="dialog" aria-modal="true" aria-labelledby="admin-template-modal-title" onClick={(event) => event.stopPropagation()}><button className="admin-modal-close" type="button" aria-label="Tutup pratinjau template" onClick={onClose}>×</button><div className={`admin-template-modal-cover admin-template-cover-${template.tone}`}><span>RAYAIN EDITION</span><strong>{template.initials}</strong><small>{template.typeLabel}</small><i /><i /></div><div className="admin-template-modal-copy"><span className="admin-kicker">PRATINJAU TEMPLATE</span><h2 id="admin-template-modal-title">{template.name}</h2><p>{template.description}</p><div className="admin-template-modal-details"><div><small>Tipe acara</small><strong>{template.typeLabel}</strong></div><div><small>Digunakan</small><strong>{template.usage} undangan</strong></div><div><small>Status</small><strong className={active ? "admin-template-modal-active" : "admin-template-modal-inactive"}>{active ? "Aktif" : "Nonaktif"}</strong></div></div><div className="admin-template-modal-actions"><button className="admin-template-action" type="button" onClick={onClose}>Tutup pratinjau</button><button className={`admin-template-action ${active ? "admin-template-action-danger" : "admin-template-action-primary"}`} type="button" onClick={onToggle}>{active ? "Nonaktifkan" : "Aktifkan"}</button></div></div></section></div>;
}

function MusicView() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MusicFilter>("all");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [inactiveTrackIds, setInactiveTrackIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTracks = adminMusicTracks.filter((track) => {
    const matchesFilter = filter === "all" || track.moodKey === filter;
    const matchesQuery = !normalizedQuery || `${track.title} ${track.artist} ${track.mood}`.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  });
  const activeCount = adminMusicTracks.filter((track) => track.active && !inactiveTrackIds.includes(track.id)).length;

  const toggleTrackStatus = (id: string) => {
    setInactiveTrackIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    if (playingTrackId === id) setPlayingTrackId(null);
    setNotice("");
  };

  return <section className="admin-card admin-music-view" aria-labelledby="music-library-title">
    <div className="admin-music-heading"><div><span className="admin-kicker">SOUNDTRACK RAYAIN</span><h2 id="music-library-title">Irama untuk setiap momen.</h2><p>Atur pustaka musik latar yang menemani tamu membuka undangan.</p></div><span className="admin-music-total"><strong>{activeCount}</strong><small>track aktif</small></span></div>
    <div className="admin-music-toolbar"><label className="admin-templates-search"><AdminIcon name="search" size={15} /><span className="sr-only">Cari musik</span><input aria-label="Cari musik" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, artis, atau mood..." /></label><label className="admin-templates-filter"><span className="sr-only">Filter mood</span><select aria-label="Filter mood" value={filter} onChange={(event) => setFilter(event.target.value as MusicFilter)}><option value="all">Semua mood</option><option value="romantic">Romantic</option><option value="soft">Soft</option><option value="intimate">Intimate</option><option value="joyful">Joyful</option></select><AdminIcon name="chevron-down" size={13} /></label><span className="admin-filter-result">{filteredTracks.length} track · {activeCount} aktif</span><button className="admin-primary-button" type="button" onClick={() => setNotice("Upload musik baru akan tersedia pada modul berikutnya.")}><AdminIcon name="music" size={14} /> Tambah musik</button></div>
    {notice ? <div className="admin-template-notice" role="status"><AdminIcon name="sparkle" size={13} />{notice}</div> : null}
    <div className="admin-music-stats"><div><span className="admin-music-stat-icon admin-music-stat-icon-rose"><AdminIcon name="music" size={14} /></span><span><small>Total pustaka</small><strong>{adminMusicTracks.length} track</strong></span></div><div><span className="admin-music-stat-icon admin-music-stat-icon-sage"><AdminIcon name="users" size={14} /></span><span><small>Undangan memakai musik</small><strong>128 undangan</strong></span></div><div><span className="admin-music-stat-icon admin-music-stat-icon-peach"><AdminIcon name="activity" size={14} /></span><span><small>Track paling populer</small><strong>First Dance</strong></span></div></div>
    {filteredTracks.length ? <div className="admin-music-list">{filteredTracks.map((track) => { const active = track.active && !inactiveTrackIds.includes(track.id); const playing = playingTrackId === track.id; return <article className={`admin-music-track ${active ? "" : "admin-music-track-inactive"}`} key={track.id}><div className={`admin-music-track-icon admin-music-track-icon-${track.tone}`}><AdminIcon name="music" size={17} /></div><div className="admin-music-track-copy"><div className="admin-music-track-title"><h3>{track.title}</h3><span className={`admin-template-status ${active ? "admin-template-status-active" : "admin-template-status-inactive"}`}><i />{active ? "Aktif" : "Nonaktif"}</span></div><p>{track.artist} · {track.mood}</p><div className="admin-music-waveform" aria-hidden="true">{track.bars.map((bar, index) => <i key={`${track.id}-${index}`} style={{ height: `${bar}%` }} />)}</div></div><span className="admin-music-duration">{track.duration}</span><span className="admin-music-usage">{track.usage}<small>undangan</small></span><div className="admin-music-actions"><button className={`admin-template-action ${playing ? "admin-template-action-primary" : ""}`} type="button" aria-label={playing ? `Jeda ${track.title}` : `Dengarkan ${track.title}`} onClick={() => setPlayingTrackId(playing ? null : track.id)}><AdminIcon name={playing ? "pause" : "play"} size={11} />{playing ? "Jeda" : "Dengarkan"}</button><button className="admin-template-action" type="button" onClick={() => toggleTrackStatus(track.id)}>{active ? "Nonaktifkan" : "Aktifkan"}</button></div></article>; })}</div> : <div className="admin-template-empty"><span><AdminIcon name="music" size={19} /></span><strong>Musik tidak ditemukan.</strong><p>Coba judul, artis, atau mood lain.</p><button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Hapus filter</button></div>}
    <div className="admin-templates-footer"><span><AdminIcon name="sparkle" size={13} /> Cuplikan audio hanya tersedia untuk sesi demo ini.</span><span>Terakhir diperbarui hari ini</span></div>
  </section>;
}

function AdminPlaceholder({ view, onBack }: { view: AdminView; onBack: () => void }) {
  const labels: Record<AdminView, string> = { overview: "Ringkasan", users: "Pengguna", invitations: "Undangan", templates: "Template", music: "Pustaka musik", blasts: "WA blast", activity: "Aktivitas" };
  return <section className="admin-placeholder"><span className="admin-placeholder-icon"><AdminIcon name={view === "users" ? "users" : view === "music" ? "music" : view === "blasts" ? "mail" : view === "activity" ? "activity" : "file"} size={22} /></span><span className="admin-kicker">{labels[view].toUpperCase()}</span><h2>{labels[view]} sedang disiapkan.</h2><p>Struktur halaman ini sudah terhubung ke navigasi admin. Data dan aksi lengkap akan mengikuti modul berikutnya.</p><button className="admin-primary-button" type="button" onClick={onBack}>Kembali ke ringkasan <AdminIcon name="arrow-right" size={14} /></button></section>;
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!authorized) return <AccessGate onUnlock={() => setAuthorized(true)} />;

  const navigate = (view: AdminView) => {
    setActiveView(view);
    setNotificationsOpen(false);
  };
  const activeLabel = activeView === "overview" ? "Ringkasan" : primaryNavigation.concat(contentNavigation).find((item) => item.id === activeView)?.label ?? "Admin";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand"><span className="admin-sidebar-mark"><AdminIcon name="heart" size={16} /></span><span><strong>rayain</strong><small>ADMIN CONSOLE</small></span></div>
        <div className="admin-security-status"><span className="admin-security-icon"><AdminIcon name="lock" size={13} /></span><span><strong>Protected session</strong><small>Admin access aktif</small></span><i /></div>
        <div className="admin-nav-label">Workspace</div>
        <nav className="admin-nav" aria-label="Navigasi admin utama">{primaryNavigation.map((item) => <button className={`admin-nav-item ${activeView === item.id ? "admin-nav-item-active" : ""}`} type="button" key={item.id} onClick={() => navigate(item.id)}><AdminIcon name={item.icon} size={16} /><span>{item.label}</span>{item.count ? <small>{item.count}</small> : null}</button>)}</nav>
        <div className="admin-nav-label admin-nav-label-spaced">Kelola konten</div>
        <nav className="admin-nav" aria-label="Navigasi konten admin">{contentNavigation.map((item) => <button className={`admin-nav-item ${activeView === item.id ? "admin-nav-item-active" : ""}`} type="button" key={item.id} onClick={() => navigate(item.id)}><AdminIcon name={item.icon} size={16} /><span>{item.label}</span></button>)}</nav>
        <div className="admin-sidebar-bottom"><div className="admin-sidebar-tip"><AdminIcon name="sparkle" size={14} /><span><strong>Jaga tetap hangat.</strong><small>Admin yang rapi membuat cerita terus berjalan.</small></span></div><button className="admin-profile" type="button" onClick={() => setAuthorized(false)}><span className="admin-avatar">SA</span><span><strong>Sarah Anindita</strong><small>Super admin</small></span><AdminIcon name="logout" size={15} /></button></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div className="admin-breadcrumb"><span>Rayain</span><AdminIcon name="arrow-right" size={12} /><strong>{activeLabel}</strong></div><div className="admin-topbar-actions"><div className="admin-topbar-search"><AdminIcon name="search" size={15} /><input aria-label="Cari di panel admin" placeholder="Cari apa saja..." /></div><div className="admin-notification-wrap"><button className="admin-icon-button admin-notification-button" type="button" aria-label="Buka notifikasi" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}><AdminIcon name="bell" size={17} /><i /></button>{notificationsOpen ? <div className="admin-notification-popover"><span className="admin-kicker">UPDATES</span><strong>3 notifikasi baru</strong><p>RSVP baru, undangan diterbitkan, dan template siap ditinjau.</p><button type="button" onClick={() => { setNotificationsOpen(false); navigate("activity"); }}>Lihat aktivitas <AdminIcon name="arrow-right" size={13} /></button></div> : null}</div><span className="admin-topbar-divider" /><span className="admin-session-pill"><i /> Admin mode</span><span className="admin-avatar">SA</span></div></header>
        <div className="admin-content"><section className="admin-page-heading"><div><span className="admin-kicker">RAYAIN ADMIN CONSOLE</span><h1>{activeView === "overview" ? "Kontrol yang tetap hangat." : activeLabel}</h1><p>{activeView === "overview" ? "Satu ruang untuk menjaga semua cerita, undangan, dan pengalaman tamu tetap berjalan baik." : `Kelola modul ${activeLabel.toLowerCase()} Rayain dengan tenang dan terukur.`}</p></div><div className="admin-heading-actions"><span className="admin-date-label">Senin, 7 September 2026</span><button className="admin-primary-button" type="button" onClick={() => navigate("invitations")}><AdminIcon name="sparkle" size={14} /> Buat pengumuman</button></div></section>{activeView === "overview" ? <Overview onNavigate={navigate} /> : activeView === "users" ? <UsersView /> : activeView === "templates" ? <TemplatesView /> : activeView === "music" ? <MusicView /> : <AdminPlaceholder view={activeView} onBack={() => navigate("overview")} />}</div>
      </main>
    </div>
  );
}
