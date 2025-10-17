
import os
import pandas as pd
from datetime import datetime

def filter_csv_files():
    """
    Filter all CSV files in leagues/other/ directory to show only matches from 20/08/2025 onwards.
    Creates new files with '2025' suffix in leagues/other2025/ directory.
    """

    # Define the input and output directories
    input_dir = 'other'
    output_dir = 'leagues/other2025'

    # Check if input directory exists
    if not os.path.exists(input_dir):
        print(f"Directory {input_dir} does not exist!")
        return

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    print(f"Output directory created/verified: {output_dir}")

    # Define the cutoff date (20/08/2025)
    cutoff_date = datetime(2025, 8, 20)

    # Get all CSV files in the input directory
    csv_files = [f for f in os.listdir(input_dir) if f.endswith('.csv')]

    if not csv_files:
        print(f"No CSV files found in {input_dir}")
        return

    print(f"\nFound {len(csv_files)} CSV files to process:")
    for file in csv_files:
        print(f"  - {file}")

    # Process each CSV file
    processed_files = 0
    for filename in csv_files:
        try:
            # Read the CSV file
            file_path = os.path.join(input_dir, filename)
            print(f"\nProcessing {filename}...")

            # Read CSV with pandas
            df = pd.read_csv(file_path)

            # Print column names to understand the structure
            print(f"Columns in {filename}: {list(df.columns)}")

            # Check if there's a Date column
            if 'Date' not in df.columns:
                print(f"No 'Date' column found in {filename}, skipping...")
                continue

            # Convert Date column to datetime
            # Handle different date formats that might exist
            original_count = len(df)

            # Try to parse dates - assuming format might be DD/MM/YYYY or similar
            def parse_date(date_str):
                try:
                    # Try different date formats
                    for fmt in ['%d%m%Y', '%d/%m/%Y', '%Y-%m-%d', '%m/%d/%Y']:
                        try:
                            return datetime.strptime(str(date_str), fmt)
                        except ValueError:
                            continue
                    return None
                except:
                    return None

            # Apply date parsing
            df['parsed_date'] = df['Date'].apply(parse_date)

            # Remove rows where date parsing failed
            df_with_dates = df[df['parsed_date'].notna()].copy()

            if len(df_with_dates) == 0:
                print(f"Could not parse any dates in {filename}, skipping...")
                continue

            # Filter for dates from 20/08/2025 onwards
            filtered_df = df_with_dates[df_with_dates['parsed_date'] >= cutoff_date].copy()

            # Drop the helper column
            filtered_df = filtered_df.drop('parsed_date', axis=1)

            print(f"Original rows: {original_count}")
            print(f"Rows with valid dates: {len(df_with_dates)}")
            print(f"Rows from 20/08/2025 onwards: {len(filtered_df)}")

            # Create output filename in the new directory
            base_name = filename.replace('.csv', '')
            output_filename = f"{base_name}2025.csv"
            output_path = os.path.join(output_dir, output_filename)

            # Save the filtered data
            filtered_df.to_csv(output_path, index=False)
            print(f"Saved filtered data to {output_dir}/{output_filename}")
            processed_files += 1

        except Exception as e:
            print(f"Error processing {filename}: {str(e)}")

    print(f"\nProcessing complete!")
    print(f"Successfully processed {processed_files} out of {len(csv_files)} files")
    print(f"Filtered files saved in: {output_dir}/")

if __name__ == "__main__":
    filter_csv_files()
