// Team Analysis - Updated for JSON data from APIFootball

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


const THRESHOLDS = {
    goals: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5],
    shots: [18.5, 19.5, 20.5, 21.5, 22.5, 23.5, 24.5, 25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 31.5],
    fouls: [18.5, 19.5, 20.5, 21.5, 22.5, 23.5, 24.5, 25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 31.5],
    shotsOnGoal: [5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5],
    corners: [0.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5],
    cards: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5],
    goalsht: [0.5, 1.5, 2.5, 3.5],
    cornersht: [0.5, 2.5, 3.5, 4.5, 5.5, 6.5],
    foulsht: [8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5],
    cardsht: [0.5, 1.5, 2.5],
    shotsht: [8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5],
    shotsOnGoalht: [2.5, 3.5, 4.5, 5.5, 6.5]
};


// Global variables
let allMatchesData = [];
let availableTeams = new Set();
let isLoading = false;


function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}


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
    // NEW FIELDS ADDED:
    hf: getStatValue(stats, 'Fouls', 'home'),
    af: getStatValue(stats, 'Fouls', 'away'),
    hsog: getStatValue(stats, 'Shots On Goal', 'home'),
    asog: getStatValue(stats, 'Shots On Goal', 'away'),
    league: leagueInfo.name
};

            // ===== FIX: Check for duplicates before adding =====
            const isDuplicate = allMatchesData.some(existing => 
              existing.homeTeam === matchData.homeTeam &&
              existing.awayTeam === matchData.awayTeam &&
              existing.dateString === matchData.dateString
            );

            if (!isDuplicate) {
              allMatchesData.push(matchData);
              availableTeams.add(match.match_hometeam_name);
              availableTeams.add(match.match_awayteam_name);
            } else {
              console.log(`⚠️ Duplicate match skipped: ${matchData.homeTeam} vs ${matchData.awayTeam} on ${matchData.dateString}`);
            }
            // ===== END FIX =====
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
            // NEW FIELDS:
            teamFouls: isHome ? match.hf : match.af,
            oppFouls: isHome ? match.af : match.hf,
            teamShotsOnGoal: isHome ? match.hsog : match.asog,
            oppShotsOnGoal: isHome ? match.asog : match.hsog,
            teamHalfGoals: isHome ? match.hthg : match.htag,
            oppHalfGoals: isHome ? match.htag : match.hthg,
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
  if (!matches.length) return {};
  const stats = {};
  const totalMatches = matches.length;

  // Build totals including fouls, SOG, and half-time stats
  const matchTotals = matches.map(m => ({
    totalGoals: m.originalMatch.fthg + m.originalMatch.ftag,
    totalShots: m.originalMatch.hs + m.originalMatch.as,
    totalCorners: m.originalMatch.hc + m.originalMatch.ac,
    totalCards: m.originalMatch.hy + m.originalMatch.ay,
    totalFouls: m.originalMatch.hf + m.originalMatch.af,
    totalShotsOnGoal: m.originalMatch.hsog + m.originalMatch.asog,
    totalGoalsht: m.originalMatch.hthg + m.originalMatch.htag,
    totalCornersht: Math.floor((m.originalMatch.hc + m.originalMatch.ac) / 2),
    totalFoulsht: Math.floor((m.originalMatch.hf + m.originalMatch.af) / 2),
    totalCardsht: Math.floor((m.originalMatch.hy + m.originalMatch.ay) / 2),
    totalShotsht: Math.floor((m.originalMatch.hs + m.originalMatch.as) / 2),
    totalShotsOnGoalht: Math.floor((m.originalMatch.hsog + m.originalMatch.asog) / 2)
  }));

  // Map category names to matchTotals keys
  const categoryMapping = {
    goals: 'totalGoals',
    shots: 'totalShots',
    corners: 'totalCorners',
    cards: 'totalCards',
    fouls: 'totalFouls',
    shotsOnGoal: 'totalShotsOnGoal',
    goalsht: 'totalGoalsht',
    cornersht: 'totalCornersht',
    foulsht: 'totalFoulsht',
    cardsht: 'totalCardsht',
    shotsht: 'totalShotsht',
    shotsOnGoalht: 'totalShotsOnGoalht'
  };

  // Iterate all categories from your THRESHOLDS config
  Object.keys(THRESHOLDS).forEach(category => {
    const dataKey = categoryMapping[category];
    const thresholds = THRESHOLDS[category];

    thresholds.forEach(threshold => {
      const overCount = matchTotals.filter(m => m[dataKey] > threshold).length;
      const underCount = totalMatches - overCount;
      const overPct = (overCount / totalMatches) * 100;
      const underPct = 100 - overPct;

      if (overPct >= 80) {
        stats[`${category}_over_${threshold}`] =
          `${overCount}/${totalMatches} (${Math.round(overPct)}%)`;
      }
      if (underPct >= 80) {
        stats[`${category}_under_${threshold}`] =
          `${underCount}/${totalMatches} (${Math.round(underPct)}%)`;
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
                <th>Loc</th>
                <th colspan="2">Goals</th>
                <th colspan="2">Shots</th>
                <th colspan="2">SOG</th>
                <th colspan="2">Corners</th>
                <th colspan="2">Cards</th>
                <th colspan="2">Fouls</th>
            </tr>
            <tr>
                <th></th>
                <th></th>
                <th></th>
                <th>FT</th>
                <th>HT</th>
                <th>FT</th>
                <th>HT</th>
                <th>FT</th>
                <th>HT</th>
                <th>FT</th>
                <th>HT</th>
                <th>FT</th>
                <th>HT</th>
                <th>FT</th>
                <th>HT</th>
            </tr>
        </thead>
        <tbody>
            ${matches.map(m => {
                // Calculate half-time estimates
                const totalCorners = m.teamCorners + m.oppCorners;
                const totalShots = m.teamShots + m.oppShots;
                const totalSOG = (m.teamShotsOnGoal || 0) + (m.oppShotsOnGoal || 0);
                const totalCards = m.teamCards + m.oppCards;
                const totalFouls = (m.teamFouls || 0) + (m.oppFouls || 0);
                
                return `
                <tr>
                    <td>${formatDate(m.dateString)}</td>
                    <td>${m.opponent}</td>
                    <td>${m.location}</td>
                    <td>${m.teamGoals}-${m.oppGoals}</td>
                    <td>${m.teamHalfGoals || 0}-${m.oppHalfGoals || 0}</td>
                    <td>${m.teamShots}-${m.oppShots}</td>
                    <td>${Math.floor(totalShots / 2)}</td>
                    <td>${m.teamShotsOnGoal || 0}-${m.oppShotsOnGoal || 0}</td>
                    <td>${Math.floor(totalSOG / 2)}</td>
                    <td>${m.teamCorners}-${m.oppCorners}</td>
                    <td>${Math.floor(totalCorners / 2)}</td>
                    <td>${m.teamCards}-${m.oppCards}</td>
                    <td>${Math.floor(totalCards / 2)}</td>
                    <td>${m.teamFouls || 0}-${m.oppFouls || 0}</td>
                    <td>${Math.floor(totalFouls / 2)}</td>
                </tr>
            `}).join('')}
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
  header.innerHTML = '<h2 class="card__title">Combined Statistics (80%+ Trends)</h2>';

  const body = document.createElement('div');
  body.className = 'card__body';

  if (!Object.keys(statistics).length) {
    body.innerHTML = '<p class="empty-state">No significant trends found (80%+ occurrence)</p>';
  } else {
    const statsList = document.createElement('div');
    statsList.className = 'stats-list';

    // Map for display names
    const categoryDisplayNames = {
      goals: 'Goals',
      shots: 'Shots',
      corners: 'Corners',
      cards: 'Cards',
      fouls: 'Fouls',
      shotsOnGoal: 'Shots On Goal',
      goalsht: 'Goals (HT)',
      cornersht: 'Corners (HT)',
      foulsht: 'Fouls (HT)',
      cardsht: 'Cards (HT)',
      shotsht: 'Shots (HT)',
      shotsOnGoalht: 'SOG (HT)'
    };

    Object.entries(statistics).forEach(([key, value]) => {
      // key example: "shotsOnGoal_over_10.5"
      const [category, type, threshold] = key.split('_');
      // category is always a string
      const displayCategory = categoryDisplayNames[category] || category.toUpperCase();

      const statItem = document.createElement('div');
      statItem.className = 'stat-item';
      statItem.innerHTML = `
        <span class="stat-label">${displayCategory} ${type} ${threshold}:</span>
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
