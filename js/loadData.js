import { API_BASE_URL } from './config.js';
import { footballLoader, loaderOff, loaderOn, createStatsButtonsHTML } from './utils.js';
import { generateStatReport } from './reports.js';

// Crea la match card HTML
function createMatchCard(match) {
    const matchCard = document.createElement('div');
    matchCard.className = 'match-card';
    matchCard.setAttribute('data-key', match.id);

    const teamsDiv = document.createElement('div');
    teamsDiv.className = 'teams';
    teamsDiv.textContent = `${match.homeTeamName} - ${match.awayTeamName}`;

    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score';
    scoreDiv.textContent = match.status === 1
        ? new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : match.status === 3
            ? `${match.elapsed} ${match.homeScore} - ${match.awayScore}`
            : match.status === 6
                ? `${match.homeScore} - ${match.awayScore}`
                : "N/A";

    const expandedContent = document.createElement('div');
    expandedContent.className = 'expanded-content';

    const homeFormationDiv = document.createElement('div');
    homeFormationDiv.className = 'team-formation';

    const homeStatsButtons = document.createElement('div');
    homeStatsButtons.className = 'stats-buttons-column';
    homeStatsButtons.innerHTML = createStatsButtonsHTML('home', match.id);

    const awayFormationDiv = document.createElement('div');
    awayFormationDiv.className = 'team-formation';

    const awayStatsButtons = document.createElement('div');
    awayStatsButtons.className = 'stats-buttons-column';
    awayStatsButtons.innerHTML = createStatsButtonsHTML('away', match.id);

    expandedContent.appendChild(homeFormationDiv);
    expandedContent.appendChild(homeStatsButtons);
    expandedContent.appendChild(awayFormationDiv);
    expandedContent.appendChild(awayStatsButtons);

    matchCard.appendChild(teamsDiv);
    matchCard.appendChild(scoreDiv);
    matchCard.appendChild(expandedContent);

    matchCard.addEventListener('click', () => {
        matchCard.classList.toggle('expanded');

        if (matchCard.classList.contains('expanded')) {
            loadFormations(match.id, homeFormationDiv, awayFormationDiv, match.homeTeamName, match.awayTeamName);
        }
    });

    return matchCard;
}

// Carica le formazioni delle squadre e popola i div
function loadFormations(matchId, homeDiv, awayDiv, homeName, awayName) {
    loaderOn();

    Promise.all([
        fetch(`${API_BASE_URL}/match/${matchId}/team/home`).then(res => res.json()),
        fetch(`${API_BASE_URL}/match/${matchId}/team/away`).then(res => res.json())
    ])
    .then(([homeData, awayData]) => {
        homeDiv.innerHTML = `
            <span>${homeName} Formation:</span>
            <div class="radio-buttons">
                ${homeData.filter(p => p.stats && Object.keys(p.stats).length > 0).map(p => `
                    <label>
                        <input type="radio" name="homePlayer-${matchId}" value="${p.playerId}"> ${p.name}
                    </label>
                `).join('')}
            </div>
        `;

        awayDiv.innerHTML = `
            <span>${awayName} Formation:</span>
            <div class="radio-buttons">
                ${awayData.filter(p => p.stats && Object.keys(p.stats).length > 0).map(p => `
                    <label>
                        <input type="radio" name="awayPlayer-${matchId}" value="${p.playerId}"> ${p.name}
                    </label>
                `).join('')}
            </div>
        `;

        loaderOff();
    })
    .catch(error => {
        console.error('Errore nel caricamento formazioni:', error);
        loaderOff();
    });
}

// Funzione principale
export function loadMatchesByDate(date) {
    const matchContainer = document.getElementById('match-container');
    if (matchContainer) {
        matchContainer.innerHTML = '';
    }

    footballLoader();

    fetch(`${API_BASE_URL}/tournaments`)
        .then(response => response.json())
        .then(data => {
            window.tournaments = data.topTournaments;
            return fetch(`${API_BASE_URL}/matchesbydate/${date}`);
        })
        .then(response => response.json())
        .then(data => {
            const matchContainer = document.getElementById('match-container');

            data.tournaments.forEach(tournament => {
                if (window.tournaments.some(t => t.id === tournament.tournamentId)) {
                    const tournamentNameDiv = document.createElement('div');
                    tournamentNameDiv.className = 'tournament-name';
                    tournamentNameDiv.textContent = tournament.tournamentName;
                    matchContainer.appendChild(tournamentNameDiv);

                    tournament.matches.forEach(match => {
                        const matchCard = createMatchCard(match, tournament.tournamentName);
                        matchContainer.appendChild(matchCard);
                    });
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));

    document.addEventListener('click', (e) => {
        if (e.target.matches('.stat-btn')) {
            const stat = e.target.getAttribute('data-stat');
            const side = e.target.getAttribute('data-side');
            const matchId = e.target.getAttribute('data-match');
            generateStatReport(stat, side, matchId);
        }
    });
}
