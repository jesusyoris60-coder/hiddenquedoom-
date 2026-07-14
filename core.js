"use strict";
const $=s=>document.querySelector(s);
const screen=$("#gameScreen"),box=$("#gameBox");
const meta={
 runner:["Runaway Spirit","Toca para saltar","🐺","Corre, salta las espinas y recoge luces. Tienes tres corazones.","El espíritu corre cuando tú no te rindes."],
 weaver:["Aurora Weaver","Arrastra por las estrellas","✦","Une las estrellas en el orden marcado sin levantar el dedo.","Cada constelación es una puerta."],
 wolf:["Whispering Wolf","Escucha: grave, medio o agudo","🌲","Cada tono revela un camino: grave izquierda, medio centro, agudo derecha.","A veces el bosque se entiende con los oídos cerrados."],
 moths:["Moon Moths","Arrastra la luna","🦋","Guía las polillas hacia las flores y evita las sombras móviles.","La luz más pequeña todavía puede guiar a muchas."],
 seed:["The Seed Sings","Memoria musical","🌱","Escucha la melodía de cuatro raíces y repítela para hacer crecer el árbol.","Toda semilla recuerda una canción."],
 storm:["Dance in the Storm","Desliza al espíritu","🌧️","Muévete entre tres carriles, evita gotas oscuras y recoge relámpagos dorados.","No toda tormenta viene a destruirte."]
};
const state={game:null,score:0,timers:[],raf:0,retry:null,audio:true,
 data:JSON.parse(localStorage.getItem("hidden_queendom_v1")||'{"total":0,"played":0,"best":{},"count":{}}')};

function timer(x){state.timers.push(x);return x}
function clearGame(){state.timers.forEach(x=>{clearTimeout(x);clearInterval(x)});state.timers=[];if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;box.innerHTML=""}
function score(n){state.score=Math.max(0,Math.round(n));$("#live").textContent=state.score}
function save(){localStorage.setItem("hidden_queendom_v1",JSON.stringify(state.data));refresh()}
function refresh(){
 $("#total").textContent=state.data.total||0;$("#played").textContent=state.data.played||0;
 Object.keys(meta).forEach(k=>$("#rec-"+k).textContent="Récord "+((state.data.best||{})[k]||0));
 const counts=Object.entries(state.data.count||{}).sort((a,b)=>b[1]-a[1]);
 $("#crown").textContent=counts.length?meta[counts[0][0]][0].split(" ")[0]:"—";
}
function openGame(k){clearGame();state.game=k;state.retry=()=>openGame(k);score(0);$("#gameName").textContent=meta[k][0];$("#gameSub").textContent=meta[k][1];screen.classList.add("open");document.body.style.overflow="hidden";
 box.innerHTML=`<div class="panel intro"><div class="big">${meta[k][2]}</div><h3>${meta[k][0]}</h3><p>${meta[k][3]}</p><div class="tip">${meta[k][4]}</div><button class="primary" id="start">Empezar</button></div>`;
 $("#start").onclick=()=>{AudioFX.sfx("start");({runner:startRunner,weaver:startWeaver,wolf:startWolf,moths:startMoths,seed:startSeed,storm:startStorm})[k]()}}
function closeGame(){clearGame();screen.classList.remove("open");document.body.style.overflow="";state.game=null}
function finish(points,title,text,icon){clearGame();score(points);state.data.total=(state.data.total||0)+points;state.data.played=(state.data.played||0)+1;state.data.best=state.data.best||{};state.data.count=state.data.count||{};
 state.data.best[state.game]=Math.max(state.data.best[state.game]||0,points);state.data.count[state.game]=(state.data.count[state.game]||0)+1;save();
 $("#rIcon").textContent=icon;$("#rTitle").textContent=title;$("#rText").textContent=text;$("#rPoints").textContent=points;$("#result").classList.add("show");AudioFX.sfx("win")}
document.querySelectorAll(".card").forEach(b=>b.onclick=()=>openGame(b.dataset.game));$("#back").onclick=closeGame;
$("#rHome").onclick=()=>{$("#result").classList.remove("show");closeGame()};$("#rRetry").onclick=()=>{$("#result").classList.remove("show");state.retry()};

const AudioFX=(()=>{
 let ctx,master,musicGain,sfxGain,pad=[],arpTimer,wind,enabled=true,chord=0;
 const chords=[[110,164.81,220],[98,146.83,196],[130.81,196,261.63],[87.31,130.81,174.61]];
 function init(){if(ctx)return;ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();musicGain=ctx.createGain();sfxGain=ctx.createGain();
 master.gain.value=.82;musicGain.gain.value=.18;sfxGain.gain.value=.55;musicGain.connect(master);sfxGain.connect(master);master.connect(ctx.destination);
 const filter=ctx.createBiquadFilter();filter.type="lowpass";filter.frequency.value=720;filter.Q.value=.7;filter.connect(musicGain);
 for(let i=0;i<3;i++){const o=ctx.createOscillator(),g=ctx.createGain();o.type=i===0?"sine":"triangle";g.gain.value=i===0?.035:.018;o.connect(g).connect(filter);o.start();pad.push(o)}
 setChord();setInterval(()=>{chord=(chord+1)%chords.length;setChord()},8000);
 const n=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(.5-i/d.length*.2);
 wind=ctx.createBufferSource();const wg=ctx.createGain(),wf=ctx.createBiquadFilter();wf.type="lowpass";wf.frequency.value=420;wg.gain.value=.025;wind.buffer=n;wind.loop=true;wind.connect(wf).connect(wg).connect(musicGain);wind.start();
 arpTimer=setInterval(()=>{if(!enabled)return;const c=chords[chord],f=c[Math.floor(Math.random()*c.length)]*2;note(f,.35,.018,"sine",musicGain)},700)}
 function setChord(){if(!pad.length)return;const t=ctx.currentTime;pad.forEach((o,i)=>o.frequency.exponentialRampToValueAtTime(chords[chord][i],t+2.2))}
 function note(f,d=.1,v=.06,type="sine",dest=sfxGain){if(!ctx||!enabled)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);o.connect(g).connect(dest);o.start();o.stop(ctx.currentTime+d)}
 function sfx(n){if(!enabled)return;({start:()=>{note(440,.1,.07);setTimeout(()=>note(660,.16,.06),80)},collect:()=>{note(700,.07,.075);setTimeout(()=>note(980,.11,.055),45)},hit:()=>note(120,.18,.08,"sawtooth"),jump:()=>note(320,.09,.055,"triangle"),good:()=>{note(520,.09,.06);setTimeout(()=>note(780,.12,.05),60)},bad:()=>note(155,.17,.08,"square"),win:()=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>note(f,.34,.055),i*110))}}[n]||(()=>{}))()}
 function cue(i){[220,440,760].forEach((f,j)=>{if(j===i)note(f,.45,.11,"sine")})}
 function toggle(){enabled=!enabled;if(master)master.gain.value=enabled?.82:0;return enabled}
 return{init,sfx,cue,note,toggle,get enabled(){return enabled},resume(){if(ctx&&ctx.state==="suspended")ctx.resume()}}
})();

$("#enter").onclick=()=>{AudioFX.init();AudioFX.resume();$("#splash").classList.add("hide")};
$("#audioBtn").onclick=()=>{AudioFX.resume();const on=AudioFX.toggle();$("#audioBtn").textContent=on?"🔊":"🔇"};

/* animated star background */
(()=>{const c=$("#sky"),x=c.getContext("2d");let stars=[];function resize(){c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;c.style.width=innerWidth+"px";c.style.height=innerHeight+"px";x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);stars=Array.from({length:Math.min(95,Math.floor(innerWidth*innerHeight/7000))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.25+.25,a:Math.random()*.6+.15,p:Math.random()*6.28}))}addEventListener("resize",resize);resize();function draw(t){x.clearRect(0,0,innerWidth,innerHeight);stars.forEach(s=>{const a=s.a*(.65+.35*Math.sin(t*.001+s.p));x.fillStyle=`rgba(230,255,249,${a})`;x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()});requestAnimationFrame(draw)}requestAnimationFrame(draw)})();
