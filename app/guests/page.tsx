"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type GuestIconName =
  | "arrow-left"
  | "arrow-right"
  | "calendar"
  | "check"
  | "chevron-down"
  | "clock"
  | "edit"
  | "external"
  | "heart"
  | "home"
  | "layout"
  | "menu"
  | "more"
  | "search"
  | "sparkle"
  | "users"
  | "whatsapp";
type RSVPStatus = "Hadir" | "Tidak hadir" | "Masih ragu" | "Belum menjawab";
type StatusFilter = "Semua" | RSVPStatus;

const guestRows: {
  id: string;
  name: string;
  phone: string;
  party: number;
  status: RSVPStatus;
  updated: string;
}[] = [
  {
    id: "rani",
    name: "Rani Kusuma",
    phone: "+62 812-4455-9012",
    party: 2,
    status: "Hadir",
    updated: "Dikonfirmasi 12 menit lalu",
  },
  {
    id: "dimas",
    name: "Dimas Pratama",
    phone: "+62 813-7788-1023",
    party: 1,
    status: "Hadir",
    updated: "Dikonfirmasi 1 jam lalu",
  },
  {
    id: "sinta",
    name: "Sinta Maharani",
    phone: "+62 852-1102-8741",
    party: 1,
    status: "Masih ragu",
    updated: "Diperbarui kemarin",
  },
  {
    id: "bagus",
    name: "Bagus Santoso",
    phone: "+62 821-6654-3308",
    party: 0,
    status: "Tidak hadir",
    updated: "Dikonfirmasi kemarin",
  },
  {
    id: "naya",
    name: "Naya & Fajar",
    phone: "+62 878-9012-3344",
    party: 2,
    status: "Hadir",
    updated: "Dikonfirmasi 2 hari lalu",
  },
  {
    id: "ibu-rina",
    name: "Ibu Rina",
    phone: "+62 811-2040-7788",
    party: 1,
    status: "Belum menjawab",
    updated: "Belum ada respons",
  },
  {
    id: "kevin",
    name: "Kevin Wijaya",
    phone: "+62 857-3310-6521",
    party: 1,
    status: "Hadir",
    updated: "Dikonfirmasi 3 hari lalu",
  },
  {
    id: "mira",
    name: "Mira Anjani",
    phone: "+62 856-9942-1170",
    party: 0,
    status: "Tidak hadir",
    updated: "Dikonfirmasi 4 hari lalu",
  },
];

function GuestIcon({
  name,
  size = 17,
}: {
  name: GuestIconName;
  size?: number;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };
  const paths: Record<GuestIconName, React.ReactNode> = {
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
    edit: (
      <>
        <path {...common} d="M4 20h4l10.8-10.8a2.1 2.1 0 0 0-3-3L5 17v3Z" />
        <path {...common} d="m14.5 7.5 3 3" />
      </>
    ),
    external: (
      <>
        <path {...common} d="M13 5h6v6M19 5l-8 8" />
        <path {...common} d="M18 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3" />
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
    menu: (
      <>
        <path {...common} d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1.2" fill="currentColor" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        <circle cx="19" cy="12" r="1.2" fill="currentColor" />
      </>
    ),
    search: (
      <>
        <circle {...common} cx="10.8" cy="10.8" r="6.8" />
        <path {...common} d="m16 16 4.5 4.5" />
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

function RSVPStatusBadge({ status }: { status: RSVPStatus }) {
  const className =
    status === "Hadir"
      ? "rsvp-status-hadir"
      : status === "Tidak hadir"
        ? "rsvp-status-tidak"
        : status === "Masih ragu"
          ? "rsvp-status-ragu"
          : "rsvp-status-belum";
  return (
    <span className={`rsvp-status ${className}`}>
      <i />
      {status}
    </span>
  );
}

export default function GuestsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("Semua");
  const [toast, setToast] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredGuests = useMemo(
    () =>
      guestRows.filter((guest) => {
        const matchesStatus = filter === "Semua" || guest.status === filter;
        const matchesQuery =
          !normalizedQuery ||
          `${guest.name} ${guest.phone}`
            .toLowerCase()
            .includes(normalizedQuery);
        return matchesStatus && matchesQuery;
      }),
    [filter, normalizedQuery],
  );
  const showToast = (message: string) => setToast(message);
  const statusCount = (status: RSVPStatus) =>
    guestRows.filter((guest) => guest.status === status).length;

  return (
    <div className="guests-shell">
      <aside className="guests-sidebar">
        <div className="brand guests-brand">
          <span className="brand-mark">
            <GuestIcon name="heart" size={19} />
          </span>
          <span>
            <strong>rayain</strong>
            <small>UNDANGAN DIGITAL</small>
          </span>
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          <Link className="nav-item" href="/">
            <GuestIcon name="home" size={18} />
            <span>Dasbor</span>
          </Link>
          <Link className="nav-item" href="/#invitations">
            <GuestIcon name="layout" size={18} />
            <span>Undangan saya</span>
          </Link>
          <Link className="nav-item" href="/studio">
            <GuestIcon name="layout" size={18} />
            <span>Template</span>
          </Link>
          <Link className="nav-item nav-item-active" href="/guests">
            <GuestIcon name="users" size={18} />
            <span>Tamu &amp; RSVP</span>
            <span className="nav-count">{guestRows.length}</span>
          </Link>
        </nav>
        <div className="sidebar-label sidebar-label-spaced">Kelola</div>
        <nav className="sidebar-nav">
          <Link className="nav-item" href="/share">
            <GuestIcon name="whatsapp" size={18} />
            <span>Sebar undangan</span>
          </Link>
          <Link className="nav-item" href="/guests/settings">
            <GuestIcon name="more" size={18} />
            <span>Pengaturan RSVP</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">
              <GuestIcon name="sparkle" size={16} />
            </span>
            <p>
              <strong>Dengar kabar mereka.</strong>
              <br />
              Setiap respons berarti.
            </p>
          </div>
          <Link className="profile-card" href="/profile">
            <span className="avatar avatar-small">SA</span>
            <span className="profile-copy">
              <strong>Sarah Anindita</strong>
              <small>sarah@rayain.id</small>
            </span>
            <GuestIcon name="more" size={17} />
          </Link>
        </div>
      </aside>
      <main className="guests-main">
        <header className="guests-topbar">
          <Link className="guests-back" href="/">
            <GuestIcon name="arrow-left" size={16} /> Kembali ke dasbor
          </Link>
          <div className="guests-brand-center">
            <span className="brand-mark">
              <GuestIcon name="heart" size={15} />
            </span>
            <strong>rayain</strong>
            <span>Tamu &amp; RSVP</span>
          </div>
          <div className="guests-top-actions">
            <span className="guests-save-state">
              <span /> Semua perubahan tersimpan
            </span>
            <button
              className="icon-button"
              type="button"
              aria-label="Menu halaman"
              onClick={() => showToast("Menu halaman siap dikembangkan.")}
            >
              <GuestIcon name="more" size={18} />
            </button>
            <span className="avatar">SA</span>
          </div>
        </header>
        <div className="guests-content">
          <section className="guests-heading">
            <div>
              <span className="section-kicker">GUEST MANAGEMENT</span>
              <h1>Tamu &amp; RSVP.</h1>
              <p>
                Pantau siapa yang akan hadir dan siapkan sambutan terbaik untuk
                mereka.
              </p>
            </div>
            <button
              className="add-guest-cta"
              type="button"
              onClick={() => showToast("Form tambah tamu siap dikembangkan.")}
            >
              <GuestIcon name="users" size={15} /> Tambah tamu
            </button>
          </section>
          <section className="guests-invitation-card">
            <div className="guests-invitation-cover">
              <span>the beginning of</span>
              <strong>
                A <i>&amp;</i> R
              </strong>
              <small>12 . 10 . 2026</small>
            </div>
            <div className="guests-invitation-copy">
              <span className="sample-label">UNDANGAN AKTIF</span>
              <h2>Alya &amp; Reza</h2>
              <p>
                <GuestIcon name="calendar" size={13} /> 12 Oktober 2026{" "}
                <span>·</span> The Alana Hotel, Yogyakarta
              </p>
            </div>
            <Link className="guests-view-invitation" href="/undangan/alya-reza">
              <GuestIcon name="external" size={14} /> Lihat undangan
            </Link>
          </section>
          <section className="guests-stats">
            <div>
              <span className="guests-stat-icon">
                <GuestIcon name="users" size={17} />
              </span>
              <span>
                <small>Total tamu</small>
                <strong>{guestRows.length}</strong>
              </span>
            </div>
            <div>
              <span className="guests-stat-icon guests-stat-icon-green">
                <GuestIcon name="check" size={17} />
              </span>
              <span>
                <small>Hadir</small>
                <strong>{statusCount("Hadir")}</strong>
              </span>
            </div>
            <div>
              <span className="guests-stat-icon guests-stat-icon-yellow">
                <GuestIcon name="clock" size={17} />
              </span>
              <span>
                <small>Masih menunggu</small>
                <strong>
                  {statusCount("Masih ragu") + statusCount("Belum menjawab")}
                </strong>
              </span>
            </div>
            <div>
              <span className="guests-stat-icon guests-stat-icon-gray">
                <GuestIcon name="heart" size={17} />
              </span>
              <span>
                <small>Tidak hadir</small>
                <strong>{statusCount("Tidak hadir")}</strong>
              </span>
            </div>
          </section>
          <section className="guests-list-card">
            <div className="guests-list-heading">
              <div>
                <span className="sample-label">DAFTAR KONFIRMASI</span>
                <h2>Respons tamu</h2>
                <p>
                  {filteredGuests.length} dari {guestRows.length} kontak
                  ditampilkan.
                </p>
              </div>
              <button
                className="guests-list-action"
                type="button"
                onClick={() =>
                  showToast("Ekspor daftar RSVP siap dikembangkan.")
                }
              >
                <GuestIcon name="arrow-right" size={13} /> Ekspor daftar
              </button>
            </div>
            <div className="guests-toolbar">
              <label className="guests-search">
                <GuestIcon name="search" size={15} />
                <input
                  type="search"
                  aria-label="Cari tamu"
                  placeholder="Cari nama atau nomor..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <div className="guests-filter">
                <GuestIcon name="chevron-down" size={13} />
                <select
                  aria-label="Filter status RSVP"
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as StatusFilter)
                  }
                >
                  <option>Semua</option>
                  <option>Hadir</option>
                  <option>Tidak hadir</option>
                  <option>Masih ragu</option>
                  <option>Belum menjawab</option>
                </select>
              </div>
            </div>
            <div
              className="rsvp-filter-pills"
              role="tablist"
              aria-label="Filter cepat RSVP"
            >
              {(
                [
                  "Semua",
                  "Hadir",
                  "Tidak hadir",
                  "Masih ragu",
                  "Belum menjawab",
                ] as StatusFilter[]
              ).map((status) => (
                <button
                  className={filter === status ? "rsvp-filter-active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={filter === status}
                  key={status}
                  onClick={() => setFilter(status)}
                >
                  {status}
                  <span>
                    {status === "Semua"
                      ? guestRows.length
                      : statusCount(status)}
                  </span>
                </button>
              ))}
            </div>
            {filteredGuests.length ? (
              <div
                className="rsvp-table"
                role="table"
                aria-label="Daftar konfirmasi tamu"
              >
                <div className="rsvp-table-head" role="row">
                  <span role="columnheader">Tamu</span>
                  <span role="columnheader">Jumlah</span>
                  <span role="columnheader">Status</span>
                  <span role="columnheader">Terakhir diperbarui</span>
                  <span />
                </div>
                {filteredGuests.map((guest) => (
                  <div className="rsvp-table-row" role="row" key={guest.id}>
                    <span className="rsvp-guest-cell" role="cell">
                      <span className="rsvp-guest-avatar">
                        {guest.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span>
                        <strong>{guest.name}</strong>
                        <small>{guest.phone}</small>
                      </span>
                    </span>
                    <span className="rsvp-party-cell" role="cell">
                      {guest.party
                        ? `${guest.party} ${guest.party === 1 ? "orang" : "orang"}`
                        : "—"}
                    </span>
                    <span role="cell">
                      <RSVPStatusBadge status={guest.status} />
                    </span>
                    <span className="rsvp-updated-cell" role="cell">
                      <GuestIcon name="clock" size={12} /> {guest.updated}
                    </span>
                    <button
                      className="rsvp-row-action"
                      type="button"
                      aria-label={`Edit RSVP ${guest.name}`}
                      onClick={() =>
                        showToast(`Edit RSVP ${guest.name} siap dikembangkan.`)
                      }
                    >
                      <GuestIcon name="edit" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="guests-empty">
                <span>
                  <GuestIcon name="search" size={19} />
                </span>
                <strong>Tamu tidak ditemukan</strong>
                <p>Coba kata kunci atau filter yang berbeda.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilter("Semua");
                  }}
                >
                  Reset pencarian
                </button>
              </div>
            )}
          </section>
          <div className="guests-bottom-note">
            <span>
              <GuestIcon name="sparkle" size={14} />
            </span>
            <p>
              Data RSVP ini masih berupa contoh dan belum tersimpan ke server.
            </p>
          </div>
        </div>
      </main>
      {toast ? (
        <div className="toast" role="status">
          <span className="toast-check">✓</span>
          {toast}
        </div>
      ) : null}
    </div>
  );
}
