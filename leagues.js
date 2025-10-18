// Updated leagues.js for APIFootball JSON data
// === Team Name Normalization Helper ===

function normalizeTeamName(name) {
  if (!name) return '';
  let s = name.toLowerCase();
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');             // remove accents
  s = s.replace(/[^a-z0-9\s]/g, ' ');                                  // strip punctuation
  const tokens = ['cf','fc','real','sport','club','sc','ac','uefa','st'];
  tokens.forEach(t => s = s.replace(new RegExp('\\b'+t+'\\b','g'), ''));
  s = s.replace(/\s+/g, ' ').trim();                                   // collapse spaces
  return s;
}

function buildCanonicalMap(rawNames) {
  const map = {};
  rawNames.forEach(raw => {
    const key = normalizeTeamName(raw);
    if (!map[key]) map[key] = raw;  // first‐seen raw name wins
  });
  return map;
}



// JSON Files Configuration
const JSON_FILES = {
  '152': { name: 'Premier League (England)', file: 'leagues/league_152_2025.json' },
  '153': { name: 'Championship (England)', file: 'leagues/league_153_2025.json' },
  '175': { name: 'Bundesliga (Germany)', file: 'leagues/league_175_2025.json' },
  '176': { name: 'Bundesliga 2 (Germany)', file: 'leagues/league_176_2025.json' },
  '168': { name: 'Ligue 1 (France)', file: 'leagues/league_168_2025.json' },
  '169': { name: 'Ligue 2 (France)', file: 'leagues/league_169_2025.json' },
  '207': { name: 'Serie A (Italy)', file: 'leagues/league_207_2025.json' },
  '208': { name: 'Serie B (Italy)', file: 'leagues/league_208_2025.json' },
  '302': { name: 'La Liga (Spain)', file: 'leagues/league_302_2025.json' },
  '301': { name: 'Segunda División (Spain)', file: 'leagues/league_301_2025.json' },
  '235': { name: 'Super League (Greece)', file: 'leagues/league_235_2025.json' },
  '266': { name: 'Primeira Liga (Portugal)', file: 'leagues/league_266_2025.json' },
  '322': { name: 'Süper Lig (Turkey)', file: 'leagues/league_322_2025.json' },
  '144': { name: 'First Division A (Belgium)', file: 'leagues/league_144_2025.json' },
  '179': { name: 'Eredivisie (Netherlands)', file: 'leagues/league_179_2025.json' },
  '245': { name: 'Premiership (Scotland)', file: 'leagues/league_245_2025.json' },
  '230': { name: 'Primera División (Argentina)', file: 'leagues/league_230_2025.json' },
  '167': { name: 'Bundesliga (Austria)', file: 'leagues/league_167_2025.json' },
  '99': { name: 'Série A (Brazil)', file: 'leagues/league_99_2025.json' },
  '221': { name: 'Super League (China)', file: 'leagues/league_221_2025.json' },
  '199': { name: 'Superliga (Denmark)', file: 'leagues/league_199_2025.json' },
  '244': { name: 'Veikkausliiga (Finland)', file: 'leagues/league_244_2025.json' },
  '238': { name: 'Premier Division (Ireland)', file: 'leagues/league_238_2025.json' },
  '265': { name: 'J1 League (Japan)', file: 'leagues/league_265_2025.json' },
  '268': { name: 'Liga MX (Mexico)', file: 'leagues/league_268_2025.json' },
  '242': { name: 'Eliteserien (Norway)', file: 'leagues/league_242_2025.json' },
  '243': { name: 'Ekstraklasa (Poland)', file: 'leagues/league_243_2025.json' },
  '284': { name: 'Liga I (Romania)', file: 'leagues/league_284_2025.json' },
  '346': { name: 'Premier League (Russia)', file: 'leagues/league_346_2025.json' },
  '248': { name: 'Allsvenskan (Sweden)', file: 'leagues/league_248_2025.json' },
  '189': { name: 'Super League (Switzerland)', file: 'leagues/league_189_2025.json' },
  '253': { name: 'MLS (USA)', file: 'leagues/league_253_2025.json' }
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

// Load all league data from JSON files
async function loadAllLeagues() {
  try {
    isLoading = true;
    loadingElement.classList.remove('hidden');
    leaguesListElement.classList.add('hidden');
    
    console.log('Loading leagues data from JSON files...');

    for (const [leagueId, leagueInfo] of Object.entries(JSON_FILES)) {
      try {
        console.log(`Loading ${leagueInfo.name}...`);
        const response = await fetch(leagueInfo.file);
        
        if (!response.ok) {
          console.warn(`Could not load ${leagueInfo.file}: ${response.status}`);
          continue;
        }

        const matches = await response.json();
        
        // Extract unique team names from matches
        const teams = new Set();
        matches.forEach(match => {
          if (match.match_hometeam_name) teams.add(match.match_hometeam_name);
          if (match.match_awayteam_name) teams.add(match.match_awayteam_name);
        });

        leaguesData.push({
          id: leagueId,
          name: leagueInfo.name,
          filename: leagueInfo.file,
          teams: Array.from(teams).sort(),
          teamCount: teams.size,
          matchCount: matches.length
        });

        console.log(`Loaded ${leagueInfo.name}: ${teams.size} teams, ${matches.length} matches`);

      } catch (error) {
        console.warn(`Failed to load ${leagueInfo.file}:`, error);
      }
    }

    // Sort leagues alphabetically
    leaguesData.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Total leagues loaded: ${leaguesData.length}`);

    // Display leagues
    displayLeagues(leaguesData);

  } catch (error) {
    console.error('Error loading leagues:', error);
    loadingElement.innerHTML = `<p class="error">Failed to load league data</p>`;
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
  card.dataset.leagueId = league.id;
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

  const matchInfo = document.createElement('span');
  matchInfo.className = 'league-folder';
  matchInfo.textContent = `${league.matchCount} matches`;

  nameSection.appendChild(icon);
  nameSection.appendChild(name);
  nameSection.appendChild(matchInfo);

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
    const leagueId = card.dataset.leagueId;
    const teams = card.dataset.teams;
    const teamItems = card.querySelectorAll('.team-item');

    if (!searchTerm) {
      // Show all if search is empty
      card.classList.remove('hidden');
      card.classList.remove('expanded');
      teamItems.forEach(item => item.classList.remove('highlight'));
      visibleCount++;
    } else {
      // Check if league name or ID matches
      const leagueMatches = leagueName.includes(searchTerm) || leagueId.includes(searchTerm);
      
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
