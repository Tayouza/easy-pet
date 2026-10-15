import { chromium } from 'playwright';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { existsSync } from 'node:fs';
const root=path.dirname(fileURLToPath(import.meta.url));
await mkdir(path.join(root,'pdf'),{recursive:true});
const cache=path.join(os.homedir(),'.cache/ms-playwright');
const candidates=existsSync(cache)?(await readdir(cache)).filter(x=>/^chromium-/.test(x)).sort().reverse().map(x=>path.join(cache,x,'chrome-linux64/chrome')):[];
const executablePath=process.env.CHROMIUM_PATH || candidates.find(existsSync);
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
try {
 for(const file of (await readdir(path.join(root,'src'))).filter(f=>f.endsWith('.html')).sort()){
  const page=await browser.newPage();
  await page.goto(pathToFileURL(path.join(root,'src',file)).href);
  await page.evaluate(()=>document.fonts.ready);
  const meta=await page.evaluate(()=>({code:document.querySelector('meta[name=code]').content,title:document.querySelector('meta[name=title]').content,landscape:document.querySelector('meta[name=landscape]').content==='true',sections:document.querySelectorAll('.sheet').length}));
  const header=`<div style="font-family:Arial;font-size:8px;width:100%;margin:0 17mm;color:#555;border-bottom:1px solid #FF6B35;padding-bottom:5px">EasyPet · Porto Alegre–RS | ${meta.code} · ${meta.title} | Rev. 00 · 15/10/2026</div>`;
  const footer=`<div style="font-family:Arial;font-size:8px;width:100%;margin:0 17mm;color:#555;border-top:1px solid #ddd;padding-top:5px;display:flex;justify-content:space-between"><span>Cópia controlada — válida somente na versão eletrônica vigente</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`;
  await page.pdf({path:path.join(root,'pdf',file.replace('.html','.pdf')),format:'A4',landscape:meta.landscape,printBackground:true,displayHeaderFooter:true,headerTemplate:header,footerTemplate:footer,margin:{top:'23mm',bottom:'22mm',left:'17mm',right:'17mm'}});
  console.log(`${meta.code}: ${meta.sections} seções planejadas`);
  await page.close();
 }
} finally {await browser.close();}
