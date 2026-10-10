// Edit this file to update the Overview page as the game moves through production.
export const STATUS = [
  { area: "Core rules", state: "done", note: "Turn sequence, attacks, limb and Lethal hits, lives and morale" },
  { area: "Mustering and army building", state: "done", note: "500-point warbands, character limits, example roster" },
  { area: "Troops and magic", state: "done", note: "Twelve classes, three spell lists, gear" },
  { area: "Scenarios", state: "done", note: "Eight Amtgard battlegames with table maps" },
  { area: "Knight signature abilities", state: "collecting", note: "Knights submit their ability on this site" },
  { area: "Paragon profiles", state: "drafting", note: "Base profile set; class details in progress" },
  { area: "Character art", state: "drafting", note: "Player template graphics for each Knight" },
  { area: "Expansion: Invasion of the Crystal Grove", state: "drafting", note: "Blackthorne faction, four Knights, crystal terrain, three scenarios" },
  { area: "Playtesting", state: "next", note: "Open playtests at Westmarch parks" },
];

export const STATE_LABEL = { done: "Done", collecting: "Collecting", drafting: "In progress", next: "Up next" };

export const FEATURES = [
  { title: "Limbs before lives", text: "Most wounds take an arm or a leg. Only a natural 6 or a heavy weapon strikes the body, just like on the field." },
  { title: "Back from Nirvana", text: "Every model has lives. The slain return to fight again, and losing your General for good can break the army's nerve." },
  { title: "Named Knights and Paragons", text: "Your warband is led by real Knights and Paragons of Westmarch, each with their own datasheet." },
  { title: "Amtgard battlegames", text: "Capture the Flag, King of the Hill, Bridge Battle, The Ditch and more, each with its own table map." },
];

export const STYLES = [
  ["Line fighter", "Sword and shield, holding the line"], ["Florentine duelist", "Two blades, fast and aggressive"],
  ["Heavy hitter", "Great weapon, big swings"], ["Archer or thrower", "Bows, javelins, rocks"],
  ["Caster", "Spells and spellballs"], ["Healer and support", "Keeping everyone in the fight"],
  ["Scout and flanker", "Speed, angles, surprise"], ["Commander", "Calling the shots"],
];
export const EFFECTS = [
  ["Hit harder", "More damage, sharper strikes"], ["Protect allies", "Shield, heal or take the hit"],
  ["Lead and inspire", "Make everyone around you better"], ["Outwit the enemy", "Tricks, traps and misdirection"],
  ["Bend magic", "Spells, wards and counters"], ["Get back up", "Refuse to stay down"],
];
export const FREQS = [
  ["Always on", "A small, steady edge"], ["Once per round", "A reliable trick"],
  ["Once per game", "One huge moment"], ["As a reaction", "Triggers when something happens"],
];

export const ORDER_NAME = { sword: "Knight of the Sword", battle: "Battle Knight", crown: "Knight of the Crown", flame: "Knight of the Flame", serpent: "Knight of the Serpent" };
export const REVIEW = { new: "New", reviewed: "Reviewed", balanced: "Balanced", inbook: "In the rulebook" };
