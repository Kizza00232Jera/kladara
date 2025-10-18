// Leagues & Teams JavaScript
// This script loads all league CSV files and displays unique teams

// CSV Files Configuration (same as in app.js)
const CSV_FILES = [
    'leagues/main/E0.csv',
    'leagues/main/E1.csv',
    'leagues/main/D1.csv',
    'leagues/main/D2.csv',
    'leagues/main/F1.csv',
    'leagues/main/F2.csv',
    'leagues/main/I1.csv',
    'leagues/main/I2.csv',
    'leagues/main/SP1.csv',
    'leagues/main/SP2.csv',
    'leagues/main/G1.csv',
    'leagues/main/P1.csv',
    'leagues/main/T1.csv',
    'leagues/main/B1.csv',
    'leagues/main/N1.csv',
    'leagues/main/SC0.csv',
    'leagues/other2025/ARG2025.csv',
    'leagues/other2025/AUT2025.csv',
    'leagues/other2025/BRA2025.csv',
    'leagues/other2025/CHN2025.csv',
    'leagues/other2025/DNK2025.csv',
    'leagues/other2025/FIN2025.csv',
    'leagues/other2025/IRL2025.csv',
    'leagues/other2025/JPN2025.csv',
    'leagues/other2025/MEX2025.csv',
    'leagues/other2025/NOR2025.csv',
    'leagues/other2025/POL2025.csv',
    'leagues/other2025/ROU2025.csv',
    'leagues/other2025/RUS2025.csv',
    'leagues/other2025/SWE2025.csv',
    'leagues/other2025/SWZ2025.csv',
    'leagues/other2025/USA2025.csv',
];

// League name mappings
const LEAGUE_NAMES = {
    'E0': 'Premier League (England)',
    'E1': 'Championship (England)',
    'D1': 'Bundesliga (Germany)',
    'D2': 'Bundesliga 2 (Germany)',
    'F1': 'Ligue 1 (France)',
    'F2': 'Ligue 2 (France)',
    'I1': 'Serie A (Italy)',
    'I2': 'Serie B (Italy)',
    'SP1': 'La Liga (Spain)',
    'SP2': 'La Liga 2 (Spain)',
    'G1': 'Super League (Greece)',
    'P1': 'Primeira Liga (Portugal)',
    'T1': 'Super Lig (Turkey)',
    'B1': 'Jupiler Pro League (Belgium)',
    'N1': 'Eredivisie (Netherlands)',
    'SC0': 'Premiership (Scotland)',
    'ARG2025': 'Primera División (Argentina)',
    'AUT2025': 'Bundesliga (Austria)',
    'BRA2025': 'Série A (Brazil)',
    'CHN2025': 'Super League (China)',
    'DNK2025': 'Superliga (Denmark)',
    'FIN2025': 'Veikkausliiga (Finland)',
    'IRL2025': 'Premier Division (Ireland)',
    'JPN2025': 'J1 League (Japan)',
    'MEX2025': 'Liga MX (Mexico)',
    'NOR2025': 'Eliteserien (Norway)',
    'POL2025': 'Ekstraklasa (Poland)',
    'ROU2025': 'Liga I (Romania)',
    'RUS2025': 'Premier League (Russia)',
    'SWE2025': 'Allsvenskan (Sweden)',
    'SWZ2025': 'Super League (Switzerland)',
    'USA2025': 'MLS (USA)',
};

// Global variables
let leaguesData = [];
let isLoading = true;

// DOM elements
const loadingElement = document.getElementById('loading-leagues');
const leaguesListElement = document.getElementById('leagues-list');
const searchInput = document.getElementById('league-search');
const searchCount = document.getElementById('search-count');
const noResults = document.getElementById('no-results');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    loadAllLeagues();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterLeagues);
}

// Load all league data
async function loadAllLeagues() {
    try {
        isLoading = true;
        loadingElement.classList.remove('hidden');
        leaguesListElement.classList.add('hidden');

        console.log('Loading leagues data...');

        for (const filename of CSV_FILES) {
            try {
                console.log(`Loading ${filename}...`);
                const response = await fetch(filename);

                if (!response.ok) {
                    console.warn(`Could not load ${filename}: ${response.status}`);
                    continue;
                }

                const csvText = await response.text();
                const parsed = Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    transformHeader: header => header.trim()
                });

                // Extract unique team names
                const teams = new Set();
                parsed.data.forEach(row => {
                    const home = (
                        (row.HomeTeam ?? row.home_team ?? row.Home ?? row.home) || ''
                    ).trim();
                    const away = (
                        (row.AwayTeam ?? row.away_team ?? row.Away ?? row.away) || ''
                    ).trim();
                    if (home) teams.add(home);
                    if (away) teams.add(away);
                });


                // Get league code from filename
                const leagueCode = filename.split('/').pop().replace('.csv', '');
                const leagueName = LEAGUE_NAMES[leagueCode] || leagueCode;
                const folder = filename.includes('other2025') ? 'other2025' : 'main';

                leaguesData.push({
                    code: leagueCode,
                    name: leagueName,
                    folder: folder,
                    filename: filename,
                    teams: Array.from(teams).sort(),
                    teamCount: teams.size
                });

                console.log(`Loaded ${leagueName}: ${teams.size} teams`);
            } catch (error) {
                console.warn(`Failed to load ${filename}:`, error);
            }
        }

        // Sort leagues alphabetically
        leaguesData.sort((a, b) => a.name.localeCompare(b.name));

        console.log(`Total leagues loaded: ${leaguesData.length}`);

        // Display leagues
        displayLeagues(leaguesData);

    } catch (error) {
        console.error('Error loading leagues:', error);
        loadingElement.innerHTML = `
            <div class="error-message" style="display: block;">
                <i class="fas fa-exclamation-circle"></i>
                Failed to load league data. Please check that CSV files are available.
            </div>
        `;
    } finally {
        isLoading = false;
        loadingElement.classList.add('hidden');
    }
}

// Display leagues
function displayLeagues(leagues) {
    leaguesListElement.innerHTML = '';
    leaguesListElement.classList.remove('hidden');

    if (leagues.length === 0) {
        noResults.classList.remove('hidden');
        updateSearchCount(0, 0);
        return;
    }

    noResults.classList.add('hidden');

    leagues.forEach((league, index) => {
        const card = createLeagueCard(league, index);
        leaguesListElement.appendChild(card);
    });

    updateSearchCount(leagues.length, leaguesData.length);
}

// Create league card
function createLeagueCard(league, index) {
    const card = document.createElement('div');
    card.className = 'league-card';
    card.dataset.leagueName = league.name.toLowerCase();
    card.dataset.leagueCode = league.code.toLowerCase();

    // Store teams for searching
    card.dataset.teams = league.teams.map(t => t.toLowerCase()).join('|');

    // Determine background color based on index
    const bgColorIndex = (index % 8) + 1;
    card.style.setProperty('--league-bg', `var(--color-bg-${bgColorIndex})`);

    const header = document.createElement('div');
    header.className = 'league-header';
    header.onclick = () => toggleLeague(card);

    const nameSection = document.createElement('div');
    nameSection.className = 'league-name-section';

    const icon = document.createElement('i');
    icon.className = 'fas fa-trophy league-icon';

    const name = document.createElement('h3');
    name.className = 'league-name';
    name.textContent = league.name;

    const folder = document.createElement('span');
    folder.className = 'league-folder';
    folder.textContent = league.folder;

    nameSection.appendChild(icon);
    nameSection.appendChild(name);
    nameSection.appendChild(folder);

    const rightSection = document.createElement('div');
    rightSection.className = 'league-right-section';

    const count = document.createElement('span');
    count.className = 'team-count';
    count.innerHTML = `<i class="fas fa-users"></i> ${league.teamCount} teams`;

    const expandIcon = document.createElement('i');
    expandIcon.className = 'fas fa-chevron-down expand-icon';

    rightSection.appendChild(count);
    rightSection.appendChild(expandIcon);

    header.appendChild(nameSection);
    header.appendChild(rightSection);

    const teamsContainer = document.createElement('div');
    teamsContainer.className = 'teams-container';

    const teamsList = document.createElement('div');
    teamsList.className = 'teams-list';

    league.teams.forEach(team => {
        const teamItem = document.createElement('div');
        teamItem.className = 'team-item';
        teamItem.dataset.teamName = team.toLowerCase();

        const teamIcon = document.createElement('i');
        teamIcon.className = 'fas fa-shield-alt team-icon';

        const teamName = document.createElement('span');
        teamName.textContent = team;

        teamItem.appendChild(teamIcon);
        teamItem.appendChild(teamName);
        teamsList.appendChild(teamItem);
    });

    teamsContainer.appendChild(teamsList);

    card.appendChild(header);
    card.appendChild(teamsContainer);

    return card;
}

// Toggle league expansion
function toggleLeague(card) {
    card.classList.toggle('expanded');
}

// Filter leagues based on search
function filterLeagues() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const leagueCards = document.querySelectorAll('.league-card');
    let visibleCount = 0;

    leagueCards.forEach(card => {
        const leagueName = card.dataset.leagueName;
        const leagueCode = card.dataset.leagueCode;
        const teams = card.dataset.teams;
        const teamItems = card.querySelectorAll('.team-item');

        if (!searchTerm) {
            // Show all if search is empty
            card.classList.remove('hidden');
            card.classList.remove('expanded');
            teamItems.forEach(item => item.classList.remove('highlight'));
            visibleCount++;
        } else {
            // Check if league name or code matches
            const leagueMatches = leagueName.includes(searchTerm) || leagueCode.includes(searchTerm);

            // Check if any team matches
            const teamMatches = teams.includes(searchTerm);

            if (leagueMatches || teamMatches) {
                card.classList.remove('hidden');
                visibleCount++;

                // If team matches, expand card and highlight matching teams
                if (teamMatches) {
                    card.classList.add('expanded');
                    teamItems.forEach(item => {
                        if (item.dataset.teamName.includes(searchTerm)) {
                            item.classList.add('highlight');
                        } else {
                            item.classList.remove('highlight');
                        }
                    });
                } else if (leagueMatches) {
                    teamItems.forEach(item => item.classList.remove('highlight'));
                }
            } else {
                card.classList.add('hidden');
                card.classList.remove('expanded');
            }
        }
    });

    // Update UI
    if (visibleCount === 0) {
        noResults.classList.remove('hidden');
        leaguesListElement.classList.add('hidden');
    } else {
        noResults.classList.add('hidden');
        leaguesListElement.classList.remove('hidden');
    }

    updateSearchCount(visibleCount, leaguesData.length);
}

// Update search count display
function updateSearchCount(visible, total) {
    if (visible === total) {
        searchCount.textContent = `${total} leagues`;
    } else {
        searchCount.textContent = `${visible} of ${total} leagues`;
    }
}
