import os
import json
import time
import zipfile
import xml.etree.ElementTree as ET

# 1. Load Excel Coordinates
def load_excel_cities(filepath='Biblical Cities Coordinates.xlsx'):
    abs_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), filepath)
    if not os.path.exists(abs_path):
        abs_path = filepath
        
    with zipfile.ZipFile(abs_path) as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                t = si.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                shared_strings.append(t.text if t is not None else '')
        
        sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = sheet_tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData/{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
        
        cities = {}
        for r in rows[1:]:
            row_vals = []
            for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                val = v.text if v is not None else ''
                t = c.attrib.get('t')
                if t == 's' and val:
                    val = shared_strings[int(val)]
                row_vals.append(val)
            if len(row_vals) >= 4:
                label = row_vals[0].strip()
                modern = row_vals[1].strip()
                lat_str = row_vals[2].strip()
                lng_str = row_vals[3].strip()
                
                try:
                    lat = float(lat_str.replace('°', '').replace('N', '').replace('S', '-').strip())
                    if 'S' in lat_str:
                        lat = -abs(lat)
                    lng = float(lng_str.replace('°', '').replace('E', '').replace('W', '-').strip())
                    if 'W' in lng_str:
                        lng = -abs(lng)
                    
                    coord = [round(lat, 5), round(lng, 5)]
                    cities[label] = coord
                    
                    # Split label if it contains parentheses
                    if '(' in label:
                        clean_name = label.split('(')[0].strip()
                        cities[clean_name] = coord
                        inside_paren = label.split('(')[1].split(')')[0].strip()
                        cities[inside_paren] = coord
                    else:
                        cities[label] = coord
                except Exception as ex:
                    print(f"Error parsing row {label}: {ex}")
        return cities

C = load_excel_cities()

# Supplemental Coordinates for places not in the Israel/Jordan Excel sheet or specific natural sites
C.update({
    # Ancient Near East / Mesopotamia / Anatolia
    'Eden Region': [38.5000, 42.5000],
    'Mt. Ararat': [39.7025, 44.2992],
    'Ur': [30.9628, 46.1031],
    'Haran': [36.8667, 39.0167],
    'Babylon': [32.5364, 44.4208],
    'Nineveh': [36.3587, 43.1528],
    'Susa': [32.1892, 48.2575],
    'Shushan': [32.1892, 48.2575],
    'River Chebar': [32.1250, 45.2310],
    
    # Egypt / Sinai Peninsula
    'Egypt / Nile Delta': [30.1000, 31.3000],
    'Succoth': [30.5500, 32.0833],
    'Etham': [30.2000, 32.3500],
    'Red Sea Crossing': [29.9667, 32.5500],
    'Marah': [29.3500, 32.9000],
    'Elim': [29.3000, 33.0000],
    'Wilderness of Sin': [28.9500, 33.3000],
    'Rephidim': [28.6500, 33.7000],
    'Kadesh-barnea': [30.6483, 34.4239],
    'Mount Hor': [30.3167, 35.4167],
    'Punon': [30.6272, 35.4983],
    
    # Canaan / Levant specific locations
    'Sodom': [31.1500, 35.4000],
    'Penuel': [32.1931, 35.7039],
    'Valley of Elah': [31.6811, 34.9669],
    'Mount Gilboa': [32.5033, 35.4194],
    'Mount Tabor': [32.6867, 35.3900],
    'Well of Harod': [32.5500, 35.3833],
    'Mount Carmel': [32.7300, 35.0500],
    'Mount Hermon': [33.4167, 35.8500],
    'Sychar': [32.2100, 35.2800],
    'Mount of Beatitudes': [32.8800, 35.5500],
    'Wilderness of Judea': [31.8000, 35.4000],
    'Emmaus': [31.8400, 34.9900],
    'Garden of Gethsemane': [31.7794, 35.2397],
    'Golgotha': [31.7785, 35.2296],
    'Mount of Olives': [31.7780, 35.2440],
    'Pool of Siloam': [31.7704, 35.2346],
    'Antonia Fortress': [31.7794, 35.2344],
    'Samaria': [32.2764, 35.1969],
    'Bethabara': [31.8389, 35.5469],
    
    # Syria / Asia Minor / Greece / Italy
    'Antioch': [36.2021, 36.1606],
    'Antioch in Syria': [36.2021, 36.1606],
    'Seleucia': [36.1167, 35.9167],
    'Salamis': [35.1833, 33.9000],
    'Paphos': [34.7720, 32.4297],
    'Perga': [36.9611, 30.8528],
    'Pisidian Antioch': [38.3056, 31.1897],
    'Iconium': [37.8714, 32.4847],
    'Lystra': [37.5833, 32.4500],
    'Derbe': [37.3500, 33.3667],
    'Troas': [39.7561, 26.1558],
    'Philippi': [41.0131, 24.2867],
    'Neapolis': [40.9367, 24.4117],
    'Thessalonica': [40.6401, 22.9444],
    'Beroea': [40.5244, 22.2033],
    'Athens': [37.9722, 23.7236],
    'Areopagus': [37.9722, 23.7236],
    'Corinth': [37.9056, 22.8800],
    'Cenchreae': [37.8833, 22.9833],
    'Ephesus': [37.9400, 27.3400],
    'Miletus': [37.5306, 27.2781],
    'Patmos': [37.3167, 26.5500],
    'Myra': [36.2578, 29.9847],
    'Fair Havens': [34.9333, 24.8167],
    'Malta': [35.9397, 14.4014],
    'Syracuse': [37.0755, 15.2866],
    'Rhegium': [38.1114, 15.6472],
    'Puteoli': [40.8222, 14.1222],
    'Rome': [41.8902, 12.4922],
    'Three Taverns': [41.5667, 12.9833],
    'Forum of Appius': [41.4833, 13.0667],
})

print(f"Total city coordinate keys ready: {len(C)}")
