import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaGithub, FaEnvelope } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-[#1E3358]/40 bg-[#040A14]/80 backdrop-blur-sm font-montserrat overflow-hidden">
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* ── Desktop: 3-column grid ── */}
        <div className="hidden sm:grid grid-cols-3 gap-8 items-start">

          {/* Group 1 — Brand */}
          <div className="flex flex-col gap-2">
            <Link
              to="/breathing"
              className="flex items-center gap-2 group w-fit"
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #7AC4FF, #1A5FCC 70%)',
                  boxShadow: '0 0 8px rgba(74,158,255,0.3)',
                }}
              />
              <span className="text-[#BCDDFF] text-sm font-medium group-hover:text-white transition-colors tracking-wide">
                Breathe
              </span>
            </Link>
            <p className="text-[#3D5A7A] text-xs leading-relaxed max-w-[180px]">
              {t("footer.tagline")}
            </p>
            <span className="text-[#3D6080] text-[10px] tracking-wide mt-1 select-none">
              © {year} · {t("footer.rights")}
            </span>
          </div>

          {/* Group 2 — Pages */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#4A7AAA] mb-1">Navigate</span>
            {[
              { to: '/home-page', label: t('nav.home') },
              { to: '/breathing', label: t('nav.meditate') },
              { to: '/music-library', label: t('nav.sounds') },
              { to: '/community', label: t('nav.community') },
              { to: '/sessions', label: t('nav.sessions') },
              { to: '/statistics', label: t('nav.progress') },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-[#4A7AAA] text-xs hover:text-[#7AC4FF] transition-colors w-fit relative group"
              >
                <span className="absolute -bottom-px left-0 w-0 h-px bg-[#4A9EFF]/40 group-hover:w-full transition-all duration-200" />
                {label}
              </Link>
            ))}
          </div>

          {/* Group 3 — Support + Socials */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#4A7AAA] mb-1">Support</span>
            {[
              { to: '/faq', label: t('footer.faq') },
              { to: '/support', label: t('footer.contact') },
              { to: '/sessions', label: t('nav.sessions') },
              { to: '/support', label: t('footer.privacy') },
            ].map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className="text-[#4A7AAA] text-xs hover:text-[#7AC4FF] transition-colors w-fit relative group"
              >
                <span className="absolute -bottom-px left-0 w-0 h-px bg-[#4A9EFF]/40 group-hover:w-full transition-all duration-200" />
                {label}
              </Link>
            ))}

            {/* Socials */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A7AAA] hover:text-[#7AC4FF] transition-colors hover:scale-110 transform duration-200"
                aria-label="Instagram"
              >
                <FaInstagram size={14} />
              </a>
              <a
                href="https://github.com/SenatorBLOG/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A7AAA] hover:text-[#7AC4FF] transition-colors hover:scale-110 transform duration-200"
                aria-label="GitHub"
              >
                <FaGithub size={14} />
              </a>
              <a
                href="mailto:support@breatheapp.com"
                className="text-[#4A7AAA] hover:text-[#7AC4FF] transition-colors hover:scale-110 transform duration-200"
                aria-label="Email"
              >
                <FaEnvelope size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Mobile layout ── */}
        <div className="flex sm:hidden flex-col gap-5">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <Link to="/breathing" className="flex items-center gap-2 group">
              <div
                className="w-5 h-5 rounded-full"
                style={{ background: 'radial-gradient(circle at 35% 35%, #7AC4FF, #1A5FCC 70%)', boxShadow: '0 0 8px rgba(74,158,255,0.3)' }}
              />
              <span className="text-[#BCDDFF] text-sm font-medium group-hover:text-white transition-colors">Breathe</span>
            </Link>
            {/* Socials inline on mobile */}
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-[#4A7AAA] hover:text-[#7AC4FF] transition-colors"><FaInstagram size={14} /></a>
              <a href="https://github.com/SenatorBLOG/" target="_blank" rel="noopener noreferrer" className="text-[#4A7AAA] hover:text-[#7AC4FF] transition-colors"><FaGithub size={14} /></a>
              <a href="mailto:support@breatheapp.com" className="text-[#4A7AAA] hover:text-[#7AC4FF] transition-colors"><FaEnvelope size={14} /></a>
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/home-page', label: t('nav.home') },
              { to: '/faq', label: t('footer.faq') },
              { to: '/breathing', label: t('nav.meditate') },
              { to: '/community', label: t('nav.community') },
              { to: '/music-library', label: t('nav.sounds') },
              { to: '/sessions', label: t('nav.sessions') },
            ].map(({ to, label }) => (
              <Link key={label} to={to} className="text-[#4A7AAA] text-xs hover:text-[#7AC4FF] transition-colors py-0.5">
                {label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <span className="text-[#3D6080] text-[10px] tracking-wide select-none">
            © {year} Breathe · {t("footer.rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}