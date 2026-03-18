// src/pages/CommunityPage.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Flag, Trash2, Send,
  Plus, X, ChevronDown, Users, Flame, Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  experience:  { label: 'Experience',  color: '#4A9EFF', bg: 'rgba(74,158,255,0.1)'  },
  question:    { label: 'Question',    color: '#7AC4FF', bg: 'rgba(122,196,255,0.1)' },
  achievement: { label: 'Achievement', color: '#4AE8A0', bg: 'rgba(74,232,160,0.1)'  },
  tip:         { label: 'Tip',         color: '#FFD97D', bg: 'rgba(255,217,125,0.1)' },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ author, size = 8 }: { author: Author; size?: number }) {
  const px = size * 4;
  return (
    <div className={`flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold text-[#010814]`}
      style={{ width: px, height: px, background: 'linear-gradient(135deg,#1A5FCC,#7AC4FF)', fontSize: px * 0.32 }}>
      {initials(author)}
    </div>
  );
}

// ─── Ad slot ──────────────────────────────────────────────────────────────────
function AdSlot({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center border border-dashed border-[#1E3358]/40 rounded-xl bg-[#040A14]/40 ${className}`}>
      <span className="text-[9px] tracking-[0.25em] uppercase text-[#1A2D48] select-none">Advertisement</span>
    </div>
  );
}

// ─── Login nudge ──────────────────────────────────────────────────────────────
function LoginNudge({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(1,8,20,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center gap-5 text-center"
        style={{ background: 'linear-gradient(160deg,#070E1F,#050A18)', border: '1px solid rgba(42,84,153,0.45)', boxShadow: '0 0 60px rgba(74,158,255,0.08)' }}>
        <div className="absolute" />
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)', boxShadow: '0 0 24px rgba(74,158,255,0.4)' }}>
          <Users size={20} className="text-white" />
        </div>
        <div>
          <p className="text-[#B8D9FF] text-base font-medium mb-1">Join the community</p>
          <p className="text-[#4A7AAA] text-xs leading-relaxed">You need an account to post, comment, and like. It's free and takes 30 seconds.</p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Link to="/register" className="w-full py-2.5 rounded-xl text-sm text-white font-medium text-center transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)]"
            style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
            Create account
          </Link>
          <Link to="/login" className="w-full py-2.5 rounded-xl text-sm text-[#4A9EFF] text-center border border-[#1E3358]/50 hover:border-[#2A5499]/60 transition-all">
            Sign in
          </Link>
        </div>
        <button onClick={onClose} className="text-[10px] text-[#3D6080] hover:text-[#4A7AAA] transition-colors">
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
  return (
    <div className="flex gap-2.5">
      <Avatar author={comment.author} size={6} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[#7AC4FF] text-[10px] font-medium">{comment.author.name || comment.author.username}</span>
          <span className="text-[#3D6080] text-[9px]">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-[#5A8FB8] text-xs leading-relaxed mt-0.5">{comment.text}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <button onClick={() => onLike(comment._id)}
            className={`flex items-center gap-1 text-[9px] transition-colors ${comment.likedByMe ? 'text-[#FF8A8A]' : 'text-[#4A7AAA] hover:text-[#FF8A8A]'}`}>
            <Heart size={10} fill={comment.likedByMe ? 'currentColor' : 'none'} />
            {comment.likeCount > 0 && comment.likeCount}
          </button>
          {currentUserId === comment.author._id && (
            <button onClick={() => onDelete(comment._id)}
              className="text-[9px] text-[#4A7AAA] hover:text-[#FF8A8A] transition-colors flex items-center gap-1">
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
  const [open, setOpen]         = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(false);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const currentUserId           = localStorage.getItem('userId') ?? undefined;

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
    <div className="border-t border-[#1E3358]/25 mt-3 pt-3">
      <button onClick={toggle}
        className="flex items-center gap-1.5 text-[10px] text-[#4A7AAA] hover:text-[#4A9EFF] transition-colors">
        <MessageCircle size={12} />
        {commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}` : 'Add comment'}
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3">
          {loading && <p className="text-[10px] text-[#3D6080]">Loading…</p>}
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
              className="flex-1 bg-[#060C1A]/60 border border-[#1E3358]/50 rounded-xl px-3 py-2 text-xs text-[#7AC4FF] placeholder-[#1A2D48] outline-none focus:border-[#2A5499] transition-colors"
            />
            <button onClick={send} disabled={sending || !text.trim()}
              className="w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
              <Send size={12} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({ post, isLoggedIn, currentUserId, onLoginRequired, onDelete }: {
  post: Post; isLoggedIn: boolean; currentUserId?: string;
  onLoginRequired: () => void; onDelete: (id: string) => void;
}) {
  const [liked, setLiked]         = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCount]  = useState(post.commentCount);
  const cat = CATEGORY_META[post.category] ?? CATEGORY_META.experience;

  const toggleLike = async () => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLiked(data.likedByMe);
      setLikeCount(data.likeCount);
    } catch {}
  };

  const report = async () => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    try {
      await api.post(`/posts/${post._id}/report`);
      toast.success('Post reported');
    } catch {}
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 hover:border-[#1E3358]/70"
      style={{ background: 'linear-gradient(145deg,rgba(11,22,40,0.85),rgba(6,12,26,0.9))', border: '1px solid rgba(30,51,88,0.5)' }}>

      {/* Top glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/15 to-transparent -mx-4 -mt-4 mb-1 rounded-t-2xl" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Avatar author={post.author} />
          <div>
            <p className="text-[#B8D9FF] text-xs font-medium leading-none">{post.author.name || post.author.username}</p>
            <p className="text-[#4A7AAA] text-[9px] mt-0.5">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Category badge */}
          <span className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ color: cat.color, background: cat.bg }}>
            {cat.label}
          </span>
          {/* Actions menu */}
          {currentUserId === post.author._id ? (
            <button onClick={() => onDelete(post._id)}
              className="text-[#4A7AAA] hover:text-[#FF8A8A] transition-colors p-1">
              <Trash2 size={12} />
            </button>
          ) : (
            <button onClick={report} className="text-[#4A7AAA] hover:text-[#4A7AAA] transition-colors p-1">
              <Flag size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Text */}
      <p className="text-[#7AADCC] text-xs leading-relaxed">{post.text}</p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map(tag => (
            <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-[#0D1B33] border border-[#1E3358]/40 text-[#2A5499]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button onClick={toggleLike}
          className={`flex items-center gap-1.5 text-xs transition-all ${liked ? 'text-[#FF8A8A]' : 'text-[#4A7AAA] hover:text-[#FF8A8A]'}`}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'}
            className={liked ? 'drop-shadow-[0_0_6px_rgba(255,138,138,0.6)]' : ''} />
          {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
        </button>
      </div>

      {/* Comments */}
      <CommentSection
        postId={post._id}
        commentCount={commentCount}
        isLoggedIn={isLoggedIn}
        onLoginRequired={onLoginRequired}
      />
    </div>
  );
}

// ─── Create post modal ────────────────────────────────────────────────────────
const CATEGORIES = ['experience', 'question', 'achievement', 'tip'] as const;
const CAT_ICONS: Record<string, string> = {
  experience: '🌊', question: '💭', achievement: '🏆', tip: '💡',
};

function CreatePostModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Post) => void }) {
  const [text, setText]         = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('experience');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags]         = useState<string[]>([]);
  const [sending, setSending]   = useState(false);

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
      style={{ background: 'rgba(1,8,20,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#070E1F,#050A18)', border: '1px solid rgba(42,84,153,0.45)', boxShadow: '0 0 80px rgba(74,158,255,0.08)' }}>

        <div className="h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)', boxShadow: '0 0 14px rgba(74,158,255,0.35)' }}>
              <Sparkles size={13} className="text-white" />
            </div>
            <div>
              <p className="text-[#B8D9FF] text-sm font-medium leading-none">Share with the community</p>
              <p className="text-[#4A7AAA] text-[10px] mt-0.5">Your experience helps others</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#4A7AAA] hover:text-[#5A8FB8] transition-colors p-1">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Category */}
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all ${
                  category === c ? 'border-[#2A5499]/70 bg-[#0D1B33]' : 'border-[#1E3358]/35 hover:border-[#1E3358]/60'
                }`}>
                <span className={`text-base ${category === c ? '' : 'opacity-50'}`}>{CAT_ICONS[c]}</span>
                <span className={`text-[9px] uppercase tracking-wide ${category === c ? 'text-[#7AC4FF]' : 'text-[#3D6080]'}`}>
                  {c}
                </span>
              </button>
            ))}
          </div>

          {/* Text */}
          <textarea value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={600}
            placeholder="Share your experience, ask a question, or post a tip…"
            className="w-full bg-[#060C1A]/60 border border-[#1E3358]/50 rounded-xl px-4 py-3 text-xs text-[#7AC4FF] placeholder-[#1A2D48] outline-none focus:border-[#2A5499] resize-none transition-colors leading-relaxed" />

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag (enter to add)"
                maxLength={30}
                className="flex-1 bg-[#060C1A]/60 border border-[#1E3358]/50 rounded-xl px-3 py-2 text-xs text-[#7AC4FF] placeholder-[#1A2D48] outline-none focus:border-[#2A5499] transition-colors" />
              <button onClick={addTag}
                className="px-3 py-2 rounded-xl text-xs text-[#4A9EFF] border border-[#1E3358]/50 hover:border-[#2A5499]/60 transition-all">
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-[#0D1B33] border border-[#2A5499]/40 text-[#4A9EFF]">
                    #{t}
                    <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="text-[#4A7AAA] hover:text-[#FF8A8A] ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#3D6080] tabular-nums">{text.length}/600</span>
            <button onClick={submit} disabled={sending || !text.trim()}
              className="px-6 py-2.5 rounded-xl text-xs text-white font-medium tracking-wide transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
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
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1E3358]/25 last:border-0">
      <span className="text-[10px] text-[#4A7AAA]">{label}</span>
      <span className="text-[#7AC4FF] text-xs font-medium tabular-nums">{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const CATEGORIES_FILTER = ['all', 'experience', 'question', 'achievement', 'tip'] as const;

export default function CommunityPage() {
  const { t } = useTranslation();
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory]     = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showLogin, setShowLogin]   = useState(false);

  const token         = localStorage.getItem('token');
  const isLoggedIn    = Boolean(token);
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
  const onDelete  = async (id: string) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#010814] font-montserrat">
      <style>{`
        @keyframes commFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .comm-in { animation: commFadeUp 0.5s ease forwards; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.35 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top,rgba(1,8,20,0.2) 0%,rgba(1,8,20,0.94) 68%)' }} />

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
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#4A7AAA] mb-1">Breathe · Community</p>
              <h1 className="text-2xl sm:text-3xl font-light text-[#B8D9FF] tracking-wide">Community</h1>
              <p className="text-[#4A7AAA] text-xs mt-1">{t("community.subtitle")}</p>
            </div>
            <button onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium tracking-wide transition-all hover:shadow-[0_0_24px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
              <Plus size={14} /> Post
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-20 pt-4">
          <div className="flex gap-5">

            {/* ── Feed ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">

              {/* Category filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES_FILTER.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest border transition-all ${
                      category === c
                        ? 'bg-[#0D1B33] border-[#2A5499]/60 text-[#7AC4FF]'
                        : 'border-[#1E3358]/35 text-[#4A7AAA] hover:border-[#1E3358]/60'
                    }`}>
                    {c === 'all' ? 'All' : CAT_ICONS[c] + ' ' + c}
                  </button>
                ))}
              </div>

              {/* Posts */}
              {loading && page === 1 ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl animate-pulse bg-[#0A1525]" style={{ opacity: 0.5 - i * 0.1 }} />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                  <span className="text-4xl opacity-30">🌊</span>
                  <p className="text-[#4A7AAA] text-sm">{t("community.noPostsYet")}</p>
                  <button onClick={handleCreate}
                    className="px-6 py-2.5 rounded-full text-sm text-white font-medium transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)]"
                    style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
                    Write a post →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {posts.map((post, i) => (
                    <div key={post._id} className="comm-in" style={{ animationDelay: `${Math.min(i, 5) * 0.05}s`, opacity: 0 }}>
                      <PostCard post={post} isLoggedIn={isLoggedIn} currentUserId={currentUserId}
                        onLoginRequired={() => setShowLogin(true)} onDelete={onDelete} />
                    </div>
                  ))}

                  {/* Load more */}
                  {page < totalPages && (
                    <button onClick={() => setPage(p => p + 1)} disabled={loading}
                      className="self-center px-6 py-2.5 rounded-full text-xs text-[#4A9EFF] border border-[#1E3358]/50 hover:border-[#2A5499]/60 transition-all disabled:opacity-40 mt-2">
                      {loading ? 'Loading…' : 'Load more'}
                    </button>
                  )}
                </div>
              )}

              {/* Mid ad */}
              {posts.length > 5 && <AdSlot className="h-14" />}
            </div>

            {/* ── Sidebar ── */}
            <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">

              {/* About */}
              <div className="rounded-2xl p-4 border border-[#1E3358]/50 bg-[#0B1628]/70">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={13} className="text-[#FF9A5C]" />
                  <p className="text-[10px] uppercase tracking-widest text-[#4A7AAA]">About</p>
                </div>
                <p className="text-[#4A7AAA] text-[10px] leading-relaxed">
                  A space for meditators to share experiences, ask questions, and celebrate progress. Be kind. Be real.
                </p>
              </div>

              {/* Stats */}
              <div className="rounded-2xl p-4 border border-[#1E3358]/50 bg-[#0B1628]/70">
                <p className="text-[10px] uppercase tracking-widest text-[#4A7AAA] mb-2">Community</p>
                <SidebarStat value={String(posts.length)} label="Posts loaded" />
                <SidebarStat value={String(posts.reduce((s, p) => s + p.likeCount, 0))} label="Total likes" />
                <SidebarStat value={String(posts.reduce((s, p) => s + p.commentCount, 0))} label="Total comments" />
              </div>

              {/* Rules */}
              <div className="rounded-2xl p-4 border border-[#1E3358]/50 bg-[#0B1628]/70">
                <p className="text-[10px] uppercase tracking-widest text-[#4A7AAA] mb-3">House rules</p>
                {['Be supportive', 'Stay on topic', 'No spam', 'Respect privacy'].map((r, i) => (
                  <div key={r} className="flex items-center gap-2 py-1.5 border-b border-[#1E3358]/20 last:border-0">
                    <span className="text-[#3D6080] text-[9px] font-mono">{i + 1}</span>
                    <span className="text-[#4A7AAA] text-[10px]">{r}</span>
                  </div>
                ))}
              </div>

              {/* CTA for logged-out */}
              {!isLoggedIn && (
                <div className="rounded-2xl p-4 border border-[#2A5499]/30 bg-[#0D1B33]/70 flex flex-col gap-3">
                  <p className="text-[#4A9EFF] text-xs font-medium">Join Breathe</p>
                  <p className="text-[#4A7AAA] text-[10px] leading-relaxed">Create an account to post, comment, and track your meditation journey.</p>
                  <Link to="/register" className="w-full py-2 rounded-xl text-[10px] text-white text-center font-medium transition-all"
                    style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
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
      {showLogin  && <LoginNudge onClose={() => setShowLogin(false)} />}
    </div>
  );
}