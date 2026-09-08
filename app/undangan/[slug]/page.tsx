"use client";

import { useState } from "react";

type InviteIconName =
  | "arrow-down"
  | "arrow-right"
  | "calendar"
  | "check"
  | "clock"
  | "heart"
  | "map"
  | "music"
  | "play"
  | "sparkle"
  | "users";
type Attendance = "Hadir" | "Tidak hadir" | "Masih ragu";

const event = {
  couple: "Alya & Reza",
  date: "12 Oktober 2026",
  time: "10.00 WIB",
  location: "The Alana Hotel, Yogyakarta",
  address: "Jl. Palagan Tentara Pelajar No. 99, Yogyakarta",
  story:
    "Dua langkah yang bertemu di waktu yang tepat. Kami ingin merayakan awal perjalanan baru ini bersama orang-orang yang membuat cerita kami terasa berarti.",
};

function InviteIcon({
  name,
  size = 18,
}: {
  name: InviteIconName;
  size?: number;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
  };
  const paths: Record<InviteIconName, React.ReactNode> = {
    "arrow-down": <path {...common} d="M12 4v16m-6-6 6 6 6-6" />,
    "arrow-right": <path {...common} d="M5 12h14m-6-6 6 6-6 6" />,
    calendar: (
      <>
        <rect {...common} x="3.5" y="5" width="17" height="16" rx="2" />
        <path {...common} d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17" />
      </>
    ),
    check: <path {...common} d="m5 12 4.3 4.3L19 6.7" />,
    clock: (
      <>
        <circle {...common} cx="12" cy="12" r="8.5" />
        <path {...common} d="M12 7v5l3.2 2" />
      </>
    ),
    heart: (
      <path
        {...common}
        d="M20.8 8.9c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.9Z"
      />
    ),
    map: (
      <>
        <path {...common} d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle {...common} cx="12" cy="10" r="2" />
      </>
    ),
    music: (
      <>
        <path {...common} d="M9 18V5l10-2v13" />
        <circle {...common} cx="6" cy="18" r="3" />
        <circle {...common} cx="16" cy="16" r="3" />
      </>
    ),
    play: <path {...common} d="m8 5 11 7-11 7V5Z" />,
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
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function EventDetail({
  icon,
  label,
  children,
}: {
  icon: InviteIconName;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="public-event-detail">
      <span className="public-detail-icon">
        <InviteIcon name={icon} size={18} />
      </span>
      <span>
        <small>{label}</small>
        <strong>{children}</strong>
      </span>
    </div>
  );
}

export default function PublicInvitationPage() {
  const [opened, setOpened] = useState(false);
  const [attendance, setAttendance] = useState<Attendance | "">("");
  const [guestName, setGuestName] = useState("");
  const [guestTotal, setGuestTotal] = useState("1");
  const [guestNote, setGuestNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitRsvp = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!guestName.trim() || !attendance) return;
    setSubmitted(true);
  };

  return (
    <main
      className={`public-invitation ${opened ? "public-invitation-open" : ""}`}
    >
      <section className="public-cover" aria-labelledby="invitation-title">
        <div className="public-cover-orbit public-cover-orbit-one" />
        <div className="public-cover-orbit public-cover-orbit-two" />
        <span className="public-cover-flower public-cover-flower-one">✽</span>
        <span className="public-cover-flower public-cover-flower-two">✦</span>
        <div className="public-cover-content">
          <span className="public-cover-kicker">THE BEGINNING OF</span>
          <h1 id="invitation-title">
            A <i>&amp;</i> R
          </h1>
          <span className="public-cover-subtitle">
            We&apos;re getting married
          </span>
          <span className="public-cover-date">12 . 10 . 2026</span>
          <p>
            Dengan penuh sukacita,
            <br />
            kami mengundangmu.
          </p>
          <button
            className="public-open-button"
            type="button"
            onClick={() => setOpened(true)}
          >
            Buka undangan <InviteIcon name="arrow-down" size={15} />
          </button>
        </div>
        <span className="public-cover-footer">
          Alya &amp; Reza · Yogyakarta
        </span>
      </section>
      <div className="public-page-content">
        <header className="public-mini-header">
          <span className="public-mini-mark">
            <InviteIcon name="heart" size={14} />
          </span>
          <span>Alya &amp; Reza</span>
          <button
            type="button"
            aria-label="Putar musik undangan"
            onClick={() => undefined}
          >
            <InviteIcon name="music" size={15} /> Musik
          </button>
        </header>
        <section className="public-hero">
          <span className="public-section-kicker">
            12 OKTOBER 2026 · YOGYAKARTA
          </span>
          <h2>
            Hari yang kami
            <br />
            <i>tunggu-tunggu.</i>
          </h2>
          <p>Terima kasih sudah menjadi bagian dari cerita kami.</p>
          <span className="public-scroll-mark">
            <InviteIcon name="arrow-down" size={15} />
          </span>
        </section>
        <section className="public-details-section">
          <div className="public-section-heading">
            <span className="public-section-kicker">SAVE THE DATE</span>
            <h2>Satu hari, satu cerita.</h2>
            <p>Catat tanggalnya dan mari rayakan bersama.</p>
          </div>
          <div className="public-event-details">
            <EventDetail icon="calendar" label="Tanggal">
              Minggu, {event.date}
            </EventDetail>
            <EventDetail icon="clock" label="Waktu">
              {event.time} sampai selesai
            </EventDetail>
            <EventDetail icon="map" label="Lokasi">
              {event.location}
            </EventDetail>
          </div>
          <button
            className="public-location-button"
            type="button"
            onClick={() => undefined}
          >
            <InviteIcon name="map" size={15} /> Lihat lokasi{" "}
            <InviteIcon name="arrow-right" size={14} />
          </button>
        </section>
        <section className="public-story-section">
          <div className="public-story-art" aria-hidden="true">
            <span className="public-story-orbit" />
            <span className="public-story-flower">✽</span>
            <div>
              <InviteIcon name="heart" size={21} />
              <small>our story</small>
            </div>
          </div>
          <div className="public-story-copy">
            <span className="public-section-kicker">A LITTLE NOTE</span>
            <h2>
              Karena momen indah
              <br />
              lebih berarti saat <i>dibagi.</i>
            </h2>
            <p>{event.story}</p>
            <span className="public-signature">
              with love,
              <br />
              <strong>Alya &amp; Reza</strong>
            </span>
          </div>
        </section>
        <section className="public-rsvp-section" id="rsvp">
          <div className="public-section-heading">
            <span className="public-section-kicker">KONFIRMASI KEHADIRAN</span>
            <h2>Will you join us?</h2>
            <p>Beri tahu kami apakah kamu bisa hadir di hari bahagia ini.</p>
          </div>
          {submitted ? (
            <div className="public-rsvp-success" role="status">
              <span>
                <InviteIcon name="check" size={20} />
              </span>
              <h3>Terima kasih, {guestName}.</h3>
              <div className="public-rsvp-success-meta">
                <span>{attendance}</span>
                <span>{guestTotal} orang</span>
              </div>
              <p>
                {attendance === "Hadir"
                  ? "Kami mencatat kehadiranmu. Sampai bertemu di Yogyakarta!"
                  : attendance === "Tidak hadir"
                    ? "Terima kasih sudah memberi kabar. Kami akan merindukanmu di hari bahagia ini."
                    : "Terima kasih sudah memberi kabar. Kami menantikan kabar selanjutnya darimu."}
              </p>
              <button type="button" onClick={() => setSubmitted(false)}>
                Ubah konfirmasi
              </button>
            </div>
          ) : (
            <form className="public-rsvp-form" onSubmit={submitRsvp}>
              <label htmlFor="guest-name">
                Nama kamu
                <input
                  id="guest-name"
                  value={guestName}
                  onChange={(formEvent) => setGuestName(formEvent.target.value)}
                  placeholder="Tulis nama lengkap"
                  required
                />
              </label>
              <fieldset>
                <legend>Apakah kamu akan hadir?</legend>
                <div className="attendance-options">
                  {(["Hadir", "Tidak hadir", "Masih ragu"] as Attendance[]).map(
                    (option) => (
                      <button
                        className={
                          attendance === option ? "attendance-active" : ""
                        }
                        type="button"
                        key={option}
                        aria-pressed={attendance === option}
                        onClick={() => setAttendance(option)}
                      >
                        <span>
                          {attendance === option ? (
                            <InviteIcon name="check" size={13} />
                          ) : null}
                        </span>
                        {option}
                      </button>
                    ),
                  )}
                </div>
              </fieldset>
              <label htmlFor="guest-total">
                Jumlah tamu
                <select
                  id="guest-total"
                  value={guestTotal}
                  onChange={(formEvent) =>
                    setGuestTotal(formEvent.target.value)
                  }
                >
                  <option value="1">1 orang</option>
                  <option value="2">2 orang</option>
                  <option value="3">3 orang</option>
                  <option value="4">4 orang</option>
                </select>
              </label>
              <label htmlFor="guest-note">
                Pesan untuk kami{" "}
                <textarea
                  id="guest-note"
                  value={guestNote}
                  onChange={(formEvent) => setGuestNote(formEvent.target.value)}
                  placeholder="Tulis doa atau pesan singkat (opsional)"
                  rows={3}
                />
              </label>
              <button
                className="public-rsvp-submit"
                type="submit"
                disabled={!guestName.trim() || !attendance}
              >
                Kirim konfirmasi <InviteIcon name="arrow-right" size={15} />
              </button>
              <small className="public-rsvp-note">
                <InviteIcon name="sparkle" size={13} /> Data contoh — konfirmasi
                belum tersimpan ke server.
              </small>
            </form>
          )}
        </section>
        <footer className="public-footer">
          <span className="public-footer-mark">
            <InviteIcon name="heart" size={14} />
          </span>
          <p>
            Dibuat dengan hangat oleh <strong>rayain</strong>
          </p>
        </footer>
      </div>
    </main>
  );
}
