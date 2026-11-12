
(function(){
  var doc=document.documentElement;
  var bar=document.getElementById('progress');
  function onScroll(){
    var h=document.body.scrollHeight-window.innerHeight;
    var y=window.scrollY||window.pageYOffset;
    if(bar) bar.style.width=(h>0?(y/h*100):0)+'%';
    var t=document.getElementById('totop');
    if(t) t.classList.toggle('show', y>600);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  var flat=/[?&]flat=1/.test(location.search)||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els=document.querySelectorAll('.reveal');
  if(flat||!('IntersectionObserver' in window)){
    els.forEach(function(e){e.classList.add('in')});
  }else{
    var io=new IntersectionObserver(function(list){
      list.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} });
    },{rootMargin:'0px 0px -6% 0px',threshold:.06});
    els.forEach(function(e){io.observe(e)});
  }

  // 地图热点
  var hot=document.querySelectorAll('.hot');
  var items=document.querySelectorAll('.maplist button');
  function select(id){
    hot.forEach(function(h){h.classList.toggle('on',h.getAttribute('data-id')===id)});
    items.forEach(function(b){b.classList.toggle('on',b.getAttribute('data-id')===id)});
  }
  hot.forEach(function(h){h.addEventListener('click',function(){select(h.getAttribute('data-id'))})});
  items.forEach(function(b){b.addEventListener('click',function(){select(b.getAttribute('data-id'))})});
  if(items.length) select(items[0].getAttribute('data-id'));


  // ===== 登录（本地演示） =====
  var KEY='yl_user';
  var loginBtn=document.getElementById('loginBtn');
  var modal=document.getElementById('loginModal');
  var form=document.getElementById('loginForm');
  var done=document.getElementById('loginDone');
  var who=document.getElementById('loginWho');
  var hint=document.getElementById('loginHint');
  var title=document.getElementById('loginTitle');
  function getUser(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
  function setUser(u){localStorage.setItem(KEY,JSON.stringify(u))}
  function renderUser(){
    var u=getUser();
    if(!loginBtn) return;
    loginBtn.textContent=u?'切换账号':'登录';
    loginBtn.classList.toggle('on',!!u);
    if(form){form.hidden=!!u;done.hidden=!u;hint.hidden=!!u;title.textContent=u?('你好，'+u.name):'登录后可以留言';}
    if(u&&who) who.textContent='已登录：'+u.name+(u.email?('（'+u.email+'）'):'')+'　仅保存在本机';
  }
  function openModal(){if(!modal)return;modal.hidden=false;document.body.style.overflow='hidden';if(form&&!form.hidden){var i=form.querySelector('input');if(i)i.focus();}}
  function closeModal(){if(!modal)return;modal.hidden=true;document.body.style.overflow='';}
  if(loginBtn) loginBtn.addEventListener('click',openModal);
  var lc=document.getElementById('loginClose'); if(lc) lc.addEventListener('click',closeModal);
  if(modal) modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    var n=form.name.value.trim(); if(!n) return;
    setUser({name:n,email:form.email.value.trim(),ts:Date.now()});
    renderUser(); closeModal(); renderComments();
  });
  var lo=document.getElementById('logoutBtn');
  if(lo) lo.addEventListener('click',function(){localStorage.removeItem(KEY);renderUser();closeModal();renderComments();});
  renderUser();

  // ===== 留言（本机存储） =====
  var CKEY='yl_comments';
  var list=document.getElementById('cmtList');
  var cform=document.getElementById('commentForm');
  function getComments(){try{return JSON.parse(localStorage.getItem(CKEY)||'[]')}catch(e){return []}}
  function saveComments(a){localStorage.setItem(CKEY,JSON.stringify(a))}
  function esc(t){return String(t).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
  function fmt(ts){var d=new Date(ts);function p(n){return n<10?'0'+n:n}return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())}
  function renderComments(){
    if(!list) return;
    var arr=getComments().sort(function(a,b){return b.ts-a.ts});
    if(!arr.length){list.innerHTML='<li class="cmt-empty">还没有留言。登录后写下第一条——你可以说说哪个章节最打动你，或者指出一处史实需要补充。</li>';return;}
    var me=getUser();
    list.innerHTML=arr.map(function(c){
      return '<li class="cmt-item"><div class="cmt-head"><span class="avatar">'+esc(c.name.slice(0,1))+'</span>'
        +'<span class="cmt-name">'+esc(c.name)+'</span><span>'+fmt(c.ts)+'</span>'
        +(c.stars?('<span>'+'★'.repeat(c.stars)+'</span>'):'')
        +'</div><p class="cmt-body">'+esc(c.text)+'</p>'
        +'<div class="cmt-act"><button data-like="'+c.id+'">赞 <span>'+c.likes+'</span></button>'
        +(me&&me.name===c.name?'<button data-del="'+c.id+'">删除</button>':'')
        +'</div></li>';
    }).join('');
  }
  if(list) list.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    var arr=getComments();
    if(b.dataset.like){var id=b.dataset.like;arr.forEach(function(c){if(c.id===id)c.likes++});saveComments(arr);renderComments();}
    if(b.dataset.del){var id2=b.dataset.del;saveComments(arr.filter(function(c){return c.id!==id2}));renderComments();}
  });
  var starsBox=document.getElementById('stars');
  var starVal=0;
  if(starsBox){
    var sp=starsBox.querySelectorAll('span');
    sp.forEach(function(s,i){s.addEventListener('click',function(){starVal=i+1;sp.forEach(function(x,j){x.classList.toggle('on',j<i+1)})})});
  }
  if(cform) cform.addEventListener('submit',function(e){
    e.preventDefault();
    var u=getUser();
    if(!u){openModal();return;}
    var t=cform.text.value.trim(); if(!t) return;
    var arr=getComments();
    arr.push({id:String(Date.now()),name:u.name,text:t,stars:starVal,likes:0,ts:Date.now()});
    saveComments(arr); cform.reset(); starVal=0;
    if(starsBox) starsBox.querySelectorAll('span').forEach(function(x){x.classList.remove('on')});
    renderComments();
  });
  renderComments();


  // 整屏数字滚动
  (function(){
    var els=document.querySelectorAll('[data-count]');
    if(!els.length) return;
    function run(el){
      var target=parseInt(el.getAttribute('data-count'),10)||0, t0=null;
      function step(ts){
        if(!t0) t0=ts;
        var p=Math.min((ts-t0)/1800,1);
        el.textContent=Math.floor(target*(1-Math.pow(1-p,3)));
        if(p<1) requestAnimationFrame(step); else el.textContent=target;
      }
      requestAnimationFrame(step);
    }
    if(!('IntersectionObserver' in window)){ els.forEach(run); return; }
    var io=new IntersectionObserver(function(list){
      list.forEach(function(en){ if(en.isIntersecting){ run(en.target); io.unobserve(en.target);} });
    },{threshold:.5});
    els.forEach(function(e){io.observe(e)});
  })();


  // 首屏标题逐字浮现
  (function(){
    var t=document.getElementById('heroTitle');
    if(!t) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var text=t.getAttribute('data-text')||t.textContent;
    t.textContent=''; t.classList.add('typing');
    var i=0;
    (function step(){
      if(i<=text.length){ t.textContent=text.slice(0,i); i++; setTimeout(step, 260); }
      else { t.classList.remove('typing'); }
    })();
  })();


  // 人物卡片翻面
  document.querySelectorAll('.pcard').forEach(function (c) {
    function flip() { c.classList.toggle('flip'); }
    c.addEventListener('click', flip);
    c.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });

  // 时间轴筛选
  (function () {
    var btns = document.querySelectorAll('.tl-filter button');
    if (!btns.length) return;
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.toggle('on', x === b); });
        var era = b.getAttribute('data-era');
        document.querySelectorAll('.tl li').forEach(function (li) {
          li.style.display = (era === 'all' || li.getAttribute('data-era') === era) ? '' : 'none';
        });
      });
    });
  })();

  // 生成分享海报
  (function () {
    var sb = document.getElementById('shareBtn');
    if (!sb) return;
    sb.addEventListener('click', function () {
      var W = 800, H = 1200;
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var x = c.getContext('2d');
      var g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#5E1712'); g.addColorStop(.55, '#7E1C16'); g.addColorStop(1, '#2B0B09');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.strokeStyle = 'rgba(217,179,106,.55)'; x.lineWidth = 2; x.strokeRect(36, 36, W - 72, H - 72);
      x.textAlign = 'center';
      x.fillStyle = '#E9C88F'; x.font = '22px serif';
      x.fillText('甘肃 · 华池 · 南梁 1934—1935', W / 2, 150);
      x.fillStyle = '#fff'; x.font = 'bold 104px serif';
      x.fillText('塬上有灯', W / 2, 300);
      x.fillStyle = '#F0D5A8'; x.font = '30px serif';
      x.fillText('南梁，一个根据地的日常', W / 2, 372);
      x.fillStyle = '#E8D3C2'; x.font = '25px sans-serif';
      x.fillText('46 个孩子　42 个人　一盏还亮着的灯', W / 2, 470);
      var n = 42, cols = 14, r = 9, gap = 26;
      var sx = W / 2 - (cols - 1) * gap / 2, sy = 560;
      for (var i = 0; i < n; i++) {
        var cx = sx + (i % cols) * gap, cy = sy + Math.floor(i / cols) * gap;
        x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2);
        x.fillStyle = '#A8342A'; x.fill();
      }
      x.fillStyle = '#B99C86'; x.font = '22px sans-serif';
      x.fillText('42 个人里，只查到四个名字', W / 2, 730);
      x.fillStyle = '#F6E7D6'; x.font = '27px serif';
      x.fillText('李青山　张侯福　曹思聪　白阳珍', W / 2, 790);
      x.fillStyle = '#B99C86'; x.font = '22px sans-serif';
      x.fillText('其余的人没有留下名字，只留下一盏灯', W / 2, 856);
      x.fillStyle = '#E9C88F'; x.font = '21px sans-serif';
      x.fillText('甘肃农业大学第五届红色网页设计大赛 · 参赛作品', W / 2, 1078);
      var a = document.createElement('a');
      a.download = '塬上有灯-分享卡.png';
      a.href = c.toDataURL('image/png');
      a.click();
    });
  })();

  // 上一章/下一章快捷键
  document.addEventListener('keydown',function(e){
    if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    var prev=document.querySelector('[data-prev]'),next=document.querySelector('[data-next]');
    if(e.key==='ArrowLeft'&&prev)location.href=prev.getAttribute('href');
    if(e.key==='ArrowRight'&&next)location.href=next.getAttribute('href');
  });
})();
