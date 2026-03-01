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
};

/* --- i18n --- */
const TRANSLATIONS = {
  zh: {
    siteTitle: 'MemoriesOfTime - 专注 Minecraft 基岩版生态的开源组织',
    siteDesc: 'MemoriesOfTime 是一个专注于 Minecraft 基岩版生态的开源组织，涵盖服务端核心、开发工具与插件等多个项目。',
    ogDesc: '专注 Minecraft 基岩版生态的开源组织',
    navHome: '首页',
    navFeatures: '特性',
    navProjects: '项目',
    navResources: '资源',
    navCommunity: '社区',
    slogan: '专注 Minecraft 基岩版生态的开源组织',
    sloganSub: '我们致力于构建高质量的 Minecraft 基岩版开源项目，从服务端核心到开发工具，打造完整的技术生态',
    ctaStart: '探索项目',
    ctaGithub: 'GitHub',
    scrollHint: '向下滚动查看更多',
    website: '官网',
    featuresTitle: '我们的优势',
    featOpenTitle: '开源驱动',
    featOpenDesc: '所有项目完全开源，欢迎社区贡献，共同推动 Minecraft 基岩版生态发展。',
    featPerformTitle: '高性能核心',
    featPerformDesc: 'Nukkit-MOT 作为旗舰项目，基于 Java 构建，为基岩版服务器提供卓越性能。',
    featPluginTitle: '丰富生态',
    featPluginDesc: '涵盖服务端核心、插件框架、开发工具等，提供完整的基岩版技术栈。',
    featCommunityTitle: '活跃社区',
    featCommunityDesc: '拥有活跃的开发者社区，持续更新维护，快速响应问题。',
    totalStars: '获得的 Star',
    totalForks: '获得的 Fork',
    publicRepos: '公开仓库',
    followers: '关注者',
    featuredProjects: '精选项目',
    sortStars: '最多 Star',
    sortUpdated: '最近更新',
    sortCreated: '最新创建',
    noDesc: '暂无描述',
    viewMore: '查看更多',
    viewLess: '收起',
    resourcesTitle: '开发资源',
    resourcesDesc: '获取构建产物和项目依赖，助力你的开发工作。',
    communityTitle: '加入社区',
    communityDesc: '与其他开发者和服务器管理员交流，获取帮助和分享经验。',
    discordTitle: 'Discord',
    discordDesc: '加入我们的 Discord 服务器，与全球开发者实时交流。',
    discordBtn: '加入 Discord',
    qqTitle: 'QQ 群',
    qqDesc: '加入 QQ 交流群，获取中文社区支持和帮助。',
    qqBtn: '加入 QQ 群',
    ciTitle: '构建站',
    ciDesc: '访问 MOTCI 构建站，获取项目的最新构建产物。',
    ciBtn: '前往构建站',
    repoTitle: 'Maven 仓库',
    repoDesc: '访问 Maven 仓库，获取项目依赖和开发资源。',
    repoBtn: '前往仓库',
    loadFailed: '加载失败',
    reload: '重新加载',
    timeMonths: '{n} 个月前',
    timeDays: '{n} 天前',
    timeRecent: '最近',
  },
  en: {
    siteTitle: 'MemoriesOfTime - Open-Source Organization for Minecraft Bedrock',
    siteDesc: 'MemoriesOfTime is an open-source organization focused on the Minecraft Bedrock Edition ecosystem, covering server cores, developer tools, and plugins.',
    ogDesc: 'Open-source organization for Minecraft Bedrock ecosystem',
    navHome: 'Home',
    navFeatures: 'Features',
    navProjects: 'Projects',
    navResources: 'Resources',
    navCommunity: 'Community',
    slogan: 'Open-Source Organization for Minecraft Bedrock',
    sloganSub: 'We build high-quality open-source projects for Minecraft Bedrock Edition — from server cores to developer tools — creating a complete ecosystem',
    ctaStart: 'Explore Projects',
    ctaGithub: 'GitHub',
    scrollHint: 'Scroll down to explore',
    website: 'Website',
    featuresTitle: 'Our Strengths',
    featOpenTitle: 'Open Source Driven',
    featOpenDesc: 'All projects are fully open source. We welcome community contributions to advance the Bedrock ecosystem together.',
    featPerformTitle: 'High-Performance Core',
    featPerformDesc: 'Nukkit-MOT, our flagship project, is built on Java to deliver exceptional performance for Bedrock servers.',
    featPluginTitle: 'Rich Ecosystem',
    featPluginDesc: 'Covering server cores, plugin frameworks, and dev tools — a complete tech stack for Bedrock Edition.',
    featCommunityTitle: 'Active Community',
    featCommunityDesc: 'Backed by an active developer community with continuous updates and quick issue response.',
    totalStars: 'Total Stars',
    totalForks: 'Total Forks',
    publicRepos: 'Public Repos',
    followers: 'Followers',
    featuredProjects: 'Featured Projects',
    sortStars: 'Most Stars',
    sortUpdated: 'Recently Updated',
    sortCreated: 'Newest',
    noDesc: 'No description',
    viewMore: 'View More',
    viewLess: 'Show Less',
    resourcesTitle: 'Developer Resources',
    resourcesDesc: 'Get build artifacts and project dependencies to power your development.',
    communityTitle: 'Join the Community',
    communityDesc: 'Connect with other developers and server admins to get help and share experiences.',
    discordTitle: 'Discord',
    discordDesc: 'Join our Discord server to chat with developers worldwide in real time.',
    discordBtn: 'Join Discord',
    qqTitle: 'QQ Group',
    qqDesc: 'Join the QQ group for Chinese community support and help.',
    qqBtn: 'Join QQ Group',
    ciTitle: 'CI Builds',
    ciDesc: 'Visit MOTCI for the latest build artifacts of our projects.',
    ciBtn: 'Go to CI',
    repoTitle: 'Maven Repository',
    repoDesc: 'Access the Maven repository for project dependencies and dev resources.',
    repoBtn: 'Go to Repository',
    loadFailed: 'Failed to load',
    reload: 'Reload',
    timeMonths: '{n} months ago',
    timeDays: '{n} days ago',
    timeRecent: 'Recently',
  }
};

let currentLang = navigator.language.startsWith('zh') ? 'zh' : 'en';

function t(key) {
  return TRANSLATIONS[currentLang][key] || key;
}

function toggleLang() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  updateSEOMeta();
  renderNavbar(cachedData ? cachedData.user : null);
  if (cachedData) {
    document.getElementById('app').innerHTML = renderContent(cachedData);
  } else {
    document.getElementById('app').innerHTML = renderFallback();
  }
  initScrollAnimations();
}

function updateSEOMeta() {
  document.title = t('siteTitle');
  const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  setMeta('meta[name="description"]', 'content', t('siteDesc'));
  setMeta('meta[property="og:title"]', 'content', t('siteTitle'));
  setMeta('meta[property="og:description"]', 'content', t('ogDesc'));
  setMeta('meta[name="twitter:title"]', 'content', t('siteTitle'));
  setMeta('meta[name="twitter:description"]', 'content', t('ogDesc'));
}

/* --- Data --- */
const LANG_COLORS = {
  Java: '#b07219', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  Kotlin: '#A97BFF', Python: '#3572A5', Go: '#00ADD8', Rust: '#dea584',
  'C++': '#f34b7d', C: '#555555', HTML: '#e34c26', CSS: '#563d7c',
  Shell: '#89e051', Lua: '#000080', PowerShell: '#012456',
};

const SORT_OPTIONS = [
  { value: 'stars', labelKey: 'sortStars' },
  { value: 'updated', labelKey: 'sortUpdated' },
  { value: 'created', labelKey: 'sortCreated' },
];

/* --- State --- */
let currentSort = 'stars';
let cachedData = null;
let showAllRepos = false;

/* --- Icons --- */
const icons = {
  github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  fork: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  externalLink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  puzzle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
  qq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  build: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><polyline points="6 15 10 11 6 7"/><line x1="13" y1="15" x2="18" y2="15"/></svg>',
};

/* --- Utilities --- */
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays > 30) return t('timeMonths').replace('{n}', Math.floor(diffDays / 30));
  if (diffDays > 0) return t('timeDays').replace('{n}', diffDays);
  return t('timeRecent');
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

function setCacheData(user, repos) {
  try { localStorage.setItem(CONFIG.cacheKey, JSON.stringify({ timestamp: Date.now(), user, repos })); } catch (e) { console.error(e); }
}

/* --- API --- */
async function fetchGitHubData(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCachedData();
    if (cached) return cached;
  }

  const userRes = await fetch(`https://api.github.com/orgs/${CONFIG.username}`);
  if (!userRes.ok) throw new Error('Failed to fetch organization');
  const user = await userRes.json();

  const reposRes = await fetch(`https://api.github.com/orgs/${CONFIG.username}/repos?sort=updated&per_page=100`);
  if (!reposRes.ok) throw new Error('Failed to fetch repos');
  const repos = await reposRes.json();

  setCacheData(user, repos);
  return { user, repos };
}

/* --- Data Processing --- */
function processRepos(repos, sortType) {
  let sorted = [...repos];
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
  const avatarUrl = user ? user.avatar_url : 'https://avatars.githubusercontent.com/u/62042238?v=4';
  document.getElementById('nav-container').innerHTML = `
    <nav class="navbar" id="navbar">
      <div class="navbar-inner">
        <a href="#hero" class="navbar-brand">
          <img src="${avatarUrl}" alt="MOT">
          <span>MemoriesOfTime</span>
        </a>
        <div class="navbar-links" id="navLinks">
          <a href="#hero" onclick="closeMenu()">${t('navHome')}</a>
          <a href="#features" onclick="closeMenu()">${t('navFeatures')}</a>
          <a href="#projects" onclick="closeMenu()">${t('navProjects')}</a>
          <a href="#resources" onclick="closeMenu()">${t('navResources')}</a>
          <a href="#community" onclick="closeMenu()">${t('navCommunity')}</a>
          <button class="lang-toggle" onclick="toggleLang()">${currentLang === 'zh' ? 'EN' : '中文'}</button>
        </div>
        <button class="menu-toggle" onclick="toggleMenu()">${icons.menu}</button>
      </div>
    </nav>
  `;
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function closeMenu() {
  document.getElementById('navLinks').classList.remove('open');
}

/* --- Render: Loading & Error --- */
function renderLoading() {
  return `
    <section class="hero" style="min-height: 100vh;">
      <div class="container">
        <div class="hero-content" style="justify-content: center;">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex:1;">
            <div class="skeleton skeleton-text" style="width:150px; height:30px;"></div>
            <div class="skeleton skeleton-text" style="width:100px; height:20px; margin-top:12px;"></div>
          </div>
        </div>
      </div>
    </section>`;
}

function renderFallback() {
  const orgUrl = `https://github.com/${CONFIG.username}`;
  const avatarUrl = 'https://avatars.githubusercontent.com/u/62042238?v=4';

  return `
    <section class="hero" id="hero">
      <div class="container">
        <div class="hero-content">
          <div class="avatar-wrapper anim-item">
            <img src="${avatarUrl}" alt="${CONFIG.username}" class="avatar">
          </div>
          <div class="hero-info">
            <h1 class="hero-name anim-item" style="animation-delay: 0.15s">${CONFIG.username}</h1>
            <p class="hero-slogan anim-item" style="animation-delay: 0.25s">${t('slogan')}</p>
            <p class="hero-slogan-sub anim-item" style="animation-delay: 0.3s">${t('sloganSub')}</p>

            <div class="hero-cta anim-item" style="animation-delay: 0.4s">
              <a href="${orgUrl}" target="_blank" class="btn-primary">${icons.github} ${t('ctaGithub')}</a>
            </div>
          </div>
        </div>
      </div>

      <div class="scroll-indicator" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" style="cursor:pointer">
        <div class="scroll-content">
          <span>${t('scrollHint')}</span>
          ${icons.chevronDown}
        </div>
      </div>
    </section>

    ${renderFeatures()}

    ${renderResources()}

    ${renderCommunity()}

    <footer class="footer glass-panel" style="border-radius:0;">
      <div class="container">
        <p class="footer-text">&copy; 2026 MemoriesOfTime. All rights reserved.</p>
      </div>
    </footer>`;
}

/* --- Render: Features --- */
function renderFeatures() {
  const features = [
    { icon: icons.github, titleKey: 'featOpenTitle', descKey: 'featOpenDesc' },
    { icon: icons.zap, titleKey: 'featPerformTitle', descKey: 'featPerformDesc' },
    { icon: icons.puzzle, titleKey: 'featPluginTitle', descKey: 'featPluginDesc' },
    { icon: icons.users, titleKey: 'featCommunityTitle', descKey: 'featCommunityDesc' },
  ];

  return `
    <section class="features" id="features">
      <div class="container">
        <div class="features-header scroll-anim">
          <h2 class="features-title">${t('featuresTitle')}</h2>
        </div>
        <div class="features-grid">
          ${features.map((f, i) => `
            <div class="feature-card glass-panel scroll-anim" data-delay="${i * 100}">
              <div class="feature-icon">${f.icon}</div>
              <h3 class="feature-title">${t(f.titleKey)}</h3>
              <p class="feature-desc">${t(f.descKey)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
}

/* --- Render: Repo Grid --- */
function renderRepoGrid(repos) {
  const sortedRepos = processRepos(repos, currentSort);
  return `<div class="repo-grid">${sortedRepos.map((repo, i) => `
    <div class="repo-card glass-panel scroll-anim" data-delay="${Math.min(i * 80, 400)}">
      <div class="repo-header">
        <div class="repo-icon">${icons.github}</div>
        <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name} ${icons.externalLink}</a>
      </div>
      <p class="repo-desc">${repo.description || t('noDesc')}</p>
      ${repo.topics.length > 0 ? `<div class="repo-topics">${repo.topics.slice(0, 3).map(tp => `<span class="topic">${tp}</span>`).join('')}</div>` : ''}
      <div class="repo-footer">
        ${repo.language ? `<span class="repo-lang"><span class="repo-lang-dot" style="background:${LANG_COLORS[repo.language] || '#6e7681'}"></span>${repo.language}</span>` : '<span></span>'}
        <span class="repo-stat">${icons.star} ${repo.stargazers_count}</span>
        <span class="repo-stat">${icons.fork} ${repo.forks_count}</span>
      </div>
    </div>
  `).join('')}</div>`;
}

function renderReposInner(repos) {
  const allRepos = repos;
  return `
    <div class="repos-header">
      <div><h2 class="repos-title">${t('featuredProjects')}</h2></div>
      <div class="controls-wrapper">
        <div class="select-wrapper">
          <select class="select" onchange="changeSort(this.value)">
            ${SORT_OPTIONS.map(opt => `<option value="${opt.value}" ${opt.value === currentSort ? 'selected' : ''}>${t(opt.labelKey)}</option>`).join('')}
          </select>
          <span class="select-arrow">${icons.chevronDown}</span>
        </div>
        <button class="btn btn-icon" onclick="refreshData()" id="refreshBtn">${icons.refresh}</button>
      </div>
    </div>
    ${renderRepoGrid(repos)}
    ${allRepos.length > 6 ? `
      <div class="view-more-wrapper scroll-anim">
        <button class="btn" onclick="toggleViewMore()">${showAllRepos ? t('viewLess') : t('viewMore')}</button>
      </div>
    ` : ''}`;
}

/* --- Render: Resources --- */
function renderResources() {
  return `
    <section class="community" id="resources">
      <div class="container">
        <div class="community-header scroll-anim">
          <h2 class="community-title">${t('resourcesTitle')}</h2>
          <p class="community-desc">${t('resourcesDesc')}</p>
        </div>
        <div class="community-grid">
          <div class="community-card glass-panel scroll-anim" data-delay="0">
            <div class="community-icon">${icons.build}</div>
            <h3 class="community-card-title">${t('ciTitle')}</h3>
            <p class="community-card-desc">${t('ciDesc')}</p>
            <a href="${CONFIG.ciUrl}" target="_blank" class="btn-secondary-outline">${t('ciBtn')}</a>
          </div>
          <div class="community-card glass-panel scroll-anim" data-delay="100">
            <div class="community-icon">${icons.package}</div>
            <h3 class="community-card-title">${t('repoTitle')}</h3>
            <p class="community-card-desc">${t('repoDesc')}</p>
            <a href="${CONFIG.repoUrl}" target="_blank" class="btn-secondary-outline">${t('repoBtn')}</a>
          </div>
        </div>
      </div>
    </section>`;
}

/* --- Render: Community --- */
function renderCommunity() {
  return `
    <section class="community" id="community">
      <div class="container">
        <div class="community-header scroll-anim">
          <h2 class="community-title">${t('communityTitle')}</h2>
          <p class="community-desc">${t('communityDesc')}</p>
        </div>
        <div class="community-grid">
          <div class="community-card glass-panel scroll-anim" data-delay="0">
            <div class="community-icon">${icons.discord}</div>
            <h3 class="community-card-title">${t('discordTitle')}</h3>
            <p class="community-card-desc">${t('discordDesc')}</p>
            <a href="${CONFIG.discordUrl}" target="_blank" class="btn-secondary-outline">${t('discordBtn')}</a>
          </div>
          <div class="community-card glass-panel scroll-anim" data-delay="100">
            <div class="community-icon">${icons.qq}</div>
            <h3 class="community-card-title">${t('qqTitle')}</h3>
            <p class="community-card-desc">${t('qqDesc')}</p>
            <a href="${CONFIG.qqGroupUrl}" target="_blank" class="btn-secondary-outline">${t('qqBtn')}</a>
          </div>
        </div>
      </div>
    </section>`;
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
            <img src="${user.avatar_url}" alt="${user.name || user.login}" class="avatar">
          </div>
          <div class="hero-info">
            <h1 class="hero-name anim-item" style="animation-delay: 0.15s">${user.name || user.login}</h1>
            <p class="hero-username anim-item" style="animation-delay: 0.2s">@${user.login}</p>
            <p class="hero-slogan anim-item" style="animation-delay: 0.25s">${t('slogan')}</p>
            <p class="hero-slogan-sub anim-item" style="animation-delay: 0.3s">${t('sloganSub')}</p>

            <div class="hero-meta anim-item" style="animation-delay: 0.35s">
              ${user.location ? `<span>${icons.mapPin} ${user.location}</span>` : ''}
              ${user.blog ? `<a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank">${icons.link} ${t('website')}</a>` : ''}
              <a href="${user.html_url}" target="_blank">${icons.github} GitHub</a>
            </div>

            <div class="hero-cta anim-item" style="animation-delay: 0.4s">
              <a href="#projects" class="btn-primary">${t('ctaStart')}</a>
              <a href="${user.html_url}" target="_blank" class="btn-secondary-outline">${icons.github} ${t('ctaGithub')}</a>
            </div>

            <div class="languages anim-item" style="animation-delay: 0.45s">
              ${languages.map(([lang]) => `
                <span class="language-badge glass-panel"><span class="repo-lang-dot" style="background:${LANG_COLORS[lang] || '#6e7681'}"></span>${lang}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="scroll-indicator" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" style="cursor:pointer">
        <div class="scroll-content">
          <span>${t('scrollHint')}</span>
          ${icons.chevronDown}
        </div>
      </div>
    </section>

    ${renderFeatures()}

    <section class="stats" id="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card glass-panel scroll-anim" data-delay="0">
            <div class="stat-content"><div class="stat-icon">${icons.star}</div><div>
              <div class="stat-value">${totalStars.toLocaleString()}</div><div class="stat-label">${t('totalStars')}</div>
            </div></div>
          </div>
          <div class="stat-card glass-panel scroll-anim" data-delay="100">
            <div class="stat-content"><div class="stat-icon">${icons.fork}</div><div>
              <div class="stat-value">${totalForks.toLocaleString()}</div><div class="stat-label">${t('totalForks')}</div>
            </div></div>
          </div>
          <div class="stat-card glass-panel scroll-anim" data-delay="200">
            <div class="stat-content"><div class="stat-icon">${icons.github}</div><div>
              <div class="stat-value">${user.public_repos}</div><div class="stat-label">${t('publicRepos')}</div>
            </div></div>
          </div>
          <div class="stat-card glass-panel scroll-anim" data-delay="300">
            <div class="stat-content"><div class="stat-icon">${icons.users}</div><div>
              <div class="stat-value">${user.followers || '-'}</div><div class="stat-label">${t('followers')}</div>
            </div></div>
          </div>
        </div>
      </div>
    </section>

    <section class="repos" id="projects">
      <div class="container">
        ${renderReposInner(repos)}
      </div>
    </section>

    ${renderResources()}

    ${renderCommunity()}

    <footer class="footer glass-panel" style="border-radius:0;">
      <div class="container">
        <p class="footer-text">&copy; 2026 MemoriesOfTime. All rights reserved.</p>
      </div>
    </footer>`;
}

/* --- Event Handlers --- */
function changeSort(value) {
  currentSort = value;
  if (cachedData) {
    document.querySelector('#projects .container').innerHTML = renderReposInner(cachedData.repos);
    initScrollAnimations();
  }
}

function toggleViewMore() {
  showAllRepos = !showAllRepos;
  if (cachedData) {
    document.querySelector('#projects .container').innerHTML = renderReposInner(cachedData.repos);
    initScrollAnimations();
  }
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
  } catch (e) {
    console.error(e);
  } finally {
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-anim:not(.visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });

  elements.forEach(el => observer.observe(el));
}

function initScrollListener() {
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  }, { passive: true });
}

/* --- Init --- */
async function init() {
  const app = document.getElementById('app');
  renderNavbar(null);
  initScrollListener();
  updateSEOMeta();
  app.innerHTML = renderLoading();
  try {
    cachedData = await fetchGitHubData();
    renderNavbar(cachedData.user);
    app.innerHTML = renderContent(cachedData);
    initScrollAnimations();
  } catch (e) {
    console.error('GitHub API unavailable:', e.message);
    app.innerHTML = renderFallback();
    initScrollAnimations();
  }
}

init();
