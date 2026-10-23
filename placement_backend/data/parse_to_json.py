import openpyxl
import json
import re

wb_path = r"c:\Users\HP\Desktop\project\data\DSA_patterns_Cheat_Sheet.xlsx"
wb = openpyxl.load_workbook(wb_path, data_only=True)
ws = wb['Sheet1']

patterns = []
current_pattern = None

# We detect pattern headers
def is_pattern_row(row_idx, col0, col1, col2):
    # If col2, col3, col4 are empty and col1 has Pattern or uppercase PATTERN
    text = (col1 or "").strip()
    c0 = (col0 or "").strip()
    
    if not text and not c0:
        return False, None
        
    # Check explicit pattern headers
    pattern_indicators = [
        r'^\d+\.\s*Pattern\s*:',
        r'^Pattern\s*:',
        r'^PATTERN\s*:',
        r'^HEAP PATTERN',
        r'^Recursion and Backtracking Pattern',
        r'^Tree Pattern',
        r'^GRAPHS',
        r'^DP\s*\(Dynamic Programming\)'
    ]
    
    for pat in pattern_indicators:
        if re.search(pat, text, re.IGNORECASE):
            return True, text
        if re.search(pat, c0, re.IGNORECASE):
            return True, c0
            
    return False, None

def extract_difficulty(title):
    t = title.lower()
    if '(easy)' in t or 'easy' in t.split():
        return 'Easy'
    elif '(medium)' in t or '(med)' in t or 'medium' in t.split() or 'med' in t.split():
        return 'Medium'
    elif '(hard)' in t or 'hard' in t.split():
        return 'Hard'
    return 'Medium' # Default if not specified

all_parsed_rows = []

for r in range(1, ws.max_row + 1):
    vals = [ws.cell(row=r, column=col).value for col in range(1, ws.max_column + 1)]
    col0 = str(vals[0]).strip() if vals[0] is not None else ""
    col1 = str(vals[1]).strip() if vals[1] is not None else ""
    link1 = str(vals[2]).strip() if vals[2] is not None else ""
    link2 = str(vals[3]).strip() if vals[3] is not None else ""
    link3 = str(vals[4]).strip() if vals[4] is not None else ""
    
    if r == 1 or (col0 == "Pattern" and col1 == "Question"):
        continue # skip sheet header rows
        
    is_pat, pat_name = is_pattern_row(r, col0, col1, link1)
    if is_pat:
        # Clean pattern name
        clean_name = re.sub(r'^\d+\.\s*', '', pat_name)
        clean_name = re.sub(r'^Pattern\s*:\s*', '', clean_name, flags=re.IGNORECASE)
        clean_name = clean_name.strip()
        
        current_pattern = {
            "id": len(patterns) + 1,
            "raw_name": pat_name,
            "name": clean_name,
            "row": r,
            "sub_categories": [],
            "questions": []
        }
        patterns.append(current_pattern)
    elif current_pattern:
        # Check if question row or empty
        # Sometimes col0 has a subcategory like "Traversal", "Mirror and Symmetry", "Kth ", etc.
        subcategory = col0 if col0 and col0 != "None" else None
        
        # Determine title
        title = col1 if col1 and col1 != "None" else ""
        
        # Check links
        links = []
        for lk in [link1, link2, link3]:
            if lk and lk != "None" and lk.startswith("http"):
                links.append(lk)
            elif lk and lk != "None" and "Homework" in lk:
                links.append("Homework")

        # If both title and links are empty, skip
        if not title and not links:
            continue
            
        # In DP: row 202-204 had empty title but link was best-time-to-buy-and-sell-stock-ii/iii/iv
        if not title and links:
            # derive title from link
            match = re.search(r'problems/([^/]+)', links[0])
            if match:
                slug = match.group(1).replace('-', ' ').title()
                title = slug
            else:
                title = f"Problem at row {r}"
                
        diff = extract_difficulty(title)
        
        q_obj = {
            "row": r,
            "title": title,
            "subcategory": subcategory,
            "difficulty": diff,
            "leetcode_url": links[0] if (links and links[0].startswith("http")) else None,
            "additional_urls": [lk for lk in links[1:] if lk.startswith("http")],
            "notes": "Homework" if "Homework" in links else None
        }
        current_pattern["questions"].append(q_obj)

print(f"Total Patterns: {len(patterns)}")
total_q = 0
for p in patterns:
    total_q += len(p["questions"])
    print(f"Pattern {p['id']}: '{p['name']}' (raw: '{p['raw_name']}') -> {len(p['questions'])} problems")

print(f"Total Problems across all patterns: {total_q}")

with open(r"c:\Users\HP\Desktop\project\data\parsed_workbook.json", "w", encoding="utf-8") as f:
    json.dump(patterns, f, indent=2)
print("Saved to parsed_workbook.json")
