import React, { useState } from 'react';
import { Search, ShieldCheck, AlertCircle, Hash, User, FileSearch } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function QueryPage() {
  const [qq, setQq] = useState('');
  const [owner, setOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleQuery = async (e) => {
    e.preventDefault();
    if (loading) return;

    const q = qq.trim();
    const o = owner.trim();
    if (!q || !o) {
      toast.error('请输入完整查询信息');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await axios.get('/api/license/query', {
        params: { qq: q, owner: o },
        timeout: 10000,
      });
      setResult(res.data.data);
    } catch (err) {
      if (err.response?.data?.reasons) {
        setError(err.response.data);
      } else {
        toast.error('查询服务异常，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 页头 */}
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400 mb-4">
          <ShieldCheck size={26} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">正版授权查询</h1>
        <p className="mt-3 text-sm text-white/50 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          实时联网验证 · 数据官方同步
        </p>
      </header>

      {/* 手机端：先表单后结果（纵向排列）；桌面端：左表单右结果 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* 查询表单 */}
        <section className="lg:col-span-2 glass-card p-6">
          <form onSubmit={handleQuery} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="qq" className="block text-xs font-semibold text-white/50 uppercase tracking-wider">
                授权QQ
              </label>
              <div className="relative">
                <input
                  id="qq"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={11}
                  value={qq}
                  onChange={(e) => setQq(e.target.value.replace(/\D/g, ''))}
                  className="glass-input w-full h-11 pl-10"
                  placeholder="请输入QQ号码"
                />
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="owner" className="block text-xs font-semibold text-white/50 uppercase tracking-wider">
                授权主人
              </label>
              <div className="relative">
                <input
                  id="owner"
                  type="text"
                  autoComplete="off"
                  maxLength={30}
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="glass-input w-full h-11 pl-10"
                  placeholder="请输入主人名称"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tech-button w-full h-11 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  正在查询…
                </>
              ) : (
                <>
                  <Search size={16} />
                  立即查询
                </>
              )}
            </button>
          </form>
        </section>

        {/* 查询结果 / 失败说明（桌面端无结果时显示占位卡片） */}
        <section className="lg:col-span-3" aria-live="polite">
          {result ? (
            <ResultCard result={result} />
          ) : error ? (
            <ErrorCard error={error} />
          ) : (
            <div className="hidden lg:flex glass-card p-6 min-h-[292px] flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 text-white/30 flex items-center justify-center mb-4">
                <FileSearch size={24} />
              </div>
              <p className="text-sm text-white/50">查询结果将在此处显示</p>
              <p className="text-xs text-white/30 mt-2">请先在左侧输入授权QQ与授权主人</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ResultCard({ result }) {
  return (
    <div className="glass-card p-6 border-l-4 border-l-emerald-500 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">查询成功</h3>
          <p className="text-sm text-emerald-400 mt-0.5">该授权为正版授权，受官方保障</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultItem label="授权QQ" value={result.qq} mono />
        <ResultItem label="授权主人" value={result.owner} />
        <ResultItem label="所属产品" value={result.product} />
        <ResultItem label="授权上级" value={result.upline} />
        <ResultItem label="开通时间" value={result.created_at} />
        <ResultItem label="授权有效期" value={result.expiration} />
      </dl>
    </div>
  );
}

function ResultItem({ label, value, mono = false }) {
  return (
    <div className="bg-white/5 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
      <dt className="text-sm text-white/50 shrink-0">{label}</dt>
      <dd
        className={`text-sm text-sky-300 font-medium text-right truncate ${mono ? 'font-mono' : ''}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function ErrorCard({ error }) {
  return (
    <div className="glass-card p-6 border-l-4 border-l-red-500 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
          <AlertCircle size={22} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">查询失败</h3>
          <p className="text-sm text-red-400 mt-0.5">{error.message}</p>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-sm font-semibold text-white/80 mb-3">未查询到授权信息，可能的原因：</p>
        <ul className="space-y-2 text-sm text-white/60">
          {error.reasons.map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 font-mono text-red-400/80">{i + 1}.</span>
              <span>{r.replace(/^\s*\d+\s*[.、．]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
