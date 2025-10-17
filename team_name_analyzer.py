import os
import pandas as pd
import csv
from collections import defaultdict
import difflib

def get_team_names_from_fixtures(fixtures_folder):
    """Extract team names from fixture CSV files"""
    team_names = set()
    processed_files = []
    
    print(f"🔍 Analyzing fixture files in '{fixtures_folder}' folder...")
    
    if not os.path.exists(fixtures_folder):
        print(f"❌ Fixtures folder '{fixtures_folder}' not found!")
        return set(), []
    
    for filename in os.listdir(fixtures_folder):
        if filename.endswith('.csv'):
            filepath = os.path.join(fixtures_folder, filename)
            try:
                # Read CSV file
                df = pd.read_csv(filepath)
                
                # Look for Home Team and Away Team columns (fixture format)
                home_col = None
                away_col = None
                
                for col in df.columns:
                    col_lower = col.strip().lower()
                    if 'home' in col_lower and 'team' in col_lower:
                        home_col = col
                    elif 'away' in col_lower and 'team' in col_lower:
                        away_col = col
                
                if home_col and away_col:
                    # Extract team names
                    home_teams = df[home_col].dropna().unique()
                    away_teams = df[away_col].dropna().unique()
                    
                    file_teams = set(home_teams) | set(away_teams)
                    team_names.update(file_teams)
                    
                    print(f"  ✅ {filename}: Found {len(file_teams)} teams")
                    processed_files.append(filename)
                else:
                    print(f"  ⚠️  {filename}: Could not find Home Team/Away Team columns")
                    print(f"     Available columns: {list(df.columns)}")
                    
            except Exception as e:
                print(f"  ❌ {filename}: Error reading file - {e}")
    
    return team_names, processed_files

def get_team_names_from_leagues(leagues_folders):
    """Extract team names from league CSV files"""
    team_names = set()
    processed_files = []
    
    for folder_name in leagues_folders:
        print(f"🔍 Analyzing league files in '{folder_name}' folder...")
        
        if not os.path.exists(folder_name):
            print(f"❌ League folder '{folder_name}' not found!")
            continue
            
        for filename in os.listdir(folder_name):
            if filename.endswith('.csv'):
                filepath = os.path.join(folder_name, filename)
                try:
                    # Read CSV file
                    df = pd.read_csv(filepath)
                    
                    # Look for team columns - different formats for different folders
                    home_col = None
                    away_col = None
                    
                    # Check all possible column name variations
                    for col in df.columns:
                        col_lower = col.strip().lower()
                        
                        # Format 1: HomeTeam/AwayTeam (main folder)
                        if col_lower == 'hometeam':
                            home_col = col
                        elif col_lower == 'awayteam':
                            away_col = col
                        
                        # Format 2: Home/Away (other2025 folder)
                        elif col_lower == 'home' and home_col is None:
                            home_col = col
                        elif col_lower == 'away' and away_col is None:
                            away_col = col
                    
                    if home_col and away_col:
                        # Extract team names
                        home_teams = df[home_col].dropna().unique()
                        away_teams = df[away_col].dropna().unique()
                        
                        file_teams = set(home_teams) | set(away_teams)
                        team_names.update(file_teams)
                        
                        print(f"  ✅ {filename}: Found {len(file_teams)} teams (using {home_col}/{away_col})")
                        processed_files.append(f"{folder_name}/{filename}")
                    else:
                        print(f"  ⚠️  {filename}: Could not find team columns")
                        print(f"     Available columns: {list(df.columns)}")
                        print(f"     Looked for: HomeTeam/AwayTeam or Home/Away")
                        
                except Exception as e:
                    print(f"  ❌ {filename}: Error reading file - {e}")
    
    return team_names, processed_files

def find_similar_names(name, name_list, threshold=0.6):
    """Find similar team names using fuzzy matching"""
    matches = difflib.get_close_matches(name, name_list, n=5, cutoff=threshold)
    return matches

def compare_team_names(fixture_teams, league_teams):
    """Compare team names between fixtures and leagues"""
    print("\n" + "="*60)
    print("📊 TEAM NAME COMPARISON ANALYSIS")
    print("="*60)
    
    # Find exact matches
    exact_matches = fixture_teams & league_teams
    
    # Find teams only in fixtures
    fixture_only = fixture_teams - league_teams
    
    # Find teams only in leagues
    league_only = league_teams - fixture_teams
    
    print(f"\n📈 SUMMARY STATISTICS:")
    print(f"  • Total fixture teams: {len(fixture_teams)}")
    print(f"  • Total league teams: {len(league_teams)}")
    print(f"  • Exact matches: {len(exact_matches)}")
    print(f"  • Only in fixtures: {len(fixture_only)}")
    print(f"  • Only in leagues: {len(league_only)}")
    print(f"  • Match percentage: {len(exact_matches) / max(len(fixture_teams), 1) * 100:.1f}%")
    
    # Show exact matches
    if exact_matches:
        print(f"\n✅ EXACT MATCHES ({len(exact_matches)}):")
        for team in sorted(exact_matches):
            print(f"  • {team}")
    
    # Show fixture-only teams with potential league matches
    if fixture_only:
        print(f"\n🏟️  TEAMS ONLY IN FIXTURES ({len(fixture_only)}):")
        for team in sorted(fixture_only):
            similar = find_similar_names(team, list(league_teams), threshold=0.5)
            if similar:
                print(f"  • {team}")
                for sim in similar[:3]:  # Show top 3 matches
                    confidence = difflib.SequenceMatcher(None, team.lower(), sim.lower()).ratio()
                    print(f"    └─ {sim} (confidence: {confidence:.2f})")
            else:
                print(f"  • {team} (no similar names found)")
    
    # Show league-only teams with potential fixture matches
    if league_only:
        print(f"\n⚽ TEAMS ONLY IN LEAGUES ({len(league_only)}):")
        for team in sorted(league_only):
            similar = find_similar_names(team, list(fixture_teams), threshold=0.5)
            if similar:
                print(f"  • {team}")
                for sim in similar[:3]:  # Show top 3 matches
                    confidence = difflib.SequenceMatcher(None, team.lower(), sim.lower()).ratio()
                    print(f"    └─ {sim} (confidence: {confidence:.2f})")
            else:
                print(f"  • {team} (no similar names found)")
    
    return exact_matches, fixture_only, league_only

def generate_mapping_suggestions(fixture_only, league_only):
    """Generate mapping suggestions for mismatched team names"""
    print(f"\n🔄 MAPPING SUGGESTIONS:")
    print("="*50)
    
    mappings = []
    used_league_teams = set()
    
    for fixture_team in sorted(fixture_only):
        # Find best matches in league teams
        available_league_teams = [team for team in league_only if team not in used_league_teams]
        matches = find_similar_names(fixture_team, available_league_teams, threshold=0.3)
        
        if matches:
            best_match = matches[0]
            confidence = difflib.SequenceMatcher(None, fixture_team.lower(), best_match.lower()).ratio()
            
            if confidence > 0.4:  # Only suggest if confidence is reasonable
                print(f"  '{fixture_team}' → '{best_match}' (confidence: {confidence:.2f})")
                mappings.append((fixture_team, best_match, confidence))
                used_league_teams.add(best_match)
    
    if not mappings:
        print("  No strong mapping suggestions found.")
    
    return mappings

def generate_javascript_mapping(mappings, exact_matches):
    """Generate JavaScript code for team name mapping"""
    print(f"\n💻 JAVASCRIPT MAPPING CODE:")
    print("="*40)
    
    print("// Add this to your find_bets.js file")
    print("function normalizeTeamName(teamName) {")
    print("    const teamMappings = {")
    
    # Add exact matches (for consistency)
    for team in sorted(exact_matches):
        print(f"        '{team}': '{team}',")
    
    # Add suggested mappings
    for fixture_team, league_team, confidence in sorted(mappings, key=lambda x: x[2], reverse=True):
        if confidence > 0.6:  # Only include high-confidence mappings
            print(f"        '{fixture_team}': '{league_team}',  // confidence: {confidence:.2f}")
    
    print("    };")
    print("    return teamMappings[teamName] || teamName;")
    print("}")
    print("\n// Usage: normalizeTeamName('Man City') returns 'Manchester City'")

def save_results_to_files(fixture_teams, league_teams, exact_matches, fixture_only, league_only, mappings):
    """Save analysis results to CSV files"""
    print(f"\n💾 SAVING RESULTS TO FILES:")
    
    # Save all fixture teams
    with open('fixture_teams.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Team Name', 'Source'])
        for team in sorted(fixture_teams):
            writer.writerow([team, 'Fixtures'])
    print(f"  ✅ fixture_teams.csv ({len(fixture_teams)} teams)")
    
    # Save all league teams
    with open('league_teams.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Team Name', 'Source'])
        for team in sorted(league_teams):
            writer.writerow([team, 'Leagues'])
    print(f"  ✅ league_teams.csv ({len(league_teams)} teams)")
    
    # Save comparison results
    with open('team_comparison_results.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Team Name', 'Status', 'Similar Teams', 'Best Match', 'Confidence'])
        
        # Exact matches
        for team in sorted(exact_matches):
            writer.writerow([team, 'Exact Match', '', '', '1.00'])
        
        # Fixture-only teams
        for team in sorted(fixture_only):
            similar = find_similar_names(team, list(league_teams), threshold=0.3)
            if similar:
                best_match = similar[0]
                confidence = difflib.SequenceMatcher(None, team.lower(), best_match.lower()).ratio()
                writer.writerow([team, 'Fixture Only', '; '.join(similar[:3]), best_match, f'{confidence:.2f}'])
            else:
                writer.writerow([team, 'Fixture Only', 'No matches', '', '0.00'])
        
        # League-only teams
        for team in sorted(league_only):
            similar = find_similar_names(team, list(fixture_teams), threshold=0.3)
            if similar:
                best_match = similar[0]
                confidence = difflib.SequenceMatcher(None, team.lower(), best_match.lower()).ratio()
                writer.writerow([team, 'League Only', '; '.join(similar[:3]), best_match, f'{confidence:.2f}'])
            else:
                writer.writerow([team, 'League Only', 'No matches', '', '0.00'])
    
    print(f"  ✅ team_comparison_results.csv (detailed comparison)")
    
    # Save high-confidence mappings only
    high_confidence_mappings = [(f, l, c) for f, l, c in mappings if c > 0.6]
    with open('recommended_mappings.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Fixture Team', 'League Team', 'Confidence', 'Action'])
        for fixture_team, league_team, confidence in sorted(high_confidence_mappings, key=lambda x: x[2], reverse=True):
            action = "Highly Recommended" if confidence > 0.8 else "Review Recommended"
            writer.writerow([fixture_team, league_team, f"{confidence:.2f}", action])
    print(f"  ✅ recommended_mappings.csv ({len(high_confidence_mappings)} high-confidence mappings)")

def main():
    """Main function to run the team name analysis"""
    print("🏈 FOOTBALL TEAM NAME ANALYZER (Enhanced)")
    print("="*55)
    
    # Define folder paths
    fixtures_folder = "fixtures"
    leagues_folders = ["leagues/main", "leagues/other2025"]
    
    # Get team names from fixtures
    fixture_teams, fixture_files = get_team_names_from_fixtures(fixtures_folder)
    print(f"\n📋 Processed fixture files: {len(fixture_files)}")
    
    # Get team names from leagues
    league_teams, league_files = get_team_names_from_leagues(leagues_folders)
    print(f"\n📋 Processed league files: {len(league_files)}")
    
    if not fixture_teams and not league_teams:
        print("❌ No team names found in any files!")
        return
        
    if not fixture_teams:
        print("⚠️  No fixture teams found!")
        return
        
    if not league_teams:
        print("⚠️  No league teams found!")
        return
    
    # Compare team names
    exact_matches, fixture_only, league_only = compare_team_names(fixture_teams, league_teams)
    
    # Generate mapping suggestions
    mappings = generate_mapping_suggestions(fixture_only, league_only)
    
    # Generate JavaScript mapping code
    generate_javascript_mapping(mappings, exact_matches)
    
    # Save results to files
    save_results_to_files(fixture_teams, league_teams, exact_matches, fixture_only, league_only, mappings)
    
    print(f"\n✅ Analysis complete!")
    print(f"📊 Summary: {len(exact_matches)} exact matches, {len(fixture_only)} fixture-only, {len(league_only)} league-only")
    print(f"🎯 Check the generated CSV files for detailed results and recommendations.")

if __name__ == "__main__":
    main()