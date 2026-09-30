(function(){

  var cart = [];
  var lineId = 0;

  function toRupiah(n){
    return 'Rp' + n.toLocaleString('id-ID');
  }

  /* ---------- Generic single/multi option groups ---------- */
  function setupOptionGroup(groupEl){
    var isMulti = groupEl.dataset.multi === 'true';
    var max = groupEl.dataset.max ? parseInt(groupEl.dataset.max,10) : null;
    var buttons = Array.prototype.slice.call(groupEl.querySelectorAll('.opt'));

    buttons.forEach(function(btn){
      btn.addEventListener('click', function(){
        if(isMulti){
          var selectedCount = buttons.filter(function(b){return b.classList.contains('selected');}).length;
          if(!btn.classList.contains('selected') && max && selectedCount >= max){
            return;
          }
          btn.classList.toggle('selected');
        } else {
          buttons.forEach(function(b){ b.classList.remove('selected'); });
          btn.classList.add('selected');
        }
        groupEl.dispatchEvent(new Event('optchange', {bubbles:true}));
      });
    });
  }
  document.querySelectorAll('[data-group]').forEach(setupOptionGroup);

  function getSelected(groupSelector){
    var group = document.querySelector('[data-group="'+groupSelector+'"]');
    return Array.prototype.slice.call(group.querySelectorAll('.opt.selected'));
  }

  /* ---------- Quantity steppers ---------- */
  var qty = { manis:1, telor:1, mini:1 };
  document.querySelectorAll('[data-qty-action]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var t = btn.dataset.target;
      if(btn.dataset.qtyAction === 'plus') qty[t]++;
      else qty[t] = Math.max(1, qty[t]-1);
      document.getElementById(t+'-qty').textContent = qty[t];
      updatePrice(t);
    });
  });

  /* ---------- Price calculators ---------- */
  function sumPrice(opts){
    return opts.reduce(function(sum,o){ return sum + parseInt(o.dataset.price,10); }, 0);
  }

  function updatePrice(product){
    var unit = 0;
    if(product === 'manis'){
      unit = sumPrice(getSelected('manis-ukuran')) + sumPrice(getSelected('manis-topping')) + sumPrice(getSelected('manis-extra'));
    } else if(product === 'telor'){
      unit = sumPrice(getSelected('telor-ukuran')) + sumPrice(getSelected('telor-isian')) + sumPrice(getSelected('telor-pedas')) + sumPrice(getSelected('telor-extra'));
    } else if(product === 'mini'){
      unit = sumPrice(getSelected('mini-ukuran'));
      var rasa = getSelected('mini-rasa');
      var hint = document.getElementById('mini-hint');
      if(rasa.length < 3){
        hint.textContent = 'Pilih ' + (3-rasa.length) + ' rasa lagi untuk melanjutkan.';
        hint.classList.add('warn');
      } else {
        hint.textContent = 'Rasa terpilih: ' + rasa.map(function(r){return r.dataset.value;}).join(', ');
        hint.classList.remove('warn');
      }
    }
    document.getElementById(product+'-price').textContent = toRupiah(unit * qty[product]);
    return unit;
  }

  document.getElementById('menu').addEventListener('optchange', function(e){
    var group = e.target.closest('[data-group]');
    var product = group.dataset.group.split('-')[0];
    updatePrice(product);
  });

  /* ---------- Add to cart ---------- */
  function addToCart(product, name, optsSummary, unitPrice){
    var q = qty[product];
    cart.push({
      id: ++lineId,
      name: name,
      opts: optsSummary,
      unitPrice: unitPrice,
      qty: q,
      total: unitPrice * q
    });
    renderCart();
    flashCart();
  }

  document.getElementById('manis-add').addEventListener('click', function(){
    var unit = updatePrice('manis');
    var ukuran = getSelected('manis-ukuran')[0].dataset.value;
    var topping = getSelected('manis-topping')[0].dataset.value;
    var extras = getSelected('manis-extra').map(function(o){return o.dataset.value;});
    var summary = ukuran + ', ' + topping + (extras.length ? ', +' + extras.join(', +') : '');
    addToCart('manis', 'Martabak Manis', summary, unit);
  });

  document.getElementById('telor-add').addEventListener('click', function(){
    var unit = updatePrice('telor');
    var ukuran = getSelected('telor-ukuran')[0].dataset.value;
    var isian = getSelected('telor-isian')[0].dataset.value;
    var pedas = getSelected('telor-pedas')[0].dataset.value;
    var extras = getSelected('telor-extra').map(function(o){return o.dataset.value;});
    var summary = ukuran + ', ' + isian + ', ' + pedas + (extras.length ? ', +' + extras.join(', +') : '');
    addToCart('telor', 'Martabak Telor', summary, unit);
  });

  document.getElementById('mini-add').addEventListener('click', function(){
    var rasa = getSelected('mini-rasa');
    if(rasa.length < 3){
      document.getElementById('mini-hint').classList.add('warn');
      return;
    }
    var unit = updatePrice('mini');
    var ukuran = getSelected('mini-ukuran')[0].dataset.value;
    var rasaNames = rasa.map(function(o){return o.dataset.value;}).join(', ');
    addToCart('mini', 'Martabak Premium', ukuran + ' — Rasa: ' + rasaNames, unit);
  });

  /* ---------- Cart rendering ---------- */
  var cartLines = document.getElementById('cartLines');
  var cartTotal = document.getElementById('cartTotal');
  var cartBadge = document.getElementById('cartBadge');
  var checkoutBtn = document.getElementById('checkoutBtn');

  function renderCart(){
    if(cart.length === 0){
      cartLines.innerHTML = '<div class="cart-empty">Keranjang masih kosong.</div>';
      checkoutBtn.disabled = true;
    } else {
      cartLines.innerHTML = cart.map(function(line){
        return '<div class="cart-line">' +
          '<div>' +
            '<div class="cl-name">' + line.qty + '× ' + line.name + '</div>' +
            '<div class="cl-opts">' + line.opts + '</div>' +
            '<button class="cl-remove" data-remove="' + line.id + '">Hapus</button>' +
          '</div>' +
          '<div class="cl-price">' + toRupiah(line.total) + '</div>' +
        '</div>';
      }).join('');
      checkoutBtn.disabled = false;
    }
    var total = cart.reduce(function(s,l){ return s + l.total; }, 0);
    var count = cart.reduce(function(s,l){ return s + l.qty; }, 0);
    cartTotal.textContent = toRupiah(total);
    cartBadge.textContent = count;
    document.getElementById('checkoutForm').style.display = cart.length ? '' : 'none';

    cartLines.querySelectorAll('[data-remove]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = parseInt(btn.dataset.remove,10);
        cart = cart.filter(function(l){ return l.id !== id; });
        renderCart();
      });
    });
  }

  function flashCart(){
    var t=document.getElementById('addToast'); if(window.bootstrap&&t){bootstrap.Toast.getOrCreateInstance(t).show();}
    cartBadge.style.transform = 'scale(1.3)';
    setTimeout(function(){ cartBadge.style.transform = 'scale(1)'; }, 180);
  }

  /* ---------- Tabs filter ---------- */
  document.getElementById('tabs').addEventListener('click', function(e){
    var btn = e.target.closest('.tab');
    if(!btn) return;
    document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
    btn.classList.add('active');
    var cat = btn.dataset.cat;
    document.querySelectorAll('.product').forEach(function(p){
      p.style.display = (cat === 'semua' || p.dataset.cat === cat) ? '' : 'none';
    });
  });

  /* ---------- Overlays ---------- */
  var cartOverlay = document.getElementById('cartOverlay');
  var receiptOverlay = document.getElementById('receiptOverlay');

  document.getElementById('openCart').addEventListener('click', function(){ cartOverlay.classList.add('show'); });
  document.getElementById('closeCart').addEventListener('click', function(){ cartOverlay.classList.remove('show'); });
  document.getElementById('heroCta').addEventListener('click', function(){
    document.getElementById('menu').scrollIntoView({behavior:'smooth'});
  });
  cartOverlay.addEventListener('click', function(e){ if(e.target === cartOverlay) cartOverlay.classList.remove('show'); });


  document.querySelectorAll('input[name="pickup"]').forEach(function(r){
    r.addEventListener('change', function(){
      document.getElementById('addressGroup').style.display = (r.value === 'Diantar' && r.checked) ? 'block' : 'none';
    });
  });

  /* ---------- Checkout submit -> receipt ---------- */
  document.getElementById('checkoutForm').addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('custName').value.trim() || 'Pelanggan';
    var pickup = document.querySelector('input[name="pickup"]:checked').value;
    var payment = document.querySelector('input[name="payment"]:checked').value;
    var address = document.getElementById('custAddress').value.trim();

    var orderNo = 'MM-' + Math.floor(1000 + Math.random()*9000);
    var now = new Date();
    var dateStr = now.toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric'});
    var timeStr = now.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'});
    var total = cart.reduce(function(s,l){ return s + l.total; }, 0);

    var itemsHtml = cart.map(function(l){
      return '<div class="r-item">' +
        '<div class="r-item-top"><span>' + l.qty + '× ' + l.name + '</span><span>' + toRupiah(l.total) + '</span></div>' +
        '<div class="r-item-opts">' + l.opts + '</div>' +
      '</div>';
    }).join('');

    document.getElementById('receiptBox').innerHTML =
      '<div class="receipt-head">' +
        '<div class="r-brand">Martabak MM</div>' +
        '<div class="r-sub">Jl. Sariwangi Jl. Komp. Perumnas Sarijadi No.19 Blok 23, Sukawarna, Kec. Sukajadi, Kota Bandung, Jawa Barat 40599</div>' +
      '</div>' +
      '<div class="receipt-meta">' +
        '<span>No. Pesanan: ' + orderNo + '</span>' +
        '<span>' + dateStr + ' · ' + timeStr + '</span>' +
        '<span>Atas Nama: ' + name + '</span>' +
        '<span>Pengambilan: ' + pickup + (pickup === 'Diantar' && address ? ' — ' + address : '') + '</span>' +
        '<span>Pembayaran: ' + payment + '</span>' +
      '</div>' +
      '<div class="receipt-items">' + itemsHtml + '</div>' +
      '<div class="receipt-totals">' +
        '<div class="sum-row total"><span>Total</span><span>' + toRupiah(total) + '</span></div>' +
      '</div>' +
      '<div class="receipt-actions">' +
        '<button class="btn btn-ghost" id="printReceipt" style="flex:1;">Cetak Struk</button>' +
        '<button class="btn btn-primary" id="closeReceipt" style="flex:1;">Pesan Lagi</button>' +
      '</div>' +
      '<p class="receipt-thanks">Terima kasih sudah pesan di Martabak MM 🥞</p>';

    cartOverlay.classList.remove('show');
    receiptOverlay.classList.add('show');

    document.getElementById('printReceipt').addEventListener('click', function(){ window.print(); });
    document.getElementById('closeReceipt').addEventListener('click', function(){
      receiptOverlay.classList.remove('show');
      cart = [];
      renderCart();
      document.getElementById('checkoutForm').reset();
      document.getElementById('addressGroup').style.display = 'none';
    });
  });

  renderCart();
})();
