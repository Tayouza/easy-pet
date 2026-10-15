from pathlib import Path
import subprocess,json,re
from PIL import Image,ImageOps,ImageDraw
root=Path(__file__).resolve().parent
out=root/'evidencias'; out.mkdir(exist_ok=True)
result=[]; thumbs=[]
for pdf in sorted((root/'pdf').glob('*.pdf')):
    info=subprocess.check_output(['pdfinfo',str(pdf)],text=True)
    count=int(re.search(r'Pages:\s+(\d+)',info).group(1))
    pages=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True).split('\f')[:count]
    checks=[]
    for i,txt in enumerate(pages,1):
        checks.append({'pagina':i,'numeracao_ok':bool(re.search(fr'Página\s+{i}\s+de\s+{count}',txt)), 'aviso_ok':'Cópia controlada' in txt,'caracteres':len(txt.strip())})
    assert all(x['numeracao_ok'] and x['aviso_ok'] and x['caracteres']>250 for x in checks), checks
    for old in out.glob(pdf.stem+'-*.png'): old.unlink()
    subprocess.run(['pdftoppm','-scale-to','1100','-png',str(pdf),str(out/pdf.stem)],check=True)
    result.append({'arquivo':pdf.name,'paginas':count,'verificacoes':checks})
    for png in sorted(out.glob(pdf.stem+'-*.png')):
        im=Image.open(png).convert('RGB'); im.thumbnail((330,420))
        tile=Image.new('RGB',(360,455),'#e5e5e5');tile.paste(im,((360-im.width)//2,25))
        ImageDraw.Draw(tile).text((8,6),png.stem,fill='black');thumbs.append(tile)
canvas=Image.new('RGB',(360*4,455*((len(thumbs)+3)//4)),'white')
for i,t in enumerate(thumbs): canvas.paste(t,((i%4)*360,(i//4)*455))
canvas.save(out/'contato-paginas.png')
(out/'verificacao-pdfs.json').write_text(json.dumps({'emissao':'15/10/2026','metodo':'Poppler: texto, numeração, aviso e renderização de todas as páginas; inspeção visual separada','documentos':result},ensure_ascii=False,indent=2))
print('\n'.join(f"{r['arquivo']}: {r['paginas']} páginas" for r in result))
