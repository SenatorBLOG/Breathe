// src/pages/PrivacyPolicyPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { Shield, Database, Eye, Trash2, Lock, Globe, Mail, UserCheck } from 'lucide-react';

const LAST_UPDATED = 'March 23, 2026';

interface Section {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

function PolicySection({ icon, title, content }: Section) {
  const ts = useThemeStyles();
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${ts.accent}22`, border: `1px solid ${ts.accent}33` }}
        >
          {icon}
        </div>
        <h2 className="t-body font-semibold" style={{ color: ts.textPrimary }}>{title}</h2>
      </div>
      <div className="t-body leading-relaxed flex flex-col gap-3" style={{ color: ts.textMuted }}>
        {content}
      </div>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  const ts = useThemeStyles();
  return (
    <li className="flex gap-2 items-start">
      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: ts.accent }} />
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPolicyPage() {
  const ts = useThemeStyles();

  const sections: Section[] = [
    {
      icon: <Database size={16} style={{ color: ts.accentLight }} />,
      title: 'Information We Collect',
      content: (
        <>
          <p>We collect only what is necessary to provide Breathe's features:</p>
          <ul className="flex flex-col gap-1.5 mt-1">
            <Li><strong style={{ color: ts.textPrimary }}>Account data</strong> — email address and display name, provided voluntarily when you sign up. Google OAuth provides only your name and email.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>Session data</strong> — breathing technique used, session duration, phase timings, and optional notes you write.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>Biometric data (opt-in)</strong> — heart rate readings from your device, collected only with your explicit consent via the Data Consent screen.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>Globe pins</strong> — latitude, longitude, and optional public message if you choose to drop a pin on the community globe.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>Usage data</strong> — anonymous analytics such as page views and feature interactions. No personally identifiable information is attached.</Li>
          </ul>
          <p>You can use all core breathing features without creating an account. Account creation is optional.</p>
        </>
      ),
    },
    {
      icon: <Eye size={16} style={{ color: ts.accentLight }} />,
      title: 'How We Use Your Data',
      content: (
        <>
          <p>Your data is used solely to operate and improve Breathe:</p>
          <ul className="flex flex-col gap-1.5 mt-1">
            <Li>Saving and displaying your session history and streaks.</Li>
            <Li>Personalising your breathing statistics and progress charts.</Li>
            <Li>Powering the community globe (only pins you explicitly create are shown publicly).</Li>
            <Li>Sending optional push notifications for streak reminders (only if you enable them).</Li>
            <Li>Improving app performance and fixing bugs using anonymised usage analytics.</Li>
          </ul>
          <p>We <strong style={{ color: ts.textPrimary }}>never</strong> sell your data, use it for advertising, or share it with third parties for their own purposes.</p>
        </>
      ),
    },
    {
      icon: <Lock size={16} style={{ color: ts.accentLight }} />,
      title: 'Data Storage & Security',
      content: (
        <>
          <ul className="flex flex-col gap-1.5">
            <Li>All data is encrypted in transit via HTTPS/TLS and encrypted at rest in our database.</Li>
            <Li>Passwords are hashed using bcrypt. We never store plaintext passwords.</Li>
            <Li>Biometric (heart rate) data is stored separately and access-controlled so only you can read it.</Li>
            <Li>We use industry-standard practices to protect against unauthorised access, alteration, and deletion.</Li>
          </ul>
          <p>Despite our best efforts, no system is 100% secure. If you discover a security issue, please contact us at <strong style={{ color: ts.textPrimary }}>privacy@breatheapp.co</strong>.</p>
        </>
      ),
    },
    {
      icon: <Globe size={16} style={{ color: ts.accentLight }} />,
      title: 'Third-Party Services',
      content: (
        <>
          <p>Breathe uses a small number of third-party services:</p>
          <ul className="flex flex-col gap-1.5 mt-1">
            <Li><strong style={{ color: ts.textPrimary }}>Google OAuth</strong> — for social sign-in. Google receives only the authentication request. We store only your name and email.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>MongoDB Atlas</strong> — our database host. Data is stored in encrypted clusters with strict access controls.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>Web Speech API</strong> — voice guidance runs entirely in your browser. No audio is sent to any server.</Li>
          </ul>
          <p>No data is shared with advertising networks, data brokers, or social media platforms.</p>
        </>
      ),
    },
    {
      icon: <UserCheck size={16} style={{ color: ts.accentLight }} />,
      title: 'Your Rights',
      content: (
        <>
          <p>You have full control over your data:</p>
          <ul className="flex flex-col gap-1.5 mt-1">
            <Li><strong style={{ color: ts.textPrimary }}>Access</strong> — view all your session history and stats from your Profile page at any time.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>Delete sessions</strong> — remove individual sessions from your session history.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>Delete biometric data</strong> — revoke heart-rate consent and erase all stored readings from Profile → Data & Privacy.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>Delete account</strong> — permanently erase your account and all associated data. Contact us at the email below.</Li>
            <Li><strong style={{ color: ts.textPrimary }}>Export</strong> — request a copy of your data at any time by emailing us.</Li>
          </ul>
          <p>If you are in the EU/EEA, you also have rights under GDPR including the right to object to processing and to lodge a complaint with your supervisory authority.</p>
        </>
      ),
    },
    {
      icon: <Trash2 size={16} style={{ color: ts.accentLight }} />,
      title: 'Data Retention',
      content: (
        <>
          <ul className="flex flex-col gap-1.5">
            <Li>Session data is retained for as long as your account is active or until you delete it.</Li>
            <Li>If you delete your account, all personal data is permanently removed within 30 days.</Li>
            <Li>Anonymised, aggregated analytics data (no personal identifiers) may be retained indefinitely to improve the service.</Li>
            <Li>Globe pins you have posted are removed immediately when you delete them or your account.</Li>
          </ul>
        </>
      ),
    },
    {
      icon: <Shield size={16} style={{ color: ts.accentLight }} />,
      title: "Children's Privacy",
      content: (
        <p>Breathe is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us personal data, please contact us and we will delete it promptly.</p>
      ),
    },
    {
      icon: <Mail size={16} style={{ color: ts.accentLight }} />,
      title: 'Contact Us',
      content: (
        <>
          <p>For privacy questions, data requests, or to report a concern:</p>
          <p>
            Email:{' '}
            <a
              href="mailto:privacy@breatheapp.co"
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: ts.textSecondary }}
            >
              privacy@breatheapp.co
            </a>
          </p>
          <p>We aim to respond to all privacy-related requests within 5 business days.</p>
        </>
      ),
    },
  ];

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />
      <div className="relative z-50"><NavBar /></div>

      <main className="relative z-10 flex-1 px-4 py-12 sm:px-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">

          {/* Header */}
          <div className="flex flex-col gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `${ts.accent}22`, border: `1px solid ${ts.accent}44` }}
            >
              <Shield size={22} style={{ color: ts.accentLight }} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: ts.textPrimary }}>
              Privacy Policy
            </h1>
            <p className="t-body" style={{ color: ts.textMuted }}>
              Last updated: {LAST_UPDATED}
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Breathe is built on a simple principle: your health data belongs to you. This policy explains exactly what we collect, why, and how you can control it.
            </p>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-4">
            {sections.map(s => (
              <PolicySection key={s.title} {...s} />
            ))}
          </div>

          {/* Footer note */}
          <div
            className="rounded-2xl p-5 t-body"
            style={{ backgroundColor: `${ts.accent}0F`, border: `1px solid ${ts.accent}28`, color: ts.textMuted }}
          >
            <p>
              This policy may be updated from time to time. We will notify you of significant changes via the app or email.
              By continuing to use Breathe after changes take effect, you accept the revised policy.
            </p>
            <p className="mt-2">
              Questions?{' '}
              <Link to="/support" className="font-medium hover:opacity-80 transition-opacity" style={{ color: ts.textSecondary }}>
                Visit our Support page
              </Link>
              {' '}or email{' '}
              <a href="mailto:privacy@breatheapp.co" className="font-medium hover:opacity-80 transition-opacity" style={{ color: ts.textSecondary }}>
                privacy@breatheapp.co
              </a>.
            </p>
          </div>

        </div>
      </main>

      <div className="relative z-10"><Footer /></div>
    </div>
  );
}
