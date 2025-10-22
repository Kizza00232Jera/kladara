// today-matches.js - FINAL FIXED VERSION WITH CORRECT PARSING AND SMART FILTERING
// Display today's matches sorted by leagues with on-click team analysis

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function getTodayDateStr() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function loadAllMatches() {
    const matches = [];
    const leagueMap = {};
    
    try {
        for (const [leagueId, leagueInfo] of Object.entries(JSON_FILES)) {
            try {
                leagueMap[leagueId] = leagueInfo.name;
                const response = await fetch(leagueInfo.file);
                
                if (!response.ok) {
                    console.warn(`Could not load ${leagueInfo.file}: ${response.status}`);
                    continue;
                }
                
                const leagueMatches = await response.json();
                
                leagueMatches.forEach(match => {
                    const stats = match.statistics || [];
                    const matchData = {
                        leagueId: leagueId,
                        league: leagueInfo.name,
                        dateString: match.match_date,
                        matchTime: match.match_time || 'TBA',
                        homeTeam: match.match_hometeam_name,
                        awayTeam: match.match_awayteam_name,
                        match_status: match.match_status,
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
                        hf: getStatValue(stats, 'Fouls', 'home'),
                        af: getStatValue(stats, 'Fouls', 'away'),
                        hsog: getStatValue(stats, 'Shots On Goal', 'home'),
                        asog: getStatValue(stats, 'Shots On Goal', 'away')
                    };
                    matches.push(matchData);
                });
                
                console.log(`✅ Loaded ${leagueMatches.length} matches from ${leagueInfo.name}`);
            } catch (error) {
                console.warn(`Failed to load ${leagueInfo.file}:`, error);
            }
        }
        console.log(`Total matches loaded: ${matches.length}`);
        return matches;
    } catch (error) {
        console.error('Error loading all matches:', error);
        throw error;
    }
}

function getStatValue(stats, type, side) {
    const stat = stats.find(s => s.type === type);
    if (!stat) return 0;
    return parseInt(stat[side]) || 0;
}

function filterTodayMatches(allMatches) {
    const today = getTodayDateStr();
    return allMatches.filter(m => m.dateString === today);
}

function groupMatchesByLeague(matches) {
    const leagueGroups = {};
    
    matches.forEach(match => {
        if (!leagueGroups[match.league]) {
            leagueGroups[match.league] = [];
        }
        leagueGroups[match.league].push(match);
    });
    
    const sortedLeagueNames = Object.keys(leagueGroups).sort((a, b) => 
        a.localeCompare(b)
    );
    
    return sortedLeagueNames.map(league => ({
        league,
        matches: leagueGroups[league]
    }));
}

function createMatchCard(match, leagueGroup, onClickHandler) {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.dataset.homeTeam = match.homeTeam;
    card.dataset.awayTeam = match.awayTeam;
    card.dataset.league = match.league;
    
    const timeStr = match.matchTime !== 'TBA' ? match.matchTime : 'Time TBA';
    
    card.innerHTML = `
        <div class="match-time">${formatDate(match.dateString)} - ${timeStr}</div>
        <div class="match-teams">
            <div class="team">${match.homeTeam}</div>
            <span class="vs">vs</span>
            <div class="team">${match.awayTeam}</div>
        </div>
        <div class="match-status ${match.match_status === 'Live' ? 'live' : ''}">${match.match_status}</div>
        <div class="analysis-section"></div>
    `;
    
    card.addEventListener('click', () => onClickHandler(card, match));
    return card;
}

function showLoadingSpinner(card) {
    const analysis = card.querySelector('.analysis-section');
    analysis.innerHTML = `
        <div class="analysis-loading">
            <div class="spinner"></div>
            Loading team analysis...
        </div>
    `;
    analysis.classList.add('expanded');
}

function hideLoadingSpinner(card) {
    const analysis = card.querySelector('.analysis-section');
    analysis.innerHTML = '';
    analysis.classList.remove('expanded');
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadTeamAnalysis(match) {
    if (typeof window.getTeamLastMatches !== 'function' || 
        typeof window.calculateStatistics !== 'function') {
        throw new Error('Team analysis functions not available. Ensure app.js is loaded.');
    }
    
    await wait(300);
    
    const homeLast = window.getTeamLastMatches(match.homeTeam, 5);
    const awayLast = window.getTeamLastMatches(match.awayTeam, 5);
    const combinedStats = window.calculateStatistics([...homeLast, ...awayLast]);
    
    return {
        homeLast,
        awayLast,
        combinedStats
    };
}

function renderMatchHistoryTable(matches, teamName) {
    if (!matches || matches.length === 0) {
        return '<div style="padding: 15px; color: var(--color-text-secondary);">No match history available.</div>';
    }
    
    let html = '<table class="match-history-table"><thead><tr>';
    html += '<th>Date</th><th>Opponent</th><th>Loc</th><th>Goals</th><th>Shots</th>';
    html += '<th>SOG</th><th>Corners</th><th>Cards</th><th>Fouls</th><th>FT</th><th>HT</th></tr></thead><tbody>';
    
    matches.forEach(m => {
        const ftScore = `${m.teamGoals}-${m.oppGoals}`;
        const htScore = `${m.teamHalfGoals}-${m.oppHalfGoals}`;
        const shots = `${m.teamShots}-${m.oppShots}`;
        const sog = `${m.teamShotsOnGoal}-${m.oppShotsOnGoal}`;
        const corners = `${m.teamCorners}-${m.oppCorners}`;
        const cards = `${m.teamCards}-${m.oppCards}`;
        const fouls = `${m.teamFouls}-${m.oppFouls}`;
        
        html += `<tr>
            <td>${formatDate(m.dateString)}</td>
            <td>${m.opponent}</td>
            <td>${m.location}</td>
            <td>${ftScore}</td>
            <td>${shots}</td>
            <td>${sog}</td>
            <td>${corners}</td>
            <td>${cards}</td>
            <td>${fouls}</td>
            <td>${ftScore}</td>
            <td>${htScore}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    return html;
}

// SMART STATISTICS FILTERING - FIXED VERSION
function filterAndGroupStatistics(combinedStats) {
    // Format: "goals_over_0.5" -> value: "9/10 (90%)"
    const overs = {}; // category -> threshold -> { threshold, percentage, value }
    const unders = {}; // category -> threshold -> { threshold, percentage, value }
    
    console.log('Raw combined stats:', combinedStats);
    
    // Parse all statistics
    for (const [key, value] of Object.entries(combinedStats)) {
        // Format: "category_over/under_threshold"
        // Example: "goals_over_0.5" or "shots_under_26.5"
        const parts = key.split('_');
        
        if (parts.length < 3) {
            console.warn(`Skipping stat with unexpected format: ${key}`);
            continue;
        }
        
        const category = parts[0].toUpperCase(); // "GOALS", "SHOTS", etc.
        const type = parts[parts.length - 2].toUpperCase(); // "OVER" or "UNDER"
        const threshold = parseFloat(parts[parts.length - 1]); // threshold value
        
        // Extract percentage from value: "9/10 (90%)"
        const percentMatch = value.toString().match(/\((\d+)%\)/);
        const percentage = percentMatch ? parseInt(percentMatch[1]) : 0;
        
        console.log(`Parsed: ${category} ${type} ${threshold} - ${percentage}%`);
        
        const statData = {
            threshold: threshold,
            percentage: percentage,
            value: value,
            category: category,
            type: type,
            key: key
        };
        
        if (type === 'OVER') {
            if (!overs[category]) overs[category] = {};
            overs[category][threshold] = statData;
        } else {
            if (!unders[category]) unders[category] = {};
            unders[category][threshold] = statData;
        }
    }
    
    console.log('Organized overs:', overs);
    console.log('Organized unders:', unders);
    
    // Filter smart results
    const bestOvers = {};
    const bestUnders = {};
    
    // For OVERS: Get best threshold for each percentage level
    // Skip lower thresholds if higher ones exist at same percentage
    for (const category in overs) {
        bestOvers[category] = {};
        
        // Group by percentage
        const byPercent = {};
        for (const threshold in overs[category]) {
            const stat = overs[category][threshold];
            if (!byPercent[stat.percentage]) byPercent[stat.percentage] = [];
            byPercent[stat.percentage].push(stat);
        }
        
        // For each percentage, get the HIGHEST threshold
        for (const percentage of [100, 90, 80]) {
            if (byPercent[percentage]) {
                const sorted = byPercent[percentage].sort((a, b) => a.threshold - b.threshold);
                bestOvers[category][percentage] = sorted[sorted.length - 1]; // Highest
            }
        }
    }
    
    // For UNDERS: Get best threshold for each percentage level
    // Skip higher thresholds if lower ones exist at same percentage
    for (const category in unders) {
        bestUnders[category] = {};
        
        // Group by percentage
        const byPercent = {};
        for (const threshold in unders[category]) {
            const stat = unders[category][threshold];
            if (!byPercent[stat.percentage]) byPercent[stat.percentage] = [];
            byPercent[stat.percentage].push(stat);
        }
        
        // For each percentage, get the LOWEST threshold
        for (const percentage of [100, 90, 80]) {
            if (byPercent[percentage]) {
                const sorted = byPercent[percentage].sort((a, b) => a.threshold - b.threshold);
                bestUnders[category][percentage] = sorted[0]; // Lowest
            }
        }
    }
    
    console.log('Best overs:', bestOvers);
    console.log('Best unders:', bestUnders);
    
    return { bestOvers, bestUnders };
}

// RENDER SMART STATISTICS WITH TWO-COLUMN LAYOUT
function renderSmartStatistics(combinedStats) {
    const { bestOvers, bestUnders } = filterAndGroupStatistics(combinedStats);
    
    let html = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%;">`;
    
    // LEFT COLUMN: OVERS
    html += `<div style="display: block; width: 100%;">
        <h4 style="color: var(--color-btn-primary-text); margin-bottom: 15px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 10px;">⬆️ OVER TRENDS</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">`;
    
    let oversCount = 0;
    for (const category in bestOvers) {
        for (const percentage of [100, 90, 80]) {
            const stat = bestOvers[category][percentage];
            if (stat) {
                oversCount++;
                const label = `${stat.category} OVER ${stat.threshold}`;
                html += `<div class="stat-card" style="background: rgba(255,255,255,0.15); border-color: var(--color-btn-primary-text); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span class="label" style="color: rgba(255,255,255,0.95); margin-bottom: 0; font-size: 0.9rem;">${label}</span>
                    <span class="value" style="color: var(--color-btn-primary-text); font-size: 1rem; font-weight: bold;">${stat.value}</span>
                </div>`;
            }
        }
    }
    
    if (oversCount === 0) {
        html += `<div style="padding: 15px; color: rgba(255,255,255,0.6); text-align: center;">No OVER trends found</div>`;
    }
    
    html += `</div></div>`;
    
    // RIGHT COLUMN: UNDERS
    html += `<div style="display: block; width: 100%;">
        <h4 style="color: var(--color-btn-primary-text); margin-bottom: 15px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 10px;">⬇️ UNDER TRENDS</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">`;
    
    let undersCount = 0;
    for (const category in bestUnders) {
        for (const percentage of [100, 90, 80]) {
            const stat = bestUnders[category][percentage];
            if (stat) {
                undersCount++;
                const label = `${stat.category} UNDER ${stat.threshold}`;
                html += `<div class="stat-card" style="background: rgba(255,255,255,0.15); border-color: var(--color-btn-primary-text); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span class="label" style="color: rgba(255,255,255,0.95); margin-bottom: 0; font-size: 0.9rem;">${label}</span>
                    <span class="value" style="color: var(--color-btn-primary-text); font-size: 1rem; font-weight: bold;">${stat.value}</span>
                </div>`;
            }
        }
    }
    
    if (undersCount === 0) {
        html += `<div style="padding: 15px; color: rgba(255,255,255,0.6); text-align: center;">No UNDER trends found</div>`;
    }
    
    html += `</div></div></div>`;
    
    return html;
}

function renderAnalysis(card, match, analysis) {
    const { homeLast, awayLast, combinedStats } = analysis;
    
    const analysisSection = card.querySelector('.analysis-section');
    let html = '';
    
    // Home team analysis
    html += `
        <div class="team-analysis" style="display: block; width: 100%; margin-bottom: 40px;">
            <h3 style="display: block; width: 100%; margin-bottom: 15px;">${match.homeTeam} - Last ${homeLast.length} Matches</h3>
            <div style="display: block; width: 100%;">
                ${renderMatchHistoryTable(homeLast, match.homeTeam)}
            </div>
        </div>
    `;
    
    // Away team analysis
    html += `
        <div class="team-analysis" style="display: block; width: 100%; margin-bottom: 40px;">
            <h3 style="display: block; width: 100%; margin-bottom: 15px;">${match.awayTeam} - Last ${awayLast.length} Matches</h3>
            <div style="display: block; width: 100%;">
                ${renderMatchHistoryTable(awayLast, match.awayTeam)}
            </div>
        </div>
    `;
    
    // Smart combined statistics
    html += `
        <div class="combined-stats" style="display: block; width: 100%; margin-top: 30px;">
            <h3 style="display: block; width: 100%; margin-bottom: 20px; text-align: center;">📊 Combined Statistics (80%+ Trends)</h3>
            ${renderSmartStatistics(combinedStats)}
        </div>
    `;
    
    analysisSection.innerHTML = html;
    analysisSection.classList.add('expanded');
    card.classList.add('expanded');
}

async function handleMatchCardClick(card, match) {
    const isExpanded = card.classList.contains('expanded');
    
    if (isExpanded) {
        card.classList.remove('expanded');
        const analysisSection = card.querySelector('.analysis-section');
        analysisSection.classList.remove('expanded');
        setTimeout(() => {
            analysisSection.innerHTML = '';
        }, 500);
    } else {
        card.classList.add('expanded');
        showLoadingSpinner(card);
        
        try {
            const analysis = await loadTeamAnalysis(match);
            hideLoadingSpinner(card);
            renderAnalysis(card, match, analysis);
        } catch (error) {
            console.error('Error loading analysis:', error);
            const analysisSection = card.querySelector('.analysis-section');
            analysisSection.innerHTML = `<div class="error-message" style="color: var(--color-error); padding: 15px;">Error loading analysis: ${error.message}</div>`;
        }
    }
}

async function initializeTodaysMatches() {
    const currentDate = document.getElementById('currentDate');
    const loadingScreen = document.getElementById('loadingScreen');
    const matchesContainer = document.getElementById('matchesContainer');
    const noMatches = document.getElementById('noMatches');
    const errorContainer = document.getElementById('errorContainer');
    
    try {
        const today = new Date();
        currentDate.textContent = formatDate(getTodayDateStr());
        
        const allMatches = await loadAllMatches();
        const todayMatches = filterTodayMatches(allMatches);
        const groupedLeagues = groupMatchesByLeague(todayMatches);
        
        loadingScreen.style.display = 'none';
        
        if (groupedLeagues.length === 0 || todayMatches.length === 0) {
            matchesContainer.style.display = 'none';
            noMatches.style.display = 'block';
            return;
        }
        
        matchesContainer.innerHTML = '';
        
        groupedLeagues.forEach(({ league, matches }) => {
            const section = document.createElement('div');
            section.className = 'league-section';
            
            const header = document.createElement('div');
            header.className = 'league-header';
            header.textContent = league;
            section.appendChild(header);
            
            const grid = document.createElement('div');
            grid.className = 'matches-grid';
            
            matches.forEach(match => {
                const card = createMatchCard(match, league, handleMatchCardClick);
                grid.appendChild(card);
            });
            
            section.appendChild(grid);
            matchesContainer.appendChild(section);
        });
        
        matchesContainer.style.display = 'block';
        noMatches.style.display = 'none';
        
    } catch (error) {
        console.error('Error initializing today\'s matches:', error);
        loadingScreen.style.display = 'none';
        matchesContainer.style.display = 'none';
        noMatches.style.display = 'none';
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = `Error loading matches: ${error.message}`;
        errorContainer.appendChild(errorMsg);
    }
}

document.addEventListener('DOMContentLoaded', initializeTodaysMatches);