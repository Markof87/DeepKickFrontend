import { API_BASE_URL } from './config.js';
import { footballLoader, loaderOff, loaderOn, createStatsButtonsHTML, enableStatButtonFromRadio } from './utils.js';
import { generateStatReport } from './reports.js';

// Crea la match card HTML
function createMatchCard(match) {
    const matchCard = document.createElement('div');
    matchCard.className = 'match-card';
    matchCard.setAttribute('data-key', match.id);
    
    const matchHeader = document.createElement('div');
    matchHeader.className = 'match-header';

    const teamsDiv = document.createElement('div');
    teamsDiv.className = 'teams';
    teamsDiv.textContent = `${match.homeTeamName} - ${match.awayTeamName}`;

    const scoreButtonsDiv = document.createElement('div');
    scoreButtonsDiv.className = 'score-and-buttons';

    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score';
    scoreDiv.textContent = match.status === 1
        ? new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : match.status === 3
            ? `${match.elapsed} ${match.homeScore} - ${match.awayScore}`
            : match.status === 6
                ? `${match.homeScore} - ${match.awayScore}`
                : "N/A";

    const homeStatsButtons = document.createElement('div');
    homeStatsButtons.className = 'stats-buttons-row';
    homeStatsButtons.innerHTML = createStatsButtonsHTML('home', match.id, match.homeTeamId, match.homeTeamName, match.awayTeamName, true);

    const awayStatsButtons = document.createElement('div');
    awayStatsButtons.className = 'stats-buttons-row';
    awayStatsButtons.innerHTML = createStatsButtonsHTML('away', match.id, match.awayTeamId, match.awayTeamName, match.homeTeamName, true);

    scoreButtonsDiv.appendChild(scoreDiv);
    scoreButtonsDiv.appendChild(homeStatsButtons);
    scoreButtonsDiv.appendChild(awayStatsButtons);

    const expandedContent = document.createElement('div');
    expandedContent.className = 'expanded-content';

    const homeFormationDiv = document.createElement('div');
    homeFormationDiv.className = 'team-formation';

    const homeStatsButtonsPlayer = document.createElement('div');
    homeStatsButtonsPlayer.className = 'stats-buttons-column';
    homeStatsButtonsPlayer.innerHTML = createStatsButtonsHTML('home', match.id, match.homeTeamId, match.homeTeamName, match.awayTeamName, false);

    const awayFormationDiv = document.createElement('div');
    awayFormationDiv.className = 'team-formation';

    const awayStatsButtonsPlayer = document.createElement('div');
    awayStatsButtonsPlayer.className = 'stats-buttons-column';
    awayStatsButtonsPlayer.innerHTML = createStatsButtonsHTML('away', match.id, match.awayTeamId, match.awayTeamName, match.homeTeamName, false);

    expandedContent.appendChild(homeFormationDiv);
    expandedContent.appendChild(homeStatsButtonsPlayer);
    expandedContent.appendChild(awayFormationDiv);
    expandedContent.appendChild(awayStatsButtonsPlayer);

    matchCard.appendChild(teamsDiv);
    matchCard.appendChild(scoreButtonsDiv);
    matchCard.appendChild(expandedContent);
    matchCard.appendChild(matchHeader);

    matchCard.addEventListener('click', (event) => {
        if (event.target === matchCard || event.target.classList.contains('teams') || event.target.classList.contains('score-and-buttons')) {
            matchCard.classList.toggle('expanded');
            if (matchCard.classList.contains('expanded')) {
                loadFormations(match.id, homeFormationDiv, awayFormationDiv, match.homeTeamName, match.awayTeamName);
            }
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
            document.querySelectorAll('.radio-buttons input[type="radio"]').forEach(input => {
                input.addEventListener('change', enableStatButtonFromRadio);
            });            
            document.querySelectorAll('.stats-buttons-column').forEach(el => {
                el.style.display = 'flex';
            });
        })
        .catch(error => {
            console.error('Errore nel caricamento formazioni:', error);
            loaderOff();
        });
}

export function loadMatchesByDate(date) {
    console.log("Loading matches for date:", date);
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
        const statButton = e.target.closest('.stat-btn');
        if (statButton && statButton.closest('.stats-buttons-row')) {            
            const stat = e.target.getAttribute('data-stat');
            const matchId = e.target.getAttribute('data-match');
            const matchTeamId = e.target.getAttribute('data-match-team');
            const matchTeamName = e.target.getAttribute('data-match-team-name');
            const matchTeamOpponentName = e.target.getAttribute('data-match-team-opponent');
            generateStatReport(stat, matchId, matchTeamId, matchTeamName, matchTeamOpponentName, 0, "");
        }
    });
}
