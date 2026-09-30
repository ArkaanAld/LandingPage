(function(){
  var els = document.querySelectorAll('.product,.why-item,.sect-head,.loc-card,.map-box');
  els.forEach(function(e){ e.classList.add('reveal'); });
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } });
  },{threshold:.12});
  els.forEach(function(e){ io.observe(e); });
})();

(function(){
  document.querySelectorAll('.gal-go').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelector('.tab[data-cat="'+b.dataset.cat+'"]').click();
      document.getElementById('menu').scrollIntoView({behavior:'smooth'});
    });
  });
  document.querySelectorAll('#mnav .nav-link').forEach(function(a){
    a.addEventListener('click', function(){
      var c = document.getElementById('mnav');
      if(window.bootstrap && c.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(c).hide();
    });
  });
  document.getElementById('tabs').addEventListener('click', function(){
    document.querySelectorAll('.product').forEach(function(p){ p.classList.add('in'); });
  });
})();
