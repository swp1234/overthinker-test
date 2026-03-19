// Overthinker Test - Quiz Engine
(function() {
'use strict';

const TOTAL_QUESTIONS = 8;
const t = (key) => window.i18n ? window.i18n.t(key) : key;

// 6 types: spiral, architect, rehearser, analyst, catastrophizer, replayer
const TYPES = {
  spiral: {
    id: 'spiral', emoji: '🌀', color: '#7c3aed',
    metrics: { nightThinking: 95, loopIntensity: 90, sleepImpact: 85, creativity: 70, anxiety: 80 }
  },
  architect: {
    id: 'architect', emoji: '🏗️', color: '#3b82f6',
    metrics: { nightThinking: 60, loopIntensity: 75, sleepImpact: 50, creativity: 95, anxiety: 55 }
  },
  rehearser: {
    id: 'rehearser', emoji: '💬', color: '#10b981',
    metrics: { nightThinking: 65, loopIntensity: 80, sleepImpact: 55, creativity: 70, anxiety: 75 }
  },
  analyst: {
    id: 'analyst', emoji: '🔍', color: '#f59e0b',
    metrics: { nightThinking: 50, loopIntensity: 70, sleepImpact: 40, creativity: 60, anxiety: 65 }
  },
  catastrophizer: {
    id: 'catastrophizer', emoji: '⚡', color: '#ef4444',
    metrics: { nightThinking: 80, loopIntensity: 85, sleepImpact: 75, creativity: 50, anxiety: 95 }
  },
  replayer: {
    id: 'replayer', emoji: '🔄', color: '#8b5cf6',
    metrics: { nightThinking: 85, loopIntensity: 95, sleepImpact: 70, creativity: 55, anxiety: 70 }
  }
};

const QUESTIONS = [
  { id: 0, icon: '🌙', dimension: 'night',
    questionKey: 'question.0',
    options: ['question.0a', 'question.0b', 'question.0c', 'question.0d'] },
  { id: 1, icon: '💬', dimension: 'social',
    questionKey: 'question.1',
    options: ['question.1a', 'question.1b', 'question.1c', 'question.1d'] },
  { id: 2, icon: '📱', dimension: 'digital',
    questionKey: 'question.2',
    options: ['question.2a', 'question.2b', 'question.2c', 'question.2d'] },
  { id: 3, icon: '😰', dimension: 'stress',
    questionKey: 'question.3',
    options: ['question.3a', 'question.3b', 'question.3c', 'question.3d'] },
  { id: 4, icon: '🤝', dimension: 'relationship',
    questionKey: 'question.4',
    options: ['question.4a', 'question.4b', 'question.4c', 'question.4d'] },
  { id: 5, icon: '🎯', dimension: 'decision',
    questionKey: 'question.5',
    options: ['question.5a', 'question.5b', 'question.5c', 'question.5d'] },
  { id: 6, icon: '🔮', dimension: 'future',
    questionKey: 'question.6',
    options: ['question.6a', 'question.6b', 'question.6c', 'question.6d'] },
  { id: 7, icon: '💭', dimension: 'meta',
    questionKey: 'question.7',
    options: ['question.7a', 'question.7b', 'question.7c', 'question.7d'] }
];

// Score mapping: each option gives points to [spiral, architect, rehearser, analyst, catastrophizer, replayer]
const SCORE_MAP = {
  '0a': [3, 0, 1, 0, 2, 1], // replay embarrassing moments
  '0b': [2, 3, 0, 0, 1, 0], // imagine alternate scenarios
  '0c': [0, 0, 3, 1, 0, 2], // rehearse tomorrow's conversations
  '0d': [1, 1, 0, 0, 3, 0], // worry about everything that could go wrong
  '1a': [0, 0, 3, 2, 0, 1], // rehearse what to say beforehand
  '1b': [1, 0, 0, 3, 0, 0], // analyze everyone's micro-expressions
  '1c': [0, 3, 0, 0, 2, 0], // imagine all possible conversation outcomes
  '1d': [2, 0, 1, 0, 0, 3], // replay the conversation afterwards
  '2a': [0, 0, 0, 3, 1, 2], // re-read sent messages multiple times
  '2b': [1, 3, 0, 0, 2, 0], // imagine how they'll interpret your message
  '2c': [3, 0, 2, 0, 0, 1], // spiral about why they haven't replied
  '2d': [0, 0, 3, 1, 0, 0], // draft and re-draft before sending
  '3a': [3, 1, 0, 0, 2, 0], // can't sleep, mind races in circles
  '3b': [0, 0, 0, 0, 3, 2], // jump to worst-case scenarios
  '3c': [0, 3, 0, 1, 0, 0], // build elaborate contingency plans
  '3d': [1, 0, 0, 0, 0, 3], // obsess over past mistakes
  '4a': [0, 0, 0, 3, 0, 2], // analyze their tone of voice obsessively
  '4b': [2, 0, 3, 0, 0, 1], // practice difficult conversations in your head
  '4c': [0, 3, 0, 0, 2, 0], // imagine every possible reaction they might have
  '4d': [3, 0, 0, 0, 1, 0], // lie awake thinking about what you should have said
  '5a': [0, 3, 0, 0, 2, 0], // research every option exhaustively
  '5b': [0, 0, 0, 0, 3, 1], // focus on what could go wrong with each choice
  '5c': [2, 0, 0, 3, 0, 0], // ask everyone's opinion and overanalyze advice
  '5d': [0, 0, 2, 0, 0, 3], // keep second-guessing after deciding
  '6a': [0, 0, 0, 0, 3, 0], // catastrophize about unlikely disasters
  '6b': [0, 3, 2, 0, 0, 0], // create detailed mental simulations
  '6c': [3, 0, 0, 0, 1, 2], // lose sleep over things years away
  '6d': [0, 0, 3, 1, 0, 0], // rehearse hypothetical future conversations
  '7a': [3, 0, 0, 0, 2, 1], // overthink about how much you overthink
  '7b': [0, 0, 0, 3, 0, 2], // analyze WHY you overthink
  '7c': [0, 3, 0, 0, 0, 0], // build theories about your own thought patterns
  '7d': [0, 0, 2, 0, 3, 0]  // worry that overthinking will ruin your life
};

class OverthinkerQuiz {
  constructor() {
    this.currentQuestion = 0;
    this.scores = [0, 0, 0, 0, 0, 0]; // spiral, architect, rehearser, analyst, catastrophizer, replayer
    this.answers = [];
    this.carouselIdx = 0;
    this.init();
  }

  init() {
    // Hide loader immediately
    const loader = document.getElementById('app-loader');
    if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 300); }

    // Theme
    this.initTheme();
    // Language
    this.initLangSelector();
    // Carousel
    this.initCarousel();
    // Buttons
    document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
    document.getElementById('retry-btn').addEventListener('click', () => this.retryQuiz());
    // Share
    document.getElementById('share-kakao').addEventListener('click', () => this.shareKakao());
    document.getElementById('share-twitter').addEventListener('click', () => this.shareTwitter());
    document.getElementById('share-facebook').addEventListener('click', () => this.shareFacebook());
    document.getElementById('share-copy').addEventListener('click', () => this.shareCopy());
  }

  initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
    const btn = document.getElementById('theme-toggle');
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        btn.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        btn.textContent = '☀️';
        localStorage.setItem('theme', 'light');
      }
    });
    if (saved === 'light') btn.textContent = '☀️';
  }

  initLangSelector() {
    const toggle = document.getElementById('lang-toggle');
    const menu = document.getElementById('lang-menu');
    toggle.addEventListener('click', () => menu.classList.toggle('hidden'));
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.i18n) window.i18n.setLanguage(btn.dataset.lang);
        menu.classList.add('hidden');
      });
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.language-selector')) menu.classList.add('hidden');
    });
  }

  initCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    if (!items.length) return;
    items[0].classList.add('active');
    setInterval(() => {
      items[this.carouselIdx].classList.remove('active');
      this.carouselIdx = (this.carouselIdx + 1) % items.length;
      items[this.carouselIdx].classList.add('active');
    }, 3000);
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startQuiz() {
    this.currentQuestion = 0;
    this.scores = [0, 0, 0, 0, 0, 0];
    this.answers = [];
    this.showScreen('question-screen');
    this.renderQuestion();
    try { gtag('event', 'quiz_start', { event_category: 'overthinker_test' }); } catch(e) {}
  }

  renderQuestion() {
    const q = QUESTIONS[this.currentQuestion];
    const pct = ((this.currentQuestion) / TOTAL_QUESTIONS * 100);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').textContent = `${this.currentQuestion + 1} / ${TOTAL_QUESTIONS}`;
    document.getElementById('question-icon').textContent = q.icon;
    document.getElementById('question-text').textContent = t(q.questionKey);

    const optionsEl = document.getElementById('options');
    optionsEl.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D'];
    q.options.forEach((optKey, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.style.animationDelay = (idx * 0.06) + 's';
      btn.innerHTML = `<span class="option-label">${labels[idx]}</span><span>${t(optKey)}</span>`;
      btn.addEventListener('click', () => this.selectOption(idx));
      optionsEl.appendChild(btn);
    });

    // Mid-quiz encouragement at Q4
    const midMsg = document.getElementById('mid-quiz-msg');
    if (this.currentQuestion === 4) {
      midMsg.classList.remove('hidden');
    } else {
      midMsg.classList.add('hidden');
    }
  }

  selectOption(idx) {
    // Visual feedback
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.style.pointerEvents = 'none');
    btns[idx].classList.add('selected');

    // Score
    const scoreKey = `${this.currentQuestion}${['a','b','c','d'][idx]}`;
    const points = SCORE_MAP[scoreKey];
    if (points) {
      for (let i = 0; i < 6; i++) this.scores[i] += points[i];
    }
    this.answers.push({ question: this.currentQuestion, option: idx });

    setTimeout(() => {
      this.currentQuestion++;
      if (this.currentQuestion >= TOTAL_QUESTIONS) {
        this.showAnalyzing();
      } else {
        this.renderQuestion();
      }
    }, 400);
  }

  showAnalyzing() {
    this.showScreen('analyzing-screen');
    const fill = document.getElementById('analyzing-fill');
    const status = document.getElementById('analyzing-status');
    const steps = [
      { pct: 20, key: 'analyzing.step1' },
      { pct: 45, key: 'analyzing.step2' },
      { pct: 70, key: 'analyzing.step3' },
      { pct: 90, key: 'analyzing.step4' },
      { pct: 100, key: 'analyzing.step5' }
    ];
    let i = 0;
    const advance = () => {
      if (i >= steps.length) { this.showResult(); return; }
      fill.style.width = steps[i].pct + '%';
      status.textContent = t(steps[i].key);
      i++;
      setTimeout(advance, 500);
    };
    advance();
  }

  calculateResult() {
    let maxIdx = 0;
    for (let i = 1; i < 6; i++) {
      if (this.scores[i] > this.scores[maxIdx]) maxIdx = i;
    }
    const typeKeys = ['spiral', 'architect', 'rehearser', 'analyst', 'catastrophizer', 'replayer'];
    return TYPES[typeKeys[maxIdx]];
  }

  showResult() {
    const result = this.calculateResult();
    this.showScreen('result-screen');

    document.getElementById('result-badge').textContent = result.emoji;
    document.getElementById('result-type').textContent = t(`type.${result.id}.name`);
    document.getElementById('result-tagline').textContent = t(`type.${result.id}.tagline`);
    document.getElementById('result-desc').textContent = t(`type.${result.id}.description`);

    // Metrics
    const metricsList = document.getElementById('metrics-list');
    metricsList.innerHTML = '';
    const metricLabels = {
      nightThinking: 'result.metric.nightThinking',
      loopIntensity: 'result.metric.loopIntensity',
      sleepImpact: 'result.metric.sleepImpact',
      creativity: 'result.metric.creativity',
      anxiety: 'result.metric.anxiety'
    };
    Object.entries(result.metrics).forEach(([key, val]) => {
      const row = document.createElement('div');
      row.className = 'metric-row';
      row.innerHTML = `
        <span class="metric-label">${t(metricLabels[key])}</span>
        <div class="metric-bar"><div class="metric-fill" style="width:0"></div></div>
        <span class="metric-value">${val}%</span>`;
      metricsList.appendChild(row);
    });
    // Animate metrics
    setTimeout(() => {
      metricsList.querySelectorAll('.metric-fill').forEach((bar, i) => {
        const val = Object.values(result.metrics)[i];
        bar.style.width = val + '%';
      });
    }, 100);

    // Percentile
    const pct = Math.floor(Math.random() * 15) + 5;
    document.getElementById('percentile-text').textContent =
      t('result.percentile').replace('{pct}', pct);

    // Traits
    const traitsWrap = document.getElementById('traits-wrap');
    traitsWrap.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const tag = document.createElement('span');
      tag.className = 'trait-tag';
      tag.textContent = t(`type.${result.id}.trait${i}`);
      traitsWrap.appendChild(tag);
    }

    // Confetti
    this.spawnConfetti();

    // GA4
    try { gtag('event', 'quiz_complete', { event_category: 'overthinker_test', event_label: result.id }); } catch(e) {}

    this.currentResult = result;
  }

  spawnConfetti() {
    const colors = ['#7c3aed', '#a78bfa', '#c084fc', '#f59e0b', '#10b981', '#ef4444'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = Math.random() * 1.5 + 's';
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.width = (Math.random() * 6 + 4) + 'px';
      el.style.height = (Math.random() * 6 + 4) + 'px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }

  retryQuiz() {
    this.startQuiz();
  }

  getShareText() {
    if (!this.currentResult) return '';
    const name = t(`type.${this.currentResult.id}.name`);
    return t('share.text').replace('{type}', name).replace('{emoji}', this.currentResult.emoji);
  }

  shareKakao() {
    const text = this.getShareText();
    const url = window.location.href;
    window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  }

  shareTwitter() {
    const text = this.getShareText();
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  shareFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }

  shareCopy() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('share-copy');
      const origHTML = btn.innerHTML;
      btn.innerHTML = '<span class="share-icon">✓</span><span class="share-label">' + t('share.copied') + '</span>';
      setTimeout(() => { btn.innerHTML = origHTML; }, 2000);
    }).catch(() => { prompt('Copy:', window.location.href); });
  }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new OverthinkerQuiz());
} else {
  new OverthinkerQuiz();
}

})();
