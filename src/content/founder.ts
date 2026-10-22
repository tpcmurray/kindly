import type { LifestyleDef, PerkDef } from './types';

export const LIFESTYLE: LifestyleDef[] = [
  { id: 'apartment', name: 'Better apartment', cost: 60e3, perk: 'Clicks +10% ("well rested")' },
  { id: 'coach', name: 'Executive coach', cost: 150e3, perk: 'Board satisfaction falls 20% slower' },
  { id: 'car', name: 'Electric sports car', cost: 180e3, perk: 'Clicks ×2 ("networking")' },
  { id: 'house', name: 'Bay Area house', cost: 4.5e6, perk: 'Hiring 15% cheaper ("recruiting dinners")' },
  { id: 'vineyard', name: 'Vineyard', cost: 12e6, perk: 'Funding rounds unlock at 80% of the user target' },
  { id: 'yacht', name: 'Yacht', cost: 40e6, perk: 'Everything moves 25% faster' },
  { id: 'bunker', name: 'NZ bunker', cost: 40e6, perk: 'Nothing' },
  { id: 'newspaper', name: 'A newspaper', cost: 250e6, perk: 'The news is kinder to you' },
  { id: 'island', name: 'Private island', cost: 300e6, perk: 'Nothing' },
  { id: 'flight', name: 'Suborbital flight', cost: 450e6, perk: 'Nothing' },
  { id: 'team_sports', name: 'A sports team', cost: 2e9, perk: 'Nothing' },
];

export const PERKS: PerkDef[] = [
  { id: 'lunches', name: 'Catered lunches', perHead: 800, morale: 12, desc: 'Every day, for everyone.' },
  { id: 'gym', name: 'On-site gym', perHead: 300, morale: 5, desc: 'Take care of yourself. We mean it.' },
];
