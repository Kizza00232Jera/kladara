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
  '3':   { name: 'UEFA Champions League',               file: 'leagues/league_3_2025.json'   },
  '4':   { name: 'UEFA Europa League',                  file: 'leagues/league_4_2025.json'   },
  '32':  { name: '1st Division (Albania)',              file: 'leagues/league_32_2025.json'  },
  '34':  { name: 'Ligue 1 (Algeria)',                   file: 'leagues/league_34_2025.json'  },
  '35':  { name: 'Ligue 2 (Algeria)',                   file: 'leagues/league_35_2025.json'  },
  '37':  { name: '1a Divisió (Andorra)',                file: 'leagues/league_37_2025.json'  },
  '38':  { name: 'Girabola (Angola)',                   file: 'leagues/league_38_2025.json'  },
  '45':  { name: 'Premier League (Armenia)',            file: 'leagues/league_45_2025.json'  },
  '46':  { name: 'First League (Armenia)',              file: 'leagues/league_46_2025.json'  },
  '49':  { name: 'A-League Men (Australia)',            file: 'leagues/league_49_2025.json'  },
  '53':  { name: '2. Liga (Austria)',                   file: 'leagues/league_53_2025.json'  },
  '56':  { name: 'Bundesliga (Austria)',                file: 'leagues/league_56_2025.json'  },
  '57':  { name: 'Premyer Liqa (Azerbaijan)',           file: 'leagues/league_57_2025.json'  },
  '58':  { name: 'Birinci Dasta (Azerbaijan)',          file: 'leagues/league_58_2025.json'  },
  '63':  { name: 'First Division A (Belgium)',          file: 'leagues/league_63_2025.json'  },
  '65':  { name: 'Challenger Pro League (Belgium)',     file: 'leagues/league_65_2025.json'  },
  '71':  { name: '1st League (Bosnia)',                 file: 'leagues/league_71_2025.json'  },
  '70':  { name: 'Premijer Liga (Bosnia)',              file: 'leagues/league_70_2025.json'  },
  '111': { name: 'First League (Bulgaria)',             file: 'leagues/league_111_2025.json' },
  '124': { name: 'HNL (Croatia)',                        file: 'leagues/league_124_2025.json' },
  '126': { name: 'Third NL (Croatia)',                   file: 'leagues/league_126_2025.json' },
  '127': { name: 'First NL (Croatia)',                   file: 'leagues/league_127_2025.json' },
  '130': { name: '1. Division (Cyprus)',                 file: 'leagues/league_130_2025.json' },
  '134': { name: 'Czech Liga',                           file: 'leagues/league_134_2025.json' },
  '135': { name: 'Superliga (Denmark)',                  file: 'leagues/league_135_2025.json' },
  '138': { name: '1. Division (Denmark)',                file: 'leagues/league_138_2025.json' },
  '141': { name: 'Premier League (Egypt)',               file: 'leagues/league_141_2025.json' },
  '145': { name: 'League Two (England)',                 file: 'leagues/league_145_2025.json' },
  '146': { name: 'FA Cup (England)',                     file: 'leagues/league_146_2025.json' },
  '152': { name: 'Premier League (England)',             file: 'leagues/league_152_2025.json' },
  '153': { name: 'Championship (England)',               file: 'leagues/league_153_2025.json' },
  '154': { name: 'League One (England)',                 file: 'leagues/league_154_2025.json' },
  '160': { name: 'UEFA Conference League',               file: 'leagues/league_683_2025.json' },
  '164': { name: 'Ligue 2 (France)',                     file: 'leagues/league_164_2025.json' },
  '168': { name: 'Ligue 1 (France)',                     file: 'leagues/league_168_2025.json' },
  '171': { name: '2. Bundesliga (Germany)',              file: 'leagues/league_171_2025.json' },
  '175': { name: 'Bundesliga (Germany)',                 file: 'leagues/league_175_2025.json' },
  '176': { name: '3. Liga (Germany)',                    file: 'leagues/league_176_2025.json' },
  '178': { name: 'Super League 1 (Greece)',              file: 'leagues/league_178_2025.json' },
  '186': { name: 'Premier League (Hong Kong)',           file: 'leagues/league_186_2025.json' },
  '188': { name: 'NB II (Hungary)',                      file: 'leagues/league_188_2025.json' },
  '191': { name: 'NB I (Hungary)',                       file: 'leagues/league_191_2025.json' },
  '199': { name: 'Superliga (Denmark)',                  file: 'leagues/league_199_2025.json' },
  '205': { name: 'Coppa Italia',                         file: 'leagues/league_205_2025.json' },
  '206': { name: 'Serie B (Italy)',                      file: 'leagues/league_206_2025.json' },
  '207': { name: 'Serie A (Italy)',                      file: 'leagues/league_207_2025.json' },
  '221': { name: 'Super League (China)',                 file: 'leagues/league_221_2025.json' },
  '230': { name: 'First League (North Macedonia)',       file: 'leagues/league_230_2025.json' },
  '242': { name: 'Eliteserien (Norway)',                 file: 'leagues/league_242_2025.json' },
  '243': { name: 'Ekstraklasa (Poland)',                 file: 'leagues/league_243_2025.json' },
  '244': { name: 'Veikkausliiga (Finland)',              file: 'leagues/league_244_2025.json' },
  '245': { name: 'Eerste Divisie (Netherlands)',         file: 'leagues/league_245_2025.json' },
  '250': { name: 'Championship (Northern Ireland)',      file: 'leagues/league_250_2025.json' },
  '251': { name: 'Premiership (Northern Ireland)',       file: 'leagues/league_251_2025.json' },
  '259': { name: 'Ekstraklasa (Poland)',                 file: 'leagues/league_259_2025.json' },
  '263': { name: 'I Liga (Poland)',                      file: 'leagues/league_263_2025.json' },
  '266': { name: 'Primeira Liga (Portugal)',             file: 'leagues/league_266_2025.json' },
  '267': { name: 'Segunda Liga (Portugal)',              file: 'leagues/league_267_2025.json' },
  '271': { name: 'Liga II (Romania)',                    file: 'leagues/league_271_2025.json' },
  '272': { name: 'Liga I (Romania)',                     file: 'leagues/league_272_2025.json' },
  '274': { name: 'First League (Russia)',                file: 'leagues/league_274_2025.json' },
  '278': { name: 'Saudi League',                         file: 'leagues/league_278_2025.json' },
  '279': { name: 'Premiership (Scotland)',               file: 'leagues/league_279_2025.json' },
  '282': { name: 'Championship (Scotland)',              file: 'leagues/league_282_2025.json' },
  '287': { name: 'Prva Liga (Serbia)',                   file: 'leagues/league_287_2025.json' },
  '288': { name: 'Super Liga (Serbia)',                  file: 'leagues/league_288_2025.json' },
  '293': { name: '1. liga (Slovakia)',                   file: 'leagues/league_293_2025.json' },
  '294': { name: '2. SNL (Slovenia)',                    file: 'leagues/league_294_2025.json' },
  '296': { name: '1. SNL (Slovenia)',                    file: 'leagues/league_296_2025.json' },
  '300': { name: 'Copa del Rey (Spain)',                 file: 'leagues/league_300_2025.json' },
  '301': { name: 'Segunda División (Spain)',             file: 'leagues/league_301_2025.json' },
  '302': { name: 'La Liga (Spain)',                      file: 'leagues/league_302_2025.json' },
  '308': { name: 'Super League (Switzerland)',           file: 'leagues/league_308_2025.json' },
  '311': { name: '1. Liga Classic (Switzerland)',        file: 'leagues/league_311_2025.json' },
  '312': { name: 'Challenge League (Switzerland)',       file: 'leagues/league_312_2025.json' },
  '319': { name: '1. Lig (Turkey)',                      file: 'leagues/league_319_2025.json' },
  '322': { name: 'Süper Lig (Turkey)',                   file: 'leagues/league_322_2025.json' },
  '325': { name: 'Premier League (Ukraine)',             file: 'leagues/league_325_2025.json' },
  '328': { name: 'Pro League (UAE)',                     file: 'leagues/league_328_2025.json' },
  '341': { name: 'Premier League (Wales)',               file: 'leagues/league_341_2025.json' },
  '344': { name: 'Premier League (Russia)',              file: 'leagues/league_344_2025.json' },
  '399': { name: 'Srpska Liga (Serbia)',                 file: 'leagues/league_399_2025.json' },
  '523': { name: '1. Liga Promotion (Switzerland)',      file: 'leagues/league_523_2025.json' },
  '574': { name: 'Super League (Belgium)',               file: 'leagues/league_574_2025.json' },
  '683': { name: 'UEFA Conference League',               file: 'leagues/league_683_2025.json' },
  '694': { name: 'Liga Premier Serie B (Mexico)',        file: 'leagues/league_694_2025.json' },
  '7961':{ name: 'Second NL (Croatia)',                 file: 'leagues/league_7961_2025.json' },
  '8003':{ name: 'Copa Costa Rica',                     file: 'leagues/league_8003_2025.json' },
  '8102':{ name: 'USL Super League (USA)',              file: 'leagues/league_8102_2025.json' }
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
