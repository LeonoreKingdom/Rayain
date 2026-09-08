"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submitReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSent(false);
    if (!email.includes("@")) {
      setMessage("Masukkan alamat email yang valid untuk menerima tautan reset.");
      return;
    }
    setSent(true);
  };

  return <main className="login-shell forgot-shell">
    <section className="login-story" aria-label="Tentang Rayain">
      <Link className="login-brand" href="/"><span className="login-brand-mark">♡</span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></Link>
      <div className="login-story-copy"><span className="login-kicker">SELALU ADA JALAN PULANG</span><h1>Ceritamu tetap aman bersama kami.</h1><p>Jangan khawatir kalau lupa kata sandi. Kami akan membantu kamu kembali ke ruang yang menyimpan semua momenmu.</p></div>
      <div className="login-story-card"><span className="login-story-card-mark">↺</span><div><span>“</span><p>Hal-hal penting layak punya tempat yang aman untuk kembali.</p><small>— catatan dari ruang Rayain</small></div></div>
      <div className="login-art" aria-hidden="true"><span className="login-art-orbit login-art-orbit-one" /><span className="login-art-orbit login-art-orbit-two" /><span className="login-art-flower login-art-flower-one">✽</span><span className="login-art-flower login-art-flower-two">✦</span><div className="login-art-card"><span>come back to</span><strong>your story</strong><i>♡</i></div></div>
      <span className="login-story-foot">Rayain · ruang kecil untuk cerita yang besar</span>
    </section>

    <section className="login-panel" aria-labelledby="forgot-title">
      <div className="login-panel-inner forgot-panel-inner">
        <div className="login-mobile-brand"><span className="login-brand-mark">♡</span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></div>
        <span className="login-kicker">BANTU KEMBALI MASUK</span>
        <h2 id="forgot-title">Lupa kata sandi?</h2>
        <p className="login-intro">Masukkan email yang kamu gunakan untuk membuat akun. Kami akan mengirimkan tautan untuk mengatur ulang kata sandimu.</p>
        {sent ? <div className="login-success forgot-success" role="status"><span className="login-success-icon">✓</span><div><strong>Tautan reset siap dikirim.</strong><p>Dalam versi demo, tautan pemulihan untuk <b>{email}</b> sudah disiapkan.</p><div className="forgot-success-actions"><Link className="login-submit login-success-link" href={`/reset-password?email=${encodeURIComponent(email)}`}>Atur kata sandi baru <span>→</span></Link><Link className="login-back-link" href="/login">Kembali ke halaman masuk</Link></div></div></div> : <form className="login-form forgot-form" onSubmit={submitReset}>
          <label className="login-field">Email akun<div className="login-input-wrap"><span aria-hidden="true">@</span><input aria-label="Email akun" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setMessage(""); }} placeholder="nama@email.com" required /></div></label>
          {message ? <p className="login-error" role="alert">{message}</p> : null}
          <button className="login-submit" type="submit">Kirim tautan reset <span>→</span></button>
        </form>}
        {!sent ? <Link className="login-back-link" href="/login"><span>←</span> Kembali ke halaman masuk</Link> : null}
        <p className="login-legal forgot-legal">Belum ada email yang terkirim. Ini adalah simulasi frontend untuk alur pemulihan akun.</p>
      </div>
    </section>
  </main>;
}
