"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const queryEmail = new URLSearchParams(window.location.search).get("email");
    if (queryEmail) setEmail(queryEmail);
  }, []);

  const submitReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    if (!email.includes("@")) {
      setMessage("Masukkan email yang valid untuk melanjutkan.");
      return;
    }
    if (password.length < 8) {
      setMessage("Kata sandi baru perlu memiliki minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setMessage("Konfirmasi kata sandi belum sama.");
      return;
    }
    setSuccess(true);
  };

  return <main className="login-shell reset-shell">
    <section className="login-story" aria-label="Tentang Rayain">
      <Link className="login-brand" href="/"><span className="login-brand-mark">♡</span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></Link>
      <div className="login-story-copy"><span className="login-kicker">RUANG AMAN UNTUK CERITA</span><h1>Mulai lagi dengan rasa yang tetap sama.</h1><p>Atur kata sandi baru dan kembali ke semua undangan yang sedang kamu siapkan untuk orang tersayang.</p></div>
      <div className="login-story-card"><span className="login-story-card-mark">✦</span><div><span>“</span><p>Yang penting bukan pernah lupa, tapi selalu punya jalan untuk kembali.</p><small>— catatan dari ruang Rayain</small></div></div>
      <div className="login-art" aria-hidden="true"><span className="login-art-orbit login-art-orbit-one" /><span className="login-art-orbit login-art-orbit-two" /><span className="login-art-flower login-art-flower-one">✽</span><span className="login-art-flower login-art-flower-two">✦</span><div className="login-art-card"><span>new chapter</span><strong>starts here</strong><i>♡</i></div></div>
      <span className="login-story-foot">Rayain · ruang kecil untuk cerita yang besar</span>
    </section>

    <section className="login-panel" aria-labelledby="reset-title">
      <div className="login-panel-inner reset-panel-inner">
        <div className="login-mobile-brand"><span className="login-brand-mark">♡</span><span><strong>rayain</strong><small>UNDANGAN DIGITAL</small></span></div>
        <span className="login-kicker">SATU LANGKAH LAGI</span>
        <h2 id="reset-title">Buat kata sandi baru.</h2>
        <p className="login-intro">Pilih kata sandi baru yang mudah kamu ingat dan hanya kamu yang tahu.</p>
        {success ? <div className="login-success reset-success" role="status"><span className="login-success-icon">✓</span><div><strong>Kata sandi berhasil diatur.</strong><p>Workspace demo kamu sudah siap digunakan kembali.</p><Link className="login-submit login-success-link" href="/login">Kembali ke halaman masuk <span>→</span></Link></div></div> : <form className="login-form reset-form" onSubmit={submitReset}>
          <label className="login-field">Email akun<div className="login-input-wrap"><span aria-hidden="true">@</span><input aria-label="Email akun" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setMessage(""); }} placeholder="nama@email.com" required /></div></label>
          <label className="login-field">Kata sandi baru<div className="login-input-wrap"><span aria-hidden="true">✦</span><input aria-label="Kata sandi baru" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setMessage(""); }} placeholder="Min. 8 karakter" required /><button className="login-password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan kata sandi baru" : "Tampilkan kata sandi baru"}>{showPassword ? "Sembunyikan" : "Lihat"}</button></div></label>
          <label className="login-field">Ulangi kata sandi<div className="login-input-wrap"><span aria-hidden="true">✦</span><input aria-label="Ulangi kata sandi" type={showConfirmation ? "text" : "password"} autoComplete="new-password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setMessage(""); }} placeholder="Ulangi kata sandi" required /><button className="login-password-toggle" type="button" onClick={() => setShowConfirmation((value) => !value)} aria-label={showConfirmation ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}>{showConfirmation ? "Sembunyikan" : "Lihat"}</button></div></label>
          {message ? <p className="login-error" role="alert">{message}</p> : null}
          <button className="login-submit" type="submit">Simpan kata sandi baru <span>→</span></button>
        </form>}
        {!success ? <Link className="login-back-link" href="/login"><span>←</span> Kembali ke halaman masuk</Link> : null}
        <p className="login-legal reset-legal">Ini adalah simulasi frontend. Tidak ada email atau kata sandi yang disimpan.</p>
      </div>
    </section>
  </main>;
}
