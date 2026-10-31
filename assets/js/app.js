/* ===========================
   App — Main application logic
   =========================== */

/* --- Config --- */
const CONFIG = {
  username: 'MemoriesOfTime',
  cacheDuration: 60 * 60 * 1000,
  cacheKey: 'github_data_MemoriesOfTime_v3',
  discordUrl: 'https://discord.gg/pJjQDQC',
  qqGroupUrl: 'https://jq.qq.com/?_wv=1027&k=5aIuYMH',
  ciUrl: 'https://motci.cn',
  repoUrl: 'https://repo.lanink.cn',
  jsonuiUrl: 'https://jsonui.mot.dev/',
  docsUrl: 'https://www.nukkit-mot.com/',
  flagshipDownloadUrl: 'https://motci.cn/job/Nukkit-MOT/job/master/',
  flagshipRepo: 'Nukkit-MOT',
  flagshipLogo: 'https://www.nukkit-mot.com/zh/images/logo.png',
  friendLinks: [
    { name: 'Nukkit-MOT', url: 'https://www.nukkit-mot.com/', desc: '', logo: 'https://www.nukkit-mot.com/zh/images/logo.png' },
    { name: '速德优', url: 'https://www.sodayo.net', desc: '', logo: 'https://www.fapixel.com/wp-content/uploads/2026/05/sodayo-logo2.png' },
  ],
  showFriendLinks: true,
};

/* --- i18n --- */
/* 文案统一放在 assets/i18n/<locale>.json，由 i18n.js 负责协商、加载与切换 */
const i18n = window.i18n;

function t(key, vars) {
  return i18n.t(key, vars);
}

/* 语言选择器回调（HTML 内联 onchange 需要全局函数） */
function changeLocale(code) {
  i18n.setLocale(code);
}

/* --- Preferences --- */
function getPreference(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function setPreference(key, value) {
  try { localStorage.setItem(key, value); } catch { /* 隐私模式下仍保留当次设置 */ }
}

/* --- Theme --- */
function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  setPreference('mot_theme', nextTheme);
  renderNavbar(cachedData ? cachedData.user : null);
  updateScrollState();
}

/* --- SEO：canonical / og:url / hreflang 跟随语言与语言注册表 --- */
function syncDocumentMeta() {
  const canonical = document.getElementById('canonicalLink');
  if (!canonical || !i18n.locale) return;
  const base = canonical.dataset.base || canonical.href;
  const localizedUrl = code => (code === i18n.defaultLocale
    ? base
    : `${base}?lang=${encodeURIComponent(code)}`);

  const url = localizedUrl(i18n.locale);
  canonical.setAttribute('href', url);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', url);

  syncAlternateLinks(base);
}

/* hreflang 与 og:locale:alternate 由注册表生成，新增语言不用改 HTML */
function syncAlternateLinks(base) {
  document.querySelectorAll('link[data-i18n-alternate]').forEach(el => el.remove());
  const links = document.createDocumentFragment();
  i18n.locales.forEach(locale => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = locale.htmlLang || locale.code;
    link.href = locale.code === i18n.defaultLocale
      ? base
      : `${base}?lang=${encodeURIComponent(locale.code)}`;
    link.setAttribute('data-i18n-alternate', '');
    links.appendChild(link);
  });
  document.head.appendChild(links);

  const ogAnchor = document.querySelector('meta[property="og:locale"]');
  document.querySelectorAll('meta[data-i18n-og-alternate]').forEach(el => el.remove());
  if (!ogAnchor) return;

  const metas = document.createDocumentFragment();
  i18n.locales
    .filter(locale => locale.code !== i18n.locale)
    .forEach(locale => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:locale:alternate');
      meta.setAttribute('content', locale.ogLocale || locale.code);
      meta.setAttribute('data-i18n-og-alternate', '');
      metas.appendChild(meta);
    });
  ogAnchor.after(metas);
}

/* --- Data --- */
const LANG_COLORS = {
  Java: '#b07219', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  Kotlin: '#A97BFF', Python: '#3572A5', Go: '#00ADD8', Rust: '#dea584',
  'C++': '#f34b7d', C: '#555555', HTML: '#e34c26', CSS: '#563d7c',
  Shell: '#89e051', Lua: '#000080', PowerShell: '#012456',
};

const SORT_OPTIONS = [
  { value: 'stars', labelKey: 'projects.sort.stars' },
  { value: 'updated', labelKey: 'projects.sort.updated' },
  { value: 'created', labelKey: 'projects.sort.created' },
];

/* --- State --- */
let currentSort = 'stars';
let currentLanguage = 'all';
let repoQuery = '';
let cachedData = null;
let showAllRepos = false;

const FALLBACK_DATA = {
  user: {
    login: 'MemoriesOfTime',
    name: 'Memories Of Time',
    avatar_url: 'https://avatars.githubusercontent.com/u/62042238?v=4',
    html_url: 'https://github.com/MemoriesOfTime',
    blog: 'https://mot.dev',
    location: 'China',
    public_repos: 6,
    followers: 0,
  },
  repos: [
    { name: 'Nukkit-MOT', description: 'Support for multiple versions of Nukkit Minecraft Bedrock Edition Server Software', html_url: 'https://github.com/MemoriesOfTime/Nukkit-MOT', homepage: 'https://www.nukkit-mot.com', language: 'Java', stargazers_count: 159, forks_count: 72, topics: ['bedrock', 'bedrock-edition', 'minecraft'], pushed_at: '2026-10-01T00:00:00Z', created_at: '2020-01-01T00:00:00Z' },
    { name: 'NukkitPetteriM1Edition', description: 'Custom version of Nukkit Minecraft Bedrock Edition server software', html_url: 'https://github.com/MemoriesOfTime/NukkitPetteriM1Edition', language: 'Java', stargazers_count: 23, forks_count: 8, topics: [], pushed_at: '2026-08-01T00:00:00Z', created_at: '2021-01-01T00:00:00Z' },
    { name: 'Nukkit-Retro', description: 'Nukkit-Retro: Nuclear-Powered server software for legacy Minecraft: Pocket Edition (1.1 and below)', html_url: 'https://github.com/MemoriesOfTime/Nukkit-Retro', homepage: 'https://www.nukkit-retro.com', language: 'Java', stargazers_count: 14, forks_count: 8, topics: [], pushed_at: '2026-07-01T00:00:00Z', created_at: '2021-06-01T00:00:00Z' },
    { name: 'RsNPC', description: 'NPC plugin for Nukkit-MOT', html_url: 'https://github.com/MemoriesOfTime/RsNPC', language: 'Java', stargazers_count: 14, forks_count: 18, topics: ['nukkitx-plugin'], pushed_at: '2026-06-01T00:00:00Z', created_at: '2020-06-01T00:00:00Z' },
    { name: 'raknet-rs', description: 'Raknet protocol implementation by rust', html_url: 'https://github.com/MemoriesOfTime/raknet-rs', language: 'Rust', stargazers_count: 13, forks_count: 5, topics: [], pushed_at: '2026-05-01T00:00:00Z', created_at: '2022-01-01T00:00:00Z' },
    { name: 'GunWar', description: 'Simple pvp game', html_url: 'https://github.com/MemoriesOfTime/GunWar', language: 'Java', stargazers_count: 10, forks_count: 15, topics: ['nukkit-plugin', 'nukkitx-plugin'], pushed_at: '2026-04-01T00:00:00Z', created_at: '2020-03-01T00:00:00Z' },
  ],
};

/* --- Icons --- */
const icons = {
  github: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
  star: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  fork: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/></svg>',
  users: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  mapPin: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  externalLink: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  clock: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  refresh: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>',
  chevronDown: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
  link: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  menu: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  zap: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  puzzle: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214 3.214c-.446.166-.855.497-.925.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/></svg>',
  globe: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10z"/></svg>',
  discord: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
  qq: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  package: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  build: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><polyline points="6 15 10 11 6 7"/><line x1="13" y1="15" x2="18" y2="15"/></svg>',
  code: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  search: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  book: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
  download: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  sun: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>',
};

/* --- Utilities --- */
/* 转义 API / 配置数据后再插入 HTML，避免描述、topic 等字段注入标记 */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function normalizeWebsiteUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    try {
      return new URL(`https://${value.trim()}`).href;
    } catch {
      return null;
    }
  }
}

/* 头像按实际显示尺寸请求（GitHub avatar s 参数），避免下载 460px 大图 */
function avatarSize(url, size) {
  return `${url}${url.includes('?') ? '&' : '?'}s=${size}`;
}

/* 相对时间交给 Intl.RelativeTimeFormat，随语言自动变化 */
function formatTime(dateString) {
  return i18n.formatRelativeTime(dateString);
}

/* --- Cache --- */
function getCachedData() {
  try {
    const cached = localStorage.getItem(CONFIG.cacheKey);
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp < CONFIG.cacheDuration) return data;
    localStorage.removeItem(CONFIG.cacheKey);
    return null;
  } catch { return null; }
}

/* 读取缓存但不在意是否过期，用于 API 失败时兜底（stale-if-error） */
function getStaleData() {
  try {
    const cached = localStorage.getItem(CONFIG.cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
}

function setCacheData(user, repos) {
  try { localStorage.setItem(CONFIG.cacheKey, JSON.stringify({ timestamp: Date.now(), user, repos })); } catch (e) { console.error(e); }
}

/* --- API --- */
async function fetchGitHubData(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCachedData();
    if (cached) return cached;
  }

  // 两个请求互不依赖，并行发起缩短首屏等待
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/orgs/${CONFIG.username}`),
    fetch(`https://api.github.com/orgs/${CONFIG.username}/repos?sort=updated&per_page=100`),
  ]);
  if (!userRes.ok) throw new Error('Failed to fetch organization');
  if (!reposRes.ok) throw new Error('Failed to fetch repos');
  const [user, repos] = await Promise.all([userRes.json(), reposRes.json()]);

  setCacheData(user, repos);
  return { user, repos };
}

/* --- Data Processing --- */
function getFilteredRepos(repos) {
  const query = repoQuery.trim().toLocaleLowerCase();
  return repos.filter(repo => {
    const matchesLanguage = currentLanguage === 'all' || repo.language === currentLanguage;
    const matchesQuery = !query || `${repo.name} ${repo.description || ''}`.toLocaleLowerCase().includes(query);
    return matchesLanguage && matchesQuery;
  });
}

function processRepos(repos, sortType) {
  const sorted = [...getFilteredRepos(repos)];
  switch (sortType) {
    case 'stars': sorted.sort((a, b) => b.stargazers_count - a.stargazers_count); break;
    case 'updated': sorted.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)); break;
    case 'created': sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
  }
  return showAllRepos ? sorted : sorted.slice(0, 6);
}

function getLanguageStats(repos) {
  const stats = {};
  repos.forEach(r => { if (r.language) stats[r.language] = (stats[r.language] || 0) + 1; });
  return Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 4);
}

/* --- Render: Navbar --- */
function renderNavbar(user) {
  // 导航头像显示 32px，按 2x 尺寸请求兼顾高分屏
  const avatarUrl = avatarSize(user ? user.avatar_url : 'https://avatars.githubusercontent.com/u/62042238?v=4', 64);
  const isDark = document.documentElement.dataset.theme === 'dark';
  const themeLabel = t(isDark ? 'nav.themeToLight' : 'nav.themeToDark');
  const langLabel = t('nav.language');

  // 语言列表来自 locales.json，新增语言无需改这里
  const localeOptions = i18n.locales.map(locale => `
    <option value="${escapeHtml(locale.code)}" lang="${escapeHtml(locale.htmlLang || locale.code)}"${locale.code === i18n.locale ? ' selected' : ''}>${escapeHtml(locale.label)}</option>
  `).join('');

  document.getElementById('nav-container').innerHTML = `
    <nav class="navbar" id="navbar">
      <div class="navbar-inner">
        <a href="#hero" class="navbar-brand">
          <img src="${escapeHtml(avatarUrl)}" alt="" width="32" height="32">
          <span>MemoriesOfTime</span>
        </a>
        <div class="navbar-links" id="navLinks">
          <a href="#hero" onclick="closeMenu()">${t('nav.home')}</a>
          <a href="#features" onclick="closeMenu()">${t('nav.features')}</a>
          <a href="#projects" onclick="closeMenu()">${t('nav.projects')}</a>
          <a href="#resources" onclick="closeMenu()">${t('nav.resources')}</a>
          <a href="#community" onclick="closeMenu()">${t('nav.community')}</a>
          <button class="theme-toggle" onclick="toggleTheme()" aria-label="${themeLabel}" title="${themeLabel}">${isDark ? icons.sun : icons.moon}</button>
          <div class="lang-switch">
            <select class="lang-select" onchange="changeLocale(this.value)" aria-label="${langLabel}" title="${langLabel}">
              ${localeOptions}
            </select>
            <span class="lang-select-arrow" aria-hidden="true">${icons.chevronDown}</span>
          </div>
        </div>
        <button class="menu-toggle" onclick="toggleMenu()" aria-label="${t('nav.menu')}" aria-expanded="false" aria-controls="navLinks">${icons.menu}</button>
      </div>
      <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
    </nav>
  `;
}

function toggleMenu() {
  const links = document.getElementById('navLinks');
  if (!links) return;
  const isOpen = links.classList.toggle('open');
  const btn = document.querySelector('.menu-toggle');
  if (btn) btn.setAttribute('aria-expanded', String(isOpen));
}

function closeMenu() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.remove('open');
  const btn = document.querySelector('.menu-toggle');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

/* --- Render: Loading & Error --- */
function renderFallback() {
  const orgUrl = `https://github.com/${CONFIG.username}`;
  const avatarUrl = 'https://avatars.githubusercontent.com/u/62042238?v=4&s=320';

  return `
    <section class="hero" id="hero">
      <div class="container">
        <div class="hero-content">
          <div class="avatar-wrapper anim-item">
            <img src="${avatarUrl}" alt="${CONFIG.username}" class="avatar" fetchpriority="high">
          </div>
          <div class="hero-info">
            <h1 class="hero-name anim-item" style="animation-delay: 0.15s">${CONFIG.username}</h1>
            <p class="hero-slogan anim-item" style="animation-delay: 0.25s">${t('hero.slogan')}</p>
            <p class="hero-slogan-sub anim-item" style="animation-delay: 0.3s">${t('hero.sloganSub')}</p>

            <div class="hero-cta anim-item" style="animation-delay: 0.4s">
              <a href="${orgUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">${icons.github} ${t('hero.ctaGithub')}</a>
            </div>
          </div>
        </div>
      </div>

      <button class="scroll-indicator" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" aria-label="${t('hero.scrollHint')}">
        <span class="scroll-content" aria-hidden="true">
          <span>${t('hero.scrollHint')}</span>
          ${icons.chevronDown}
        </span>
      </button>
    </section>

    ${renderFeatures()}

    ${renderResources()}

    ${renderCommunity()}

    ${CONFIG.showFriendLinks ? renderFriendLinks() : ''}

    <footer class="footer glass-panel" style="border-radius:0;">
      <div class="container">
        <p class="footer-text">${t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>`;
}

/* --- Render: Features --- */
function renderFeatures() {
  const features = [
    { icon: icons.github, titleKey: 'features.open.title', descKey: 'features.open.desc' },
    { icon: icons.zap, titleKey: 'features.performance.title', descKey: 'features.performance.desc' },
    { icon: icons.puzzle, titleKey: 'features.ecosystem.title', descKey: 'features.ecosystem.desc' },
    { icon: icons.users, titleKey: 'features.community.title', descKey: 'features.community.desc' },
  ];

  return `
    <section class="features" id="features">
      <div class="container">
        <div class="features-header scroll-anim blur">
          <h2 class="features-title">${t('features.title')}</h2>
        </div>
        <div class="features-grid">
          ${features.map((f, i) => `
            <div class="feature-card glass-panel scroll-anim scale" data-delay="${i * 100}">
              <div class="feature-icon">${f.icon}</div>
              <h3 class="feature-title">${t(f.titleKey)}</h3>
              <p class="feature-desc">${t(f.descKey)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
}

/* --- Render: Flagship & Repo Grid --- */
function renderFlagship(repos) {
  const repo = repos.find(item => item.name === CONFIG.flagshipRepo);
  if (!repo) return '';
  return `
    <section class="flagship" aria-labelledby="flagship-title">
      <div class="container">
        <div class="flagship-card glass-panel scroll-anim">
          <img class="flagship-logo" src="${CONFIG.flagshipLogo}" alt="" loading="lazy" decoding="async">
          <div>
            <p class="flagship-eyebrow">${t('projects.flagshipTag')}</p>
            <h2 class="flagship-title" id="flagship-title">${escapeHtml(repo.name)}</h2>
            <p class="flagship-desc">${t('projects.flagshipDesc')}</p>
            <div class="flagship-meta">
              <span>${icons.star} ${t('projects.stars', { count: repo.stargazers_count })}</span>
              <span><span class="repo-lang-dot" style="background:${LANG_COLORS[repo.language] || '#6e7681'}"></span>${escapeHtml(repo.language)}</span>
              <span>${icons.clock} ${formatTime(repo.pushed_at)}</span>
            </div>
            <div class="flagship-actions">
              <a href="${CONFIG.docsUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">${icons.book} ${t('projects.docs')}</a>
              <a href="${CONFIG.flagshipDownloadUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary-outline">${icons.download} ${t('projects.download')}</a>
              <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary-outline">${icons.github} GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function renderRepoGrid(repos) {
  const sortedRepos = processRepos(repos, currentSort);
  if (!sortedRepos.length) return `<div class="repo-grid"><p class="empty-state" role="status">${t('projects.empty')}</p></div>`;
  return `<div class="repo-grid">${sortedRepos.map((repo, i) => {
    const website = normalizeWebsiteUrl(repo.homepage);
    const links = [
      website ? `<a href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">${icons.globe} ${t('hero.website')}</a>` : '',
      repo.name === CONFIG.flagshipRepo ? `<a href="${CONFIG.docsUrl}" target="_blank" rel="noopener noreferrer">${t('projects.docs')}</a><a href="${CONFIG.flagshipDownloadUrl}" target="_blank" rel="noopener noreferrer">${t('projects.download')}</a>` : '',
    ].filter(Boolean).join('');
    return `
    <article class="repo-card glass-panel scroll-anim" data-delay="${Math.min(i * 80, 400)}">
      <div class="repo-header">
        <div class="repo-icon">${icons.github}</div>
        <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="repo-name repo-card-link" aria-label="${escapeHtml(repo.name)} · GitHub">${escapeHtml(repo.name)} ${icons.externalLink}</a>
      </div>
      <p class="repo-desc">${escapeHtml(repo.description || t('projects.noDescription'))}</p>
      ${(repo.topics || []).length ? `<div class="repo-topics">${repo.topics.slice(0, 3).map(tp => `<span class="topic">${escapeHtml(tp)}</span>`).join('')}</div>` : ''}
      ${links ? `<div class="repo-links">${links}</div>` : ''}
      <div class="repo-footer">
        ${repo.language ? `<span class="repo-lang"><span class="repo-lang-dot" style="background:${LANG_COLORS[repo.language] || '#6e7681'}"></span>${escapeHtml(repo.language)}</span>` : '<span></span>'}
        <span class="repo-stat">${icons.star} ${i18n.formatNumber(repo.stargazers_count)}</span>
        <span class="repo-stat">${icons.fork} ${i18n.formatNumber(repo.forks_count)}</span>
        <span class="repo-update">${formatTime(repo.pushed_at)}</span>
      </div>
    </article>`;
  }).join('')}</div>`;
}

function renderRepoResults(repos) {
  const filteredCount = getFilteredRepos(repos).length;
  return `${renderRepoGrid(repos)}${filteredCount > 6 ? `
    <div class="view-more-wrapper scroll-anim">
      <button class="btn" onclick="toggleViewMore()">${showAllRepos ? t('projects.viewLess') : t('projects.viewMore')}</button>
    </div>` : ''}`;
}

function renderReposInner(repos) {
  const languages = [...new Set(repos.map(repo => repo.language).filter(Boolean))].sort();
  return `
    <div class="repos-header">
      <div><h2 class="repos-title">${t('projects.title')}</h2></div>
      <div class="controls-wrapper">
        <div class="select-wrapper">
          <select class="select" onchange="changeSort(this.value)" aria-label="${t('projects.sort.label')}">
            ${SORT_OPTIONS.map(opt => `<option value="${opt.value}" ${opt.value === currentSort ? 'selected' : ''}>${t(opt.labelKey)}</option>`).join('')}
          </select>
          <span class="select-arrow">${icons.chevronDown}</span>
        </div>
        <button class="btn btn-icon" onclick="refreshData()" id="refreshBtn" aria-label="${t('projects.refresh')}">${icons.refresh}</button>
      </div>
    </div>
    <div class="repo-filters">
      <div class="search-wrapper">
        ${icons.search}
        <input class="search-input" type="search" value="${escapeHtml(repoQuery)}" oninput="searchRepos(this.value)" aria-label="${t('projects.search.label')}" placeholder="${t('projects.search.placeholder')}">
      </div>
      <div class="select-wrapper">
        <select class="select" onchange="filterLanguage(this.value)" aria-label="${t('projects.languageAll')}">
          <option value="all">${t('projects.languageAll')}</option>
          ${languages.map(language => `<option value="${escapeHtml(language)}" ${language === currentLanguage ? 'selected' : ''}>${escapeHtml(language)}</option>`).join('')}
        </select>
        <span class="select-arrow">${icons.chevronDown}</span>
      </div>
    </div>
    <div id="repoResults">${renderRepoResults(repos)}</div>`;
}

/* --- Render: Resources --- */
function renderResources() {
  const items = [
    { icon: icons.build, titleKey: 'resources.ci.title', descKey: 'resources.ci.desc', btnKey: 'resources.ci.action', url: CONFIG.ciUrl },
    { icon: icons.package, titleKey: 'resources.maven.title', descKey: 'resources.maven.desc', btnKey: 'resources.maven.action', url: CONFIG.repoUrl },
    { icon: icons.code, titleKey: 'resources.jsonui.title', descKey: 'resources.jsonui.desc', btnKey: 'resources.jsonui.action', url: CONFIG.jsonuiUrl },
  ];
  return `
    <section class="community" id="resources">
      <div class="container">
        <div class="community-header scroll-anim">
          <h2 class="community-title">${t('resources.title')}</h2>
          <p class="community-desc">${t('resources.desc')}</p>
        </div>
        <div class="community-grid resources-grid">
          ${items.map((it, i) => `
            <div class="community-card glass-panel scroll-anim ${i % 2 === 0 ? 'left' : 'right'}" data-delay="${i * 100}">
              <div class="community-icon">${it.icon}</div>
              <h3 class="community-card-title">${t(it.titleKey)}</h3>
              <p class="community-card-desc">${t(it.descKey)}</p>
              <a href="${it.url}" target="_blank" rel="noopener noreferrer" class="btn-secondary-outline">${t(it.btnKey)}</a>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
}

/* --- Render: Community --- */
function renderCommunity() {
  const items = [
    { icon: icons.discord, titleKey: 'community.discord.title', descKey: 'community.discord.desc', btnKey: 'community.discord.action', url: CONFIG.discordUrl },
    { icon: icons.qq, titleKey: 'community.qq.title', descKey: 'community.qq.desc', btnKey: 'community.qq.action', url: CONFIG.qqGroupUrl },
  ];
  return `
    <section class="community" id="community">
      <div class="container">
        <div class="community-header scroll-anim">
          <h2 class="community-title">${t('community.title')}</h2>
          <p class="community-desc">${t('community.desc')}</p>
        </div>
        <div class="community-grid">
          ${items.map((it, i) => `
            <div class="community-card glass-panel scroll-anim ${i % 2 === 0 ? 'left' : 'right'}" data-delay="${i * 100}">
              <div class="community-icon">${it.icon}</div>
              <h3 class="community-card-title">${t(it.titleKey)}</h3>
              <p class="community-card-desc">${t(it.descKey)}</p>
              <a href="${it.url}" target="_blank" rel="noopener noreferrer" class="btn-secondary-outline">${t(it.btnKey)}</a>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
}

/* --- Render: Friend Links --- */
function renderFriendLinkCard(link, i, animate) {
  // 克隆副本仅用于视觉无缝衔接：aria-hidden 容器内的链接不可被键盘聚焦
  const extraAttrs = animate ? ` data-delay="${i * 100}"` : ' tabindex="-1"';
  return `
    <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="friend-link-card glass-panel${animate ? ' scroll-anim' : ''}"${extraAttrs}>
      <div class="friend-link-icon">${link.logo ? `<img src="${escapeHtml(link.logo)}" alt="${escapeHtml(link.name)}" class="friend-link-logo" loading="lazy" decoding="async">` : icons.externalLink}</div>
      <div class="friend-link-info">
        <span class="friend-link-name">${escapeHtml(link.name)}</span>
        ${link.desc ? `<span class="friend-link-desc">${escapeHtml(link.desc)}</span>` : ''}
      </div>
    </a>`;
}

function renderFriendLinks() {
  const cards = CONFIG.friendLinks.map((link, i) => renderFriendLinkCard(link, i, true)).join('');
  const cardsClone = CONFIG.friendLinks.map((link, i) => renderFriendLinkCard(link, i, false)).join('');
  return `
    <section class="friend-links" id="friend-links">
      <div class="container">
        <div class="friend-links-header scroll-anim">
          <h2 class="friend-links-title">${icons.link} ${t('friends.title')}</h2>
          <p class="friend-links-desc">${t('friends.desc')}</p>
        </div>
        <div class="friend-links-track" id="friendLinksTrack">
          <div class="friend-links-grid">${cards}</div>
          <div class="friend-links-grid friend-links-grid--clone" aria-hidden="true">${cardsClone}</div>
        </div>
      </div>
    </section>`;
}

/* 链接数量超出容器时启用横向滚动，否则保持居中静态展示 */
function checkFriendLinksScroll() {
  const track = document.getElementById('friendLinksTrack');
  if (!track) return;
  const firstGrid = track.querySelector('.friend-links-grid');
  if (!firstGrid) return;
  const overflow = firstGrid.scrollWidth - track.offsetWidth;
  track.classList.toggle('is-scroll', overflow > 1);
}

/* --- Render: Main Content --- */
function renderContent(data) {
  const { user, repos } = data;
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const languages = getLanguageStats(repos);

  return `
    <section class="hero" id="hero">
      <div class="container">
        <div class="hero-content">
          <div class="avatar-wrapper anim-item">
            <img src="${escapeHtml(avatarSize(user.avatar_url, 320))}" alt="${escapeHtml(user.name || user.login)}" class="avatar" fetchpriority="high" decoding="async">
          </div>
          <div class="hero-info">
            <h1 class="hero-name anim-item" style="animation-delay: 0.15s">${escapeHtml(user.name || user.login)}</h1>
            <p class="hero-username anim-item" style="animation-delay: 0.2s"><bdi>@${escapeHtml(user.login)}</bdi></p>
            <p class="hero-slogan anim-item" style="animation-delay: 0.25s">${t('hero.slogan')}</p>
            <p class="hero-slogan-sub anim-item" style="animation-delay: 0.3s">${t('hero.sloganSub')}</p>

            <div class="hero-meta anim-item" style="animation-delay: 0.35s">
              ${user.location ? `<span>${icons.mapPin} ${escapeHtml(user.location)}</span>` : ''}
              ${user.blog ? `<a href="${escapeHtml(user.blog.startsWith('http') ? user.blog : 'https://' + user.blog)}" target="_blank" rel="noopener noreferrer">${icons.link} ${t('hero.website')}</a>` : ''}
              <a href="${escapeHtml(user.html_url)}" target="_blank" rel="noopener noreferrer">${icons.github} GitHub</a>
            </div>

            <div class="hero-cta anim-item" style="animation-delay: 0.4s">
              <a href="#projects" class="btn-primary">${t('hero.ctaStart')}</a>
              <a href="${escapeHtml(user.html_url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary-outline">${icons.github} ${t('hero.ctaGithub')}</a>
            </div>

            <div class="languages anim-item" style="animation-delay: 0.45s">
              ${languages.map(([lang]) => `
                <span class="language-badge glass-panel"><span class="repo-lang-dot" style="background:${LANG_COLORS[lang] || '#6e7681'}"></span>${escapeHtml(lang)}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <button class="scroll-indicator" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" aria-label="${t('hero.scrollHint')}">
        <span class="scroll-content" aria-hidden="true">
          <span>${t('hero.scrollHint')}</span>
          ${icons.chevronDown}
        </span>
      </button>
    </section>

    ${renderFeatures()}

    <section class="stats" id="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card glass-panel scroll-anim" data-delay="0">
            <div class="stat-content"><div class="stat-icon">${icons.star}</div><div>
              <div class="stat-value" data-count="${totalStars}">${i18n.formatNumber(totalStars)}</div><div class="stat-label">${t('stats.stars')}</div>
            </div></div>
          </div>
          <div class="stat-card glass-panel scroll-anim" data-delay="100">
            <div class="stat-content"><div class="stat-icon">${icons.fork}</div><div>
              <div class="stat-value" data-count="${totalForks}">${i18n.formatNumber(totalForks)}</div><div class="stat-label">${t('stats.forks')}</div>
            </div></div>
          </div>
          <div class="stat-card glass-panel scroll-anim" data-delay="200">
            <div class="stat-content"><div class="stat-icon">${icons.github}</div><div>
              <div class="stat-value" data-count="${user.public_repos}">${i18n.formatNumber(user.public_repos)}</div><div class="stat-label">${t('stats.repos')}</div>
            </div></div>
          </div>
          <div class="stat-card glass-panel scroll-anim" data-delay="300">
            <div class="stat-content"><div class="stat-icon">${icons.users}</div><div>
              <div class="stat-value" ${user.followers ? `data-count="${user.followers}"` : ''}>${user.followers ? i18n.formatNumber(user.followers) : '-'}</div><div class="stat-label">${t('stats.followers')}</div>
            </div></div>
          </div>
        </div>
      </div>
    </section>

    ${renderFlagship(repos)}

    <section class="repos" id="projects">
      <div class="container">
        ${renderReposInner(repos)}
      </div>
    </section>

    ${renderResources()}

    ${renderCommunity()}

    ${CONFIG.showFriendLinks ? renderFriendLinks() : ''}

    <footer class="footer glass-panel" style="border-radius:0;">
      <div class="container">
        <p class="footer-text">${t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>`;
}

/* --- Event Handlers --- */
function updateRepoResults() {
  const results = document.getElementById('repoResults');
  if (!cachedData || !results) return;
  results.innerHTML = renderRepoResults(cachedData.repos);
  initScrollAnimations();
}

function changeSort(value) {
  currentSort = value;
  updateRepoResults();
}

function searchRepos(value) {
  repoQuery = value;
  showAllRepos = false;
  updateRepoResults();
}

function filterLanguage(value) {
  currentLanguage = value;
  showAllRepos = false;
  updateRepoResults();
}

function toggleViewMore() {
  showAllRepos = !showAllRepos;
  updateRepoResults();
}

async function refreshData() {
  const btn = document.getElementById('refreshBtn');
  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
  }
  try {
    cachedData = await fetchGitHubData(true);
    renderNavbar(cachedData.user);
    document.getElementById('app').innerHTML = renderContent(cachedData);
    initScrollAnimations();
    updateScrollState();
    // 仓库数据更新后重新判断友链是否需要跑马灯
    checkFriendLinksScroll();
  } catch (e) {
    console.error(e);
    showToast(t('status.loadFailed'));
  } finally {
    // 重新渲染后旧按钮已脱离文档，需重新查找
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.classList.remove('loading');
      refreshBtn.disabled = false;
    }
  }
}

/* --- Toast --- */
let toastTimer = null;
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast glass-panel';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* --- Scroll Animations --- */
/* 统计数字滚动动画：从 0 缓动计数到目标值 */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  if (isNaN(target)) return;
  delete el.dataset.count; // 防止重复触发
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = i18n.formatNumber(target);
    return;
  }
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = i18n.formatNumber(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-anim:not(.visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => {
          el.classList.add('visible');
          el.querySelectorAll('.stat-value[data-count]').forEach(animateCount);
        }, delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });

  elements.forEach(el => {
    // 切换语言会重建 DOM：已经滚过的区块不会再进入观察区，直接置为可见
    if (el.getBoundingClientRect().bottom < 0) {
      el.classList.add('visible');
      return;
    }
    observer.observe(el);
  });
}

let scrollTicking = false;
function initScrollListener() {
  // rAF 合并：一帧内多次 scroll 只计算一次，避免布局抖动
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => { updateScrollState(); scrollTicking = false; });
  }, { passive: true });
}

function updateScrollState() {
  // 顶部滚动进度条
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${docH > 0 ? Math.min(window.scrollY / docH, 1) : 0})`;
  }

  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }

  // 滚动后隐藏「向下滚动」提示
  const indicator = document.querySelector('.scroll-indicator');
  if (indicator) {
    indicator.classList.toggle('hidden', window.scrollY > 80);
  }

  // Scroll spy：高亮当前区块对应的导航链接
  let current = 'hero';
  ['hero', 'features', 'projects', 'resources', 'community'].forEach(id => {
    const section = document.getElementById(id);
    if (section && section.offsetTop <= window.scrollY + 120) current = id;
  });
  document.querySelectorAll('.navbar-links a[href^="#"]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* --- Init --- */
async function init() {
  const app = document.getElementById('app');

  // 语言包就绪后再渲染，避免首屏闪现文案 key
  await i18n.ready;
  renderNavbar(null);
  initScrollListener();
  syncDocumentMeta();

  // 切换语言、或回退语言包迟到时重渲染：文案、相对时间、数字格式一起更新
  const rerenderForLocale = () => {
    const restoreLangFocus = document.activeElement && document.activeElement.classList.contains('lang-select');
    renderNavbar(cachedData ? cachedData.user : null);
    app.innerHTML = cachedData ? renderContent(cachedData) : renderFallback();
    if (restoreLangFocus) {
      const select = document.querySelector('.lang-select');
      if (select) select.focus();
    }
    initScrollAnimations();
    updateScrollState();
    checkFriendLinksScroll();
    syncDocumentMeta();
  };

  document.addEventListener('mot:localechange', rerenderForLocale);
  document.addEventListener('mot:messagesloaded', rerenderForLocale);

  // 移动端菜单：ESC 或点击菜单外区域时关闭（navbar 会重渲染，统一委托到 document）
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', (e) => {
    const links = document.getElementById('navLinks');
    if (!links || !links.classList.contains('open')) return;
    const toggleBtn = document.querySelector('.menu-toggle');
    if (!links.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) closeMenu();
  });

  try {
    cachedData = await fetchGitHubData();
    renderNavbar(cachedData.user);
    app.innerHTML = renderContent(cachedData);
  } catch (e) {
    console.error('GitHub API unavailable:', e.message);
    // API 失败时优先回退到过期缓存，否则展示内置项目快照
    const stale = getStaleData();
    cachedData = stale && stale.user && stale.repos
      ? { user: stale.user, repos: stale.repos }
      : FALLBACK_DATA;
    renderNavbar(cachedData.user);
    app.innerHTML = renderContent(cachedData);
    showToast(t(stale && stale.user && stale.repos ? 'status.stale' : 'status.offline'));
  }
  initScrollAnimations();
  updateScrollState();
  checkFriendLinksScroll();
  document.documentElement.classList.add('app-ready');
  window.dispatchEvent(new CustomEvent('mot:appready'));
  window.addEventListener('resize', () => {
    if (resizeFLTimer) cancelAnimationFrame(resizeFLTimer);
    resizeFLTimer = requestAnimationFrame(() => {
      checkFriendLinksScroll();
      // 跨断点切换时收起移动端菜单，避免状态残留
      if (window.innerWidth >= 768) closeMenu();
    });
  });
}

let resizeFLTimer = null;

init();
