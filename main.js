(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches,touch=matchMedia('(pointer:coarse)').matches,small=innerWidth<760;
const PAL=['#19e6ff','#2f6bff','#9b3dff','#ff2fd6','#ff5fa2','#ff8a1f','#19f0a0'];
$('#y').textContent=new Date().getFullYear();
const S={mx:0,my:0,sp:0};
addEventListener('pointermove',e=>{S.mx=e.clientX/innerWidth*2-1;S.my=e.clientY/innerHeight*2-1},{passive:true});
const seen=(el,fn)=>{let on=false;new IntersectionObserver(e=>on=e[0].isIntersecting).observe(el);return()=>on&&fn()};
const fit=c=>{const d=Math.min(devicePixelRatio,2),w=c.clientWidth,h=c.clientHeight;if(c.width!==w*d){c.width=w*d;c.height=h*d}return[c.getContext('2d'),w,h,d]};
const jobs=[];

/* name letters */
$$('.ln').forEach((l,r)=>{[...l.dataset.w].forEach((ch,i)=>{const s=document.createElement('span'),q=i/(l.dataset.w.length-1)*5;s.textContent=ch;s.style.setProperty('--a',PAL[Math.floor(q)]);s.style.setProperty('--z',PAL[Math.ceil(q)]);l.appendChild(s)})});

/* nav */
const bg=$('.burger'),nv=$('.nav nav');
bg.onclick=()=>{const o=nv.classList.toggle('open');bg.setAttribute('aria-expanded',o)};
$$('.nav nav a').forEach(a=>a.addEventListener('click',()=>{nv.classList.remove('open');bg.setAttribute('aria-expanded',false)}));
$('.top').onclick=()=>scrollTo({top:0,behavior:rm?'auto':'smooth'});

/* cursor + magnetic */
if(!touch&&!rm){
 const cu=$('.cur');cu.classList.add('on');
 addEventListener('pointermove',e=>{cu.style.transform=`translate(${e.clientX}px,${e.clientY}px)`},{passive:true});
 $$('a,button').forEach(a=>{a.addEventListener('pointerenter',()=>cu.classList.add('h'));a.addEventListener('pointerleave',()=>cu.classList.remove('h'))});
 $$('.mag').forEach(m=>{m.addEventListener('pointermove',e=>{const b=m.getBoundingClientRect();m.style.transform=`translate(${(e.clientX-b.left-b.width/2)*.3}px,${(e.clientY-b.top-b.height/2)*.4}px)`});m.addEventListener('pointerleave',()=>m.style.transform='')});
}

/* tilt */
$$('.tilt').forEach(t=>{if(touch)return;t.parentElement.addEventListener('pointermove',e=>{const b=t.getBoundingClientRect();t.style.transform=`perspective(700px) rotateY(${((e.clientX-b.left)/b.width-.5)*16}deg) rotateX(${-((e.clientY-b.top)/b.height-.5)*16}deg)`});t.parentElement.addEventListener('pointerleave',()=>t.style.transform='')});

/* ---------- 3D scene (see scene.js) ---------- */
function scene3D(){if(!window.THREE||!window.BOARD||!window.initScene||!initScene({canvas:$('#gl'),small,rm,PAL,S}))document.body.classList.add('nogl')}

/* ---------- oscilloscope ---------- */
const scope=$('#scope');
jobs.push(seen(scope,()=>{const[c,w,h,d]=fit(scope),t=performance.now()/1000;c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);
 c.strokeStyle='#19e6ff22';c.lineWidth=1;for(let i=0;i<=10;i++){c.beginPath();c.moveTo(i*w/10,0);c.lineTo(i*w/10,h);c.stroke()}for(let i=0;i<=6;i++){c.beginPath();c.moveTo(0,i*h/6);c.lineTo(w,i*h/6);c.stroke()}
 [['#19e6ff',1,.9],['#ff2fd6',1.7,.6],['#ff8a1f',2.6,.35]].forEach(([col,f,a],k)=>{c.beginPath();c.lineWidth=3;c.strokeStyle=col;c.shadowColor=col;c.shadowBlur=14;const amp=h*.3*a*(1+(1-S.my)*.35);for(let x=0;x<=w;x+=3){const y=h/2+Math.sin(x/w*Math.PI*2*f*2+t*(1.4+k))*amp+(k==2?Math.sin(x*.09+t*4)*amp*.15:0);x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()});c.shadowBlur=0}));

/* ---------- constellation ---------- */
const cc=$('#const'),NODES=[['Electronics & Circuit Design',0,'#19e6ff'],['Embedded Systems',0,'#19e6ff'],['Microcontrollers',0,'#19e6ff'],['Software Development',1,'#ff2fd6'],['Artificial Intelligence',1,'#ff2fd6'],['Web Development',2,'#ff8a1f'],['Android Development',3,'#19f0a0'],['3D Graphics',4,'#9b3dff'],['Game Development',4,'#9b3dff'],['Emerging Technologies',4,'#9b3dff']]
 .map(([n,g,c],i)=>({n,g,c,x:(.12+.76*((i*.618)%1)),y:.12+.76*((i*.382+.2)%1),vx:(Math.random()-.5)*.0004,vy:(Math.random()-.5)*.0004}));
let px=-1,py=-1;
cc.addEventListener('pointermove',e=>{const b=cc.getBoundingClientRect();px=e.clientX-b.left;py=e.clientY-b.top});cc.addEventListener('pointerleave',()=>px=-1);
jobs.push(seen(cc,()=>{const[c,w,h,d]=fit(cc);c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);
 NODES.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<.08||n.x>.92)n.vx*=-1;if(n.y<.1||n.y>.9)n.vy*=-1});
 let hot=null;NODES.forEach(n=>{if(px>=0&&Math.hypot(n.x*w-px,n.y*h-py)<60)hot=n});
 for(let i=0;i<NODES.length;i++)for(let j=i+1;j<NODES.length;j++){const a=NODES[i],b=NODES[j],dd=Math.hypot((a.x-b.x)*w,(a.y-b.y)*h),same=a.g===b.g;if(dd<w*.3||same){const gr=c.createLinearGradient(a.x*w,a.y*h,b.x*w,b.y*h);gr.addColorStop(0,a.c);gr.addColorStop(1,b.c);c.strokeStyle=gr;c.globalAlpha=(hot&&(hot===a||hot===b))?.95:(same?.5:.18);c.lineWidth=hot&&(hot===a||hot===b)?3:1.5;c.beginPath();c.moveTo(a.x*w,a.y*h);c.lineTo(b.x*w,b.y*h);c.stroke()}}
 c.globalAlpha=1;c.textAlign='center';NODES.forEach(n=>{const X=n.x*w,Y=n.y*h,on=n===hot,rr=on?16:10;c.shadowColor=n.c;c.shadowBlur=on?34:18;c.fillStyle=n.c;c.beginPath();c.arc(X,Y,rr,0,7);c.fill();c.shadowBlur=0;c.fillStyle='#fff';c.font=`${on?700:500} ${w<560?11:14}px 'Space Grotesk',sans-serif`;c.fillText(n.n,Math.max(70,Math.min(w-70,X)),Y+rr+18)})}));

/* loop for 2D canvases */
(function loop(){jobs.forEach(j=>j());requestAnimationFrame(loop)})();

/* ---------- GSAP ---------- */
function anim(){
 if(!window.gsap||!window.ScrollTrigger||rm){$$('[data-r]').forEach(e=>e.style.opacity=1);return}
 gsap.registerPlugin(ScrollTrigger);
 const tl=gsap.timeline({delay:.2});
 tl.from('.ln span',{yPercent:120,rotateX:-80,duration:1.1,stagger:.05,ease:'expo.out'})
   .from('.kicker,.head,.tag,.cta,.scroll',{opacity:0,y:30,duration:.8,stagger:.12,ease:'power3.out'},'-=.6');
 gsap.utils.toArray('[data-r]').forEach(e=>gsap.from(e,{opacity:0,y:50,duration:.9,ease:'power3.out',scrollTrigger:{trigger:e,start:'top 88%',once:true}}));
 $$('.mask img').forEach(i=>gsap.fromTo(i,{yPercent:-8},{yPercent:8,ease:'none',scrollTrigger:{trigger:i.parentElement,scrub:true,start:'top bottom',end:'bottom top'}}));
 $$('.mask').forEach(m=>gsap.from(m,{clipPath:'inset(0 100% 0 0)',duration:1.3,ease:'power4.out',scrollTrigger:{trigger:m,start:'top 85%',once:true}}));
 gsap.to('.spark',{scaleY:1,ease:'none',scrollTrigger:{trigger:'.tl',start:'top 70%',end:'bottom 60%',scrub:true}});
 gsap.from('.mega',{letterSpacing:'.08em',duration:1.4,ease:'power3.out',scrollTrigger:{trigger:'.mega',start:'top 85%',once:true}});
}
addEventListener('scroll',()=>{const m=document.documentElement.scrollHeight-innerHeight;S.sp=m>0?Math.min(scrollY/m,1):0},{passive:true});
const done=()=>$('#ld').classList.add('off');
addEventListener('load',()=>setTimeout(done,350));setTimeout(done,3500);
try{scene3D()}catch(e){console.warn('3D disabled',e);document.body.classList.add('nogl')}
anim();
})();
