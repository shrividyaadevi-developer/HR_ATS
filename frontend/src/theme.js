export const DARK = {
  bg:"#0d1117", surface:"#161b27", surface2:"#1c2236",
  border:"#262d42", accent:"#4f6ef7", accent2:"#10c9a0",
  accent3:"#f76f6f", text:"#dde3f0", muted:"#5c6680",
  shadow:"0 4px 28px rgba(0,0,0,.45)", inputBg:"#1c2236",
};
export const LIGHT = {
  bg:"#f0f2f8", surface:"#ffffff", surface2:"#f5f6fb",
  border:"#dde1ee", accent:"#4f6ef7", accent2:"#10c9a0",
  accent3:"#f76f6f", text:"#1a2040", muted:"#7a83a6",
  shadow:"0 4px 20px rgba(80,100,180,.10)", inputBg:"#f5f6fb",
};

export function makeCSS(t) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:${t.bg}; --surface:${t.surface}; --surface2:${t.surface2};
      --border:${t.border}; --accent:${t.accent}; --accent2:${t.accent2};
      --accent3:${t.accent3}; --text:${t.text}; --muted:${t.muted};
      --shadow:${t.shadow}; --input-bg:${t.inputBg};
      --fh:'Outfit',sans-serif; --fb:'Plus Jakarta Sans',sans-serif; --r:12px;
    }
    body { background:var(--bg); color:var(--text); font-family:var(--fb); }
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
    table{border-collapse:collapse;width:100%}
    th,td{text-align:left;padding:11px 15px;font-size:13px;border-bottom:1px solid var(--border)}
    th{color:var(--muted);font-weight:700;font-size:10.5px;text-transform:uppercase;letter-spacing:.09em;background:var(--surface2)}
    td{color:var(--text)}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:rgba(79,110,247,.035)}
    input,select,textarea{background:var(--input-bg);border:1.5px solid var(--border);color:var(--text);border-radius:8px;padding:9px 12px;font-family:var(--fb);font-size:13px;outline:none;transition:border .2s,box-shadow .2s;width:100%}
    input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,110,247,.12)}
    textarea{resize:vertical;min-height:80px}
    label{font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.07em;text-transform:uppercase;display:block;margin-bottom:5px}
    button{cursor:pointer;font-family:var(--fb)}
    *{transition:background-color .2s,border-color .2s,color .2s}
  `;
}
