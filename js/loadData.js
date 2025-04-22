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

    scoreButtonsDiv.appendChild(scoreDiv);

    const topRow = document.createElement('div');
    topRow.className = 'top-row';
    topRow.appendChild(teamsDiv);
    topRow.appendChild(scoreButtonsDiv);

    const homeStatsDropdown = document.createElement('div');
    homeStatsDropdown.className = 'dropdown-container';
    homeStatsDropdown.innerHTML = `
        <div class="dropdown-trigger" onclick="toggleDropdown()">
            <span id="selected-label"><i>⇄</i> Passaggi</span>
            <span>▼</span>
        </div>
        <div class="dropdown-menu" id="dropdown-menu">
            <div class="dropdown-item" onclick="selectReport(this, '⇄', 'Passaggi')"><i>⇄</i> Passaggi</div>
            <div class="dropdown-item" onclick="selectReport(this, '🎯', 'Tiri')"><i>🎯</i> Tiri</div>
            <div class="dropdown-item" onclick="selectReport(this, '⚡', 'Contrasti')"><i>⚡</i> Contrasti</div>
            <div class="dropdown-item" onclick="selectReport(this, '🔥', 'xG nel tempo')"><i>🔥</i> xG nel tempo</div>
            <div class="dropdown-item" onclick="selectReport(this, '💥', 'xT nel tempo')"><i>💥</i> xT nel tempo</div>
            <div class="dropdown-item" onclick="selectReport(this, '🗺️', 'Heatmap')"><i>🗺️</i> Heatmap</div>
            <div class="dropdown-item" onclick="selectReport(this, '📊', 'Network Pass')"><i>📊</i> Network Pass</div>
            <div class="dropdown-item" onclick="selectReport(this, '📈', 'Rendimento')"><i>📈</i> Rendimento</div>
        </div>`;

    homeStatsDropdown.querySelector('.dropdown-trigger').addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdownMenu = homeStatsDropdown.querySelector('.dropdown-menu');
        dropdownMenu.classList.toggle('open');
    });

    homeStatsDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedLabel = homeStatsDropdown.querySelector('#selected-label');
            selectedLabel.innerHTML = item.innerHTML;
            homeStatsDropdown.querySelector('.dropdown-menu').classList.remove('show');
        });
    });

    const awayStatsDropdown = document.createElement('div');
    awayStatsDropdown.className = 'dropdown-container';
    awayStatsDropdown.innerHTML = `
        <div class="dropdown-trigger" onclick="toggleDropdown()">
            <span id="selected-label"><i>⇄</i> Passaggi</span>
            <span>▼</span>
        </div>
        <div class="dropdown-menu" id="dropdown-menu">
            <div class="dropdown-item" onclick="selectReport(this, '⇄', 'Passaggi')"><i>⇄</i> Passaggi</div>
            <div class="dropdown-item" onclick="selectReport(this, '🎯', 'Tiri')"><i>🎯</i> Tiri</div>
            <div class="dropdown-item" onclick="selectReport(this, '⚡', 'Contrasti')"><i>⚡</i> Contrasti</div>
            <div class="dropdown-item" onclick="selectReport(this, '🔥', 'xG nel tempo')"><i>🔥</i> xG nel tempo</div>
            <div class="dropdown-item" onclick="selectReport(this, '💥', 'xT nel tempo')"><i>💥</i> xT nel tempo</div>
            <div class="dropdown-item" onclick="selectReport(this, '🗺️', 'Heatmap')"><i>🗺️</i> Heatmap</div>
            <div class="dropdown-item" onclick="selectReport(this, '📊', 'Network Pass')"><i>📊</i> Network Pass</div>
            <div class="dropdown-item" onclick="selectReport(this, '📈', 'Rendimento')"><i>📈</i> Rendimento</div>
        </div>`;

        awayStatsDropdown.querySelector('.dropdown-trigger').addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdownMenu = awayStatsDropdown.querySelector('.dropdown-menu');
        dropdownMenu.classList.toggle('open');
    });

    awayStatsDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedLabel = awayStatsDropdown.querySelector('#selected-label');
            selectedLabel.innerHTML = item.innerHTML;
            awayStatsDropdown.querySelector('.dropdown-menu').classList.remove('show');
        });
    });

    const statsDropdown = document.createElement('div');
    statsDropdown.className = 'dropdowns-row';
    statsDropdown.appendChild(homeStatsDropdown);
    statsDropdown.appendChild(awayStatsDropdown);

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

    const matchContext = document.createElement('div');
    matchContext.className = 'match-context';
    matchContext.appendChild(topRow);
    matchContext.appendChild(statsDropdown);

    expandedContent.appendChild(homeFormationDiv);
    expandedContent.appendChild(homeStatsButtonsPlayer);
    expandedContent.appendChild(awayFormationDiv);
    expandedContent.appendChild(awayStatsButtonsPlayer);

    matchCard.appendChild(matchContext);
    matchCard.appendChild(expandedContent);
    matchCard.appendChild(matchHeader);

    matchCard.addEventListener('click', (event) => {
        if (event.target === matchCard || event.target.classList.contains('match-context')) {
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

                    const tournamentWrapper = document.createElement('div');
                    tournamentWrapper.className = 'tournament-wrapper';

                    const tournamentCard = document.createElement('div');
                    tournamentCard.className = 'tournament-card';

                    const tournamentHeader = document.createElement('div');
                    tournamentHeader.className = 'tournament-header';

                    const tournamentNameDiv = document.createElement('h2');
                    tournamentNameDiv.className = 'tournament-name';
                    tournamentNameDiv.textContent = tournament.tournamentName;

                    tournamentHeader.appendChild(tournamentNameDiv);
                    tournamentCard.appendChild(tournamentHeader);

                    const tournamentContent = document.createElement('div');
                    tournamentContent.className = 'tournament-content';

                    tournament.matches.forEach(match => {
                        const matchCard = createMatchCard(match, tournament.tournamentName);
                        tournamentContent.appendChild(matchCard);
                    });

                    tournamentCard.appendChild(tournamentContent);
                    tournamentWrapper.appendChild(tournamentCard);

                    matchContainer.appendChild(tournamentWrapper);
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
