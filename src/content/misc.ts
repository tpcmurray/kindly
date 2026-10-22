import type { ArticleDef, EndingDef, PopupDef, TicketDef } from './types';

export const FOUNDER_NAMES = [
  'Jordan Reyes', 'Sam Okafor', 'Alex Morgan', 'Riley Chen', 'Casey Park',
  'Taylor Brooks', 'Jamie Novak', 'Avery Singh', 'Morgan Lee', 'Quinn Harper',
  'Robin Castellanos', 'Devon Achterberg', 'Kai Nakamura', 'Sasha Petrova', 'Remy Okonkwo',
  'Ari Lindqvist', 'Jules Moreau', 'Noor Haddad', 'Emery Walsh', 'Rowan Adeyemi',
  'Sky Delgado', 'Charlie Mbeki',
];

export const OUTAGES = [
  '⚠ Photo uploads are down',
  '⚠ The feed won\'t load',
  '⚠ Notifications are firing twice',
  '⚠ Log-in is broken on Android',
  '⚠ Group chats are out of order',
  '⚠ Albums are showing the wrong photos',
  '⚠ Memories is showing the wrong day',
  '⚠ Photo search is down',
  '⚠ Invites are landing in spam',
  '⚠ The app crashes on launch',
  '⚠ Videos won\'t play',
  '⚠ Password reset emails aren\'t sending',
  '⚠ Comments are disappearing',
];

export const TICKETS: TicketDef[] = [
  { id: 'k1', text: "How do I add my mom?", act: [1, 4] },
  { id: 'k2', text: "I can't find my album from Sunday", act: 1 },
  { id: 'k3', text: "Is there a way to make a post just for family?", act: 1 },
  { id: 'k4', text: "Uploads keep failing", act: [1, 4] },
  { id: 'k5', text: "My invite link says expired", act: 1 },
  { id: 'k6', text: "Can I change my username? I picked it at 2am", act: 1 },
  { id: 'k7', text: "How do I put photos in an album after I already posted them?", act: 1 },
  { id: 'k8', text: "My grandma posted the same photo three times, can you help her delete two", act: 1 },
  { id: 'k9', text: "Photo came out sideways", act: [1, 4] },
  { id: 'k10', text: "Can you add a way to see who liked my post", act: 1 },
  { id: 'k11', text: "Is there an app for phones yet?", act: 1 },
  { id: 'k12', text: "How do I turn notifications off? (thank you for asking first)", act: 1 },
  { id: 'k13', text: "I accidentally invited my whole contact list including my dentist", act: 1 },
  { id: 'k14', text: "Can two people share one album?", act: 1 },
  { id: 'k15', text: "Love the app. No question, just wanted to say that", act: 1 },
  { id: 'k16', text: "How do I leave a group chat without everyone seeing", act: [1, 2] },
  { id: 'k17', text: "Video upload stuck at 99%", act: [1, 4] },
  { id: 'k18', text: "Can I download my photos? Just want a backup", act: 1 },
  { id: 'k19', text: "Why was I charged twice?", act: [2, 4] },
  { id: 'k20', text: "How do I export my photos?", act: [2, 4] },
  { id: 'k21', text: "How do I cancel Kindly+?", act: [2, 4] },
  { id: 'k22', text: "My account was hacked", act: [2, 4] },
  { id: 'k23', text: "Why can't I see my sister's posts?", act: [2, 4] },
  { id: 'k24', text: "Dark mode was free last week", act: [2, 4] },
  { id: 'k25', text: "It says my storage is full. I didn't change anything", act: [2, 4] },
  { id: 'k26', text: "Can I turn off the ads?", act: [2, 4] },
  { id: 'k27', text: "Why does my feed show strangers now?", act: [2, 4] },
  { id: 'k28', text: "I never signed up for the annual plan", act: [2, 4] },
  { id: 'k29', text: "The cancel button doesn't do anything", act: [2, 4] },
  { id: 'k30', text: "Where did the download button go?", act: [2, 4] },
  { id: 'k31', text: "I get notifications in the middle of the night", act: [2, 4] },
  { id: 'k32', text: "How do I get a refund for the cancellation fee?", act: [2, 4] },
  { id: 'k33', text: "My trial ended and I wasn't told", act: [2, 4] },
  { id: 'k34', text: "Can I go back to the old feed, in order?", act: [2, 4] },
  { id: 'k35', text: "My mom's photos are blurry unless she pays", act: [2, 4] },
  { id: 'k36', text: "Why did my price go up?", act: [2, 4] },
  { id: 'k37', text: "An ad used my friend's photo", act: [2, 4] },
  { id: 'k38', text: "How do I stop 'suggested' posts", act: [2, 4] },
  { id: 'k39', text: "My Huddle photos didn't come over", act: [2, 4] },
  { id: 'k40', text: "Please stop emailing me 'we miss you'", act: [2, 4] },
  { id: 'k41', text: "Please give me my photos back", act: [3, 4] },
  { id: 'k42', text: "Someone pretending to be Kindly asked for my password", act: [3, 4] },
  { id: 'k43', text: "I bought something on Marketplace and it never came", act: [3, 4] },
  { id: 'k44', text: "Who is Kindly Friend Ava?", act: [3, 4] },
  { id: 'k45', text: "The assistant closed my ticket without answering", act: [3, 4] },
  { id: 'k46', text: "I want to talk to a person", act: [3, 4] },
  { id: 'k47', text: "My business page reach is almost zero", act: [3, 4] },
  { id: 'k48', text: "Seller payout still processing after six weeks", act: [3, 4] },
  { id: 'k49', text: "Why are you selling my information?", act: [3, 4] },
  { id: 'k50', text: "My late father's account keeps getting 'Kindly Friend' comments", act: [3, 4] },
  { id: 'k51', text: "My account is posting ads I didn't write", act: [3, 4] },
  { id: 'k52', text: "Ad charges on my card I didn't approve", act: [3, 4] },
  { id: 'k53', text: "The AI wrote a caption on my post. Please remove it", act: [3, 4] },
  { id: 'k54', text: "How do I delete my account? The assistant keeps offering me a discount", act: [3, 4] },
  { id: 'k55', text: "Reported a scam seller three times. Still up", act: [3, 4] },
  { id: 'k56', text: "Please. Just the baby photos", act: [3, 4] },
  { id: 'k57', text: "What happens to my photos after Friday?", act: 4 },
  { id: 'k58', text: "The export page says 'asset sold'", act: 4 },
  { id: 'k59', text: "I was charged after canceling. Support email bounces", act: 4 },
  { id: 'k60', text: "Where did the group chats go?", act: 4 },
  { id: 'k61', text: "Is anyone still there?", act: 4 },
  { id: 'k62', text: "My grandmother's account is gone. Can you restore it?", act: 4 },
];

export const POPUPS: PopupDef[] = [
  { id: 'nps', title: 'Net Promoter Score (NPS)', text: 'We ask members how likely they are, from 0 to 10, to recommend Kindly to a friend. NPS is the share who answer 9 or 10 (promoters) minus the share who answer 0 to 6 (detractors). It runs from −100 to +100. Above zero, more members would recommend Kindly than would warn a friend away.' },
  { id: 'retention', title: 'Retention', text: 'The share of members who are still here each month. High retention means members are happy to stay, or find it hard to leave. Both count the same.' },
  { id: 'board', title: 'Board Satisfaction', text: 'How the board feels about Kindly\'s progress, from 0 to 100. It rises when revenue beats the quarterly target and falls when it doesn\'t. The target goes up every quarter. When satisfaction is low and the founder holds less than half the votes, the board may act on its own.' },
  { id: 'cap', title: 'Cap table', text: 'Who owns Kindly, and who gets a vote. Each funding round sells part of the company to investors, usually with a seat on the board. Most shares carry one vote each, but some founders keep control through special share classes that carry extra votes. Big decisions go to whoever holds more than half the votes.' },
  { id: 'runway', title: 'Runway', text: 'How many months Kindly can keep paying its bills at the current burn rate before the money runs out. If it reaches zero, Kindly has to let people go.' },
  { id: 'enps', title: 'Team morale (eNPS)', text: 'Employee Net Promoter Score: would our people recommend Kindly as a place to work? Happier teams get more done. Perks and retreats lift it. Layoffs do not.' },
];

const GRANDMA = { handle: 'maya.k', text: 'does anyone know how to get photos off this thing? grandma\'s account is gone. those were the only pictures of her' };
const GRANDMA_RESISTER = { handle: 'maya.k', text: 'heard the founder tried to stop some of it. didn\'t matter, I guess. grandma\'s account is gone' };

const PAYOUT: ArticleDef = { outlet: 'The Valley Wire', section: 'Business', headline: '{name} walks away with {payout} as {laidOff} Kindly employees are laid off', deck: 'The founder\'s payout arrived the same week the last of Kindly\'s staff were offered two weeks\' severance.' };
const CHAPTER_11: ArticleDef = { outlet: 'Coastline Business Journal', section: 'Markets', headline: 'Kindly files for Chapter 11', deck: 'Debt from Ashgrove\'s buyout and two special dividends left the company unable to pay its lenders. Members are urged to download their photos.' };
const WHAT_HAPPENED: ArticleDef = { outlet: 'The Evening Register', section: 'Analysis', headline: 'What happened to Kindly?', deck: 'It was the friendliest place online. Then it found a business model.' };
const OPINION: ArticleDef = { outlet: 'Signal Weekly', section: 'Opinion', headline: 'The founder who killed Kindly', deck: 'Nobody forced anyone to sell. That is the part I can\'t get past.', byline: 'By a former Kindly engineer' };

/** Slipped onto the front page when the founder owns The Bay Ledger. */
export const BAY_LEDGER_ARTICLE: ArticleDef = { outlet: 'The Bay Ledger', section: 'Profile', headline: 'Visionary founder {name} on the next chapter', deck: 'A conversation about legacy, philanthropy and what comes next.', disclosure: 'The Bay Ledger is owned by {name}.' };

export const ENDINGS: Record<string, EndingDef> = {
  main: {
    id: 'main', title: '',
    lines: ['Kindly, Inc. has filed for Chapter 11.', 'Your payment has cleared.'],
    articles: [PAYOUT, CHAPTER_11, WHAT_HAPPENED, OPINION],
    lastPost: GRANDMA,
    lastPostResister: GRANDMA_RESISTER,
  },
  removed: {
    id: 'removed', title: '',
    lines: ['Kindly, Inc. has filed for Chapter 11.', 'It was not your decision. Your payment has cleared.'],
    articles: [
      { outlet: 'The Valley Wire', section: 'Business', headline: 'Ousted Kindly founder {name} says buyout "was not my decision"', deck: 'The board voted the founder out to approve the sale. The founder\'s shares were bought anyway, for {payout}.' },
      { ...PAYOUT, outlet: 'The Evening Register', section: 'Money' },
      CHAPTER_11,
      WHAT_HAPPENED,
    ],
    lastPost: GRANDMA,
    lastPostResister: GRANDMA_RESISTER,
  },
  kept: {
    id: 'kept', title: 'You kept it.',
    lines: ['Ashgrove walked away. Kindly is still yours.', 'It is still what you made it.'],
    articles: [
      { outlet: 'The Valley Wire', section: 'Business', headline: 'Kindly founder {name} rejects buyout, keeps control', deck: 'Three offers. Three refusals. Kindly stays independent, and stays exactly as it is.' },
      { outlet: 'Coastline Business Journal', section: 'Deals', headline: 'Ashgrove walks away from Kindly', deck: 'The private equity firm says it is "pursuing other opportunities."' },
      { outlet: 'The Evening Register', section: 'Tech', headline: 'Kindly stays independent. Members wait to see what that means', deck: 'The ads, the fees and the nine-step cancellation are all still there.' },
    ],
    lastPost: { handle: 'maya.k', text: 'kindly didn\'t sell. nothing changed though' },
  },
  trust: {
    id: 'trust', title: 'Kindly belongs to its members.',
    lines: ['Kindly cannot be sold.', 'Help people stay close to the people they love.'],
    articles: [
      { outlet: 'The Valley Wire', section: 'Business', headline: 'Founder of user-owned Kindly, {name}, says life has never been better', deck: 'Kindly now belongs to its members. Its charter says it can never be sold.' },
      { outlet: 'Coastline Business Journal', section: 'Workplace', headline: 'Kindly tops Best Places to Work for third year', deck: 'Staff cite the lunches, the retreats and "nobody asking us to make it worse."' },
      { outlet: 'The Evening Register', section: 'Life', headline: 'Kindly users: "It still feels like the early days"', deck: 'No ads. Family first. Grandma\'s first post is still there.' },
    ],
    lastPost: { handle: 'maya.k', text: 'ten years on kindly today. grandma\'s first post still pinned at the top ☀️' },
  },
};

// The endings tracker on the final screen. Unfound endings show only the hint.
export const ENDING_LIST: { id: string; name: string; hint: string }[] = [
  { id: 'main', name: 'The Exit', hint: 'Take the deal.' },
  { id: 'removed', name: 'Not Your Decision', hint: 'What happens if you say no?' },
  { id: 'kept', name: 'Still Yours', hint: 'Saying no only works if the votes are yours.' },
  { id: 'trust', name: "The Members' Trust", hint: 'Read the fine print. Some things can never be sold.' },
];
