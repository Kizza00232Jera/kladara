// Updated find_bets.js for APIFootball JSON data
// Analyzes upcoming fixtures based on teams' recent form

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


// Configuration
const THRESHOLDS = {
  goals: [1.5, 2.5, 3.5, 4.5, 5.5],
  shots: [18.5, 19.5, 20.5, 21.5, 22.5, 23.5, 24.5, 25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 31.5],
  corners: [5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5],
  cards: [1.5, 2.5, 3.5, 4.5, 5.5, 6.5]
};

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
let allMatchesData = [];
let allFixturesData = [];
let isLoading = false;

// DOM elements
const form = document.getElementById('betFinderForm');
const fixtureDateInput = document.getElementById('fixtureDate');
const lastMatchesSelect = document.getElementById('lastMatches');
const categorySelect = document.getElementById('category');
const thresholdSelect = document.getElementById('threshold');
const overUnderSelect = document.getElementById('overUnder');
const minSuccessRateSelect = document.getElementById('minSuccessRate');
const findBetsBtn = document.getElementById('findBetsBtn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');
const errorMessage = document.getElementById('errorMessage');
const loadingStatus = document.getElementById('loadingStatus');
const loadingText = document.getElementById('loadingText');
const results = document.getElementById('results');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  setDefaultDate();
  loadAllData();
  setupEventListeners();
});

// Set default date to today
function setDefaultDate() {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  fixtureDateInput.value = formattedDate;
}

// Event listeners
function setupEventListeners() {
  form.addEventListener('submit', handleFormSubmit);
  categorySelect.addEventListener('change', updateThresholdOptions);
}

// Update threshold dropdown based on selected category
function updateThresholdOptions() {
  const selectedCategory = categorySelect.value;
  thresholdSelect.innerHTML = '<option value="">Select threshold</option>';
  
  if (selectedCategory && THRESHOLDS[selectedCategory]) {
    thresholdSelect.disabled = false;
    THRESHOLDS[selectedCategory].forEach(threshold => {
      const option = document.createElement('option');
      option.value = threshold;
      option.textContent = threshold;
      thresholdSelect.appendChild(option);
    });
  } else {
    thresholdSelect.disabled = true;
  }
}

// Load all data from JSON files
async function loadAllData() {
  try {
    showLoadingStatus('Loading match data from JSON files...');
    
    allMatchesData = [];
    allFixturesData = [];

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
          const matchDate = new Date(match.match_date);
          
          // Extract statistics
          const stats = match.statistics || [];
          const shotsHome = getStatValue(stats, 'Shots Total', 'home');
          const shotsAway = getStatValue(stats, 'Shots Total', 'away');
          const cornersHome = getStatValue(stats, 'Corners', 'home');
          const cornersAway = getStatValue(stats, 'Corners', 'away');
          const cardsHome = parseInt(getStatValue(stats, 'Yellow Cards', 'home')) + 
                           (parseInt(getStatValue(stats, 'Red Cards', 'home')) || 0);
          const cardsAway = parseInt(getStatValue(stats, 'Yellow Cards', 'away')) + 
                           (parseInt(getStatValue(stats, 'Red Cards', 'away')) || 0);

          const matchData = {
            date: matchDate,
            homeTeam: match.match_hometeam_name,
            awayTeam: match.match_awayteam_name,
            homeScore: parseInt(match.match_hometeam_score) || 0,
            awayScore: parseInt(match.match_awayteam_score) || 0,
            status: match.match_status,
            league: leagueInfo.name,
            leagueId: leagueId,
            // Calculate totals for betting criteria
            totalGoals: (parseInt(match.match_hometeam_score) || 0) + (parseInt(match.match_awayteam_score) || 0),
            totalShots: shotsHome + shotsAway,
            totalCorners: cornersHome + cornersAway,
            totalCards: cardsHome + cardsAway,
            matchId: match.match_id
          };

          if (match.match_status === 'Finished') {
            allMatchesData.push(matchData);
          } else if (match.match_status === '' || match.match_status === 'Not Started' || match.match_status === 'Scheduled') {
            allFixturesData.push(matchData);
          }
        });

        console.log(`✅ Loaded ${matches.length} events from ${leagueInfo.name}`);
      } catch (error) {
        console.warn(`Failed to load ${leagueInfo.file}:`, error);
      }
    }

    // Sort by date
    allMatchesData.sort((a, b) => a.date - b.date);
    allFixturesData.sort((a, b) => a.date - b.date);

    hideLoadingStatus();
    console.log(`✅ Loaded ${allMatchesData.length} historical matches and ${allFixturesData.length} fixtures`);

    if (allMatchesData.length === 0) {
      showError('No historical match data loaded. Please check your JSON files.');
    }
    if (allFixturesData.length === 0) {
      showError('No fixture data loaded. Please check your JSON files.');
    }

  } catch (error) {
    hideLoadingStatus();
    console.error('Error loading data:', error);
    showError('Failed to load data. Please ensure JSON files are available.');
  }
}

// Get statistic value from stats array
function getStatValue(stats, type, side) {
  const stat = stats.find(s => s.type === type);
  if (!stat) return 0;
  const value = parseInt(stat[side]) || 0;
  return value;
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  if (isLoading) return;

  const fixtureDate = fixtureDateInput.value;
  const lastMatches = parseInt(lastMatchesSelect.value);
  const category = categorySelect.value;
  const threshold = parseFloat(thresholdSelect.value);
  const overUnder = overUnderSelect.value;
  const minSuccessRate = parseInt(minSuccessRateSelect.value);

  // Validate inputs
  if (!fixtureDate || !category || !threshold || !overUnder) {
    showError('Please fill in all required fields');
    return;
  }

  if (allMatchesData.length === 0) {
    showError('No historical match data available. Please wait for data to load.');
    return;
  }

  if (allFixturesData.length === 0) {
    showError('No fixture data available.');
    return;
  }

  setLoading(true);
  hideError();

  try {
    const opportunities = analyzeFixturesForDate(fixtureDate, lastMatches, category, threshold, overUnder, minSuccessRate);
    renderResults(opportunities, fixtureDate, lastMatches, category, threshold, overUnder, minSuccessRate);
  } catch (error) {
    console.error('Analysis error:', error);
    showError('An error occurred during analysis. Please try again.');
  } finally {
    setLoading(false);
  }
}

// Analyze fixtures for a specific date
function analyzeFixturesForDate(fixtureDate, lastMatches, category, threshold, overUnder, minSuccessRate) {
  const targetDate = new Date(fixtureDate);
  const opportunities = [];

  console.log(`🔍 Looking for fixtures on ${fixtureDate}...`);

  const fixturesOnDate = allFixturesData.filter(fixture => {
    return fixture.date.toDateString() === targetDate.toDateString();
  });

  console.log(`📅 Found ${fixturesOnDate.length} fixtures for ${fixtureDate}`);

  if (fixturesOnDate.length === 0) {
    console.warn('No fixtures found for the selected date');
    return [];
  }

  fixturesOnDate.forEach(fixture => {
    try {
      const analysis = analyzeFixture(fixture, lastMatches, category, threshold, overUnder);
      
      if (analysis && analysis.combinedSuccessRate >= minSuccessRate) {
        opportunities.push({
          fixture: fixture,
          analysis: analysis,
          successRate: analysis.combinedSuccessRate
        });
        console.log(`✅ ${fixture.homeTeam} vs ${fixture.awayTeam}: ${analysis.combinedSuccessRate}% success rate`);
      } else if (analysis) {
        console.log(`❌ ${fixture.homeTeam} vs ${fixture.awayTeam}: ${analysis.combinedSuccessRate}% (below threshold)`);
      }
    } catch (error) {
      console.warn(`Error analyzing fixture ${fixture.homeTeam} vs ${fixture.awayTeam}:`, error);
    }
  });

  return opportunities.sort((a, b) => b.successRate - a.successRate);
}

// Analyze a single fixture
function analyzeFixture(fixture, lastMatches, category, threshold, overUnder) {
  const homeTeamMatches = getTeamLastMatches(fixture.homeTeam, lastMatches, fixture.date);
  const awayTeamMatches = getTeamLastMatches(fixture.awayTeam, lastMatches, fixture.date);

  if (homeTeamMatches.length < Math.min(3, lastMatches) || awayTeamMatches.length < Math.min(3, lastMatches)) {
    console.log(`⚠️ Not enough data for ${fixture.homeTeam} (${homeTeamMatches.length}) vs ${fixture.awayTeam} (${awayTeamMatches.length})`);
    return null;
  }

  const homeAnalysis = analyzeTeamMatches(homeTeamMatches, category, threshold, overUnder);
  const awayAnalysis = analyzeTeamMatches(awayTeamMatches, category, threshold, overUnder);
  const combinedMatches = [...homeTeamMatches, ...awayTeamMatches];
  const combinedAnalysis = analyzeTeamMatches(combinedMatches, category, threshold, overUnder);

  return {
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    league: fixture.league,
    homeAnalysis: homeAnalysis,
    awayAnalysis: awayAnalysis,
    combinedSuccessRate: combinedAnalysis.successRate,
    combinedSuccessCount: combinedAnalysis.successCount,
    totalMatches: combinedMatches.length,
    homeMatches: homeTeamMatches,
    awayMatches: awayTeamMatches
  };
}

// Get last N matches for a team before a specific date
function getTeamLastMatches(teamName, numMatches, beforeDate) {
  const teamMatches = allMatchesData.filter(match =>
    (match.homeTeam === teamName || match.awayTeam === teamName) && match.date < beforeDate
  );

  return teamMatches.sort((a, b) => a.date - b.date).slice(-numMatches);
}

// Analyze team matches for criteria
function analyzeTeamMatches(matches, category, threshold, overUnder) {
  const dataKey = `total${category.charAt(0).toUpperCase() + category.slice(1)}`;
  let successCount = 0;
  const matchResults = [];

  matches.forEach(match => {
    const value = match[dataKey];
    let isSuccess = false;

    if (overUnder === 'over' && value > threshold) {
      isSuccess = true;
      successCount++;
    } else if (overUnder === 'under' && value <= threshold) {
      isSuccess = true;
      successCount++;
    }

    matchResults.push({
      ...match,
      criteriaValue: value,
      isSuccess: isSuccess
    });
  });

  return {
    successCount: successCount,
    totalMatches: matches.length,
    successRate: matches.length > 0 ? Math.round((successCount / matches.length) * 100) : 0,
    matchResults: matchResults
  };
}

// Render results
function renderResults(opportunities, fixtureDate, lastMatches, category, threshold, overUnder, minSuccessRate) {
  results.innerHTML = '';
  results.classList.remove('hidden');

  const summaryCard = createSummaryCard(opportunities, fixtureDate, category, threshold, overUnder, minSuccessRate);
  results.appendChild(summaryCard);

  if (opportunities.length > 0) {
    opportunities.forEach(opportunity => {
      const card = createOpportunityCard(opportunity, category, threshold, overUnder);
      results.appendChild(card);
    });
  }

  setTimeout(() => {
    results.style.opacity = '1';
  }, 100);
}

// Create summary card
function createSummaryCard(opportunities, fixtureDate, category, threshold, overUnder, minSuccessRate) {
  const card = document.createElement('div');
  card.className = 'card fade-in';
  
  const header = document.createElement('div');
  header.className = 'card__header';
  header.innerHTML = `
    <i class="fas fa-chart-line"></i>
    <h3>Analysis Results</h3>
  `;
  
  const body = document.createElement('div');
  body.className = 'card__body';
  
  if (opportunities.length === 0) {
    body.innerHTML = `
      <div class="no-opportunities">
        <i class="fas fa-info-circle"></i>
        <p>No fixtures found for ${fixtureDate} that meet your criteria (${category} ${overUnder} ${threshold} with ${minSuccessRate}%+ success rate).</p>
        <p>Try adjusting your filters or selecting a different date.</p>
      </div>
    `;
  } else {
    body.innerHTML = `
      <div class="summary-stats">
        <div class="summary-stat">
          <i class="fas fa-calendar"></i>
          <div>
            <div class="stat-label">Date</div>
            <div class="stat-value">${fixtureDate}</div>
          </div>
        </div>
        <div class="summary-stat">
          <i class="fas fa-check-circle"></i>
          <div>
            <div class="stat-label">Opportunities Found</div>
            <div class="stat-value">${opportunities.length}</div>
          </div>
        </div>
        <div class="summary-stat">
          <i class="fas fa-bullseye"></i>
          <div>
            <div class="stat-label">Criteria</div>
            <div class="stat-value">${category.charAt(0).toUpperCase() + category.slice(1)} ${overUnder} ${threshold}</div>
          </div>
        </div>
        <div class="summary-stat">
          <i class="fas fa-percentage"></i>
          <div>
            <div class="stat-label">Min Success Rate</div>
            <div class="stat-value">${minSuccessRate}%</div>
          </div>
        </div>
      </div>
    `;
  }
  
  card.appendChild(header);
  card.appendChild(body);
  return card;
}

// Create opportunity card
function createOpportunityCard(opportunity, category, threshold, overUnder) {
  const card = document.createElement('div');
  card.className = 'card fade-in fixture-card';
  
  const analysis = opportunity.analysis;
  const fixture = opportunity.fixture;
  const successRateClass = analysis.combinedSuccessRate >= 90 ? 'excellent' : 
                          analysis.combinedSuccessRate >= 85 ? 'very-good' : 'good';
  
  const header = document.createElement('div');
  header.className = 'card__header';
  header.innerHTML = `
    <div class="fixture-header">
      <div class="fixture-teams">
        <h3>${fixture.homeTeam} vs ${fixture.awayTeam}</h3>
        <div class="fixture-info">
          <span class="fixture-league">${fixture.league}</span>
          <span class="fixture-date">${fixture.date}</span>
        </div>
      </div>
      <div class="success-badge ${successRateClass}">
        ${analysis.combinedSuccessRate}%
      </div>
    </div>
  `;
  
  const body = document.createElement('div');
  body.className = 'card__body';
  body.innerHTML = `
    <div class="team-analysis">
      <div class="team-section">
        <h4><i class="fas fa-home"></i> ${fixture.homeTeam} Form</h4>
        <div class="team-stats">
          <span class="team-success-rate ${analysis.homeAnalysis.successRate >= 80 ? 'good' : analysis.homeAnalysis.successRate >= 60 ? 'average' : 'poor'}">
            ${analysis.homeAnalysis.successCount}/${analysis.homeAnalysis.totalMatches} (${analysis.homeAnalysis.successRate}%)
          </span>
        </div>
        <div class="form-indicators">
          ${analysis.homeAnalysis.matchResults.map(match => {
            return `<span class="form-indicator ${match.isSuccess ? 'success' : 'fail'}" title="${match.homeTeam} vs ${match.awayTeam} (${match.date.toLocaleDateString()}): ${match.criteriaValue} ${category}">${match.isSuccess ? '✓' : '✗'}</span>`;
          }).join('')}
        </div>
      </div>
      
      <div class="team-section">
        <h4><i class="fas fa-plane"></i> ${fixture.awayTeam} Form</h4>
        <div class="team-stats">
          <span class="team-success-rate ${analysis.awayAnalysis.successRate >= 80 ? 'good' : analysis.awayAnalysis.successRate >= 60 ? 'average' : 'poor'}">
            ${analysis.awayAnalysis.successCount}/${analysis.awayAnalysis.totalMatches} (${analysis.awayAnalysis.successRate}%)
          </span>
        </div>
        <div class="form-indicators">
          ${analysis.awayAnalysis.matchResults.map(match => {
            return `<span class="form-indicator ${match.isSuccess ? 'success' : 'fail'}" title="${match.homeTeam} vs ${match.awayTeam} (${match.date.toLocaleDateString()}): ${match.criteriaValue} ${category}">${match.isSuccess ? '✓' : '✗'}</span>`;
          }).join('')}
        </div>
      </div>
    </div>
    
    <div class="combined-analysis">
      <h4><i class="fas fa-chart-line"></i> Combined Analysis</h4>
      <div class="combined-stats">
        <div class="stat-item">
          <span class="stat-label">Overall Success Rate:</span>
          <span class="stat-value">${analysis.combinedSuccessCount}/${analysis.totalMatches} matches (${analysis.combinedSuccessRate}%)</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Criteria:</span>
          <span class="stat-value">${category} ${overUnder} ${threshold}</span>
        </div>
      </div>
    </div>
  `;
  
  card.appendChild(header);
  card.appendChild(body);
  return card;
}


// Get color based on success rate
function getSuccessRateColor(rate) {
  if (rate >= 80) return '#10b981';
  if (rate >= 70) return '#3b82f6';
  if (rate >= 60) return '#f59e0b';
  return '#ef4444';
}

// Loading and error handling
function setLoading(loading) {
  isLoading = loading;
  findBetsBtn.disabled = loading;
  btnText.style.display = loading ? 'none' : 'inline';
  btnLoading.style.display = loading ? 'inline-block' : 'none';
}

function showLoadingStatus(message) {
  loadingStatus.classList.remove('hidden');
  loadingText.textContent = message;
}

function hideLoadingStatus() {
  loadingStatus.classList.add('hidden');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}
