import re

with open('index_ref.html', 'r', encoding='utf-8') as f:
    html = f.read()
print('HTML woff2:', re.findall(r'/[^"\'\s]+\.woff2', html))

with open('ref_assets/style1.css', 'r', encoding='utf-8') as f:
    css = f.read()
print('CSS woff2:', re.findall(r'url\([^)]+\)', css))
