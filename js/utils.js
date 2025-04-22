import { generateStatReport } from "./reports.js";

export function footballLoader() {
  const loader = document.getElementById('loader');
  let overlay = document.getElementById('overlay');


  if (!overlay) {
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

export function loaderOn() {
  const loader = document.getElementById('loader');
  const overlay = document.getElementById('overlay');
  loader.classList.remove('hidden');
  overlay.style.display = 'flex';
}

export function loaderOff() {
  const loader = document.getElementById('loader');
  const overlay = document.getElementById('overlay');
  loader.classList.add('hidden');
  overlay.style.display = 'none';
}

export function createStatsButtonsHTML(side, matchId, matchTeamId, matchTeamName, matchTeamOpponentName, isEnabled) {
  const stats = ['Pass', 'Shot', 'Tackle', 'Dribbling', 'Intercetti'];
  const classButtonName = isEnabled ? 'stat-btn' : 'stat-btn freezed';
  const idButton = isEnabled ? `${matchId}_${matchTeamId}` : `${matchId}_${matchTeamId}_player`;
  return stats.map(stat => `
      <button class="${classButtonName}" id="${idButton}_${stat}" data-stat="${stat.toLowerCase()}" data-side="${side}" data-match="${matchId}" 
      data-match-team="${matchTeamId}" data-match-team-name="${matchTeamName}" data-match-team-opponent="${matchTeamOpponentName}">
          ${stat}
      </button>
  `).join('');
}

export function enableStatButtonFromRadio(event) {

  console.log(event.target);
  const radio = event.target;
  
  const groupName = radio.name; 
  const matchId = groupName.split('-')[1];

  const side = groupName.startsWith('home') ? 'home' : 'away';

  const statButtons = document.querySelectorAll(`.stats-buttons-column .stat-btn[data-match="${matchId}"][data-side="${side}"]`);
  statButtons.forEach(button => {

    if(button.classList.contains('freezed')) {
      button.disabled = false;
      button.classList.remove('freezed');
    }

    button.setAttribute('data-player', radio.value);

    const labelElement = radio.closest('label');
    const labelText = labelElement ? labelElement.textContent.trim() : '';
    button.setAttribute('data-player-name', labelText);
    button.removeEventListener('click', handleStatButtonClick); 
    button.addEventListener('click', handleStatButtonClick); 
  });
}

function handleStatButtonClick(e) {
  const stat = e.target.getAttribute('data-stat');
  const matchId = e.target.getAttribute('data-match');
  const matchTeamId = e.target.getAttribute('data-match-team');
  const matchTeamName = e.target.getAttribute('data-match-team-name');
  const matchTeamOpponentName = e.target.getAttribute('data-match-team-opponent');
  const matchPlayerId = e.target.getAttribute('data-player');
  const matchPlayerName = e.target.getAttribute('data-player-name');
  generateStatReport(stat, matchId, matchTeamId, matchTeamName, matchTeamOpponentName, matchPlayerId, matchPlayerName);
}