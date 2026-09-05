(function(){
'use strict';

const TOTAL=8;
const TYPES=['spiral','architect','rehearser','analyst','catastrophizer','replayer'];
const ICONS=['↻','◇','…','⌁','△','◴'];
const QUESTIONS=Array.from({length:TOTAL},(_,id)=>({id,questionKey:`question.${id}`,options:[0,1,2,3].map(n=>`question.${id}${'abcd'[n]}`)}));
const ANSWER_TYPE=[
  [5,1,2,4], [2,3,1,5], [3,1,0,2], [0,4,1,5],
  [3,2,1,0], [1,4,3,5], [4,1,0,2], [0,3,1,4]
];
const tracked=new Set();
const t=key=>window.i18n?window.i18n.t(key):key;
const format=(text,vars)=>Object.entries(vars).reduce((value,[key,replacement])=>value.replaceAll(`{${key}}`,replacement),text);

function track(stage){
  if(tracked.has(stage))return;
  tracked.add(stage);
  if(typeof window.gtag==='function')window.gtag('event',`overthinker_${stage}`,{event_category:'overthinker_reflection'});
}

class Reflection{
  constructor(){
    this.index=0;
    this.scores=Array(TYPES.length).fill(0);
    this.answers=[];
    this.locked=false;
    this.bind();
    this.syncRoutes();
    Promise.resolve(window.i18n&&window.i18n.ready).finally(()=>{
      this.syncRoutes();
      track('view');
    });
  }

  bind(){
    document.getElementById('start-btn').addEventListener('click',()=>this.start());
    document.getElementById('retry-btn').addEventListener('click',()=>this.retry());
    document.getElementById('share-page').addEventListener('click',()=>this.share());
    document.getElementById('next-action').addEventListener('click',()=>track('next_click'));
    document.querySelectorAll('[data-related-slug]').forEach(link=>link.addEventListener('click',()=>track('related_click')));
    this.bindTheme();
    this.bindLanguage();
  }

  bindTheme(){
    const button=document.getElementById('theme-toggle');
    const saved=localStorage.getItem('overthinker-theme');
    if(saved==='light')document.documentElement.dataset.theme='light';
    const update=()=>button.textContent=document.documentElement.dataset.theme==='light'?'☀':'☾';
    update();
    button.addEventListener('click',()=>{
      const light=document.documentElement.dataset.theme!=='light';
      if(light)document.documentElement.dataset.theme='light';else delete document.documentElement.dataset.theme;
      localStorage.setItem('overthinker-theme',light?'light':'dark');
      update();
    });
  }

  bindLanguage(){
    const toggle=document.getElementById('lang-toggle');
    const menu=document.getElementById('lang-menu');
    toggle.addEventListener('click',()=>{
      menu.hidden=!menu.hidden;
      toggle.setAttribute('aria-expanded',String(!menu.hidden));
    });
    menu.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',async()=>{
      if(window.i18n)await window.i18n.setLanguage(button.dataset.lang);
      menu.hidden=true;
      toggle.setAttribute('aria-expanded','false');
      this.syncRoutes();
      if(document.getElementById('question-screen').classList.contains('active'))this.renderQuestion();
      if(document.getElementById('result-screen').classList.contains('active'))this.renderResult();
    }));
    document.addEventListener('click',event=>{
      if(!event.target.closest('.language-selector')){
        menu.hidden=true;
        toggle.setAttribute('aria-expanded','false');
      }
    });
  }

  lang(){return window.i18n&&window.i18n.getCurrentLanguage?window.i18n.getCurrentLanguage():'en'}

  syncRoutes(){
    const lang=this.lang();
    document.getElementById('next-action').href=`/stress-check/?lang=${lang}&source=overthinker_result`;
    document.querySelector('[data-related-slug="emotion-iceberg"]').href=`/emotion-iceberg/?lang=${lang}&source=overthinker_related`;
    document.querySelector('[data-related-slug="hsp-test"]').href=`/hsp-test/?lang=${lang}&source=overthinker_related`;
  }

  show(id){
    document.querySelectorAll('.screen').forEach(screen=>screen.classList.toggle('active',screen.id===id));
    document.getElementById(id).focus?.({preventScroll:true});
    scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }

  start(){
    this.index=0;
    this.scores.fill(0);
    this.answers=[];
    this.locked=false;
    track('start');
    this.show('question-screen');
    this.renderQuestion();
  }

  renderQuestion(){
    const question=QUESTIONS[this.index];
    document.getElementById('progress-text').textContent=`${this.index+1} / ${TOTAL}`;
    document.getElementById('progress-fill').style.width=`${((this.index+1)/TOTAL)*100}%`;
    document.getElementById('question-icon').textContent=ICONS[this.index%ICONS.length];
    document.getElementById('question-text').textContent=t(question.questionKey);
    const options=document.getElementById('options');
    options.replaceChildren();
    question.options.forEach((key,optionIndex)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='option';
      button.textContent=t(key);
      button.addEventListener('click',()=>this.answer(optionIndex));
      options.append(button);
    });
  }

  answer(optionIndex){
    if(this.locked)return;
    this.locked=true;
    document.querySelectorAll('.option').forEach(button=>button.disabled=true);
    const typeIndex=ANSWER_TYPE[this.index][optionIndex];
    this.scores[typeIndex]+=1;
    this.answers.push(typeIndex);
    if(this.answers.length===4)track('progress');
    this.index+=1;
    setTimeout(()=>{
      this.locked=false;
      if(this.index<TOTAL)this.renderQuestion();else this.finish();
    },120);
  }

  winner(){
    let best=0;
    for(let i=1;i<this.scores.length;i++)if(this.scores[i]>this.scores[best])best=i;
    return best;
  }

  finish(){
    this.show('result-screen');
    this.renderResult();
    track('complete');
  }

  renderResult(){
    const index=this.winner();
    const id=TYPES[index];
    const points=this.scores[index];
    document.getElementById('result-badge').textContent=ICONS[index];
    document.getElementById('result-type').textContent=t(`type.${id}.name`);
    document.getElementById('result-tagline').textContent=t(`type.${id}.tagline`);
    document.getElementById('result-calculation').textContent=format(t('result.calculation'),{points:String(points),total:String(TOTAL)});
    document.getElementById('share-status').textContent='';
    this.syncRoutes();
  }

  async share(){
    const data={title:document.title,text:t('share.text'),url:'https://dopabrain.com/overthinker-test/'};
    let success=false;
    try{
      if(navigator.share){await navigator.share(data);success=true}
      else if(navigator.clipboard){await navigator.clipboard.writeText(data.url);success=true}
    }catch(error){if(error&&error.name==='AbortError')return}
    const status=document.getElementById('share-status');
    status.textContent=success?t('share.success'):t('share.failure');
    if(success)track('share');
  }

  retry(){
    this.index=0;
    this.scores.fill(0);
    this.answers=[];
    this.locked=false;
    this.show('intro-screen');
  }
}

new Reflection();
})();
