import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s,'utf8');
const changed=[];
const touch=(p,s)=>{if(fs.existsSync(p)){const old=read(p);if(old!==s){write(p,s);changed.push(p);}}};
if(fs.existsSync('preview/mobile-app.html')){let s=read('preview/mobile-app.html');s=s.replace('./install.html','./mobile-app-install.html');s=s.replace('./manifest.webmanifest','./mobile-app.webmanifest');touch('preview/mobile-app.html',s)}
if(fs.existsSync('preview/app.html')){let s=read('preview/app.html');s=s.replace('./phone.html','./mobile-app.html');s=s.replace('./install.html','./mobile-app-install.html');touch('preview/app.html',s)}
if(fs.existsSync('PROJECT_RULES.md')){let s=read('PROJECT_RULES.md');s=s.replace('- The mobile live entry is `preview/phone.html`.','- The primary mobile app is `preview/mobile-app.html`.');s=s.replace('- The installation helper page is `preview/install.html`.','- The primary install page is `preview/mobile-app-install.html`.');s=s.replace('- `preview/manifest.webmanifest` and `preview/icon.svg` are part of the official live mobile path.','- The dedicated manifest is `preview/mobile-app.webmanifest`.\n- `preview/icon.svg` is part of the official live mobile path.');touch('PROJECT_RULES.md',s)}
console.log(JSON.stringify({changed},null,2));
