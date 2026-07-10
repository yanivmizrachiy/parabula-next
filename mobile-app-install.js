const VERSION='mobile-hardening-20260710003';
let deferredPrompt=null;
const installBtn=document.getElementById('installBtn');
const installState=document.getElementById('installState');
const isStandalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;

function setState(text){
  if(installState) installState.textContent=text;
}
function setInstallEnabled(enabled){
  if(installBtn) installBtn.disabled=!enabled;
}

if(isStandalone){
  setInstallEnabled(false);
  setState('האפליקציה כבר פתוחה במצב מותקן.');
}else{
  setInstallEnabled(false);
  setState('אם הכפתור לא פעיל, פתח את תפריט הדפדפן ובחר "הוסף למסך הבית" או "התקן אפליקציה".');
}

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredPrompt=event;
  setInstallEnabled(true);
  setState('אפשר להתקין את האפליקציה בלחיצה על הכפתור.');
});

window.addEventListener('appinstalled',()=>{
  deferredPrompt=null;
  setInstallEnabled(false);
  setState('האפליקציה הותקנה בהצלחה. אפשר לפתוח אותה מהאייקון במסך הבית.');
});

installBtn?.addEventListener('click',async()=>{
  if(!deferredPrompt){
    setState('התקנה אוטומטית אינה זמינה כרגע. השתמש בתפריט הדפדפן ובחר "הוסף למסך הבית" או "התקן אפליקציה".');
    return;
  }

  deferredPrompt.prompt();
  const choice=await deferredPrompt.userChoice;
  deferredPrompt=null;
  setInstallEnabled(false);
  setState(choice.outcome==='accepted'
    ? 'בקשת ההתקנה אושרה.'
    : 'ההתקנה לא בוצעה. אפשר לנסות שוב דרך תפריט הדפדפן.');
});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register(`./sw.js?v=${VERSION}`,{updateViaCache:'none'}).then(reg=>{
    reg.update?.();
  }).catch(error=>{
    console.error('service worker registration failed',error);
    setState('האפליקציה פתוחה בדפדפן, אך עדכון ההתקנה לא הושלם.');
  });
}
