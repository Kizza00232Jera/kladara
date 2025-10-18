// Find Bets - Football Stats Explorer JavaScript
// Analyzes upcoming fixtures based on teams' recent form

// Configuration
const THRESHOLDS = {
    goals: [1.5, 2.5, 3.5, 4.5, 5.5],
    shots: [18.5, 19.5, 20.5, 21.5, 22.5, 23.5, 24.5, 25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 31.5],
    corners: [5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5],
    cards: [1.5, 2.5, 3.5, 4.5, 5.5, 6.5]
};

// Historical league files based on your uploads
const HISTORICAL_FILES = [
    'leagues/main/B1.csv',
    'leagues/main/D1.csv',
    'leagues/main/D2.csv',
    'leagues/main/E0.csv',
    'leagues/main/E1.csv',
    'leagues/main/F1.csv',
    'leagues/main/F2.csv',
    'leagues/main/G1.csv',
    'leagues/main/I1.csv',
    'leagues/main/I2.csv', 
    'leagues/main/N1.csv',
    'leagues/main/P1.csv',
    'leagues/main/SC0.csv',
    'leagues/main/SP1.csv',
    'leagues/main/SP2.csv',
    'leagues/main/T1.csv'
];

// Fixture files based on your uploads
const FIXTURE_FILES = [
    'fixtures/premier_league.csv',
    'fixtures/ligue_1.csv',
    'fixtures/bundesliga.csv',
    'fixtures/serie_a.csv',
    'fixtures/la_liga.csv',
    'fixtures/primeira_liga.csv',
    'fixtures/eredivisie.csv',
    'fixtures/super_lig.csv',
    'fixtures/mls.csv'
];

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

// Load all data (historical matches and fixtures)
async function loadAllData() {
    try {
        showLoadingStatus('Loading historical match data...');
        await loadHistoricalData();
        
        showLoadingStatus('Loading fixture data...');
        await loadFixtureData();
        
        hideLoadingStatus();
        console.log(`✅ Loaded ${allMatchesData.length} historical matches and ${allFixturesData.length} fixtures`);
        
        if (allMatchesData.length === 0) {
            showError('No historical match data loaded. Please check if your CSV files are in the leagues/main/ folder.');
        }
        
        if (allFixturesData.length === 0) {
            showError('No fixture data loaded. Please check if your CSV files are in the fixtures/ folder.');
        }
        
    } catch (error) {
        hideLoadingStatus();
        console.error('Error loading data:', error);
        showError('Failed to load data. Please ensure CSV files are available.');
    }
}

// Load historical match data
async function loadHistoricalData() {
    allMatchesData = [];
    
    for (const filename of HISTORICAL_FILES) {
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

            if (parsed.errors.length > 0) {
                console.warn(`Parsing errors in ${filename}:`, parsed.errors.slice(0, 3));
            }

            // Process historical matches (E0.csv format)
            const validRows = parsed.data.filter(row => {
                return row.Date && row.HomeTeam && row.AwayTeam && 
                       row.FTHG !== undefined && row.FTAG !== undefined &&
                       row.HS !== undefined && row.AS !== undefined &&
                       row.HC !== undefined && row.AC !== undefined &&
                       row.HY !== undefined && row.AY !== undefined;
            });

            validRows.forEach(row => {
                try {
                    const parsedDate = parseHistoricalDate(row.Date);
                    if (!parsedDate) return;

                    const matchData = {
                        date: parsedDate,
                        dateString: row.Date,
                        homeTeam: row.HomeTeam,
                        awayTeam: row.AwayTeam,
                        fthg: parseInt(row.FTHG) || 0,
                        ftag: parseInt(row.FTAG) || 0,
                        hs: parseInt(row.HS) || 0,
                        as: parseInt(row.AS) || 0,
                        hc: parseInt(row.HC) || 0,
                        ac: parseInt(row.AC) || 0,
                        hy: parseInt(row.HY) || 0,
                        ay: parseInt(row.AY) || 0,
                        league: getLeagueName(filename),
                        sourceFile: filename,
                        // Calculate totals for betting criteria
                        totalGoals: (parseInt(row.FTHG) || 0) + (parseInt(row.FTAG) || 0),
                        totalShots: (parseInt(row.HS) || 0) + (parseInt(row.AS) || 0),
                        totalCorners: (parseInt(row.HC) || 0) + (parseInt(row.AC) || 0),
                        totalCards: (parseInt(row.HY) || 0) + (parseInt(row.AY) || 0)
                    };

                    allMatchesData.push(matchData);
                } catch (error) {
                    console.warn(`Error processing row in ${filename}:`, error);
                }
            });

            console.log(`✅ Loaded ${validRows.length} matches from ${filename}`);

        } catch (error) {
            console.warn(`❌ Failed to load ${filename}:`, error.message);
        }
    }

    // Sort all matches by date
    allMatchesData.sort((a, b) => a.date - b.date);
    console.log(`📊 Total historical matches loaded: ${allMatchesData.length}`);
}

// Load fixture data
async function loadFixtureData() {
    allFixturesData = [];
    
    for (const filename of FIXTURE_FILES) {
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

            if (parsed.errors.length > 0) {
                console.warn(`Parsing errors in ${filename}:`, parsed.errors.slice(0, 3));
            }

            // Process fixture data
            const validRows = parsed.data.filter(row => {
                return row.Date && row['Home Team'] && row['Away Team'];
            });

            validRows.forEach(row => {
                try {
                    const parsedDate = parseFixtureDate(row.Date);
                    if (!parsedDate) return;

                    const fixtureData = {
                        date: parsedDate,
                        dateString: row.Date,
                        homeTeam: row['Home Team'],
                        awayTeam: row['Away Team'],
                        league: getLeagueName(filename),
                        sourceFile: filename,
                        location: row.Location || '',
                        matchNumber: row['Match Number'] || '',
                        result: row.Result || ''
                    };

                    allFixturesData.push(fixtureData);
                } catch (error) {
                    console.warn(`Error processing fixture row in ${filename}:`, error);
                }
            });

            console.log(`✅ Loaded ${validRows.length} fixtures from ${filename}`);

        } catch (error) {
            console.warn(`❌ Failed to load fixture file ${filename}:`, error.message);
        }
    }

    // Sort fixtures by date
    allFixturesData.sort((a, b) => a.date - b.date);
    console.log(`📅 Total fixtures loaded: ${allFixturesData.length}`);
}

// Parse historical date (dd/mm/yyyy format)
function parseHistoricalDate(dateString) {
    try {
        if (!dateString) return null;
        
        // Handle dd/mm/yyyy format from historical data
        const dateParts = dateString.split('/');
        if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
            let year = parseInt(dateParts[2]);
            
            // Handle 2-digit years
            if (year < 50) {
                year += 2000;
            } else if (year < 100) {
                year += 1900;
            }
            
            const date = new Date(year, month, day);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Parse fixture date (dd/mm/yyyy hh:mm format)
function parseFixtureDate(dateString) {
    try {
        if (!dateString) return null;
        
        // Handle "dd/mm/yyyy hh:mm" format from fixture data
        const dateTimeParts = dateString.split(' ');
        const datePart = dateTimeParts[0];
        const dateParts = datePart.split('/');
        
        if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const year = parseInt(dateParts[2]);
            
            const date = new Date(year, month, day);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Get league name from filename
function getLeagueName(filename) {
    const leagueMap = {
        'E0': 'Premier League',
        'E1': 'Championship', 
        'D1': 'Bundesliga',
        'D2': '2. Bundesliga',
        'F1': 'Ligue 1',
        'F2': 'Ligue 2',
        'B1': 'Belgian Pro League',
        'G1': 'Super League Greece',
        'premier_league': 'Premier League',
        'ligue_1': 'Ligue 1',
        'bundesliga': 'Bundesliga',
        'serie_a': 'Serie A',
        'la_liga': 'La Liga',
        'primeira_liga': 'Primeira Liga',
        'eredivisie': 'Eredivisie',
        'super_lig': 'Süper Lig',
        'mls': 'MLS'
    };
    
    const key = filename.split('/').pop().replace('.csv', '');
    return leagueMap[key] || key.toUpperCase();
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
        showError('No fixture data available. Please ensure fixture CSV files are in the fixtures folder.');
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

    // Find all fixtures for the target date
    const fixturesOnDate = allFixturesData.filter(fixture => {
        return fixture.date.toDateString() === targetDate.toDateString();
    });

    console.log(`📅 Found ${fixturesOnDate.length} fixtures for ${fixtureDate}`);

    if (fixturesOnDate.length === 0) {
        console.warn('No fixtures found for the selected date');
        return [];
    }

    // Analyze each fixture
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
                console.log(`❌ ${fixture.homeTeam} vs ${fixture.awayTeam}: ${analysis.combinedSuccessRate}% success rate (below threshold)`);
            }
        } catch (error) {
            console.warn(`Error analyzing fixture ${fixture.homeTeam} vs ${fixture.awayTeam}:`, error);
        }
    });

    // Sort by success rate descending
    return opportunities.sort((a, b) => b.successRate - a.successRate);
}

// Analyze a single fixture
function analyzeFixture(fixture, lastMatches, category, threshold, overUnder) {
    // Get last matches for both teams
    const homeTeamMatches = getTeamLastMatches(fixture.homeTeam, lastMatches, fixture.date);
    const awayTeamMatches = getTeamLastMatches(fixture.awayTeam, lastMatches, fixture.date);

    if (homeTeamMatches.length < Math.min(3, lastMatches) || awayTeamMatches.length < Math.min(3, lastMatches)) {
        console.log(`⚠️  Not enough data for ${fixture.homeTeam} (${homeTeamMatches.length}) vs ${fixture.awayTeam} (${awayTeamMatches.length})`);
        return null; // Not enough data
    }

    // Analyze each team's form
    const homeAnalysis = analyzeTeamMatches(homeTeamMatches, category, threshold, overUnder);
    const awayAnalysis = analyzeTeamMatches(awayTeamMatches, category, threshold, overUnder);

    // Calculate combined analysis
    const combinedMatches = [...homeTeamMatches, ...awayTeamMatches];
    const combinedAnalysis = analyzeTeamMatches(combinedMatches, category, threshold, overUnder);

    return {
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
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
        (match.homeTeam === teamName || match.awayTeam === teamName) &&
        match.date < beforeDate
    );

    // Sort by date and get the last N matches
    return teamMatches
        .sort((a, b) => a.date - b.date)
        .slice(-numMatches);
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

    // Summary card
    const summaryCard = createSummaryCard(opportunities, fixtureDate, lastMatches, category, threshold, overUnder, minSuccessRate);
    results.appendChild(summaryCard);

    // Opportunity cards
    if (opportunities.length > 0) {
        opportunities.forEach(opportunity => {
            const card = createOpportunityCard(opportunity, category, threshold, overUnder);
            results.appendChild(card);
        });
    }

    // Fade in animation
    setTimeout(() => {
        results.style.opacity = '1';
    }, 100);
}

// Create summary card
function createSummaryCard(opportunities, fixtureDate, lastMatches, category, threshold, overUnder, minSuccessRate) {
    const card = document.createElement('div');
    card.className = 'card fade-in';

    const header = document.createElement('div');
    header.className = 'card__header';
    header.innerHTML = `
        <h2><i class="fas fa-calendar-check"></i> Fixture Analysis Results</h2>
        <p class="card__subtitle">
            ${fixtureDate} - ${category} ${overUnder} ${threshold} with ${minSuccessRate}%+ success rate
        </p>
    `;

    const body = document.createElement('div');
    body.className = 'card__body';

    if (opportunities.length === 0) {
        body.innerHTML = `
            <div class="no-opportunities">
                <i class="fas fa-calendar-times"></i>
                <h3>No Opportunities Found</h3>
                <p>No fixtures found for ${fixtureDate} that meet your criteria.</p>
                <div class="suggestions">
                    <h4>Suggestions:</h4>
                    <ul>
                        <li>Try a different date</li>
                        <li>Lower the minimum success rate</li>
                        <li>Adjust the threshold or category</li>
                        <li>Reduce the number of last matches required</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        body.innerHTML = `
            <div class="summary-stats">
                <div class="stat-box">
                    <div class="stat-number">${opportunities.length}</div>
                    <div class="stat-label">Qualifying Fixtures</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${Math.max(...opportunities.map(o => o.successRate))}%</div>
                    <div class="stat-label">Best Success Rate</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${lastMatches}</div>
                    <div class="stat-label">Matches per Team</div>
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
                    <span class="fixture-date">${fixture.dateString}</span>
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
                        return `<span class="form-indicator ${match.isSuccess ? 'success' : 'fail'}" 
                                      title="${match.homeTeam} vs ${match.awayTeam} (${match.dateString}): ${match.criteriaValue}">
                                    ${match.isSuccess ? '✓' : '✗'}
                                </span>`;
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
                        return `<span class="form-indicator ${match.isSuccess ? 'success' : 'fail'}" 
                                      title="${match.homeTeam} vs ${match.awayTeam} (${match.dateString}): ${match.criteriaValue}">
                                    ${match.isSuccess ? '✓' : '✗'}
                                </span>`;
                    }).join('')}
                </div>
            </div>
        </div>
        
        <div class="combined-analysis">
            <h4><i class="fas fa-chart-line"></i> Combined Analysis</h4>
            <div class="combined-stats">
                <div class="stat-item">
                    <span class="stat-label">Overall Success Rate</span>
                    <span class="stat-value">${analysis.combinedSuccessCount}/${analysis.totalMatches} matches (${analysis.combinedSuccessRate}%)</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Criteria</span>
                    <span class="stat-value">${category} ${overUnder} ${threshold}</span>
                </div>
            </div>
        </div>
    `;

    card.appendChild(header);
    card.appendChild(body);
    return card;
}

// Utility functions
function setLoading(loading) {
    isLoading = loading;
    if (loading) {
        findBetsBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
    } else {
        findBetsBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
    }
}

function showLoadingStatus(message) {
    if (loadingText && loadingStatus) {
        loadingText.textContent = message;
        loadingStatus.classList.remove('hidden');
    }
}

function hideLoadingStatus() {
    if (loadingStatus) {
        loadingStatus.classList.add('hidden');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}