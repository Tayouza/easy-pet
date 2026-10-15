import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const bundled=path.join(root,'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');
const ffmpeg=process.env.FFMPEG_PATH || (existsSync(bundled)?bundled:'ffmpeg');
const result=spawnSync(ffmpeg,[
 '-hide_banner','-loglevel','warning','-i',path.join(root,'out/easypet-vertical.mp4'),
 '-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-map','0:v:0','-map','1:a:0',
 '-c:v','libx264','-profile:v','baseline','-level:v','4.0','-pix_fmt','yuv420p',
 '-preset','fast','-crf','20','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',
 '-c:a','aac','-b:a','128k','-ar','48000','-movflags','+faststart','-shortest','-y',
 path.join(root,'out/easypet-vertical-mobile.mp4')
],{stdio:'inherit'});
if(result.error)throw result.error;
process.exit(result.status??1);
