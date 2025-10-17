import os
import pandas as pd
import csv
import shutil
from datetime import datetime

def load_team_mappings(mapping_file='recommended_mappings.csv'):
    """Load team name mappings from the CSV file"""
    mappings = {}
    
    if not os.path.exists(mapping_file):
        print(f"❌ Mapping file '{mapping_file}' not found!")
        print("Please run the team name analyzer first to generate this file.")
        return {}
    
    try:
        df = pd.read_csv(mapping_file)
        
        # Expected columns: Fixture Team, League Team, Confidence, Action
        if 'Fixture Team' not in df.columns or 'League Team' not in df.columns:
            print(f"❌ Invalid mapping file format!")
            print(f"Expected columns: 'Fixture Team', 'League Team'")
            print(f"Found columns: {list(df.columns)}")
            return {}
        
        for _, row in df.iterrows():
            fixture_team = str(row['Fixture Team']).strip()
            league_team = str(row['League Team']).strip()
            confidence = float(row.get('Confidence', 1.0))
            
            # Only use mappings with reasonable confidence
            if confidence >= 0.6:
                mappings[fixture_team] = league_team
        
        print(f"✅ Loaded {len(mappings)} team name mappings")
        return mappings
        
    except Exception as e:
        print(f"❌ Error reading mapping file: {e}")
        return {}

def create_backup_folder(fixtures_folder):
    """Create a backup of original fixture files"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_folder = f"{fixtures_folder}_backup_{timestamp}"
    
    try:
        if os.path.exists(fixtures_folder):
            shutil.copytree(fixtures_folder, backup_folder)
            print(f"✅ Backup created: {backup_folder}")
            return backup_folder
        else:
            print(f"⚠️  Fixtures folder '{fixtures_folder}' not found!")
            return None
    except Exception as e:
        print(f"❌ Error creating backup: {e}")
        return None

def update_fixture_file(filepath, team_mappings, dry_run=False):
    """Update team names in a single fixture file"""
    try:
        # Read the CSV file
        df = pd.read_csv(filepath)
        
        # Find the team columns
        home_col = None
        away_col = None
        
        for col in df.columns:
            col_lower = col.strip().lower()
            if 'home' in col_lower and 'team' in col_lower:
                home_col = col
            elif 'away' in col_lower and 'team' in col_lower:
                away_col = col
        
        if not home_col or not away_col:
            print(f"  ⚠️  Could not find team columns in {os.path.basename(filepath)}")
            return 0, []
        
        changes_made = 0
        detailed_changes = []
        
        # Update home team names
        for idx, team in enumerate(df[home_col]):
            if str(team) in team_mappings:
                old_name = str(team)
                new_name = team_mappings[old_name]
                if old_name != new_name:
                    detailed_changes.append(f"    Row {idx+2}: '{old_name}' → '{new_name}' (Home)")
                    if not dry_run:
                        df.at[idx, home_col] = new_name
                    changes_made += 1
        
        # Update away team names
        for idx, team in enumerate(df[away_col]):
            if str(team) in team_mappings:
                old_name = str(team)
                new_name = team_mappings[old_name]
                if old_name != new_name:
                    detailed_changes.append(f"    Row {idx+2}: '{old_name}' → '{new_name}' (Away)")
                    if not dry_run:
                        df.at[idx, away_col] = new_name
                    changes_made += 1
        
        # Save the updated file (if not dry run)
        if changes_made > 0 and not dry_run:
            df.to_csv(filepath, index=False)
        
        return changes_made, detailed_changes
        
    except Exception as e:
        print(f"  ❌ Error processing {os.path.basename(filepath)}: {e}")
        return 0, []

def update_all_fixture_files(fixtures_folder, team_mappings, dry_run=False):
    """Update team names in all fixture files"""
    print(f"\n{'🔍 DRY RUN - ' if dry_run else '✏️  '}Updating fixture files...")
    
    if not os.path.exists(fixtures_folder):
        print(f"❌ Fixtures folder '{fixtures_folder}' not found!")
        return
    
    total_changes = 0
    files_updated = 0
    all_changes = {}
    
    # Process each CSV file in the fixtures folder
    for filename in os.listdir(fixtures_folder):
        if filename.endswith('.csv'):
            filepath = os.path.join(fixtures_folder, filename)
            changes_made, detailed_changes = update_fixture_file(filepath, team_mappings, dry_run)
            
            if changes_made > 0:
                files_updated += 1
                total_changes += changes_made
                all_changes[filename] = detailed_changes
                print(f"  ✅ {filename}: {changes_made} team names updated")
            else:
                print(f"  ➖ {filename}: No changes needed")
    
    print(f"\n📊 SUMMARY:")
    print(f"  • Files processed: {len([f for f in os.listdir(fixtures_folder) if f.endswith('.csv')])}")
    print(f"  • Files updated: {files_updated}")
    print(f"  • Total changes: {total_changes}")
    
    # Show detailed changes if requested
    if all_changes and input(f"\nShow detailed changes? (y/N): ").lower().startswith('y'):
        print(f"\n📝 DETAILED CHANGES:")
        for filename, changes in all_changes.items():
            print(f"\n  {filename}:")
            for change in changes:
                print(change)
    
    return total_changes, files_updated

def validate_mappings(team_mappings):
    """Validate and show the mappings that will be applied"""
    print(f"\n📋 TEAM NAME MAPPINGS TO BE APPLIED:")
    print("="*60)
    
    if not team_mappings:
        print("❌ No mappings found! Please check your recommended_mappings.csv file.")
        return False
    
    for fixture_team, league_team in sorted(team_mappings.items()):
        print(f"  '{fixture_team}' → '{league_team}'")
    
    print(f"\nTotal mappings: {len(team_mappings)}")
    return True

def create_update_log(changes_made, files_updated, team_mappings):
    """Create a log file of all updates made"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_filename = f"fixture_update_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    
    with open(log_filename, 'w', encoding='utf-8') as f:
        f.write(f"Fixture Team Name Update Log\n")
        f.write(f"Generated: {timestamp}\n")
        f.write(f"="*50 + "\n\n")
        
        f.write(f"SUMMARY:\n")
        f.write(f"- Total changes made: {changes_made}\n")
        f.write(f"- Files updated: {files_updated}\n")
        f.write(f"- Mappings applied: {len(team_mappings)}\n\n")
        
        f.write(f"MAPPINGS APPLIED:\n")
        f.write(f"-"*30 + "\n")
        for fixture_team, league_team in sorted(team_mappings.items()):
            f.write(f"'{fixture_team}' → '{league_team}'\n")
    
    print(f"📝 Update log saved: {log_filename}")

def main():
    """Main function to update fixture team names"""
    print("🔄 FIXTURE TEAM NAME UPDATER")
    print("="*40)
    
    # Configuration
    fixtures_folder = "fixtures"
    mapping_file = "recommended_mappings.csv"
    
    # Load team mappings
    team_mappings = load_team_mappings(mapping_file)
    if not team_mappings:
        return
    
    # Validate mappings
    if not validate_mappings(team_mappings):
        return
    
    # Ask for confirmation
    print(f"\n⚠️  This will update team names in all CSV files in the '{fixtures_folder}' folder.")
    
    # Offer dry run first
    dry_run_choice = input("Do you want to run a dry run first to see what changes would be made? (Y/n): ")
    if not dry_run_choice.lower().startswith('n'):
        print(f"\n🔍 RUNNING DRY RUN...")
        update_all_fixture_files(fixtures_folder, team_mappings, dry_run=True)
        
        proceed = input(f"\nProceed with actual updates? (y/N): ")
        if not proceed.lower().startswith('y'):
            print("❌ Operation cancelled.")
            return
    else:
        proceed = input("Proceed with updates? (y/N): ")
        if not proceed.lower().startswith('y'):
            print("❌ Operation cancelled.")
            return
    
    # Create backup
    backup_folder = create_backup_folder(fixtures_folder)
    if not backup_folder:
        print("❌ Could not create backup. Operation cancelled for safety.")
        return
    
    # Update files
    changes_made, files_updated = update_all_fixture_files(fixtures_folder, team_mappings, dry_run=False)
    
    # Create log
    if changes_made > 0:
        create_update_log(changes_made, files_updated, team_mappings)
        print(f"\n✅ Update completed successfully!")
        print(f"🔐 Original files backed up to: {backup_folder}")
    else:
        print(f"\n➖ No changes were needed.")

if __name__ == "__main__":
    main()