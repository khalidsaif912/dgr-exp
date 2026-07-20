(function(){
  const KEY = "dgr-theme";
  const root = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const lightCss = `
html[data-theme="light"]{
  --bg0:#eff5ff;
  --bg1:#dce7f7;
  --text:#13253b;
  --muted:rgba(19,37,59,.72);
  --stroke:rgba(19,37,59,.14);
  --shadow:0 14px 34px rgba(88,116,150,.18);
  --accent:#2b7fff;
  --accent2:#00a6d6;
}
html[data-theme="light"] body{
  background: radial-gradient(920px 520px at 88% 0%, rgba(79,172,254,.18), transparent 55%), linear-gradient(180deg, var(--bg0), var(--bg1));
}
html[data-theme="light"] .heroCard,
html[data-theme="light"] .card,
html[data-theme="light"] .sbox,
html[data-theme="light"] .panel,
html[data-theme="light"] .brand,
html[data-theme="light"] .timer,
html[data-theme="light"] .sideStat,
html[data-theme="light"] .charPanel,
html[data-theme="light"] .qImgWrap,
html[data-theme="light"] .pill,
html[data-theme="light"] .btn,
html[data-theme="light"] .iconBtn,
html[data-theme="light"] .infoBtn,
html[data-theme="light"] .mTop,
html[data-theme="light"] .mBottom,
html[data-theme="light"] .mBtn,
html[data-theme="light"] .mIcon,
html[data-theme="light"] .mStat,
html[data-theme="light"] .game-item,
html[data-theme="light"] .cardModal,
html[data-theme="light"] .xbtn,
html[data-theme="light"] .act,
html[data-theme="light"] .linkCard,
html[data-theme="light"] .sideAd{
  background:linear-gradient(180deg, rgba(255,255,255,.86), rgba(244,248,255,.78)) !important;
  color:var(--text);
  border-color:rgba(19,37,59,.12) !important;
  box-shadow:var(--shadow);
}
html[data-theme="light"] .heroHead,
html[data-theme="light"] .topbar{
  background:linear-gradient(180deg, rgba(255,255,255,.82), rgba(240,246,255,.72)) !important;
  border-bottom-color:rgba(19,37,59,.08) !important;
}
html[data-theme="light"] .optBtn{
  background:linear-gradient(180deg, rgba(255,255,255,.96), rgba(245,249,255,.88)) !important;
  border-color:rgba(19,37,59,.14) !important;
}
html[data-theme="light"] .note,
html[data-theme="light"] .small,
html[data-theme="light"] .muted,
html[data-theme="light"] .appname,
html[data-theme="light"] .heroBrandKicker,
html[data-theme="light"] .status,
html[data-theme="light"] .lbl,
html[data-theme="light"] .mLbl{
  color:rgba(19,37,59,.68) !important;
}
html[data-theme="light"] .heroTop .h{
  -webkit-text-fill-color:initial;
}
html[data-theme="light"] .heroBrandMark,
html[data-theme="light"] .gamesBtn,
html[data-theme="light"] [data-theme-toggle]{
  box-shadow:0 4px 12px rgba(79,172,254,.14);
}
`;

  const style = document.createElement('style');
  style.id = 'dgr-theme-style';
  style.textContent = lightCss;
  document.head.appendChild(style);

  function getTheme(){
    try{return localStorage.getItem(KEY) || root.getAttribute('data-theme') || 'dark';}catch(e){return root.getAttribute('data-theme') || 'dark';}
  }
  function setTheme(theme){
    root.setAttribute('data-theme', theme);
    try{localStorage.setItem(KEY, theme);}catch(e){}
    if(metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#eff5ff' : '#070B14');
    document.querySelectorAll('[data-theme-toggle]').forEach((btn)=>{
      btn.textContent = theme === 'light' ? '??' : '??';
      btn.classList.toggle('themeBtnActive', theme === 'light');
      btn.setAttribute('title', theme === 'light' ? '????? ???????' : '????? ??????');
      btn.setAttribute('aria-label', theme === 'light' ? '????? ???????' : '????? ??????');
    });
  }
  function toggleTheme(){
    setTheme(getTheme() === 'light' ? 'dark' : 'light');
  }
  function bind(){
    document.querySelectorAll('[data-theme-toggle]').forEach((btn)=>{
      btn.addEventListener('click', toggleTheme);
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ setTheme(getTheme()); bind(); });
  } else {
    setTheme(getTheme()); bind();
  }
})();
