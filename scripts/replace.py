import re


file_path = 'c:/Users/GIGABYTE/Downloads/USMBNC OT 20252026/index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace splashing base64 image
content = re.sub(
    r'<img id="splashKnight" src="data:image/png;base64,[^"]+"',
    '<img id="splashKnight" src="knight.png"',
    content
)

# 2. Add OT LOGO.png to the navbar
content = content.replace(
    '<span class="nav-logo-icon">♛</span>',
    '<img src="OT LOGO.png" alt="Logo" style="height: 35px; width: auto; margin-right: 5px; filter: drop-shadow(0 0 8px #d4a843);">'
)

# 3. Modify tournament banner CSS to use the specific images
content = content.replace(
    'background: linear-gradient(135deg, #3d0c0c, #8b1a1a, #5a0e0e);',
    "background: linear-gradient(135deg, rgba(61,12,12,0.8), rgba(139,26,26,0.8)), url('Individual.png') center/cover no-repeat;"
)
content = content.replace(
    'background: linear-gradient(135deg, #0c1a3d, #1a2d8b, #0e1a5a);',
    "background: linear-gradient(135deg, rgba(12,26,61,0.8), rgba(26,45,139,0.8)), url('Team.png') center/cover no-repeat;"
)

# 4. Integrate the main posters above the tournament cards
poster_html = '''
    <div style="text-align: center; margin-bottom: 3rem;" class="reveal">
      <img src="OT MAIN POSTER_INDIVIDUAL.png" alt="Individual Poster" style="max-width: 45%; max-height: 600px; margin-right: 2%; border: 1px solid var(--gold-dark); border-radius: 4px; box-shadow: 0 0 20px rgba(201,168,76,0.3); object-fit: contain;" />
      <img src="OT MAIN POSTER_TEAM.png" alt="Team Poster" style="max-width: 45%; max-height: 600px; border: 1px solid var(--gold-dark); border-radius: 4px; box-shadow: 0 0 20px rgba(201,168,76,0.3); object-fit: contain;" />
    </div>
'''
content = content.replace('<div class="tournament-grid">', poster_html + '\n    <div class="tournament-grid">')

# 5. Add brochure links in the FAQ section
brochure_links_html = '''
      <a href="OT 25_26 Individual Brochure .pdf" target="_blank" class="brochure-btn">
        📖 Individual Brochure
      </a>
      <a href="OT 25_26 Team Brochure.pdf" target="_blank" class="brochure-btn">
        📖 Team Brochure
      </a>
'''

# Because index.html uses exact spacing, we can just replace the start of the links block.
content = content.replace(
    '<a href="https://docs.google.com/forms/d/1alBHFTWJEzbvU4OXnnHtWEYPxxvnpMnEpHpDpZPRzM0/viewform" target="_blank" class="brochure-btn">',
    brochure_links_html + '      <a href="https://docs.google.com/forms/d/1alBHFTWJEzbvU4OXnnHtWEYPxxvnpMnEpHpDpZPRzM0/viewform" target="_blank" class="brochure-btn">'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
