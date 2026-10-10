// The named Knights of Westmarch in Court of Blades and Banners, plus expansion Knights
// (expansion: "crystal-grove" = the Knights of Blackthorne, Kingdom of the Crystal Groves, ORK KingdomId 17).
// orkId values come from the ORK Knights report (KingdomId 21); spot-check them before launch.
export default [
 {
  "slug": "sir-zyax-blackraven",
  "name": "Sir Zyax Blackraven",
  "order": "sword",
  "park": "Aegir's Hall",
  "belted": 1985,
  "orkId": 109301
 },
 {
  "slug": "ashe-arala",
  "name": "Ashe Arala",
  "order": "sword",
  "park": "Ethereal Hollow",
  "belted": 1999,
  "orkId": 62898
 },
 {
  "slug": "sir-monkey",
  "name": "Sir Monkey",
  "order": "sword",
  "park": "Wavehaven",
  "belted": 2011,
  "orkId": 36705
 },
 {
  "slug": "deimos",
  "name": "Deimos",
  "order": "sword",
  "park": "Seven Sleeping Dragons",
  "belted": 2018,
  "orkId": 7303
 },
 {
  "slug": "aust-valanthe",
  "name": "Aust Valanthe",
  "order": "battle",
  "park": "Quixotic Valley",
  "belted": 2025,
  "orkId": 34318
 },
 {
  "slug": "castings",
  "name": "Castings Uhn Grimlock Von Cream Puff",
  "order": "crown",
  "park": "Wyvern's Spur",
  "belted": 2001,
  "orkId": 5143
 },
 {
  "slug": "downfall",
  "name": "Downfall",
  "order": "crown",
  "park": "Siar Geata",
  "belted": 2001,
  "orkId": 4098
 },
 {
  "slug": "scoot",
  "name": "Scoot",
  "order": "crown",
  "park": "Siar Geata",
  "belted": 2021,
  "orkId": 20003,
  "signature": {
   "name": "Close Arrow Support",
   "cry": "This is a team effort: don't fight alone.",
   "quote": "This is a team effort: don't fight alone.",
   "when": "Reaction, once per round",
   "loadout": "Bow (24\") and Single Short",
   "rules": [
    "When an enemy model charges a friendly model within 12\" of Scoot, or fights one in melee, Scoot may loose one arrow at it straight away, even though it's in combat, as long as he can see it and isn't engaged himself.",
    "The arrow is +1 to hit, and its wound rolls of 5+ are Lethal: the enemy's attention is on someone else.",
    "Don't fight alone: the friendly model may re-roll one failed hit roll in that combat.",
    "Cost: Scoot can't shoot in his next Shoot phase."
   ]
  }
 },
 {
  "slug": "azus",
  "name": "Azus",
  "order": "crown",
  "park": "Wyvern's Spur",
  "belted": 2022,
  "orkId": 18291,
  "signature": {
   "name": "Confusion",
   "cry": "Derp.",
   "quote": "Derp.",
   "when": "Once per round, when he activates",
   "loadout": "Bow (24\") and Single Short",
   "rules": [
    "Choose one enemy model within 12\" that Azus can see, then roll a D6.",
    "On a 1, Azus confuses himself instead: until the end of the round he can't shoot or charge, he's -1 to hit, and his Presence on objectives counts for the enemy. He says \"Derp.\" after the fact.",
    "On a 2+, the target takes a Leadership test. If it fails, it's Confused until the end of the round: it can't charge, it's -1 to hit, and its Presence on objectives counts for Azus's side."
   ]
  }
 },
 {
  "slug": "thistledown-notagnome",
  "name": "thistledown notagnome",
  "order": "crown",
  "park": "Wyvern's Spur",
  "belted": 2024,
  "orkId": 7297
 },
 {
  "slug": "baronet-sir-blackthorn",
  "name": "Baronet Sir Blackthorn",
  "order": "flame",
  "park": "Crimson Wood",
  "belted": 1999,
  "orkId": 5566
 },
 {
  "slug": "sir-furball",
  "name": "Sir Furball",
  "order": "flame",
  "park": "Siar Geata",
  "belted": 2014,
  "orkId": 521,
  "signature": {
   "name": "When in Doubt",
   "cry": "When in doubt, core it out.",
   "quote": "When in doubt, core it out.",
   "when": "Once per round, when he fights",
   "loadout": "Great Weapon (polearm or great sword) and plate",
   "rules": [
    "After Sir Furball's melee attacks are resolved, if any of his wounds were saved or turned aside by a ward, he makes one more attack against the same target.",
    "That attack gets +1 S and an extra -1 AP. Swing harder."
   ]
  }
 },
 {
  "slug": "leah-ssd",
  "name": "Leah (SSD)",
  "order": "flame",
  "park": "Seven Sleeping Dragons",
  "belted": 2016,
  "orkId": 13303
 },
 {
  "slug": "fiks-von-grunwald",
  "name": "Fiks von Grunwald",
  "order": "flame",
  "park": "Wavehaven",
  "belted": 2018,
  "orkId": 21690
 },
 {
  "slug": "sir-kismet",
  "name": "Sir Kismet, the Privateer Caballero Augustus Rodriguez, the Navigator",
  "order": "flame",
  "park": "Felfrost",
  "kingdom": "Kingdom of the Nine Blades",
  "guest": true,
  "belted": 2021,
  "orkId": 43232
 },
 {
  "slug": "mikezilla-darkwater",
  "name": "Mikezilla Darkwater",
  "order": "flame",
  "park": "Wavehaven",
  "belted": 2022,
  "orkId": 38997
 },
 {
  "slug": "bacchus-springjaw",
  "name": "Bacchus Springjaw",
  "order": "flame",
  "park": "Clockwork Spires",
  "belted": 2024,
  "orkId": 83775
 },
 {
  "slug": "clenawe",
  "name": "Clenawe",
  "order": "flame",
  "park": "Thor's Refuge",
  "belted": 2025,
  "orkId": 53395
 },
 {
  "slug": "evil-randy",
  "name": "Evil Randy",
  "order": "flame",
  "park": "Siar Geata",
  "belted": 2026,
  "orkId": 4436
 },
 {
  "slug": "milan-of-amber",
  "name": "Milan of Amber",
  "order": "flame",
  "park": "Dragonvale",
  "belted": 2026,
  "orkId": 20579
 },
 {
  "slug": "sir-rose-thorn",
  "name": "Sir Rose Thorn 가시 장미",
  "order": "flame",
  "park": "Siar Geata",
  "belted": 2026,
  "orkId": 23944,
  "signature": {
   "name": "Pinning Arrow",
   "cry": "Pinning Arrow!",
   "quote": "I said stop moving.",
   "when": "Reaction, once per round",
   "loadout": "Bow (24\") and Single Short instead of the Spear",
   "rules": [
    "When an enemy declares a charge against Sir Rose Thorn or a friendly model within 6\" of her, she may react before it moves if the charger is within 24\" and visible: roll one bow hit at 4+ (-1 if the charger is in cover). No wound roll.",
    "On a hit the charger is Pinned: the charge fails, it stays where it is and can't move again this round.",
    "A door, not a siege weapon: until the end of the round, a Pinned model is impassable terrain for its own army.",
    "Healers held: a Pinned model can't use healing abilities or healing spells this round.",
    "Pocket window: she may use this even while engaged in melee. Cost: she can't shoot in her next Shoot phase."
   ]
  }
 },
 {
  "slug": "lady-bridget",
  "name": "Lady Bridget",
  "order": "flame",
  "park": "Wyvern's Spur",
  "belted": 2026,
  "orkId": 7061
 },
 {
  "slug": "dame-elspeth-sharrisselva",
  "name": "Dame Elspeth Sharrisselva",
  "order": "serpent",
  "park": "Crimson Wood",
  "belted": 1996,
  "orkId": 19815
 },
 {
  "slug": "ailanthus-finvarra",
  "name": "Ailanthus Finvarra",
  "order": "serpent",
  "park": "Wyvern's Spur",
  "belted": 2003,
  "orkId": 5142
 },
 {
  "slug": "ohlanna-de-mowbray",
  "name": "Ohlanna De Mowbray, Lady",
  "order": "serpent",
  "park": "Thor's Refuge",
  "belted": 2021,
  "orkId": 48976
 },
 {
  "slug": "ser-attano-sagax",
  "name": "Ser Attano Sagax",
  "order": "serpent",
  "park": "Thor's Refuge",
  "belted": 2022,
  "orkId": 75962
 },
 {
  "slug": "jacelendrahz",
  "name": "Jacelendrahz",
  "order": "serpent",
  "park": "Crimson Wood",
  "belted": 2022,
  "orkId": 47856
 },
 {
  "slug": "dame-wendy-the-wench",
  "name": "Dame Wendy the Wench",
  "order": "serpent",
  "park": "Siar Geata",
  "belted": 2023,
  "orkId": 28767,
  "signature": {
   "name": "Mother Kisses the Boo-Boos",
   "cry": "",
   "quote": "",
   "when": "Once per round, at the start of her activation",
   "rules": [
    "Choose up to two friendly models within 6\" of Dame Wendy, not counting herself.",
    "Each one restores 1 W or one lost limb.",
    "Inspired to fight on: until the end of the round, they automatically pass Leadership tests."
   ]
  }
 },
 {
  "slug": "gravekeeper-sir-spade",
  "name": "Gravekeeper Sir Spade the Laborious",
  "order": "serpent",
  "park": "Ethereal Hollow",
  "belted": 2023,
  "orkId": 125451,
  "signature": {
   "name": "Edge of Reach",
   "cry": "Almost.",
   "quote": "Almost.",
   "when": "Always on",
   "rules": [
    "Enemies attacking Sir Spade in melee are -1 to hit, unless they charged him this round.",
    "Stacks with Aimed Strike to -2, the most the rules allow."
   ],
   "upgrade": [
    "\"Almost.\" (10 pts from his Knight budget)",
    "When an enemy's melee attack against him misses with every die, he may immediately move 2\" (not into base contact)."
   ]
  },
  "portrait": "/knights/gravekeeper-sir-spade.jpg"
 },
 {
  "slug": "halavere-blackraven",
  "name": "Halavere Blackraven",
  "order": "serpent",
  "park": "Belial Peaks",
  "belted": 2023,
  "orkId": 87728,
  "signature": {
   "name": "Sew Discord",
   "cry": "CORSAIRS!!!",
   "quote": "CORSAIRS!!!",
   "when": "Once per round, when he activates",
   "rules": [
    "Place a Shadow Pool marker (40mm) on an unoccupied spot within 12\" of Halavere, at least 1\" from every model. No line of sight is needed.",
    "Until the end of the round, enemy models within 3\" of the Shadow Pool are -1 to hit, in melee and with ranged attacks.",
    "The pool is removed at the end of the round."
   ],
   "upgrade": [
    "Shadowstep (10 pts from his Knight budget)",
    "After placing the Shadow Pool, Halavere may be placed touching it, but not within 1\" of an enemy."
   ]
  }
 },
 {
  "slug": "ser-jynx-mercades",
  "name": "Ser Jynx Mercades",
  "order": "flame",
  "park": "Blackthorne",
  "kingdom": "Kingdom of the Crystal Groves",
  "belted": 2008,
  "orkId": 15427,
  "expansion": "crystal-grove"
 },
 {
  "slug": "piper-lesonette",
  "name": "Piper Lesonette",
  "order": "flame",
  "park": "Blackthorne",
  "kingdom": "Kingdom of the Crystal Groves",
  "belted": 2019,
  "orkId": 17474,
  "expansion": "crystal-grove"
 },
 {
  "slug": "baron-cerberus-grimglaive",
  "name": "Baron Cerberus Grimglaive of St. Beast",
  "order": "battle",
  "park": "Blackthorne",
  "kingdom": "Kingdom of the Crystal Groves",
  "belted": 2025,
  "orkId": 19555,
  "expansion": "crystal-grove"
 },
 {
  "slug": "onyx-wolfyre",
  "name": "Onyx Wolfyre",
  "order": "serpent",
  "park": "Blackthorne",
  "kingdom": "Kingdom of the Crystal Groves",
  "belted": 2026,
  "orkId": 22578,
  "expansion": "crystal-grove",
  "note": "To be belted Knight of the Serpent in October 2026; until then the ORK still lists her as a Squire."
 }
];
