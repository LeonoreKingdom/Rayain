"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [returnPath, setReturnPath] = useState("/");

  useEffect(() => {
    const nextPath = new URLSearchParams(window.location.search).get("next");
    if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) setReturnPath(nextPath);
  }, []);

  const submitRegistration = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (name.trim().length < 2) {
      setMessage("Masukkan nama yang ingin ditampilkan di workspace.");
      return;
    }
    if (!email.includes("@")) {
      setMessage("Masukkan alamat email yang valid.");
      return;
    }
    if (password.length < 8) {
      setMessage("Kata sandi perlu memiliki minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setMessage("Konfirmasi kata sandi belum sama.");
      return;
    }
    if (!agree) {
      setMessage("Setujui syarat penggunaan untuk melanjutkan.");
      return;
    }

    document.cookie = "rayain_demo_session=active; Path=/; Max-Age=86400; SameSite=Lax";
    document.cookie = "rayain_user_id=demo-new-user; Path=/; Max-Age=86400; SameSite=Lax";
    document.cookie = "rayain_user_role=owner; Path=/; Max-Age=86400; SameSite=Lax";
    document.cookie = "rayain_user_status=active; Path=/; Max-Age=86400; SameSite=Lax";
    document.cookie = "rayain_admin_session=; Path=/; Max-Age=0; SameSite=Lax";
    setSuccess(true);
  };

  return <main className="login-shell register-shell">
    <section className="login-story" aria-label="Tentang Rayain">
      <Link className="login-brand" href="/"><span className="login-brand-mark">♡</span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></Link>
      <div className="login-story-copy"><span className="login-kicker">MULAI MERAYAKAN</span><h1>Buat ruang untuk cerita yang ingin kamu bagi.</h1><p>Rayain membantu kamu menyusun undangan digital yang terasa dekat, dari detail kecil sampai momen dibagikan.</p></div>
      <div className="login-story-card"><span className="login-story-card-mark">✦</span><div><span>“</span><p>Undangan yang baik bukan hanya memberi tahu, tapi ikut membawa rasa.</p><small>— catatan dari ruang Rayain</small></div></div>
      <div className="login-art" aria-hidden="true"><span className="login-art-orbit login-art-orbit-one" /><span className="login-art-orbit login-art-orbit-two" /><span className="login-art-flower login-art-flower-one">✽</span><span className="login-art-flower login-art-flower-two">✦</span><div className="login-art-card"><span>your moment</span><strong>starts here</strong><i>♡</i></div></div>
      <span className="login-story-foot">Rayain · ruang kecil untuk cerita yang besar</span>
    </section>

    <section className="login-panel" aria-labelledby="register-title">
      <div className="login-panel-inner register-panel-inner">
        <div className="login-mobile-brand"><span className="login-brand-mark">♡</span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></div>
        <span className="login-kicker">SATU LANGKAH KECIL</span>
        <h2 id="register-title">Buat akun Rayain.</h2>
        <p className="login-intro">Mulai dari satu akun untuk mengatur semua momen spesialmu dengan lebih tenang.</p>
        {success ? <div className="login-success" role="status"><span className="login-success-icon">✓</span><div><strong>Selamat datang di Rayain.</strong><p>Akun demo untuk {name} berhasil dibuat dan siap digunakan.</p><Link className="login-submit login-success-link" href={returnPath}>Buka workspace demo <span>→</span></Link></div></div> : <form className="login-form register-form" onSubmit={submitRegistration}>
          <label className="login-field">Nama lengkap<div className="login-input-wrap"><span aria-hidden="true">✦</span><input aria-label="Nama lengkap" type="text" autoComplete="name" value={name} onChange={(event) => { setName(event.target.value); setMessage(""); }} placeholder="Contoh: Sarah Anindita" required /></div></label>
          <label className="login-field">Email<div className="login-input-wrap"><span aria-hidden="true">@</span><input aria-label="Email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setMessage(""); }} placeholder="nama@email.com" required /></div></label>
          <div className="register-form-row"><label className="login-field">Kata sandi<div className="login-input-wrap"><span aria-hidden="true">✦</span><input aria-label="Kata sandi" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setMessage(""); }} placeholder="Min. 8 karakter" required /><button className="login-password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPassword ? "Sembunyikan" : "Lihat"}</button></div></label><label className="login-field">Ulangi kata sandi<div className="login-input-wrap"><span aria-hidden="true">✦</span><input aria-label="Ulangi kata sandi" type={showConfirmation ? "text" : "password"} autoComplete="new-password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setMessage(""); }} placeholder="Ulangi kata sandi" required /><button className="login-password-toggle" type="button" onClick={() => setShowConfirmation((value) => !value)} aria-label={showConfirmation ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}>{showConfirmation ? "Sembunyikan" : "Lihat"}</button></div></label></div>
          <label className="register-agree"><input type="checkbox" checked={agree} onChange={(event) => { setAgree(event.target.checked); setMessage(""); }} /><span>Saya menyetujui <button className="login-text-button" type="button">syarat penggunaan</button> dan <button className="login-text-button" type="button">kebijakan privasi</button> Rayain.</span></label>
          {message ? <p className="login-error" role="alert">{message}</p> : null}
          <button className="login-submit" type="submit">Buat akun saya <span>→</span></button>
        </form>}
        {!success ? <p className="login-register register-login-link">Sudah punya akun? <Link className="login-text-button" href="/login">Masuk sekarang</Link></p> : null}
        <p className="login-legal register-legal">Data pendaftaran ini hanya digunakan untuk simulasi frontend demo.</p>
      </div>
    </section>
  </main>;
}
