// normalize_team_names.js
// Run: node normalize_team_names.js
// This script normalizes team names across all league JSON files to merge duplicates

const fs = require('fs');
const path = require('path');

// Your 32 league files
const JSON_FILES = [
  'leagues/league_152_2025.json',
  'leagues/league_153_2025.json',
  'leagues/league_175_2025.json',
  'leagues/league_176_2025.json',
  'leagues/league_168_2025.json',
  'leagues/league_169_2025.json',
  'leagues/league_207_2025.json',
  'leagues/league_208_2025.json',
  'leagues/league_302_2025.json',
  'leagues/league_301_2025.json',
  'leagues/league_235_2025.json',
  'leagues/league_266_2025.json',
  'leagues/league_322_2025.json',
  'leagues/league_144_2025.json',
  'leagues/league_179_2025.json',
  'leagues/league_245_2025.json',
  'leagues/league_230_2025.json',
  'leagues/league_167_2025.json',
  'leagues/league_99_2025.json',
  'leagues/league_221_2025.json',
  'leagues/league_199_2025.json',
  'leagues/league_244_2025.json',
  'leagues/league_238_2025.json',
  'leagues/league_265_2025.json',
  'leagues/league_268_2025.json',
  'leagues/league_242_2025.json',
  'leagues/league_243_2025.json',
  'leagues/league_284_2025.json',
  'leagues/league_346_2025.json',
  'leagues/league_248_2025.json',
  'leagues/league_189_2025.json',
  'leagues/league_253_2025.json'
];

// Normalization function
function normalizeTeamName(name) {
  if (!name) return '';
  let s = name.toLowerCase();
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');  // remove accents
  s = s.replace(/[^a-z0-9\s]/g, ' ');                       // strip punctuation
  const tokens = ['cf', 'fc', 'real', 'sport', 'club', 'sc', 'ac', 'uefa', 'st', 'athletic', 'ath'];
  tokens.forEach(t => s = s.replace(new RegExp('\\b' + t + '\\b', 'g'), ''));
  s = s.replace(/\s+/g, ' ').trim();                        // collapse spaces
  return s;
}

function buildCanonicalMap(rawNames) {
  const map = {};
  rawNames.forEach(raw => {
    const key = normalizeTeamName(raw);
    if (!map[key]) map[key] = raw;  // first-seen name wins
  });
  return map;
}

(async () => {
  console.log('🔍 Scanning all league JSON files for duplicate team names...\n');

  // Step 1: Collect all raw team names
  const allRawNames = new Set();
  
  for (const file of JSON_FILES) {
    if (!fs.existsSync(file)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }
    
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      data.forEach(match => {
        if (match.match_hometeam_name) allRawNames.add(match.match_hometeam_name);
        if (match.match_awayteam_name) allRawNames.add(match.match_awayteam_name);
      });
    } catch (err) {
      console.error(`❌ Error reading ${file}:`, err.message);
    }
  }

  console.log(`📊 Found ${allRawNames.size} unique raw team names`);

  // Step 2: Build canonical map
  const canonicalMap = buildCanonicalMap(Array.from(allRawNames));
  
  const normalizedCount = Object.keys(canonicalMap).length;
  const duplicatesRemoved = allRawNames.size - normalizedCount;
  
  console.log(`✅ After normalization: ${normalizedCount} unique teams`);
  console.log(`🔧 Merged ${duplicatesRemoved} duplicate variants\n`);

  // Step 3: Normalize each JSON file
  for (const file of JSON_FILES) {
    if (!fs.existsSync(file)) continue;
    
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      let changesCount = 0;
      
      data.forEach(match => {
        const homeKey = normalizeTeamName(match.match_hometeam_name);
        const awayKey = normalizeTeamName(match.match_awayteam_name);
        
        const newHome = canonicalMap[homeKey];
        const newAway = canonicalMap[awayKey];
        
        if (newHome && match.match_hometeam_name !== newHome) {
          console.log(`  ${match.match_hometeam_name} → ${newHome}`);
          match.match_hometeam_name = newHome;
          changesCount++;
        }
        
        if (newAway && match.match_awayteam_name !== newAway) {
          console.log(`  ${match.match_awayteam_name} → ${newAway}`);
          match.match_awayteam_name = newAway;
          changesCount++;
        }
      });
      
      if (changesCount > 0) {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ Updated ${file}: ${changesCount} names normalized\n`);
      } else {
        console.log(`✓  ${file}: No changes needed\n`);
      }
      
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  console.log('🎉 All files processed! Duplicate team names have been merged.');
})();
