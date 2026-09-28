import os
import json
import time
from build_dataset import C

CATEGORY_COLORS = {
    'Patriarchs': '#f59e0b',
    'Exodus': '#f97316',
    'David/Solomon': '#8b5cf6',
    'Jesus': '#38bdf8',
    'Apostles': '#10b981',
    'Other': '#64748b',
}

def make_point(city_name):
    if city_name not in C:
        raise KeyError(f"City '{city_name}' not found in coordinate dictionary!")
    return {
        'type': 'point',
        'point': C[city_name]
    }

def make_path(city_names):
    coords = []
    for city in city_names:
        if city not in C:
            raise KeyError(f"Path step '{city}' not found in coordinate dictionary!")
        coords.append(C[city])
    return {
        'type': 'path',
        'path': coords
    }

RAW_EVENTS = [
    # ==========================================
    # PATRIARCHS (17 Events)
    # ==========================================
    {
        'id': 'patriarchs-adam-creation-4026bce',
        'title': 'Creation of Adam and the Garden of Eden',
        'category': 'Patriarchs',
        'geo': make_point('Eden Region'),
        'startDate': {'year': -4026, 'precision': 'year', 'label': 'Autumn 4026 B.C.E.'},
        'notes': "Creation of Adam in the region of the Euphrates and Tigris (Eden). Genesis 2:7-15. Insight on the Scriptures, Vol. 1, 'Chronology', pp. 440-447; Vol. 1, 'Adam', pp. 44-48.",
        'tags': ['Creation', 'Adam', 'Eden', 'Genesis']
    },
    {
        'id': 'patriarchs-global-deluge-2370bce',
        'title': 'The Global Deluge and Ark on Mount Ararat',
        'category': 'Patriarchs',
        'geo': make_point('Mt. Ararat'),
        'startDate': {'year': -2370, 'precision': 'year'},
        'endDate': {'year': -2369, 'precision': 'year', 'label': '2370–2369 B.C.E.'},
        'notes': "Global Deluge inundates the earth. Ark rests on the mountains of Ararat. Genesis 7:11; 8:4. Insight on the Scriptures, Vol. 1, 'Deluge', pp. 609-612; Vol. 1, 'Ararat', pp. 139-140.",
        'tags': ['Flood', 'Noah', 'Ararat', 'Deluge']
    },
    {
        'id': 'patriarchs-tower-babel-2269bce',
        'title': 'Tower of Babel and Dispersion of Mankind',
        'category': 'Patriarchs',
        'geo': make_point('Babylon'),
        'startDate': {'year': -2269, 'isCirca': True, 'precision': 'year', 'label': 'c. 2269 B.C.E.'},
        'notes': "Construction of the Tower of Babel in Shinar; Jehovah confuses human speech and scatters mankind during the days of Peleg. Genesis 10:25; 11:1-9. Insight on the Scriptures, Vol. 1, 'Babel', p. 238; 'Chronology', p. 448.",
        'tags': ['Babel', 'Babylon', 'Peleg', 'Languages']
    },
    {
        'id': 'patriarchs-abram-journey-ur-haran-1943bce',
        'title': "Abram's Journey from Ur of the Chaldeans to Haran",
        'category': 'Patriarchs',
        'geo': make_path(['Ur', 'Haran']),
        'startDate': {'year': -1943, 'isCirca': True, 'precision': 'year', 'label': 'c. 1943 B.C.E.'},
        'notes': "Terah leads Abram, Sarai, and Lot out of Ur to settle in Haran until Terah's death. Genesis 11:31, 32; Acts 7:2-4. Insight on the Scriptures, Vol. 1, 'Abraham', pp. 28-33; 'Haran', p. 1033.",
        'tags': ['Abraham', 'Ur', 'Haran', 'Journey']
    },
    {
        'id': 'patriarchs-abrahamic-covenant-shechem-1943bce',
        'title': 'Abrahamic Covenant Validated at Shechem',
        'category': 'Patriarchs',
        'geo': make_point('Shechem'),
        'startDate': {'year': -1943, 'month': 4, 'day': 14, 'precision': 'day', 'label': 'Nisan 14, 1943 B.C.E.'},
        'notes': "75-year-old Abram crosses the Euphrates into Canaan; Jehovah validates the Abrahamic Covenant at the great trees of Moreh at Shechem: 'To your offspring I will give this land.' Genesis 12:1-7; Galatians 3:17. Insight on the Scriptures, Vol. 1, 'Abraham', pp. 29-30; 'Chronology', p. 448.",
        'tags': ['Abraham', 'Covenant', 'Shechem', 'Canaan']
    },
    {
        'id': 'patriarchs-abraham-altar-bethel-1943bce',
        'title': 'Abraham Builds Altar Between Bethel and Ai',
        'category': 'Patriarchs',
        'geo': make_point('Bethel'),
        'startDate': {'year': -1943, 'precision': 'year', 'label': '1943 B.C.E.'},
        'notes': "Abram encamps between Bethel on the west and Ai on the east, builds an altar to Jehovah and calls upon the name of Jehovah. Genesis 12:8; 13:3, 4. Insight on the Scriptures, Vol. 1, 'Bethel', pp. 295-296.",
        'tags': ['Abraham', 'Bethel', 'Altar', 'Worship']
    },
    {
        'id': 'patriarchs-abram-lot-separate-hebron-1940bce',
        'title': 'Abram and Lot Separate; Abram Settles at Hebron',
        'category': 'Patriarchs',
        'geo': make_point('Hebron'),
        'startDate': {'year': -1940, 'isCirca': True, 'precision': 'year', 'label': 'c. 1940 B.C.E.'},
        'notes': "After herdsmen quarrel, Abram generously allows Lot first choice of grazing land; Lot moves toward Sodom, while Abram settles among the big trees of Mamre at Hebron. Genesis 13:5-18. Insight on the Scriptures, Vol. 1, 'Hebron', pp. 1076-1077.",
        'tags': ['Abraham', 'Lot', 'Hebron', 'Mamre']
    },
    {
        'id': 'patriarchs-rescue-lot-dan-melchizedek-1935bce',
        'title': 'Rescue of Lot at Dan and Blessing of Melchizedek',
        'category': 'Patriarchs',
        'geo': make_path(['Hebron', 'Dan', 'Damascus', 'Jerusalem']),
        'startDate': {'year': -1935, 'isCirca': True, 'precision': 'year', 'label': 'c. 1935 B.C.E.'},
        'notes': "Abram pursues Mesopotamian coalition up to Dan and Hobah, rescues Lot, and is blessed at Salem by Melchizedek, priest of the Most High God, to whom Abram gives a tenth of everything. Genesis 14:1-24; Hebrews 7:1-7. Insight on the Scriptures, Vol. 1, 'Dan', p. 574; Vol. 2, 'Melchizedek', pp. 366-368.",
        'tags': ['Abraham', 'Dan', 'Melchizedek', 'Salem', 'Lot']
    },
    {
        'id': 'patriarchs-destruction-sodom-1919bce',
        'title': 'Destruction of Sodom and Gomorrah',
        'category': 'Patriarchs',
        'geo': make_point('Sodom'),
        'startDate': {'year': -1919, 'precision': 'year', 'label': '1919 B.C.E.'},
        'notes': "Jehovah rains fire and sulfur upon Sodom, Gomorrah, and the Low Plain of Siddim on account of extreme wickedness. Lot and his daughters escape to Zoar. Genesis 19:1-29; Luke 17:28-30. Insight on the Scriptures, Vol. 2, 'Sodom', pp. 983-985.",
        'tags': ['Sodom', 'Gomorrah', 'Lot', 'Judgment']
    },
    {
        'id': 'patriarchs-birth-isaac-beersheba-1918bce',
        'title': 'Birth of Isaac at Beer-sheba',
        'category': 'Patriarchs',
        'geo': make_point('Beer-sheba'),
        'startDate': {'year': -1918, 'precision': 'year', 'label': '1918 B.C.E.'},
        'notes': "Sarah gives birth to Isaac, son of promise, when Abraham is 100 years old, fulfilling Jehovah's word. Genesis 21:1-5. Insight on the Scriptures, Vol. 1, 'Isaac', pp. 1215-1218; 'Chronology', p. 448.",
        'tags': ['Isaac', 'Abraham', 'Sarah', 'Beer-sheba']
    },
    {
        'id': 'patriarchs-isaac-weaning-400yr-affliction-1913bce',
        'title': 'Weaning of Isaac & Start of 400-Year Affliction',
        'category': 'Patriarchs',
        'geo': make_point('Beer-sheba'),
        'startDate': {'year': -1913, 'precision': 'year', 'label': '1913 B.C.E.'},
        'notes': "5-year-old Isaac weaned; Ishmael mocks Isaac, marking the start of the 400-year affliction foretold to Abraham ending at the Exodus in 1513 B.C.E. Genesis 15:13; 21:8-12; Galatians 4:29. Insight on the Scriptures, Vol. 1, 'Chronology', p. 448; Vol. 1, 'Ishmael', p. 1225.",
        'tags': ['Isaac', 'Ishmael', 'Affliction', 'Prophecy']
    },
    {
        'id': 'patriarchs-offering-isaac-moriah-1898bce',
        'title': 'Abraham Offers Isaac on Mount Moriah',
        'category': 'Patriarchs',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -1898, 'isCirca': True, 'precision': 'year', 'label': 'c. 1898 B.C.E.'},
        'notes': "Supreme test of faith on Mount Moriah: Abraham is stopped by an angel from sacrificing Isaac, receiving Jehovah's confirmed sworn covenant. Genesis 22:1-19; Hebrews 11:17-19. Insight on the Scriptures, Vol. 2, 'Moriah', p. 438; Vol. 1, 'Abraham', p. 31.",
        'tags': ['Abraham', 'Isaac', 'Moriah', 'Sacrifice']
    },
    {
        'id': 'patriarchs-sarah-death-machpelah-1881bce',
        'title': 'Death of Sarah & Purchase of Cave of Machpelah',
        'category': 'Patriarchs',
        'geo': make_point('Hebron'),
        'startDate': {'year': -1881, 'precision': 'year', 'label': '1881 B.C.E.'},
        'notes': "Sarah dies at age 127 in Hebron; Abraham buys the cave of Machpelah from Ephron the Hittite for 400 silver shekels as a burial possession. Genesis 23:1-20. Insight on the Scriptures, Vol. 2, 'Machpelah', pp. 290-291.",
        'tags': ['Sarah', 'Machpelah', 'Hebron', 'Burial']
    },
    {
        'id': 'patriarchs-jacob-ladder-bethel-1781bce',
        'title': "Jacob's Dream of the Heavenly Ladder at Bethel",
        'category': 'Patriarchs',
        'geo': make_point('Bethel'),
        'startDate': {'year': -1781, 'precision': 'year', 'label': '1781 B.C.E.'},
        'notes': "Fleeing from Esau to Haran, Jacob sleeps with stone pillow at Luz, dreaming of angels on stairway to heaven. Names site Bethel ('House of God'). Genesis 28:10-22. Insight on the Scriptures, Vol. 1, 'Bethel', p. 296; Vol. 2, 'Jacob', pp. 9-10.",
        'tags': ['Jacob', 'Bethel', 'Dream', 'Vision']
    },
    {
        'id': 'patriarchs-jacob-wrestles-angel-penuel-1761bce',
        'title': 'Jacob Wrestles with an Angel at Penuel',
        'category': 'Patriarchs',
        'geo': make_point('Penuel'),
        'startDate': {'year': -1761, 'precision': 'year', 'label': '1761 B.C.E.'},
        'notes': "Returning to Canaan across the Jabbok, Jacob grapples all night with an angel of God; his name is changed to Israel ('Contender with God'). Genesis 32:22-32; Hosea 12:3, 4. Insight on the Scriptures, Vol. 2, 'Penuel', p. 605; Vol. 2, 'Jacob', p. 11.",
        'tags': ['Jacob', 'Israel', 'Penuel', 'Jabbok']
    },
    {
        'id': 'patriarchs-joseph-sold-dothan-1744bce',
        'title': 'Joseph Sold into Slavery at Dothan',
        'category': 'Patriarchs',
        'geo': make_point('Dothan'),
        'startDate': {'year': -1744, 'precision': 'year', 'label': '1744 B.C.E.'},
        'notes': "17-year-old Joseph is stripped of his striped robe and sold for 20 silver pieces to an Ishmaelite caravan en route to Egypt. Genesis 37:17-28. Insight on the Scriptures, Vol. 1, 'Dothan', p. 651; Vol. 2, 'Joseph', pp. 94-96.",
        'tags': ['Joseph', 'Dothan', 'Egypt', 'Brothers']
    },
    {
        'id': 'patriarchs-jacob-family-moves-egypt-1728bce',
        'title': "Jacob and Household Relocate to Goshen in Egypt",
        'category': 'Patriarchs',
        'geo': make_path(['Beer-sheba', 'Rameses']),
        'startDate': {'year': -1728, 'precision': 'year', 'label': '1728 B.C.E.'},
        'notes': "During the severe 7-year famine, Jacob's household of 70 souls moves to Egypt, settling in the fertile land of Goshen (Rameses) under Joseph's care. Genesis 46:1-27; 47:5, 6. Insight on the Scriptures, Vol. 1, 'Chronology', p. 449; Vol. 1, 'Goshen', p. 987.",
        'tags': ['Jacob', 'Joseph', 'Goshen', 'Egypt']
    },

    # ==========================================
    # EXODUS & CONQUEST (22 Events)
    # ==========================================
    {
        'id': 'exodus-moses-birth-egypt-1593bce',
        'title': 'Birth of Moses in Egypt',
        'category': 'Exodus',
        'geo': make_point('Rameses'),
        'startDate': {'year': -1593, 'precision': 'year', 'label': '1593 B.C.E.'},
        'notes': "Moses born to Amram and Jochebed, hidden 3 months, then placed in papyrus ark on Nile reeds; rescued and adopted by Pharaoh's daughter. Exodus 2:1-10. Insight on the Scriptures, Vol. 2, 'Moses', pp. 434-436; 'Chronology', p. 449.",
        'tags': ['Moses', 'Egypt', 'Nile', 'Birth']
    },
    {
        'id': 'exodus-moses-burning-bush-horeb-1514bce',
        'title': 'Moses at the Burning Bush on Mount Horeb',
        'category': 'Exodus',
        'geo': make_point('Mt. Sinai'),
        'startDate': {'year': -1514, 'precision': 'year', 'label': '1514 B.C.E.'},
        'notes': "After 40 years as shepherd in Midian, 80-year-old Moses is commissioned by Jehovah through burning bush at Horeb to deliver Israel. Exodus 3:1-15; Acts 7:30-34. Insight on the Scriptures, Vol. 1, 'Horeb', p. 1135; Vol. 2, 'Moses', p. 436.",
        'tags': ['Moses', 'Burning Bush', 'Horeb', 'Sinai']
    },
    {
        'id': 'exodus-ten-plagues-zoan-1513bce',
        'title': 'The Ten Plagues on Egypt in the Field of Zoan',
        'category': 'Exodus',
        'geo': make_point('Zoan'),
        'startDate': {'year': -1513, 'month': 3, 'precision': 'month', 'label': 'Early 1513 B.C.E.'},
        'notes': "Jehovah executes judgments on Egypt's false gods through ten plagues in the field of Zoan: water turned to blood, frogs, gnats, gadflies, pestilence, boils, hail, locusts, darkness, and death of firstborn. Exodus 7:14-12:30; Psalm 78:12, 43. Insight on the Scriptures, Vol. 2, 'Plagues on Egypt', pp. 640-644.",
        'tags': ['Plagues', 'Egypt', 'Zoan', 'Moses']
    },
    {
        'id': 'exodus-passover-instituted-rameses-1513bce',
        'title': 'Passover Instituted & Departure from Rameses',
        'category': 'Exodus',
        'geo': make_point('Rameses'),
        'startDate': {'year': -1513, 'month': 4, 'day': 14, 'precision': 'day', 'label': 'Nisan 14, 1513 B.C.E.'},
        'notes': "Israelites slaughter Passover lamb, splash blood on doorposts, and eat roast lamb; Jehovah strikes Egypt's firstborn at midnight, ending the 430-year stay from Abraham's crossing in 1943 B.C.E. Exodus 12:1-42. Insight on the Scriptures, Vol. 2, 'Passover', pp. 581-584; 'Chronology', p. 449.",
        'tags': ['Passover', 'Exodus', 'Rameses', 'Deliverance']
    },
    {
        'id': 'exodus-route-rameses-red-sea-1513bce',
        'title': 'The Exodus Route: Rameses to the Red Sea',
        'category': 'Exodus',
        'geo': make_path(['Rameses', 'Succoth', 'Etham', 'Red Sea Crossing']),
        'startDate': {'year': -1513, 'month': 4, 'day': 15, 'precision': 'day', 'label': 'Nisan 15–18, 1513 B.C.E.'},
        'notes': "Israel marches from Rameses to Succoth, encamps at Etham, then turns to camp before Pi-hahiroth by the Red Sea, guided by pillar of cloud and fire. Exodus 12:37; 13:20; 14:1, 2. Insight on the Scriptures, Vol. 1, 'Exodus', pp. 778-782.",
        'tags': ['Exodus', 'Red Sea', 'Succoth', 'March']
    },
    {
        'id': 'exodus-red-sea-crossing-1513bce',
        'title': 'The Miraculous Crossing of the Red Sea',
        'category': 'Exodus',
        'geo': make_point('Red Sea Crossing'),
        'startDate': {'year': -1513, 'month': 4, 'day': 18, 'precision': 'day', 'label': 'Nisan 18, 1513 B.C.E.'},
        'notes': "Moses stretches rod over sea; Jehovah drives back waters with strong east wind, allowing Israel to walk across on dry seabed. Pharaoh's pursuing chariots are engulfed and drowned. Exodus 14:15-31; 15:1-21. Insight on the Scriptures, Vol. 2, 'Red Sea', pp. 767-769.",
        'tags': ['Red Sea', 'Miracle', 'Deliverance', 'Pharaoh']
    },
    {
        'id': 'exodus-marah-elim-oasis-1513bce',
        'title': 'Bitter Waters of Marah & Encampment at Elim',
        'category': 'Exodus',
        'geo': make_point('Elim'),
        'startDate': {'year': -1513, 'month': 5, 'precision': 'month', 'label': 'Iyyar 1513 B.C.E.'},
        'notes': "Bitter waters of Marah sweetened by throwing a tree into it. Israel advances to Elim oasis, featuring 12 water springs and 70 palm trees. Exodus 15:22-27. Insight on the Scriptures, Vol. 1, 'Elim', p. 710; Vol. 2, 'Marah', p. 320.",
        'tags': ['Marah', 'Elim', 'Oasis', 'Sinai']
    },
    {
        'id': 'exodus-manna-wilderness-sin-1513bce',
        'title': 'Manna Provided in the Wilderness of Sin',
        'category': 'Exodus',
        'geo': make_point('Wilderness of Sin'),
        'startDate': {'year': -1513, 'month': 5, 'day': 15, 'precision': 'day', 'label': 'Iyyar 15, 1513 B.C.E.'},
        'notes': "Exactly one month after leaving Egypt, the people grumble for bread. Jehovah supplies quail at evening and manna like frost on the ground every morning for 40 years. Exodus 16:1-36. Insight on the Scriptures, Vol. 2, 'Sin, Wilderness of', p. 973; 'Manna', pp. 308-309.",
        'tags': ['Manna', 'Wilderness of Sin', 'Provision', 'Sabbath']
    },
    {
        'id': 'exodus-rephidim-water-amalek-1513bce',
        'title': 'Water from Rock at Rephidim & Defeat of Amalek',
        'category': 'Exodus',
        'geo': make_point('Rephidim'),
        'startDate': {'year': -1513, 'month': 5, 'label': 'Iyyar/Sivan 1513 B.C.E.'},
        'notes': "Moses strikes rock at Horeb to bring forth water at Massah/Meribah. Amalekites attack Israel; Joshua defeats them while Aaron and Hur hold up Moses' arms holding rod of God. Exodus 17:1-16. Insight on the Scriptures, Vol. 2, 'Rephidim', p. 779; Vol. 1, 'Amalek, Amalekites', pp. 86-88.",
        'tags': ['Rephidim', 'Water', 'Amalek', 'Joshua']
    },
    {
        'id': 'exodus-law-covenant-sinai-1513bce',
        'title': 'Law Covenant Inaugurated at Mount Sinai',
        'category': 'Exodus',
        'geo': make_point('Mt. Sinai'),
        'startDate': {'year': -1513, 'month': 6, 'precision': 'month', 'label': 'Sivan 1513 B.C.E.'},
        'notes': "Jehovah descends on Mount Sinai in fire and thunder; proclaims Ten Commandments and inaugurates Law Covenant with sacrificial blood. Exodus 19:1-24:8; Galatians 3:19-25. Insight on the Scriptures, Vol. 2, 'Sinai', pp. 973-976; 'Covenant', pp. 520-525.",
        'tags': ['Sinai', 'Ten Commandments', 'Law', 'Covenant']
    },
    {
        'id': 'exodus-tabernacle-dedicated-sinai-1512bce',
        'title': 'Tabernacle Erected and Dedicated at Mount Sinai',
        'category': 'Exodus',
        'geo': make_point('Mt. Sinai'),
        'startDate': {'year': -1512, 'month': 4, 'day': 1, 'precision': 'day', 'label': 'Nisan 1, 1512 B.C.E.'},
        'notes': "Tent of meeting fully erected; Aaron and sons installed as priests during 7-day ceremony. Jehovah's glory cloud fills tabernacle. Exodus 40:1-38; Leviticus 8:1-36. Insight on the Scriptures, Vol. 2, 'Tabernacle', pp. 1058-1062.",
        'tags': ['Tabernacle', 'Aaron', 'Priesthood', 'Sinai']
    },
    {
        'id': 'exodus-spies-kadesh-barnea-1512bce',
        'title': '12 Spies Sent Out & Rebellion at Kadesh-barnea',
        'category': 'Exodus',
        'geo': make_point('Kadesh-barnea'),
        'startDate': {'year': -1512, 'month': 8, 'label': 'Autumn 1512 B.C.E.'},
        'notes': "12 spies explore Canaan for 40 days; 10 bring faithless report causing rebellion. Jehovah sentences the faithless generation to 40 years of wandering in the wilderness. Numbers 13:1-14:38. Insight on the Scriptures, Vol. 2, 'Kadesh, Kadesh-barnea', pp. 143-144; 'Spy', p. 1017.",
        'tags': ['Kadesh-barnea', 'Spies', 'Wandering', 'Rebellion']
    },
    {
        'id': 'exodus-aaron-death-mount-hor-1473bce',
        'title': 'Death of High Priest Aaron on Mount Hor',
        'category': 'Exodus',
        'geo': make_point('Mount Hor'),
        'startDate': {'year': -1473, 'month': 8, 'day': 1, 'precision': 'day', 'label': 'Ab 1, 1473 B.C.E.'},
        'notes': "In 40th year of wandering, Aaron dies on Mount Hor at age 123; Moses vests Eleazar as High Priest. Israel mourns 30 days. Numbers 20:22-29; 33:38. Insight on the Scriptures, Vol. 1, 'Hor, Mount', p. 1134; 'Aaron', pp. 9-11.",
        'tags': ['Aaron', 'Mount Hor', 'High Priest', 'Death']
    },
    {
        'id': 'exodus-copper-serpent-punon-1473bce',
        'title': 'The Copper Serpent Lifted Up at Punon',
        'category': 'Exodus',
        'geo': make_point('Punon'),
        'startDate': {'year': -1473, 'precision': 'year', 'label': '1473 B.C.E.'},
        'notes': "Israel complains of manna; venomous snakes bite the people. Moses crafts copper serpent on pole; those bitten who look upon it live, foreshadowing Christ's impalement. Numbers 21:4-9; John 3:14, 15. Insight on the Scriptures, Vol. 1, 'Copper Serpent', pp. 504-505; Vol. 2, 'Punon', p. 718.",
        'tags': ['Copper Serpent', 'Punon', 'Faith', 'Healing']
    },
    {
        'id': 'exodus-moses-dies-mount-nebo-1473bce',
        'title': "Moses Views Promised Land & Dies on Mount Nebo",
        'category': 'Exodus',
        'geo': make_point('Mt. Nebo'),
        'startDate': {'year': -1473, 'month': 2, 'label': 'Shebat 1473 B.C.E.'},
        'notes': "Moses delivers farewell sermons recorded in Deuteronomy, views Promised Land from Pisgah's summit on Mount Nebo, and dies at age 120; Jehovah buries him. Deuteronomy 1:3; 34:1-8. Insight on the Scriptures, Vol. 2, 'Nebo, Mount', p. 482; 'Moses', pp. 440-441.",
        'tags': ['Moses', 'Mount Nebo', 'Pisgah', 'Deuteronomy']
    },
    {
        'id': 'exodus-cross-jordan-camp-gilgal-1473bce',
        'title': 'Israel Crosses Jordan & Encamps at Gilgal',
        'category': 'Exodus',
        'geo': make_point('Gilgal'),
        'startDate': {'year': -1473, 'month': 4, 'day': 10, 'precision': 'day', 'label': 'Nisan 10, 1473 B.C.E.'},
        'notes': "Jordan waters dammed at Adam; Israel crosses on dry bed behind Ark. Twelve memorial stones erected at Gilgal; circumcision renewed and Passover kept. Joshua 3:1-5:12. Insight on the Scriptures, Vol. 1, 'Gilgal', pp. 950-951; 'Jordan', pp. 1201-1204.",
        'tags': ['Jordan', 'Gilgal', 'Joshua', 'Passover']
    },
    {
        'id': 'exodus-fall-of-jericho-1473bce',
        'title': 'The Fall of the Fortified City of Jericho',
        'category': 'Exodus',
        'geo': make_point('Jericho'),
        'startDate': {'year': -1473, 'month': 4, 'precision': 'month', 'label': 'Nisan 1473 B.C.E.'},
        'notes': "Israel marches around Jericho for 7 days; on 7th day after seven circuits, horns blow, people shout, and city walls collapse flat. Rahab and family spared. Joshua 6:1-27. Insight on the Scriptures, Vol. 2, 'Jericho', pp. 33-36.",
        'tags': ['Jericho', 'Walls', 'Rahab', 'Victory']
    },
    {
        'id': 'exodus-sun-stands-still-gibeon-1473bce',
        'title': 'The Sun Stands Still over Gibeon',
        'category': 'Exodus',
        'geo': make_point('Gibeon'),
        'startDate': {'year': -1473, 'precision': 'year', 'label': '1473 B.C.E.'},
        'notes': "Joshua defends allied Gibeon against 5 Amorite kings; hailstones fall and sun halts over Gibeon while moon halts over Aijalon valley for nearly whole day. Joshua 10:1-15. Insight on the Scriptures, Vol. 1, 'Gibeon', pp. 944-946; 'Sun', p. 1041.",
        'tags': ['Gibeon', 'Sun', 'Joshua', 'Amorites']
    },
    {
        'id': 'exodus-tabernacle-stationed-shiloh-1467bce',
        'title': 'Tabernacle Stationed at Shiloh',
        'category': 'Exodus',
        'geo': make_point('Shiloh'),
        'startDate': {'year': -1467, 'isCirca': True, 'precision': 'year', 'label': 'c. 1467 B.C.E.'},
        'notes': "Following major conquests, tent of meeting is set up permanently at Shiloh, where land allotments are divided among remaining tribes. Joshua 18:1-10. Insight on the Scriptures, Vol. 2, 'Shiloh', pp. 928-930.",
        'tags': ['Shiloh', 'Tabernacle', 'Allotment', 'Canaan']
    },
    {
        'id': 'exodus-deborah-barak-mount-tabor-1258bce',
        'title': 'Deborah and Barak Defeat Sisera at Mount Tabor',
        'category': 'Exodus',
        'geo': make_point('Mount Tabor'),
        'startDate': {'year': -1258, 'isCirca': True, 'precision': 'year', 'label': 'c. 1258 B.C.E.'},
        'notes': "Deborah and Barak rally 10,000 men on Mount Tabor; flash flood down Kishon valley disables Sisera's 900 iron chariots; Sisera flees on foot and is slain by Jael. Judges 4:1-24; 5:1-31. Insight on the Scriptures, Vol. 1, 'Barak', pp. 256-257; Vol. 2, 'Tabor', p. 1063.",
        'tags': ['Deborah', 'Barak', 'Tabor', 'Kishon']
    },
    {
        'id': 'exodus-gideon-300-well-harod-1191bce',
        'title': 'Gideon and His 300 Defeat Midian at Well of Harod',
        'category': 'Exodus',
        'geo': make_point('Well of Harod'),
        'startDate': {'year': -1191, 'isCirca': True, 'precision': 'year', 'label': 'c. 1191 B.C.E.'},
        'notes': "Gideon sifts army to 300 alert men who lap water; with horns, shattered jars, and torches, they surprise Midianites at night, throwing enemy into panicked flight. Judges 7:1-25. Insight on the Scriptures, Vol. 1, 'Gideon', pp. 939-941; 'Harod, Well of', p. 1038.",
        'tags': ['Gideon', 'Harod', 'Midian', 'Victory']
    },
    {
        'id': 'exodus-samson-feasts-death-gaza-1098bce',
        'title': 'Samson Pulls Down Philistine Temple at Gaza',
        'category': 'Exodus',
        'geo': make_point('Gaza'),
        'startDate': {'year': -1098, 'isCirca': True, 'precision': 'year', 'label': 'c. 1098 B.C.E.'},
        'notes': "Blinded and bound in Gaza, Samson prays for strength, dislodges two central pillars supporting Dagon's temple, slaying more Philistine lords in his death than during his life. Judges 16:21-31. Insight on the Scriptures, Vol. 2, 'Samson', pp. 848-850; Vol. 1, 'Gaza', p. 898.",
        'tags': ['Samson', 'Gaza', 'Philistines', 'Judges']
    },

    # ==========================================
    # DAVID & SOLOMON (15 Events)
    # ==========================================
    {
        'id': 'david-solomon-saul-anointed-gilgal-1117bce',
        'title': "Saul Confirmed as Israel's First King at Gilgal",
        'category': 'David/Solomon',
        'geo': make_point('Gilgal'),
        'startDate': {'year': -1117, 'precision': 'year', 'label': '1117 B.C.E.'},
        'notes': "Samuel gathers Israel at Gilgal following rescue of Jabesh-gilead; confirms Saul as king before Jehovah with peace offerings. 1 Samuel 11:12-15; 12:1-25. Insight on the Scriptures, Vol. 2, 'Saul', pp. 869-873; Vol. 1, 'Chronology', p. 450.",
        'tags': ['Saul', 'King', 'Gilgal', 'Samuel']
    },
    {
        'id': 'david-solomon-david-anointed-bethlehem-1107bce',
        'title': 'David Anointed by Samuel at Bethlehem',
        'category': 'David/Solomon',
        'geo': make_point('Bethlehem'),
        'startDate': {'year': -1107, 'isCirca': True, 'precision': 'year', 'label': 'c. 1107 B.C.E.'},
        'notes': "Samuel visits Jesse in Bethlehem; passing over seven older sons, Jehovah directs Samuel to anoint youthful shepherd David: 'Get up, anoint him, for this is the one!' 1 Samuel 16:1-13. Insight on the Scriptures, Vol. 1, 'David', pp. 586-595; 'Bethlehem', pp. 300-302.",
        'tags': ['David', 'Bethlehem', 'Samuel', 'Anointing']
    },
    {
        'id': 'david-solomon-david-goliath-valley-elah-1100bce',
        'title': 'David Defeats Goliath in the Valley of Elah',
        'category': 'David/Solomon',
        'geo': make_point('Valley of Elah'),
        'startDate': {'year': -1100, 'isCirca': True, 'precision': 'year', 'label': 'c. 1100 B.C.E.'},
        'notes': "David confronts 9-foot Philistine champion Goliath in the Valley of Elah with sling and stones: 'I come to you in the name of Jehovah of armies.' Goliath struck down in forehead. 1 Samuel 17:1-54. Insight on the Scriptures, Vol. 1, 'Elah, Low Plain of', p. 696; 'Goliath', pp. 977-978.",
        'tags': ['David', 'Goliath', 'Elah', 'Faith']
    },
    {
        'id': 'david-solomon-david-spares-saul-engedi-1085bce',
        'title': "David Spares Saul's Life at En-gedi",
        'category': 'David/Solomon',
        'geo': make_point('En-gedi'),
        'startDate': {'year': -1085, 'isCirca': True, 'precision': 'year', 'label': 'c. 1085 B.C.E.'},
        'notes': "Hiding in caves at the crags of wild goats in En-gedi, David cuts off hem of Saul's robe but refuses to harm 'the anointed of Jehovah.' 1 Samuel 24:1-22. Insight on the Scriptures, Vol. 1, 'En-gedi', p. 726; 'David', p. 589.",
        'tags': ['David', 'Saul', 'En-gedi', 'Mercy']
    },
    {
        'id': 'david-solomon-saul-jonathan-slain-gilboa-1077bce',
        'title': 'Saul and Jonathan Slain on Mount Gilboa',
        'category': 'David/Solomon',
        'geo': make_point('Mount Gilboa'),
        'startDate': {'year': -1077, 'precision': 'year', 'label': '1077 B.C.E.'},
        'notes': "Philistines overwhelm Israel on Mount Gilboa; Jonathan is killed, and wounded Saul falls on his own sword. David mourns with song 'The Bow.' 1 Samuel 31:1-6; 2 Samuel 1:17-27. Insight on the Scriptures, Vol. 1, 'Gilboa', p. 948; Vol. 2, 'Saul', p. 873.",
        'tags': ['Saul', 'Jonathan', 'Gilboa', 'David']
    },
    {
        'id': 'david-solomon-david-reigns-hebron-1077bce',
        'title': 'David Begins Reign Over Judah at Hebron',
        'category': 'David/Solomon',
        'geo': make_point('Hebron'),
        'startDate': {'year': -1077, 'precision': 'year'},
        'endDate': {'year': -1070, 'precision': 'year', 'label': '1077–1070 B.C.E.'},
        'notes': "30-year-old David is anointed king over Judah in Hebron, reigning 7 years and 6 months before all 12 tribes unite under him. 2 Samuel 2:1-4; 5:1-5. Insight on the Scriptures, Vol. 1, 'Hebron', p. 1077; 'David', pp. 589-590.",
        'tags': ['David', 'Hebron', 'Judah', 'King']
    },
    {
        'id': 'david-solomon-capture-zion-jerusalem-capital-1070bce',
        'title': 'David Captures Zion and Establishes Jerusalem Capital',
        'category': 'David/Solomon',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -1070, 'precision': 'year', 'label': '1070 B.C.E.'},
        'notes': "David captures Jebusite fortress of Zion via water shaft, fortifies city, and establishes Jerusalem as royal capital ('City of David'). 2 Samuel 5:6-10; 1 Chronicles 11:4-9. Insight on the Scriptures, Vol. 2, 'Jerusalem', pp. 38-42; 'Zion', pp. 1234-1235.",
        'tags': ['Jerusalem', 'Zion', 'David', 'Capital']
    },
    {
        'id': 'david-solomon-ark-brought-zion-1070bce',
        'title': 'Ark of the Covenant Brought to Mount Zion',
        'category': 'David/Solomon',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -1070, 'precision': 'year', 'label': '1070 B.C.E.'},
        'notes': "David brings the sacred Ark of the Covenant up from Obed-edom's home into a dedicated tent on Mount Zion with joyful shouting, horns, and sacred dancing. 2 Samuel 6:1-19. Insight on the Scriptures, Vol. 1, 'Ark of the Covenant', pp. 165-167.",
        'tags': ['Ark', 'Zion', 'Jerusalem', 'David']
    },
    {
        'id': 'david-solomon-threshing-floor-araunah-1040bce',
        'title': 'David Buys Threshing Floor of Araunah on Mount Moriah',
        'category': 'David/Solomon',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -1040, 'isCirca': True, 'precision': 'year', 'label': 'c. 1040 B.C.E.'},
        'notes': "Following census plague, David purchases threshing floor of Araunah (Ornan) on Mount Moriah, builds an altar to stop the pestilence, dedicating future site for temple. 2 Samuel 24:18-25; 1 Chronicles 21:18-26. Insight on the Scriptures, Vol. 1, 'Araunah', pp. 142-143.",
        'tags': ['Araunah', 'Moriah', 'Temple Site', 'David']
    },
    {
        'id': 'david-solomon-solomon-anointed-gihon-1037bce',
        'title': 'Solomon Anointed King at Gihon Spring',
        'category': 'David/Solomon',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -1037, 'precision': 'year', 'label': '1037 B.C.E.'},
        'notes': "Adonijah attempts to seize throne; David commands Nathan and Zadok to mount Solomon on royal mule and anoint him king at Gihon Spring amid joyful trumpets: 'Long live King Solomon!' 1 Kings 1:32-40. Insight on the Scriptures, Vol. 2, 'Solomon', pp. 988-994; Vol. 1, 'Gihon', p. 948.",
        'tags': ['Solomon', 'Gihon', 'Anointing', 'King']
    },
    {
        'id': 'david-solomon-prayer-wisdom-gibeon-1037bce',
        'title': "Solomon's Prayer for Wisdom at Gibeon",
        'category': 'David/Solomon',
        'geo': make_point('Gibeon'),
        'startDate': {'year': -1037, 'precision': 'year', 'label': '1037 B.C.E.'},
        'notes': "Solomon offers 1,000 burnt offerings at Gibeon; Jehovah appears in dream saying: 'Ask what you wish.' Solomon requests 'an obedient heart to judge your people.' 1 Kings 3:4-15; 2 Chronicles 1:3-12. Insight on the Scriptures, Vol. 1, 'Gibeon', p. 946; Vol. 2, 'Solomon', p. 989.",
        'tags': ['Solomon', 'Gibeon', 'Wisdom', 'Prayer']
    },
    {
        'id': 'david-solomon-construction-temple-moriah-1034bce',
        'title': "Construction of Solomon's Temple on Mount Moriah",
        'category': 'David/Solomon',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -1034, 'precision': 'year'},
        'endDate': {'year': -1027, 'precision': 'year', 'label': '1034–1027 B.C.E.'},
        'notes': "In 4th year of Solomon's reign, 480 years after Exodus, construction begins on Mount Moriah; built with stones prepared at quarry so no hammer sound is heard on site; finished in 7.5 years. 1 Kings 6:1, 37, 38; 2 Chronicles 3:1, 2. Insight on the Scriptures, Vol. 2, 'Temple', pp. 1076-1080; 'Chronology', p. 450.",
        'tags': ['Temple', 'Solomon', 'Moriah', 'Construction']
    },
    {
        'id': 'david-solomon-dedication-temple-1026bce',
        'title': "Dedication of Solomon's Temple in Jerusalem",
        'category': 'David/Solomon',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -1026, 'month': 10, 'precision': 'month', 'label': 'Ethanim 1026 B.C.E.'},
        'notes': "Ark brought into Most Holy; glory cloud of Jehovah fills temple. Solomon offers magnificent dedicatory prayer; fire descends from heaven consuming burnt offering. 1 Kings 8:1-66; 2 Chronicles 7:1-10. Insight on the Scriptures, Vol. 2, 'Temple', pp. 1078-1079; 'Ethanim', p. 764.",
        'tags': ['Temple', 'Dedication', 'Solomon', 'Glory']
    },
    {
        'id': 'david-solomon-fleet-ezion-geber-1015bce',
        'title': "Solomon's Fleet at Ezion-geber for Ophir Gold",
        'category': 'David/Solomon',
        'geo': make_point('Ezion-geber'),
        'startDate': {'year': -1015, 'isCirca': True, 'precision': 'year', 'label': 'c. 1015 B.C.E.'},
        'notes': "King Solomon builds fleet of ships at Ezion-geber on Red Sea coast in Edom; with Phoenician sailors from King Hiram of Tyre, they sail to Ophir bringing back 420 talents of fine gold. 1 Kings 9:26-28; 10:22. Insight on the Scriptures, Vol. 1, 'Ezion-geber', pp. 784-785; Vol. 2, 'Ophir', p. 557.",
        'tags': ['Ezion-geber', 'Solomon', 'Ophir', 'Fleet']
    },
    {
        'id': 'david-solomon-division-kingdom-shechem-997bce',
        'title': 'Division of the Kingdom at Shechem',
        'category': 'David/Solomon',
        'geo': make_point('Shechem'),
        'startDate': {'year': -997, 'precision': 'year', 'label': '997 B.C.E.'},
        'notes': "Rehoboam rejects older counsel at Shechem, threatening harsher whips; ten northern tribes break away under Jeroboam, dividing the united monarchy into Israel and Judah. 1 Kings 12:1-24; 2 Chronicles 10:1-19. Insight on the Scriptures, Vol. 1, 'Chronology', p. 451; Vol. 2, 'Rehoboam', pp. 769-770.",
        'tags': ['Division', 'Shechem', 'Rehoboam', 'Jeroboam']
    },

    # ==========================================
    # OTHER (Divided Monarchy, Prophets, Exile, Restoration - 17 Events)
    # ==========================================
    {
        'id': 'other-golden-calves-bethel-dan-997bce',
        'title': 'Jeroboam Sets Up Golden Calves at Bethel and Dan',
        'category': 'Other',
        'geo': make_path(['Bethel', 'Dan']),
        'startDate': {'year': -997, 'precision': 'year', 'label': '997 B.C.E.'},
        'notes': "Fearing northern subjects will return allegiance to Davidic throne if worshiping in Jerusalem, Jeroboam makes two golden calves, stationing one at Bethel and one at Dan. 1 Kings 12:26-33. Insight on the Scriptures, Vol. 1, 'Bethel', p. 296; 'Dan', p. 575; 'Calf', p. 385.",
        'tags': ['Golden Calves', 'Bethel', 'Dan', 'Jeroboam']
    },
    {
        'id': 'other-pharaoh-shishak-invades-jerusalem-993bce',
        'title': 'Pharaoh Shishak Plunders Jerusalem and Temple',
        'category': 'Other',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -993, 'precision': 'year', 'label': '993 B.C.E.'},
        'notes': "In 5th year of Rehoboam, Pharaoh Shishak invades Judah with 1,200 chariots, looting treasures of Jehovah's temple and royal palace, including Solomon's gold shields. 1 Kings 14:25, 26; 2 Chronicles 12:2-9. Insight on the Scriptures, Vol. 2, 'Shishak', pp. 930-931; 'Chronology', p. 451.",
        'tags': ['Shishak', 'Jerusalem', 'Egypt', 'Plunder']
    },
    {
        'id': 'other-omri-builds-samaria-940bce',
        'title': 'King Omri Founds Samaria as Capital of Israel',
        'category': 'Other',
        'geo': make_point('Samaria'),
        'startDate': {'year': -940, 'isCirca': True, 'precision': 'year', 'label': 'c. 940 B.C.E.'},
        'notes': "King Omri buys hill of Samaria from Shemer for 2 silver talents, fortifies it, and builds permanent capital city for northern kingdom of Israel. 1 Kings 16:23, 24. Insight on the Scriptures, Vol. 2, 'Samaria', pp. 845-847; 'Omri', p. 552.",
        'tags': ['Samaria', 'Omri', 'Israel', 'Capital']
    },
    {
        'id': 'other-elijah-baal-prophets-mount-carmel-905bce',
        'title': "Elijah's Contest with Baal's Prophets on Mount Carmel",
        'category': 'Other',
        'geo': make_point('Mount Carmel'),
        'startDate': {'year': -905, 'isCirca': True, 'precision': 'year', 'label': 'c. 905 B.C.E.'},
        'notes': "Elijah confronts 450 prophets of Baal on Mount Carmel; fire from heaven consumes Elijah's water-soaked sacrifice. People cry 'Jehovah is the true God!' and false prophets are executed at Kishon. 1 Kings 18:19-40. Insight on the Scriptures, Vol. 1, 'Carmel', pp. 410-412; 'Elijah', pp. 710-714.",
        'tags': ['Elijah', 'Mount Carmel', 'Baal', 'Fire']
    },
    {
        'id': 'other-jehu-executes-judgment-jezreel-904bce',
        'title': 'Jehu Executes Judgment on Ahab’s House at Jezreel',
        'category': 'Other',
        'geo': make_point('Jezreel'),
        'startDate': {'year': -904, 'isCirca': True, 'precision': 'year', 'label': 'c. 904 B.C.E.'},
        'notes': "Jehu anointed king, drives furiously to Jezreel, kills Joram, orders wicked Jezebel thrown from window, and wipes out house of Ahab in fulfillment of Elijah's prophecy. 2 Kings 9:1-37; 10:1-11. Insight on the Scriptures, Vol. 2, 'Jehu', pp. 24-26; 'Jezreel', pp. 58-60.",
        'tags': ['Jehu', 'Jezreel', 'Jezebel', 'Judgment']
    },
    {
        'id': 'other-jonah-sent-nineveh-844bce',
        'title': "Jonah's Preaching Mission to Nineveh",
        'category': 'Other',
        'geo': make_path(['Joppa', 'Nineveh']),
        'startDate': {'year': -844, 'isCirca': True, 'precision': 'year', 'label': 'c. 844 B.C.E.'},
        'notes': "Fleeing toward Tarshish from Joppa and swallowed by sea creature, Jonah repents and travels to colossal Assyrian capital Nineveh; King and citizens repent in sackcloth. Jonah 1:1-3:10; 2 Kings 14:25. Insight on the Scriptures, Vol. 2, 'Jonah', pp. 90-93; 'Nineveh', pp. 504-506.",
        'tags': ['Jonah', 'Nineveh', 'Joppa', 'Repentance']
    },
    {
        'id': 'other-fall-samaria-assyrian-captivity-740bce',
        'title': 'Fall of Samaria and Assyrian Captivity of Israel',
        'category': 'Other',
        'geo': make_point('Samaria'),
        'startDate': {'year': -740, 'precision': 'year', 'label': '740 B.C.E.'},
        'notes': "Following 3-year siege by Shalmaneser V and Sargon II, Samaria falls, ending ten-tribe northern kingdom; citizens exiled to Halah, Habor, and cities of Medes. 2 Kings 17:5, 6; 18:9-12. Insight on the Scriptures, Vol. 1, 'Chronology', p. 453; Vol. 2, 'Samaria', p. 847.",
        'tags': ['Samaria', 'Assyria', 'Exile', 'Israel']
    },
    {
        'id': 'other-sennacherib-siege-lachish-jerusalem-732bce',
        'title': 'Sennacherib Besieges Lachish and Threatens Jerusalem',
        'category': 'Other',
        'geo': make_point('Lachish'),
        'startDate': {'year': -732, 'precision': 'year', 'label': '732 B.C.E.'},
        'notes': "Assyrian King Sennacherib takes fortified cities of Judah and camps at Lachish, dispatching Rabshakeh to taunt Hezekiah in Jerusalem. Angel slays 185,000 Assyrian troops in one night. 2 Kings 18:13-19:37; Isaiah 36:1-37:38. Insight on the Scriptures, Vol. 2, 'Sennacherib', pp. 893-895; 'Lachish', pp. 187-189.",
        'tags': ['Sennacherib', 'Lachish', 'Hezekiah', 'Assyria']
    },
    {
        'id': 'other-hezekiah-water-tunnel-siloam-732bce',
        'title': "Hezekiah's Water Tunnel Cut to Pool of Siloam",
        'category': 'Other',
        'geo': make_point('Pool of Siloam'),
        'startDate': {'year': -732, 'isCirca': True, 'precision': 'year', 'label': 'c. 732 B.C.E.'},
        'notes': "Preparing for Assyrian siege, Hezekiah carves 533-meter serpentine tunnel through solid bedrock to channel water from Gihon Spring into Pool of Siloam inside city walls. 2 Kings 20:20; 2 Chronicles 32:30. Insight on the Scriptures, Vol. 1, 'Hezekiah', pp. 1098-1100; Vol. 2, 'Siloam', pp. 953-955.",
        'tags': ['Hezekiah', 'Siloam', 'Tunnel', 'Jerusalem']
    },
    {
        'id': 'other-king-josiah-slain-megiddo-609bce',
        'title': 'King Josiah Slain in Battle at Megiddo',
        'category': 'Other',
        'geo': make_point('Megiddo'),
        'startDate': {'year': -609, 'precision': 'year', 'label': '609 B.C.E.'},
        'notes': "Faithful King Josiah attempts to intercept Pharaoh Nechoh of Egypt at Megiddo; fatally struck by Egyptian archers and brought dead to Jerusalem. 2 Kings 23:29, 30; 2 Chronicles 35:20-25. Insight on the Scriptures, Vol. 2, 'Josiah', pp. 116-118; 'Megiddo', pp. 360-363.",
        'tags': ['Josiah', 'Megiddo', 'Battle', 'Egypt']
    },
    {
        'id': 'other-ezekiel-vision-chariot-chebar-613bce',
        'title': "Ezekiel's Vision of Jehovah's Chariot by River Chebar",
        'category': 'Other',
        'geo': make_point('River Chebar'),
        'startDate': {'year': -613, 'month': 7, 'day': 5, 'precision': 'day', 'label': 'Tammuz 5, 613 B.C.E.'},
        'notes': "By the River Chebar in Babylonia, Ezekiel sees heavens opened: Jehovah enthroned above a vast celestial chariot accompanied by four winged living creatures. Ezekiel 1:1-28. Insight on the Scriptures, Vol. 1, 'Chebar', p. 430; 'Ezekiel', pp. 785-787.",
        'tags': ['Ezekiel', 'Chebar', 'Vision', 'Chariot']
    },
    {
        'id': 'other-desolation-jerusalem-temple-607bce',
        'title': 'Desolation of Jerusalem and Temple by Babylon',
        'category': 'Other',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -607, 'month': 10, 'precision': 'month', 'label': 'Tishri 607 B.C.E.'},
        'notes': "Babylon breaches Jerusalem walls after 18-month siege. Nebuzaradan burns Solomon's temple, levels walls, and deports Jews, leaving the land completely desolate for 70 years. 2 Kings 25:1-26; 2 Chronicles 36:17-21; Jeremiah 52:12-27. Insight on the Scriptures, Vol. 1, 'Chronology', pp. 453-455; Vol. 2, 'Jerusalem', pp. 44-46.",
        'tags': ['Jerusalem', 'Babylon', 'Desolation', 'Temple']
    },
    {
        'id': 'other-fall-babylon-cyrus-539bce',
        'title': 'Fall of Babylon to Cyrus the Great',
        'category': 'Other',
        'geo': make_point('Babylon'),
        'startDate': {'year': -539, 'month': 10, 'day': 5, 'precision': 'day', 'label': 'October 5, 539 B.C.E.'},
        'notes': "During Belshazzar's banquet with temple vessels, hand writes on wall: 'MENE, MENE, TEKEL, PARSIN.' Cyrus diverts Euphrates and captures Babylon without a fight. Daniel 5:1-31. Insight on the Scriptures, Vol. 1, 'Babylon', pp. 238-242; 'Cyrus', pp. 566-569; 'Chronology', p. 453.",
        'tags': ['Babylon', 'Cyrus', 'Daniel', 'Fall of Babylon']
    },
    {
        'id': 'other-cyrus-decree-remnant-returns-537bce',
        'title': 'Cyrus Decrees Return of Jewish Remnant to Jerusalem',
        'category': 'Other',
        'geo': make_path(['Babylon', 'Jerusalem']),
        'startDate': {'year': -537, 'month': 10, 'precision': 'month', 'label': 'Tishri 537 B.C.E.'},
        'notes': "Fulfilling prophecy, Cyrus releases 42,360 Jewish exiles under Zerubbabel. Exactly 70 years after 607 B.C.E., they arrive in Judah and restore altar worship in Jerusalem. Ezra 1:1-4; 3:1-6. Insight on the Scriptures, Vol. 1, 'Cyrus', p. 568; 'Chronology', p. 453; Vol. 2, 'Zerubbabel', pp. 1232-1234.",
        'tags': ['Cyrus', 'Zerubbabel', 'Return', 'Jerusalem']
    },
    {
        'id': 'other-second-temple-completed-515bce',
        'title': 'Rebuilding of Second Temple Completed in Jerusalem',
        'category': 'Other',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -515, 'month': 3, 'day': 12, 'precision': 'day', 'label': 'Adar 3, 515 B.C.E.'},
        'notes': "Encouraged by prophets Haggai and Zechariah and ratified by Darius I, Jews overcome regional opposition and finish rebuilt temple, dedicating it with joyful sacrifices. Ezra 6:14-22. Insight on the Scriptures, Vol. 2, 'Temple', pp. 1080-1082; 'Chronology', p. 453.",
        'tags': ['Second Temple', 'Jerusalem', 'Haggai', 'Zechariah']
    },
    {
        'id': 'other-esther-mordecai-susa-474bce',
        'title': 'Esther and Mordecai Deliver Jews at Susa',
        'category': 'Other',
        'geo': make_point('Susa'),
        'startDate': {'year': -474, 'isCirca': True, 'precision': 'year', 'label': 'c. 474 B.C.E.'},
        'notes': "Queen Esther risks her life before King Ahasuerus in Shushan (Susa), thwarting Haman's plot; Mordecai is exalted and Jews prevail over enemies, instituting Purim. Esther 4:14-16; 7:1-10; 9:20-22. Insight on the Scriptures, Vol. 1, 'Esther', pp. 761-764; Vol. 2, 'Shushan', pp. 936-937.",
        'tags': ['Esther', 'Mordecai', 'Susa', 'Purim']
    },
    {
        'id': 'other-nehemiah-rebuilds-jerusalem-walls-455bce',
        'title': 'Nehemiah Rebuilds the Walls of Jerusalem (70 Weeks Start)',
        'category': 'Other',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': -455, 'month': 9, 'day': 25, 'precision': 'day', 'label': 'Elul 25, 455 B.C.E.'},
        'notes': "Commissioned by Artaxerxes I in Nisan 455 B.C.E., Nehemiah rebuilds Jerusalem's walls in just 52 days despite fierce opposition. Marks start of 70 prophetic weeks of Daniel 9:25. Nehemiah 2:1-8; 6:15; Daniel 9:25. Insight on the Scriptures, Vol. 1, 'Chronology', p. 453; 'Seventy Weeks', pp. 898-900; Vol. 2, 'Nehemiah', pp. 484-487.",
        'tags': ['Nehemiah', 'Walls', 'Jerusalem', 'Seventy Weeks']
    },

    # ==========================================
    # JESUS (24 Events)
    # ==========================================
    {
        'id': 'jesus-birth-bethlehem-2bce',
        'title': 'Birth of Jesus Christ in Bethlehem',
        'category': 'Jesus',
        'geo': make_point('Bethlehem'),
        'startDate': {'year': -2, 'month': 10, 'precision': 'month', 'label': 'Autumn 2 B.C.E.'},
        'notes': "Caesar Augustus decrees census; Mary and Joseph travel from Nazareth to Bethlehem; Jesus born in stable and laid in manger while angels announce good news to shepherds. Luke 2:1-20; Matthew 2:1. Insight on the Scriptures, Vol. 2, 'Jesus Christ', pp. 52-54; 'Chronology', pp. 455-456; Vol. 1, 'Bethlehem', pp. 300-302.",
        'tags': ['Jesus', 'Bethlehem', 'Birth', 'Messiah']
    },
    {
        'id': 'jesus-flight-egypt-nazareth-1bce',
        'title': 'Flight to Egypt and Settlement in Nazareth',
        'category': 'Jesus',
        'geo': make_path(['Bethlehem', 'Egypt / Nile Delta', 'Nazareth']),
        'startDate': {'year': -1, 'isCirca': True, 'precision': 'year', 'label': 'c. 1 B.C.E.'},
        'notes': "Warned by an angel of Herod's massacre of male infants, Joseph takes Mary and baby Jesus to Egypt until Herod's death, then settles in Nazareth of Galilee. Matthew 2:13-23. Insight on the Scriptures, Vol. 2, 'Jesus Christ', p. 54; 'Nazareth', pp. 473-475.",
        'tags': ['Jesus', 'Egypt', 'Nazareth', 'Herod']
    },
    {
        'id': 'jesus-temple-discussion-age12-12ce',
        'title': '12-Year-Old Jesus in the Jerusalem Temple',
        'category': 'Jesus',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': 12, 'month': 4, 'precision': 'month', 'label': 'Passover 12 C.E.'},
        'notes': "At Passover in Jerusalem, 12-year-old Jesus stays in temple courts for 3 days, listening to teachers and asking questions, amazing all with his understanding: 'Did you not know that I must be in the house of my Father?' Luke 2:41-52. Insight on the Scriptures, Vol. 2, 'Jesus Christ', pp. 54-55.",
        'tags': ['Jesus', 'Temple', 'Jerusalem', 'Passover']
    },
    {
        'id': 'jesus-baptism-jordan-29ce',
        'title': 'Baptism of Jesus by John in the Jordan River',
        'category': 'Jesus',
        'geo': make_point('Bethabara'),
        'startDate': {'year': 29, 'month': 10, 'precision': 'month', 'label': 'Autumn 29 C.E.'},
        'notes': "At age 30, exactly 69 weeks of years after 455 B.C.E., Jesus is baptized in Jordan. Holy spirit descends as dove; Father declares: 'You are my Son, the beloved.' Matthew 3:13-17; Luke 3:21-23; Daniel 9:25. Insight on the Scriptures, Vol. 1, 'Chronology', pp. 456-457; Vol. 2, 'Jesus Christ', pp. 55-56.",
        'tags': ['Baptism', 'Jesus', 'Jordan', 'Holy Spirit']
    },
    {
        'id': 'jesus-temptation-wilderness-judea-29ce',
        'title': 'Temptation of Jesus in the Wilderness of Judea',
        'category': 'Jesus',
        'geo': make_point('Wilderness of Judea'),
        'startDate': {'year': 29, 'month': 11, 'precision': 'month', 'label': 'Late 29 C.E.'},
        'notes': "Fasting 40 days in barren wilderness, Jesus resists Satan's three temptations by quoting Scripture: 'Man must live, not on bread alone, but on every word from Jehovah.' Matthew 4:1-11; Luke 4:1-13. Insight on the Scriptures, Vol. 2, 'Jesus Christ', pp. 56-57; 'Temptation', pp. 1083-1084.",
        'tags': ['Temptation', 'Wilderness', 'Jesus', 'Satan']
    },
    {
        'id': 'jesus-water-to-wine-cana-29ce',
        'title': 'First Miracle: Water Turned to Wine at Cana',
        'category': 'Jesus',
        'geo': make_point('Cana'),
        'startDate': {'year': 29, 'month': 12, 'precision': 'month', 'label': 'Late 29 C.E.'},
        'notes': "At wedding feast in Cana of Galilee with his mother and early disciples, Jesus turns six large stone jars of water into fine wine, revealing his glory. John 2:1-11. Insight on the Scriptures, Vol. 1, 'Cana', pp. 403-404; Vol. 2, 'Jesus Christ', p. 57.",
        'tags': ['Cana', 'Miracle', 'Wine', 'Jesus']
    },
    {
        'id': 'jesus-cleanses-temple-nicodemus-30ce',
        'title': 'First Cleansing of Temple & Conversation with Nicodemus',
        'category': 'Jesus',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': 30, 'month': 4, 'precision': 'month', 'label': 'Passover 30 C.E.'},
        'notes': "Jesus drives merchants and moneychangers from temple in Jerusalem: 'Stop making the house of my Father a house of commerce!' At night, Pharisee Nicodemus learns about being born again and God's love. John 2:13-25; 3:1-21. Insight on the Scriptures, Vol. 2, 'Jesus Christ', pp. 57-58; 'Nicodemus', p. 500.",
        'tags': ['Temple', 'Nicodemus', 'Jerusalem', 'Passover']
    },
    {
        'id': 'jesus-samaritan-woman-sychar-30ce',
        'title': 'Jesus Teaches the Samaritan Woman at Jacob’s Well',
        'category': 'Jesus',
        'geo': make_point('Sychar'),
        'startDate': {'year': 30, 'month': 12, 'precision': 'month', 'label': 'c. Dec 30 C.E.'},
        'notes': "Resting at Jacob's well near Sychar, Jesus speaks with Samaritan woman of 'living water' and worshiping the Father 'with spirit and truth,' revealing he is Messiah. John 4:4-42. Insight on the Scriptures, Vol. 2, 'Sychar', p. 1047; 'Jacob’s Well', p. 13.",
        'tags': ['Samaria', 'Jacob’s Well', 'Sychar', 'Living Water']
    },
    {
        'id': 'jesus-rejection-synagogue-nazareth-31ce',
        'title': 'Rejection in the Synagogue at Nazareth',
        'category': 'Jesus',
        'geo': make_point('Nazareth'),
        'startDate': {'year': 31, 'month': 1, 'label': 'Early 31 C.E.'},
        'notes': "In hometown synagogue, Jesus reads Isaiah 61:1, 2: 'Jehovah's spirit is upon me.' Enraged listeners attempt to throw him from cliff brow of hill on which city was built. Luke 4:16-30. Insight on the Scriptures, Vol. 2, 'Nazareth', pp. 474-475.",
        'tags': ['Nazareth', 'Synagogue', 'Isaiah', 'Rejection']
    },
    {
        'id': 'jesus-headquarters-capernaum-31ce',
        'title': 'Ministry Headquarters Established at Capernaum',
        'category': 'Jesus',
        'geo': make_point('Capernaum'),
        'startDate': {'year': 31, 'precision': 'year', 'label': '31 C.E.'},
        'notes': "Jesus bases ministry in lakeside Capernaum, fulfilling Isaiah 9:1, 2. Calls fishermen Peter, Andrew, James, John, and tax collector Matthew. Matthew 4:13-22; 9:9. Insight on the Scriptures, Vol. 1, 'Capernaum', pp. 408-410.",
        'tags': ['Capernaum', 'Galilee', 'Apostles', 'Headquarters']
    },
    {
        'id': 'jesus-sermon-on-mount-31ce',
        'title': 'The Sermon on the Mount Delivered',
        'category': 'Jesus',
        'geo': make_point('Mount of Beatitudes'),
        'startDate': {'year': 31, 'month': 5, 'label': 'Spring 31 C.E.'},
        'notes': "After whole night of prayer on mountain and appointing 12 apostles, Jesus delivers famous sermon: Beatitudes, Model Prayer, Golden Rule, and building on solid rock. Matthew 5:1-7:29; Luke 6:12-49. Insight on the Scriptures, Vol. 2, 'Sermon on the Mount', pp. 896-898.",
        'tags': ['Sermon on Mount', 'Beatitudes', 'Lord’s Prayer', 'Teaching']
    },
    {
        'id': 'jesus-resurrects-widow-son-nain-31ce',
        'title': 'Resurrecting the Only Son of a Widow at Nain',
        'category': 'Jesus',
        'geo': make_point('Nain'),
        'startDate': {'year': 31, 'precision': 'year', 'label': '31 C.E.'},
        'notes': "At gates of Nain, Jesus encounters funeral procession of widow's only son. Moved with compassion, touches bier: 'Young man, I say to you, get up!' Luke 7:11-17. Insight on the Scriptures, Vol. 2, 'Nain', p. 467.",
        'tags': ['Nain', 'Resurrection', 'Compassion', 'Widow']
    },
    {
        'id': 'jesus-calms-sea-heals-gadarene-31ce',
        'title': 'Calming the Sea of Galilee & Healing Demoniac at Gadara',
        'category': 'Jesus',
        'geo': make_point('Gadara'),
        'startDate': {'year': 31, 'month': 10, 'label': 'Autumn 31 C.E.'},
        'notes': "Jesus calms violent windstorm on Sea of Galilee: 'Hush! Be quiet!' Across the sea in country of Gadarenes, he casts out legion of demons from fierce man into swine herd. Matthew 8:23-34; Mark 4:35-5:20. Insight on the Scriptures, Vol. 1, 'Gadara', pp. 876-877; Vol. 2, 'Galilee, Sea of', pp. 883-884.",
        'tags': ['Sea of Galilee', 'Gadara', 'Miracle', 'Storm']
    },
    {
        'id': 'jesus-feeding-5000-bethsaida-32ce',
        'title': 'Miraculous Feeding of the 5,000 near Bethsaida',
        'category': 'Jesus',
        'geo': make_point('Bethsaida'),
        'startDate': {'year': 32, 'month': 4, 'label': 'Passover Season 32 C.E.'},
        'notes': "Jesus feeds crowd of 5,000 men plus women and children with five barley loaves and two fish provided by a boy, gathering 12 surplus baskets. Luke 9:10-17; John 6:1-14. Insight on the Scriptures, Vol. 1, 'Bethsaida', pp. 302-303.",
        'tags': ['Bethsaida', 'Feeding 5000', 'Miracle', 'Bread of Life']
    },
    {
        'id': 'jesus-peter-confession-caesarea-philippi-32ce',
        'title': "Peter's Confession near Caesarea Philippi",
        'category': 'Jesus',
        'geo': make_point('Caesarea Philippi'),
        'startDate': {'year': 32, 'month': 9, 'label': 'Autumn 32 C.E.'},
        'notes': "Near base of Mount Hermon, Peter confesses: 'You are the Christ, the Son of the living God.' Jesus foretells his death and resurrection for the first time clearly. Matthew 16:13-28; Mark 8:27-38. Insight on the Scriptures, Vol. 1, 'Caesarea Philippi', pp. 383-384.",
        'tags': ['Caesarea Philippi', 'Peter', 'Christ', 'Confession']
    },
    {
        'id': 'jesus-transfiguration-mount-hermon-32ce',
        'title': 'The Transfiguration on Mount Hermon',
        'category': 'Jesus',
        'geo': make_point('Mount Hermon'),
        'startDate': {'year': 32, 'month': 9, 'label': 'Autumn 32 C.E.'},
        'notes': "On high mountain, Jesus' face shines like sun and clothes become brilliant white; visionary Moses and Elijah appear converse with him. Voice from cloud: 'This is my Son, the beloved. Listen to him.' Matthew 17:1-9; Luke 9:28-36. Insight on the Scriptures, Vol. 2, 'Transfiguration', pp. 1120-1122; Vol. 1, 'Hermon', pp. 1092-1094.",
        'tags': ['Transfiguration', 'Mount Hermon', 'Moses', 'Elijah']
    },
    {
        'id': 'jesus-raising-lazarus-bethany-32ce',
        'title': 'Raising Lazarus from the Dead at Bethany',
        'category': 'Jesus',
        'geo': make_point('Bethany'),
        'startDate': {'year': 32, 'month': 12, 'label': 'Winter 32–33 C.E.'},
        'notes': "Lazarus dead 4 days; Jesus weeps with Mary and Martha, orders stone removed, and shouts: 'Lazarus, come out!' Chief priests conspire to kill Jesus and Lazarus. John 11:1-53; 12:9-11. Insight on the Scriptures, Vol. 1, 'Bethany', pp. 294-295; Vol. 2, 'Lazarus', pp. 222-224.",
        'tags': ['Bethany', 'Lazarus', 'Resurrection', 'Miracle']
    },
    {
        'id': 'jesus-heals-bartimaeus-zacchaeus-jericho-33ce',
        'title': 'Healing Blind Bartimaeus and Visiting Zacchaeus at Jericho',
        'category': 'Jesus',
        'geo': make_point('Jericho'),
        'startDate': {'year': 33, 'month': 3, 'label': 'Spring 33 C.E.'},
        'notes': "On ascent to Jerusalem, Jesus heals blind beggar Bartimaeus at Jericho, and stays at home of repentant chief tax collector Zacchaeus: 'Salvation has come to this house.' Luke 18:35-19:10; Mark 10:46-52. Insight on the Scriptures, Vol. 2, 'Jericho', p. 36; 'Zacchaeus', p. 1222.",
        'tags': ['Jericho', 'Bartimaeus', 'Zacchaeus', 'Salvation']
    },
    {
        'id': 'jesus-triumphal-entry-bethphage-33ce',
        'title': 'Triumphal Entry into Jerusalem from Bethphage',
        'category': 'Jesus',
        'geo': make_point('Bethphage'),
        'startDate': {'year': 33, 'month': 4, 'day': 1, 'precision': 'day', 'label': 'Nisan 9, 33 C.E.'},
        'notes': "Fulfilling Zechariah 9:9, Jesus rides a colt down Mount of Olives into Jerusalem as multitudes wave palm fronds shouting: 'Hosanna! Blessed is he who comes in Jehovah’s name!' Matthew 21:1-11; Luke 19:28-44. Insight on the Scriptures, Vol. 1, 'Bethphage', p. 303; Vol. 2, 'Jesus Christ', p. 64.",
        'tags': ['Triumphal Entry', 'Bethphage', 'Jerusalem', 'Palm Sunday']
    },
    {
        'id': 'jesus-lords-evening-meal-gethsemane-33ce',
        'title': "The Lord's Evening Meal & Agony in Gethsemane",
        'category': 'Jesus',
        'geo': make_point('Garden of Gethsemane'),
        'startDate': {'year': 33, 'month': 4, 'day': 5, 'hour': 21, 'precision': 'hour', 'label': 'Nisan 14, 33 C.E. (Night)'},
        'notes': "Institutes Memorial of his death with unleavened bread and wine. Prays in agony at Gethsemane, sweating drops like blood before betrayal by Judas. Matthew 26:17-46; Luke 22:7-46. Insight on the Scriptures, Vol. 1, 'Lord’s Evening Meal', pp. 268-271; 'Gethsemane', pp. 925-926.",
        'tags': ['Lord’s Evening Meal', 'Gethsemane', 'Nisan 14', 'Betrayal']
    },
    {
        'id': 'jesus-impalement-death-golgotha-33ce',
        'title': 'Impalement and Death of Jesus Christ at Golgotha',
        'category': 'Jesus',
        'geo': make_point('Golgotha'),
        'startDate': {'year': 33, 'month': 4, 'day': 6, 'hour': 15, 'precision': 'hour', 'label': 'Nisan 14, 33 C.E. (3:00 PM)'},
        'notes': "Condemned by Sanhedrin and Pilate, Jesus is nailed to stake at Golgotha. Darkness covers land; at 3:00 PM Jesus calls out 'It has been accomplished!' and dies; buried in Joseph of Arimathea's tomb. Matthew 27:33-60; Luke 23:33-53; John 19:17-42. Insight on the Scriptures, Vol. 1, 'Golgotha', pp. 978-979; 'Chronology', p. 458; Vol. 2, 'Jesus Christ', pp. 67-69.",
        'tags': ['Impalement', 'Golgotha', 'Ransom', 'Death of Christ']
    },
    {
        'id': 'jesus-resurrection-jerusalem-33ce',
        'title': 'The Resurrection of Jesus Christ',
        'category': 'Jesus',
        'geo': make_point('Golgotha'),
        'startDate': {'year': 33, 'month': 4, 'day': 8, 'precision': 'day', 'label': 'Nisan 16, 33 C.E.'},
        'notes': "On 3rd day, angel rolls back stone from tomb. Resurrected Jesus first appears to Mary Magdalene and other women, then to Peter and disciples. Matthew 28:1-10; John 20:1-18; 1 Corinthians 15:4, 5. Insight on the Scriptures, Vol. 2, 'Resurrection', pp. 784-789.",
        'tags': ['Resurrection', 'Jerusalem', 'Mary Magdalene', 'Empty Tomb']
    },
    {
        'id': 'jesus-road-emmaus-33ce',
        'title': 'Appearance on the Road to Emmaus',
        'category': 'Jesus',
        'geo': make_path(['Jerusalem', 'Emmaus']),
        'startDate': {'year': 33, 'month': 4, 'day': 8, 'precision': 'day', 'label': 'Nisan 16, 33 C.E. (Afternoon)'},
        'notes': "Resurrected Jesus joins two disciples walking to Emmaus, expounding all scriptures concerning himself before revealing himself in breaking of bread. Luke 24:13-35. Insight on the Scriptures, Vol. 1, 'Emmaus', pp. 721-722; 'Cleopas', p. 476.",
        'tags': ['Emmaus', 'Appearance', 'Resurrection', 'Scripture']
    },
    {
        'id': 'jesus-ascension-mount-olives-33ce',
        'title': 'Ascension of Jesus from the Mount of Olives',
        'category': 'Jesus',
        'geo': make_point('Mount of Olives'),
        'startDate': {'year': 33, 'month': 5, 'day': 16, 'precision': 'day', 'label': 'Iyyar 25, 33 C.E.'},
        'notes': "40 days post-resurrection, Jesus gives Great Commission to make disciples of all nations, ascends into heaven from Mount of Olives until taken up in cloud. Acts 1:9-12; Matthew 28:18-20. Insight on the Scriptures, Vol. 1, 'Ascension', pp. 187-188; Vol. 2, 'Olives, Mount of', pp. 544-546.",
        'tags': ['Ascension', 'Mount of Olives', 'Commission', 'Heaven']
    },

    # ==========================================
    # APOSTLES & EARLY CHURCH (19 Events)
    # ==========================================
    {
        'id': 'apostles-pentecost-jerusalem-33ce',
        'title': 'Outpouring of Holy Spirit at Pentecost in Jerusalem',
        'category': 'Apostles',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': 33, 'month': 5, 'day': 26, 'precision': 'day', 'label': 'Sivan 6, 33 C.E. (Pentecost)'},
        'notes': "120 disciples receive holy spirit in upper room with rushing wind and tongues like fire; speak foreign languages. Peter explains prophecy; 3,000 baptized that day. Acts 2:1-47. Insight on the Scriptures, Vol. 2, 'Pentecost', pp. 597-600; 'Holy Spirit', pp. 1019-1025.",
        'tags': ['Pentecost', 'Holy Spirit', 'Jerusalem', 'Peter']
    },
    {
        'id': 'apostles-martyrdom-stephen-34ce',
        'title': 'Martyrdom of Stephen & Flight of Disciples',
        'category': 'Apostles',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': 34, 'isCirca': True, 'precision': 'year', 'label': 'c. 34 C.E.'},
        'notes': "Stephen delivers defense before Sanhedrin, sees Jesus standing at God's right hand. Stoned to death outside Jerusalem as Saul looks on; believers scatter preaching the word. Acts 7:54-8:4. Insight on the Scriptures, Vol. 2, 'Stephen', pp. 1034-1036.",
        'tags': ['Stephen', 'Martyr', 'Jerusalem', 'Saul']
    },
    {
        'id': 'apostles-philip-samaria-ethiopian-eunuch-34ce',
        'title': 'Philip Preaches in Samaria & Baptizes Ethiopian Eunuch',
        'category': 'Apostles',
        'geo': make_path(['Samaria', 'Gaza']),
        'startDate': {'year': 34, 'isCirca': True, 'precision': 'year', 'label': 'c. 34 C.E.'},
        'notes': "Philip proclaims Christ in Samaria; angel sends him south to desert road to Gaza, where he explains Isaiah 53 to royal Ethiopian eunuch and baptizes him. Acts 8:5-40. Insight on the Scriptures, Vol. 2, 'Philip', pp. 629-630; 'Ethiopian Eunuch', pp. 764-765.",
        'tags': ['Philip', 'Samaria', 'Gaza', 'Ethiopian Eunuch']
    },
    {
        'id': 'apostles-conversion-saul-damascus-34ce',
        'title': 'Conversion of Saul on the Road to Damascus',
        'category': 'Apostles',
        'geo': make_point('Damascus'),
        'startDate': {'year': 34, 'isCirca': True, 'precision': 'year', 'label': 'c. 34 C.E.'},
        'notes': "Near Damascus, flashing light blinds persecutor Saul; Jesus speaks: 'Saul, Saul, why are you persecuting me?' Ananias restores his sight on Straight Street; Saul is baptized. Acts 9:1-22; 22:6-16. Insight on the Scriptures, Vol. 2, 'Paul', pp. 584-586; Vol. 1, 'Damascus', pp. 570-572.",
        'tags': ['Paul', 'Saul', 'Damascus', 'Conversion']
    },
    {
        'id': 'apostles-peter-lydda-tabitha-joppa-36ce',
        'title': 'Peter Heals Aeneas at Lydda & Resurrects Tabitha at Joppa',
        'category': 'Apostles',
        'geo': make_point('Joppa'),
        'startDate': {'year': 36, 'isCirca': True, 'precision': 'year', 'label': 'c. 36 C.E.'},
        'notes': "Peter heals paralyzed Aeneas at Lydda, then arrives at Joppa where benevolent Tabitha (Dorcas) has died. In upper room Peter prays: 'Tabitha, rise!' presenting her alive. Acts 9:32-43. Insight on the Scriptures, Vol. 2, 'Joppa', pp. 93-94; 'Dorcas', p. 650.",
        'tags': ['Peter', 'Joppa', 'Dorcas', 'Tabitha']
    },
    {
        'id': 'apostles-cornelius-conversion-caesarea-36ce',
        'title': 'Conversion of Cornelius at Caesarea (70th Week Ends)',
        'category': 'Apostles',
        'geo': make_point('Caesarea'),
        'startDate': {'year': 36, 'month': 10, 'precision': 'month', 'label': 'Autumn 36 C.E.'},
        'notes': "Peter sent to Roman centurion Cornelius in Caesarea; holy spirit pours out on uncircumcised Gentiles; marks end of 70 prophetic weeks of Daniel 9:27. Acts 10:1-48. Insight on the Scriptures, Vol. 1, 'Cornelius', pp. 513-514; 'Chronology', p. 459; 'Seventy Weeks', p. 900.",
        'tags': ['Cornelius', 'Caesarea', 'Gentiles', 'Peter']
    },
    {
        'id': 'apostles-called-christians-antioch-44ce',
        'title': "Disciples First Called Christians at Syrian Antioch",
        'category': 'Apostles',
        'geo': make_point('Antioch in Syria'),
        'startDate': {'year': 44, 'isCirca': True, 'precision': 'year', 'label': 'c. 44 C.E.'},
        'notes': "Barnabas and Saul teach large crowds at Syrian Antioch for full year; disciples are first called 'Christians' by divine providence. Acts 11:25, 26. Insight on the Scriptures, Vol. 1, 'Antioch', pp. 119-120; 'Christian', pp. 437-439.",
        'tags': ['Antioch', 'Christians', 'Barnabas', 'Paul']
    },
    {
        'id': 'apostles-james-martyred-peter-freed-44ce',
        'title': 'James Executed & Peter Miraculously Freed from Prison',
        'category': 'Apostles',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': 44, 'month': 4, 'label': 'Passover Season 44 C.E.'},
        'notes': "Herod Agrippa I kills James with sword and imprisons Peter. Angel leads Peter past guards and iron gate swings open by itself. Acts 12:1-19. Insight on the Scriptures, Vol. 1, 'Herod', pp. 1095-1096; Vol. 2, 'Peter', pp. 620-621.",
        'tags': ['James', 'Peter', 'Jerusalem', 'Angel']
    },
    {
        'id': 'apostles-pauls-first-missionary-journey-47ce',
        'title': "Paul's First Missionary Journey to Cyprus & Galatia",
        'category': 'Apostles',
        'geo': make_path(['Antioch in Syria', 'Seleucia', 'Salamis', 'Paphos', 'Perga', 'Pisidian Antioch', 'Iconium', 'Lystra', 'Derbe', 'Antioch in Syria']),
        'startDate': {'year': 47, 'precision': 'year'},
        'endDate': {'year': 48, 'precision': 'year', 'label': 'c. 47–48 C.E.'},
        'notes': "Paul and Barnabas traverse Cyprus, sail to Asia Minor, preach across Pisidian Antioch, Iconium, Lystra (where Paul is stoned and survives), and Derbe, establishing congregations. Acts 13:1-14:28. Insight on the Scriptures, Vol. 2, 'Paul', pp. 586-587.",
        'tags': ['Paul', 'First Missionary Journey', 'Cyprus', 'Galatia']
    },
    {
        'id': 'apostles-jerusalem-council-circumcision-49ce',
        'title': 'The Circumcision Issue Resolved at Jerusalem Council',
        'category': 'Apostles',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': 49, 'isCirca': True, 'precision': 'year', 'label': 'c. 49 C.E.'},
        'notes': "Apostles and older men convene in Jerusalem under holy spirit; issue decree freeing Gentile Christians from circumcision while upholding abstaining from idols, blood, strangled meat, and immorality. Acts 15:1-35; Galatians 2:1-10. Insight on the Scriptures, Vol. 1, 'Council', pp. 518-519; Vol. 2, 'Paul', p. 587.",
        'tags': ['Jerusalem Council', 'Circumcision', 'Decree', 'Apostles']
    },
    {
        'id': 'apostles-pauls-second-missionary-journey-49ce',
        'title': "Paul's Second Missionary Journey: Entry into Europe",
        'category': 'Apostles',
        'geo': make_path(['Antioch in Syria', 'Derbe', 'Lystra', 'Troas', 'Philippi', 'Thessalonica', 'Beroea', 'Athens', 'Corinth', 'Ephesus', 'Caesarea', 'Jerusalem', 'Antioch in Syria']),
        'startDate': {'year': 49, 'precision': 'year'},
        'endDate': {'year': 52, 'precision': 'year', 'label': 'c. 49–52 C.E.'},
        'notes': "Paul, Silas, and Timothy travel through Asia Minor to Troas; called to Europe by Macedonian vision. Form congregations at Philippi, Thessalonica, Beroea, Athens, and Corinth (18-month stay). Acts 15:36-18:22. Insight on the Scriptures, Vol. 2, 'Paul', pp. 587-589.",
        'tags': ['Paul', 'Second Missionary Journey', 'Europe', 'Greece']
    },
    {
        'id': 'apostles-paul-athens-areopagus-50ce',
        'title': "Paul's Discourse on the Areopagus in Athens",
        'category': 'Apostles',
        'geo': make_point('Areopagus'),
        'startDate': {'year': 50, 'isCirca': True, 'precision': 'year', 'label': 'c. 50 C.E.'},
        'notes': "Facing philosophers on Mars Hill (Areopagus), Paul cites their altar 'To an Unknown God', preaching the true Creator who made all mankind from one man, and the resurrection of Christ. Acts 17:16-34. Insight on the Scriptures, Vol. 1, 'Areopagus', pp. 154-155; 'Athens', pp. 210-212.",
        'tags': ['Paul', 'Athens', 'Areopagus', 'Philosophy']
    },
    {
        'id': 'apostles-pauls-third-journey-ephesus-52ce',
        'title': "Paul's Third Missionary Journey & Ministry in Ephesus",
        'category': 'Apostles',
        'geo': make_point('Ephesus'),
        'startDate': {'year': 52, 'precision': 'year'},
        'endDate': {'year': 56, 'precision': 'year', 'label': 'c. 52–56 C.E.'},
        'notes': "Paul stays over two years lecturing in Tyrannus' auditorium in Ephesus; word spreads through Asia; silversmith Demetrius sparks massive riot in 24,000-seat theater over Artemis. Acts 19:1-41; 20:1-38. Insight on the Scriptures, Vol. 1, 'Ephesus', pp. 732-735; Vol. 2, 'Paul', pp. 589-590.",
        'tags': ['Paul', 'Third Missionary Journey', 'Ephesus', 'Artemis']
    },
    {
        'id': 'apostles-paul-arrested-temple-jerusalem-56ce',
        'title': 'Paul Arrested in the Temple at Jerusalem',
        'category': 'Apostles',
        'geo': make_point('Antonia Fortress'),
        'startDate': {'year': 56, 'month': 5, 'label': 'Pentecost Season 56 C.E.'},
        'notes': "Mob attacks Paul in Jerusalem temple on false charges of bringing Gentiles inside; Roman military tribune Lysias rescues him with soldiers from Antonia Fortress. Acts 21:26-40; 22:1-29. Insight on the Scriptures, Vol. 1, 'Antonia, Tower of', pp. 120-121; Vol. 2, 'Paul', p. 590.",
        'tags': ['Paul', 'Arrest', 'Jerusalem', 'Antonia Fortress']
    },
    {
        'id': 'apostles-paul-imprisonment-caesarea-56ce',
        'title': 'Paul Imprisoned at Caesarea Before Felix and Festus',
        'category': 'Apostles',
        'geo': make_point('Caesarea'),
        'startDate': {'year': 56, 'precision': 'year'},
        'endDate': {'year': 58, 'precision': 'year', 'label': '56–58 C.E.'},
        'notes': "Transferred to Caesarea to escape Jewish murder plot, Paul is held two years, defending himself before Governors Felix and Festus, and King Agrippa II, famously appealing to Caesar. Acts 23:23-26:32. Insight on the Scriptures, Vol. 1, 'Caesarea', pp. 382-383; 'Felix', pp. 817-818; 'Festus', p. 820.",
        'tags': ['Paul', 'Caesarea', 'Felix', 'Festus', 'Agrippa']
    },
    {
        'id': 'apostles-paul-voyage-rome-shipwreck-malta-58ce',
        'title': "Paul's Voyage to Rome and Shipwreck at Malta",
        'category': 'Apostles',
        'geo': make_path(['Caesarea', 'Sidon', 'Myra', 'Fair Havens', 'Malta', 'Syracuse', 'Rhegium', 'Puteoli', 'Rome']),
        'startDate': {'year': 58, 'precision': 'year'},
        'endDate': {'year': 59, 'precision': 'year', 'label': 'Autumn 58 – Spring 59 C.E.'},
        'notes': "Bound for Caesar, Paul's grain ship battles 14-day typhoon (Euroaquilo); angel promises no loss of life; shipwrecks at Malta where all 276 reach shore safely; bitten unharmed by viper. Acts 27:1-28:16. Insight on the Scriptures, Vol. 2, 'Paul', pp. 590-591; 'Malta', pp. 302-303.",
        'tags': ['Paul', 'Voyage', 'Malta', 'Shipwreck', 'Rome']
    },
    {
        'id': 'apostles-paul-house-arrest-rome-59ce',
        'title': "Paul's First Roman Imprisonment Under House Arrest",
        'category': 'Apostles',
        'geo': make_point('Rome'),
        'startDate': {'year': 59, 'precision': 'year'},
        'endDate': {'year': 61, 'precision': 'year', 'label': 'c. 59–61 C.E. (2 Years)'},
        'notes': "Paul stays two full years in his own rented house in Rome with soldier guard, boldly preaching the Kingdom of God; pens letters to Ephesians, Philippians, Colossians, Philemon, and Hebrews. Acts 28:16-31. Insight on the Scriptures, Vol. 2, 'Paul', pp. 591-592; 'Rome', pp. 825-827.",
        'tags': ['Paul', 'Rome', 'Letters', 'Preaching']
    },
    {
        'id': 'apostles-destruction-jerusalem-titus-70ce',
        'title': 'Destruction of Jerusalem and Temple by Roman Legions',
        'category': 'Apostles',
        'geo': make_point('Jerusalem'),
        'startDate': {'year': 70, 'month': 9, 'precision': 'month', 'label': 'Elul 70 C.E.'},
        'notes': "Fulfilling Jesus' prophecy (Luke 19:41-44; 21:20-24), Roman general Titus surrounds Jerusalem with palisade, breaches walls, burns temple, and razes city to bedrock; 1.1 million perish and 97,000 captive. Christians escape to Pella. Insight on the Scriptures, Vol. 1, 'Chronology', p. 460; Vol. 2, 'Jerusalem', pp. 46-48; 'Titus', pp. 1109-1110.",
        'tags': ['Jerusalem', 'Rome', 'Titus', 'Prophecy', 'Destruction']
    },
    {
        'id': 'apostles-john-exiled-patmos-revelation-96ce',
        'title': 'Apostle John Exiled on Patmos / Receives Revelation',
        'category': 'Apostles',
        'geo': make_point('Patmos'),
        'startDate': {'year': 96, 'isCirca': True, 'precision': 'year', 'label': 'c. 96 C.E.'},
        'notes': "Exiled to penal island of Patmos under Emperor Domitian, aged apostle John is caught up by inspiration into the Lord's day, receiving the visionary Apocalypse recorded in Revelation. Revelation 1:9, 10. Insight on the Scriptures, Vol. 2, 'Patmos', p. 584; 'Revelation to John', pp. 794-796; Vol. 1, 'John', pp. 1198-1200.",
        'tags': ['John', 'Patmos', 'Revelation', 'Apocalypse']
    }
]

def normalize_date(d):
    if not d:
        return d
    out = dict(d)
    if 'precision' not in out:
        if out.get('hour') is not None:
            out['precision'] = 'hour'
        elif out.get('day') is not None:
            out['precision'] = 'day'
        elif out.get('month') is not None:
            out['precision'] = 'month'
        else:
            out['precision'] = 'year'
    return out

def generate_package():
    now_ms = int(time.time() * 1000)
    events = []
    
    for raw in RAW_EVENTS:
        cat = raw['category']
        color = CATEGORY_COLORS[cat]
        
        event = {
            'id': raw['id'],
            'title': raw['title'],
            'notes': raw['notes'],
            'color': color,
            'category': cat,
            'geometry': raw['geo'],
            'startDate': normalize_date(raw['startDate']),
            'createdAt': now_ms,
            'updatedAt': now_ms,
            'tags': raw.get('tags', []),
            'source': 'Insight on the Scriptures'
        }
        
        if 'endDate' in raw:
            event['endDate'] = normalize_date(raw['endDate'])
            
        events.append(event)
        
    package = {
        'version': '1.0',
        'app': 'HistMap',
        'exportedAt': now_ms,
        'events': events
    }
    
    return package

if __name__ == '__main__':
    pkg = generate_package()
    
    # Write to root directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_histmap_json = os.path.join(base_dir, 'histmap.json')
    target_collection_json = os.path.join(base_dir, 'biblical_events.histmap.json')
    
    with open(target_histmap_json, 'w', encoding='utf-8') as f:
        json.dump(pkg, f, indent=2, ensure_ascii=False)
        
    with open(target_collection_json, 'w', encoding='utf-8') as f:
        json.dump(pkg, f, indent=2, ensure_ascii=False)
        
    print(f"Generated {len(pkg['events'])} historical events.")
    print(f"Wrote: {target_histmap_json}")
    print(f"Wrote: {target_collection_json}")
    
    # Category counts
    counts = {}
    for ev in pkg['events']:
        c = ev['category']
        counts[c] = counts.get(c, 0) + 1
    for cat, cnt in counts.items():
        print(f" - {cat}: {cnt} events")
