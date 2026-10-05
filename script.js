const $=s=>document.querySelector(s);
const rp=n=>(n<0?'-':'')+'Rp '+Math.abs(Number(n)||0).toLocaleString('id-ID');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const BLN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const fd=d=>{const[y,m,t]=d.split('-');return `${+t} ${BLN[m-1].slice(0,3)} ${y}`};
let mem={};
const store={get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return mem[k]||null}},
 set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){mem[k]=v}}};
const ym=today().slice(0,7);
let db=store.get('kkm_db')||{students:[
 {id:'s1',nis:'1001',nama:'Ahmad Fauzi',kelas:'7A'},{id:'s2',nis:'1002',nama:'Bunga Lestari',kelas:'7A'},
 {id:'s3',nis:'1003',nama:'Candra Wijaya',kelas:'7B'},{id:'s4',nis:'1004',nama:'Dewi Anggraini',kelas:'7B'},
 {id:'s5',nis:'1005',nama:'Eko Prasetyo',kelas:'7C'}],
 tx:[{id:'t1',type:'in',cat:'Kas Siswa',desc:'Kas bulanan',amt:20000,date:ym+'-02',sid:'s1'},
 {id:'t2',type:'in',cat:'Kas Siswa',desc:'Kas bulanan',amt:20000,date:ym+'-03',sid:'s2'},
 {id:'t3',type:'in',cat:'Donasi',desc:'Sumbangan wali murid',amt:100000,date:ym+'-05'},
 {id:'t4',type:'out',cat:'Kebersihan',desc:'Beli sapu dan pel',amt:45000,date:ym+'-06'},
 {id:'t5',type:'out',cat:'ATK',desc:'Spidol dan penghapus',amt:30000,date:ym+'-08'}]};
const save=()=>store.set('kkm_db',db);
const sum=(t,l=db.tx)=>l.filter(x=>x.type===t).reduce((a,b)=>a+b.amt,0);
const sname=id=>(db.students.find(s=>s.id===id)||{nama:'(siswa dihapus)'}).nama;
const CATIN=['Kas Siswa','Donasi','Kegiatan','Lainnya'],CATOUT=['ATK','Kebersihan','Kegiatan','Konsumsi','Lainnya'];

function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hide');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.add('hide'),2200)}
function modal(title,body,onOk,okTxt='Simpan',danger){
  const o=$('#ov');o.innerHTML=`<form class="modal"><h3>${title}</h3>${body}<div class="acts"><button type="button" class="btn ghost" id="mc">Batal</button><button class="btn ${danger?'rd':''}">${okTxt}</button></div></form>`;
  o.classList.remove('hide');const close=()=>o.classList.add('hide');
  $('#mc').onclick=close;o.onclick=e=>{if(e.target===o)close()};
  o.firstChild.onsubmit=e=>{e.preventDefault();const r=onOk(Object.fromEntries(new FormData(e.target)));if(r!==false)close()};
  const f=o.querySelector('input,select');if(f)f.focus();
}
const ask=(msg,fn,ok='Ya, hapus')=>modal('Konfirmasi',`<p>${msg}</p>`,()=>{fn()},ok,true);

/* ---------- chart ---------- */
function chart(rows){
  if(!rows.length)return '<div class="empty">Belum ada data untuk grafik.</div>';
  const W=560,H=220,pl=44,pb=26,pt=10,mx=Math.max(1,...rows.flatMap(r=>[r.i,r.o])),bw=Math.min(22,(W-pl)/rows.length/3);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Grafik pemasukan dan pengeluaran">`;
  for(let k=0;k<=4;k++){const y=pt+(H-pb-pt)*k/4;s+=`<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--bd)"/><text x="${pl-6}" y="${y+4}" text-anchor="end">${Math.round(mx*(4-k)/4/1000)}rb</text>`}
  const step=(W-pl)/rows.length;
  rows.forEach((r,n)=>{const cx=pl+step*n+step/2,h=v=>(H-pb-pt)*v/mx;
    s+=`<rect x="${cx-bw-1}" y="${H-pb-h(r.i)}" width="${bw}" height="${h(r.i)}" rx="3" fill="var(--green)"/><rect x="${cx+1}" y="${H-pb-h(r.o)}" width="${bw}" height="${h(r.o)}" rx="3" fill="var(--red)"/><text x="${cx}" y="${H-8}" text-anchor="middle">${r.l}</text>`});
  return `<div class="leg"><span><i class="dot" style="background:var(--green)"></i>Pemasukan</span><span><i class="dot" style="background:var(--red)"></i>Pengeluaran</span></div>`+s+'</svg>';
}
function monthly(list,limit){
  const m={};list.forEach(t=>{const k=t.date.slice(0,7);m[k]=m[k]||{i:0,o:0};m[k][t.type==='in'?'i':'o']+=t.amt});
  let ks=Object.keys(m).sort();if(limit)ks=ks.slice(-limit);
  return ks.map(k=>({l:BLN[+k.slice(5)-1].slice(0,3)+(limit?'':' '+k.slice(2,4)),...m[k]}));
}
const txRow=(t,act)=>`<tr><td>${fd(t.date)}</td><td>${esc(t.sid?sname(t.sid)+' – ':'')}${esc(t.desc)}</td><td><span class="badge bl">${esc(t.cat)}</span></td><td class="${t.type==='in'?'in':'out'}">${t.type==='in'?'+':'-'} ${rp(t.amt)}</td>${act?`<td style="white-space:nowrap"><button class="btn ghost sm" data-e="${t.id}">✏️ Edit</button> <button class="btn ghost sm" data-d="${t.id}">🗑️</button></td>`:''}</tr>`;
const sorted=l=>[...l].sort((a,b)=>b.date.localeCompare(a.date));

/* ---------- pages ---------- */
const V=$('#view');
const pages={
dash(){
  const i=sum('in'),o=sum('out');
  V.innerHTML=`<div class="grid">
  <div class="card stat"><div class="ic b">💰</div><div><span>Total Kas</span><b>${rp(i-o)}</b></div></div>
  <div class="card stat"><div class="ic g">🟢</div><div><span>Total Pemasukan</span><b class="in">${rp(i)}</b></div></div>
  <div class="card stat"><div class="ic r">🔴</div><div><span>Total Pengeluaran</span><b class="out">${rp(o)}</b></div></div>
  <div class="card stat"><div class="ic b">👨‍🎓</div><div><span>Jumlah Siswa</span><b>${db.students.length}</b></div></div></div>
  <div class="two"><div class="card"><h3>Grafik 6 Bulan Terakhir</h3>${chart(monthly(db.tx,6))}</div>
  <div class="card"><h3>Transaksi Terbaru</h3>${sorted(db.tx).slice(0,6).map(t=>`<div style="display:flex;justify-content:space-between;gap:8px;padding:9px 0;border-bottom:1px solid var(--bd)"><div><b>${esc(t.desc)}</b><div class="sub">${fd(t.date)} · ${esc(t.cat)}</div></div><span class="${t.type==='in'?'in':'out'}" style="white-space:nowrap">${t.type==='in'?'+':'-'}${rp(t.amt)}</span></div>`).join('')||'<div class="empty">Belum ada transaksi.</div>'}</div></div>`;
},
siswa(){
  V.innerHTML=`<div class="card"><div class="bar"><input id="q" placeholder="🔍 Cari NIS, nama, atau kelas..."><button class="btn" id="add">➕ Tambah Siswa</button></div><div class="tw" id="tb"></div></div>`;
  const draw=()=>{const q=$('#q').value.toLowerCase();
    const l=db.students.filter(s=>(s.nis+s.nama+s.kelas).toLowerCase().includes(q));
    $('#tb').innerHTML=l.length?`<table><tr><th>NIS</th><th>Nama</th><th>Kelas</th><th>Status Bulan Ini</th><th>Aksi</th></tr>${l.map(s=>{const p=db.tx.some(t=>t.sid===s.id&&t.date.slice(0,7)===ym);return `<tr><td>${esc(s.nis)}</td><td><b>${esc(s.nama)}</b></td><td>${esc(s.kelas)}</td><td><span class="badge ${p?'ok':'no'}">${p?'Sudah Bayar':'Belum Bayar'}</span></td><td><button class="btn ghost sm" data-e="${s.id}">✏️ Edit</button> <button class="btn ghost sm" data-d="${s.id}">🗑️ Hapus</button></td></tr>`}).join('')}</table>`:'<div class="empty">Tidak ada siswa. Klik “Tambah Siswa”.</div>'};
  const form=s=>`<label>NIS</label><input name="nis" required value="${esc(s?.nis)}"><label>Nama lengkap</label><input name="nama" required value="${esc(s?.nama)}"><label>Kelas</label><input name="kelas" required placeholder="mis. 7A" value="${esc(s?.kelas)}">`;
  $('#q').oninput=draw;
  $('#add').onclick=()=>modal('Tambah Siswa',form(),d=>{if(db.students.some(s=>s.nis===d.nis.trim())){toast('NIS sudah terdaftar');return false}db.students.push({id:uid(),nis:d.nis.trim(),nama:d.nama.trim(),kelas:d.kelas.trim()});save();draw();toast('Siswa ditambahkan')});
  $('#tb').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.e){const s=db.students.find(x=>x.id===b.dataset.e);modal('Edit Siswa',form(s),d=>{if(db.students.some(x=>x.nis===d.nis.trim()&&x.id!==s.id)){toast('NIS sudah terdaftar');return false}Object.assign(s,{nis:d.nis.trim(),nama:d.nama.trim(),kelas:d.kelas.trim()});save();draw();toast('Data siswa diperbarui')})}
    if(b.dataset.d){const s=db.students.find(x=>x.id===b.dataset.d);ask(`Hapus siswa <b>${esc(s.nama)}</b>? Riwayat pembayarannya tetap tersimpan.`,()=>{db.students=db.students.filter(x=>x.id!==s.id);save();draw();toast('Siswa dihapus')})}};
  draw();
},
bayar(){
  V.innerHTML=`<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))"><form class="card" id="f"><h3>Form Pembayaran Kas</h3>
  <label>Siswa</label><select name="sid" required><option value="">Pilih siswa...</option>${db.students.map(s=>`<option value="${s.id}">${esc(s.nama)} (${esc(s.kelas)})</option>`).join('')}</select>
  <label>Jumlah (Rp)</label><input name="amt" type="number" min="1" required placeholder="20000">
  <label>Tanggal</label><input name="date" type="date" required value="${today()}">
  <label>Keterangan</label><input name="desc" value="Kas bulanan"><div class="acts"><button class="btn gr">💾 Simpan Pembayaran</button></div></form>
  <div class="card stat" style="align-self:start"><div class="ic b">💰</div><div><span>Saldo Kas Saat Ini</span><b id="sl">${rp(sum('in')-sum('out'))}</b></div></div></div>`;
  $('#f').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
    db.tx.push({id:uid(),type:'in',cat:'Kas Siswa',desc:d.desc||'Kas',amt:+d.amt,date:d.date,sid:d.sid});save();
    $('#sl').textContent=rp(sum('in')-sum('out'));e.target.reset();e.target.date.value=today();e.target.desc.value='Kas bulanan';toast('Pembayaran tersimpan, saldo bertambah')};
},
riwayat(){
  V.innerHTML=`<div class="card"><div class="bar"><input id="q" placeholder="🔍 Cari nama / keterangan..."><input id="d1" type="date" title="Dari tanggal"><input id="d2" type="date" title="Sampai tanggal"><button class="btn ghost" id="rs">Reset</button></div><div class="tw" id="tb"></div></div>`;
  const draw=()=>{const q=$('#q').value.toLowerCase(),a=$('#d1').value,b=$('#d2').value;
    const l=sorted(db.tx.filter(t=>t.cat==='Kas Siswa'&&(!a||t.date>=a)&&(!b||t.date<=b)&&(sname(t.sid)+t.desc).toLowerCase().includes(q)));
    $('#tb').innerHTML=l.length?`<table><tr><th>Tanggal</th><th>Siswa / Keterangan</th><th>Kategori</th><th>Jumlah</th><th>Aksi</th></tr>${l.map(t=>txRow(t,1)).join('')}</table><p class="sub">Total ditampilkan: <b>${rp(l.reduce((s,t)=>s+t.amt,0))}</b></p>`:'<div class="empty">Tidak ada pembayaran yang cocok.</div>'};
  ['q','d1','d2'].forEach(i=>$('#'+i).oninput=draw);$('#rs').onclick=()=>{['q','d1','d2'].forEach(i=>$('#'+i).value='');draw()};
  bindTx($('#tb'),draw);draw();
},
masuk(){trxPage('in')},keluar(){trxPage('out')},
laporan(){
  const yrs=[...new Set(db.tx.map(t=>t.date.slice(0,4)).concat(today().slice(0,4)))].sort();
  V.innerHTML=`<div class="card noprint" style="margin-bottom:16px"><div class="bar" style="margin:0"><select id="fy"><option value="">Semua tahun</option>${yrs.map(y=>`<option>${y}</option>`).join('')}</select><select id="fm"><option value="">Semua bulan</option>${BLN.map((b,i)=>`<option value="${i+1}">${b}</option>`).join('')}</select><button class="btn ghost" id="pr">🖨️ Cetak</button><button class="btn" id="ex">📥 Export CSV</button></div></div><div id="rp"></div>`;
  let cur=[];
  const draw=()=>{const y=$('#fy').value,m=$('#fm').value;
    cur=sorted(db.tx.filter(t=>(!y||t.date.slice(0,4)===y)&&(!m||+t.date.slice(5,7)===+m)));
    const i=sum('in',cur),o=sum('out',cur),per=(m?BLN[m-1]+' ':'')+(y||(m?'':'Semua periode'));
    $('#rp').innerHTML=`<h3 style="margin-bottom:12px">Laporan Kas Kelas MTsN Kota Probolinggo – ${per}</h3><div class="grid">
    <div class="card stat"><div class="ic g">🟢</div><div><span>Total Pemasukan</span><b class="in">${rp(i)}</b></div></div>
    <div class="card stat"><div class="ic r">🔴</div><div><span>Total Pengeluaran</span><b class="out">${rp(o)}</b></div></div>
    <div class="card stat"><div class="ic b">💰</div><div><span>Saldo Akhir (Pemasukan − Pengeluaran)</span><b>${rp(i-o)}</b></div></div></div>
    <div class="card" style="margin-bottom:16px"><h3>Grafik Keuangan</h3>${chart(monthly(cur))}</div>
    <div class="card"><h3>Rincian Transaksi</h3><div class="tw">${cur.length?`<table><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jumlah</th></tr>${cur.map(t=>txRow(t)).join('')}</table>`:'<div class="empty">Tidak ada transaksi pada periode ini.</div>'}</div></div>`};
  $('#fy').onchange=$('#fm').onchange=draw;
  $('#pr').onclick=()=>window.print();
  $('#ex').onclick=()=>{if(!cur.length){toast('Tidak ada data untuk diexport');return}
    const rows=[['Tanggal','Jenis','Kategori','Keterangan','Siswa','Jumlah']].concat(cur.map(t=>[t.date,t.type==='in'?'Pemasukan':'Pengeluaran',t.cat,t.desc,t.sid?sname(t.sid):'',t.amt]));
    rows.push([],['','','','','Total Pemasukan',sum('in',cur)],['','','','','Total Pengeluaran',sum('out',cur)],['','','','','Saldo Akhir',sum('in',cur)-sum('out',cur)]);
    const csv='\ufeff'+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='laporan-kas-kelas-mtsn.csv';a.click();toast('Laporan diexport')};
  draw();
}};
function bindTx(el,draw){el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.e){const t=db.tx.find(x=>x.id===b.dataset.e);txForm(t,t.type,draw)}
  if(b.dataset.d){const t=db.tx.find(x=>x.id===b.dataset.d);ask(`Hapus transaksi <b>${esc(t.desc)}</b> (${rp(t.amt)})? Saldo akan dihitung ulang.`,()=>{db.tx=db.tx.filter(x=>x.id!==t.id);save();draw();toast('Transaksi dihapus')})}}}
function txForm(t,type,draw){
  const cats=type==='in'?CATIN:CATOUT,isKas=t&&t.sid;
  modal(t?'Edit Transaksi':(type==='in'?'Tambah Pemasukan':'Tambah Pengeluaran'),
  `${isKas?`<label>Siswa</label><select name="sid">${db.students.map(s=>`<option value="${s.id}" ${s.id===t.sid?'selected':''}>${esc(s.nama)}</option>`).join('')}${db.students.some(s=>s.id===t.sid)?'':`<option value="${t.sid}" selected>${esc(sname(t.sid))}</option>`}</select>`:''}
  <label>Keterangan</label><input name="desc" required value="${esc(t?.desc)}"><label>Jumlah (Rp)</label><input name="amt" type="number" min="1" required value="${t?.amt||''}">
  <label>Tanggal</label><input name="date" type="date" required value="${t?.date||today()}"><label>Kategori</label><select name="cat">${cats.map(c=>`<option ${t&&t.cat===c?'selected':''}>${c}</option>`).join('')}</select>`,
  d=>{const o={desc:d.desc.trim(),amt:+d.amt,date:d.date,cat:d.cat};if(isKas){o.sid=d.sid;o.cat='Kas Siswa'}
    if(t)Object.assign(t,o);else db.tx.push({id:uid(),type,...o});save();draw();toast('Data tersimpan')});
}
function trxPage(type){
  const isIn=type==='in';
  V.innerHTML=`<div class="grid"><div class="card stat"><div class="ic ${isIn?'g':'r'}">${isIn?'🟢':'🔴'}</div><div><span>Total ${isIn?'Pemasukan':'Pengeluaran'}</span><b class="${isIn?'in':'out'}" id="tot"></b></div></div></div>
  <div class="card"><div class="bar"><input id="q" placeholder="🔍 Cari keterangan atau kategori..."><button class="btn ${isIn?'gr':'rd'}" id="add">➕ Tambah ${isIn?'Pemasukan':'Pengeluaran'}</button></div><div class="tw" id="tb"></div></div>`;
  const draw=()=>{const q=$('#q').value.toLowerCase(),all=db.tx.filter(t=>t.type===type);
    $('#tot').textContent=rp(sum(type));
    const l=sorted(all.filter(t=>(t.desc+t.cat+(t.sid?sname(t.sid):'')).toLowerCase().includes(q)));
    $('#tb').innerHTML=l.length?`<table><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jumlah</th><th>Aksi</th></tr>${l.map(t=>txRow(t,1)).join('')}</table>`:'<div class="empty">Belum ada data.</div>'};
  $('#q').oninput=draw;$('#add').onclick=()=>txForm(null,type,draw);bindTx($('#tb'),draw);draw();
}

/* ---------- navigasi ---------- */
const MENU=[['dash','🏠','Dashboard','Ringkasan keuangan kas kelas'],['siswa','👨‍🎓','Data Siswa','Kelola data siswa'],['bayar','💵','Pembayaran Kas','Catat pembayaran kas siswa'],['riwayat','📋','Riwayat Pembayaran','Seluruh pembayaran kas'],['masuk','🟢','Pemasukan','Catat dan lihat pemasukan'],['keluar','🔴','Pengeluaran','Catat dan lihat pengeluaran'],['laporan','📊','Laporan','Laporan keuangan kas kelas']];
$('#nav').innerHTML=MENU.map(m=>`<button data-p="${m[0]}">${m[1]} ${m[2]}</button>`).join('')+'<button class="out" data-p="logout">🚪 Logout</button>';
function go(p){const m=MENU.find(x=>x[0]===p);if(!m)return;
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.p===p));
  $('#pt').textContent=m[2];$('#pd').textContent=m[3];$('#sb').classList.remove('open');pages[p]();store.set('kkm_page',p)}
$('#nav').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.p==='logout'){modal('Logout','<p>Yakin ingin keluar dari aplikasi?</p>',()=>{store.set('kkm_login',false);showLogin()},'Ya, logout',true);return}
  go(b.dataset.p)};
$('#bg').onclick=()=>$('#sb').classList.toggle('open');
function showApp(){$('#login').classList.add('hide');$('#app').classList.remove('hide');go(store.get('kkm_page')||'dash')}
function showLogin(){$('#app').classList.add('hide');$('#login').classList.remove('hide')}
$('#lf').onsubmit=e=>{e.preventDefault();
  if($('#lu').value.trim()==='admin'&&$('#lp').value==='admin123'){store.set('kkm_login',true);showApp()}else toast('Username atau password salah')};
save();
if(store.get('kkm_login'))showApp();
