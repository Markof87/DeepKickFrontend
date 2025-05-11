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
                loadFormations(match, homeFormationDiv, awayFormationDiv);
            }
        }
    });

    return matchCard;
}

// Carica le formazioni delle squadre e popola i div
function loadFormations(match, homeDiv, awayDiv) {
    loaderOn();

    fetch(`${API_BASE_URL}/match/${match.id}`).then(res => res.json())

        .then(data => {
            homeDiv.innerHTML = generateFieldPlayers(data, "home", match.id);
            awayDiv.innerHTML = generateFieldPlayers(data, "away", match.id);

            loaderOff();
            document.querySelectorAll('input[type="radio"]').forEach(input => {
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

function generateFieldPlayers(matchContext, teamSide, matchId) {

    const openDiv = `
        <div class="formation-pitch">
        <div class="pitch">
          <div class="half-line"></div>
          <div class="center-circle"></div>
          <div class="penalty-area left"></div>
          <div class="penalty-area right"></div>
          <div class="goal-area left"></div>
          <div class="goal-area right"></div>
          <div class="penalty-spot left"></div>
          <div class="penalty-spot right"></div>
          <div class="penalty-arc left"></div>
          <div class="penalty-arc right"></div>`;

    var stringPlayer = "";

    matchContext[teamSide].players.map((player) => {
        const playerIndex = matchContext[teamSide].formations[0].playerIds.indexOf(player.playerId);
        const playerPosition = matchContext[teamSide].formations[0].formationPositions[playerIndex];
        const orientation = teamSide == "home" ? "left" : "right";
        const direction = teamSide == "home" ? "bottom" : "top";

        if (playerPosition != undefined) {

            stringPlayer = stringPlayer + ` <label class="player-dot ${player.position.toLowerCase()}" style="${orientation}: ${playerPosition.vertical * 10}%; ${direction}: ${playerPosition.horizontal * 10 - 4}%">
                <input type="radio" name="${teamSide}Player-${matchId}" value="${player.playerId}" hidden>
                <div class="dot"></div>
                <span class="name">${player.name}</span>
            </label> `;
        }

    });
    const closeDiv = `
        </div>
        </div>
    `;

    return openDiv + stringPlayer + closeDiv;
}

export function loadStatsByTournamentSeason(tournamentId, season, stat_type, player) {
    const matchContainer = document.getElementById('match-container');
    if (matchContainer) {
        matchContainer.innerHTML = '';
    }

    loaderOn();

    const playerPath = player ? "/player" : "";
    fetch(`${API_BASE_URL}/datatable/teamseason_base_stats/tournament/${tournamentId}/season/${season}/type/${stat_type}${playerPath}`)
        .then(response => response.json())
        .then(data => {
            renderTable(data);
            loaderOff();
        })
        .catch(error => console.error('Error fetching data:', error));

}

function renderTable(data) {
    if (!data) {
        console.error("Data is not in the expected format:", data);
        return;
    }

    const teams = data["players_used"] == undefined ? Object.keys(data["age"]) : Object.keys(data["players_used"]);
    const columns = ["team"];

    function extractColumns(obj) {
        for (const key in obj) {
            if (JSON.stringify(Object.keys(obj[key])) == JSON.stringify(teams))
                columns.push(key);
            else {
                for (const subKey in obj[key]) {
                    columns.push(`${key}.${subKey}`);
                }
            }
        }
    }

    extractColumns(data);
    let tableData;

    tableData = teams.map(team => {
        const row = {};
        columns.forEach(col => {
            row[col] = getByPath(data, col, team);
        });
        return row;
    });

    generateTable(tableData, columns);

    const cyberFlagMinsInput = document.querySelector('#cyber-flag-mins_input');
    cyberFlagMinsInput.addEventListener('change', function () {
        const table = document.querySelector('.cyber-table');
        if (!table) return;

        const headers = Array.from(table.querySelectorAll('thead th'));
        let targetIdx = headers.findIndex(th => th.textContent.trim().toLowerCase() === '90s');
        let colName = '90s';
        if (targetIdx === -1) {
            targetIdx = headers.findIndex(th => th.textContent.trim().toLowerCase() === 'playing time.min');
            colName = 'Playing Time.Min';
        }

        if (targetIdx === -1) return; 
        
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (!cells[targetIdx]) return;
            const value = parseFloat(cells[targetIdx].textContent.replace(',', '.'));
            if(colName == '90s') {
                if (!isNaN(value) && value < 10) {
                    row.style.display = cyberFlagMinsInput.checked ? 'none' : 'table-row';
                }
            }
            else if (colName == 'Playing Time.Min') {
                if (!isNaN(value) && value < 900) {
                    row.style.display = cyberFlagMinsInput.checked ? 'none' : 'table-row';
                }
            }
        });

    });

    const cyberFlagAgeInput = document.querySelector('#cyber-flag-age_input');
    cyberFlagAgeInput.addEventListener('change', function () {
        const table = document.querySelector('.cyber-table');
        if (!table) return;

        const headers = Array.from(table.querySelectorAll('thead th'));
        const targetIdx = headers.findIndex(th => th.textContent.trim().toLowerCase() === 'age');

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (!cells[targetIdx]) return;
            const value = cells[targetIdx].textContent.trim();
            const age = parseInt(value.split('-')[0], 10); 
            if (age > 23) {
                row.style.display = cyberFlagAgeInput.checked ? 'none' : 'table-row';
            }
        });

    });

    const cyberFlagRoles = document.querySelector('#cyber-flag-roles');
    cyberFlagRoles.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', function () {
            const table = document.querySelector('.cyber-table');
            if (!table) return;

            const headers = Array.from(table.querySelectorAll('thead th'));
            const targetIdx = headers.findIndex(th => th.textContent.trim().toLowerCase() === 'pos');

            if (targetIdx === -1) return;

            const pos = this.value;

            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (!cells[targetIdx]) return;
                const value = cells[targetIdx].textContent.trim();
                if (value.includes(pos)) {
                    row.style.display = this.checked ? 'table-row' : 'none';
                }
            });
        });
    });

    cyberFlagAgeInput.addEventListener('change', function () {
        const table = document.querySelector('.cyber-table');
        if (!table) return;

        const headers = Array.from(table.querySelectorAll('thead th'));
        const targetIdx = headers.findIndex(th => th.textContent.trim().toLowerCase() === 'age');

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (!cells[targetIdx]) return;
            const value = cells[targetIdx].textContent.trim();
            const age = parseInt(value.split('-')[0], 10); 
            if (age > 23) {
                row.style.display = cyberFlagAgeInput.checked ? 'none' : 'table-row';
            }
        });

    });

    const cyberFlagPerNinetyInput = document.querySelector('#cyber-flag-90mins_input');
    cyberFlagPerNinetyInput.addEventListener('change', function () {
        const table = document.querySelector('.cyber-table');
        if (!table) return;

        const headerRow = document.querySelector('.cyber-table thead tr');
        if (!headerRow) return;

        const rows = table.querySelectorAll('tbody tr');
        const headerCells = headerRow.querySelectorAll('th');
        const indexNinety = Array.from(headerCells).findIndex(headerCell => headerCell.textContent.trim().toLowerCase() === '90s' || headerCell.textContent.trim().toLowerCase() === 'playing time.90s');
        if (indexNinety === -1) return;


        headerCells.forEach((headerCell, index) => {
            //devo dividere tutte le celle che hanno numeri per il numero che trovo in corrispondenza dell'header 90s o playing time.90s
            if (headerCell.textContent.trim().toLowerCase() === 'expected.npxg') {
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    const ninetyCell = cells[indexNinety];
                    const ninetyValue = parseFloat(ninetyCell.textContent.replace(',', '.'));
                    const cell = cells[index];
                    if (cell) {
                        const originalValue = parseFloat(cell.textContent.replace(',', '.'));
                        if (cyberFlagPerNinetyInput.checked)
                            cell.textContent = (originalValue / ninetyValue).toFixed(2);
                        else
                            cell.textContent = (originalValue * ninetyValue).toFixed(1);
                    }
                });
            }
        });
    });

}

function generateTable(tableData, columnsData, sortKey = null, sortAsc = true) {

    let sortKeyTable = null;
    let sortAscTable = false;

    d3.select("#cyber-table-container").selectAll("*").remove();

    const table = d3.select("#cyber-table-container")
        .append("table")
        .attr("class", "cyber-table")
        .style("width", "100%");

    // Intestazione
    const thead = table.append("thead");
    const trHead = thead.append("tr");
    trHead.selectAll("th")
        .data(columnsData)
        .enter()
        .append("th")
        .attr("class", d => "cyber-h cyber-glitch-2 sortable" + (sortKey === d ? (sortAsc ? " sorted-asc" : " sorted-desc") : ""))
        .text(d => d)
        .on("click", (event, d) => {
            if (sortKey == null)
                sortAscTable = false;
            else
                sortAscTable = !sortAsc;

            sortKeyTable = d;
            let tableDataSorted = sortByKey(tableData, sortKeyTable, sortAscTable);
            generateTable(tableDataSorted, columnsData, sortKeyTable, sortAscTable);
        });

    const tbody = table.append("tbody");
    const rows = tbody.selectAll("tr")
        .data(tableData)
        .enter()
        .append("tr");

    rows.selectAll("td")
        .data(row => columnsData.map(col => row[col]))
        .enter()
        .append("td")
        .text(d => d);

    function syncScrollbars() {
        const fake = document.querySelector('.cyber-scroll-fake');
        const real = document.querySelector('.cyber-table-container');
        fake.scrollLeft = real.scrollLeft;
        real.scrollLeft = fake.scrollLeft;
    }

    function updateFakeScrollbarWidth() {
        const table = document.querySelector('.cyber-table');
        const fakeDiv = document.querySelector('.cyber-scroll-fake > div');
        fakeDiv.style.width = table.scrollWidth + 'px';
    }

    document.querySelector('.cyber-scroll-fake').addEventListener('scroll', function () {
        document.querySelector('.cyber-table-container').scrollLeft = this.scrollLeft;
    });
    document.querySelector('.cyber-table-container').addEventListener('scroll', function () {
        document.querySelector('.cyber-scroll-fake').scrollLeft = this.scrollLeft;
    });

    window.addEventListener('resize', updateFakeScrollbarWidth);
    updateFakeScrollbarWidth();

}

function getByPath(obj, path, team) {
    if (path === "team") return team;
    const parts = path.split(".");
    let curr = obj;
    for (let part of parts) {
        curr = curr[part];
        if (!curr) return undefined;
    }
    return curr[team];
}

function filterTable() {
    const value = d3.select("#table-filter").property("value").toLowerCase();
    filteredData = tableData.filter(row =>
        columns.some(col => String(row[col.key]).toLowerCase().includes(value))
    );
    sortTable();
    renderTable(filteredData);
}

// Funzione di ordinamento
function sortByKey(data, key, ascending = true) {
    return data.slice().sort((a, b) => {
        const valA = a[key]
        const valB = b[key]

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return ascending ? valA - valB : valB - valA;
        }

        return ascending ?
            String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base' }) :
            String(valB).localeCompare(String(valA), undefined, { sensitivity: 'base' });
    });
}

// Event listener per filtro
//d3.select("#table-filter").on("input", filterTable);
