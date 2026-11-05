const RULES: [string, RegExp][] = [
  ['🎂', /anniv|birthday|bday/],
  ['🎄', /noel|christmas|xmas/],
  ['🎆', /nouvel an|new year|reveillon/],
  ['🏥', /medecin|docteur|doctor|dentist|hopital|hospital|kine|clinic|rdv medical|medical/],
  ['💊', /pharmac|vaccin/],
  ['✈️', /\bvol\b|flight|avion|airport|aeroport/],
  ['🚆', /train|sncf|gare\b/],
  ['🏖️', /vacances|holiday|vacation|conges|day off/],
  ['🍽️', /resto|restaurant|dejeuner|diner|dinner|lunch|brunch/],
  ['🥂', /apero|drinks|cocktail|soiree|party|fete/],
  ['💼', /reunion|meeting|standup|daily|call|entretien|interview|\brh\b/],
  ['🎬', /cine|movie|film/],
  ['🎵', /concert|festival|musique|music/],
  ['⚽', /match|foot|soccer|sport|gym|tennis|running/],
  ['🏋️', /fitness|muscu|workout|yoga/],
  ['🎓', /ecole|school|cours|class|exam|graduation|diplome/],
  ['🛠️', /deadline|livraison|delivery|release|deploy/],
  ['🚗', /garage|controle technique|car service|voiture/],
  ['💇', /coiffeur|hairdresser|barber/],
  ['🐾', /veto|vet\b|chien|chat\b/],
]

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export const DEFAULT_EVENT_ICON = '📅'

/** Picks an emoji from French or English keywords in the event title. */
export function eventIcon(title: string): string {
  const text = normalize(title)
  return RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? DEFAULT_EVENT_ICON
}
