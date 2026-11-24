(()=>{
const f=document.getElementById('cf'),st=document.getElementById('cs');if(!f)return;
const EMAIL='nedunurilokesh77@gmail.com';
f.addEventListener('submit',e=>{
 e.preventDefault();const d=Object.fromEntries(new FormData(f));if(d.website)return;
 if(!d.name.trim()||!/^\S+@\S+\.\S+$/.test(d.email)||!d.message.trim()){st.textContent='Please fill in your name, a valid email and a message.';st.className='err';return}
 location.href=`mailto:${EMAIL}?subject=${encodeURIComponent('Portfolio message from '+d.name)}&body=${encodeURIComponent(d.message+'\n\nFrom: '+d.name+' <'+d.email+'>')}`;
 st.textContent='Opening your email app…';st.className='ok';
});
})();
