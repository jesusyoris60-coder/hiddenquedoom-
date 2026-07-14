/* 1 runner */function startRunner(){
 box.innerHTML=`<div class="hud" id="hud">❤❤❤ · Toca para saltar</div><canvas class="game" id="c" width="500" height="620"></canvas><div class="runner-help">Toca cualquier parte del juego para saltar</div>`;
 const c=$("#c"),g=c.getContext("2d"),W=c.width,H=c.height,ground=525;let p={x:78,y:ground-42,vy:0,r:22},obs=[],lights=[],hearts=3,dist=0,collected=0,last=performance.now(),spawn=0,lightSpawn=0,running=true;
 function jump(){if(p.y>=ground-p.r-3){p.vy=-690;AudioFX.sfx("jump")}}c.onpointerdown=e=>{e.preventDefault();jump()};
 function circleHit(a,b){const dx=a.x-b.x,dy=a.y-b.y;return Math.hypot(dx,dy)<a.r+b.r}
 function loop(now){if(!running)return;let dt=Math.min(.032,(now-last)/1000);last=now;dist+=dt*10;spawn-=dt;lightSpawn-=dt;
  if(spawn<=0){obs.push({x:W+30,y:ground-27,w:34+Math.random()*22,h:40+Math.random()*40});spawn=.85+Math.random()*.75}
  if(lightSpawn<=0){lights.push({x:W+25,y:240+Math.random()*220,r:12});lightSpawn=.55+Math.random()*.65}
  p.vy+=1650*dt;p.y+=p.vy*dt;if(p.y>ground-p.r){p.y=ground-p.r;p.vy=0}
  obs.forEach(o=>o.x-=260*dt);lights.forEach(o=>o.x-=260*dt);
  for(let i=obs.length-1;i>=0;i--){const o=obs[i];if(o.x+o.w<0){obs.splice(i,1);continue}if(p.x+p.r>o.x&&p.x-p.r<o.x+o.w&&p.y+p.r>o.y){hearts--;AudioFX.sfx("hit");obs.splice(i,1);$("#hud").textContent="❤".repeat(hearts)+"♡".repeat(3-hearts)+" · Luz "+state.score;if(hearts<=0){running=false;finish(state.score,"El espíritu descansó","Corriste hasta donde tu luz pudo llevarte.","🐺");return}}}
  for(let i=lights.length-1;i>=0;i--){let o=lights[i];if(o.x<-20){lights.splice(i,1);continue}if(circleHit(p,o)){collected+=8;AudioFX.sfx("collect");lights.splice(i,1)}}
  g.clearRect(0,0,W,H);let grd=g.createLinearGradient(0,0,0,H);grd.addColorStop(0,"#102e3b");grd.addColorStop(1,"#07151b");g.fillStyle=grd;g.fillRect(0,0,W,H);
  g.fillStyle="rgba(145,246,217,.09)";for(let i=0;i<5;i++){g.beginPath();g.arc((i*130-dist*8)%650,120+i*55,65,0,7);g.fill()}
  g.fillStyle="#081016";g.fillRect(0,ground,W,H-ground);
  obs.forEach(o=>{g.fillStyle="#1c2d32";g.beginPath();g.moveTo(o.x,o.y+o.h);g.lineTo(o.x+o.w*.25,o.y);g.lineTo(o.x+o.w*.55,o.y+o.h*.55);g.lineTo(o.x+o.w*.78,o.y+5);g.lineTo(o.x+o.w,o.y+o.h);g.fill()});
  lights.forEach(o=>{g.shadowColor="#91f6d9";g.shadowBlur=22;g.fillStyle="#e8fff8";g.beginPath();g.arc(o.x,o.y,o.r,0,7);g.fill();g.shadowBlur=0});
  g.shadowColor="#81ddff";g.shadowBlur=26;g.fillStyle="#f5fffc";g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill();g.shadowBlur=0;
  score(Math.round(dist)+collected);$("#hud").textContent="❤".repeat(hearts)+"♡".repeat(3-hearts)+" · Luz "+state.score;state.raf=requestAnimationFrame(loop)}
 state.raf=requestAnimationFrame(loop)
}

/* 2 constellation trace */
function startWeaver(){
 box.innerHTML=`<div class="hud" id="hud">Constelación 1 de 5</div><canvas class="game" id="c" width="500" height="620"></canvas>`;
 const c=$("#c"),g=c.getContext("2d"),W=c.width,H=c.height;let round=0,nodes=[],next=0,drawing=false,trail=[],startTime=0;
 function newRound(){round++;if(round>5){finish(state.score,"El cielo quedó tejido","Completaste las cinco constelaciones.","✦");return}next=0;trail=[];nodes=[];const count=3+round;
  for(let i=0;i<count;i++)nodes.push({x:70+Math.random()*(W-140),y:90+Math.random()*(H-180),r:18,phase:Math.random()*6.28});
  $("#hud").textContent=`Constelación ${round} de 5 · estrella 1/${count}`;startTime=performance.now();draw()}
 function pos(e){const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
 c.onpointerdown=e=>{e.preventDefault();drawing=true;c.setPointerCapture(e.pointerId);move(e)}
 c.onpointermove=e=>{if(drawing)move(e)};c.onpointerup=e=>{drawing=false;if(next<nodes.length){AudioFX.sfx("bad");next=0;trail=[];draw()}}
 function move(e){const p=pos(e);trail.push(p);const n=nodes[next];if(n&&Math.hypot(p.x-n.x,p.y-n.y)<n.r+18){next++;AudioFX.sfx("collect");$("#hud").textContent=`Constelación ${round} de 5 · estrella ${Math.min(next+1,nodes.length)}/${nodes.length}`;if(next===nodes.length){const bonus=Math.max(15,70-Math.floor((performance.now()-startTime)/120));score(state.score+bonus);timer(setTimeout(newRound,500))}}draw()}
 function draw(){g.clearRect(0,0,W,H);let bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#102735");bg.addColorStop(1,"#07131a");g.fillStyle=bg;g.fillRect(0,0,W,H);
  if(trail.length>1){g.strokeStyle="rgba(145,246,217,.7)";g.lineWidth=7;g.lineCap="round";g.beginPath();g.moveTo(trail[0].x,trail[0].y);for(let p of trail)g.lineTo(p.x,p.y);g.stroke()}
  nodes.forEach((n,i)=>{g.shadowColor=i<next?"#91f6d9":"#81ddff";g.shadowBlur=i===next?26:13;g.fillStyle=i<next?"#eafff8":i===next?"#ffffff":"#7fa2aa";g.beginPath();g.arc(n.x,n.y,n.r,0,7);g.fill();g.shadowBlur=0;g.fillStyle="#061016";g.font="bold 17px system-ui";g.textAlign="center";g.textBaseline="middle";g.fillText(i+1,n.x,n.y)});
 }
 newRound()
}

/* 3 audio lane */
function startWolf(){
 box.innerHTML=`<div class="hud" id="hud">Escucha el tono...</div><canvas class="game" id="c" width="500" height="500"></canvas><div class="lanes"><button class="lane-btn" data-l="0">←</button><button class="lane-btn" data-l="1">●</button><button class="lane-btn" data-l="2">→</button></div>`;
 const c=$("#c"),g=c.getContext("2d"),W=c.width,H=c.height;let round=0,safe=0,locked=true,start=0;
 function scene(chosen=-1){g.clearRect(0,0,W,H);let bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#102a35");bg.addColorStop(1,"#07131a");g.fillStyle=bg;g.fillRect(0,0,W,H);
  for(let i=0;i<3;i++){const x=i*W/3;g.strokeStyle="rgba(255,255,255,.13)";g.beginPath();g.moveTo(W/2,70);g.lineTo(x, H);g.lineTo(x+W/3,H);g.closePath();g.stroke();
   if(chosen===i){g.fillStyle=i===safe?"rgba(145,246,217,.24)":"rgba(255,113,142,.23)";g.fill()}}
  g.fillStyle="#dffcf5";g.font="54px system-ui";g.textAlign="center";g.fillText("🌲",W/2,105)}
 function next(){round++;if(round>10){finish(state.score,"El lobo te dejó pasar","Escuchaste diez caminos del bosque.","🌲");return}safe=Math.floor(Math.random()*3);locked=true;$("#hud").textContent=`Camino ${round}/10 · escucha`;scene();timer(setTimeout(()=>{AudioFX.cue(safe);start=performance.now();locked=false;$("#hud").textContent="¡Elige ahora!"},650))}
 document.querySelectorAll(".lane-btn").forEach(b=>b.onclick=()=>{if(locked)return;locked=true;const chosen=+b.dataset.l;scene(chosen);if(chosen===safe){const pts=Math.max(5,25-Math.floor((performance.now()-start)/100));score(state.score+pts);AudioFX.sfx("good");$("#hud").textContent="El camino estaba limpio"}else{AudioFX.sfx("bad");$("#hud").textContent="El lobo estaba allí"}timer(setTimeout(next,650))});
 next()
}

/* 4 moth flock */
function startMoths(){
 box.innerHTML=`<div class="hud" id="hud">40 segundos · arrastra la luna</div><canvas class="game" id="c" width="500" height="620"></canvas>`;
 const c=$("#c"),g=c.getContext("2d"),W=c.width,H=c.height;let orb={x:W/2,y:H/2},moths=Array.from({length:8},(_,i)=>({x:W/2+Math.random()*60-30,y:H/2+Math.random()*60-30,vx:0,vy:0,phase:i})),flowers=[],shadows=[],left=40,last=performance.now(),acc=0,shAcc=0;
 function pos(e){const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}let dragging=false;c.onpointerdown=e=>{e.preventDefault();dragging=true;c.setPointerCapture(e.pointerId);orb=pos(e)};c.onpointermove=e=>{if(dragging){e.preventDefault();orb=pos(e)}};c.onpointerup=c.onpointercancel=()=>{dragging=false};
 timer(setInterval(()=>{left--;$("#hud").textContent=left+" segundos · Luz "+state.score;if(left<=0)finish(state.score,"La bandada encontró la luna","Guiaste a las polillas a través del jardín.","🦋")},1000));
 function loop(now){let dt=Math.min(.035,(now-last)/1000);last=now;acc-=dt;shAcc-=dt;if(acc<=0){flowers.push({x:35+Math.random()*(W-70),y:60+Math.random()*(H-120),r:15});acc=.55+Math.random()*.8}if(shAcc<=0){shadows.push({x:Math.random()*W,y:-40,r:28+Math.random()*20,vy:50+Math.random()*70});shAcc=1.2+Math.random()*1.3}
  moths.forEach((m,i)=>{let tx=orb.x+Math.cos(now*.002+i)*35,ty=orb.y+Math.sin(now*.002+i*1.7)*35;m.vx+=(tx-m.x)*dt*3.2;m.vy+=(ty-m.y)*dt*3.2;m.vx*=.94;m.vy*=.94;m.x+=m.vx;m.y+=m.vy});
  shadows.forEach(s=>s.y+=s.vy*dt);
  for(let i=flowers.length-1;i>=0;i--){let f=flowers[i];if(moths.some(m=>Math.hypot(m.x-f.x,m.y-f.y)<f.r+9)){flowers.splice(i,1);score(state.score+6);AudioFX.sfx("collect")}}
  for(let i=shadows.length-1;i>=0;i--){let s=shadows[i];if(s.y-s.r>H){shadows.splice(i,1);continue}if(moths.some(m=>Math.hypot(m.x-s.x,m.y-s.y)<s.r+7)){shadows.splice(i,1);score(state.score-5);AudioFX.sfx("hit")}}
  g.clearRect(0,0,W,H);let bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#112a36");bg.addColorStop(1,"#071419");g.fillStyle=bg;g.fillRect(0,0,W,H);
  flowers.forEach(f=>{g.font="30px system-ui";g.textAlign="center";g.fillText("🌸",f.x,f.y+10)});shadows.forEach(s=>{g.fillStyle="rgba(3,5,10,.72)";g.beginPath();g.arc(s.x,s.y,s.r,0,7);g.fill()});
  g.shadowColor="#ffe6a3";g.shadowBlur=28;g.fillStyle="#fff7cf";g.beginPath();g.arc(orb.x,orb.y,20,0,7);g.fill();g.shadowBlur=0;
  moths.forEach(m=>{g.fillStyle="#eafff7";g.beginPath();g.ellipse(m.x,m.y,8,4,Math.atan2(m.vy,m.vx),0,7);g.fill()});state.raf=requestAnimationFrame(loop)}
 state.raf=requestAnimationFrame(loop)
}

/* 5 musical seed */
function startSeed(){
 box.innerHTML=`<div class="hud" id="hud">Escucha las raíces...</div><canvas class="game" id="tree" width="500" height="300"></canvas><div class="panel"><div class="echo-grid"><button class="echo" data-i="0">❄</button><button class="echo" data-i="1">☾</button><button class="echo" data-i="2">✦</button><button class="echo" data-i="3">❀</button></div></div>`;
 const buttons=[...document.querySelectorAll(".echo")],c=$("#tree"),g=c.getContext("2d");let seq=[],input=[],round=0,accept=false;const freqs=[261.63,329.63,392,523.25];
 function tree(){g.clearRect(0,0,500,300);let bg=g.createLinearGradient(0,0,0,300);bg.addColorStop(0,"#102933");bg.addColorStop(1,"#071319");g.fillStyle=bg;g.fillRect(0,0,500,300);g.strokeStyle="#b7e5d5";g.lineWidth=8;g.lineCap="round";g.beginPath();g.moveTo(250,280);g.lineTo(250,245-round*18);g.stroke();
  for(let i=0;i<round;i++){let y=245-i*18,side=i%2?-1:1;g.lineWidth=5;g.beginPath();g.moveTo(250,y);g.lineTo(250+side*(45+i*3),y-28);g.stroke();g.fillStyle=["#91f6d9","#81ddff","#ba9cff","#ffacd1"][i%4];g.beginPath();g.arc(250+side*(45+i*3),y-28,9,0,7);g.fill()}}
 function flash(i){buttons[i].classList.add("on");AudioFX.note(freqs[i],.28,.09,"sine");setTimeout(()=>buttons[i].classList.remove("on"),280)}
 function next(){round++;if(round>8){finish(state.score,"El árbol aprendió tu canción","Ocho ramas crecieron con tus ecos.","🌱");return}input=[];seq.push(Math.floor(Math.random()*4));accept=false;tree();$("#hud").textContent=`Rama ${round}/8 · escucha`;seq.forEach((v,i)=>timer(setTimeout(()=>flash(v),600+i*430)));timer(setTimeout(()=>{accept=true;$("#hud").textContent="Tu turno"},700+seq.length*430))}
 buttons.forEach((b,i)=>b.onclick=()=>{if(!accept)return;flash(i);input.push(i);let n=input.length-1;if(input[n]!==seq[n]){b.classList.add("bad");accept=false;AudioFX.sfx("bad");timer(setTimeout(()=>finish(state.score,"La semilla volvió a dormir","Hiciste crecer "+(round-1)+" ramas.","🌱"),500));return}if(input.length===seq.length){accept=false;score(state.score+round*12);AudioFX.sfx("good");$("#hud").textContent="La rama creció";timer(setTimeout(next,650))}});
 tree();next()
}

/* 6 storm lanes */
function startStorm(){
 box.innerHTML=`<div class="hud" id="hud">45 segundos · desliza a izquierda o derecha</div><canvas class="game" id="c" width="500" height="620"></canvas><div class="lanes"><button class="lane-btn" data-m="-1">←</button><button class="lane-btn" data-m="0">●</button><button class="lane-btn" data-m="1">→</button></div>`;
 const c=$("#c"),g=c.getContext("2d"),W=c.width,H=c.height;let lane=1,drops=[],bolts=[],left=45,last=performance.now(),a=0,b=0;
 function move(d){lane=Math.max(0,Math.min(2,lane+d));AudioFX.sfx("jump")}document.querySelectorAll("[data-m]").forEach(x=>x.onclick=()=>{let m=+x.dataset.m;if(m===0)lane=1;else move(m)});
 let sx=0;c.onpointerdown=e=>sx=e.clientX;c.onpointerup=e=>{let dx=e.clientX-sx;if(Math.abs(dx)>20)move(dx>0?1:-1)};
 timer(setInterval(()=>{left--;$("#hud").textContent=left+" segundos · Luz "+state.score;if(left<=0)finish(state.score,"Bailaste dentro de la tormenta","El cielo no logró apagar tu luz.","🌧️")},1000));
 function loop(now){let dt=Math.min(.035,(now-last)/1000);last=now;a-=dt;b-=dt;if(a<=0){drops.push({lane:Math.floor(Math.random()*3),y:-40,v:180+Math.random()*160});a=.22+Math.random()*.35}if(b<=0){bolts.push({lane:Math.floor(Math.random()*3),y:-40,v:170+Math.random()*100});b=1.0+Math.random()*1.5}
  drops.forEach(o=>o.y+=o.v*dt);bolts.forEach(o=>o.y+=o.v*dt);const py=540,px=(lane+.5)*W/3;
  for(let i=drops.length-1;i>=0;i--){let o=drops[i],ox=(o.lane+.5)*W/3;if(o.y>H+30){drops.splice(i,1);continue}if(Math.abs(ox-px)<45&&Math.abs(o.y-py)<40){drops.splice(i,1);score(state.score-4);AudioFX.sfx("hit")}}
  for(let i=bolts.length-1;i>=0;i--){let o=bolts[i],ox=(o.lane+.5)*W/3;if(o.y>H+30){bolts.splice(i,1);continue}if(Math.abs(ox-px)<45&&Math.abs(o.y-py)<42){bolts.splice(i,1);score(state.score+10);AudioFX.sfx("collect")}}
  g.clearRect(0,0,W,H);let bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#16273a");bg.addColorStop(1,"#071119");g.fillStyle=bg;g.fillRect(0,0,W,H);g.strokeStyle="rgba(255,255,255,.09)";for(let i=1;i<3;i++){g.beginPath();g.moveTo(i*W/3,0);g.lineTo(i*W/3,H);g.stroke()}
  drops.forEach(o=>{let x=(o.lane+.5)*W/3;g.strokeStyle="#587080";g.lineWidth=7;g.beginPath();g.moveTo(x,o.y-22);g.lineTo(x-8,o.y+18);g.stroke()});
  bolts.forEach(o=>{let x=(o.lane+.5)*W/3;g.shadowColor="#ffe6a3";g.shadowBlur=18;g.fillStyle="#fff4bd";g.font="38px system-ui";g.textAlign="center";g.fillText("⚡",x,o.y);g.shadowBlur=0});
  g.shadowColor="#91f6d9";g.shadowBlur=28;g.fillStyle="#effffb";g.beginPath();g.arc(px,py,25,0,7);g.fill();g.shadowBlur=0;state.raf=requestAnimationFrame(loop)}
 state.raf=requestAnimationFrame(loop)
}

refresh();
