import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaGithub, FaEnvelope } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useTheme, THEME_META } from "../contexts/ThemeContext";
import { useThemeStyles } from "../hooks/useThemeStyles";

export default function Footer() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const ts = useThemeStyles();
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Site footer"
      className="relative w-full border-t backdrop-blur-md overflow-hidden"
      style={{ borderColor: ts.border, background: `${ts.navBg}CC` }}
    >
      {/* Glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${ts.accentLight}4D, transparent)`,
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Desktop ── */}
        <div className="hidden sm:grid grid-cols-3 gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link to="/breathing" className="flex items-center gap-2 group w-fit">
              <div
                className="w-6 h-6 rounded-full transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${ts.accentLight}, ${ts.accent} 70%)`,
                  boxShadow: `0 0 18px ${ts.accent}55`,
                }}
              />
              <span
                className="t-body font-medium tracking-wide transition-colors group-hover:opacity-100 opacity-90"
                style={{ color: ts.textPrimary }}
              >
                Breathe
              </span>
            </Link>

            <p className="t-caption leading-relaxed max-w-[220px]" style={{ color: ts.textMuted }}>
              {t("footer.tagline")}
            </p>

            <span className="t-caption" style={{ color: ts.textDim }}>
              © {year} · {t("footer.rights")}
            </span>

            {/* Theme indicator */}
            <span className="t-caption mt-1" style={{ color: ts.textDim }}>
              {THEME_META[theme].icon} {THEME_META[theme].label}
            </span>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <span
              className="t-label"
              style={{ color: ts.textMuted }}
            >
              Navigate
            </span>

            {[
              { to: "/",    label: t("nav.home") },
              { to: "/breathing",    label: t("nav.meditate") },
              { to: "/music-library",label: t("nav.sounds") },
              { to: "/community",    label: t("nav.community") },
              { to: "/sessions",     label: t("nav.sessions") },
              { to: "/statistics",   label: t("nav.progress") },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="relative t-body transition-colors group w-fit"
                style={{ color: ts.textSecondary }}
              >
                {label}
                <span
                  className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                  style={{ background: `${ts.accent}99` }}
                />
              </Link>
            ))}
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <span
              className="t-label"
              style={{ color: ts.textMuted }}
            >
              Support
            </span>

            {[
              { to: "/faq",     label: t("footer.faq") },
              { to: "/support", label: t("footer.contact") },
              { to: "/privacy", label: t("footer.privacy") },
            ].map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className="relative t-body transition-colors group w-fit"
                style={{ color: ts.textSecondary }}
              >
                {label}
                <span
                  className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                  style={{ background: `${ts.accent}99` }}
                />
              </Link>
            ))}

            {/* Social */}
            <div className="flex items-center gap-4 mt-3">
              <a
                href="https://instagram.com/breatheonline.app/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Breathe on Instagram"
                className="transition-all duration-200 hover:scale-110"
                style={{ color: ts.textMuted }}
                onMouseEnter={e => (e.currentTarget.style.color = ts.accentLight)}
                onMouseLeave={e => (e.currentTarget.style.color = ts.textMuted)}
              >
                <FaInstagram size={15} />
              </a>
              <a
                href="https://github.com/SenatorBLOG/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Breathe on GitHub"
                className="transition-all duration-200 hover:scale-110"
                style={{ color: ts.textMuted }}
                onMouseEnter={e => (e.currentTarget.style.color = ts.accentLight)}
                onMouseLeave={e => (e.currentTarget.style.color = ts.textMuted)}
              >
                <FaGithub size={15} />
              </a>
              <a
                href="mailto:support@breatheonline.app"
                aria-label="Email support"
                className="transition-all duration-200 hover:scale-110"
                style={{ color: ts.textMuted }}
                onMouseEnter={e => (e.currentTarget.style.color = ts.accentLight)}
                onMouseLeave={e => (e.currentTarget.style.color = ts.textMuted)}
              >
                <FaEnvelope size={15} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="flex sm:hidden flex-col gap-6">

          {/* Top */}
          <div className="flex items-center justify-between">
            <Link to="/breathing" className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${ts.accentLight}, ${ts.accent} 70%)`,
                }}
              />
              <span className="t-body" style={{ color: ts.textPrimary }}>Breathe</span>
            </Link>

            <div className="flex gap-4">
              <a href="https://instagram.com/breatheonline.app/" target="_blank" rel="noopener noreferrer" aria-label="Breathe on Instagram" style={{ color: ts.textMuted }}><FaInstagram size={14} /></a>
              <a href="https://github.com/SenatorBLOG/" target="_blank" rel="noopener noreferrer" aria-label="Breathe on GitHub" style={{ color: ts.textMuted }}><FaGithub size={14} /></a>
              <a href="mailto:support@breatheonline.app" aria-label="Email support" style={{ color: ts.textMuted }}><FaEnvelope size={14} /></a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: "/",    label: t("nav.home") },
              { to: "/breathing",    label: t("nav.meditate") },
              { to: "/music-library",label: t("nav.sounds") },
              { to: "/community",    label: t("nav.community") },
              { to: "/sessions",     label: t("nav.sessions") },
              { to: "/faq",          label: t("footer.faq") },
            ].map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className="t-caption transition-colors"
                style={{ color: ts.textSecondary }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Bottom */}
          <span className="t-label" style={{ color: ts.textDim }}>
            © {year} Breathe · {t("footer.rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
