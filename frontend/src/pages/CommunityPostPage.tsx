// src/pages/CommunityPostPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import PageSEO from '../components/PageSEO';
import Footer from '../components/Footer';
import api from '../api';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TAG_PALETTE = [
  { color: '#00D4FF', bg: 'rgba(0,212,255,0.14)',   border: 'rgba(0,212,255,0.45)'   },
  { color: '#FF6B9D', bg: 'rgba(255,107,157,0.14)', border: 'rgba(255,107,157,0.45)' },
  { color: '#FFD97D', bg: 'rgba(255,217,125,0.14)', border: 'rgba(255,217,125,0.45)' },
  { color: '#A78BFA', bg: 'rgba(167,139,250,0.14)', border: 'rgba(167,139,250,0.45)' },
  { color: '#FF9A5C', bg: 'rgba(255,154,92,0.14)',  border: 'rgba(255,154,92,0.45)'  },
  { color: '#34D399', bg: 'rgba(52,211,153,0.14)',  border: 'rgba(52,211,153,0.45)'  },
  { color: '#F87171', bg: 'rgba(248,113,113,0.14)', border: 'rgba(248,113,113,0.45)' },
] as const;

function pickTagColor(tag: string) {
  const idx = [...tag].reduce((n, c) => n + c.charCodeAt(0), 0) % TAG_PALETTE.length;
  return TAG_PALETTE[idx];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  experience:  { label: 'Experience',  color: '#4A9EFF', bg: 'rgba(74,158,255,0.12)'  },
  question:    { label: 'Question',    color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  achievement: { label: 'Achievement', color: '#FF9A5C', bg: 'rgba(255,154,92,0.12)'  },
  tip:         { label: 'Tip',         color: '#FFD97D', bg: 'rgba(255,217,125,0.12)' },
};

interface Author { _id: string; username?: string; name?: string; }
interface Post {
  _id: string;
  author: Author;
  text: string;
  category: string;
  tags: string[];
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  createdAt: string;
}

function RelatedCard({ post }: { post: Post }) {
  const ts = useThemeStyles();
  return (
    <Link to={`/community/post/${post._id}`}
      className="block p-4 rounded-2xl border transition-all hover:opacity-80"
      style={{ background: ts.cardBg, borderColor: ts.border }}>
      <p className="t-caption font-medium mb-1" style={{ color: ts.textSecondary }}>
        {post.text.slice(0, 120)}{post.text.length > 120 ? '…' : ''}
      </p>
      <div className="flex items-center gap-3 mt-2">
        <span className="t-label" style={{ color: ts.textDim }}>
          {post.author.name || post.author.username}
        </span>
        <span className="t-label flex items-center gap-1" style={{ color: ts.textDim }}>
          <Heart size={10} /> {post.likeCount}
        </span>
      </div>
    </Link>
  );
}

export default function CommunityPostPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    Promise.all([
      api.get(`/posts/${id}`),
      api.get(`/posts/${id}/related`),
    ])
      .then(([postRes, relRes]) => {
        setPost(postRes.data);
        setRelated(relRes.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const cat = post ? (CATEGORY_META[post.category] ?? CATEGORY_META.experience) : null;

  const seoTitle = post
    ? `${post.text.slice(0, 60)}${post.text.length > 60 ? '…' : ''}`
    : 'Community Post';
  const seoDesc = post
    ? post.text.slice(0, 160)
    : 'Read this breathwork community post on Breathe.';

  return (
    <div className="relative min-h-screen font-montserrat overflow-x-hidden">
      <PageSEO
        title={seoTitle}
        description={seoDesc}
        canonical={`/community/post/${id}`}
      />
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">

          <h1 className="sr-only">{post?.text ? post.text.slice(0, 80) : t('community.postH1', 'Community post')}</h1>

          {/* Back */}
          <button onClick={() => navigate('/community')}
            className="flex items-center gap-2 t-caption transition-colors self-start"
            style={{ color: ts.textMuted }}>
            <ArrowLeft size={14} /> Back to community
          </button>

          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 rounded-xl animate-pulse"
                  style={{ background: ts.cardBg, opacity: 1 - i * 0.2 }} />
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <span className="text-4xl opacity-30">🌊</span>
              <p className="t-body" style={{ color: ts.textMuted }}>Post not found or has been deleted.</p>
              <Link to="/community" className="t-caption" style={{ color: ts.accent }}>← Back to community</Link>
            </div>
          )}

          {post && cat && (
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 p-6 rounded-2xl border"
              style={{ background: ts.cardBg, borderColor: ts.border }}>

              {/* Category + tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="t-label px-2 py-0.5 rounded-full"
                  style={{ color: cat.color, background: cat.bg }}>
                  {cat.label}
                </span>
                {post.tags.map(tag => {
                  const tc = pickTagColor(tag);
                  return (
                    <span key={tag} className="t-label px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                      #{tag}
                    </span>
                  );
                })}
              </div>

              {/* Author + time */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center t-label font-bold"
                  style={{ background: ts.btnGradient, color: '#fff' }}>
                  {(post.author.name || post.author.username || '?').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="t-caption font-medium leading-none" style={{ color: ts.textSecondary }}>
                    {post.author.name || post.author.username}
                  </p>
                  <p className="t-caption mt-0.5" style={{ color: ts.textDim }}>{timeAgo(post.createdAt)}</p>
                </div>
              </div>

              {/* Post text */}
              <p className="t-body leading-relaxed" style={{ color: ts.textSecondary }}>
                {post.text}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: ts.border }}>
                <span className="flex items-center gap-1.5 t-caption" style={{ color: ts.textMuted }}>
                  <Heart size={13} /> {post.likeCount}
                </span>
                <span className="flex items-center gap-1.5 t-caption" style={{ color: ts.textMuted }}>
                  <MessageCircle size={13} /> {t('community.commentCount', { count: post.commentCount })}
                </span>
              </div>
            </motion.article>
          )}

          {/* Related posts */}
          {related.length > 0 && (
            <section className="flex flex-col gap-3">
              <p className="t-label uppercase tracking-widest font-semibold" style={{ color: ts.textSecondary }}>
                Related posts
              </p>
              {related.map(r => <RelatedCard key={r._id} post={r} />)}
            </section>
          )}

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 py-6 text-center border-t"
            style={{ borderColor: `${ts.border}50` }}>
            <p className="t-caption" style={{ color: ts.textMuted }}>{t('community.joinConversation')}</p>
            <Link to="/community"
              className="px-8 py-3 rounded-xl t-body font-medium text-white transition-all hover:opacity-90"
              style={{ background: ts.btnGradient }}>
              {t('community.goToCommunity')}
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
