import type { UpgradeDef } from './types';

// Costs and effects come from prototype/model.mjs. Descriptions are press-release voice.
export const UPGRADES: UpgradeDef[] = [
  // ---------- Act 1: Growth ----------
  { id: 'invite', act: 1, name: 'Invite Friends', cost: 2e3, needUsers: 50, effects: { vir: 2.0 },
    desc: 'We\'re excited to help you bring your favorite people to Kindly.', hint: 'Users bring friends ×2' },
  { id: 'onboarding', act: 1, name: 'Better Onboarding', cost: 5e3, needUsers: 500, effects: { click: 2 },
    desc: 'A warmer welcome for every new member, from the very first photo.', hint: 'Clicks ×2' },
  { id: 'albums', act: 1, name: 'Photo Albums', cost: 30e3, needUsers: 5e3, effects: { nps: 5, ret: 0.6 },
    desc: 'Keep your memories together, in one place, forever.', hint: '+NPS' },
  { id: 'darkmode', act: 1, name: 'Dark Mode', cost: 120e3, needUsers: 2e4, effects: { nps: 3 },
    desc: 'Easy on the eyes for late-night scrolling. Free for everyone.', hint: '+NPS' },
  { id: 'chats', act: 1, name: 'Group Chats', cost: 340e3, needUsers: 6e4, effects: { nps: 4, ret: 0.5, vir: 1.15 },
    desc: 'Plan the barbecue, share the baby photos, settle the thermostat debate. Together.', hint: '+NPS, +invites' },
  { id: 'storage', act: 1, name: 'Unlimited Photo Storage', cost: 900e3, needUsers: 1.5e5, effects: { nps: 4, ret: 0.5 },
    desc: 'Never delete a memory again. Unlimited storage, free, forever.', hint: '+NPS' },
  { id: 'mobile', act: 1, name: 'Mobile App', cost: 1.5e6, needUsers: 2.5e5, effects: { nps: 3, vir: 1.4 },
    desc: 'Kindly in your pocket, wherever your people are.', hint: '+NPS, growth ×1.4' },
  { id: 'memories', act: 1, name: 'Memories', cost: 2.5e6, needUsers: 6e5, effects: { nps: 3, ret: 0.5 },
    desc: '"On this day…" A gentle look back at the moments that mattered.', hint: '+NPS' },

  // ---------- Act 2: Monetize ----------
  { id: 'kindlyplus', act: 2, name: 'Launch Kindly+', cost: 3e6, needUsers: 3e6, flag: 'paid', effects: {},
    desc: 'Introducing Kindly+, for members who want a little more.', hint: 'Enables paying members' },
  { id: 'supporter', act: 2, name: 'Supporter Tier', cost: 2e6, needUsers: 3e6, needFlag: 'paid', honest: true, effects: { honestConv: 1.8 },
    desc: 'An optional way to help keep Kindly going. Nothing is paywalled, ever.', hint: 'Small revenue, no NPS cost' },
  { id: 'dark_paywall', act: 2, name: 'Dark Mode → Kindly+', cost: 2e6, needUsers: 3.5e6, needFlag: 'paid', dark: true, paywalls: 'darkmode', effects: { conv: 1.3, nps: -6 },
    desc: 'We\'re excited to make Dark Mode part of the Kindly+ experience.', hint: '+conversion, −NPS' },
  { id: 'ads', act: 2, name: 'Ads in Feed', cost: 8e6, needUsers: 5e6, flag: 'ads', effects: {},
    desc: 'Discover brands you\'ll love, right alongside the people you love.', hint: 'Unlocks the Ad load lever' },
  { id: 'simplify', act: 2, name: 'Simplify Settings', cost: 6e6, needUsers: 7e6, dark: true, effects: { ret: 0.8, nps: -3 },
    desc: 'A cleaner, simpler settings page. (Data export has been retired.)', hint: '+retention, −NPS' },
  { id: 'storage_limit', act: 2, name: 'Photo Storage: 5 GB Free', cost: 12e6, needUsers: 1e7, dark: true, paywalls: 'storage', effects: { conv: 1.8, nps: -10, ret: 0.4 },
    desc: 'Free accounts now include a generous 5 GB. Need more? Kindly+ has you covered.', hint: '+conversion, −−NPS' },
  { id: 'algo_feed', act: 2, name: 'Algorithmic Feed', cost: 25e6, needUsers: 1.4e7, dark: true, effects: { eng: 1.3, nps: -5 },
    desc: 'A feed that knows what you want to see, before you do.', hint: '+engagement, −NPS' },
  { id: 'annual', act: 2, name: 'Annual Plans', cost: 20e6, needUsers: 1.8e7, needFlag: 'paid', effects: { ret: 0.6, paidChurn: 0.5 },
    desc: 'Save 20% when you commit to a whole year of Kindly+.', hint: '+retention, paid churn ÷2' },
  { id: 'cancel_flow', act: 2, name: 'Retention Flow', cost: 30e6, needUsers: 2.4e7, needFlag: 'paid', dark: true, effects: { ret: 0.6, nps: -4 },
    desc: 'Before you go, we\'d love to understand why. (9 steps.)', hint: '+retention, −NPS' },

  // ---------- Act 3: Squeeze ----------
  { id: 'business', act: 3, name: 'Kindly for Business', cost: 40e6, act3Min: 1, flag: 'biz', effects: {},
    desc: 'We\'re excited to help local businesses reach the people who love them.', hint: 'Advertisers arrive' },
  { id: 'marketplace', act: 3, name: 'Kindly Marketplace', cost: 80e6, act3Min: 6, needFlag: 'biz', flag: 'market', effects: {},
    desc: 'Buy and sell with the people you trust.', hint: 'Sellers arrive' },
  { id: 'promoted', act: 3, name: 'Promoted Posts Everywhere', cost: 60e6, act3Min: 13, dark: true, effects: { adMult: 1.3, nps: -8 },
    desc: 'More ways for businesses to be part of your day, and your albums.', hint: '+ad revenue, −−NPS' },
  { id: 'data', act: 3, name: 'Data Partnerships', cost: 50e6, act3Min: 20, dark: true, flag: 'data', effects: {},
    desc: 'Working with trusted partners to make Kindly more relevant.', hint: 'Unlocks Data sharing' },
  { id: 'ai_moonshot', act: 3, name: 'Kindly AI', cost: 1e9, act3Min: 18, dark: true, effects: { eng: 1.1, nps: -4, board: 10 },
    desc: 'The future of connection is here. The board is very excited.', hint: 'Board +10, −NPS' },
  { id: 'synthetic', act: 3, name: 'Synthetic Engagement', cost: 120e6, act3Min: 30, dark: true, effects: { eng: 1.2, nps: -6 },
    desc: 'AI friends who keep your feed lively, so no one ever feels alone.', hint: '+engagement, −NPS' },
];

export const UPGRADE_BY_ID: Record<string, UpgradeDef> = Object.fromEntries(UPGRADES.map(u => [u.id, u]));
