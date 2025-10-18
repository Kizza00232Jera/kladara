// Team Analysis - Updated for JSON data from APIFootball

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

const THRESHOLDS = {
  goals: [1.5, 2.5, 3.5, 4.5],
  shots: [24.5],
  corners: [5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5],
  cards: [1.5, 2.5, 3.5, 4.5, 5.5, 6.5]
};

// Global variables
let allMatchesData = [];
let availableTeams = new Set();
let isLoading = false;

// DOM elements
const form = document.getElementById('inputForm');
const team1Input = document.getElementById('team1');
const team2Input = document.getElementById('team2');
const analyzeBtn = document.getElementById('analyzeBtn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');
const errorMessage = document.getElementById('errorMessage');
const results = document.getElementById('results');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadAllMatchData();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  form.addEventListener('submit', handleFormSubmit);
  setupAutocomplete(team1Input);
  setupAutocomplete(team2Input);
}

// Load all match data from JSON files
async function loadAllMatchData() {
  try {
    allMatchesData = [];
    availableTeams.clear();
    console.log('Loading match data from JSON files...');

    for (const [leagueId, leagueInfo] of Object.entries(JSON_FILES)) {
      try {
        console.log(`Loading ${leagueInfo.name}...`);
        const response = await fetch(leagueInfo.file);
        
        if (!response.ok) {
          console.warn(`Could not load ${leagueInfo.file}: ${response.status}`);
          continue;
        }

        const matches = await response.json();
        
        matches.forEach(match => {
          if (match.match_status === 'Finished') {
            const stats = match.statistics || [];
            
            const matchData = {
              date: new Date(match.match_date),
              dateString: match.match_date,
              homeTeam: match.match_hometeam_name,
              awayTeam: match.match_awayteam_name,
              fthg: parseInt(match.match_hometeam_score) || 0,
              ftag: parseInt(match.match_awayteam_score) || 0,
              hthg: parseInt(match.match_hometeam_halftime_score) || 0,
              htag: parseInt(match.match_awayteam_halftime_score) || 0,
              hs: getStatValue(stats, 'Shots Total', 'home'),
              as: getStatValue(stats, 'Shots Total', 'away'),
              hc: getStatValue(stats, 'Corners', 'home'),
              ac: getStatValue(stats, 'Corners', 'away'),
              hy: getStatValue(stats, 'Yellow Cards', 'home'),
              ay: getStatValue(stats, 'Yellow Cards', 'away'),
              league: leagueInfo.name
            };

            allMatchesData.push(matchData);
            availableTeams.add(match.match_hometeam_name);
            availableTeams.add(match.match_awayteam_name);
          }
        });

        console.log(`✅ Loaded ${matches.length} matches from ${leagueInfo.name}`);
      } catch (error) {
        console.warn(`Failed to load ${leagueInfo.file}:`, error);
      }
    }

    allMatchesData.sort((a, b) => a.date - b.date);
    console.log(`Total finished matches: ${allMatchesData.length}`);
    console.log(`Available teams: ${availableTeams.size}`);

  } catch (error) {
    console.error('Error loading match data:', error);
    showError('Failed to load match data. Please ensure JSON files are available.');
  }
}

// Get statistic value from stats array
function getStatValue(stats, type, side) {
  const stat = stats.find(s => s.type === type);
  if (!stat) return 0;
  return parseInt(stat[side]) || 0;
}

// Autocomplete functionality
function setupAutocomplete(inputElement) {
  let currentFocus = -1;

  inputElement.addEventListener('input', function() {
    const value = this.value;
    closeAllLists();
    currentFocus = -1;

    if (!value || value.length < 2) return;

    const matches = getMatchingTeams(value);
    if (matches.length === 0) return;

    const autocompleteList = document.createElement('div');
    autocompleteList.className = 'autocomplete-items';
    autocompleteList.id = this.id + '-autocomplete-list';
    this.parentNode.appendChild(autocompleteList);

    matches.forEach(team => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = team;
      item.addEventListener('click', function() {
        inputElement.value = team;
        closeAllLists();
      });
      autocompleteList.appendChild(item);
    });
  });

  function closeAllLists() {
    const items = document.getElementsByClassName('autocomplete-items');
    Array.from(items).forEach(item => item.parentNode.removeChild(item));
  }
}

function getMatchingTeams(searchTerm) {
  const search = searchTerm.toLowerCase();
  return Array.from(availableTeams)
    .filter(team => team.toLowerCase().includes(search))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 10);
}

// Get last N matches for a team
function getTeamLastMatches(teamName, numMatches = 5) {
  const teamMatches = allMatchesData.filter(match =>
    match.homeTeam === teamName || match.awayTeam === teamName
  );

  return teamMatches.slice(-numMatches).map(match => {
    const isHome = match.homeTeam === teamName;
    return {
      date: match.date,
      dateString: match.dateString,
      opponent: isHome ? match.awayTeam : match.homeTeam,
      location: isHome ? 'Home' : 'Away',
      teamGoals: isHome ? match.fthg : match.ftag,
      oppGoals: isHome ? match.ftag : match.fthg,
      teamShots: isHome ? match.hs : match.as,
      oppShots: isHome ? match.as : match.hs,
      teamCorners: isHome ? match.hc : match.ac,
      oppCorners: isHome ? match.ac : match.hc,
      teamCards: isHome ? match.hy : match.ay,
      oppCards: isHome ? match.ay : match.hy,
      league: match.league,
      originalMatch: match
    };
  });
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  if (isLoading) return;

  const team1 = team1Input.value.trim();
  const team2 = team2Input.value.trim();

  if (!team1 || !team2) {
    showError('Please enter both team names');
    return;
  }

  if (team1 === team2) {
    showError('Please enter different team names');
    return;
  }

  if (allMatchesData.length === 0) {
    showError('No match data available. Still loading...');
    return;
  }

  setLoading(true);
  hideError();

  try {
    const team1Matches = getTeamLastMatches(team1);
    const team2Matches = getTeamLastMatches(team2);

    if (team1Matches.length === 0) {
      showError(`Team "${team1}" not found. Try: ${Array.from(availableTeams).slice(0, 5).join(', ')}...`);
      return;
    }

    if (team2Matches.length === 0) {
      showError(`Team "${team2}" not found. Try: ${Array.from(availableTeams).slice(0, 5).join(', ')}...`);
      return;
    }

    const combinedMatches = [...team1Matches, ...team2Matches];
    const statistics = calculateStatistics(combinedMatches);

    renderResults({
      team1,
      team2,
      team1Matches,
      team2Matches,
      statistics
    });

  } catch (error) {
    console.error('Analysis error:', error);
    showError('An error occurred during analysis. Please try again.');
  } finally {
    setLoading(false);
  }
}

// Calculate statistics
function calculateStatistics(matches) {
  if (matches.length === 0) return {};

  const stats = {};
  const totalMatches = matches.length;

  const matchTotals = matches.map(match => ({
    totalGoals: match.originalMatch.fthg + match.originalMatch.ftag,
    totalShots: match.originalMatch.hs + match.originalMatch.as,
    totalCorners: match.originalMatch.hc + match.originalMatch.ac,
    totalCards: match.originalMatch.hy + match.originalMatch.ay
  }));

  ['goals', 'shots', 'corners', 'cards'].forEach(category => {
    const thresholds = THRESHOLDS[category];
    const dataKey = `total${category.charAt(0).toUpperCase() + category.slice(1)}`;

    thresholds.forEach(threshold => {
      const overCount = matchTotals.filter(m => m[dataKey] > threshold).length;
      const underCount = matchTotals.filter(m => m[dataKey] <= threshold).length;
      const overPct = (overCount / totalMatches) * 100;
      const underPct = (underCount / totalMatches) * 100;

      if (overPct >= 80) {
        stats[`${category}_over_${threshold}`] = `${overCount}/${totalMatches} (${Math.round(overPct)}%)`;
      }

      if (underPct >= 80) {
        stats[`${category}_under_${threshold}`] = `${underCount}/${totalMatches} (${Math.round(underPct)}%)`;
      }
    });
  });

  return stats;
}

// Render results
function renderResults(data) {
  const { team1, team2, team1Matches, team2Matches, statistics } = data;

  results.innerHTML = '';
  results.classList.remove('hidden');

  results.appendChild(createTeamCard(team1, team1Matches));
  results.appendChild(createTeamCard(team2, team2Matches));
  results.appendChild(createStatisticsCard(statistics));

  setTimeout(() => results.style.opacity = '1', 100);
}

// Create team card
function createTeamCard(teamName, matches) {
  const card = document.createElement('div');
  card.className = 'card fade-in';

  const header = document.createElement('div');
  header.className = 'card__header';
  header.innerHTML = `<h3><i class="fas fa-futbol"></i> ${teamName} - Last ${matches.length} Matches</h3>`;

  const body = document.createElement('div');
  body.className = 'card__body';

  if (matches.length === 0) {
    body.innerHTML = '<p>No matches found</p>';
  } else {
    body.appendChild(createMatchTable(matches));
  }

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

// Create match table
function createMatchTable(matches) {
  const table = document.createElement('table');
  table.className = 'match-table';

  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Opponent</th>
        <th>Location</th>
        <th>Score</th>
        <th>Goals</th>
        <th>Shots</th>
        <th>Corners</th>
        <th>Cards</th>
      </tr>
    </thead>
    <tbody>
      ${matches.map(m => `
        <tr>
          <td>${m.date.toLocaleDateString()}</td>
          <td>${m.opponent}</td>
          <td>${m.location}</td>
          <td>${m.teamGoals}-${m.oppGoals}</td>
          <td>${m.teamGoals + m.oppGoals}</td>
          <td>${m.teamShots + m.oppShots}</td>
          <td>${m.teamCorners + m.oppCorners}</td>
          <td>${m.teamCards + m.oppCards}</td>
        </tr>
      `).join('')}
    </tbody>
  `;

  return table;
}

// Create statistics card
function createStatisticsCard(statistics) {
  const card = document.createElement('div');
  card.className = 'card fade-in';

  const header = document.createElement('div');
  header.className = 'card__header';
  header.innerHTML = '<h3><i class="fas fa-chart-bar"></i> Combined Statistics (80%+ Trends)</h3>';

  const body = document.createElement('div');
  body.className = 'card__body';

  if (Object.keys(statistics).length === 0) {
    body.innerHTML = '<p>No significant trends found (80%+ occurrence)</p>';
  } else {
    const statsList = document.createElement('div');
    statsList.className = 'stats-list';

    Object.entries(statistics).forEach(([key, value]) => {
      const statItem = document.createElement('div');
      statItem.className = 'stat-item';

      const parts = key.split('_');
      const category = parts[0];
      const type = parts[1];
      const threshold = parts[2];

      statItem.innerHTML = `
        <span class="stat-label">${category.toUpperCase()} ${type} ${threshold}:</span>
        <span class="stat-value">${value}</span>
      `;
      statsList.appendChild(statItem);
    });

    body.appendChild(statsList);
  }

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

// Helper functions
function setLoading(loading) {
  isLoading = loading;
  analyzeBtn.disabled = loading;
  btnText.style.display = loading ? 'none' : 'inline';
  btnLoading.style.display = loading ? 'inline-block' : 'none';
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}
