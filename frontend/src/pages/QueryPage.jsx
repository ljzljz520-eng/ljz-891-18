import React, { useState } from 'react';
import { Search, ShieldCheck, AlertCircle, FileSearch, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function QueryPage() {
  const [qq, setQq] = useState('');
  const [owner, setOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleQuery = async (e) => {
    e.preventDefault();
    const trimmedQq = qq.trim();
    const trimmedOwner = owner.trim();
    if (!trimmedQq || !trimmedOwner) {
      toast.error('请输入完整的查询信息');
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await axios.get('/api/license/query', {
        params: { qq: trimmedQq, owner: trimmedOwner },
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

  const isValid = result && new Date(String(result.expiration).replace(' ', 'T')) > new Date();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <header className="text-center mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          正版授权<span className="text-sky-400">查询</span>
        </h1>
        <p className="mt-3 text-white/50 text-sm sm:text-base">
          输入授权 QQ 与授权主人，实时验证授权状态
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          授权数据实时联网验证中
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Query Form — on mobile this comes first */}
        <section className="md:col-span-5">
          <div className="glass-card p-6 h-full">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                <Search size={16} />
              </div>
              <h2 className="text-base font-semibold text-white">查询信息</h2>
            </div>

            <form onSubmit={handleQuery} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/50">授权 QQ</label>
                <div className="relative">
                  <input
                    type="text"
                    value={qq}
                    onChange={(e) => setQq(e.target.value)}
                    className="glass-input w-full pl-10 h-11"
                    placeholder="请输入QQ号码"
                    autoComplete="off"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/50">授权主人</label>
                <div className="relative">
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="glass-input w-full pl-10 h-11"
                    placeholder="请输入主人名称"
                    autoComplete="off"
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tech-button w-full h-11 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    正在验证...
                  </span>
                ) : (
                  '立即查询'
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Result Area — on mobile this comes after the form */}
        <section className="md:col-span-7">
          {result ? (
            <div className="glass-card p-6 h-full border-l-4 border-l-emerald-500 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-full bg-emerald-500/15 text-emerald-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">查询成功</h3>
                  <p className="text-emerald-400/80 text-xs">已验证为正版授权</p>
                </div>
                <span
                  className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    isValid
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isValid ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  {isValid ? '授权有效' : '已过期'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultItem label="授权QQ" value={result.qq} />
                <ResultItem label="授权主人" value={result.owner} />
                <ResultItem label="所属产品" value={result.product} />
                <ResultItem label="授权上级" value={result.upline} />
                <ResultItem label="开通时间" value={formatDate(result.created_at)} />
                <ResultItem label="授权有效期" value={formatDate(result.expiration)} />
              </div>
            </div>
          ) : error ? (
            <div className="glass-card p-6 h-full border-l-4 border-l-red-500 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-full bg-red-500/15 text-red-400">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">查询失败</h3>
                  <p className="text-red-400/80 text-xs">未查询到授权信息</p>
                </div>
              </div>

              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-white/70 text-sm">{error.message}</p>
                <p className="text-white/40 text-xs font-medium mt-3 mb-2">可能的原因：</p>
                <ul className="space-y-1.5">
                  {error.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2 text-white/50 text-sm">
                      <span className="text-red-400/60 shrink-0">·</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 h-full">
              <div className="flex flex-col items-center justify-center text-center py-10 sm:py-14">
                <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400/70 mb-4">
                  <FileSearch size={32} />
                </div>
                <p className="text-white/60 font-medium">等待查询</p>
                <p className="text-white/35 text-sm mt-1.5 max-w-xs">
                  输入授权 QQ 与授权主人，点击「立即查询」，授权结果将在此展示
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ResultItem({ label, value }) {
  return (
    <div className="bg-white/5 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
      <span className="text-white/50 text-sm shrink-0">{label}</span>
      <span className="text-sky-300 font-medium text-sm text-right truncate">{value}</span>
    </div>
  );
}
