import type { TestDef } from './types';

// A/B tests from the Growth team. Act 1 tests are harmless. From Act 2 they are dark patterns.
// Tests arrive one at a time in array order (first eligible unseen), so the dark list escalates:
// mild first, horrifying last. Business-facing and synthetic ones are gated so they wait for Act 3.
const DARK_B = { conv: 1.01, nps: -0.6, ret: 0.05 };
// Act 1 virality compounds over ~20 tests; 1.0025 each keeps the total near the old 5 × 1.01 so Act 3 isn't pulled early.
const BENIGN_B = { vir: 1.0025 };
const NICE_B = { vir: 1.0025, nps: 0.5 };

export const TESTS: TestDef[] = [
  // ---------------- Act 1: benign ----------------
  { id: 't1', act: 1, dark: false, title: 'Invite button colour', a: 'Blue invite button', b: 'Green invite button', result: '+1% invites', effectsB: BENIGN_B },
  { id: 't2', act: 1, dark: false, title: 'Invite button size', a: 'Small "Invite" link', b: 'Bigger "Invite" button', result: '+1% invites', effectsB: BENIGN_B },
  { id: 't3', act: 1, dark: false, title: 'Welcome message', a: '"Welcome to Kindly"', b: '"Your people are here"', result: '+1% invites', effectsB: BENIGN_B },
  { id: 't4', act: 1, dark: false, title: 'Sign-up button', a: 'Gray "Sign up"', b: 'Green "Join your people"', result: '+1% sign-ups', effectsB: BENIGN_B },
  { id: 't5', act: 1, dark: false, title: 'Photo upload', a: 'Upload one photo at a time', b: 'Upload a whole album', result: '+1% invites', effectsB: BENIGN_B },
  { id: 't6', act: 1, dark: false, title: 'Onboarding length', a: 'Five onboarding screens', b: 'Three onboarding screens', result: '+1% sign-ups', effectsB: BENIGN_B },
  { id: 't7', act: 1, dark: false, title: 'Invite message', a: '"Join me on Kindly"', b: '"I saved you a seat on Kindly"', result: '+1% invites', effectsB: BENIGN_B },
  { id: 't8', act: 1, dark: false, title: 'Photo descriptions', a: 'No prompt for alt text', b: '"Describe this photo for friends who use screen readers"', result: '+1% invites, happier members', effectsB: NICE_B },
  { id: 't9', act: 1, dark: false, title: 'Text size', a: '14px body text', b: '16px body text', result: '+1% time reading, happier members', effectsB: NICE_B },
  { id: 't10', act: 1, dark: false, title: 'Empty feed', a: 'A blank feed for new members', b: '"Invite three people you love"', result: '+1% invites', effectsB: BENIGN_B },
  { id: 't11', act: 1, dark: false, title: 'Profile photo', a: 'Profile photo required at sign-up', b: 'Profile photo optional', result: '+1% sign-ups', effectsB: BENIGN_B },
  { id: 't12', act: 1, dark: false, title: 'Upload progress', a: 'Spinning circle', b: 'Progress bar with photo previews', result: '+1% uploads', effectsB: BENIGN_B },
  { id: 't13', act: 1, dark: false, title: 'Comment box', a: 'Placeholder: "Comment"', b: 'Placeholder: "Say something kind"', result: '+1% comments, kinder threads', effectsB: NICE_B },
  { id: 't14', act: 1, dark: false, title: 'Like icon', a: 'Thumbs up', b: 'Heart', result: '+1% likes', effectsB: BENIGN_B },
  { id: 't15', act: 1, dark: false, title: 'Share link', a: 'Share inside Kindly only', b: 'Add "Copy link" to the share sheet', result: '+1% invites', effectsB: BENIGN_B },
  { id: 't16', act: 1, dark: false, title: 'Birthdays', a: 'No birthday reminders', b: '"It\'s Sam\'s birthday. Say hi?"', result: '+1% invites', effectsB: BENIGN_B },
  { id: 't17', act: 1, dark: false, title: 'High contrast', a: 'High contrast in Settings', b: 'Follow the phone\'s contrast setting automatically', result: '+1% sessions, happier members', effectsB: NICE_B },
  { id: 't18', act: 1, dark: false, title: 'Photo crop', a: 'Square crop', b: 'Keep the original shape', result: '+1% uploads', effectsB: BENIGN_B },
  { id: 't19', act: 1, dark: false, title: 'Album covers', a: 'First photo is the cover', b: 'Pick your own cover', result: '+1% albums shared', effectsB: BENIGN_B },
  { id: 't1b', act: 1, dark: false, title: 'Caught up', a: 'Feed just ends', b: '"You\'re all caught up. Go outside! ☀️"', result: '+1% invites, happier members', effectsB: NICE_B },

  // ---------------- Act 2–3: dark patterns, mild → horrifying ----------------
  { id: 't28', act: [2, 3], dark: true, title: 'Price display', a: '$5.99 / month', b: '"Just 20¢ a day"', result: '+2% Kindly+', effectsB: DARK_B },
  { id: 't26', act: [2, 3], dark: true, title: 'Checkbox', a: 'Marketing emails: unchecked', b: 'Marketing emails: pre-checked', result: '+1% engagement', effectsB: DARK_B },
  { id: 't30', act: [2, 3], dark: true, title: 'Unsubscribe link', a: 'Normal-size link', b: '8px light-gray link', result: '+1% engagement', effectsB: DARK_B },
  { id: 't21', act: [2, 3], dark: true, title: 'Upgrade prompt', a: '"No thanks"', b: '"Remind me later" (no way to say no)', result: '+2% Kindly+', effectsB: DARK_B },
  { id: 't32', act: [2, 3], dark: true, title: 'Decline button', a: '"No thanks"', b: '"No thanks, I like my photos blurry"', result: '+3% Kindly+', effectsB: DARK_B },
  { id: 't29', act: [2, 3], dark: true, title: 'Scarcity', a: 'No banner', b: '"Only 3 Kindly+ discounts left today"', result: '+2% Kindly+', effectsB: DARK_B },
  { id: 't33', act: [2, 3], dark: true, title: 'Countdown', a: 'Annual discount, no deadline', b: '"Offer ends in 09:59" (resets every visit)', result: '+3% Kindly+', effectsB: DARK_B },
  { id: 't25', act: [2, 3], dark: true, title: 'Notification copy', a: '"Maya posted a photo"', b: '"Someone is talking about you 👀"', result: '+6% opens', effectsB: DARK_B },
  { id: 't31', act: [2, 3], dark: true, title: 'Friend activity', a: 'Show real activity', b: '"12 friends are waiting for you"', result: '+4% opens', effectsB: DARK_B },
  { id: 't34', act: [2, 3], dark: true, title: 'Red badge', a: 'Badge counts new messages', b: 'Badge also counts "suggestions" (never reaches zero)', result: '+5% opens', effectsB: { ...DARK_B, eng: 1.01 } },
  { id: 't35', act: [2, 3], dark: true, title: 'Upgrade nag', a: 'Kindly+ prompt once a week', b: 'Kindly+ prompt every time the app opens', result: '+2% Kindly+', effectsB: DARK_B },
  { id: 't36', act: [2, 3], dark: true, title: 'End of feed', a: '"You\'re all caught up"', b: 'Endless suggested posts from strangers', result: '+11% time in app', effectsB: { ...DARK_B, eng: 1.01 } },
  { id: 't37', act: [2, 3], dark: true, title: 'Autoplay', a: 'Tap to play the next memory', b: 'Next memory plays in 3… 2… 1…', result: '+7% time in app', effectsB: { ...DARK_B, eng: 1.01 } },
  { id: 't38', act: [2, 3], dark: true, title: 'Streaks', a: 'No streaks', b: '"Don\'t lose your 41-day streak with Maya! 🔥"', result: '+5% daily opens', effectsB: DARK_B },
  { id: 't39', act: [2, 3], dark: true, title: 'Social proof', a: '"Try Kindly+"', b: '"2,481 people near you upgraded today" (number is random)', result: '+2% Kindly+', effectsB: DARK_B },
  { id: 't24', act: [2, 3], dark: true, title: 'Trial ending', a: 'Email 3 days before the trial ends', b: 'No email; charge automatically', result: '+3% Kindly+', effectsB: DARK_B },
  { id: 't40', act: [2, 3], dark: true, title: 'Free trial', a: 'Free trial, no card needed', b: 'Card required; trial rolls into an annual plan', result: '+4% Kindly+', effectsB: DARK_B },
  { id: 't41', act: [2, 3], dark: true, title: 'Checkout total', a: 'Price includes all fees', b: '"Service fee" appears on the last screen', result: '+2% revenue per sale', effectsB: DARK_B },
  { id: 't42', act: [2, 3], dark: true, title: 'Plan picker', a: 'Monthly and annual side by side', b: 'Annual pre-selected; monthly under "See other options"', result: '+3% annual plans', effectsB: DARK_B },
  { id: 't23', act: [2, 3], dark: true, title: 'Ad style', a: 'Ads labelled "Sponsored"', b: 'Ads styled like friends\' posts', result: '+9% ad clicks', effectsB: { ...DARK_B, eng: 1.01 } },
  { id: 't43', act: [2, 3], dark: true, title: 'Ad close button', a: '✕ closes the ad', b: 'Tiny ✕; tapping near it opens the advertiser', result: '+6% ad clicks', effectsB: { ...DARK_B, eng: 1.01 } },
  { id: 't44', act: [2, 3], dark: true, title: 'Find friends', a: '"Find friends (optional)"', b: 'A big "Continue" button that uploads your whole address book', result: '+8% contacts found', effectsB: DARK_B },
  { id: 't45', act: [2, 3], dark: true, title: 'Invite reminders', a: 'Invites sent when you tap Send', b: 'Kindly texts your contacts "on your behalf" every week until they join', result: '+5% sign-ups', effectsB: DARK_B },
  { id: 't27', act: [2, 3], dark: true, title: 'Storage warning', a: '"You\'re at 80% of your storage"', b: '"Your memories will be deleted in 7 days"', result: '+5% Kindly+', effectsB: DARK_B },
  { id: 't46', act: [2, 3], dark: true, title: 'Downgrade', a: 'Downgrading keeps all your photos', b: 'Downgrading deletes photos over 5 GB, oldest first', result: '+4% retention', effectsB: { ...DARK_B, ret: 0.15 } },
  { id: 't47', act: [2, 3], dark: true, title: 'Free forever', a: '"Free forever"', b: '"Free forever*"', result: '+1% sign-ups', effectsB: DARK_B },
  { id: 't48', act: [2, 3], dark: true, title: 'Delete account', a: '"Delete account" in Settings', b: 'Only "Deactivate"; deleting means emailing support', result: '+3% retention', effectsB: DARK_B },
  { id: 't22', act: [2, 3], dark: true, title: 'Data export', a: 'Settings › Export', b: 'Settings › Account › Advanced › Legacy › Export', result: '+1% retention', effectsB: DARK_B },
  { id: 't20', act: [2, 3], dark: true, title: 'Cancel button', a: 'Blue "Cancel subscription" button', b: 'Gray text: "I don\'t want to keep my memories"', result: '+4% retention', effectsB: { ...DARK_B, ret: 0.15 } },
  { id: 't49', act: [2, 3], dark: true, title: 'Cancel by phone', a: 'Cancel in the app', b: 'Cancel by phone, weekdays 10–11 a.m.', result: '+6% retention', effectsB: { ...DARK_B, ret: 0.15 } },
  { id: 't50', act: [2, 3], dark: true, title: 'Default audience', a: 'New posts: Friends', b: 'New posts: Public', result: '+7% reach', effectsB: { ...DARK_B, eng: 1.01 } },
  { id: 't51', act: [2, 3], dark: true, title: 'Privacy settings', a: 'One privacy page', b: '14 toggles on 6 screens; they reset after each update', result: '+2% data shared', effectsB: DARK_B },
  { id: 't52', act: [2, 3], dark: true, title: 'Photo location', a: 'Location removed from photos', b: 'Location kept in every photo by default', result: '+3% ad relevance', effectsB: DARK_B },
  { id: 't53', act: [2, 3], dark: true, title: 'Profile views', a: 'No profile-view alerts', b: '"Someone viewed your profile. See who with Kindly+"', result: '+4% Kindly+', effectsB: DARK_B },
  { id: 't54', act: [2, 3], dark: true, title: 'Seen receipts', a: 'No read receipts', b: '"Maya saw your message 2 hours ago" shown to you, and to Maya', result: '+6% replies', effectsB: { ...DARK_B, eng: 1.01 } },
  { id: 't55', act: [2, 3], dark: true, title: 'Face tags', a: 'Suggest tags to you', b: 'Auto-tag faces in everyone\'s photos, including people not on Kindly', result: '+9% tags', effectsB: DARK_B },
  { id: 't56', act: [2, 3], dark: true, title: 'Quiet hours', a: 'No notifications 10 p.m.–7 a.m.', b: '"Your friends are still up 🌙" at 1 a.m.', result: '+5% late-night sessions', effectsB: { ...DARK_B, eng: 1.01 } },
  { id: 't57', act: [2, 3], dark: true, title: 'First likes', a: 'New posts start at zero likes', b: 'New posts get 3 likes from dormant accounts', result: '+8% posting', effectsB: { ...DARK_B, nps: -0.8 } },
  { id: 't58', act: [2, 3], dark: true, title: 'Teen accounts', a: 'Under-18 accounts private by default', b: 'Under-18 accounts public by default', result: '+4% reach', effectsB: { ...DARK_B, nps: -0.8 } },
  { id: 't59', act: [2, 3], dark: true, title: 'Anniversary', a: '"Your memory from 3 years ago"', b: '"Remember Dad? 💙" on the anniversary of his death', result: '+12% opens', effectsB: { ...DARK_B, nps: -1, eng: 1.01 } },

  // ---------------- Act 3: businesses and synthetic engagement ----------------
  { id: 't60', act: 3, after: 'business', dark: true, title: 'Boost nag', a: 'Small "Boost" link on business posts', b: '"Only 4% of your followers saw this. Boost to reach them."', result: '+6% ad spend', effectsB: DARK_B },
  { id: 't61', act: 3, after: 'business', dark: true, title: 'Reach report', a: 'Businesses see real reach', b: 'Businesses see "estimated reach" (×3)', result: '+5% ad spend', effectsB: DARK_B },
  { id: 't62', act: 3, after: 'business', dark: true, title: 'Reviews', a: 'All reviews shown', b: 'Good reviews shown only for businesses that advertise', result: '+7% ad spend', effectsB: { ...DARK_B, nps: -0.8 } },
  { id: 't63', act: 3, after: 'synthetic', dark: true, title: 'AI label', a: 'AI accounts labelled "AI"', b: 'Kindly Companions shown with no label', result: '+9% replies', effectsB: { ...DARK_B, nps: -1, eng: 1.01 } },
  { id: 't64', act: 3, after: 'synthetic', dark: true, title: 'New memories', a: 'Memories made from your photos', b: 'AI memories of days that never happened, with people who are gone', result: '+14% time in app', effectsB: { ...DARK_B, nps: -1, eng: 1.01 } },
];
