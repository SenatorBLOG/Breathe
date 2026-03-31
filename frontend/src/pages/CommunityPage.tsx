// src/pages/CommunityPage.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Trash2, Send,
  Plus, X, ChevronDown, Users, Flame, Sparkles,
  MoreVertical, Flag, UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { PostSkeleton, ListSkeleton } from '../components/ui/Skeleton';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Author { _id: string; username?: string; name?: string; }

interface Post {
  _id: string;
  author: Author;
  text: string;
  category: 'experience' | 'question' | 'achievement' | 'tip';
  tags: string[];
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  createdAt: string;
}

interface Comment {
  _id: string;
  author: Author;
  text: string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(a: Author) {
  const s = a.name || a.username || '?';
  return s.slice(0, 2).toUpperCase();
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  experience:  { label: 'Experience',  color: '#4A9EFF', bg: 'rgba(74,158,255,0.12)'  },
  question:    { label: 'Question',    color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  achievement: { label: 'Achievement', color: '#FF9A5C', bg: 'rgba(255,154,92,0.12)'  },
  tip:         { label: 'Tip',         color: '#FFD97D', bg: 'rgba(255,217,125,0.12)' },
};

// ─── Tag colour palette — fixed, theme-independent ───────────────────────────
const TAG_PALETTE = [
  { color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',    border: 'rgba(0,212,255,0.28)'    }, // neon cyan
  { color: '#FF6B9D', bg: 'rgba(255,107,157,0.10)',  border: 'rgba(255,107,157,0.28)'  }, // pink
  { color: '#FFD97D', bg: 'rgba(255,217,125,0.10)',  border: 'rgba(255,217,125,0.28)'  }, // amber
  { color: '#A78BFA', bg: 'rgba(167,139,250,0.10)',  border: 'rgba(167,139,250,0.28)'  }, // violet
  { color: '#FF9A5C', bg: 'rgba(255,154,92,0.10)',   border: 'rgba(255,154,92,0.28)'   }, // orange
  { color: '#34D399', bg: 'rgba(52,211,153,0.10)',   border: 'rgba(52,211,153,0.28)'   }, // emerald
  { color: '#F87171', bg: 'rgba(248,113,113,0.10)',  border: 'rgba(248,113,113,0.28)'  }, // rose
] as const;

function pickTagColor(tag: string) {
  const idx = [...tag].reduce((n, c) => n + c.charCodeAt(0), 0) % TAG_PALETTE.length;
  return TAG_PALETTE[idx];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ author, size = 8 }: { author: Author; size?: number }) {
  const ts = useThemeStyles();
  const px = size * 4;
  return (
    <div className={`flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold`}
      style={{
        width: px,
        height: px,
        background: ts.btnGradient,
        color: ts.textPrimary,
      }}
    >
      {initials(author)}
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ title, body, confirmLabel, danger, onConfirm, onCancel }: {
  title: string; body: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  const ts = useThemeStyles();
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="w-full max-w-xs rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: ts.cardBg, border: `1px solid ${ts.border}`, boxShadow: ts.btnShadow }}>
        <p className="text-sm font-medium" style={{ color: ts.textSecondary }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{body}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-xs transition-colors"
            style={{ color: ts.textMuted, border: `1px solid ${ts.border}` }}>Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90"
            style={{ background: danger ? '#EF4444' : ts.btnGradient }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Ad slot ──────────────────────────────────────────────────────────────────
function AdSlot({ className = '' }: { className?: string }) {
  const ts = useThemeStyles();
  return (
    <div
      className={`flex items-center justify-center border border-dashed rounded-xl ${className}`}
      style={{
        borderColor: ts.border,
        backgroundColor: `${ts.cardBg}40`,
      }}
    >
      <span className="text-[9px] tracking-widest uppercase select-none" style={{ color: ts.textDim }}>
        Advertisement
      </span>
    </div>
  );
}

// ─── Login nudge ──────────────────────────────────────────────────────────────
function LoginNudge({ onClose }: { onClose: () => void }) {
  const ts = useThemeStyles();
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: `${ts.pageBg}D9`, backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center gap-5 text-center"
        style={{
          background: ts.cardBg,
          border: `1px solid ${ts.border}`,
          boxShadow: ts.btnShadow,
        }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
          <Users size={20} className="text-white" />
        </div>
        <div>
          <p className="text-base font-medium mb-1" style={{ color: ts.textSecondary }}>
            Join the community
          </p>
          <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
            You need an account to post, comment, and like. It's free and takes 30 seconds.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Link to="/register" className="w-full py-2.5 rounded-xl text-sm text-white font-medium text-center transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)]"
            style={{ background: ts.btnGradient }}>
            Create account
          </Link>
          <Link to="/login" className="w-full py-2.5 rounded-xl text-sm text-center transition-all"
            style={{
              color: ts.textSecondary,
              border: `1px solid ${ts.border}`,
            }}>
            Sign in
          </Link>
        </div>
        <button onClick={onClose} className="text-[10px] transition-colors" style={{ color: ts.textMuted }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ─── Comment row ──────────────────────────────────────────────────────────────
function CommentRow({ comment, postId, currentUserId, onDelete, onLike }: {
  comment: Comment; postId: string; currentUserId?: string;
  onDelete: (id: string) => void; onLike: (id: string) => void;
}) {
  const ts = useThemeStyles();
  return (
    <div className="flex gap-2.5">
      <Avatar author={comment.author} size={6} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[10px] font-medium leading-none" style={{ color: ts.textSecondary }}>
            {comment.author.name || comment.author.username}
          </span>
          <span className="text-[9px] mt-0.5" style={{ color: ts.textDim }}>
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-xs leading-relaxed mt-0.5" style={{ color: ts.textMuted }}>
          {comment.text}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <button onClick={() => onLike(comment._id)}
            className={`flex items-center gap-1.5 text-xs transition-all ${comment.likedByMe ? 'text-[#FF8A8A]' : ''}`} style={{ color: ts.textMuted }}>
            <Heart size={10} fill={comment.likedByMe ? 'currentColor' : 'none'} />
            {comment.likeCount > 0 && comment.likeCount}
          </button>
          {currentUserId === comment.author._id && (
            <button onClick={() => onDelete(comment._id)}
              className="text-xs transition-colors flex items-center gap-1" style={{ color: ts.textMuted }}>
              <Trash2 size={9} /> delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Comment section ──────────────────────────────────────────────────────────
function CommentSection({ postId, commentCount, isLoggedIn, onLoginRequired }: {
  postId: string; commentCount: number; isLoggedIn: boolean; onLoginRequired: () => void;
}) {
  const ts = useThemeStyles();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const currentUserId = localStorage.getItem('userId') ?? undefined;

  const load = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(data);
    } catch { toast.error('Failed to load comments'); }
    finally { setLoading(false); }
  }, [postId]);

  const toggle = () => {
    if (!open) load();
    setOpen(v => !v);
  };

  const send = async () => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      setComments(c => [...c, data]);
      setText('');
    } catch { toast.error('Failed to post comment'); }
    finally { setSending(false); }
  };

  const deleteComment = async (id: string) => {
    try {
      await api.delete(`/posts/${postId}/comments/${id}`);
      setComments(c => c.filter(x => x._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const likeComment = async (id: string) => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    try {
      const { data } = await api.post(`/posts/${postId}/comments/${id}/like`);
      setComments(c => c.map(x => x._id === id ? { ...x, likeCount: data.likeCount, likedByMe: data.likedByMe } : x));
    } catch {}
  };

  return (
    <div className="border-t mt-3 pt-3" style={{ borderColor: ts.border }}>
      <button onClick={toggle}
        className="flex items-center gap-1.5 text-[10px] transition-colors"
        style={{ color: ts.textMuted }}>
        <MessageCircle size={12} />
        {commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}` : 'Add comment'}
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3">
          {loading && <p className="text-[10px]" style={{ color: ts.textDim }}>Loading…</p>}
          {comments.map(c => (
            <CommentRow key={c._id} comment={c} postId={postId}
              currentUserId={currentUserId} onDelete={deleteComment} onLike={likeComment} />
          ))}

          {/* Input */}
          <div className="flex gap-2 mt-1">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={isLoggedIn ? 'Write a comment…' : 'Sign in to comment'}
              readOnly={!isLoggedIn}
              onClick={() => { if (!isLoggedIn) onLoginRequired(); }}
              maxLength={300}
              className="flex-1 comm-input border rounded-xl px-4 py-3 text-xs outline-none transition-colors leading-relaxed"
              style={{
                borderColor: ts.border,
                color: ts.textSecondary,
              }}
            />
            <button onClick={send} disabled={sending || !text.trim()}
              className="w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: ts.btnGradient }}>
              <Send size={12} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({ post, isLoggedIn, currentUserId, onLoginRequired, onDelete, onBlock }: {
  post: Post; isLoggedIn: boolean; currentUserId?: string;
  onLoginRequired: () => void; onDelete: (id: string) => void; onBlock: (authorId: string) => void;
}) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount] = useState(post.commentCount);
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<'report' | 'block' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cat = CATEGORY_META[post.category] ?? CATEGORY_META.experience;
  const isOwn = currentUserId === post.author._id;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const toggleLike = async () => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLiked(data.likedByMe);
      setLikeCount(data.likeCount);
    } catch {}
  };

  const confirmReport = async () => {
    setDialog(null);
    try {
      await api.post(`/posts/${post._id}/report`);
      toast.success('Report submitted. Thank you.');
    } catch { toast.error('Could not submit report. Try again.'); }
  };

  const confirmBlock = async () => {
    setDialog(null);
    try {
      await api.post(`/users/${post.author._id}/block`);
      onBlock(post.author._id);
      toast.success(`${post.author.name || 'User'} blocked.`);
    } catch { toast.error('Could not block user. Try again.'); }
  };

  return (
    <>
      {dialog === 'report' && (
        <ConfirmDialog
          title="Report this post?"
          body="We'll review it and take action if it violates our community guidelines."
          confirmLabel="Submit report"
          onConfirm={confirmReport}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === 'block' && (
        <ConfirmDialog
          title={`Block ${post.author.name || 'this user'}?`}
          body="You won't see their posts or content anymore. You can unblock anytime."
          confirmLabel="Block"
          danger
          onConfirm={confirmBlock}
          onCancel={() => setDialog(null)}
        />
      )}

      <div className="flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: ts.cardBg,
          borderColor: hovered ? ts.borderHover : ts.border,
        }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Avatar author={post.author} />
            <div>
              <p className="text-xs font-medium leading-none" style={{ color: ts.textSecondary }}>
                {post.author.name || post.author.username}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: ts.textDim }}>
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ color: cat.color, background: cat.bg }}>
              {t(`community.categories.${post.category}`, cat.label)}
            </span>

            {isOwn ? (
              <button onClick={() => onDelete(post._id)}
                className="transition-colors p-1" style={{ color: ts.textMuted }}>
                <Trash2 size={12} />
              </button>
            ) : (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen(v => !v)}
                  className="transition-colors p-1 rounded-lg hover:opacity-70" style={{ color: ts.textMuted }}>
                  <MoreVertical size={14} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-6 z-50 w-40 rounded-xl overflow-hidden shadow-xl"
                    style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>
                    <button
                      onClick={() => { setMenuOpen(false); if (!isLoggedIn) { onLoginRequired(); return; } setDialog('report'); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-left transition-colors hover:opacity-70"
                      style={{ color: ts.textSecondary }}>
                      <Flag size={12} /> Report post
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); if (!isLoggedIn) { onLoginRequired(); return; } setDialog('block'); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-left transition-colors hover:opacity-70"
                      style={{ color: '#EF4444' }}>
                      <UserX size={12} /> Block user
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Text */}
        <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
          {post.text}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map(tag => {
              const tc = pickTagColor(tag);
              return (
                <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ backgroundColor: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                  #{tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <motion.button onClick={toggleLike}
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`flex items-center gap-1.5 text-xs ${liked ? 'text-[#FF8A8A]' : ''}`} style={{ color: ts.textMuted }}>
            <motion.span
              animate={liked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}>
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
            </motion.span>
            {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
          </motion.button>
        </div>

        {/* Comments */}
        <CommentSection
          postId={post._id}
          commentCount={commentCount}
          isLoggedIn={isLoggedIn}
          onLoginRequired={onLoginRequired}
        />
      </div>
    </>
  );
}

// ─── Create post modal ────────────────────────────────────────────────────────
const CATEGORIES = ['experience', 'question', 'achievement', 'tip'] as const;
const CAT_ICONS: Record<string, string> = {
  experience: '🌊', question: '💭', achievement: '🏆', tip: '💡',
};

function CreatePostModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Post) => void }) {
  const ts = useThemeStyles();
  const [text, setText] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('experience');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const addTag = () => {
    const t = tagInput.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) { setTags(prev => [...prev, t]); setTagInput(''); }
  };

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post('/posts', { text, category, tags });
      onCreated(data);
      onClose();
      toast.success('Post published!');
    } catch { toast.error('Failed to post'); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
      style={{ background: `${ts.pageBg}D9`, backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: ts.cardBg,
          border: `1px solid ${ts.border}`,
          boxShadow: ts.btnShadow,
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              <Sparkles size={13} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none" style={{ color: ts.textSecondary }}>
                Share with the community
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: ts.textDim }}>
                Your experience helps others
              </p>
            </div>
          </div>
          <button onClick={onClose} className="transition-colors p-1" style={{ color: ts.textMuted }}>
            <X size={15} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Category */}
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all"
                style={{
                  backgroundColor: category === c ? ts.cardBgHover : ts.cardBg,
                  borderColor: category === c ? ts.borderHover : ts.border,
                }}>
                <span className={`text-base ${category === c ? '' : 'opacity-50'}`}>{CAT_ICONS[c]}</span>
                <span className={`text-[9px] uppercase tracking-wide ${category === c ? '' : ''}`} style={{ color: category === c ? ts.textSecondary : ts.textMuted }}>
                  {c}
                </span>
              </button>
            ))}
          </div>

          {/* Text */}
          <textarea value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={600}
            placeholder="Share your experience, ask a question, or post a tip…"
            className="w-full comm-input rounded-xl px-4 py-3 text-xs outline-none transition-colors leading-relaxed resize-none"
            style={{
              backgroundColor: ts.cardBg,
              border: `1px solid ${ts.border}`,
              color: ts.textSecondary,
            }} />

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag (enter to add)"
                maxLength={30}
                className="flex-1 comm-input rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                style={{
                  backgroundColor: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                  color: ts.textSecondary,
                }} />
              <button onClick={addTag}
                className="px-3 py-2 rounded-xl text-xs transition-all"
                style={{
                  color: ts.accent,
                  border: `1px solid ${ts.border}`,
                }}>
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => {
                  const tc = pickTagColor(t);
                  return (
                    <span key={t} className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                      #{t}
                      <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="ml-0.5 transition-colors" style={{ color: tc.color }}>×</button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] tabular-nums" style={{ color: ts.textDim }}>{text.length}/600</span>
            <button onClick={submit} disabled={sending || !text.trim()}
              className="px-6 py-2.5 rounded-xl text-xs text-white font-medium tracking-wide transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{ background: ts.btnGradient }}>
              {sending ? 'Posting…' : 'Publish ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar stat ─────────────────────────────────────────────────────────────
function SidebarStat({ value, label }: { value: string; label: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: ts.border }}>
      <span className="text-xs" style={{ color: ts.textMuted }}>{label}</span>
      <span className="text-sm font-semibold tabular-nums" style={{ color: ts.textSecondary }}>{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const CATEGORIES_FILTER = ['all', 'experience', 'question', 'achievement', 'tip'] as const;

export default function CommunityPage() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const token = localStorage.getItem('token');
  const isLoggedIn = Boolean(token);
  const currentUserId = localStorage.getItem('userId') ?? undefined;

  const fetchPosts = useCallback(async (cat: string, pg: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '15' });
      if (cat !== 'all') params.set('category', cat);
      const { data } = await api.get(`/posts?${params}`);
      setPosts(pg === 1 ? data.posts : prev => [...prev, ...data.posts]);
      setTotalPages(data.pages);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { setPage(1); fetchPosts(category, 1); }, [category]);
  useEffect(() => { if (page > 1) fetchPosts(category, page); }, [page]);

  const handleCreate = () => { if (!isLoggedIn) { setShowLogin(true); return; } setShowCreate(true); };
  const onCreated = (p: Post) => setPosts(prev => [p, ...prev]);
  const onDelete = async (id: string) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const onBlock = (authorId: string) => {
    setPosts(prev => prev.filter(p => p.author._id !== authorId));
  };

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <style>{`
        @keyframes commIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .comm-in {
          animation: commIn 0.3s ease forwards;
        }
        .comm-input {
          background-color: ${ts.cardBg};
        }
        .comm-input::placeholder {
          color: ${ts.textDim};
        }
      `}</style>
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* Top ad */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot className="h-12 sm:h-14" />
        </div>

        {/* Header */}
        <header className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 pb-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: ts.textMuted }}>
                Breathe · Community
              </p>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
                Community
              </h1>
              <p className="text-xs mt-1" style={{ color: ts.textMuted }}>
                {t("community.subtitle")}
              </p>
            </div>
            <button onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium tracking-wide transition-all hover:shadow-[0_0_24px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95"
              style={{ background: ts.btnGradient }}>
              <Plus size={14} /> Post
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-20 pt-4">
          <div className="flex gap-5">

            {/* Feed */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* Category filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES_FILTER.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className="px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest border transition-all"
                    style={{
                      backgroundColor: category === c ? 'rgba(0,212,255,0.10)' : ts.cardBg,
                      borderColor: category === c ? 'rgba(0,212,255,0.35)' : ts.border,
                      color: category === c ? '#00D4FF' : ts.textMuted,
                    }}>
                    {t(`community.categories.${c}`, c)}
                  </button>
                ))}
              </div>

              {/* Posts */}
              {loading && page === 1 ? (
                <ListSkeleton count={4} Item={PostSkeleton} />
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                  <span className="text-4xl opacity-30">🌊</span>
                  <p className="text-sm" style={{ color: ts.textMuted }}>{t("community.noPostsYet")}</p>
                  <button onClick={handleCreate}
                    className="px-6 py-2.5 rounded-full text-sm text-white font-medium transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)]"
                    style={{ background: ts.btnGradient }}>
                    Write a post →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {posts.map((post, i) => (
                    <div key={post._id} className="comm-in" style={{ animationDelay: `${Math.min(i, 5) * 0.05}s`, opacity: 0 }}>
                      <PostCard post={post} isLoggedIn={isLoggedIn} currentUserId={currentUserId}
                        onLoginRequired={() => setShowLogin(true)} onDelete={onDelete} onBlock={onBlock} />
                    </div>
                  ))}

                  {page < totalPages && (
                    <button onClick={() => setPage(p => p + 1)} disabled={loading}
                      className="self-center px-6 py-2.5 rounded-full text-xs transition-all disabled:opacity-40 mt-2"
                      style={{
                        color: ts.textSecondary,
                        border: `1px solid ${ts.border}`,
                      }}>
                      {loading ? 'Loading…' : 'Load more'}
                    </button>
                  )}
                </div>
              )}

              {/* Mid ad */}
              {posts.length > 5 && <AdSlot className="h-14" />}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
              {/* About */}
              <div className="rounded-2xl p-4 border" style={{ borderColor: ts.border, backgroundColor: ts.cardBg }}>
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={13} style={{ color: ts.accent }} />
                  <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: ts.textSecondary }}>About</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                  A space for meditators to share experiences, ask questions, and celebrate progress. Be kind. Be real.
                </p>
              </div>

              {/* Stats */}
              <div className="rounded-2xl p-4 border" style={{ borderColor: ts.border, backgroundColor: ts.cardBg }}>
                <p className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: ts.textSecondary }}>Community</p>
                <SidebarStat value={String(posts.length)} label="Posts loaded" />
                <SidebarStat value={String(posts.reduce((s, p) => s + p.likeCount, 0))} label="Total likes" />
                <SidebarStat value={String(posts.reduce((s, p) => s + p.commentCount, 0))} label="Total comments" />
              </div>

              {/* Rules */}
              <div className="rounded-2xl p-4 border" style={{ borderColor: ts.border, backgroundColor: ts.cardBg }}>
                <p className="text-[10px] uppercase tracking-widest mb-3 font-semibold" style={{ color: ts.textSecondary }}>{t('community.rules')}</p>
                {([t('community.rule1'), t('community.rule2'), t('community.rule3'), t('community.rule4')]).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: ts.border }}>
                    <span className="text-xs font-bold" style={{ color: ts.accentLight }}>{i + 1}</span>
                    <span className="text-xs" style={{ color: ts.textMuted }}>{r}</span>
                  </div>
                ))}
              </div>

              {/* CTA for logged-out */}
              {!isLoggedIn && (
                <div className="rounded-2xl p-4 border flex flex-col gap-3" style={{ borderColor: ts.borderHover, backgroundColor: ts.cardBg }}>
                  <p className="text-sm font-semibold" style={{ color: ts.textPrimary }}>Join Breathe</p>
                  <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                    Create an account to post, comment, and track your meditation journey.
                  </p>
                  <Link to="/register" className="w-full py-2 rounded-xl text-[10px] text-white text-center font-medium transition-all"
                    style={{ background: ts.btnGradient }}>
                    Sign up free
                  </Link>
                </div>
              )}

              <AdSlot className="h-52" />
            </aside>
          </div>
        </main>

        <Footer />
      </div>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} onCreated={onCreated} />}
      {showLogin && <LoginNudge onClose={() => setShowLogin(false)} />}
    </div>
  );
}