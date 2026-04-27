let deferredPrompt = null;

const installBtn = document.getElementById('installBtn');
const installState = document.getElementById('installState');

function setState(text) {
  if (installState) installState.textContent = text;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function syncInstallState() {
  if (isStandalone()) {
    if (installBtn) installBtn.disabled = true;
    setState('האפליקציה כבר פתוחה כיישום מותקן. אפשר לחזור למסך הבית ולפתוח אותה מהאייקון.');
    return;
  }

  if (deferredPrompt) {
    if (installBtn) installBtn.disabled = false;
    setState('אפשר להתקין את האפליקציה בלחיצה על הכפתור.');
    return;
  }

  if (installBtn) installBtn.disabled = true;
  setState('אם הכפתור לא פעיל, פתח את תפריט הדפדפן ובחר "הוסף למסך הבית" או "התקן אפליקציה".');
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  syncInstallState();
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  if (installBtn) installBtn.disabled = true;
  setState('האפליקציה הותקנה בהצלחה. אפשר לפתוח אותה מהאייקון במסך הבית.');
});

window.addEventListener('DOMContentLoaded', syncInstallState);
window.addEventListener('pageshow', syncInstallState);

if (installBtn) {
  installBtn.disabled = true;
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      syncInstallState();
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    syncInstallState();
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('./sw.js', window.location.href)).catch(console.error);
}

syncInstallState();
console.log('mobile-app install flow ready');
