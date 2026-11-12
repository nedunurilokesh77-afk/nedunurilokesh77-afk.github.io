/* Realistic PCB scene: PBR materials, studio-style reflections, shadows, cinematic camera path. */
window.initScene=function(o){
const{canvas,small,rm,PAL,S}=o,B=window.BOARD,T=THREE;let r;
try{r=new T.WebGLRenderer({canvas,antialias:!small,powerPreference:'high-performance'})}catch(e){return false}
r.setPixelRatio(Math.min(devicePixelRatio,small?1.4:2));r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.15;
if(!small){r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap}
const sc=new T.Scene(),cam=new T.PerspectiveCamera(45,1,.1,80);sc.fog=new T.Fog(0x070615,14,38);
const rs=()=>{r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};rs();addEventListener('resize',rs);

/* reflections: coloured softboxes baked into an environment map */
const pm=new T.PMREMGenerator(r),es=new T.Scene();es.background=new T.Color(0x07051a);
[[0x19e6ff,-9,5,3,7,3,5],[0xff2fd6,9,4,-3,7,3,5],[0xff8a1f,0,5,9,6,2,4],[0xffffff,0,12,0,12,12,1.6]].forEach(([c,x,y,z,w,h,k])=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(k),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)});
sc.environment=pm.fromScene(es,.03).texture;pm.dispose();

/* lights */
sc.add(new T.AmbientLight(0x6a5cff,.25));
const key=new T.DirectionalLight(0xdfe6ff,2.2);key.position.set(-5,9,5);
if(!small){key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:6,bottom:-6,near:1,far:25});key.shadow.bias=-.0004}
sc.add(key);
const rim=[[0x19e6ff,-8,3,2],[0xff2fd6,8,3,-3],[0xff8a1f,2,2,7]].map(([c,x,y,z])=>{const l=new T.PointLight(c,60,22,1.7);l.position.set(x,y,z);l.userData.h=new T.Color(c).getHSL({}).h;sc.add(l);return l});

/* board */
const ld=u=>{const t=new T.TextureLoader().load(u);t.anisotropy=Math.min(8,r.capabilities.getMaxAnisotropy());return t};
const alb=ld(B.albedo);alb.colorSpace=T.SRGBColorSpace;
const edge=new T.MeshStandardMaterial({color:0x120833,roughness:.6}),topM=new T.MeshStandardMaterial({map:alb,bumpMap:ld(B.bump),bumpScale:2.2,roughness:.38,metalness:.05});
const board=new T.Mesh(new T.BoxGeometry(16,.3,9),[edge,edge,topM,edge,edge,edge]);board.position.y=-.15;board.receiveShadow=true;sc.add(board);

/* components */
const M=(c,m,g)=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:g}),metal=M(0xcfd3e0,1,.28),gold=M(0xe8b650,1,.25),epoxy=M(0x16161c,.1,.5),sh=!small;
const add=(m,x,y,z)=>{m.position.set(x,y,z);m.castShadow=sh;m.receiveShadow=true;sc.add(m);return m};
const mark=t=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#17171d';x.fillRect(0,0,256,256);x.fillStyle='#8a8a98';x.font='600 34px Arial';x.textAlign='center';x.fillText(t,128,120);x.fillText('ECE-2025',128,168);x.fillStyle='#2a2a33';x.beginPath();x.arc(36,36,12,0,7);x.fill();const k=new T.CanvasTexture(c);k.colorSpace=T.SRGBColorSpace;return k};
const inst=(g,m,list,col)=>{if(!list.length)return;const im=new T.InstancedMesh(g,m,list.length);list.forEach((a,i)=>{im.setMatrixAt(i,a);if(col)im.setColorAt(i,col[i])});im.castShadow=sh;im.receiveShadow=true;sc.add(im)};
const mx=new T.Matrix4(),Q=new T.Quaternion(),U=new T.Vector3(0,1,0),V1=new T.Vector3(1,1,1);
const mat=(x,y,z,ry)=>mx.clone().compose(new T.Vector3(x,y,z),Q.clone().setFromAxisAngle(U,ry||0),V1);
const pins=[],sB=[],sBc=[],sE=[],leds=[],LC=[0x19e6ff,0xff2fd6,0xff8a1f,0x19f0a0];
const glowT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.3,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c)})();
B.parts.forEach(([t,x,z,w,h,v],i)=>{
 if(t=='qfp'||t=='soic'){const bw=w-(t=='qfp'?.75:.3),bh=h-(t=='qfp'?.75:.4),tm=new T.MeshStandardMaterial({map:mark(i?'U'+i:'LN-ECE'),roughness:.45,metalness:.1});
  add(new T.Mesh(new T.BoxGeometry(bw,.3,bh),[epoxy,epoxy,tm,epoxy,epoxy,epoxy]),x,.17,z);
  const n=t=='qfp'?20:8,sp=t=='qfp'?w-.95:bw-.3;for(let k=0;k<n;k++){const o=-sp/2+k*sp/(n-1);pins.push(mat(x+o,.07,z-bh/2-.12),mat(x+o,.07,z+bh/2+.12));if(t=='qfp')pins.push(mat(x-bw/2-.12,.07,z+o,Math.PI/2),mat(x+bw/2+.12,.07,z+o,Math.PI/2))}}
 else if(t=='smd'){const a=w>h;sB.push(mat(x,.06,z,a?0:Math.PI/2));sBc.push(new T.Color(v?0xb89a6a:0x15151a));[-1,1].forEach(s=>sE.push(mat(x+(a?s*(w/2-.09):0),.06,z+(a?0:s*(h/2-.09)),a?0:Math.PI/2)))}
 else if(t=='ecap'){const c=[0x1b2f8c,0x15151a,0x4a1c9e][v%3],g=new T.Group();g.add(new T.Mesh(new T.CylinderGeometry(.4,.4,.8,32),M(c,.2,.5)));const tp=new T.Mesh(new T.CylinderGeometry(.37,.37,.03,32),metal);tp.position.y=.4;g.add(tp);const st=new T.Mesh(new T.BoxGeometry(.04,.7,.2),M(0xc9ccd8,.1,.6));st.position.set(.4,0,0);g.add(st);add(g,x,.4,z)}
 else if(t=='hdr'){add(new T.Mesh(new T.BoxGeometry(w,.25,h),M(0x0e0e12,0,.6)),x,.125,z);const n=Math.floor(w/.2);for(let k=0;k<n;k++)add(new T.Mesh(new T.BoxGeometry(.08,.55,.08),gold),x-w/2+.1+k*.2,.27,z)}
 else if(t=='heat'){const g=new T.Group(),fm=M(0x6b2bd9,.9,.35);g.add(new T.Mesh(new T.BoxGeometry(w,.1,h),fm));for(let k=0;k<Math.floor(w/.13);k++){const f=new T.Mesh(new T.BoxGeometry(.05,.55,h*.95),fm);f.position.set(-w/2+.11+k*.13,.3,0);f.castShadow=sh;g.add(f)}add(g,x,.05,z)}
 else if(t=='led'){const m=new T.MeshStandardMaterial({color:0x222222,emissive:LC[v%4],emissiveIntensity:2});add(new T.Mesh(new T.BoxGeometry(w-.12,.13,h-.04),m),x,.1,z);const gl=new T.Mesh(new T.PlaneGeometry(1.1,1.1),new T.MeshBasicMaterial({map:glowT,color:LC[v%4],transparent:true,blending:T.AdditiveBlending,depthWrite:false}));gl.rotation.x=-Math.PI/2;gl.position.set(x,.2,z);sc.add(gl);leds.push([m,gl])}
});
inst(new T.BoxGeometry(.05,.04,.26),metal,pins);
inst(new T.BoxGeometry(.2,.1,.15),M(0xffffff,.1,.6),sB,sBc);
inst(new T.BoxGeometry(.06,.11,.16),metal,sE);

/* dust in the light */
const N=small?150:400,dp=new Float32Array(N*3),dc=new Float32Array(N*3);for(let i=0;i<N;i++){dp.set([(Math.random()-.5)*20,Math.random()*6,(Math.random()-.5)*12],i*3);const c=new T.Color(PAL[i%7]);dc.set([c.r,c.g,c.b],i*3)}
const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(dp,3));dg.setAttribute('color',new T.BufferAttribute(dc,3));
const dust=new T.Points(dg,new T.PointsMaterial({size:.05,vertexColors:true,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending}));sc.add(dust);

/* camera path */
const V=a=>a.map(p=>new T.Vector3(...p)),cpath=new T.CatmullRomCurve3(V([[4.5,3.2,6],[2,2.6,3.6],[-3.5,2.2,3],[-5,4,-1.5],[1,6.5,2.5]])),tpath=new T.CatmullRomCurve3(V([[-2.4,.3,0],[.5,.2,.5],[-3.2,.3,-1.2],[-1,0,-1],[1.5,0,0]]));
const cp=new T.Vector3(),tp=new T.Vector3(),look=new T.Vector3(-2.4,.3,0);cam.position.set(4.5,3.2,6);

/* click: a signal pulse spreads over the board */
const rc=new T.Raycaster(),pl=new T.Plane(U,0),pt=new T.Vector3(),waves=[];
addEventListener('pointerdown',e=>{if(e.target.closest('a,button,input,textarea,form,canvas#const')||waves.length>3)return;rc.setFromCamera({x:e.clientX/innerWidth*2-1,y:-(e.clientY/innerHeight*2-1)},cam);if(!rc.ray.intersectPlane(pl,pt))return;
 const w=new T.Mesh(new T.TorusGeometry(1,.02,8,96),new T.MeshBasicMaterial({color:PAL[Math.random()*7|0],transparent:true,blending:T.AdditiveBlending}));w.rotation.x=Math.PI/2;w.position.set(pt.x,.04,pt.z);w.scale.setScalar(.05);sc.add(w);waves.push(w)});

const clock=new T.Clock();let raf,run=true;
function frame(){raf=requestAnimationFrame(frame);const t=clock.getElapsedTime(),p=S.sp,k=cam.aspect<1?1.6:1;
 cpath.getPoint(p,cp);tpath.getPoint(p,tp);cp.multiplyScalar(k);cp.x+=S.mx*.8;cp.y-=S.my*.4;if(cam.aspect<1)tp.x=0;
 cam.position.lerp(cp,.06);look.lerp(tp,.06);cam.lookAt(look);
 rim.forEach(l=>l.color.setHSL((l.userData.h+p*.5)%1,.9,.55));
 leds.forEach(([m,g],i)=>{const e=1.5+Math.sin(t*2+i*1.7);m.emissiveIntensity=e*1.2;g.material.opacity=.35+e*.2});
 dust.rotation.y=t*.01;dust.position.y=Math.sin(t*.3)*.15;
 for(let i=waves.length-1;i>=0;i--){const w=waves[i];w.scale.addScalar(.12);w.material.opacity-=.012;if(w.material.opacity<=0){sc.remove(w);w.geometry.dispose();w.material.dispose();waves.splice(i,1)}}
 r.render(sc,cam)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);run=false}else if(!run){run=true;clock.getDelta();frame()}});
if(rm){frame();setTimeout(()=>cancelAnimationFrame(raf),500)}else frame();
return true};
