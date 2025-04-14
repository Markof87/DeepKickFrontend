import { API_BASE_URL } from './config.js';
import { loaderOff, loaderOn } from './utils.js';

export function generateStatReport(stat, matchId, matchTeamId, matchTeamName, matchTeamOpponentName, matchPlayerId, matchPlayerName) {

    const event_name = stat.charAt(0).toUpperCase() + stat.slice(1).toLowerCase();
    var url = "";
    var name = "";

    if(matchPlayerId == 0) {
        url = API_BASE_URL + `/match/${matchId}/team/${matchTeamId}/event/${event_name}`;
        name = matchTeamName;
    }
    else{
        url = API_BASE_URL + `/match/${matchId}/player/${matchPlayerId}/event/${event_name}`;
        name = matchPlayerName;
    }

    const opponent = matchTeamOpponentName;
    console.log(name, opponent, event_name, url);

    loaderOn();

    fetch(`${API_BASE_URL}/matchreport`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, event_name, name, opponent })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            loaderOff();
            return response.json();
        })
        .then(data => {
            loaderOff();
            console.log('Report generated successfully:', data);
        })
        .catch(error => {
            loaderOff();
            console.error('Error generating report:', error);
        });

}