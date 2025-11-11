let questions=[],current=0;
const qBox=document.getElementById("question");
const opts=document.getElementById("options");
const next=document.getElementById("next");
const scoreBox=document.getElementById("score");
const result=document.getElementById("result");
const quiz=document.getElementById("quiz");
const restart=document.getElementById("restart");
const bar=document.getElementById("bar");

async function load(){
  let res=await fetch('/api/questions');
  let data=await res.json();
  questions=data.questions;
  showQ();
}
function showQ(){
  next.disabled=true;
  let q=questions[current];
  qBox.textContent=q.q;
  opts.innerHTML='';
  q.options.forEach((op,i)=>{
    let li=document.createElement('li');
    li.textContent=op;
    li.onclick=()=>select(q.id,i,li);
    opts.append(li);
  });
  bar.style.width=(current/questions.length*100)+'%';
}
async function select(id,idx,el){
  let res=await fetch('/api/answer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({questionId:id,selectedIndex:idx})});
  let d=await res.json();
  opts.querySelectorAll('li').forEach(l=>l.style.pointerEvents='none');
  if(d.correct){el.classList.add('correct');}else{el.classList.add('wrong');opts.children[d.correctIndex].classList.add('correct');}
  next.disabled=false;
}
next.onclick=()=>{current++;if(current>=questions.length)end();else showQ();};
restart.onclick=async()=>{await fetch('/api/restart',{method:'POST'});current=0;result.style.display='none';quiz.style.display='block';load();};
async function end(){let r=await fetch('/api/score');let d=await r.json();scoreBox.textContent=`You scored ${d.score} out of ${questions.length}`;quiz.style.display='none';result.style.display='block';}
load();
