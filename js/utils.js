export function footballLoader(){
    const loader = document.getElementById('loader');
    let overlay = document.getElementById('overlay');
    

    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.50)';
      overlay.style.zIndex = 9998;
      overlay.style.pointerEvents = 'auto';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
    
      document.body.appendChild(overlay);
      overlay.appendChild(loader);  
    }      

    // Mostra sempre il loader e overlay
    loader.classList.remove('hidden');
    overlay.style.display = 'flex';

    // Disconnetti qualsiasi observer precedente, se esiste
    if (window._matchObserver) {
        window._matchObserver.disconnect();
    }

    // Crea nuovo observer e salvalo globalmente
    const observer = new MutationObserver(() => {
        const matchCards = document.querySelectorAll('.match-card');
        if (matchCards.length > 0) {
            loader.classList.add('hidden');
            overlay.style.display = 'none';
            observer.disconnect();
        }
    });

    observer.observe(document.getElementById('match-container'), { childList: true });

    // Salva observer globale
    window._matchObserver = observer;
}

export function loaderOn(){
  const loader = document.getElementById('loader');
  const overlay = document.getElementById('overlay');
  loader.classList.remove('hidden');
  overlay.style.display = 'flex';
}

export function loaderOff(){
  const loader = document.getElementById('loader');
  const overlay = document.getElementById('overlay');
  loader.classList.add('hidden');
  overlay.style.display = 'none';
}

export function createStatsButtonsHTML(side, matchId) {
  const stats = ['Passaggi', 'Tiri', 'Contrasti', 'Dribbling', 'Intercetti'];
  return stats.map(stat => `
      <button class="stat-btn" data-stat="${stat.toLowerCase()}" data-side="${side}" data-match="${matchId}">
          ${stat}
      </button>
  `).join('');
}