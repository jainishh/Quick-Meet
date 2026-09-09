import os
import re

# Directory to scan
SRC_DIR = r"d:\Quick-Meet\frontend\src"

# Mapping of hardcoded values to CSS variables
REPLACEMENTS = {
    # Backgrounds
    r"#0B0F19": "var(--bg-root)",
    r"#0B1121": "var(--bg-root)",
    r"#0F172A": "var(--bg-drawer)",
    r"#1C2230": "var(--bg-card)",
    r"#1E293B": "var(--bg-card-alt)",
    r"#111827": "var(--bg-dark)",
    
    # Text
    r"(?<![-a-zA-Z])white(?![a-zA-Z])": "var(--text-primary)",
    r"#FFFFFF": "var(--text-primary)",
    r"#fff": "var(--text-primary)",
    r"#9CA3AF": "var(--text-secondary)",
    r"#94A3B8": "var(--text-secondary)",
    r"#64748B": "var(--text-secondary)",
    r"#cbd5e1": "var(--text-light)",
    r"#8B5CF6": "var(--primary-light)",
    
    # Primary Colors
    r"#6366F1": "var(--primary)",
    r"#4F46E5": "var(--primary-hover)",
    r"#7C3AED": "var(--primary-dark)",
    
    # Borders & Overlays
    r"rgba\(255,\s*255,\s*255,\s*0\.05\)": "var(--border-light)",
    r"rgba\(255,\s*255,\s*255,\s*0\.1\)": "var(--border-main)",
    r"rgba\(255,\s*255,\s*255,\s*0\.2\)": "var(--border-strong)",
    r"rgba\(255,\s*255,\s*255,\s*0\.3\)": "var(--border-extra)",
    r"rgba\(30,\s*41,\s*59,\s*0\.5\)": "var(--overlay-light)",
    r"rgba\(30,\s*41,\s*59,\s*0\.6\)": "var(--overlay-medium)",
    r"rgba\(30,\s*41,\s*59,\s*0\.8\)": "var(--overlay-strong)",
    r"rgba\(15,\s*23,\s*42,\s*0\.8\)": "var(--overlay-dark)",
    r"rgba\(0,\s*0,\s*0,\s*0\.2\)": "var(--shadow-light)",
    r"rgba\(0,\s*0,\s*0,\s*0\.3\)": "var(--shadow-medium)",
    r"rgba\(0,\s*0,\s*0,\s*0\.5\)": "var(--shadow-strong)",
}

def run_refactor():
    count_files = 0
    count_replacements = 0
    for root, dirs, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith((".jsx", ".js", ".css")):
                filepath = os.path.join(root, file)
                
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                new_content = content
                
                # Careful replacements
                for search_str, replace_str in REPLACEMENTS.items():
                    if search_str == r"(?<![-a-zA-Z])white(?![a-zA-Z])":
                        pattern = re.compile(r"(?<![-a-zA-Z0-9_])white(?![a-zA-Z0-9_])")
                    else:
                        pattern = re.compile(search_str, re.IGNORECASE)
                        
                    new_content, num_subs = pattern.subn(replace_str, new_content)
                    if num_subs > 0:
                        count_replacements += num_subs
                        
                if new_content != content:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    count_files += 1

    print(f"Refactored {count_files} files with {count_replacements} replacements.")

if __name__ == "__main__":
    run_refactor()
