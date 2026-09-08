"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("Sarah Anindita");
  const [email, setEmail] = useState("sarah@rayain.id");
  const [phone, setPhone] = useState("+62 812 3456 7890");
  const [rsvpUpdates, setRsvpUpdates] = useState(true);
  const [blastUpdates, setBlastUpdates] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  const logout = () => {
    document.cookie = "rayain_demo_session=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "rayain_user_id=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "rayain_user_role=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "rayain_user_status=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "rayain_admin_session=; Path=/; Max-Age=0; SameSite=Lax";
    router.push("/login");
  };

  return <main className="profile-shell">
    <aside className="profile-side">
      <Link className="login-brand profile-brand" href="/"><span className="login-brand-mark">♡</span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></Link>
      <Link className="profile-back" href="/"><span>←</span> Kembali ke dashboard</Link>
      <div className="profile-side-copy"><span className="login-kicker">RUANG PERSONALMU</span><h1>Atur ruang yang terasa seperti kamu.</h1><p>Detail kecil di sini membantu Rayain menemani setiap momen dengan lebih dekat.</p></div>
      <div className="profile-side-identity"><span className="profile-large-avatar">SA</span><div><strong>{name}</strong><small>Workspace owner</small></div><span className="profile-live-dot" /></div>
      <span className="profile-side-foot">Data contoh · hanya tersimpan selama sesi demo</span>
    </aside>
    <section className="profile-main" aria-labelledby="profile-title">
      <div className="profile-main-inner">
        <div className="profile-heading"><div><span className="login-kicker">AKUN &amp; KEAMANAN</span><h2 id="profile-title">Profil kamu.</h2><p>Kelola identitas dan cara Rayain memberi kabar kepadamu.</p></div><span className="profile-heading-mark">✦</span></div>
        <div className="profile-layout">
          <form className="account-card profile-details-card" onSubmit={saveProfile}>
            <div className="account-card-heading"><div><span className="profile-section-label">IDENTITAS</span><h3>Data pribadi.</h3><p>Informasi ini digunakan sebagai pemilik workspace demo.</p></div><span className="profile-card-number">01</span></div>
            <div className="profile-avatar-edit"><span className="profile-large-avatar profile-avatar-soft">SA</span><div><strong>Foto profil</strong><small>Gunakan inisial untuk sementara.</small></div><button type="button" onClick={() => setSaved(false)}>Ganti foto</button></div>
            <div className="profile-form-grid"><label className="profile-field">Nama lengkap<input aria-label="Nama lengkap" type="text" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} /></label><label className="profile-field">Email<input aria-label="Email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSaved(false); }} /></label><label className="profile-field profile-field-wide">Nomor WhatsApp<input aria-label="Nomor WhatsApp" type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setSaved(false); }} /></label></div>
            <div className="profile-save-row"><span className={saved ? "profile-saved" : ""} role="status">{saved ? "✓ Perubahan disimpan di sesi demo." : "Terakhir diperbarui hari ini"}</span><button className="profile-save-button" type="submit">Simpan perubahan <span>→</span></button></div>
          </form>
          <section className="account-card profile-preferences-card" aria-labelledby="preference-title"><div className="account-card-heading"><div><span className="profile-section-label">PREFERENSI</span><h3 id="preference-title">Cara kami memberi kabar.</h3><p>Pilih update yang ingin kamu terima.</p></div><span className="profile-card-number">02</span></div><div className="profile-preference-list"><div className="profile-preference-row"><span className="profile-preference-icon profile-preference-icon-rose">♡</span><span><strong>Update RSVP</strong><small>Kabar baru dari tamu undanganmu.</small></span><button className={`profile-switch ${rsvpUpdates ? "profile-switch-on" : ""}`} type="button" role="switch" aria-checked={rsvpUpdates} aria-label="Aktifkan update RSVP" onClick={() => setRsvpUpdates((value) => !value)}><i /></button></div><div className="profile-preference-row"><span className="profile-preference-icon profile-preference-icon-peach">✦</span><span><strong>Ringkasan WA blast</strong><small>Laporan singkat setelah pesan terkirim.</small></span><button className={`profile-switch ${blastUpdates ? "profile-switch-on" : ""}`} type="button" role="switch" aria-checked={blastUpdates} aria-label="Aktifkan ringkasan WA blast" onClick={() => setBlastUpdates((value) => !value)}><i /></button></div></div><div className="profile-preference-note"><span>✦</span><p>Preferensi ini hanya memengaruhi tampilan dan notifikasi pada sesi demo.</p></div></section>
        </div>
        <section className="account-card profile-security-card" aria-labelledby="security-title"><div className="account-card-heading"><div><span className="profile-section-label">KEAMANAN</span><h3 id="security-title">Sesi &amp; akses.</h3><p>Workspace demo aktif di perangkat ini.</p></div><span className="profile-security-pill"><i /> Aman</span></div><div className="profile-security-content"><div><span className="profile-security-icon">⌁</span><span><strong>Kata sandi</strong><small>Terakhir diperbarui belum tersedia</small></span></div><Link className="profile-outline-button" href="/forgot-password">Atur ulang <span>→</span></Link><div><span className="profile-security-icon profile-security-icon-green">✓</span><span><strong>Protected session</strong><small>Cookie demo berlaku selama 24 jam</small></span></div><button className="profile-outline-button profile-logout-button" type="button" onClick={logout}>Keluar sesi <span>↗</span></button></div></section>
        <p className="profile-footer-note">Rayain · ruang kecil untuk cerita yang besar</p>
      </div>
    </section>
  </main>;
}
