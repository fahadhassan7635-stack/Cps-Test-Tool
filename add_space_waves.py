import os, glob, re

for filepath in glob.glob('src/pages/*.tsx'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '/voyager-game' in content and '/space-waves' not in content:
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            new_lines.append(line)
            if '{ label: \'Voyager Game\'' in line and 'href: \'/voyager-game\'' in line:
                # Find indentation
                indent = line[:len(line) - len(line.lstrip())]
                
                width_match = re.search(r'width="(\d+)"', line)
                height_match = re.search(r'height="(\d+)"', line)
                w = width_match.group(1) if width_match else '36'
                h = height_match.group(1) if height_match else '36'
                
                wave_svg = f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="{w}" height="{h}"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>'
                
                comma = ',' if line.rstrip().endswith(',') else ''
                
                new_line = indent + f"{{ label: 'Space Waves', href: '/space-waves', icon: {wave_svg} }}{comma}"
                
                new_lines.append(new_line)
                
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f'Updated {filepath}')
