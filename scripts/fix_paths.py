import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix knight.png
    content = content.replace('src="knight.png"', 'src="images/knight.png"')

    # Fix case for Logo folder
    content = content.replace('images/logo/', 'images/Logo/')
    content = content.replace('images/logo ', 'images/Logo ')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('index.html')
fix_file('team.html')
print("Paths fixed!")
