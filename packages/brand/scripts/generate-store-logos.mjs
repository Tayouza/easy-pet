/** Logos fictícios do seed. Uso: npm ci && npm run generate:stores (nesta pasta).
 * Não executa o seed nem acessa o banco. Cada direção de arte é vinculada ao nome.
 * Ícones geométricos originais; texto Nunito em paths, sem fontes externas no SVG.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { create } from 'fontkit';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const out = resolve(here, '../store-logos');
const font = create(await readFile(resolve(here, 'fonts/Nunito.ttf'))).getVariation({ wght: 800 });
const slugify = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const wrap = body => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${body}</svg>`;

// Nomes curtos, monogramas e símbolos escolhidos por loja; cinco composições.
const directions = `
Patas & Cia Pet Shop|patas & cia|PC|paw|seal
Bicho Mimado|mimado|BM|dog|icon
Pet Center Matriz|matriz|PM|shop|shield
Focinho Feliz Pet Shop|focinho|FF|smile|duo
Casa do Bigode|bigode|CB|cat|icon
Rabo Abanando|abanando|RA|tail|seal
Mundo Pet Menino Deus|mundo pet|MP|planet|mono
Latido & Miado|latido miado|LM|catdog|duo
Pet Point Tristeza|pet point|PP|pin|icon
Bichos do Sarandi|sarandi|BS|paw|mono
Vet Amigo Moinhos|vet amigo|VA|heartplus|seal
Dra. Helena Prates – Medicina Felina|helena|HP|cat|mono
VetCare Cidade Baixa|vetcare|VC|pulse|shield
Pata Saudável Veterinária|saudável|PS|pawplus|icon
Consultório Vet Três Figueiras|figueiras|TF|leaves|duo
Vet em Casa POA|vet casa|VC|houseplus|icon
Doutor Bicho Cavalhada|dr. bicho|DB|stetho|seal
Hospital Veterinário Pampa 24h|pampa|PA|pulse|duo
Clínica Vet Santa Clara|santa clara|SC|spark|mono
ProntoVet Hospital 24h|prontovet|PV|heartplus|shield
Clínica Veterinária Mont'Serrat|montserrat|MS|mountain|icon
Centro Veterinário Zona Sul 24h|zona sul|ZS|compass|seal
Espuma & Patas|espuma|EP|bubbles|icon
Banho de Cheiro Pet Spa|de cheiro|BC|drop|seal
Tosa Fina Studio|tosa fina|TF|scissors|mono
Bolha Pet|bolha|BP|bubbles|duo
Cãopricho Banho e Tosa|cãopricho|CP|comb|shield
Spa do Totó|totó|TO|lotus|icon
Cãomodidade Hotel & Creche|cãomodidade|CM|house|seal
Recreio dos Peludos|recreio|RP|sun|duo
Hotelzinho Patudos|patudos|HP|moon|icon
Vila Canina Daycare|vila canina|VC|house|shield
Agropecuária Belém Novo|belém novo|BN|wheat|seal
Casa Rural Lami|lami|RL|barn|icon
Agro Restinga|restinga|AR|sprout|mono
Agropecuária Lomba Verde|lomba verde|LV|leaves|duo
Senta & Fica Adestramento|senta fica|SF|ribbon|seal
Escola Canina Bom Garoto|bom garoto|BG|dog|shield
Adestra Pet Positivo|positivo|AP|check|mono
Passeio Feliz Dog Walker|passeio feliz|PF|walk|icon
Lar Doce Pet Sitter|lar doce|LD|househeart|duo
Caminhada Canina Parcão|parcão|CC|trail|seal
Farmavet Central|farmavet|FC|pill|icon
Drogavet Petrópolis|drogavet|DP|mortar|mono
Farmácia Vet Zona Norte|zona norte|ZN|pill|shield
LabVet Diagnósticos|labvet|LV|flask|seal
Imagem Pet Exames|imagem pet|IP|scan|duo
Recife Azul Aquarismo|recife azul|RA|fish|icon
Mundo Submerso|submerso|MS|waves|seal
Biscoitaria Au Au|au au|AA|cookie|icon
Petisco Gourmet da Vila|da vila|PG|bone|shield
Clique Pet Estúdio|clique|CP|camera|duo
Lente & Focinho Fotografia|lente|LF|aperture|mono
Abrigo Quatro Patas|quatro patas|QP|heartpaw|seal
Adote um Amigo POA|adote|AA|househeart|icon
Memorial Jardim das Patas|jardim|JP|flower|duo
Pet Mania Auxiliadora|pet mania|PM|dog|mono
Gato Mestre Clínica Felina|gato mestre|GM|cat|shield
AuQMia Banho e Tosa|auqmia|AQ|drop|duo
Peixe Dourado Aquários|dourado|PD|fish|seal
Ração Express Delivery|express|RE|bolt|shield
`.trim().split('\n').map(line => line.split('|'));
const design = new Map(directions.map(([nome, short, mono, icon, style]) => [slugify(nome), { nome, short, mono, icon, style }]));

// 24×24 icon drawing grid, custom paths rather than third-party brand marks.
const icons = {
 paw: '<ellipse cx="6" cy="7" rx="2" ry="2.7"/><ellipse cx="10" cy="4.5" rx="2" ry="2.7"/><ellipse cx="15" cy="4.5" rx="2" ry="2.7"/><ellipse cx="19" cy="7" rx="2" ry="2.7"/><path d="M12 10c-3 0-3 3-6 6-3 4 0 7 4 5 2-1 3-1 5 0 4 2 7-1 4-5-3-3-4-6-7-6Z"/>',
 dog: '<path d="m6 9-3 2V4l6 2h6l6-2v7l-3-2v7c0 7-12 7-12 0Z"/><path d="M9 12h.1M15 12h.1M10 17l2 2 2-2M12 19v2"/>',
 cat: '<path d="M4 11V3l6 5h4l6-5v8c5 14-21 14-16 0Z"/><path d="M8 13h.1M16 13h.1m-6 3 2 2 2-2M2 16l5 1m-5 3 5-1m15-3-5 1m5 3-5-1"/>',
 smile: '<path d="M4 11C4 1 20 1 20 11v4c0 10-16 10-16 0Z"/><path d="M8 11h.1M16 11h.1M8 16q4 5 8 0M10 13h4l-2 2Z"/>',
 shop: '<path d="M4 10v12h16V10M2 9l3-7h14l3 7c0 4-5 4-5 0 0 4-5 4-5 0 0 4-5 4-5 0 0 4-5 4-5 0Z"/><path d="M9 22v-7h6v7"/>',
 tail: '<path d="M6 18C-1 8 4 1 10 5c4 3-2 10 3 12 3 1 8-3 8-7 3 9-6 15-12 11M17 4l1-2m3 5 2-1"/>',
 planet: '<circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="13" ry="4" transform="rotate(-35 12 12)"/><path d="M12 4c-5 5-5 11 0 16"/>',
 catdog: '<path d="M2 15V7l5 4 4-4v8c0 9-9 9-9 0Zm12 0V9l4-4 4 4v6c0 9-8 9-8 0M5 16h3m9 0h2"/>',
 pin: '<path d="M12 23S3 15 3 9a9 9 0 0 1 18 0c0 6-9 14-9 14Z"/><circle cx="12" cy="9" r="3"/>',
 heartplus: '<path d="M12 21 3 12C-3 5 6-1 12 6c6-7 15-1 9 6Z"/><path d="M8 11h8m-4-4v8"/>',
 pulse: '<path d="M2 5h20v17H2Z"/><path d="M0 13h6l3-5 4 10 3-5h8M9 1h6"/>',
 pawplus: '<path d="M4 10v10h10M18 1v10m-5-5h10"/><circle cx="10" cy="9" r="1"/><circle cx="6" cy="5" r="1"/><path d="M9 14c7-5 11 5 5 7-8 2-11-3-5-7Z"/>',
 leaves: '<path d="M12 23V10M12 16C0 17 0 8 1 4c8 0 12 4 11 12Zm0-5C12 3 17 1 23 1c0 8-4 13-11 10Z"/>',
 houseplus: '<path d="m1 11 11-9 11 9M4 9v13h16V9M8 15h8m-4-4v8"/>',
 stetho: '<path d="M3 2v6c0 9 12 9 12 0V2M2 2h3m8 0h3M9 15v2c0 8 12 8 12 0v-3"/><circle cx="21" cy="11" r="2"/>',
 spark: '<path d="m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/>',
 mountain: '<path d="m1 21 8-16 5 8 3-5 6 13ZM6 11l3 3 3-3M18 2v4m-2-2h4"/>',
 compass: '<circle cx="12" cy="12" r="10"/><path d="m9 9 8-2-2 8-8 2ZM12 0v3m0 18v3"/>',
 bubbles: '<circle cx="9" cy="14" r="8"/><circle cx="18" cy="6" r="5"/><circle cx="21" cy="20" r="2"/><path d="M5 13q0-3 3-3"/>',
 drop: '<path d="M12 1S3 10 3 15a9 9 0 0 0 18 0C21 10 12 1 12 1Z"/><path d="M7 15q0 5 5 5"/>',
 scissors: '<circle cx="5" cy="18" r="4"/><circle cx="19" cy="18" r="4"/><path d="m8 15 12-13M16 15 4 2"/>',
 comb: '<path d="M3 3h18v5H3ZM5 8v12m4-12v14m4-14v12m4-12v14m4-14v12"/>',
 lotus: '<path d="M12 22C1 22 1 12 1 9c6 1 9 5 11 13Zm0 0c11 0 11-10 11-13-6 1-9 5-11 13ZM12 20C3 11 9 4 12 1c3 3 9 10 0 19Z"/>',
 house: '<path d="m1 11 11-9 11 9M4 9v13h16V9M9 22v-8h6v8"/>',
 sun: '<circle cx="12" cy="12" r="6"/><path d="M12 0v3m0 18v3M0 12h3m18 0h3M3 3l2 2m14 14 2 2M3 21l2-2M19 5l2-2"/>',
 moon: '<path d="M21 16C11 21 3 11 9 2-5 8 3 27 17 21Z"/><path d="m18 1 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
 wheat: '<path d="M12 24V4m0 5C5 9 3 5 3 2c7 0 9 4 9 7Zm0 7C5 16 3 12 3 9c7 0 9 4 9 7Zm0-4c7 0 9-4 9-7-7 0-9 4-9 7Zm0 7c7 0 9-4 9-7-7 0-9 4-9 7Z"/>',
 barn: '<path d="M3 22V9l9-7 9 7v13ZM0 10l12-9 12 9M8 22V12h8v10m-8-9 8 9m0-9-8 9"/>',
 sprout: '<path d="M12 23V12M12 14C1 14 1 6 1 2c9 0 11 4 11 12Zm0-3c0-8 4-10 11-10 0 8-3 12-11 10ZM4 23h16"/>',
 ribbon: '<circle cx="12" cy="8" r="7"/><path d="m7 14-3 9 6-2 2-6 2 6 6 2-3-9M9 8l2 2 4-4"/>',
 check: '<path d="M12 1 2 5v8c0 6 10 10 10 10s10-4 10-10V5Z"/><path d="m6 12 4 4 8-9"/>',
 walk: '<path d="M5 1c4 0 5 5 4 8-1 3-3 4-5 2-2-3-2-10 1-10Zm14 9c3 0 3 7 1 10-2 2-4 1-5-2-1-3 0-8 4-8Z"/><path d="m3 15 4 1m9 6 4-1"/>',
 househeart: '<path d="m1 10 11-8 11 8M4 9v13h16V9M12 18l-4-4c-3-3 1-5 4-2 3-3 7-1 4 2Z"/>',
 trail: '<path d="M4 23c0-8 16-4 16-11 0-6-12-2-12-7 0-3 3-4 5-4"/><path d="m10 1 3 0 0 3M1 20l3 3 3-3"/>',
 pill: '<path d="M3 11 11 3c8-7 17 2 10 10l-8 8C5 28-4 19 3 11ZM7 7l10 10"/>',
 mortar: '<path d="M2 11h20c0 12-20 12-20 0Zm3 12h14M13 11l6-9 4 3-4 6"/>',
 flask: '<path d="M8 1h8m-6 0v8L2 20q-1 3 3 3h14q4 0 3-3L14 9V1M5 16h14"/><circle cx="10" cy="19" r=".6"/>',
 scan: '<path d="M1 8V1h7m8 0h7v7m0 8v7h-7m-8 0H1v-7M5 13h4l2-5 3 9 2-4h3"/>',
 fish: '<path d="M2 12c6-12 14-9 17-4l4-4v16l-4-4C16 21 8 24 2 12Z"/><circle cx="8" cy="11" r=".7"/><path d="M14 6q-3 6 0 12"/>',
 waves: '<path d="M1 8q5-6 11 0t11 0M1 15q5-6 11 0t11 0M1 22q5-6 11 0t11 0M10 1h4"/>',
 cookie: '<path d="M22 10C13 12 10 6 12 1-3 1-3 23 12 23c7 0 11-6 10-13Z"/><circle cx="7" cy="9" r="1"/><circle cx="8" cy="17" r="1"/><circle cx="15" cy="17" r="1"/>',
 bone: '<path d="M5 8c-8 0-3-10 2-5 5-5 10 3 5 5l4 4c2-5 10 0 5 5 5 5-5 10-5 2L8 11Z"/>',
 camera: '<path d="M2 7h5l2-4h6l2 4h5v15H2Z"/><circle cx="12" cy="14" r="5"/><path d="M18 10h1"/>',
 aperture: '<circle cx="12" cy="12" r="10"/><path d="m7 3 5 9 10 0M2 12h10l5 9M7 21l5-9 5-9"/>',
 heartpaw: '<path d="m12 22-9-9C-3 6 6-1 12 6c6-7 15 0 9 7Z"/><path d="M9 14q3-5 6 0M8 10h.1M12 9h.1M16 10h.1"/>',
 flower: '<path d="M12 23v-7m0 5c-5 0-7-2-8-5m8 5c5 0 7-2 8-5"/><path d="M12 4C8-1 3 1 5 6-1 6 0 12 5 12 3 18 9 20 12 15 15 20 21 18 19 12 24 12 25 6 19 6 21 1 16-1 12 4Z"/><circle cx="12" cy="9" r="2.2"/>',
 bolt: '<path d="m14 0-13 14h9L8 24l15-16h-10Z"/>',
};
function icon(name, x, y, size, color, solid = false) {
 assert(icons[name], `Ícone desconhecido: ${name}`);
 const filled = solid && name === 'paw';
 return `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="${filled ? color : 'none'}" stroke="${color}" stroke-width="${filled ? 0 : 1.9}" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</g>`;
}
function text(value, x, baseline, size, color, maxWidth = 340) {
 const run = font.layout(value);
 const width = run.positions.reduce((sum, p) => sum + p.xAdvance, 0);
 const scale = Math.min(size / font.unitsPerEm, maxWidth / width);
 let pen = -width / 2;
 return `<g fill="${color}" transform="translate(${x} ${baseline}) scale(${scale} ${-scale})">${run.glyphs.map((g, i) => {
 const p = run.positions[i];
 const path = `<path transform="translate(${pen + p.xOffset} ${p.yOffset})" d="${g.path.toSVG()}"/>`;
 pen += p.xAdvance; return path;
 }).join('')}</g>`;
}
function mix(hex, target, ratio) {
 const a = hex.match(/[a-f\d]{2}/gi).map(c => parseInt(c, 16));
 const b = target.match(/[a-f\d]{2}/gi).map(c => parseInt(c, 16));
 return '#' + a.map((c, i) => Math.round(c * (1 - ratio) + b[i] * ratio).toString(16).padStart(2, '0')).join('');
}
function artwork(d, base, index) {
 const cream = '#FFF9EF';
 const dark = mix(base, '#141E29', .67);
 const main = mix(base, index % 2 ? '#A94820' : '#126C70', .10 + (index % 4) * .035);
 const light = mix(base, cream, .89);
 const accent = mix(base, '#FFD58A', .65);
 const bg = ['mono', 'seal', 'duo'].includes(d.style) ? main : light;
 let body = `<rect width="512" height="512" fill="${bg}"/>`;
 const circle = (cx, cy, r, fill, stroke = 'none', sw = 0) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
 switch (d.style) {
 case 'mono':
 body += circle(256, 256, 194, dark) + circle(256, 256, 178, 'none', accent, 2);
 body += text(d.mono, 256, 290, 164, cream, 280);
 body += icon(d.icon, 225, 100, 62, accent, true);
 body += text(d.short, 256, 364, 35, accent, 284);
 break;
 case 'seal':
 body += circle(256, 256, 194, cream) + circle(256, 256, 178, 'none', dark, 3);
 body += icon(d.icon, 175, 119, 162, dark, true);
 body += text(d.short, 256, 346, 51, dark, 304);
 body += `<path d="M219 377h74" stroke="${main}" stroke-width="7" stroke-linecap="round"/>`;
 body += circle(122, 267, 6, main) + circle(390, 267, 6, main);
 break;
 case 'icon':
 body += circle(256, 219, 127, main);
 body += icon(d.icon, 177, 140, 158, cream, true);
 body += text(d.short, 256, 392, 61, dark, 318);
 break;
 case 'shield':
 body += `<path d="M256 65 421 125v132c0 111-165 184-165 184S91 368 91 257V125Z" fill="${dark}"/><path d="m256 84 145 53v120c0 90-145 162-145 162S111 347 111 257V137Z" fill="none" stroke="${accent}" stroke-width="3"/>`;
 body += icon(d.icon, 193, 125, 126, accent, true);
 body += text(d.mono, 256, 349, 102, cream, 238);
 break;
 case 'duo':
 body += `<rect x="90" y="78" width="332" height="354" rx="114" fill="${dark}"/>`;
 body += icon(d.icon, 177, 113, 158, accent, true);
 body += text(d.short, 256, 350, 53, cream, 280);
 body += `<path d="M228 385h56" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>`;
 break;
 default: throw Error(`Estilo desconhecido: ${d.style}`);
 }
 return wrap(`<title>${esc(d.nome)} — identidade fictícia</title>${body}`);
}

// Read only the stores INSERT; QA records in a local database never enter here.
const sql = await readFile(resolve(root, 'supabase/seed.sql'), 'utf8');
const block = sql.split('insert into public.stores (')[1]?.split('\n\n')[0];
assert(block, 'INSERT de lojas não encontrado');
const stores = [...block.matchAll(/^  \('[^']+', '[^']+', '([^']+)', '((?:[^']|'')*)'/gm)]
 .map(m => ({ nome: m[2].replaceAll("''", "'"), categoria_id: m[1] })).filter(s => !/^QA\s/i.test(s.nome));
assert.equal(stores.length, 61, 'Revise as direções de arte se o seed mudar');
assert.equal(new Set(stores.map(s => slugify(s.nome))).size, stores.length, 'Slugs duplicados');
const spec = await readFile(resolve(root, 'docs/SPEC.md'), 'utf8');
const categories = new Map([...spec.matchAll(/^\| ([a-z-]+) \| [^|]+ \| (#[A-Fa-f0-9]{6}) \|/gm)].map(m => [m[1], m[2]]));
await mkdir(out, { recursive: true });
const manifest = [];
const hashes = new Set();
const tiles = [];
for (const [index, store] of stores.entries()) {
 const slug = slugify(store.nome);
 const d = design.get(slug);
 assert(d && d.nome === store.nome, `Falta direção de arte: ${store.nome}`);
 assert(categories.has(store.categoria_id), `Categoria sem paleta: ${store.categoria_id}`);
 const svg = artwork(d, categories.get(store.categoria_id), index);
 const png = await sharp(Buffer.from(svg)).flatten({ background: '#FFFFFF' }).png().toBuffer();
 const metadata = await sharp(png).metadata();
 assert.equal(metadata.width, 512); assert.equal(metadata.height, 512); assert.equal(metadata.hasAlpha, false);
 const hash = createHash('sha256').update(png).digest('hex');
 assert(!hashes.has(hash), `Logo duplicado: ${slug}`); hashes.add(hash);
 await writeFile(resolve(out, `${slug}.svg`), svg + '\n');
 await writeFile(resolve(out, `${slug}.png`), png);
 manifest.push({ ...store, slug, file: `${slug}.png` });
 // Circular crop AND actual map size preview beside each large logo.
 const mask = Buffer.from('<svg width="160" height="160"><circle cx="80" cy="80" r="80" fill="white"/></svg>');
 const round = await sharp(png).resize(160).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
 const tiny = await sharp(round).resize(44).png().toBuffer();
 const label = wrap(text(String(index + 1).padStart(2, '0') + ' · ' + d.short, 256, 300, 38, '#26313A', 470));
 const labelPng = await sharp(Buffer.from(label)).resize(214, 214).extract({ left: 0, top: 100, width: 214, height: 38 }).png().toBuffer();
 const tile = await sharp({ create: { width: 238, height: 248, channels: 3, background: '#F4F1EB' } }).composite([
 { input: round, left: 39, top: 16 }, { input: tiny, left: 174, top: 160 }, { input: labelPng, left: 12, top: 207 },
 ]).png().toBuffer();
 tiles.push({ input: tile, left: (index % 7) * 238, top: 100 + Math.floor(index / 7) * 248 });
}
await writeFile(resolve(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const title = Buffer.from(`<svg width="1666" height="100"><rect width="1666" height="100" fill="#F4F1EB"/>${text('EasyPet / 61 marcas fictícias', 833, 52, 34, '#26313A', 1400)}${text('Recorte circular · miniatura de 44 px · ordem do manifest', 833, 80, 19, '#59615F', 1400)}</svg>`);
await sharp({ create: { width: 1666, height: 100 + Math.ceil(stores.length / 7) * 248, channels: 3, background: '#F4F1EB' } })
 .composite([{ input: title, left: 0, top: 0 }, ...tiles]).png().toFile(resolve(out, '_preview.png'));
console.log(`${manifest.length} logos únicos, 512×512 RGB opacos; SVGs em paths. Preview: ${resolve(out, '_preview.png')}`);
