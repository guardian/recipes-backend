#!/bin/bash

# Database file
DB="recipes.db"

# Create the table with a single JSON column
sqlite3 "$DB" "CREATE TABLE IF NOT EXISTS recipe_raw (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    json_data JSON
);"

# Clear existing data (optional - remove this line if you want to append)
sqlite3 "$DB" "DELETE FROM recipe_raw;"

# Loop through all files in the data/ directory
for file in data/*; do
    # Check if it's a file (not a directory)
    if [ -f "$file" ]; then
        echo "Processing: $file"

        # Read the JSON file and insert it into the database
        # Escape single quotes in the JSON content for SQLite
        json_content=$(cat "$file" | sed "s/'/''/g")

        sqlite3 "$DB" "INSERT INTO recipe_raw (json_data) VALUES ('$json_content');"
    fi
done

echo "Import complete. Total records:"
sqlite3 "$DB" "SELECT COUNT(*) FROM recipe_raw;"

sqlite3 "$DB" < create_recipe_table.sql

echo "Dropping the raw table..."
sqlite3 "$DB" "DROP TABLE IF EXISTS recipe_raw;"

echo "Migration completed. Results:"

# Check the results
echo ""
echo "=== RECIPE TABLE ==="
sqlite3 "$DB" "SELECT COUNT(*) as recipe_count FROM recipe;"
sqlite3 "$DB" "SELECT recipe_id, title, difficulty_level FROM recipe LIMIT 3;"

echo ""
echo "=== INGREDIENT TABLE ==="
sqlite3 "$DB" "SELECT COUNT(*) as ingredient_count FROM ingredient;"
sqlite3 "$DB" "SELECT recipe_id, recipe_section, name, text FROM ingredient LIMIT 5;"

echo ""
echo "=== INSTRUCTION TABLE ==="
sqlite3 "$DB" "SELECT COUNT(*) as instruction_count FROM instruction;"
sqlite3 "$DB" "SELECT recipe_id, step_number, description FROM instruction LIMIT 3;"

echo ""
echo "Test completed!"
