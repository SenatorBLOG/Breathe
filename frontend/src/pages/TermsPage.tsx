// src/pages/TermsPage.tsx
//
// Plain-English Terms of Service. Required by EU Consumer Rights Directive
// 2011/83 — the Sign Up flow's "agree to terms" checkbox is only legally valid
// if these terms exist at /terms. Keep this page in sync with Privacy Policy
// (legal basis for processing, wellness-not-medical disclaimer, etc.).
//
// IMPORTANT: This document is a starting template. Have it reviewed by counsel
// before relying on it for a paid launch.
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ThemeBackground from '../components/ThemeBackground';
import PageSEO from '../components/PageSEO';
import { useThemeStyles } from '../hooks/useThemeStyles';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. Wellness service, not medical advice',
    body: 'Breathe provides guided breathing exercises, ambient sounds, and an AI conversational companion for general wellness and relaxation. The Service is not a medical device, not a substitute for professional medical advice, diagnosis, or treatment, and is not intended for use in any emergency. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical or mental-health condition. If you think you may be in a crisis, call your local emergency number (911, 112, 999, etc.) or use the in-app crisis-help screen.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 13 years old to use Breathe. By creating an account you confirm you meet this age requirement and that the personal data you provide is accurate. Residents of jurisdictions with stricter age-of-consent rules (16 in many EU member states under GDPR Art. 8) must meet their local minimum age.',
  },
  {
    title: '3. Your account',
    body: 'You are responsible for keeping your password and login confidential. Notify us at security@breatheonline.app if you suspect unauthorized access. We may suspend accounts that violate these terms, attempt to disrupt the Service, or appear compromised.',
  },
  {
    title: '4. Acceptable use',
    body: 'You agree not to: (a) abuse, harass, or post unlawful content in the community feed; (b) attempt to reverse-engineer, scrape, or stress-test the Service; (c) submit prompts to the AI Coach that are intended to extract harmful instructions, generate illegal content, or attempt prompt-injection; (d) impersonate another person; (e) upload content for which you do not hold the rights.',
  },
  {
    title: '5. AI Coach',
    body: 'The AI Coach is powered by Google Gemini. Messages you send to the Coach are transmitted to Google for processing under their terms. The Coach can make mistakes; treat its suggestions as inspiration, not as a substitute for human guidance. Conversations may be retained briefly for safety and abuse-prevention review.',
  },
  {
    title: '6. User content',
    body: 'You retain ownership of posts you publish in the community. By posting, you grant Breathe a worldwide, non-exclusive, royalty-free license to display, distribute and translate the post inside the Service. You may delete your posts at any time from your profile.',
  },
  {
    title: '7. Third-party content',
    body: 'Ambient music and sounds are provided by Jamendo under their Creative Commons licenses. Map tiles on the Globe page are © OpenStreetMap contributors, served via Carto. Respect each provider\'s license when sharing screenshots or downloads.',
  },
  {
    title: '8. Disclaimers & limitation of liability',
    body: 'The Service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Breathe is not liable for indirect, incidental, special, or consequential damages, or for loss of profits, revenue, data, or goodwill arising from your use of the Service. Nothing in these terms limits liability for fraud, willful misconduct, or any liability that cannot be excluded under applicable law.',
  },
  {
    title: '9. Changes',
    body: 'We may update these terms. Material changes will be announced inside the app and, where required, by email. Continued use after the effective date constitutes acceptance.',
  },
  {
    title: '10. Termination',
    body: 'You may delete your account at any time from the profile page or by emailing privacy@breatheonline.app. We may suspend or terminate accounts that violate these terms, in which case we will preserve your right to export your data under GDPR Art. 20.',
  },
  {
    title: '11. Governing law & contact',
    body: 'These terms are governed by the laws of the operator\'s home jurisdiction, without regard to conflict-of-laws principles. For any questions write to support@breatheonline.app or, for privacy matters, privacy@breatheonline.app.',
  },
];

export default function TermsPage() {
  const ts = useThemeStyles();

  return (
    <div className="relative min-h-screen font-montserrat flex flex-col">
      <PageSEO
        title="Terms of Service | Breathe"
        description="The terms that govern your use of the Breathe guided-breathing and meditation app."
        canonical="/terms"
      />
      <ThemeBackground />

      <div className="relative z-10 flex flex-col flex-1">
        <NavBar />

        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
          <header className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
              Terms of Service
            </h1>
            <p className="t-caption" style={{ color: ts.textMuted }}>
              Last updated: May 16, 2026
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textSecondary }}>
              These terms govern your use of Breathe (the &ldquo;Service&rdquo;) available at
              breatheonline.app. By creating an account or using the Service you agree to them. Please read them
              alongside our <a href="/privacy" className="underline" style={{ color: ts.accent }}>Privacy Policy</a>.
            </p>
          </header>

          <ol className="flex flex-col gap-6 list-none p-0">
            {SECTIONS.map(s => (
              <li key={s.title} className="flex flex-col gap-2">
                <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>{s.title}</h2>
                <p className="t-body leading-relaxed" style={{ color: ts.textSecondary }}>{s.body}</p>
              </li>
            ))}
          </ol>
        </main>

        <Footer />
      </div>
    </div>
  );
}
