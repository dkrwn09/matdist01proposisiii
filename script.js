/* =========================================================
   PROPOSISI – Digital Learning Platform (Vanilla JS)
   Bagian: 1) Mesin logika  2) Data & konten  3) Navigasi
           4) Percobaan     5) Latihan        6) Inisialisasi
   ========================================================= */
const $ = s => document.querySelector(s);
const LS = { get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}}, set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}} };

/* ---------- 1) MESIN LOGIKA ---------- */
// Pohon ekspresi: variabel berupa string 'p'/'q'/'r', operator berupa objek {op,a,b}
const N=a=>({op:'~',a}), A=(a,b)=>({op:'∧',a,b}), O=(a,b)=>({op:'∨',a,b}), I=(a,b)=>({op:'→',a,b}), E=(a,b)=>({op:'↔',a,b});
const FN={'∧':(a,b)=>a&&b,'∨':(a,b)=>a||b,'→':(a,b)=>!a||b,'↔':(a,b)=>a===b};
const str=n=>typeof n==='string'?n:n.op==='~'?'~'+str(n.a):'('+str(n.a)+' '+n.op+' '+str(n.b)+')';
const show=n=>{const s=str(n);return typeof n!=='string'&&n.op!=='~'?s.slice(1,-1):s}; // tanpa kurung terluar
const BS=v=>v?'B':'S';
const cell=v=>`<td class="${v?'T':'F'}">${BS(v)}</td>`;
function ev(n,v,steps){ // evaluasi + catat langkah
  if(typeof n==='string')return v[n];
  const a=ev(n.a,v,steps), b=n.op==='~'?null:ev(n.b,v,steps);
  const res=n.op==='~'?!a:FN[n.op](a,b);
  if(steps)steps.push(n.op==='~'?`~${BS(a)} = ${BS(res)}  (${show(n)})`:`${BS(a)} ${n.op} ${BS(b)} = ${BS(res)}  (${show(n)})`);
  return res;
}
const vars=n=>typeof n==='string'?[n]:[...new Set([...vars(n.a),...(n.b?vars(n.b):[])])].sort();
const subs=(n,o=[])=>{if(typeof n==='string')return o;subs(n.a,o);if(n.b)subs(n.b,o);if(!o.some(x=>str(x)===str(n)))o.push(n);return o};
// Tabel kebenaran otomatis: 1 variabel=2 baris, 2=4, 3=8. Satu ekspresi -> tampilkan langkah antara.
function tt(asts,hl){
  asts=[].concat(asts);const vs=[...new Set(asts.flatMap(vars))].sort();
  const cols=asts.length===1?subs(asts[0]):asts, k=vs.length;
  let h=`<table class="tt"><tr>${vs.map(x=>`<th>${x}</th>`).join('')}${cols.map(c=>`<th>${show(c)}</th>`).join('')}</tr>`, last=[];
  for(let i=0;i<2**k;i++){const v={};vs.forEach((x,j)=>v[x]=!((i>>(k-1-j))&1));
    h+=`<tr${hl&&vs.every(x=>v[x]===hl[x])?' style="outline:2px solid #d9bd55"':''}>${vs.map(x=>cell(v[x])).join('')}${cols.map(c=>cell(ev(c,v))).join('')}</tr>`;
    last.push(ev(asts[asts.length-1],v));}
  return h+'</table>';
}
const kind=n=>{const vs=vars(n),k=vs.length,r=[];for(let i=0;i<2**k;i++){const v={};vs.forEach((x,j)=>v[x]=!((i>>(k-1-j))&1));r.push(ev(n,v))}return r.every(Boolean)?'Tautologi':r.every(x=>!x)?'Kontradiksi':'Kontingensi'};
const tag='<p><small>B = Benar (True = 1), S = Salah (False = 0).</small></p>';

/* ---------- 2) DATA & KONTEN ---------- */
const OPS=[
 {n:'Negasi',s:'~p',ast:N('p'),baca:'"bukan p" / "tidak benar bahwa p"',def:'Negasi dari p adalah proposisi yang nilai kebenarannya berlawanan dengan p.',rule:'~p benar jika p salah, dan ~p salah jika p benar (nilai dibalik).',ex:'p: "Hari ini hujan" → ~p: "Hari ini tidak hujan".',calc:'Jika p = B maka ~p = ~B = S.'},
 {n:'Konjungsi',s:'p ∧ q',ast:A('p','q'),baca:'"p dan q"',def:'Konjungsi menggabungkan dua proposisi dengan kata "dan".',rule:'p ∧ q benar hanya jika p dan q keduanya benar; selain itu salah.',ex:'p: "Ani mahasiswa", q: "Ani rajin" → "Ani mahasiswa dan Ani rajin".',calc:'p = B, q = S → B ∧ S = S.'},
 {n:'Disjungsi',s:'p ∨ q',ast:O('p','q'),baca:'"p atau q"',def:'Disjungsi menggabungkan dua proposisi dengan kata "atau" (inklusif).',rule:'p ∨ q salah hanya jika p dan q keduanya salah; selain itu benar.',ex:'"Budi membawa pulpen atau pensil".',calc:'p = B, q = S → B ∨ S = B.'},
 {n:'Implikasi',s:'p → q',ast:I('p','q'),baca:'"Jika p maka q"; p disebut hipotesis, q kesimpulan',def:'Implikasi (kondisional) menyatakan bahwa jika p terpenuhi maka q terpenuhi.',rule:'p → q salah hanya jika p benar dan q salah (janji dilanggar); selain itu benar.',ex:'"Jika hari hujan maka jalan basah".',calc:'p = S, q = B → S → B = B (janji tidak dilanggar).'},
 {n:'Biimplikasi',s:'p ↔ q',ast:E('p','q'),baca:'"p jika dan hanya jika q"',def:'Biimplikasi (bikondisional) adalah implikasi dua arah: (p → q) ∧ (q → p).',rule:'p ↔ q benar jika p dan q bernilai sama; salah jika berbeda.',ex:'"Segitiga sama sisi jika dan hanya jika ketiga sudutnya sama".',calc:'p = S, q = S → S ↔ S = B.'}];
const ROWTXT=['Kedua benar','Hanya p benar','Hanya q benar','Kedua salah'];
const LAW=[['Idempoten',[[O('p','p'),'p'],[A('p','p'),'p']],'Mengulang proposisi yang sama tidak mengubah nilai. Contoh: "Hujan atau hujan" sama dengan "hujan".'],
 ['Asosiatif',[[O(O('p','q'),'r'),O('p',O('q','r'))],[A(A('p','q'),'r'),A('p',A('q','r'))]],'Pengelompokan tanda kurung pada operasi yang sama tidak berpengaruh.'],
 ['Komutatif',[[O('p','q'),O('q','p')],[A('p','q'),A('q','p')]],'Urutan proposisi dapat ditukar. "Ani dan Budi hadir" = "Budi dan Ani hadir".'],
 ['Distributif',[[O('p',A('q','r')),A(O('p','q'),O('p','r'))],[A('p',O('q','r')),O(A('p','q'),A('p','r'))]],'Satu operator didistribusikan ke dalam kurung, seperti perkalian terhadap penjumlahan.']];
const lawSym=x=>typeof x==='string'?x:show(x);

const MODS=[ // id, judul, ikon, kata kunci, fungsi render
 ['pengertian','Pengertian Proposisi','📘','definisi nilai kebenaran pernyataan',()=>`
  <div class="card"><h2>Definisi Proposisi</h2><p><b>Proposisi</b> adalah pernyataan (kalimat deklaratif) yang <b>bernilai benar atau salah, tetapi tidak keduanya</b>. <b>Pernyataan</b> sendiri adalah kalimat yang menerangkan sesuatu dan dapat dinilai kebenarannya.</p>
  <div class="box">Nilai benar (True) = <b>1</b> · Nilai salah (False) = <b>0</b>. Proposisi dilambangkan dengan huruf kecil <b>p, q, r, …</b> Contoh: p: "1 + 1 = 2".</div></div>
  <div class="card"><h3>Contoh Proposisi</h3>
  <p>1. "Gajah lebih besar daripada tikus" → <span class="T">&nbsp;Benar&nbsp;</span> karena secara fakta ukuran gajah jauh melebihi tikus.</p>
  <p>2. "1 + 1 = 2" → <span class="T">&nbsp;Benar&nbsp;</span> karena hasil penjumlahan 1 dan 1 memang 2.</p>
  <p>3. "2 + 2 = 5" → <span class="F">&nbsp;Salah&nbsp;</span> karena 2 + 2 = 4. Tetap proposisi karena nilai kebenarannya pasti (salah).</p></div>
  <div class="grid"><div class="card"><h3>✅ Proposisi</h3><p>Kalimat berita yang dapat ditentukan benar/salahnya. Contoh: "Jakarta adalah ibu kota Indonesia".</p></div>
  <div class="card"><h3>❌ Bukan Proposisi</h3><p><b>Pertanyaan:</b> "Siapa namamu?"<br><b>Perintah:</b> "Kerjakan tugas ini!"<br><b>Kalimat terbuka:</b> "x + 3 = 7" (nilainya bergantung x, belum pasti benar/salah).</p></div></div>`],
 ['macam','Macam-Macam Proposisi','🧩','hipotesis disjungtif konjungtif kondisional bikondisional',()=>{
  const d=(t,s,b,pen,ct,sh)=>`<div class="card"><h3>${t}</h3><p><b>Simbol:</b> ${s}<br><b>Cara membaca:</b> ${b}<br><b>Penjelasan:</b> ${pen}<br><b>Contoh kalimat:</b> ${ct}<br><b>Penerapan sehari-hari:</b> ${sh}</p></div>`;
  return `<div class="card hero"><h2>A. Proposisi Hipotesis</h2><p>Proposisi yang menyatakan hubungan sebab–akibat atau syarat antara dua proposisi.</p></div>`+
  d('1. Kondisional','p → q','"Jika p maka q"','Definisi: proposisi bersyarat satu arah; p syarat, q akibat.','"Jika Andi lulus maka Andi diwisuda".','Aturan kampus: "Jika nilai ≥ 60 maka lulus mata kuliah".')+
  d('2. Bikondisional','p ↔ q','"p jika dan hanya jika q"','Definisi: syarat dua arah; p dan q harus sama nilainya.','"Bilangan genap jika dan hanya jika habis dibagi 2".','Login berhasil jika dan hanya jika password benar.')+
  `<div class="card hero"><h2>B. Proposisi Disjungtif</h2></div>`+d('Disjungsi','p ∨ q','"p atau q"','Definisi: gabungan dua proposisi dengan kata "atau"; benar bila salah satunya benar.','"Saya minum teh atau kopi".','Syarat daftar: membawa KTP atau SIM.')+
  `<div class="card hero"><h2>C. Proposisi Konjungtif</h2></div>`+d('Konjungsi','p ∧ q','"p dan q"','Definisi: gabungan dua proposisi dengan kata "dan"; benar bila keduanya benar.','"Hari ini cerah dan hangat".','Akses ruang server: punya kartu dan PIN benar.')}],
 ['operasi','Operasi Logika','⚙️','negasi konjungsi disjungsi implikasi biimplikasi',()=>OPS.map(o=>`<div class="card"><h2>${o.n} (${o.s})</h2><p><b>1. Definisi:</b> ${o.def}<br><b>2. Simbol:</b> ${o.s}<br><b>3. Cara membaca:</b> ${o.baca}<br><b>4. Aturan:</b> ${o.rule}</p><b>5. Tabel kebenaran:</b>${tt(o.ast)}<p><b>6. Contoh kalimat:</b> ${o.ex}<br><b>7. Contoh perhitungan:</b> ${o.calc}</p><div class="box"><b>8. Langkah demi langkah:</b> (a) tentukan nilai tiap proposisi; (b) terapkan aturan "${o.rule}"; (c) tulis hasil B atau S.</div></div>`).join('')],
 ['tabel','Tabel Kebenaran','📊','baris benar salah',()=>`<div class="card"><h2>Keterangan</h2>${tag}<p>Setiap kemungkinan nilai ditulis pada satu baris. Hijau = Benar, merah = Salah.</p></div>`+OPS.map(o=>`<div class="card"><h3>${o.n}: ${o.s}</h3>${tt(o.ast)}<p><b>Penjelasan baris:</b></p>${o.ast.op==='~'?'<p>Baris 1: p benar → ~p salah. Baris 2: p salah → ~p benar.</p>':'<ol>'+[0,1,2,3].map((i,k)=>{const v={p:i<2,q:i%2===0};return`<li>${ROWTXT[k]} → hasil ${BS(ev(o.ast,v))}</li>`}).join('')+'</ol>'}</div>`).join('')],
 ['percobaan','Percobaan','🧪','simulasi interaktif hitung',()=>percobaanHTML()],
 ['tautologi','Tautologi dan Kontradiksi','⚖️','tautologi kontradiksi pembuktian',()=>`<div class="grid"><div class="card"><h3>Tautologi</h3><p>Proposisi majemuk yang <b>seluruh nilai pada kolom terakhir</b> tabel kebenarannya <b>benar</b>.</p></div><div class="card"><h3>Kontradiksi</h3><p>Proposisi majemuk yang seluruh nilai kolom terakhirnya <b>salah</b>.</p></div></div>
  <div class="card"><h3>Contoh Tautologi: p ∨ ~p</h3>${tt(O('p',N('p')))}<p>Langkah: (1) isi p; (2) hitung ~p; (3) hitung p ∨ ~p. Semua hasil B → <b>tautologi</b>.</p></div>
  <div class="card"><h3>Contoh Kontradiksi: p ∧ ~p</h3>${tt(A('p',N('p')))}<p>Karena p dan ~p selalu berlawanan, konjungsinya selalu S → <b>kontradiksi</b>.</p></div>
  <div class="box"><b>Perbedaan:</b> tautologi selalu benar; kontradiksi selalu salah; selain keduanya disebut kontingensi.</div>`],
 ['hukum','Hukum Aljabar Proposisi','📐','idempoten asosiatif komutatif distributif',()=>LAW.map(l=>`<div class="card"><h3>Hukum ${l[0]}</h3><p>${l[2]}</p>${l[1].map(e=>`<div class="box"><b>${lawSym(e[0])} = ${lawSym(e[1])}</b>${typeof e[1]==='string'?tt([e[0]]):tt([e[0],e[1]])}</div>`).join('')}</div>`).join('')],
 ['ekivalensi','Ekivalensi Logis','🟰','ekivalen simbol de morgan',()=>`<div class="card"><h2>Pengertian</h2><p>Dua proposisi <b>P</b> dan <b>Q</b> disebut <b>ekivalen secara logis</b>, ditulis <b>P ≡ Q</b>, jika keduanya memiliki nilai kebenaran yang sama pada setiap baris tabel kebenaran (P ↔ Q tautologi).</p></div>
  <div class="card"><h3>Contoh: ~(p ∧ q) ≡ ~p ∨ ~q</h3>${tt([N(A('p','q')),O(N('p'),N('q'))])}<p>Kedua kolom identik pada keempat baris, sehingga terbukti ekivalen (Hukum De Morgan).</p></div>`],
 ['konvers','Konvers, Invers, dan Kontraposisi','🔁','konvers invers kontraposisi',()=>`<div class="card"><h2>Bentuk awal: p → q</h2><p><b>Konvers:</b> q → p (p dan q bertukar posisi).<br><b>Invers:</b> ~p → ~q (keduanya dinegasikan).<br><b>Kontraposisi:</b> ~q → ~p (bertukar posisi dan dinegasikan).</p>
  <div class="box">p: "Hari hujan", q: "Jalan basah"<br>Implikasi: Jika hari hujan maka jalan basah.<br>Konvers: Jika jalan basah maka hari hujan.<br>Invers: Jika hari tidak hujan maka jalan tidak basah.<br>Kontraposisi: Jika jalan tidak basah maka hari tidak hujan.</div></div>
  <div class="card"><h3>Tabel Perbandingan</h3>${tt([I('p','q'),I('q','p'),I(N('p'),N('q')),I(N('q'),N('p'))])}<p><b>Kesimpulan:</b> p → q ≡ ~q → ~p (kolom 1 = kolom 4), dan konvers ≡ invers (kolom 2 = kolom 3). Implikasi <u>tidak</u> ekivalen dengan konvers/inversnya.</p></div>`],
 ['contoh','Contoh Soal','✍️','soal pembahasan langkah',()=>contohHTML()],
 ['latihan','Latihan Soal','🎯','kuis pilihan ganda isian',()=>latihanHTML()]];
const IDS=['dashboard',...MODS.map(m=>m[0])], TITLES={dashboard:'Dashboard'}; MODS.forEach(m=>TITLES[m[0]]=m[1]);

/* ---------- Contoh soal ---------- */
const EX=[
 ['Tentukan mana yang proposisi: (a) "Berapakah 2 + 3?" (b) "5 + 3 = 8" (c) "x + 2 = 7" (d) "Jakarta ibu kota Indonesia".','Empat kalimat.','Proposisi / bukan.','Periksa apakah kalimat berupa pernyataan yang pasti benar atau salah. (a) pertanyaan → bukan. (b) benar → proposisi. (c) kalimat terbuka → bukan. (d) benar → proposisi.','(b) dan (d) proposisi.','Hanya kalimat berita dengan nilai pasti yang merupakan proposisi.'],
 ['Nyatakan dalam simbol: "Hari hujan dan jalan basah", "Jika hari hujan maka jalan basah" dengan p: hari hujan, q: jalan basah.','p, q diketahui.','Bentuk simbolik.','Kata "dan" → ∧. Kata "jika…maka" → →.','p ∧ q ; p → q','Kata penghubung menentukan operator.'],
 ['Jika p = B dan q = S, tentukan nilai (p ∨ q) ∧ ~q.','p = B, q = S.','Nilai kebenaran.','p ∨ q = B ∨ S = B. ~q = ~S = B. Maka B ∧ B = B.','B (Benar)','Hasil hitung bertahap dari kurung terdalam.'],
 ['Buatlah tabel kebenaran p ∧ ~q.','Dua variabel → 4 baris.','Tabel.','Isi p,q; hitung ~q; hitung p ∧ ~q.',`${tt(A('p',N('q')))}Hasil: S, B, S, S.`,'Hanya benar saat p = B dan q = S.'],
 ['Ubah ke kalimat: p: "Saya belajar", q: "Saya lulus", bentuk ~p → ~q.','p, q diketahui.','Kalimat verbal.','~p = "Saya tidak belajar"; ~q = "Saya tidak lulus"; lalu bentuk "jika…maka".','"Jika saya tidak belajar maka saya tidak lulus."','Negasi menjadi kata "tidak".'],
 ['Buktikan p ∨ ~p tautologi.','Ekspresi p ∨ ~p.','Jenis proposisi.','Buat tabel kebenaran, lihat kolom terakhir.',`${tt(O('p',N('p')))}`,'Semua B → tautologi.'],
 ['Buktikan p ∧ ~p kontradiksi.','Ekspresi p ∧ ~p.','Jenis proposisi.','Buat tabel kebenaran, lihat kolom terakhir.',`${tt(A('p',N('p')))}`,'Semua S → kontradiksi.'],
 ['Jika p = B, q = S, r = B, tentukan (p ∧ q) → r.','p=B, q=S, r=B.','Nilai.','p ∧ q = B ∧ S = S. Lalu S → B = B.','B (Benar)','Implikasi dengan hipotesis salah selalu benar.'],
 ['Buktikan ~(p ∧ q) ≡ ~p ∨ ~q.','Dua ekspresi.','Ekivalen atau tidak.','Buat tabel kedua ekspresi lalu bandingkan.',`${tt([N(A('p','q')),O(N('p'),N('q'))])}`,'Kolom sama → ekivalen (De Morgan).'],
 ['Tentukan konvers, invers, kontraposisi dari "Jika Andi rajin maka Andi lulus".','p: Andi rajin; q: Andi lulus.','Tiga bentuk.','Konvers q → p; invers ~p → ~q; kontraposisi ~q → ~p.','Konvers: Jika Andi lulus maka Andi rajin. Invers: Jika Andi tidak rajin maka Andi tidak lulus. Kontraposisi: Jika Andi tidak lulus maka Andi tidak rajin.','Kontraposisi ekivalen dengan pernyataan awal.']];
const contohHTML=()=>EX.map((e,i)=>`<div class="card"><h3>Soal ${i+1}</h3><p><b>Soal:</b> ${e[0]}</p><p><b>Diketahui:</b> ${e[1]}<br><b>Ditanyakan:</b> ${e[2]}</p><button onclick="tog(${i},this)">Lihat Pembahasan</button><div class="sol" id="s${i}"><div class="box"><b>Langkah penyelesaian:</b> ${e[3]}</div><p><b>Jawaban akhir:</b></p>${e[4]}<p><b>Kesimpulan:</b> ${e[5]}</p></div></div>`).join('');
function tog(i,b){const s=$('#s'+i);s.classList.toggle('open');b.textContent=s.classList.contains('open')?'Tutup Pembahasan':'Lihat Pembahasan'}

/* ---------- 4) PERCOBAAN ---------- */
const PRESET=[['Negasi (~p)',N('p')],['Konjungsi (p ∧ q)',A('p','q')],['Disjungsi (p ∨ q)',O('p','q')],['Implikasi (p → q)',I('p','q')],['Biimplikasi (p ↔ q)',E('p','q')],['(p ∧ q) → r',I(A('p','q'),'r')],['(p ∨ q) ∧ ~r',A(O('p','q'),N('r'))],['~(p ∧ q)',N(A('p','q'))]];
const vs3=(id,sel)=>`<select id="${id}">${['p','q','r'].map(x=>`<option ${x===sel?'selected':''}>${x}</option>`).join('')}</select>`;
const ng=id=>`<select id="${id}"><option value="">tanpa ~</option><option value="~">~</option></select>`;
const opSel=(id,none)=>`<select id="${id}">${none?'<option value="">(tidak ada)</option>':''}${Object.keys(FN).map(x=>`<option>${x}</option>`).join('')}</select>`;
function percobaanHTML(){return `<div class="card"><h2>Input Proposisi</h2>${['p','q','r'].map((x,i)=>`<div class="row"><b>${x}</b><input id="t${x}" style="flex:1;min-width:180px" placeholder="Tulis kalimat untuk ${x}, mis. Hari ini hujan" value="${['Hari ini hujan','Jalan basah','Saya membawa payung'][i]}"><select id="v${x}"><option value="1">Benar (True)</option><option value="0">Salah (False)</option></select></div>`).join('')}</div>
 <div class="card"><h2>Pilih Operasi</h2><select id="op">${PRESET.map((o,i)=>`<option value="${i}">${o[0]}</option>`).join('')}<option value="c">✏️ Buat sendiri…</option></select>
 <div id="custom" class="box" style="display:none"><b>Ekspresi buatan sendiri:</b> [~]A op1 [~]B (opsional op2 [~]C)<div class="row">${ng('n1')}${vs3('x1','p')}${opSel('o1')}${ng('n2')}${vs3('x2','q')}${opSel('o2',1)}${ng('n3')}${vs3('x3','r')}</div><small>Hanya variabel p, q, r dan operator ∧ ∨ → ↔ yang tersedia, sehingga ekspresi selalu valid.</small></div>
 <div class="row"><button onclick="hitung()">Hitung Hasil</button><button class="sec" onclick="resetP()">Reset</button><button class="sec" onclick="acak()">Acak Nilai</button></div></div><div id="hasil"></div>`}
function bindP(){const o=$('#op');if(o)o.onchange=()=>$('#custom').style.display=o.value==='c'?'block':'none'}
function getAst(){const o=$('#op').value;if(o!=='c')return PRESET[o][1];
  const lit=(n,x)=>$('#'+n).value?N($('#'+x).value):$('#'+x).value;
  let a={op:$('#o1').value,a:lit('n1','x1'),b:lit('n2','x2')};
  if($('#o2').value)a={op:$('#o2').value,a:a,b:lit('n3','x3')};return a}
function hitung(){const ast=getAst(),v={p:$('#vp').value==='1',q:$('#vq').value==='1',r:$('#vr').value==='1'},st=[],res=ev(ast,v,st),used=vars(ast);
  $('#hasil').innerHTML=`<div class="card"><h2>Hasil Percobaan</h2><p><b>Nilai variabel:</b></p><ul>${used.map(x=>`<li>${x} = ${BS(v[x])} — "${$('#t'+x).value||'(kalimat kosong)'}"</li>`).join('')}</ul><p><b>Ekspresi:</b> ${show(ast)}</p><p><b>Proses bertahap:</b></p><ol>${st.map(s=>`<li>${s}</li>`).join('')}</ol><p><b>Hasil akhir:</b> <span class="${res?'T':'F'}">&nbsp;${BS(res)}&nbsp;</span></p><div class="box"><b>Kesimpulan:</b> Ekspresi ${show(ast)} bernilai <b>${res?'BENAR':'SALAH'}</b> pada nilai yang dipilih. Jenis: ${kind(ast)}.</div></div><div class="card"><h3>Tabel Kebenaran Otomatis (${2**used.length} baris)</h3>${tt(ast,v)}${tag}</div>`}
function resetP(){['p','q','r'].forEach((x,i)=>{$('#t'+x).value=['Hari ini hujan','Jalan basah','Saya membawa payung'][i];$('#v'+x).value='1'});$('#op').value='0';$('#custom').style.display='none';$('#hasil').innerHTML=''}
function acak(){['p','q','r'].forEach(x=>$('#v'+x).value=Math.random()<.5?'1':'0');hitung()}

/* ---------- 5) LATIHAN ---------- */
const MCQ=[['Manakah yang merupakan proposisi?',['Tutup pintunya!','2 + 3 = 5','Siapa dia?','x > 2'],1,'Hanya kalimat berita bernilai pasti yang proposisi.'],
 ['Nilai ~p jika p benar adalah…',['Benar','Salah','Tidak tentu','1'],1,'Negasi membalik nilai.'],
 ['p ∧ q benar jika…',['p benar saja','q benar saja','keduanya benar','salah satu benar'],2,'Konjungsi butuh kedua benar.'],
 ['p ∨ q salah jika…',['keduanya salah','keduanya benar','p salah','q salah'],0,'Disjungsi salah hanya jika keduanya salah.'],
 ['p → q salah hanya jika…',['p S, q B','p B, q S','p S, q S','p B, q B'],1,'Janji dilanggar.'],
 ['p ↔ q benar jika…',['p dan q berbeda','p dan q sama','p benar','q benar'],1,'Biimplikasi benar bila nilai sama.'],
 ['Kontraposisi dari p → q adalah…',['q → p','~p → ~q','~q → ~p','p → ~q'],2,'Tukar posisi dan negasikan.'],
 ['p ∨ ~p disebut…',['Kontradiksi','Tautologi','Kontingensi','Ekivalensi'],1,'Selalu benar.'],
 ['Konvers dari p → q adalah…',['q → p','~p → ~q','~q → ~p','~p ∨ q'],0,'Posisi p dan q bertukar.'],
 ['Hukum De Morgan: ~(p ∧ q) ≡ …',['~p ∧ ~q','~p ∨ ~q','p ∨ q','p → q'],1,'Negasi konjungsi menjadi disjungsi negasi.']];
const FILL=[['Nilai (B ∧ S) adalah? (B/S)','s','B ∧ S = S.'],['Nilai (S → B) adalah? (B/S)','b','Hipotesis salah → implikasi benar.'],['Nilai (S ↔ S) adalah? (B/S)','b','Nilai sama → benar.'],['Banyak baris tabel kebenaran untuk 3 variabel?','8','2³ = 8.'],['Proposisi yang semua nilainya salah disebut? (tautologi/kontradiksi)','kontradiksi','Kolom terakhir semua S.']];
const norm=s=>{s=(s||'').trim().toLowerCase();return({benar:'b',true:'b',salah:'s',false:'s'})[s]||s};
function latihanHTML(){return `<div class="card"><h2>A. Pilihan Ganda</h2>${MCQ.map((m,i)=>`<p><b>${i+1}. ${m[0]}</b></p>${m[1].map((o,j)=>`<label class="opt"><input type="radio" name="m${i}" value="${j}"> ${'ABCD'[j]}. ${o}</label>`).join('')}<div id="mr${i}"></div>`).join('')}</div>
 <div class="card"><h2>B. Soal Isian</h2>${FILL.map((f,i)=>`<p><b>${i+1}. ${f[0]}</b><br><input id="f${i}"><span id="fr${i}"></span></p>`).join('')}</div>
 <div class="row"><button onclick="periksa()">Periksa Jawaban</button></div><div id="skor"></div>`}
function periksa(){let ok=0;
  MCQ.forEach((m,i)=>{const c=document.querySelector(`input[name=m${i}]:checked`),b=c&&+c.value===m[2];ok+=b;$('#mr'+i).innerHTML=`<p class="${b?'ok':'bad'}">${b?'✔ Benar':'✘ Salah — jawaban: '+'ABCD'[m[2]]+'. '+m[1][m[2]]}. ${m[3]}</p>`});
  FILL.forEach((f,i)=>{const b=norm($('#f'+i).value)===f[1];ok+=b;$('#fr'+i).innerHTML=`<br><span class="${b?'ok':'bad'}">${b?'✔ Benar':'✘ Salah — jawaban: '+f[1].toUpperCase()}. ${f[2]}</span>`});
  const n=MCQ.length+FILL.length,pct=Math.round(ok/n*100);
  $('#skor').innerHTML=`<div class="card hero"><h2>Hasil Latihan</h2><p>Jumlah soal: ${n} · Benar: ${ok} · Salah: ${n-ok}<br>Nilai akhir: <b>${pct}</b> · Persentase keberhasilan: <b>${pct}%</b></p><button onclick="route('latihan')">Ulangi Latihan</button></div>`;
  $('#skor').scrollIntoView({behavior:'smooth'});markDone('latihan',true)}

/* ---------- 3) NAVIGASI, PROGRESS, BOOKMARK ---------- */
let cur='dashboard';
const done=()=>LS.get('done',[]), favs=()=>LS.get('favs',[]);
function markDone(id,on){let d=done().filter(x=>x!==id);if(on)d.push(id);LS.set('done',d);buildMenu();if(id===cur)pageBar()}
function toggleFav(id){let f=favs();f=f.includes(id)?f.filter(x=>x!==id):[...f,id];LS.set('favs',f);pageBar()}
function buildMenu(){const q=$('#search').value.toLowerCase();
  $('#menu').innerHTML=[['dashboard','Dashboard','🏠',''],...MODS].filter(m=>!q||(m[1]+' '+m[3]).toLowerCase().includes(q)).map(m=>`<a class="${m[0]===cur?'active':''} ${done().includes(m[0])?'done':''}" onclick="route('${m[0]}')"><span>${m[2]}</span>${m[1]}</a>`).join('')||'<p style="padding:18px">Materi tidak ditemukan.</p>'}
function pageBar(){const b=$('#pbar');if(!b)return;const i=IDS.indexOf(cur);
  b.innerHTML=`<div class="nav"><button class="sec" ${i<2?'disabled':''} onclick="route('${IDS[i-1]}')">← Sebelumnya</button><span><button class="sec" onclick="toggleFav('${cur}')">${favs().includes(cur)?'★ Favorit':'☆ Simpan'}</button> <button onclick="markDone('${cur}',${!done().includes(cur)})">${done().includes(cur)?'✔ Selesai (batalkan)':'Tandai Selesai'}</button></span><button class="sec" ${i===IDS.length-1?'disabled':''} onclick="route('${IDS[i+1]}')">Berikutnya →</button></div>`}
function dashboard(){const d=done().filter(x=>x!=='dashboard'),pct=Math.round(d.length/MODS.length*100),last=LS.get('last',null),f=favs();
  return `<div class="card hero"><h2>Selamat Datang di Digital Learning Proposisi 👋</h2><p>Pelajari logika proposisi — dari pengertian, operasi logika, tabel kebenaran, hingga ekivalensi — lengkap dengan simulasi dan latihan interaktif.</p><button onclick="route('${last&&last!=='dashboard'?last:'pengertian'}')">Mulai Belajar</button></div>
  <div class="grid"><div class="card"><h3>📚 ${MODS.length} Materi</h3><p>Materi pembelajaran tersedia.</p></div>
  <div class="card"><h3>📈 Progress ${pct}%</h3><div class="bar"><i style="width:${pct}%"></i></div><p>${d.length} dari ${MODS.length} materi selesai.</p></div>
  <div class="card"><h3>🕘 Terakhir Dipelajari</h3><p>${last&&TITLES[last]?`<a href="#" onclick="route('${last}');return false">${TITLES[last]}</a>`:'Belum ada.'}</p></div></div>
  <div class="grid"><div class="card" onclick="route('percobaan')" style="cursor:pointer"><h3>🧪 Percobaan</h3><p>Simulasi operasi logika.</p></div><div class="card" onclick="route('latihan')" style="cursor:pointer"><h3>🎯 Latihan Soal</h3><p>Uji pemahamanmu.</p></div></div>
  ${f.length?`<div class="card"><h3>★ Materi Favorit</h3>${f.map(x=>`<p><a href="#" onclick="route('${x}');return false">${TITLES[x]}</a></p>`).join('')}</div>`:''}
  <div class="card"><h2>Daftar Materi Pembelajaran</h2>${MODS.map((m,i)=>`<p>${m[2]} <a href="#" onclick="route('${m[0]}');return false">${i+1}. ${m[1]}</a> ${done().includes(m[0])?'✔':''}</p>`).join('')}</div>`}
function route(id){cur=id;LS.set('last',id);$('#pageTitle').textContent=TITLES[id];
  const m=MODS.find(x=>x[0]===id);$('#main').innerHTML=(id==='dashboard'?dashboard():`<div id="pbar"></div>${m[4]()}<div id="pbar2"></div>`);
  $('#main').style.animation='none';void $('#main').offsetWidth;$('#main').style.animation='';
  pageBar();if($('#pbar2')){$('#pbar2').innerHTML=$('#pbar').innerHTML}
  if(id==='percobaan')bindP();buildMenu();closeSide();window.scrollTo(0,0)}
const closeSide=()=>{$('#sidebar').classList.remove('open');$('#overlay').classList.remove('show')};

/* ---------- 6) INISIALISASI ---------- */
$('#search').oninput=buildMenu;
$('#home').onclick=()=>route('dashboard');
$('#burger').onclick=()=>{$('#sidebar').classList.add('open');$('#overlay').classList.add('show')};
$('#overlay').onclick=closeSide;
function setTheme(t){document.documentElement.dataset.theme=t;$('#theme').textContent=t==='dark'?'☀️':'🌙';LS.set('theme',t)}
$('#theme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
setTheme(LS.get('theme','light'));
route('dashboard');
