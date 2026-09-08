"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const demoEmail = "sarah@rayain.id";
const demoPassword = "rayain123";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [returnPath, setReturnPath] = useState("/");

  useEffect(() => {
    const nextPath = new URLSearchParams(window.location.search).get("next");
    if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) setReturnPath(nextPath);
    if (new URLSearchParams(window.location.search).get("blocked") === "1") setMessage("Akun ini sedang diblokir. Hubungi admin workspace untuk mendapatkan akses kembali.");
  }, []);

  const submitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (email.trim().toLowerCase() !== demoEmail || password !== demoPassword) {
      setMessage("Email atau kata sandi belum sesuai. Gunakan akun demo di bawah.");
      return;
    }

    document.cookie = "rayain_demo_session=active; Path=/; Max-Age=86400; SameSite=Lax";
    document.cookie = "rayain_user_id=demo-sarah; Path=/; Max-Age=86400; SameSite=Lax";
    document.cookie = "rayain_user_role=admin; Path=/; Max-Age=86400; SameSite=Lax";
    document.cookie = "rayain_user_status=active; Path=/; Max-Age=86400; SameSite=Lax";
    document.cookie = "rayain_admin_session=active; Path=/; Max-Age=86400; SameSite=Lax";
    setSuccess(true);
  };

  const fillDemoAccount = () => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setMessage("");
    setSuccess(false);
  };

  return <main className="login-shell">
    <section className="login-story" aria-label="Tentang Rayain">
      <Link className="login-brand" href="/"><span className="login-brand-mark">♡</span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></Link>
      <div className="login-story-copy"><span className="login-kicker">RAYAIN YOUR MOMENT</span><h1>Setiap cerita punya ruang untuk pulang.</h1><p>Masuk untuk melanjutkan undangan, menyusun detail momen, dan membagikannya kepada orang-orang tersayang.</p></div>
      <div className="login-story-card"><span className="login-story-card-mark">✦</span><div><span>“</span><p>Momen kecil terasa lebih berarti ketika dirayakan bersama.</p><small>— catatan dari ruang Rayain</small></div></div>
      <div className="login-art" aria-hidden="true"><span className="login-art-orbit login-art-orbit-one" /><span className="login-art-orbit login-art-orbit-two" /><span className="login-art-flower login-art-flower-one">✽</span><span className="login-art-flower login-art-flower-two">✦</span><div className="login-art-card"><span>your story</span><strong>starts here</strong><i>♡</i></div></div>
      <span className="login-story-foot">Rayain · ruang kecil untuk cerita yang besar</span>
    </section>

    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-panel-inner">
        <div className="login-mobile-brand"><span className="login-brand-mark">♡</span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></div>
        <span className="login-kicker">SELAMAT DATANG KEMBALI</span>
        <h2 id="login-title">Masuk ke ruang ceritamu.</h2>
        <p className="login-intro">Lanjutkan membuat momen yang terasa personal, hangat, dan siap dibagikan.</p>
        {success ? <div className="login-success" role="status"><span className="login-success-icon">✓</span><div><strong>Selamat datang, Sarah.</strong><p>Kamu berhasil masuk ke workspace demo Rayain.</p><Link className="login-submit login-success-link" href={returnPath}>Buka workspace demo <span>→</span></Link></div></div> : <form className="login-form" onSubmit={submitLogin}>
          <label className="login-field">Email<div className="login-input-wrap"><span aria-hidden="true">@</span><input aria-label="Email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setMessage(""); }} placeholder="nama@email.com" required /></div></label>
          <label className="login-field">Kata sandi<div className="login-input-wrap"><span aria-hidden="true">✦</span><input aria-label="Kata sandi" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setMessage(""); }} placeholder="Masukkan kata sandi" required /><button className="login-password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPassword ? "Sembunyikan" : "Lihat"}</button></div></label>
          <div className="login-form-meta"><label className="login-remember"><input type="checkbox" /> <span>Ingat saya</span></label><Link className="login-text-button" href="/forgot-password">Lupa kata sandi?</Link></div>
          {message ? <p className="login-error" role="alert">{message}</p> : null}
          <button className="login-submit" type="submit">Masuk ke workspace <span>→</span></button>
        </form>}
        {!success ? <div className="login-demo-note"><span>✦</span><p><strong>Akun demo siap dicoba</strong><small>{demoEmail} · {demoPassword}</small></p><button type="button" onClick={fillDemoAccount}>Isi otomatis</button></div> : null}
        {!success ? <div className="login-divider"><span>atau</span></div> : null}
        {!success ? <p className="login-register">Belum punya akun? <button className="login-text-button" type="button" onClick={() => setMessage("Pendaftaran akan tersedia pada modul berikutnya.")}>Daftar sekarang</button></p> : null}
        <p className="login-legal">Dengan masuk, kamu menyetujui <button className="login-text-button" type="button">Syarat penggunaan</button> dan <button className="login-text-button" type="button">Kebijakan privasi</button> Rayain.</p>
      </div>
    </section>
  </main>;
}
