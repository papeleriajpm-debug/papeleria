import { useState, useEffect, useCallback, useRef } from "react";

// ============================================
// ⚠️ CONFIGURACIÓN - REEMPLAZA ESTOS VALORES
// ============================================
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU-ANON-KEY-AQUI";

// Mini Supabase client
const supabase = {
  from: (table) => {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    let headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
    let params = new URLSearchParams();
    let method = "GET"; let body = null;
    const b = {
      select: (c = "*") => { params.set("select", c); return b; },
      eq: (c, v) => { params.append(c, `eq.${v}`); return b; },
      neq: (c, v) => { params.append(c, `neq.${v}`); return b; },
      or: (expr) => { params.append("or", `(${expr})`); return b; },
      ilike: (c, v) => { params.append(c, `ilike.${v}`); return b; },
      order: (c, o = {}) => { params.set("order", `${c}.${o.ascending ? "asc" : "desc"}`); return b; },
      limit: (n) => { params.set("limit", n); return b; },
      insert: (d) => { method = "POST"; body = JSON.stringify(Array.isArray(d) ? d : [d]); return b; },
      update: (d) => { method = "PATCH"; body = JSON.stringify(d); return b; },
      delete: () => { method = "DELETE"; return b; },
      then: async (res, rej) => {
        try {
          const q = params.toString();
          const r = await fetch(q ? `${url}?${q}` : url, { method, headers, body });
          if (!r.ok) { const e = await r.json().catch(() => ({ message: r.statusText })); res({ data: null, error: e }); }
          else { const d = method === "DELETE" && r.status === 204 ? [] : await r.json(); res({ data: d, error: null }); }
        } catch (e) { (rej || res)({ data: null, error: e }); }
      },
    };
    return b;
  },
};

// ============================================
// ICONS
// ============================================
const I = {
  Package: (p) => <svg {...{width:20,height:20,fill:"none",stroke:"currentColor",strokeWidth:2,viewBox:"0 0 24 24",...p}}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>,
  Tag: (p) => <svg {...{width:20,height:20,fill:"none",stroke:"currentColor",strokeWidth:2,viewBox:"0 0 24 24",...p}}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Move: (p) => <svg {...{width:20,height:20,fill:"none",stroke:"currentColor",strokeWidth:2,viewBox:"0 0 24 24",...p}}><path d="M7 3v18M7 3l-4 4M7 3l4 4M17 21V3M17 21l-4-4M17 21l4-4"/></svg>,
  Chart: (p) => <svg {...{width:20,height:20,fill:"none",stroke:"currentColor",strokeWidth:2,viewBox:"0 0 24 24",...p}}><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>,
  Cart: (p) => <svg {...{width:20,height:20,fill:"none",stroke:"currentColor",strokeWidth:2,viewBox:"0 0 24 24",...p}}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  Receipt: (p) => <svg {...{width:20,height:20,fill:"none",stroke:"currentColor",strokeWidth:2,viewBox:"0 0 24 24",...p}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  Users: (p) => <svg {...{width:20,height:20,fill:"none",stroke:"currentColor",strokeWidth:2,viewBox:"0 0 24 24",...p}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Scan: (p) => <svg {...{width:20,height:20,fill:"none",stroke:"currentColor",strokeWidth:2,viewBox:"0 0 24 24",...p}}><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>,
  Plus: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  X: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Edit: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Minus: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Camera: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Lock: () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Alert: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Dollar: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Up: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Down: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Check: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Store: () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Menu: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Logout: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
};

// ============================================
// CSS
// ============================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#f5f3f0;--card:#fff;--side:#16163a;--side-h:#222255;--side-a:#2d2d66;--t1:#16163a;--t2:#6b7280;--t-side:#9a9cc0;--t-side-a:#fff;--accent:#5046e5;--accent-l:#edeaff;--accent-h:#3f37c9;--border:#e4e5ea;--ok:#0d9668;--ok-l:#e6fbf2;--err:#e03e3e;--err-l:#fef0f0;--warn:#e5920a;--warn-l:#fef9eb;--r:12px;--rs:8px;--s1:0 1px 2px rgba(0,0,0,.04);--s2:0 4px 14px rgba(0,0,0,.07);--s3:0 10px 40px rgba(0,0,0,.1)}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--t1);-webkit-font-smoothing:antialiased}
.app{display:flex;min-height:100vh}
/* Sidebar */
.side{width:260px;background:var(--side);padding:20px 14px;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100;transition:transform .3s}
.side-logo{display:flex;align-items:center;gap:12px;padding:4px 12px 24px;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:20px}
.side-logo-i{width:42px;height:42px;background:var(--accent);border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff}
.side-logo h1{font-family:'Outfit',sans-serif;font-size:17px;font-weight:700;color:#fff;line-height:1.2}
.side-logo span{font-size:11px;color:var(--t-side);font-weight:400;letter-spacing:.5px;text-transform:uppercase}
.side-section{font-size:10px;font-weight:700;color:rgba(255,255,255,.25);letter-spacing:1px;text-transform:uppercase;padding:16px 16px 8px;margin-top:4px}
.nav{display:flex;align-items:center;gap:11px;padding:11px 16px;border-radius:10px;cursor:pointer;color:var(--t-side);font-size:14px;font-weight:500;transition:all .15s;margin-bottom:2px;border:none;background:none;width:100%;text-align:left;position:relative}
.nav:hover{background:var(--side-h);color:#d1d5db}
.nav.on{background:var(--side-a);color:var(--t-side-a)}
.nav.on::before{content:'';position:absolute;left:0;width:3px;height:22px;background:var(--accent);border-radius:0 4px 4px 0}
.nav-b{margin-left:auto;background:var(--err);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px}
.side-foot{margin-top:auto;padding:12px;border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px}
.side-foot-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff}
.side-foot-info{flex:1;min-width:0}
.side-foot-name{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.side-foot-role{font-size:11px;color:var(--t-side);text-transform:capitalize}
/* Main */
.main{flex:1;margin-left:260px;padding:28px 32px;max-width:1200px}
.ph{margin-bottom:24px}.ph h2{font-family:'Outfit',sans-serif;font-size:24px;font-weight:700}.ph p{color:var(--t2);font-size:14px;margin-top:3px}
/* Stats */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:24px}
.sc{background:var(--card);border-radius:var(--r);padding:18px;box-shadow:var(--s1);border:1px solid var(--border);transition:transform .2s,box-shadow .2s}
.sc:hover{transform:translateY(-2px);box-shadow:var(--s2)}
.sc-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.sc-i{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center}
.sc-l{font-size:12px;color:var(--t2);font-weight:500}.sc-v{font-family:'Outfit',sans-serif;font-size:26px;font-weight:700}
/* Table */
.tc{background:var(--card);border-radius:var(--r);box-shadow:var(--s1);border:1px solid var(--border);overflow:hidden}
.tb{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--border);flex-wrap:wrap}
.sb{display:flex;align-items:center;gap:8px;background:var(--bg);border-radius:var(--rs);padding:8px 12px;flex:1;min-width:180px;border:1px solid var(--border);transition:border-color .2s}
.sb:focus-within{border-color:var(--accent)}.sb input{border:none;background:none;outline:none;font-size:14px;font-family:inherit;color:var(--t1);width:100%}.sb input::placeholder{color:#9ca3af}
.fs{padding:8px 12px;border-radius:var(--rs);border:1px solid var(--border);background:var(--bg);font-size:13px;font-family:inherit;color:var(--t1);cursor:pointer;outline:none}
.btn{display:inline-flex;align-items:center;gap:5px;padding:8px 16px;border-radius:var(--rs);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;border:none;transition:all .15s;white-space:nowrap}
.btn-p{background:var(--accent);color:#fff}.btn-p:hover{background:var(--accent-h);transform:translateY(-1px)}
.btn-ok{background:var(--ok);color:#fff}.btn-ok:hover{background:#078a5a}
.btn-err{background:var(--err);color:#fff}.btn-err:hover{background:#c62828}
.btn-g{background:transparent;color:var(--t2);padding:6px 9px}.btn-g:hover{background:var(--bg);color:var(--t1)}
.btn-o{background:transparent;color:var(--accent);border:1px solid var(--accent);padding:7px 14px}.btn-o:hover{background:var(--accent-l)}
.btn-w{background:var(--warn);color:#fff}.btn-w:hover{background:#cc8500}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:10px 18px;font-size:11px;font-weight:600;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;background:var(--bg);border-bottom:1px solid var(--border)}
td{padding:12px 18px;font-size:13px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
tr:hover td{background:#fafafa}
.badge{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600}
.b-ok{background:var(--ok-l);color:#065f46}.b-lo{background:var(--warn-l);color:#92400e}.b-out{background:var(--err-l);color:#991b1b}
.b-in{background:var(--ok-l);color:#065f46}.b-sal{background:var(--err-l);color:#991b1b}
.cdot{display:inline-flex;align-items:center;gap:5px;font-size:12px}.cdot::before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}
/* Modal */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;animation:fi .2s}
.md{background:var(--card);border-radius:16px;padding:24px;width:92%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:var(--s3);animation:su .3s}
.md h3{font-family:'Outfit',sans-serif;font-size:18px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between}
.fg{margin-bottom:14px}.fg label{display:block;font-size:12px;font-weight:600;color:var(--t2);margin-bottom:5px;text-transform:uppercase;letter-spacing:.3px}
.fg input,.fg select,.fg textarea{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--rs);font-size:14px;font-family:inherit;color:var(--t1);background:var(--bg);outline:none;transition:border-color .2s}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(80,70,229,.1)}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fa{display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid var(--border)}
.empty{text-align:center;padding:40px 20px;color:var(--t2)}.empty p{font-size:14px;margin-bottom:14px}
/* Toast */
.toast{position:fixed;bottom:20px;right:20px;padding:12px 18px;border-radius:var(--rs);color:#fff;font-weight:500;font-size:14px;z-index:300;animation:su .3s;box-shadow:var(--s3)}
.toast-ok{background:var(--ok)}.toast-err{background:var(--err)}
/* POS */
.pos{display:grid;grid-template-columns:1fr 380px;gap:20px;height:calc(100vh - 120px)}
.pos-left{overflow-y:auto}.pos-right{background:var(--card);border-radius:var(--r);border:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.pos-head{padding:16px 18px;border-bottom:1px solid var(--border);font-family:'Outfit',sans-serif;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:space-between}
.pos-items{flex:1;overflow-y:auto;padding:8px 0}
.pos-item{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #f3f4f6}
.pos-item-info{flex:1;min-width:0}
.pos-item-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pos-item-price{font-size:12px;color:var(--t2)}
.pos-qty{display:flex;align-items:center;gap:4px}
.pos-qty button{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.pos-qty button:hover{border-color:var(--accent);color:var(--accent)}
.pos-qty span{font-size:14px;font-weight:700;min-width:28px;text-align:center}
.pos-total{padding:16px 18px;border-top:1px solid var(--border);background:#fafafa}
.pos-total-row{display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;color:var(--t2)}
.pos-total-big{font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;display:flex;justify-content:space-between;margin:10px 0 14px;color:var(--t1)}
/* Scanner */
.scanner-area{position:relative;background:#000;border-radius:var(--r);overflow:hidden;margin-bottom:16px;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center}
.scanner-area video{width:100%;height:100%;object-fit:cover}
.scanner-line{position:absolute;left:10%;right:10%;height:2px;background:var(--err);box-shadow:0 0 8px var(--err);animation:scanline 2s ease-in-out infinite}
.scanner-corners{position:absolute;inset:15%;border:2px solid rgba(255,255,255,.4);border-radius:8px}
.scanner-msg{color:rgba(255,255,255,.7);font-size:14px;text-align:center}
@keyframes scanline{0%,100%{top:20%}50%{top:70%}}
/* Login */
.login{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#16163a 0%,#2d2d66 50%,#5046e5 100%)}
.login-card{background:var(--card);border-radius:20px;padding:40px;width:90%;max-width:400px;box-shadow:var(--s3);text-align:center}
.login-card h1{font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;margin:16px 0 4px}
.login-card p{color:var(--t2);font-size:14px;margin-bottom:28px}
.pin-dots{display:flex;gap:12px;justify-content:center;margin:24px 0}
.pin-dot{width:16px;height:16px;border-radius:50%;border:2px solid var(--border);transition:all .2s}
.pin-dot.filled{background:var(--accent);border-color:var(--accent)}
.pin-dot.err{background:var(--err);border-color:var(--err);animation:shake .4s}
.pin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:260px;margin:0 auto}
.pin-btn{height:54px;border-radius:12px;border:1px solid var(--border);background:var(--bg);font-size:20px;font-weight:600;font-family:'Outfit',sans-serif;cursor:pointer;transition:all .15s}
.pin-btn:hover{background:var(--accent-l);border-color:var(--accent)}
.pin-btn:active{transform:scale(.95)}
.login-users{margin-top:24px;border-top:1px solid var(--border);padding-top:20px}
.login-users p{font-size:12px;color:var(--t2);margin-bottom:10px}
.login-user-btn{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:10px;background:none;cursor:pointer;transition:all .15s;margin-bottom:6px;text-align:left;font-family:inherit}
.login-user-btn:hover{border-color:var(--accent);background:var(--accent-l)}
.login-user-av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
/* Config banner */
.cb{background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #f59e0b;border-radius:var(--r);padding:14px 18px;margin-bottom:20px;display:flex;align-items:flex-start;gap:10px}
.cb h4{font-size:13px;font-weight:600;color:#92400e;margin-bottom:3px}.cb p{font-size:12px;color:#78350f;line-height:1.5}.cb code{background:rgba(0,0,0,.08);padding:1px 5px;border-radius:4px;font-size:11px}
/* Responsive */
@media(max-width:768px){.side{transform:translateX(-100%)}.side.open{transform:translateX(0)}.main{margin-left:0;padding:16px}.mh{display:flex!important;align-items:center;gap:10px;margin-bottom:16px}.mb{display:flex!important;width:38px;height:38px;align-items:center;justify-content:center;border-radius:10px;border:1px solid var(--border);background:#fff;cursor:pointer}.pos{grid-template-columns:1fr;height:auto}.pos-right{min-height:400px}.fr{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}table{min-width:600px}.tc{overflow-x:auto}}
.mh{display:none}.mb{display:none}.sov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99}
@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes su{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
`;

// ============================================
// DEMO DATA
// ============================================
const DEMO = {
  usuarios: [
    { id:'u1', nombre:'Administrador', email:'admin@papeleria.com', pin:'1234', rol:'admin', activo:true },
    { id:'u2', nombre:'María López', email:'maria@papeleria.com', pin:'5678', rol:'vendedor', activo:true },
  ],
  categorias: [
    { id:'c1', nombre:'Escritura', descripcion:'Lápices, plumas, marcadores', color:'#ef4444' },
    { id:'c2', nombre:'Papelería', descripcion:'Hojas, cuadernos, libretas', color:'#3b82f6' },
    { id:'c3', nombre:'Oficina', descripcion:'Clips, grapas, carpetas', color:'#10b981' },
    { id:'c4', nombre:'Escolar', descripcion:'Mochilas, colores, tijeras', color:'#f59e0b' },
    { id:'c5', nombre:'Tecnología', descripcion:'USB, calculadoras, tintas', color:'#8b5cf6' },
  ],
  productos: [
    { id:'p1', nombre:'Lápiz #2 Mirado', codigo_barras:'7501030425014', codigo_interno:'ESC-001', precio_compra:2.5, precio_venta:5, stock_actual:150, stock_minimo:20, unidad:'pieza', categoria:{nombre:'Escritura',color:'#ef4444'} },
    { id:'p2', nombre:'Pluma BIC azul', codigo_barras:'7501008003008', codigo_interno:'ESC-002', precio_compra:3, precio_venta:6.5, stock_actual:200, stock_minimo:30, unidad:'pieza', categoria:{nombre:'Escritura',color:'#ef4444'} },
    { id:'p3', nombre:'Cuaderno profesional 100h', codigo_barras:'7501014504018', codigo_interno:'PAP-001', precio_compra:18, precio_venta:35, stock_actual:80, stock_minimo:15, unidad:'pieza', categoria:{nombre:'Papelería',color:'#3b82f6'} },
    { id:'p4', nombre:'Hojas blancas carta (500)', codigo_barras:'7501014540009', codigo_interno:'PAP-002', precio_compra:85, precio_venta:130, stock_actual:3, stock_minimo:5, unidad:'paquete', categoria:{nombre:'Papelería',color:'#3b82f6'} },
    { id:'p5', nombre:'Clips estándar caja', codigo_barras:'7501030459019', codigo_interno:'OFI-001', precio_compra:8, precio_venta:15, stock_actual:60, stock_minimo:10, unidad:'caja', categoria:{nombre:'Oficina',color:'#10b981'} },
    { id:'p6', nombre:'Colores Prismacolor 24', codigo_barras:'7501058700124', codigo_interno:'ESC-003', precio_compra:120, precio_venta:199, stock_actual:2, stock_minimo:5, unidad:'caja', categoria:{nombre:'Escolar',color:'#f59e0b'} },
    { id:'p7', nombre:'Tijeras escolares', codigo_barras:'7501058700223', codigo_interno:'ESC-004', precio_compra:12, precio_venta:25, stock_actual:0, stock_minimo:10, unidad:'pieza', categoria:{nombre:'Escolar',color:'#f59e0b'} },
    { id:'p8', nombre:'Memoria USB 32GB', codigo_barras:'7501000900032', codigo_interno:'TEC-001', precio_compra:65, precio_venta:120, stock_actual:20, stock_minimo:5, unidad:'pieza', categoria:{nombre:'Tecnología',color:'#8b5cf6'} },
  ],
  ventas: [
    { id:'v1', folio:'V-0001', subtotal:46.5, total:46.5, descuento:0, metodo_pago:'efectivo', estado:'completada', created_at:new Date().toISOString(), usuario:{nombre:'María López'}, detalle_ventas:[{nombre_producto:'Pluma BIC azul',cantidad:3,precio_unitario:6.5,subtotal:19.5},{nombre_producto:'Cuaderno profesional 100h',cantidad:1,precio_unitario:35,subtotal:35}] },
    { id:'v2', folio:'V-0002', subtotal:199, total:199, descuento:0, metodo_pago:'tarjeta', estado:'completada', created_at:new Date(Date.now()-3600000).toISOString(), usuario:{nombre:'Administrador'}, detalle_ventas:[{nombre_producto:'Colores Prismacolor 24',cantidad:1,precio_unitario:199,subtotal:199}] },
  ],
  movimientos: [
    { id:'m1', tipo:'entrada', cantidad:50, motivo:'Compra proveedor', created_at:new Date().toISOString(), producto:{nombre:'Lápiz #2 Mirado'}, usuario:{nombre:'Administrador'} },
    { id:'m2', tipo:'salida', cantidad:10, motivo:'Merma', created_at:new Date().toISOString(), producto:{nombre:'Pluma BIC azul'}, usuario:{nombre:'Administrador'} },
  ],
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("pos");
  const [data, setData] = useState({ productos:[], categorias:[], movimientos:[], ventas:[], usuarios:[] });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cfg = SUPABASE_URL !== "https://TU-PROYECTO.supabase.co" && SUPABASE_ANON_KEY !== "TU-ANON-KEY-AQUI";

  const notify = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async () => {
    if (!cfg) { setData({ productos:DEMO.productos, categorias:DEMO.categorias, movimientos:DEMO.movimientos, ventas:DEMO.ventas, usuarios:DEMO.usuarios }); return; }
    setLoading(true);
    try {
      const [p,c,m,v,u] = await Promise.all([
        supabase.from("productos").select("*, categoria:categorias(nombre,color)").eq("activo",true).order("nombre",{ascending:true}),
        supabase.from("categorias").select("*").order("nombre",{ascending:true}),
        supabase.from("movimientos").select("*, producto:productos(nombre), usuario:usuarios(nombre)").order("created_at",{ascending:false}).limit(100),
        supabase.from("ventas").select("*, usuario:usuarios(nombre), detalle_ventas(*)").order("created_at",{ascending:false}).limit(100),
        supabase.from("usuarios").select("*").order("nombre",{ascending:true}),
      ]);
      setData({ productos:p.data||[], categorias:c.data||[], movimientos:m.data||[], ventas:v.data||[], usuarios:u.data||[] });
    } catch(e) { notify("Error al cargar datos","err"); }
    setLoading(false);
  },[cfg]);

  useEffect(()=>{ if(user) load(); },[user,load]);

  // Login with demo in non-configured mode
  const handleLogin = (u) => { setUser(u); };
  const handleLogout = () => { setUser(null); setPage("pos"); };

  if (!user) return <><style>{CSS}</style><LoginScreen usuarios={cfg ? null : DEMO.usuarios} onLogin={handleLogin} cfg={cfg} supabase={supabase} notify={notify} /></>;

  const isAdmin = user.rol === "admin";
  const lowStock = data.productos.filter(p => p.stock_actual <= p.stock_minimo).length;

  const navs = [
    { id:"pos", label:"Punto de Venta", icon:<I.Cart />, all:true },
    { id:"dashboard", label:"Dashboard", icon:<I.Chart />, all:false },
    { id:"productos", label:"Productos", icon:<I.Package />, all:false },
    { id:"categorias", label:"Categorías", icon:<I.Tag />, all:false },
    { id:"movimientos", label:"Inventario", icon:<I.Move />, all:false },
    { id:"ventas", label:"Historial Ventas", icon:<I.Receipt />, all:true },
    { id:"usuarios", label:"Usuarios", icon:<I.Users />, all:false },
  ];

  const visibleNavs = navs.filter(n => isAdmin || n.all);

  return (
    <><style>{CSS}</style>
    <div className="app">
      {sidebarOpen && <div className="sov" onClick={()=>setSidebarOpen(false)}/>}
      <nav className={`side ${sidebarOpen?"open":""}`}>
        <div className="side-logo"><div className="side-logo-i"><I.Store/></div><div><h1>Mi Papelería</h1><span>Inventario & Ventas</span></div></div>
        <div className="side-section">Ventas</div>
        {visibleNavs.filter(n=>["pos"].includes(n.id)).map(n=>(
          <button key={n.id} className={`nav ${page===n.id?"on":""}`} onClick={()=>{setPage(n.id);setSidebarOpen(false)}}>{n.icon}{n.label}</button>
        ))}
        {isAdmin && <div className="side-section">Administración</div>}
        {visibleNavs.filter(n=>!["pos"].includes(n.id)).map(n=>(
          <button key={n.id} className={`nav ${page===n.id?"on":""}`} onClick={()=>{setPage(n.id);setSidebarOpen(false)}}>
            {n.icon}{n.label}
            {n.id==="productos" && lowStock>0 && <span className="nav-b">{lowStock}</span>}
          </button>
        ))}
        <div className="side-foot">
          <div className="side-foot-av" style={{background:isAdmin?"var(--accent)":"var(--ok)"}}>{user.nombre[0]}</div>
          <div className="side-foot-info"><div className="side-foot-name">{user.nombre}</div><div className="side-foot-role">{user.rol}</div></div>
          <button className="btn btn-g" onClick={handleLogout} title="Cerrar sesión"><I.Logout/></button>
        </div>
      </nav>
      <main className="main">
        <div className="mh"><button className="mb" onClick={()=>setSidebarOpen(true)}><I.Menu/></button><h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700}}>Mi Papelería</h2></div>
        {!cfg && <div className="cb"><div style={{color:"#92400e",flexShrink:0,marginTop:2}}><I.Alert/></div><div><h4>Modo demostración</h4><p>Edita <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> para conectar tu base de datos real.</p></div></div>}
        {page==="pos" && <POSPage productos={data.productos} user={user} cfg={cfg} supabase={supabase} onRefresh={load} notify={notify}/>}
        {page==="dashboard" && isAdmin && <DashboardPage data={data} setPage={setPage}/>}
        {page==="productos" && isAdmin && <ProductosPage data={data} cfg={cfg} supabase={supabase} onRefresh={load} notify={notify}/>}
        {page==="categorias" && isAdmin && <CategoriasPage categorias={data.categorias} cfg={cfg} supabase={supabase} onRefresh={load} notify={notify}/>}
        {page==="movimientos" && isAdmin && <MovimientosPage data={data} user={user} cfg={cfg} supabase={supabase} onRefresh={load} notify={notify}/>}
        {page==="ventas" && <VentasPage ventas={data.ventas} isAdmin={isAdmin}/>}
        {page==="usuarios" && isAdmin && <UsuariosPage usuarios={data.usuarios} cfg={cfg} supabase={supabase} onRefresh={load} notify={notify}/>}
      </main>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div></>
  );
}

// ============================================
// LOGIN
// ============================================
function LoginScreen({ usuarios, onLogin, cfg, supabase: sb, notify }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [dbUsers, setDbUsers] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (cfg) { sb.from("usuarios").select("*").eq("activo",true).then(r => { if(r.data) setDbUsers(r.data); }); }
  },[cfg]);

  const allUsers = cfg ? dbUsers : usuarios;

  const handleDigit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      const target = selectedUser || (allUsers && allUsers[0]);
      if (target && target.pin === next) {
        setTimeout(() => onLogin(target), 200);
      } else {
        setError(true);
        setTimeout(() => { setPin(""); setError(false); }, 800);
      }
    }
  };

  const handleBackspace = () => { setPin(pin.slice(0,-1)); setError(false); };

  return (
    <div className="login">
      <div className="login-card">
        <I.Lock/>
        <h1>Mi Papelería</h1>
        <p>{selectedUser ? `Hola, ${selectedUser.nombre}` : "Ingresa tu PIN para acceder"}</p>
        <div className="pin-dots">
          {[0,1,2,3].map(i => <div key={i} className={`pin-dot ${i<pin.length ? (error?"err":"filled") : ""}`}/>)}
        </div>
        <div className="pin-grid">
          {[1,2,3,4,5,6,7,8,9].map(d => <button key={d} className="pin-btn" onClick={()=>handleDigit(String(d))}>{d}</button>)}
          <button className="pin-btn" onClick={handleBackspace}>←</button>
          <button className="pin-btn" onClick={()=>handleDigit("0")}>0</button>
          <button className="pin-btn" style={{visibility:"hidden"}}/>
        </div>
        {allUsers && allUsers.length > 0 && (
          <div className="login-users">
            <p>Selecciona tu usuario:</p>
            {allUsers.map(u => (
              <button key={u.id} className="login-user-btn" onClick={()=>{setSelectedUser(u);setPin("");}} style={selectedUser?.id===u.id?{borderColor:"var(--accent)",background:"var(--accent-l)"}:{}}>
                <div className="login-user-av" style={{background:u.rol==="admin"?"var(--accent)":"var(--ok)"}}>{u.nombre[0]}</div>
                <div><div style={{fontSize:13,fontWeight:600}}>{u.nombre}</div><div style={{fontSize:11,color:"var(--t2)",textTransform:"capitalize"}}>{u.rol}</div></div>
              </button>
            ))}
          </div>
        )}
        {!cfg && <p style={{fontSize:11,color:"var(--t2)",marginTop:16}}>Demo: PIN admin = <strong>1234</strong> | PIN vendedor = <strong>5678</strong></p>}
      </div>
    </div>
  );
}

// ============================================
// POS - PUNTO DE VENTA con ESCÁNER
// ============================================
function POSPage({ productos, user, cfg, supabase: sb, onRefresh, notify }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState("efectivo");
  const [montoRecibido, setMontoRecibido] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const searchRef = useRef(null);

  const subtotal = cart.reduce((s,i) => s + i.precio_venta * i.qty, 0);
  const total = subtotal;

  const addToCart = (p) => {
    if (p.stock_actual <= 0) return notify("Producto agotado","err");
    setCart(prev => {
      const exist = prev.find(i => i.id === p.id);
      if (exist) {
        if (exist.qty >= p.stock_actual) { notify("Stock insuficiente","err"); return prev; }
        return prev.map(i => i.id === p.id ? {...i, qty:i.qty+1} : i);
      }
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const nq = i.qty + delta;
      if (nq <= 0) return null;
      const prod = productos.find(p => p.id === id);
      if (prod && nq > prod.stock_actual) { notify("Stock insuficiente","err"); return i; }
      return {...i, qty: nq};
    }).filter(Boolean));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  // Barcode scanner using BarcodeDetector API
  const startScan = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      if ('BarcodeDetector' in window) {
        const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'] });
        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                handleBarcode(code);
              }
            } catch(e) {}
          }
        }, 300);
      } else {
        notify("Tu navegador no soporta escaneo. Usa Chrome o Edge.","err");
      }
    } catch(e) {
      notify("No se pudo acceder a la cámara","err");
      setScanning(false);
    }
  };

  const stopScan = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setScanning(false);
  };

  const handleBarcode = (code) => {
    const prod = productos.find(p => p.codigo_barras === code || p.codigo_interno === code);
    if (prod) {
      addToCart(prod);
      notify(`✓ ${prod.nombre} agregado`);
    } else {
      notify(`Código ${code} no encontrado`, "err");
    }
  };

  // Handle keyboard barcode scanner (many scanners type + Enter)
  useEffect(() => {
    let buffer = "";
    let timeout = null;
    const handler = (e) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "Enter" && buffer.length >= 4) {
        handleBarcode(buffer);
        buffer = "";
        return;
      }
      if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => { buffer = ""; }, 200);
      }
    };
    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); clearTimeout(timeout); };
  }, [productos, cart]);

  const handleManualBarcode = (e) => {
    if (e.key === "Enter" && search.trim()) {
      const prod = productos.find(p =>
        p.codigo_barras === search.trim() ||
        p.codigo_interno === search.trim().toUpperCase() ||
        p.nombre.toLowerCase().includes(search.trim().toLowerCase())
      );
      if (prod) { addToCart(prod); setSearch(""); notify(`✓ ${prod.nombre}`); }
      else notify("No encontrado","err");
    }
  };

  const filteredProducts = search.length >= 1
    ? productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()) || (p.codigo_barras||"").includes(search) || (p.codigo_interno||"").toLowerCase().includes(search.toLowerCase()))
    : productos;

  const handlePay = async () => {
    if (cart.length === 0) return;
    if (!cfg) { notify("Conecta Supabase para registrar ventas","err"); return; }

    const ventaData = {
      folio: "",
      usuario_id: user.id,
      subtotal: subtotal,
      descuento: 0,
      total: total,
      metodo_pago: payMethod,
      monto_recibido: payMethod === "efectivo" ? parseFloat(montoRecibido) || total : total,
      cambio: payMethod === "efectivo" ? Math.max(0, (parseFloat(montoRecibido)||total) - total) : 0,
    };

    const { data: venta, error: ve } = await sb.from("ventas").insert(ventaData);
    if (ve || !venta?.[0]) { notify(ve?.message || "Error al registrar venta","err"); return; }

    const detalles = cart.map(i => ({
      venta_id: venta[0].id,
      producto_id: i.id,
      nombre_producto: i.nombre,
      cantidad: i.qty,
      precio_unitario: i.precio_venta,
      subtotal: i.precio_venta * i.qty,
    }));

    const { error: de } = await sb.from("detalle_ventas").insert(detalles);
    if (de) { notify("Error al registrar detalle","err"); return; }

    notify(`Venta ${venta[0].folio} registrada correctamente`);
    setCart([]);
    setPayModal(false);
    setMontoRecibido("");
    onRefresh();
  };

  const cambio = payMethod === "efectivo" ? Math.max(0, (parseFloat(montoRecibido)||0) - total) : 0;

  return (
    <div>
      <div className="ph" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><h2>Punto de Venta</h2><p>Escanea o busca productos para vender</p></div>
        <button className="btn btn-p" onClick={scanning ? stopScan : startScan}>
          {scanning ? <><I.X/> Cerrar cámara</> : <><I.Camera/> Escanear</>}
        </button>
      </div>

      <div className="pos">
        {/* LEFT - Products */}
        <div className="pos-left">
          {scanning && (
            <div className="scanner-area">
              <video ref={videoRef} playsInline muted style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div className="scanner-line"/>
              <div className="scanner-corners"/>
            </div>
          )}

          <div className="tc" style={{marginBottom:16}}>
            <div className="tb">
              <div className="sb">
                <I.Scan/>
                <input
                  ref={searchRef}
                  placeholder="Buscar producto o escanear código..."
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  onKeyDown={handleManualBarcode}
                  autoFocus
                />
              </div>
            </div>
            <div style={{maxHeight:scanning?"250px":"400px",overflowY:"auto"}}>
              <table>
                <thead><tr><th>Producto</th><th>Código</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
                <tbody>
                  {filteredProducts.slice(0,20).map(p => (
                    <tr key={p.id} style={{cursor:"pointer"}} onClick={()=>addToCart(p)}>
                      <td style={{fontWeight:600}}>{p.nombre}</td>
                      <td style={{fontFamily:"monospace",fontSize:12,color:"var(--t2)"}}>{p.codigo_barras || p.codigo_interno || "—"}</td>
                      <td style={{fontWeight:600}}>${p.precio_venta?.toFixed(2)}</td>
                      <td><span className={`badge ${p.stock_actual<=0?"b-out":p.stock_actual<=p.stock_minimo?"b-lo":"b-ok"}`}>{p.stock_actual}</span></td>
                      <td><button className="btn btn-p" style={{padding:"5px 10px",fontSize:12}} disabled={p.stock_actual<=0}><I.Plus/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT - Cart */}
        <div className="pos-right">
          <div className="pos-head">
            <span>🛒 Carrito ({cart.reduce((s,i)=>s+i.qty,0)})</span>
            {cart.length>0 && <button className="btn btn-g" onClick={()=>setCart([])} style={{fontSize:12}}>Vaciar</button>}
          </div>
          <div className="pos-items">
            {cart.length===0 ? (
              <div className="empty"><p>Escanea o selecciona productos</p></div>
            ) : cart.map(item => (
              <div key={item.id} className="pos-item">
                <div className="pos-item-info">
                  <div className="pos-item-name">{item.nombre}</div>
                  <div className="pos-item-price">${item.precio_venta.toFixed(2)} × {item.qty} = ${(item.precio_venta * item.qty).toFixed(2)}</div>
                </div>
                <div className="pos-qty">
                  <button onClick={()=>updateQty(item.id,-1)}><I.Minus/></button>
                  <span>{item.qty}</span>
                  <button onClick={()=>updateQty(item.id,1)}><I.Plus/></button>
                </div>
                <button className="btn btn-g" onClick={()=>removeFromCart(item.id)} style={{color:"var(--err)"}}><I.Trash/></button>
              </div>
            ))}
          </div>
          <div className="pos-total">
            <div className="pos-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="pos-total-big"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button className="btn btn-ok" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:15}} onClick={()=>setPayModal(true)} disabled={cart.length===0}>
              <I.Dollar/> Cobrar ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {payModal && (
        <div className="mo" onClick={()=>setPayModal(false)}>
          <div className="md" onClick={e=>e.stopPropagation()} style={{maxWidth:420}}>
            <h3>Cobrar Venta <button className="btn btn-g" onClick={()=>setPayModal(false)}><I.X/></button></h3>
            <div style={{textAlign:"center",margin:"10px 0 20px"}}>
              <div style={{fontSize:14,color:"var(--t2)"}}>Total a cobrar</div>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:36,fontWeight:800,color:"var(--ok)"}}>${total.toFixed(2)}</div>
            </div>
            <div className="fg">
              <label>Método de pago</label>
              <div style={{display:"flex",gap:8}}>
                {["efectivo","tarjeta","transferencia"].map(m => (
                  <button key={m} className={`btn ${payMethod===m?"btn-p":"btn-o"}`} style={{flex:1,justifyContent:"center",textTransform:"capitalize"}} onClick={()=>setPayMethod(m)}>{m}</button>
                ))}
              </div>
            </div>
            {payMethod === "efectivo" && (
              <div className="fg">
                <label>Monto recibido</label>
                <input type="number" step="0.01" value={montoRecibido} onChange={e=>setMontoRecibido(e.target.value)} placeholder={total.toFixed(2)} autoFocus/>
                {cambio > 0 && <div style={{marginTop:8,padding:"10px 14px",background:"var(--ok-l)",borderRadius:8,fontWeight:700,color:"#065f46",textAlign:"center",fontSize:18}}>Cambio: ${cambio.toFixed(2)}</div>}
              </div>
            )}
            <div style={{margin:"16px 0 8px",padding:12,background:"var(--bg)",borderRadius:8,maxHeight:150,overflowY:"auto"}}>
              {cart.map(i => <div key={i.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0"}}><span>{i.qty}x {i.nombre}</span><span style={{fontWeight:600}}>${(i.precio_venta*i.qty).toFixed(2)}</span></div>)}
            </div>
            <div className="fa">
              <button className="btn btn-o" onClick={()=>setPayModal(false)}>Cancelar</button>
              <button className="btn btn-ok" onClick={handlePay} disabled={payMethod==="efectivo" && montoRecibido && parseFloat(montoRecibido)<total}>
                <I.Check/> Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// DASHBOARD
// ============================================
function DashboardPage({ data, setPage }) {
  const { productos:p, ventas:v, movimientos:m } = data;
  const totalProd = p.length;
  const totalStock = p.reduce((s,x)=>s+(x.stock_actual||0),0);
  const totalValue = p.reduce((s,x)=>s+(x.stock_actual||0)*(x.precio_venta||0),0);
  const lowStock = p.filter(x=>x.stock_actual<=x.stock_minimo);
  const ventasHoy = v.filter(x=>x.estado==="completada" && new Date(x.created_at).toDateString()===new Date().toDateString());
  const totalVentasHoy = ventasHoy.reduce((s,x)=>s+(x.total||0),0);

  return (
    <div>
      <div className="ph"><h2>Dashboard</h2><p>Resumen general del negocio</p></div>
      <div className="stats">
        <div className="sc"><div className="sc-h"><span className="sc-l">Productos</span><div className="sc-i" style={{background:"var(--accent-l)",color:"var(--accent)"}}><I.Package/></div></div><div className="sc-v">{totalProd}</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">Unidades Stock</span><div className="sc-i" style={{background:"var(--ok-l)",color:"var(--ok)"}}><I.Up/></div></div><div className="sc-v">{totalStock.toLocaleString()}</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">Valor Inventario</span><div className="sc-i" style={{background:"#ede9fe",color:"#7c3aed"}}><I.Dollar/></div></div><div className="sc-v">${totalValue.toLocaleString("es-MX",{maximumFractionDigits:0})}</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">Ventas Hoy</span><div className="sc-i" style={{background:"var(--ok-l)",color:"var(--ok)"}}><I.Cart/></div></div><div className="sc-v" style={{color:"var(--ok)"}}>${totalVentasHoy.toLocaleString("es-MX",{maximumFractionDigits:0})}</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">Alertas Stock</span><div className="sc-i" style={{background:"var(--warn-l)",color:"var(--warn)"}}><I.Alert/></div></div><div className="sc-v" style={{color:lowStock.length>0?"var(--warn)":"inherit"}}>{lowStock.length}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div className="tc">
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:600}}>⚠️ Stock Bajo</h3><button className="btn btn-g" onClick={()=>setPage("productos")} style={{fontSize:12}}>Ver todos →</button></div>
          {lowStock.length===0?<div className="empty"><p>Todo en orden</p></div>:
          <table><thead><tr><th>Producto</th><th>Stock</th><th>Min</th></tr></thead><tbody>
            {lowStock.slice(0,6).map(x=><tr key={x.id}><td style={{fontWeight:500}}>{x.nombre}</td><td><span className={`badge ${x.stock_actual<=0?"b-out":"b-lo"}`}>{x.stock_actual}</span></td><td>{x.stock_minimo}</td></tr>)}
          </tbody></table>}
        </div>
        <div className="tc">
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:600}}>🧾 Últimas Ventas</h3><button className="btn btn-g" onClick={()=>setPage("ventas")} style={{fontSize:12}}>Ver todas →</button></div>
          {v.length===0?<div className="empty"><p>Sin ventas</p></div>:
          <table><thead><tr><th>Folio</th><th>Total</th><th>Vendedor</th></tr></thead><tbody>
            {v.slice(0,6).map(x=><tr key={x.id}><td style={{fontWeight:600}}>{x.folio}</td><td style={{fontWeight:600,color:"var(--ok)"}}>${(x.total||0).toFixed(2)}</td><td style={{color:"var(--t2)"}}>{x.usuario?.nombre||"—"}</td></tr>)}
          </tbody></table>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRODUCTOS
// ============================================
function ProductosPage({ data, cfg, supabase: sb, onRefresh, notify }) {
  const { productos, categorias } = data;
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const filtered = productos.filter(p => {
    const ms = p.nombre.toLowerCase().includes(search.toLowerCase()) || (p.codigo_barras||"").includes(search) || (p.codigo_interno||"").toLowerCase().includes(search.toLowerCase());
    const mc = !filterCat || (p.categoria?.nombre||"") === filterCat;
    return ms && mc;
  });

  const openNew = () => { setForm({nombre:"",codigo_barras:"",codigo_interno:"",categoria_id:"",precio_compra:"",precio_venta:"",stock_actual:"0",stock_minimo:"5",unidad:"pieza"}); setModal("new"); };
  const openEdit = (p) => { setForm({...p}); setModal("edit"); };

  const save = async () => {
    if (!form.nombre) return notify("Nombre requerido","err");
    if (!cfg) return notify("Conecta Supabase","err");
    const d = { nombre:form.nombre, codigo_barras:form.codigo_barras||null, codigo_interno:form.codigo_interno||null, categoria_id:form.categoria_id||null, precio_compra:parseFloat(form.precio_compra)||0, precio_venta:parseFloat(form.precio_venta)||0, stock_actual:parseInt(form.stock_actual)||0, stock_minimo:parseInt(form.stock_minimo)||5, unidad:form.unidad||"pieza" };
    if (modal==="edit") { await sb.from("productos").update(d).eq("id",form.id); notify("Producto actualizado"); }
    else { const {error}=await sb.from("productos").insert(d); if(error) return notify(error.message||"Error","err"); notify("Producto creado"); }
    setModal(null); onRefresh();
  };

  const del = async (id) => { if(!cfg||!confirm("¿Eliminar?")) return; await sb.from("productos").update({activo:false}).eq("id",id); notify("Eliminado"); onRefresh(); };

  return (
    <div>
      <div className="ph" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><h2>Productos</h2><p>{productos.length} registrados</p></div><button className="btn btn-p" onClick={openNew}><I.Plus/> Nuevo</button></div>
      <div className="tc">
        <div className="tb">
          <div className="sb"><I.Search/><input placeholder="Buscar nombre, código de barras..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select className="fs" value={filterCat} onChange={e=>setFilterCat(e.target.value)}><option value="">Todas</option>{categorias.map(c=><option key={c.id||c.nombre} value={c.nombre}>{c.nombre}</option>)}</select>
        </div>
        {filtered.length===0?<div className="empty"><p>Sin productos</p><button className="btn btn-o" onClick={openNew}>Agregar</button></div>:
        <table><thead><tr><th>Producto</th><th>Cód. Barras</th><th>Cód. Interno</th><th>Categoría</th><th>P.Compra</th><th>P.Venta</th><th>Stock</th><th></th></tr></thead><tbody>
          {filtered.map(p=>{const c=p.categoria||{};const st=p.stock_actual<=0?"b-out":p.stock_actual<=p.stock_minimo?"b-lo":"b-ok";return(
            <tr key={p.id}><td style={{fontWeight:600}}>{p.nombre}</td><td style={{fontFamily:"monospace",fontSize:11,color:"var(--t2)"}}>{p.codigo_barras||"—"}</td><td style={{fontFamily:"monospace",fontSize:11,color:"var(--t2)"}}>{p.codigo_interno||"—"}</td><td><span className="cdot" style={{color:c.color||"#999"}}>{c.nombre||"—"}</span></td><td>${(p.precio_compra||0).toFixed(2)}</td><td style={{fontWeight:600}}>${(p.precio_venta||0).toFixed(2)}</td><td><span className={`badge ${st}`}>{p.stock_actual}</span></td>
              <td><div style={{display:"flex",gap:3}}><button className="btn btn-g" onClick={()=>openEdit(p)}><I.Edit/></button><button className="btn btn-g" onClick={()=>del(p.id)} style={{color:"var(--err)"}}><I.Trash/></button></div></td></tr>
          );})}
        </tbody></table>}
      </div>
      {modal && (
        <div className="mo" onClick={()=>setModal(null)}><div className="md" onClick={e=>e.stopPropagation()}>
          <h3>{modal==="edit"?"Editar":"Nuevo"} Producto <button className="btn btn-g" onClick={()=>setModal(null)}><I.X/></button></h3>
          <div className="fg"><label>Nombre *</label><input value={form.nombre||""} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej: Lápiz #2"/></div>
          <div className="fr"><div className="fg"><label>Código de Barras</label><input value={form.codigo_barras||""} onChange={e=>setForm({...form,codigo_barras:e.target.value})} placeholder="Escanear o escribir"/></div><div className="fg"><label>Código Interno</label><input value={form.codigo_interno||""} onChange={e=>setForm({...form,codigo_interno:e.target.value})} placeholder="ESC-001"/></div></div>
          <div className="fg"><label>Categoría</label><select value={form.categoria_id||""} onChange={e=>setForm({...form,categoria_id:e.target.value})}><option value="">Sin categoría</option>{categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
          <div className="fr"><div className="fg"><label>Precio Compra</label><input type="number" step="0.01" value={form.precio_compra||""} onChange={e=>setForm({...form,precio_compra:e.target.value})}/></div><div className="fg"><label>Precio Venta</label><input type="number" step="0.01" value={form.precio_venta||""} onChange={e=>setForm({...form,precio_venta:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label>Stock Actual</label><input type="number" value={form.stock_actual||""} onChange={e=>setForm({...form,stock_actual:e.target.value})}/></div><div className="fg"><label>Stock Mínimo</label><input type="number" value={form.stock_minimo||""} onChange={e=>setForm({...form,stock_minimo:e.target.value})}/></div></div>
          <div className="fg"><label>Unidad</label><select value={form.unidad||"pieza"} onChange={e=>setForm({...form,unidad:e.target.value})}><option value="pieza">Pieza</option><option value="caja">Caja</option><option value="paquete">Paquete</option><option value="rollo">Rollo</option><option value="metro">Metro</option></select></div>
          <div className="fa"><button className="btn btn-o" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-p" onClick={save}>{modal==="edit"?"Guardar":"Crear"}</button></div>
        </div></div>
      )}
    </div>
  );
}

// ============================================
// CATEGORÍAS
// ============================================
function CategoriasPage({ categorias, cfg, supabase: sb, onRefresh, notify }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const colors = ["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#6366f1","#14b8a6"];

  const openNew = () => { setForm({nombre:"",descripcion:"",color:"#6366f1"}); setModal("new"); };
  const openEdit = (c) => { setForm({...c}); setModal("edit"); };

  const save = async () => {
    if(!form.nombre) return notify("Nombre requerido","err");
    if(!cfg) return notify("Conecta Supabase","err");
    const d = { nombre:form.nombre, descripcion:form.descripcion||null, color:form.color };
    if(modal==="edit") { await sb.from("categorias").update(d).eq("id",form.id); notify("Actualizada"); }
    else { const{error}=await sb.from("categorias").insert(d); if(error) return notify(error.message||"Error","err"); notify("Creada"); }
    setModal(null); onRefresh();
  };

  const del = async (id) => { if(!cfg||!confirm("¿Eliminar?")) return; await sb.from("categorias").delete().eq("id",id); notify("Eliminada"); onRefresh(); };

  return (
    <div>
      <div className="ph" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><h2>Categorías</h2><p>Organiza tus productos</p></div><button className="btn btn-p" onClick={openNew}><I.Plus/> Nueva</button></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:14}}>
        {categorias.map(c=>(
          <div key={c.id} className="sc" style={{borderLeft:`4px solid ${c.color}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:600,marginBottom:3}}>{c.nombre}</h3><p style={{fontSize:12,color:"var(--t2)"}}>{c.descripcion||"Sin descripción"}</p></div><div style={{display:"flex",gap:3}}><button className="btn btn-g" onClick={()=>openEdit(c)}><I.Edit/></button><button className="btn btn-g" onClick={()=>del(c.id)} style={{color:"var(--err)"}}><I.Trash/></button></div></div></div>
        ))}
      </div>
      {modal && (
        <div className="mo" onClick={()=>setModal(null)}><div className="md" onClick={e=>e.stopPropagation()}>
          <h3>{modal==="edit"?"Editar":"Nueva"} Categoría <button className="btn btn-g" onClick={()=>setModal(null)}><I.X/></button></h3>
          <div className="fg"><label>Nombre *</label><input value={form.nombre||""} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
          <div className="fg"><label>Descripción</label><input value={form.descripcion||""} onChange={e=>setForm({...form,descripcion:e.target.value})}/></div>
          <div className="fg"><label>Color</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{colors.map(c=><button key={c} onClick={()=>setForm({...form,color:c})} style={{width:34,height:34,borderRadius:10,background:c,border:form.color===c?"3px solid var(--t1)":"3px solid transparent",cursor:"pointer"}}/>)}</div></div>
          <div className="fa"><button className="btn btn-o" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-p" onClick={save}>{modal==="edit"?"Guardar":"Crear"}</button></div>
        </div></div>
      )}
    </div>
  );
}

// ============================================
// MOVIMIENTOS (Entradas/Salidas manuales)
// ============================================
function MovimientosPage({ data, user, cfg, supabase: sb, onRefresh, notify }) {
  const { movimientos, productos } = data;
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filterType, setFilterType] = useState("");

  const filtered = movimientos.filter(m => !filterType || m.tipo === filterType);

  const openNew = (tipo) => { setForm({producto_id:"",tipo,cantidad:"",motivo:""}); setModal("new"); };

  const save = async () => {
    if(!form.producto_id||!form.cantidad) return notify("Producto y cantidad requeridos","err");
    if(!cfg) return notify("Conecta Supabase","err");
    if(form.tipo==="salida") { const p=productos.find(x=>x.id===form.producto_id); if(p&&parseInt(form.cantidad)>p.stock_actual) return notify(`Stock insuficiente (${p.stock_actual})`,"err"); }
    const{error}=await sb.from("movimientos").insert({ producto_id:form.producto_id, usuario_id:user.id, tipo:form.tipo, cantidad:parseInt(form.cantidad), motivo:form.motivo||null });
    if(error) return notify(error.message||"Error","err");
    notify(form.tipo==="entrada"?"Entrada registrada":"Salida registrada"); setModal(null); onRefresh();
  };

  const fmt = d => d ? new Date(d).toLocaleDateString("es-MX",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "—";

  return (
    <div>
      <div className="ph" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><h2>Inventario</h2><p>Entradas y salidas de stock</p></div>
        <div style={{display:"flex",gap:8}}><button className="btn btn-ok" onClick={()=>openNew("entrada")}><I.Up/> Entrada</button><button className="btn btn-err" onClick={()=>openNew("salida")}><I.Down/> Salida</button></div>
      </div>
      <div className="tc">
        <div className="tb"><select className="fs" value={filterType} onChange={e=>setFilterType(e.target.value)}><option value="">Todos</option><option value="entrada">Entradas</option><option value="salida">Salidas</option></select></div>
        {filtered.length===0?<div className="empty"><p>Sin movimientos</p></div>:
        <table><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th><th>Usuario</th></tr></thead><tbody>
          {filtered.map(m=><tr key={m.id}><td style={{color:"var(--t2)",fontSize:12}}>{fmt(m.created_at)}</td><td style={{fontWeight:500}}>{m.producto?.nombre||"—"}</td><td><span className={`badge ${m.tipo==="entrada"?"b-in":"b-sal"}`}>{m.tipo==="entrada"?"↑ Entrada":"↓ Salida"}</span></td><td style={{fontWeight:600}}>{m.cantidad}</td><td style={{color:"var(--t2)"}}>{m.motivo||"—"}</td><td style={{color:"var(--t2)",fontSize:12}}>{m.usuario?.nombre||"—"}</td></tr>)}
        </tbody></table>}
      </div>
      {modal && (
        <div className="mo" onClick={()=>setModal(null)}><div className="md" onClick={e=>e.stopPropagation()}>
          <h3>{form.tipo==="entrada"?"↑ Entrada":"↓ Salida"} de Inventario <button className="btn btn-g" onClick={()=>setModal(null)}><I.X/></button></h3>
          <div className="fg"><label>Producto *</label><select value={form.producto_id||""} onChange={e=>setForm({...form,producto_id:e.target.value})}><option value="">Seleccionar...</option>{productos.map(p=><option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>)}</select></div>
          <div className="fg"><label>Cantidad *</label><input type="number" min="1" value={form.cantidad||""} onChange={e=>setForm({...form,cantidad:e.target.value})}/></div>
          <div className="fg"><label>Motivo</label><select value={form.motivo||""} onChange={e=>setForm({...form,motivo:e.target.value})}><option value="">Seleccionar...</option>
            {form.tipo==="entrada"?<>{["Compra proveedor","Reposición","Devolución cliente","Ajuste inventario"].map(m=><option key={m}>{m}</option>)}</>:
            <>{["Merma / Daño","Devolución proveedor","Ajuste inventario","Muestra / Regalo"].map(m=><option key={m}>{m}</option>)}</>}
          </select></div>
          <div className="fa"><button className="btn btn-o" onClick={()=>setModal(null)}>Cancelar</button><button className={`btn ${form.tipo==="entrada"?"btn-ok":"btn-err"}`} onClick={save}>Registrar</button></div>
        </div></div>
      )}
    </div>
  );
}

// ============================================
// VENTAS
// ============================================
function VentasPage({ ventas, isAdmin }) {
  const [expanded, setExpanded] = useState(null);
  const fmt = d => d ? new Date(d).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
  const completadas = ventas.filter(v=>v.estado==="completada");
  const totalGeneral = completadas.reduce((s,v)=>s+(v.total||0),0);

  return (
    <div>
      <div className="ph"><h2>Historial de Ventas</h2><p>{completadas.length} ventas — Total: ${totalGeneral.toLocaleString("es-MX",{minimumFractionDigits:2})}</p></div>
      <div className="tc">
        {ventas.length===0?<div className="empty"><p>Sin ventas registradas</p></div>:
        <table><thead><tr><th>Folio</th><th>Fecha</th><th>Vendedor</th><th>Productos</th><th>Pago</th><th>Total</th><th>Estado</th></tr></thead><tbody>
          {ventas.map(v=>(
            <tr key={v.id} style={{cursor:"pointer"}} onClick={()=>setExpanded(expanded===v.id?null:v.id)}>
              <td style={{fontWeight:700}}>{v.folio}</td>
              <td style={{fontSize:12,color:"var(--t2)"}}>{fmt(v.created_at)}</td>
              <td>{v.usuario?.nombre||"—"}</td>
              <td>{v.detalle_ventas?.length||0} items</td>
              <td style={{textTransform:"capitalize"}}>{v.metodo_pago}</td>
              <td style={{fontWeight:700,color:"var(--ok)"}}>${(v.total||0).toFixed(2)}</td>
              <td><span className={`badge ${v.estado==="completada"?"b-ok":"b-out"}`}>{v.estado}</span></td>
            </tr>
          ))}
        </tbody></table>}
      </div>
      {expanded && (() => {
        const v = ventas.find(x=>x.id===expanded);
        if(!v) return null;
        return (
          <div className="mo" onClick={()=>setExpanded(null)}><div className="md" onClick={e=>e.stopPropagation()}>
            <h3>Venta {v.folio} <button className="btn btn-g" onClick={()=>setExpanded(null)}><I.X/></button></h3>
            <div style={{fontSize:13,color:"var(--t2)",marginBottom:16}}>{fmt(v.created_at)} — {v.usuario?.nombre} — {v.metodo_pago}</div>
            <div style={{background:"var(--bg)",borderRadius:8,padding:12}}>
              {(v.detalle_ventas||[]).map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<(v.detalle_ventas||[]).length-1?"1px solid var(--border)":"none"}}><span style={{fontSize:13}}>{d.cantidad}x {d.nombre_producto}</span><span style={{fontWeight:600,fontSize:13}}>${(d.subtotal||0).toFixed(2)}</span></div>)}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:800}}><span>Total</span><span style={{color:"var(--ok)"}}>${(v.total||0).toFixed(2)}</span></div>
          </div></div>
        );
      })()}
    </div>
  );
}

// ============================================
// USUARIOS (solo admin)
// ============================================
function UsuariosPage({ usuarios, cfg, supabase: sb, onRefresh, notify }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const openNew = () => { setForm({nombre:"",email:"",pin:"",rol:"vendedor"}); setModal("new"); };
  const openEdit = (u) => { setForm({...u}); setModal("edit"); };

  const save = async () => {
    if(!form.nombre||!form.email||!form.pin) return notify("Nombre, email y PIN requeridos","err");
    if(form.pin.length!==4) return notify("PIN debe ser de 4 dígitos","err");
    if(!cfg) return notify("Conecta Supabase","err");
    const d = { nombre:form.nombre, email:form.email, pin:form.pin, rol:form.rol };
    if(modal==="edit") { await sb.from("usuarios").update(d).eq("id",form.id); notify("Usuario actualizado"); }
    else { const{error}=await sb.from("usuarios").insert(d); if(error) return notify(error.message||"Error","err"); notify("Usuario creado"); }
    setModal(null); onRefresh();
  };

  const toggle = async (u) => {
    if(!cfg) return;
    await sb.from("usuarios").update({activo:!u.activo}).eq("id",u.id);
    notify(u.activo?"Usuario desactivado":"Usuario activado"); onRefresh();
  };

  return (
    <div>
      <div className="ph" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><h2>Usuarios</h2><p>Administra el acceso al sistema</p></div><button className="btn btn-p" onClick={openNew}><I.Plus/> Nuevo</button></div>
      <div className="tc">
        <table><thead><tr><th>Usuario</th><th>Email</th><th>PIN</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>
          {usuarios.map(u=>(
            <tr key={u.id}><td style={{fontWeight:600}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,background:u.rol==="admin"?"var(--accent)":"var(--ok)"}}>{u.nombre[0]}</div>{u.nombre}</div></td>
              <td style={{color:"var(--t2)"}}>{u.email}</td>
              <td style={{fontFamily:"monospace"}}>••••</td>
              <td><span className={`badge ${u.rol==="admin"?"b-lo":"b-ok"}`} style={{textTransform:"capitalize"}}>{u.rol}</span></td>
              <td><span className={`badge ${u.activo?"b-ok":"b-out"}`}>{u.activo?"Activo":"Inactivo"}</span></td>
              <td><div style={{display:"flex",gap:3}}><button className="btn btn-g" onClick={()=>openEdit(u)}><I.Edit/></button><button className="btn btn-g" onClick={()=>toggle(u)}>{u.activo?"Desactivar":"Activar"}</button></div></td></tr>
          ))}
        </tbody></table>
      </div>
      {modal && (
        <div className="mo" onClick={()=>setModal(null)}><div className="md" onClick={e=>e.stopPropagation()}>
          <h3>{modal==="edit"?"Editar":"Nuevo"} Usuario <button className="btn btn-g" onClick={()=>setModal(null)}><I.X/></button></h3>
          <div className="fg"><label>Nombre *</label><input value={form.nombre||""} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
          <div className="fg"><label>Email *</label><input type="email" value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="fr">
            <div className="fg"><label>PIN (4 dígitos) *</label><input maxLength={4} value={form.pin||""} onChange={e=>setForm({...form,pin:e.target.value.replace(/\D/g,"")})}/></div>
            <div className="fg"><label>Rol</label><select value={form.rol} onChange={e=>setForm({...form,rol:e.target.value})}><option value="vendedor">Vendedor</option><option value="admin">Administrador</option></select></div>
          </div>
          <div className="fa"><button className="btn btn-o" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-p" onClick={save}>{modal==="edit"?"Guardar":"Crear"}</button></div>
        </div></div>
      )}
    </div>
  );
}
