// src/components/community/CommunitySidebar.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Tag, Users, Bot } from 'lucide-react';
import api from '../../api';
import { useThemeStyles } from '../../hooks/useThemeStyles';

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

interface SidebarData {
  topTags: string[];
  topUsers: { _id: string; name: string; postCount: number }[];
  popularPosts: { _id: string; text: string; tags: string[]; likeCount: number }[];
}

function SidebarBlock({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const ts = useThemeStyles();
  return (
    <div className="rounded-2xl p-4 border flex flex-col gap-3"
      style={{ background: ts.cardBg, borderColor: ts.border }}>
      <div className="flex items-center gap-2">
        <span style={{ color: ts.accent }}>{icon}</span>
        <p className="t-label uppercase tracking-widest font-semibold" style={{ color: ts.textSecondary }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function SkeletonLine({ width = '100%' }: { width?: string | number }) {
  const ts = useThemeStyles();
  return <div className="h-3 rounded-full animate-pulse" style={{ width, background: ts.border }} />;
}

export default function CommunitySidebar({ onTagClick }: {
  onTagClick: (tag: string) => void;
}) {
  const ts = useThemeStyles();
  const [data, setData] = useState<SidebarData | null>(null);

  useEffect(() => {
    api.get('/community/sidebar')
      .then(r => setData(r.data))
      .catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">

      {/* Popular topics */}
      <SidebarBlock title="Hot topics" icon={<Flame size={13} />}>
        {data ? (
          data.popularPosts.length === 0 ? (
            <p className="t-caption" style={{ color: ts.textDim }}>No posts yet this week</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.popularPosts.map(p => (
                <Link key={String(p._id)} to={`/community/post/${p._id}`}
                  className="block t-caption leading-snug transition-opacity hover:opacity-70"
                  style={{ color: ts.textMuted }}>
                  {p.text.slice(0, 70)}{p.text.length > 70 ? '…' : ''}
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2">
            <SkeletonLine width="90%" />
            <SkeletonLine width="75%" />
            <SkeletonLine width="80%" />
          </div>
        )}
      </SidebarBlock>

      {/* Top tags */}
      <SidebarBlock title="Top tags" icon={<Tag size={13} />}>
        {data ? (
          data.topTags.length === 0 ? (
            <p className="t-caption" style={{ color: ts.textDim }}>No tags yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {data.topTags.map(tag => {
                const tc = pickTagColor(tag);
                return (
                  <button key={tag}
                    onClick={() => onTagClick(tag)}
                    className="t-label px-2 py-0.5 rounded-full transition-opacity hover:opacity-70"
                    style={{ backgroundColor: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                    #{tag}
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {[50, 65, 45, 70, 55].map((w, i) => (
              <div key={i} className="h-5 rounded-full animate-pulse"
                style={{ width: w, background: ts.border }} />
            ))}
          </div>
        )}
      </SidebarBlock>

      {/* Active users */}
      <SidebarBlock title="Active this week" icon={<Users size={13} />}>
        {data ? (
          data.topUsers.length === 0 ? (
            <p className="t-caption" style={{ color: ts.textDim }}>No activity yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.topUsers.map(u => (
                <div key={String(u._id)} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center font-bold"
                      style={{ background: ts.btnGradient, color: '#fff', fontSize: 9 }}>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="t-caption truncate" style={{ color: ts.textSecondary }}>{u.name}</span>
                  </div>
                  <span className="t-label flex-shrink-0" style={{ color: ts.textDim }}>
                    {u.postCount} post{u.postCount !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: ts.border }} />
                <SkeletonLine width="60%" />
              </div>
            ))}
          </div>
        )}
      </SidebarBlock>

      {/* AI Coach CTA */}
      <div className="rounded-2xl p-4 border flex flex-col gap-3"
        style={{ background: `${ts.accent}08`, borderColor: `${ts.accent}25` }}>
        <div className="flex items-center gap-2">
          <Bot size={13} style={{ color: ts.accent }} />
          <p className="t-label uppercase tracking-widest font-semibold" style={{ color: ts.textSecondary }}>
            AI Coach
          </p>
        </div>
        <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
          Get personalized breathing guidance from your AI coach.
        </p>
        <Link to="/coach"
          className="t-caption font-medium transition-opacity hover:opacity-70"
          style={{ color: ts.accent }}>
          Open coach →
        </Link>
      </div>

    </aside>
  );
}
