// Football Stats Explorer - Main Application Logic (Updated for Multi-CSV Support)

// Configuration and data
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
    'leagues/other2025/ARG.csv',
    'leagues/other2025/AUT.csv',
    'leagues/other2025/BRA.csv',
    'leagues/other2025/CHN.csv',
    'leagues/other2025/DNK.csv',
    'leagues/other2025/FIN.csv',
    'leagues/other2025/IRL.csv',
    'leagues/other2025/JPN.csv',
    'leagues/other2025/MEX.csv',
    'leagues/other2025/NOR.csv',
    'leagues/other2025/POL.csv',
    'leagues/other2025/ROU.csv',
    'leagues/other2025/RUS.csv',
    'leagues/other2025/SWE.csv',
    'leagues/other2025/SWZ.csv',
    'leagues/other2025/USA.csv',
];

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

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  loadAllCSVData();
  setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);

    // Setup autocomplete for both team inputs
    setupAutocomplete(team1Input);
    setupAutocomplete(team2Input);
}

// Autocomplete functionality
function setupAutocomplete(inputElement) {
    let currentFocus = -1;
    let autocompleteList = null;

    // Input event - show suggestions
    inputElement.addEventListener('input', function() {
        const value = this.value;
        closeAllLists();
        currentFocus = -1;

        // Only show suggestions after 3 characters
        if (!value || value.length < 3) return;

        // Get matching teams (case-insensitive)
        const matches = getMatchingTeams(value);
        
        if (matches.length === 0) return;

        // Create autocomplete container
        autocompleteList = document.createElement('div');
        autocompleteList.className = 'autocomplete-items';
        autocompleteList.id = this.id + '-autocomplete-list';
        this.parentNode.appendChild(autocompleteList);

        // Add each matching team
        matches.forEach((team, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            
            // Highlight matching part
            const matchIndex = team.toLowerCase().indexOf(value.toLowerCase());
            const beforeMatch = team.substring(0, matchIndex);
            const match = team.substring(matchIndex, matchIndex + value.length);
            const afterMatch = team.substring(matchIndex + value.length);
            
            item.innerHTML = `${beforeMatch}<strong>${match}</strong>${afterMatch}`;
            item.dataset.value = team;
            
            // Click event
            item.addEventListener('click', function() {
                inputElement.value = this.dataset.value;
                closeAllLists();
            });
            
            autocompleteList.appendChild(item);
        });
    });

    // Keyboard navigation
    inputElement.addEventListener('keydown', function(e) {
        let items = document.getElementById(this.id + '-autocomplete-list');
        if (items) items = items.getElementsByClassName('autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus++;
            addActive(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus--;
            addActive(items);
        } else if (e.key === 'Enter') {
            if (currentFocus > -1 && items) {
                e.preventDefault();
                items[currentFocus].click();
            }
        } else if (e.key === 'Escape') {
            closeAllLists();
        }
    });

    // Make items active
    function addActive(items) {
        if (!items) return false;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        items[currentFocus].classList.add('autocomplete-active');
        items[currentFocus].scrollIntoView({ block: 'nearest' });
    }

    // Remove active class
    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('autocomplete-active');
        }
    }

    // Close all autocomplete lists
    function closeAllLists(element) {
        const items = document.getElementsByClassName('autocomplete-items');
        for (let i = 0; i < items.length; i++) {
            if (element !== items[i] && element !== inputElement) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
        currentFocus = -1;
    }

    // Close lists when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== inputElement) {
            closeAllLists(e.target);
        }
    });
}

// Get matching teams (case-insensitive)
function getMatchingTeams(searchTerm) {
    const search = searchTerm.toLowerCase();
    const teams = Array.from(availableTeams);
    
    // Find teams that include the search term
    const matches = teams.filter(team => 
        team.toLowerCase().includes(search)
    );
    
    // Sort: exact matches first, then starts with, then contains
    matches.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        
        // Exact match
        if (aLower === search) return -1;
        if (bLower === search) return 1;
        
        // Starts with
        if (aLower.startsWith(search) && !bLower.startsWith(search)) return -1;
        if (bLower.startsWith(search) && !aLower.startsWith(search)) return 1;
        
        // Alphabetical
        return a.localeCompare(b);
    });
    
    // Return max 10 results
    return matches.slice(0, 10);
}



// Load and parse all CSV data
async function loadAllCSVData() {
  try {
    allMatchesData = [];
    availableTeams.clear();

    console.log('Loading CSV files...');

    for (const filename of CSV_FILES) {
      try {
        console.log(`Attempting to load ${filename}...`);
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
          console.warn(`Parsing errors in ${filename}:`, parsed.errors);
        }

        // Filter and process valid rows
        const validRows = parsed.data.filter(row => {
          const requiredFields = ['Date', 'HomeTeam', 'AwayTeam', 'FTHG', 'FTAG', 'HTHG', 'HTAG', 'HS', 'AS', 'HC', 'AC', 'HY', 'AY'];
          return requiredFields.every(field => row[field] !== undefined && row[field] !== '');
        });

        // Process each valid row
        validRows.forEach(row => {
          try {
            // Parse date from dd/mm/yy or dd/mm/yyyy format
            const dateParts = row.Date.split('/');
            let year = parseInt(dateParts[2]);

            // Handle 2-digit years (assume 20xx for years < 50, 19xx for years >= 50)
            if (year < 50) {
              year += 2000;
            } else if (year < 100) {
              year += 1900;
            }

            const parsedDate = new Date(year, parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

            if (isNaN(parsedDate.getTime())) {
              console.warn(`Invalid date in ${filename}:`, row.Date);
              return;
            }

            const matchData = {
              // Original data
              div: row.Div || filename.replace('.csv', ''),
              date: parsedDate,
              dateString: row.Date,
              time: row.Time || '',
              homeTeam: row.HomeTeam,
              awayTeam: row.AwayTeam,
              fthg: parseInt(row.FTHG) || 0,
              ftag: parseInt(row.FTAG) || 0,
              hthg: parseInt(row.HTHG) || 0,
              htag: parseInt(row.HTAG) || 0,
              htr: row.HTR || '',
              hs: parseInt(row.HS) || 0,
              as: parseInt(row.AS) || 0,
              hc: parseInt(row.HC) || 0,
              ac: parseInt(row.AC) || 0,
              hy: parseInt(row.HY) || 0,
              ay: parseInt(row.AY) || 0,
              sourceFile: filename
            };

            allMatchesData.push(matchData);

            // Add teams to available teams set
            availableTeams.add(row.HomeTeam);
            availableTeams.add(row.AwayTeam);

          } catch (error) {
            console.warn(`Error processing row in ${filename}:`, error, row);
          }
        });

        console.log(`Loaded ${validRows.length} matches from ${filename}`);

      } catch (error) {
        console.warn(`Failed to load ${filename}:`, error);
      }
    }

    console.log(`Total matches loaded: ${allMatchesData.length}`);
    console.log(`Available teams: ${availableTeams.size}`);

    // Sort all matches by date
    allMatchesData.sort((a, b) => a.date - b.date);

  } catch (error) {
    console.error('Error loading CSV data:', error);
    showError('Failed to load match data. Please ensure CSV files are available.');
  }
}

// Get last N matches for a team across all CSV files
function getTeamLastMatches(teamName, numMatches = 5) {
  if (!teamName) return [];

// Case-insensitive team name matching
const teamNameLower = teamName.toLowerCase();

// Find all matches where the team played (either home or away)
const teamMatches = allMatchesData.filter(match => 
    match.homeTeam.toLowerCase() === teamNameLower || 
    match.awayTeam.toLowerCase() === teamNameLower
);


  if (teamMatches.length === 0) {
    return [];
  }

  // Sort by date and get the last N matches
  const sortedMatches = teamMatches.sort((a, b) => a.date - b.date);
  const lastMatches = sortedMatches.slice(-numMatches);

  // Process each match to get team-specific data
  return lastMatches.map(match => {
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
      teamHTGoals: isHome ? match.hthg : match.htag,
      oppHTGoals: isHome ? match.htag : match.hthg,
      htScore: `${isHome ? match.hthg : match.htag}-${isHome ? match.htag : match.hthg}`,
      division: match.div,
      sourceFile: match.sourceFile,
      // Original match data for statistics
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

  // Validate inputs
  if (!team1 || !team2) {
    showError('Please enter both team names');
    return;
  }

  if (team1 === team2) {
    showError('Please enter different team names');
    return;
  }

  // Check if data is loaded
  if (allMatchesData.length === 0) {
    showError('No match data available. Please ensure CSV files are in the same directory.');
    return;
  }

  setLoading(true);
  hideError();

  try {
    // Find matches for both teams
    const team1Matches = getTeamLastMatches(team1);
    const team2Matches = getTeamLastMatches(team2);

    // Validate teams exist
    if (team1Matches.length === 0) {
      showError(`Team "${team1}" not found in any CSV files. Available teams: ${Array.from(availableTeams).slice(0, 10).join(', ')}...`);
      return;
    }

    if (team2Matches.length === 0) {
      showError(`Team "${team2}" not found in any CSV files. Available teams: ${Array.from(availableTeams).slice(0, 10).join(', ')}...`);
      return;
    }

    // Combine matches for statistical analysis
    const combinedMatches = [...team1Matches, ...team2Matches];
    const statistics = calculateStatistics(combinedMatches);

    // Render results
    renderResults({
      team1: team1,
      team2: team2,
      team1Matches: team1Matches,
      team2Matches: team2Matches,
      statistics: statistics
    });

  } catch (error) {
    console.error('Analysis error:', error);
    showError('An error occurred during analysis. Please try again.');
  } finally {
    setLoading(false);
  }
}

// Calculate statistics from combined matches
function calculateStatistics(matches) {
  if (matches.length === 0) return {};

  const stats = {};
  const totalMatches = matches.length;

  // Calculate totals for each match
  const matchTotals = matches.map(match => ({
    totalGoals: match.originalMatch.fthg + match.originalMatch.ftag,
    totalShots: match.originalMatch.hs + match.originalMatch.as,
    totalCorners: match.originalMatch.hc + match.originalMatch.ac,
    totalCards: match.originalMatch.hy + match.originalMatch.ay
  }));

  // Analyze each category
  ['goals', 'shots', 'corners', 'cards'].forEach(category => {
    const thresholds = THRESHOLDS[category];
    const dataKey = `total${category.charAt(0).toUpperCase() + category.slice(1)}`;

    thresholds.forEach(threshold => {
      const overCount = matchTotals.filter(match => match[dataKey] > threshold).length;
      const underCount = matchTotals.filter(match => match[dataKey] <= threshold).length;
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

// Render results to DOM
function renderResults(data) {
  const { team1, team2, team1Matches, team2Matches, statistics } = data;

  results.innerHTML = '';
  results.classList.remove('hidden');

  // Team 1 Card
  const team1Card = createTeamCard(team1, team1Matches);
  results.appendChild(team1Card);

  // Team 2 Card
  const team2Card = createTeamCard(team2, team2Matches);
  results.appendChild(team2Card);

  // Statistics Card
  const statsCard = createStatisticsCard(statistics);
  results.appendChild(statsCard);

  // Fade in animation
  setTimeout(() => {
    results.style.opacity = '1';
  }, 100);
}

// Create team card with match table
function createTeamCard(teamName, matches) {
  const card = document.createElement('div');
  card.className = 'card fade-in';

  const header = document.createElement('div');
  header.className = 'card__header';
  header.innerHTML = `
    <h3 class="card__title">${teamName} - Last ${matches.length} Matches</h3>
  `;

  const body = document.createElement('div');
  body.className = 'card__body';

  if (matches.length === 0) {
    body.innerHTML = '<p class="text-muted">No matches found</p>';
  } else {
    const table = createMatchTable(matches);
    body.appendChild(table);
  }

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

// Create match table
function createMatchTable(matches) {
  const table = document.createElement('table');
  table.className = 'match-table';

  // Table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Date</th>
      <th>Opponent</th>
      <th>Venue</th>
      <th>Goals</th>
      <th>Shots</th>
      <th>Corners</th>
      <th>Cards</th>
      <th>HT Score</th>
      <th>League</th>
    </tr>
  `;

  // Table body
  const tbody = document.createElement('tbody');
  matches.forEach(match => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(match.date)}</td>
      <td>${match.opponent}</td>
      <td>
        <span class="badge badge--${match.location.toLowerCase()}">${match.location}</span>
      </td>
      <td>
        <div class="goals-cell">
          <span class="team-stat">${match.teamGoals}</span>
          <span class="separator">-</span>
          <span class="opp-stat">${match.oppGoals}</span>
        </div>
      </td>
      <td>
        <div class="stats-cell">
          <span class="team-stat">${match.teamShots}</span>
          <span class="separator">-</span>
          <span class="opp-stat">${match.oppShots}</span>
        </div>
      </td>
      <td>
        <div class="stats-cell">
          <span class="team-stat">${match.teamCorners}</span>
          <span class="separator">-</span>
          <span class="opp-stat">${match.oppCorners}</span>
        </div>
      </td>
      <td>
        <div class="stats-cell">
          <span class="team-stat">${match.teamCards}</span>
          <span class="separator">-</span>
          <span class="opp-stat">${match.oppCards}</span>
        </div>
      </td>
      <td>${match.htScore}</td>
      <td>
        <span class="league-badge" title="${match.sourceFile}">${match.division}</span>
      </td>
    </tr>
  `;
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
}

// Create statistics card
function createStatisticsCard(statistics) {
  const card = document.createElement('div');
  card.className = 'card fade-in';

  const header = document.createElement('div');
  header.className = 'card__header';
  header.innerHTML = `
    <h3 class="card__title">Statistical Trends (80%+ Occurrence)</h3>
    <p class="card__subtitle">Based on combined recent matches from both teams</p>
  `;

  const body = document.createElement('div');
  body.className = 'card__body';

  if (Object.keys(statistics).length === 0) {
    body.innerHTML = '<p class="text-muted">No significant trends found (80%+ occurrence)</p>';
  } else {
    const statsList = document.createElement('div');
    statsList.className = 'stats-list';

    Object.entries(statistics).forEach(([key, value]) => {
      const statItem = document.createElement('div');
      statItem.className = 'stat-item';

      const category = key.split('_')[0];
      const type = key.includes('_over_') ? 'over' : 'under';
      const threshold = key.split('_').pop();

      statItem.innerHTML = `
        <div class="stat-label">
          <span class="stat-category stat-category--${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
          <span class="stat-type stat-type--${type}">${type.charAt(0).toUpperCase() + type.slice(1)} ${threshold}</span>
        </div>
        <div class="stat-value">${value}</div>
      `;

      statsList.appendChild(statItem);
    });

    body.appendChild(statsList);
  }

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

// Utility functions
function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}

function setLoading(loading) {
  isLoading = loading;
  analyzeBtn.disabled = loading;

  if (loading) {
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
  } else {
    btnText.classList.remove('hidden');
    btnLoading.classList.add('hidden');
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  results.classList.add('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}
