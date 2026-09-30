/* Tombol navigasi: scroll di halaman yang sama (tanpa href, jadi tidak bisa membuka link luar) */
function goTo(id){
  var t = id && id !== 'top' ? document.getElementById(id) : null;
  if(t) t.scrollIntoView({behavior:'smooth'});
  else window.scrollTo({top:0,behavior:'smooth'});
}
document.addEventListener('click', function(e){
  var a = e.target.closest('[data-scroll]');
  if(a) goTo(a.getAttribute('data-scroll'));
});
/* Pengaman: link anchor (#...) apa pun tidak boleh menavigasi iframe (memicu dialog "Open external link") */
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a[href^="#"]');
  if(!a) return;
  e.preventDefault();
  goTo(a.getAttribute('href').slice(1));
}, true);
document.addEventListener('keydown', function(e){
  if(e.key !== 'Enter' && e.key !== ' ') return;
  if(e.target.closest && e.target.closest('[data-scroll]')) e.preventDefault();
  var a = e.target.closest && e.target.closest('[data-scroll]');
  if(a) goTo(a.getAttribute('data-scroll'));
});
