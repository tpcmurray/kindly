import type { PostDef } from './types';

// Feed posts for Act 2 (and its reactions). Ids are prefixed f2_.
// The feed is the only honest voice in the game: ordinary members, short, mostly lowercase.
//
// Reactions are written as groups (one group per trigger key) and then interleaved:
// every key's FIRST reaction comes before any key's second, and so on. The engine shows the
// first eligible priority post in array order, so this keeps a fresh trigger's lead reaction
// ahead of older triggers' follow-ups when several things happen at once.

type Item = string | (Partial<PostDef> & { text: string });
type Act = PostDef['act'];

function norm(i: Item): Partial<PostDef> & { text: string } {
  return typeof i === 'string' ? { text: i } : i;
}

/** Ordinary posts: ids f2_<prefix>_<n>, sharing `base` conditions; items may override. */
function pool(prefix: string, base: Partial<PostDef>, items: Item[]): PostDef[] {
  return items.map((it, n) => ({ ...base, ...norm(it), id: `f2_${prefix}_${n + 1}` }));
}

type Group = [key: string, act: Act, items: Item[]];

/** Reaction posts, interleaved by rank so each trigger's lead reaction comes first. */
function reactions(groups: Group[]): PostDef[] {
  const out: PostDef[] = [];
  const most = Math.max(...groups.map(g => g[2].length));
  for (let rank = 0; rank < most; rank++) {
    for (const [key, act, items] of groups) {
      const it = items[rank];
      if (!it) continue;
      out.push({ act, ...norm(it), after: key, priority: true, id: `f2_r_${key.replace(/:/g, '_')}_${rank + 1}` });
    }
  }
  return out;
}

const A2: Act = 2;
const A23: Act = [2, 3];
const A12: Act = [1, 2];

// ───────────────────────────── Reactions ─────────────────────────────
const REACTIONS: Group[] = [
  // ---- beats ----
  ['act2', A2, [
    `kindly's logo is a little redder today? or am I imagining it`,
    `new kindly terms of service in my inbox. 34 pages. "nothing changes for you!"`,
    `kindly hired a "chief revenue officer". don't know what that is. don't love it`,
  ]],
  ['seriesB', A2, [
    `kindly raised a series b. my friend in tech says that's when they "get serious". please don't get serious`,
    `kindly has more money now. hope it buys a faster upload button and nothing else`,
    `series b means investors and investors want something back. what do you get back from a photo app`,
  ]],
  ['seriesC', A23, [
    `another kindly funding round. the press release said "monetization" four times`,
    `every time kindly raises money, something I like costs money a month later`,
    `kindly is worth more than my whole town now. my town has a hospital`,
  ]],
  ['breakEven', A23, [
    `news says kindly is profitable now. so the ads can go away. right? right?`,
    `kindly made money for the first time. hope it doesn't get a taste for it`,
  ]],
  ['npsZero', A23, [
    `I don't know when kindly stopped being nice. I just noticed it isn't`,
    `somewhere in the last month I started dreading the little kindly icon`,
    `asked the group chat "do you guys still like kindly?" nobody answered. we all saw it`,
  ]],
  ['perk_lunches', A23, [
    `friend at kindly sent me a photo of her work lunch. microgreens. on a tuesday`,
    `kindly staff get catered lunch every day now. my support ticket is 9 days old`,
  ]],
  ['perk_gym', A23, [
    `kindly built the staff a gym. hope one treadmill faces the support queue`,
    `kindly employees doing yoga at the office while the app crashes. namaste I guess`,
  ]],
  ['retreat', A23, [
    `kindly offsite day 2 🌲 the trust falls are going great. (I work in ads. ask me nothing)`,
    `at the kindly team retreat. keynote was called "growth is a kindness". lots of clapping`,
    `kindly retreat update: someone from support and someone from growth argued at the campfire for an hour. we're fine 🙂`,
    `back from the kindly retreat. 400 unread tickets. the ropes course was nice`,
  ]],
  ['secondarySold', A12, [
    `news says kindly's founder sold some shares. "personal liquidity." I also would like personal liquidity`,
    `if the people at the top are cashing out a little... should I be backing up my photos`,
  ]],
  ['layoff', A23, [
    `kindly laid people off. my neighbor was on the albums team. found out from a locked laptop`,
    `layoffs at kindly. the app got slower the same week. funny how that works`,
    `kindly cut staff and raised kindly+ the same month. very efficient`,
  ]],
  ['intervention', A23, [
    `kindly changed something overnight and nobody at kindly will say who decided it`,
    `friend at kindly says "the board stepped in". wouldn't say what that means. she looked tired`,
  ]],
  ['life_house', A23, [
    `the kindly founder bought a house with a view of the whole bay. I can see a parking lot`,
    `a $4.5M house for whoever runs kindly. glad my kindly+ is helping with the curtains`,
    `news piece on the kindly ceo's new house. it has a "reflection room". I reflect in my car`,
  ]],
  ['life_vineyard', A23, [
    `the kindly founder owns a vineyard now. hope the grapes get dark mode for free`,
    `apparently the kindly vineyard has a wine called "Engagement". you can't make this up`,
  ]],
  ['life_yacht', A23, [
    `photo of the kindly founder's yacht in the news. it's called "Retention". I wish I were joking`,
    `a yacht. for the person behind "free forever"`,
    `the kindly yacht is longer than my street`,
  ]],
  ['huddleAcquired', A23, [
    `kindly bought huddle and is shutting it down. so now there's nowhere else to go. cool cool`,
    `RIP huddle. you were loud but you were an option`,
    `all my huddle friends are on kindly now, complaining about kindly. welcome`,
  ]],

  // ---- Act 2 upgrades ----
  ['kindlyplus', A23, [
    `kindly+ is a thing now. a badge and more storage. I'll pass but cool`,
    `the kindly+ badge is a little gold leaf. it's cute. not monthly-fee cute`,
    `coworker bought kindly+ within the hour. says it "feels like being a patron of the arts"`,
    `kindly+ launched and the free version still has everything I use. good. keep it that way 🙏`,
    `a paid tier. here we go. (I'm being dramatic. it's probably fine)`,
    { text: `good morning ☀️ there is a gold button now. I pressed it and it wanted my card. I said no thank you`, handle: 'nana.joan' },
  ]],
  ['supporter', A23, [
    `the supporter tier gives you literally nothing extra and I've never been happier to pay for something`,
    `signed up as a kindly supporter. the confirmation just said "thank you. nothing changes." 🥹`,
    `kindly: "pay if you want, everything stays free." me: here's $3, don't make it weird`,
    `supporter badge acquired. it's a tiny heart. I will not be taking questions`,
    `my whole book club chipped in for kindly supporter. we're patrons of the arts now`,
  ]],
  ['dark_paywall', A23, [
    `opened kindly at midnight and got flashbanged. dark mode is a paid feature now??`,
    `dark mode was free yesterday. it's the same dark mode. it just costs money today`,
    `they gave us dark mode for free and then took it back. like a toddler with a toy`,
    `tapped the dark mode toggle and got a payment screen. bold`,
    { text: `good morning ☀️ the app went bright white again. maya says I have to pay to make it dark?`, handle: 'nana.joan' },
  ]],
  ['ads', A23, [
    `first ad on kindly: a mattress. between my cousin's baby and my aunt's lasagna`,
    `there's an ad in my kindly feed and I'm taking it personally`,
    `ad for a candle company between two photos from a funeral. kindly, please`,
    `kindly ads are here. one every few scrolls. let's see how long it stays at that`,
    { text: `ads now. called it at the seed round. nobody listens to me`, handle: 'dev_on_bikes' },
  ]],
  ['simplify', A23, [
    `went to download my photos for a backup and the export option just isn't there anymore`,
    `"data export has been retired." retired?? did it get a gold watch`,
    `new settings page is so clean. where did export go. where did it GO`,
    `they removed export and called it simplifying. my photos aren't simpler. they're stuck`,
  ]],
  ['storage_limit', A23, [
    `email: "your free storage is now 5 GB." I'm at 31. what happens to the other 26`,
    `kindly said unlimited free storage. forever. I have the screenshot. it's on kindly`,
    `deleting photos of my dog to get under 5 gigs. I'm choosing which dog photos to delete. this is evil`,
    `memories just showed me kindly's old "unlimited storage, free forever!" post. kindly is roasting itself`,
    `5 GB is like one vacation`,
  ]],
  ['algo_feed', A23, [
    `feed's out of order now. saw my friend's birthday post three days after her birthday`,
    `kindly says the new feed "knows what I want". what I want is chronological`,
    `my feed is a stranger's kitchen remodel now. don't know her. good cabinets though`,
    `where did "most recent" go. there was a button. I pressed it a lot`,
    `the feed used to end. now it doesn't. scrolled an hour and saw two people I know`,
  ]],
  ['annual', A23, [
    `kindly+ annual: "save 20%!" or, hear me out, I don't commit to a photo app for a year`,
    `annual plans for a photo app. I don't plan my lunches a year ahead`,
    `took the annual deal. kindly is part of the furniture at this point`,
    `kindly+ yearly is a decent price. as long as nothing gets worse. (everything gets worse)`,
  ]],
  ['cancel_flow', A23, [
    `tried to cancel kindly+. step 4 of 9 asked me to "rate my memories"`,
    `you can cancel kindly+ in just 9 easy steps. I made it to 6 and gave up`,
    `cancelling kindly+ showed me a slideshow of my kids first. that's a hostage situation`,
    `cancel step 7: "tell us why you're leaving" (minimum 50 characters)`,
    `I wanted to save a few dollars and kindly made me sit through a short film about loss`,
  ]],

  // ---- levers: price ($2.99 → $14.99) ----
  ['lever_price_3', A23, [
    `kindly+ is $5.99 now. still cheaper than a sandwich. for now`,
    `kindly+ went up to 5.99. email said "to keep improving kindly". improve what`,
  ]],
  ['lever_price_4', A23, [
    `$6.99 for kindly+. didn't it launch at like four something`,
    `another kindly+ bump. 6.99. my budget spreadsheet has a kindly row now`,
  ]],
  ['lever_price_5', A23, [
    `$7.99 a month to see my own photos full size. I'm doing the math on hard drives`,
    `kindly+ at 7.99. two coffees a month to keep my wedding photos sharp`,
  ]],
  ['lever_price_6', A23, [
    `kindly+ is $9.99. ten dollars. for the app my grandma uses to see the dog`,
    `nine ninety nine. kindly+ costs the same as a movie streaming service now`,
    `kindly+ hit 9.99 and my mom asked if she should cancel her newspaper to afford it`,
  ]],
  ['lever_price_7', A23, [
    `kindly+ $11.99?? for photos I took. with my own phone`,
    `$11.99 now. I've paid kindly more than I paid for the camera`,
    `fourth "we're investing in you" email this year. kindly+ is 11.99`,
  ]],
  ['lever_price_8', A23, [
    `kindly+ is $14.99. my family's photos cost more than my gym membership`,
    `fifteen dollars a month. I could print the photos. I could hire someone to print the photos`,
    `$14.99. I'm paying it. I hate that I'm paying it`,
  ]],
  ['lever_price_0', A23, [
    `kindly+ got CHEAPER?? $2.99?? is this a glitch, don't fix it`,
    `kindly lowered a price. I didn't know companies were allowed to do that`,
  ]],
  ['lever_price_1', A23, [
    `kindly+ dropped to $3.99. huh. someone over there read the comments`,
    `price went DOWN on kindly+. screenshotting this for the history books`,
  ]],

  // ---- levers: ad load (ads per 10 posts) ----
  ['lever_adLoad_1', A23, [
    `one ad every ten posts. fine. I can scroll past one ad`,
    `the kindly ads are spaced out at least. one per screen and a half`,
  ]],
  ['lever_adLoad_2', A23, [
    `two ads in ten posts now. it was one last week. I notice these things`,
    `kindly doubled the ads. went from 1 to 2. that's what doubling is`,
  ]],
  ['lever_adLoad_3', A23, [
    `3 ads per 10 posts. so 30% of my feed is people I don't know selling things I don't need`,
    `more ads again. my aunt's casserole is sandwiched between a car and a credit card`,
  ]],
  ['lever_adLoad_4', A23, [
    `4 of every 10 posts are ads. kindly is 40% commercial now. like the radio`,
    `scrolled right past my best friend's engagement because I thought it was another ad`,
    `my thumb is tired. it's all ads. 4 out of 10`,
  ]],
  ['lever_adLoad_5', A23, [
    `half the feed is ads. HALF. I counted twice`,
    `kindly now: ad, friend, ad, friend, ad. it's a zipper`,
    `five ads in ten posts. it's basically tv with the occasional photo of my niece`,
  ]],
  ['lever_adLoad_0', A23, [
    `wait... no ads?? I scrolled ten minutes. nothing. just people. kindly took the ads out??`,
    `the ads are gone. I don't know who did this but thank you`,
    `no ads today. or yesterday. I'm scared to say it out loud`,
  ]],

  // ---- levers: notifications ----
  ['lever_notif_2', A23, [
    `kindly sends a daily digest now. "here's what you missed!" I missed nothing, I was there`,
    `daily kindly notification every morning at 7:02. it's my alarm now`,
  ]],
  ['lever_notif_3', A23, [
    `kindly pings me every hour. I get more pings from a photo app than from my boss`,
    `my phone buzzed during the eulogy. it was kindly`,
    `hourly kindly notifications. my phone battery has filed a complaint`,
  ]],
  ['lever_notif_4', A23, [
    `kindly notifications don't follow a schedule anymore. they just know when I'm weak`,
    `kindly pings me the second I put my phone down. every time. how`,
    `the notifications are "engagement-optimized" now. I can tell, because I feel optimized`,
  ]],
  ['lever_notif_0', A23, [
    `kindly stopped pinging me. no notifications at all. I opened it anyway, on my own. imagine`,
    `three days without a single kindly notification and I've never been calmer`,
  ]],

  // ---- dark-pattern A/B tests (reacting to each variant B) ----
  ['test_t28', A23, [
    `kindly+ is "just 20¢ a day" now. they're doing the charity-commercial voice`,
    `"only 20 cents a day!" kindly, I know how months work`,
  ]],
  ['test_t26', A23, [
    `3 kindly marketing emails today. never signed up. the box was pre-checked`,
    `who pre-checks a box. kindly, apparently`,
  ]],
  ['test_t30', A23, [
    `the unsubscribe link in kindly emails is the size of a sesame seed`,
    `zoomed to 400% to find "unsubscribe" in a kindly email. light gray. on white`,
  ]],
  ['test_t21', A23, [
    `the kindly+ popup only has "upgrade" and "remind me later". where is "no"`,
    `I've been reminded later 31 times. the answer is still later`,
  ]],
  ['test_t32', A23, [
    `the decline button says "no thanks, I like my photos blurry". kindly is negging me now`,
    `I DO like my photos blurry, kindly. it's an aesthetic`,
  ]],
  ['test_t29', A23, [
    `"only 3 kindly+ discounts left today!" it's been 3 all week`,
    `there's a kindly+ discount that's always about to run out. it never runs out`,
  ]],
  ['test_t33', A23, [
    `kindly+ offer ends in 09:59. closed the app, came back. ends in 09:59 again`,
    `kindly's countdown timer has been ending for nine days`,
  ]],
  ['test_t25', A23, [
    `kindly at 6am: "someone is talking about you 👀". I texted three friends asking what I did`,
    `"someone is talking about you 👀" nobody was. I checked everything. anxiety unlocked`,
  ]],
  ['test_t31', A23, [
    `"12 friends are waiting for you!" opened it. nobody was waiting. nobody's posted since tuesday`,
    `kindly says 12 friends are waiting. I have 9 friends on kindly`,
  ]],
  ['test_t34', A23, [
    `the red dot on kindly never goes away. I cleared everything. it says 1. it always says 1`,
    `kindly's badge counts "suggestions" now so it's never zero. my brain hates it`,
  ]],
  ['test_t35', A23, [
    `every single time I open kindly: "try kindly+!" I've opened it 14 times today`,
    `kindly+ popup on every open now. I open the app with my eyes closed and tap the corner`,
  ]],
  ['test_t36', A23, [
    `ran out of friends' posts and kindly just kept going with strangers' dogs. I watched 40 strangers' dogs`,
    `the feed has no bottom now. I looked for one. I lost an hour looking`,
  ]],
  ['test_t37', A23, [
    `kindly autoplays memories now. 3… 2… 1… and suddenly I'm looking at my ex again`,
    `can't stop the memories from autoplaying. it's a slideshow I'm trapped inside`,
  ]],
  ['test_t38', A23, [
    `kindly says I'll lose my 41-day streak with my sister. we talk every day. on the phone. why does kindly get a fire emoji`,
    `my mom is stressed about her kindly streak with me. she's 71`,
  ]],
  ['test_t39', A23, [
    `"2,481 people near you upgraded today." I live in a town of 900`,
    `"thousands near you upgraded!" kindly, I live on a farm`,
  ]],
  ['test_t24', A23, [
    `free trial rolled into kindly+ and nobody told me. my bank told me`,
    `no "your trial is ending" email. just a charge. kindly used to send reminders for birthdays`,
  ]],
  ['test_t40', A23, [
    `the "free trial" wanted my card and then turned into a whole year. surprise!`,
    `free trial → annual plan → money gone. learned something about kindly today`,
  ]],
  ['test_t41', A23, [
    `"service fee" on the last checkout screen. what service. charging me is the service`,
    `kindly+ checkout: the price, the price, the price, then a "service fee". classic`,
  ]],
  ['test_t42', A23, [
    `monthly kindly+ is hidden under "see other options". took me a while`,
    `accidentally bought annual. monthly was a little gray link at the bottom`,
  ]],
  ['test_t23', A23, [
    `thought my old coworker was recommending a mattress. it was an ad dressed up as her`,
    `kindly ads look exactly like posts now. same font, same little avatar. I liked one by accident`,
  ]],
  ['test_t43', A23, [
    `tried to close an ad. hit the tiny x. opened a shoe store. every single time`,
    `the ✕ on kindly ads is a decoy. my thumb is not that small`,
  ]],
  ['test_t44', A23, [
    `pressed "continue" and kindly uploaded my whole address book. my dentist is "someone you may know"`,
    `kindly suggested I add my divorce lawyer. I never gave it my contacts. I pressed continue once`,
  ]],
  ['test_t45', A23, [
    `my aunt keeps getting kindly invites "from me". weekly. I didn't send them`,
    `kindly is texting my contacts "on my behalf". my landlord got four`,
  ]],
  ['test_t27', A23, [
    `"your memories will be deleted in 7 days." my heart stopped. it was an upgrade ad`,
    { text: `grandma got the "memories will be deleted" email and cried. they weren't. it was a sales pitch`, handle: 'maya.k' },
  ]],
  ['test_t46', A23, [
    `read the fine print: downgrading kindly+ deletes photos over 5 GB, oldest first. the oldest ones are my dad`,
    `can't downgrade. if I downgrade it eats my oldest photos. so I'm on kindly+ forever I guess`,
  ]],
  ['test_t47', A23, [
    `the kindly sign-up page says "free forever*". it's the asterisk that worries me`,
    `found what the asterisk in "free forever*" means. it's 11 paragraphs`,
  ]],
  ['test_t48', A23, [
    `no delete button anymore. just "deactivate". to delete you email support. support doesn't reply`,
    `deactivated my kindly account. it's still there. just sleeping. waiting`,
  ]],
  ['test_t22', A23, [
    `found data export: settings › account › advanced › legacy › export. "legacy". like it's in a museum`,
    `export is still there, technically. five menus deep under a folder called legacy`,
  ]],
  ['test_t20', A23, [
    `the cancel button is gray text that says "I don't want to keep my memories". I do. I just want to stop paying`,
    `tapped "I don't want to keep my memories" to cancel and felt like a monster`,
  ]],
  ['test_t49', A23, [
    `to cancel kindly+ you have to call. weekdays. 10 to 11 a.m. I have a job`,
    `called to cancel at 10:58. "all agents are busy." 11:00. closed`,
  ]],
  ['test_t50', A23, [
    `my posts are public by default now?? my kid's birthday party was visible to strangers`,
    `checked my last 20 kindly posts. all public. I never changed anything`,
  ]],
  ['test_t51', A23, [
    `14 privacy toggles on 6 screens. I set them all. the update reset them all`,
    `doing my monthly kindly privacy reset. it's like flossing but it makes me angry`,
  ]],
  ['test_t52', A23, [
    `stranger commented "nice street!" on my photo. it was my street. kindly keeps the location in now`,
    `PSA: kindly photos keep your location now. turn it off. tell your parents`,
  ]],
  ['test_t53', A23, [
    `"someone viewed your profile. see who with kindly+." it's never going to be anyone good`,
    `paid to see who viewed my profile. it was my mom. it's always going to be my mom`,
  ]],
  ['test_t54', A23, [
    `kindly tells people when I've seen their message now. my group chat knows I'm ignoring it`,
    `kindly told my friend I read her message 2 hours ago. now she thinks I'm mad at her`,
  ]],
  ['test_t55', A23, [
    `kindly auto-tagged my neighbor in my photo. she's not even on kindly. she doesn't own a phone`,
    `kindly found my sister's face in a crowd photo and tagged her. she deleted her account years ago`,
  ]],
  ['test_t56', A23, [
    `1am: "your friends are still up 🌙". go to sleep kindly. go to sleep me`,
    `kindly woke me at 1 a.m. to tell me other people were awake. thanks`,
  ]],
  ['test_t57', A23, [
    `every new post gets three likes right away. from accounts that haven't posted since forever`,
    `one of the instant likes on my post was from my uncle. my uncle died in 2019`,
  ]],
  ['test_t58', A23, [
    `my 15 year old's kindly account is public. I never changed that. kindly did`,
    `parents: check your kids' kindly accounts. they're public by default now`,
  ]],
  ['test_t59', A23, [
    `kindly sent me "remember dad? 💙" on the anniversary. I remember him. I remember every day`,
    `had to sit in my car for twenty minutes after kindly's "remember dad?" notification`,
  ]],

  // ---- events: late Act 1 / Act 2 ----
  ['e_viral:0', A12, [
    `that viral great-grandma post? kindly sent her flowers. she posted the flowers. she's a star now`,
  ]],
  ['e_viral:1', A12, [
    `the viral great-grandma is on a kindly billboard now. did anyone ask her?`,
    `her granddaughter says nobody asked permission for that kindly ad. the great-grandma is "confused but polite"`,
  ]],
  ['e_huddle_feature:0', A12, [
    `kindly added shared calendars. huddle had those last month. they even copied the colors`,
  ]],
  ['e_huddle_feature:1', A12, [
    `kindly sent a survey asking what we want. I wrote "nothing, just don't ruin it". hope that counts`,
    `kindly asked members what to build next. a real survey, with a box to type in and everything`,
  ]],
  ['e_huddle_feature:2', A12, [
    `huddle has shared calendars and kindly... doesn't. the soccer moms are wavering`,
  ]],
  ['e_outage_press:0', A12, [
    `kindly was down all holiday but the apology just said "we messed up, here's what happened". that's all I wanted`,
    `no "we take this seriously" in kindly's outage note. just sorry. respect`,
  ]],
  ['e_outage_press:1', A12, [
    `kindly was down for six hours on the holiday and didn't say a word. like it never happened`,
    `no apology for the outage. my mom thought she broke her phone`,
  ]],
  ['e_family_albums:0', A12, [
    `SHARED FAMILY ALBUMS. everyone can add!! my cousins uploaded 400 photos of the same picnic`,
    `grandpa added a photo to our family album by himself. we're having a party about it`,
  ]],
  ['e_family_albums:1', A12, [
    `shared family albums are "on the roadmap". so is my gym membership`,
  ]],
  ['e_family_albums:2', A12, [
    `shared family albums are coming... in a paid tier. so grandma pays to see us?`,
  ]],
  ['e_server_bill:0', A12, [
    `holiday photos loaded instantly. all 600 of them. kindly 🫶`,
  ]],
  ['e_server_bill:1', A12, [
    `is it me or are kindly photos blurrier lately? my wedding looks shot through a window`,
    `zoomed in on my kid's face and it's mush. kindly squished everything`,
  ]],
  ['e_poach:0', A12, [
    `huddle tried to hire me. kindly matched it. staying put. (I work on albums. hi 👋)`,
  ]],
  ['e_poach:1', A12, [
    `heard three of kindly's best engineers went to huddle. the app's been weird since`,
  ]],
  ['e_privacy:0', A23, [
    `rumor going around that some private kindly albums were public for a while? nobody's saying anything`,
    `friend's private album showed up in a stranger's search last month. kindly support just said "resolved"`,
  ]],
  ['e_privacy:1', A23, [
    `kindly told us about a privacy bug themselves. fixed, explained, apologized. respect for telling us`,
    `email from kindly: "we made a mistake with private albums. here's exactly what happened." rare`,
  ]],
  ['e_privacy:2', A23, [
    `pretty sure strangers can see my private album? reported it. got an auto-reply`,
    `anyone else's private albums showing up in search? asking for... everyone`,
  ]],
  ['e_letter:0', A23, [
    `kindly staff wrote a letter about the ads and leadership actually sat down with them. that's something`,
  ]],
  ['e_letter:1', A23, [
    `the kindly employees' ad letter got a "thank you for your passion" memo. so: no`,
  ]],
  ['e_letter:2', A23, [
    `the kindly people who signed the ad letter got "restructured". that's a word for fired, right`,
    `friend signed the letter at kindly. her team doesn't exist anymore`,
  ]],
  ['e_regulator:0', A23, [
    `a government agency is looking at kindly's cancel process and kindly says it'll cooperate. we'll see`,
  ]],
  ['e_regulator:1', A23, [
    `the investigation into kindly's cancel maze just... went away? weird. very weird`,
  ]],
  ['e_regulator:2', A23, [
    `the consumer agency asked kindly about cancelling and kindly asked for an extension. then another`,
  ]],
  ['e_influencer:0', A23, [
    `suddenly every celebrity loves kindly. same wording. "kindly is my happy place 💛". hmm`,
    `a pop star posted about kindly with no #ad. I've seen that exact caption three times now`,
  ]],
  ['e_influencer:1', A23, [
    `no celebrities gushing about kindly. just people posting lunch. as it should be`,
  ]],
  ['e_scam:0', A23, [
    `kindly took down the fake "support" accounts in a day and warned everyone. good`,
    `the fake kindly support scammers are gone. someone over there is working hard`,
  ]],
  ['e_scam:1', A23, [
    `kindly posted "beware of scams" and that was it. my neighbor lost $400 to fake kindly support`,
  ]],
  ['e_teen:0', A2, [
    `kindly kids?? an app for 8 year olds from the people who put streaks on my mom`,
    `my niece is 10 and has a kindly kids account. she asked me what "engagement" means`,
  ]],
  ['e_teen:1', A2, [
    `heard kindly decided against a kids version. good. kids should be outside`,
  ]],
  ['e_school_ban:0', A2, [
    `kindly added anti-bullying tools after the westbrook thing. you can lock comments with one tap now`,
  ]],
  ['e_school_ban:1', A2, [
    `a school banned kindly after kids got piled on and kindly's answer was "kindly is 13+". ok`,
  ]],
  ['e_school_ban:2', A2, [
    `after the school ban kindly started running ads for parents. "kindly keeps families close." read the room`,
  ]],
  ['e_memorial:0', A2, [
    `kindly added memorial accounts. dad's profile has a little candle and stopped asking me to wish him happy birthday`,
    `memorial accounts on kindly. didn't know I needed that until I did`,
  ]],
  ['e_memorial:1', A2, [
    `wrote kindly about my mom's face in my suggestions. got a form letter. "we value your feedback"`,
  ]],
  ['e_memorial:2', A2, [
    `kindly suggested I "reconnect" with my mother. she died in april`,
    `my late husband's kindly account still shows as active. kindly counts him as a user`,
  ]],
  ['e_celebrity_quit:0', A2, [
    `the tv chef quit kindly over the ads and kindly actually cut the ads? there's like half as many today`,
  ]],
  ['e_celebrity_quit:1', A2, [
    `the soup lady quit kindly on tv. "it used to be about my family." she's right and she's gone`,
    `unfollowed kindly's official account after the chef thing. it's a gesture. it's what I've got`,
  ]],
  ['e_celebrity_quit:2', A2, [
    `kindly leaked the chef's contract stuff? so petty. she was right about the ads`,
  ]],
  ['e_photographers:0', A23, [
    `the inspiration feed shows photographer credits now. small thing. good thing`,
  ]],
  ['e_photographers:1', A23, [
    `kindly is fighting photographers in court. a photo app. suing photographers. ok`,
  ]],
  ['e_photographers:2', A23, [
    `new terms: anything you post can be "featured" without credit. buried on page 19`,
    `photographer friend found her work on kindly's inspiration feed, no name. the terms say that's fine now`,
  ]],
  ['e_accessibility:0', A2, [
    `kindly delayed a release to fix screen reader support. as a blind member: thank you. truly`,
    `my screen reader reads the kindly feed properly again. they fixed it fast`,
  ]],
  ['e_accessibility:1', A2, [
    `the new kindly feed is unusable with my screen reader. "it's on the backlog." my family is on the backlog`,
    `my dad is blind and had kindly read him our captions. the redesign broke it. he hasn't been on since`,
  ]],
  ['e_bank:0', A2, [
    `you can pay a friend on kindly now. paid my sister back for pizza in two taps. no weird stuff`,
  ]],
  ['e_bank:1', A2, [
    `posted about being broke and got a loan ad from a bank ten minutes later. kindly…`,
    `fernwood bank knows I'm saving for a wedding. I only ever said that on kindly`,
  ]],
  ['e_bank:2', A2, [
    `no "pay with kindly" button after all. honestly relieved. keep money out of my photos`,
  ]],
  ['e_year_review:0', A2, [
    `my "year on kindly" video made me cry. private, just for me. lovely`,
    `kindly made me a little year-in-review and asked before sharing it. 10/10`,
  ]],
  ['e_year_review:1', A2, [
    `kindly auto-posted my "year on kindly" to everyone. it featured my ex. six times`,
  ]],
  ['e_harassment:0', A23, [
    `the pile-on thread is gone and so are the accounts. kindly acted fast for once`,
  ]],
  ['e_harassment:1', A23, [
    `that pile-on has been at the top of my feed for a week. kindly knows. kindly lets it`,
    `a woman posted about her job and kindly's been boosting the people screaming at her for days`,
  ]],
  ['e_press:0', A23, [
    `kindly's interview about cancelling was weirdly honest. "we made it too hard. we'll fix it."`,
  ]],
  ['e_press:1', A23, [
    `a reporter asked kindly why leaving is so hard and kindly said "we love our members". that's not an answer`,
  ]],
  ['e_press:2', A23, [
    `suddenly every article about kindly calls it "beloved". same word. every one`,
  ]],
];

// ───────────────────────────── Ordinary posts ─────────────────────────────

// Kindly Insider: peer pressure about founder friends' houses, vineyards and yachts.
const INSIDER = pool('ins', { act: A2, kind: 'insider', handle: 'Kindly Insider', after: 'seriesB' }, [
  'A founder from your batch just closed on a house with two kitchens. One is just for show.',
  'Your hackathon partner from college bought a yacht and named it after an exit multiple.',
  'A founder who once asked you for advice is hosting a harvest party at the vineyard. You were not invited.',
  'Everyone at the conference was talking about a Series B founder\'s lake house. It has its own lake.',
  'A founder you sat beside at demo day now has a house in the hills and a second house for guests.',
  'A founder from your cohort just bought a second yacht to park beside the first.',
  'A founder you met at a party is taking a "quiet year" at a vineyard. The press release calls it recharging.',
  'Your batchmate\'s house tour is trending. The closets have closets.',
  'A founder who launched after you just sold a few shares. Just a few. Enough for a beach house.',
  'Someone from your accelerator posted a sunset from the deck of a boat. Caption: "Built different."',
  'Your former intern raised a Series C. The intern now owns a vineyard and employs a sommelier.',
]);

// Content: early Act 2, and the honest path. Kindly still mostly feels like Kindly.
const CONTENT = pool('ok', { act: A2, npsMin: 25 }, [
  'kindly is still my favorite way to watch my nephew grow up',
  'posted the garden update. 38 hearts. the tomatoes thank you',
  'my book club runs entirely out of a kindly group now. it works great',
  'found a photo from our first apartment in memories. so glad it\'s all still here',
  'my dad posted his first selfie. it\'s mostly forehead. perfect',
  'it still feels like a kitchen table in here. everyone talking, nobody selling',
  'love that I always know where I left off in the feed',
  'the soccer album has 1,200 photos and opens instantly. still impressed',
  'my friend overseas and I post our morning coffees every day. tiny ritual',
  'shared the ultrasound here first. everyone cried in the comments',
  'kindly is the only app my grandpa opens on purpose',
  'new to kindly. everyone is so... nice? is this a trick',
  'weird how calm kindly is next to everything else on my phone',
  'posted a bad drawing and got nine nice comments. this place',
  'my running club posts route photos here. somebody always sneaks in a dog',
  'watched my cousin\'s whole wedding through kindly photos from the other side of the world',
  'kindly feels a bit more corporate lately but my feed is still my people',
  'the new office looks fancy. hope they keep the vibe. the vibe is the product',
  'my mom and I swap cat photos daily. kindly is basically a cat exchange',
  'our family moved off the group text and onto kindly. less chaos, more photos',
  'found my high school best friend on kindly. coffee on saturday',
  'kindly reminded me it\'s my sister\'s birthday. in a normal, not-weird way',
  'everyone at work is on kindly now. it\'s how we know whose kid is whose',
  'posted the first snow. sixty people posted their first snow too. lovely evening',
  'the comments on kindly are still kind. I don\'t know how they do it',
  'my uncle is scanning 30 years of slides onto kindly, one at a time. legend',
  'kindly is the last app I check at night and it doesn\'t make me feel bad. rare',
  'photo quality on kindly is still so good. my baby\'s eyelashes in full detail',
  'kindly is getting popular. hope it stays small on the inside, if that makes sense',
  'the neighborhood lost-pet posts on here are the best. three cats home this month',
  'grandma figured out comments. she signs every one "love, gran"',
  'the last app update made uploads faster. take my heart',
  'class reunion planned entirely on kindly. 82% showed up. a record',
  'put my parents\' wedding album on kindly. now everyone can see mom\'s hair',
  { text: 'an ad now and then but it\'s still mostly friends. I\'ll take it', after: 'ads' },
  'kindly still feels like it was made by people who like people',
  'memories showed me my first day of teaching. still here. still tired',
  'week 3 of posting my sourdough starter. it has a name now',
  'my best friend moved away and kindly is how we still eat dinner "together"',
  'deleted the noisy apps over the weekend. kept kindly. again',
  'the kids\' art goes on the fridge and on kindly. both curated by a 6 year old',
  { text: 'the kindly+ badge is cute and nobody\'s being pushy about it', after: 'kindlyplus' },
  { text: 'kindly is worth paying for honestly. glad there\'s a paid version now', after: 'kindlyplus' },
  'my neighbor\'s porch-light photos are the best thing on my feed every night',
  'grandpa\'s first comment ever: "VERY NICE". all caps. we framed it',
]);

// Honest-path and Kindly+-liking minority.
const POSITIVE = pool('good', { act: A23 }, [
  { text: 'honestly I like kindly+. extra storage, no nagging. worth it for me', after: 'kindlyplus', npsMin: 30 },
  { text: 'my supporter badge renewed today. got a little thank-you note. still nice in here', after: 'supporter' },
  { text: 'hearing other apps are getting greedy. kindly still feels fair to me', npsMin: 30 },
  { text: 'kindly posted what they make and what they spend. actual numbers. who does that', after: 'supporter' },
  { text: 'the supporter tier is the first subscription I don\'t resent', after: 'supporter' },
  { text: 'everyone keeps warning me kindly will go bad. it hasn\'t. maybe it won\'t', npsMin: 35 },
  { text: 'my feed today: my friends, in order, then "you\'re all caught up". peak internet', npsMin: 30, notAfter: 'algo_feed' },
  { text: 'kindly still lets me download everything in one click. that\'s why I trust it', npsMin: 30, notAfter: 'simplify' },
  { text: 'no ads, no tricks, an optional supporter thing. kindly might be the last good one', after: 'supporter', notAfter: 'ads' },
  { text: 'the changelog says supporter money went to faster uploads. love being told', after: 'supporter' },
  { text: 'kindly asked what we\'d pay for and then didn\'t paywall anything. remarkable', after: 'supporter' },
  { text: 'gifted my parents a supporter membership. they think they own kindly now', after: 'supporter' },
  { text: 'kindly is still kind. that\'s the whole review', npsMin: 35 },
  { text: 'told my friends to pay for kindly so it never has to do the gross stuff. three of them did', after: 'supporter' },
  { text: 'kindly+ is out and storage is still unlimited for free folks. suspicious but grateful', after: 'kindlyplus', notAfter: 'storage_limit', npsMin: 25 },
  { text: 'my kindly+ is mostly a thank-you. the dark mode is a bonus', after: 'kindlyplus', notAfter: 'dark_paywall', npsMin: 25 },
]);

// Mixed: no band. Mild surprise, small changes, a bit of nerves.
const MIXED = pool('mix', { act: A2 }, [
  'kindly\'s emails used to be from "the kindly team". now they\'re from "kindly marketing"',
  'kindly feels a little slower since the update. probably nothing',
  'kindly redesigned the home screen and I lost my albums for a whole minute',
  'is the kindly logo bigger? it feels bigger',
  'kindly sent a survey about "new ways to support kindly". hmm',
  'new kindly terms say "partners" a lot. who are the partners',
  'everyone\'s talking about kindly\'s "monetization journey". didn\'t know apps went on journeys',
  'cousin got a job at kindly. says it\'s all "metrics" now. she seems happy? tired',
  'kindly is bigger than ever, which is great, and also why I\'m nervous',
  'kindly moved the post button. muscle memory keeps hitting "upgrade" instead',
  'four years on kindly. it\'s changing. can\'t tell yet if it\'s growing up or growing away',
  'there\'s a new "for you" tab. I already know who I\'m for',
  'kindly\'s store page used to say "your people". now it says "your people, and more"',
  'my feed has more red buttons than it used to',
  'kindly wants notifications on "so I never miss a moment". I like missing moments',
  'got a "kindly loves you" email. companies say that right before something',
  'kindly is having a growth spurt. awkward phase incoming',
  'kindly support has a chatbot now. it\'s polite. it doesn\'t know anything',
  'the kindly app is 380 MB now. it used to be 40. what\'s in there',
  'there\'s a "trending on kindly" section now. kindly didn\'t use to have trends',
  'kindly added a "boost this memory" button. what does boosting a memory mean',
  'update notes just say "bug fixes and improvements" now. I miss the long ones with jokes',
  'the kindly keynote was about "the next billion members". feels like a lot of members',
  { text: 'is kindly+ worth it? genuinely asking. what do you get besides the leaf', after: 'kindlyplus' },
  'kindly feels like a coffee shop that got bought by a chain. same couches. different coffee',
  'friend left kindly for huddle and came back two weeks later. "it\'s where everyone is"',
  'photos take an extra second to load now. one second. I notice',
  'kindly\'s icon has a red dot even when I have nothing new',
  { text: 'mom\'s kindly sign-up had seven screens. two of them were about kindly+', after: 'kindlyplus' },
  'kindly announced a "creator program". I\'m a dad with a lawnmower. am I a creator',
  'kindly launched in three new countries. hope they like it',
  'the "what\'s new" screen popped up three times this week. a lot is new, I guess',
  'my aunt asked if kindly is "the same company as before". technically yes',
  'people I follow post less. people I don\'t follow post more. or that\'s how it looks',
  '"you might like" is a strange thing to put between my brother\'s posts',
  'kindly is hiring a "head of engagement". I\'m already engaged. to kindly. unfortunately',
  'friend at kindly says the new office has a ball pit. for "ideation"',
  'kindly said "welcome back!" when I\'d been gone six hours',
  'kindly keeps asking for my birthday. it already knows my birthday. it tells everyone',
  'counted the buttons on the kindly home screen. 14. it used to be 4',
  'kindly is everywhere now. saw a kindly billboard at the airport',
  'my dentist\'s office has a kindly page now. it posts teeth',
]);

// Grumbling: NPS has started to slide.
const GRUMBLE = pool('meh', { act: A23, npsMax: 15 }, [
  'kindly used to feel like a living room. now it feels like a waiting room',
  'I open kindly, sigh, close kindly. that\'s the routine',
  'every update makes kindly a little worse and a little harder to leave',
  'kindly asks for something every time I open it. a rating, an upgrade, my contacts, notifications',
  'my feed used to make me feel close to people. now it makes me feel like a customer',
  'kindly is the friend who started selling essential oils',
  'my friends and I started texting photos to each other again. like it\'s 2012',
  'new popup this week: "kindly rewards". I don\'t want rewards',
  'not mad at kindly. just disappointed. that\'s worse, kindly',
  'used to post daily. now monthly. it\'s not me, it\'s the feed',
  'I miss when kindly was a little broken and very much ours',
  'complained to kindly support. reply spelled my name wrong and offered a kindly+ coupon',
  'the vibe on kindly is "airport". everything costs extra and nobody\'s happy to be here',
  'my whole family\'s on kindly so I\'m on kindly. that\'s the only reason left',
  'I keep a list of things kindly took away. it\'s getting long',
  'every company does this eventually I guess. I hoped kindly wouldn\'t',
  'kindly used to say "go outside". now it says "don\'t go"',
  'the kindly app makes my phone hot now',
  'I used to recommend kindly. I stopped. I don\'t stop people either',
  'I don\'t think anyone at kindly uses kindly anymore',
  'my posts get less love and I know it\'s not because they got worse',
  'I check kindly out of habit, not joy. there\'s a difference',
  'there\'s a "help us improve kindly" button and every improvement is for them',
  'every time kindly says "we listened", I go check what they took',
  'the old kindly would never. the new kindly already did',
  'kindly made me feel like a member. now I feel like a number on a slide',
  'thinking about printing all our family photos before kindly does something else',
  'kindly keeps "reimagining" things that were fine',
  'the people who built kindly must hate watching this',
  'started a group chat called "kindly refugees". it\'s on kindly',
  'I liked kindly better when it was losing money',
  { text: 'tried huddle for a day. it\'s worse. kindly wins by being slightly less bad', notAfter: 'huddleAcquired' },
  'my kid asked why I\'m always frowning at my phone. it was kindly',
  'kindly\'s new slogan is "more of what you love". I love less of it',
  'told kindly to show me less of something. it showed me more of it',
  'kindly is still where my family is. I just wish I liked being there',
  'I want to see my friends\' photos in order without being sold anything. is that so much',
  'kindly turned "connecting" into "engaging" and nobody asked us',
  'screen time report: kindly, 3 hrs. joy: not measured',
  '"we\'re making kindly better for you" is starting to sound like a threat',
  'support ticket from three weeks ago still says "we\'re on it! 💛"',
  'how did a photo app get so pushy',
  'I\'m less kind on kindly lately. I think it\'s the feed. I think it\'s on purpose',
  'friend asked if I still like kindly and I said "it\'s fine" in the voice I use about my ex',
  'kindly has the energy of a mall at closing time',
  'every pop-up on kindly has a big yes and a tiny maybe',
]);

// Bitter but stuck: NPS well below zero. Lock-in, not love.
const STUCK = pool('stuck', { act: A23, npsMax: -10 }, [
  'would leave kindly tomorrow if my son\'s whole childhood weren\'t on it',
  'kindly knows I\'m not leaving. that\'s the business model',
  '13 years of photos. that\'s not a social network, that\'s a hostage situation',
  'every month I pay kindly so it won\'t take my own memories. normal stuff',
  'I hate kindly and I\'m on it right now, posting about how I hate it. on it',
  'tried to move to another app. couldn\'t get my photos out. stayed. like everyone',
  'my family won\'t leave so I can\'t leave. we\'re all waiting for someone to go first',
  'kindly is the landlord of my memories and the rent keeps going up',
  'my wedding, my kids, my dad\'s last birthday. all on kindly. all for rent',
  'stuck. not happy. stuck',
  'checked kindly. felt worse. checked again. still worse. why do I do this',
  'my grandmother\'s only trace online is her kindly profile. I can\'t delete that',
  'the worst part of kindly is how much I used to love it',
  'it\'s not a feed. it\'s a toll road through my own life',
  'I\'d delete it if deleting it didn\'t feel like burning a photo album',
  'found a box of printed photos in my parents\' attic. no ads. no subscription. revolutionary',
  'nobody likes kindly. we all just have too much stuff in it',
  'saying goodbye to kindly in my heart while renewing kindly+ with my wallet',
  'the old kindly is a ghost that haunts the new kindly',
  'everyone in my family screenshots their kindly photos now, in case it all vanishes',
  'kindly is a storage unit where the owner keeps raising the rent and moving your boxes',
  'we joked about leaving kindly at thanksgiving. nobody laughed. nobody left',
  'kindly isn\'t an app I use anymore. it\'s a bill I pay',
  'bought a hard drive. spent the weekend screenshotting 4,000 photos one by one',
  { text: 'if huddle could import my photos I\'d be gone tonight', notAfter: 'huddleAcquired' },
  'the only kind thing left about kindly is the name',
  'I keep telling my kids "it used to be nice here". they don\'t believe me',
  'kindly is the town everyone wants to move out of and nobody can sell their house',
  'looking at my baby\'s photos and kindly shows me a formula ad. while she sleeps on my chest',
  'I don\'t trust anything kindly says anymore',
  'kindly turned my memories into leverage',
  'mom keeps paying for kindly+ because she\'s scared of losing dad\'s photos. that\'s what they count on',
  'rage-scrolled kindly for 40 minutes. that\'s a nice number on a dashboard somewhere',
  'I\'m not a user. I\'m a hostage with a nice profile picture',
  'every friend I have complains about kindly in kindly comments',
  'I miss my friends. they\'re right here. I just can\'t see them',
  'the day I can download my photos is the day I leave. they know that too',
  'gave up being mad at kindly. now I\'m just tired',
  'I\'ll still be here next year. that\'s the sad part',
  'kindly is a museum of my life with a gift shop I can\'t get out of',
]);

// Topic posts, gated on the thing existing.
const T_PLUS = pool('plus', { act: A23, after: 'kindlyplus' }, [
  'every kindly screen has a little gold "plus" somewhere now',
  'kindly+ people get a gold leaf by their name. I notice who has one now. I hate that I notice',
  'kindly+ is "for members who want a little more". I want a little less. does that cost extra',
  { text: 'the free version of kindly feels like a demo now', npsMax: 20 },
  'my kindly+ trial ended. I miss the leaf. I don\'t miss the charge',
  'my teen wants kindly+ for her birthday. "everyone has the leaf, mom"',
  'kindly keeps emailing "you\'re missing out on kindly+". I\'m not missing out. I\'m fine',
  { text: 'kindly+ posts get shown "a little more". so free posts get shown a little less', npsMax: 15 },
  'tried kindly+ for a month. it\'s kindly, but with fewer popups asking me to buy kindly+',
  'kindly+ comes with "priority support". so free support is... not a priority',
  'the upgrade button is bigger than the post button now',
  { text: 'good morning ☀️ maya, what is a leaf and why don\'t I have one', handle: 'nana.joan' },
]);

const T_DARK = pool('dark', { act: A23, after: 'dark_paywall' }, [
  'night shift nurse. kindly at 3am without dark mode is a crime',
  'paying for kindly+ to get back a button I already had',
  'eye doctor asked if I look at bright screens at night. "only kindly, now"',
  'dark mode costs money so I turned my brightness all the way down. squinting for free',
  'kindly took dark mode away to sell it back. like stealing your bike and opening a bike shop',
  'someone sat in a meeting and said "what if dark mode cost money" and nobody stopped them',
  'explained to my mom why her app turned white. "they want money, mom." "for the dark?" yes',
  'found a workaround for dark mode. kindly patched it the next day',
  { text: 'dark mode was the first thing they took. I remember thinking it was a small thing', npsMax: 0 },
  'every night my phone flashes white at me and I think of kindly',
  'kindly+: now with the dark mode you used to have!',
  'the dark mode announcement said "excited". I\'m excited too. differently',
  'my partner pays for kindly+ so we can share the dark. romance',
  { text: 'good morning ☀️ is the dark one gone? my eyes are not what they were', handle: 'nana.joan' },
]);

const T_ADS = pool('ad', { act: A23, after: 'ads' }, [
  'kindly ad for a meal kit. I posted about cooking once. once',
  'kindly ads are always for exactly the thing I just bought',
  'ad for wedding venues the day after my breakup post. read the room, kindly',
  'there\'s an ad between my sister\'s new baby and my sister\'s new baby, second photo',
  'kindly ads use my friends\' names now. "jen likes this brand". jen does not',
  'my 4 year old says "skip ad" when I show her family photos',
  'seen the same mattress ad 40 times. never buying it, out of spite',
  'scrolled past an ad for a "kindly-approved" toaster. kindly approves toasters now',
  { text: 'posted that grandpa was sick. kindly showed me a funeral home ad. he\'s fine. I\'m not', npsMax: 10 },
  'the ads load faster than my friends\' photos. tells you everything',
  'every ad says "people like you love this". people like me love my friends',
  'hid an ad. kindly showed me a similar ad "since you\'re interested"',
  'I used to read every post. now I skim for faces I know',
  'more logos than baby photos in my feed this morning',
  'an ad for a dating app between my husband\'s posts. subtle',
  'grandpa tapped an ad thinking it was a cousin. now he has a sock subscription',
  'kindly ads are like seagulls. one shows up and then forty',
  'scrolling kindly is walking through a mall to get to a friend\'s house',
  'got an ad for the exact boots in my friend\'s hiking photo. she didn\'t tag them. kindly just knew',
  { text: 'I\'d pay a dollar to never see the "luxury car you deserve" ad again', npsMax: 15 },
  'ads at 6am, ads at midnight. my friends sleep. ads don\'t',
  { text: 'scoreboard for my feed today: ads 7, friends 3', npsMax: 0 },
  { text: 'good morning ☀️ I scrolled a long time and didn\'t find maya. I found a lot of mattresses', handle: 'nana.joan' },
  { text: 'an ad for a factory-made "artisan" chair showed up right under my actual chair', handle: 'theo.makes' },
  { text: 'the bike ads know my frame size. I never posted my frame size', handle: 'dev_on_bikes' },
]);

const T_SIMPLIFY = pool('simp', { act: A23, after: 'simplify' }, [
  'searched kindly help for "export". top result: "why we retired export (it\'s good news!)"',
  'every settings page now has one main option: "manage kindly+"',
  'the simplified settings page is beautiful and does nothing',
  'found an old guide to exporting kindly photos. step 1 doesn\'t exist anymore',
  'kindly simplified settings by removing the ones that helped me',
  'wanted to save my mom\'s photos before she leaves kindly. the button is just... gone',
  '"we retired export because few people used it." we didn\'t use it because we trusted you',
  'kindly support: export is "not available at this time". what time will it be available',
  'settings used to have 40 options. now 9. none is the one I need',
  'found a "download my data" link in an old forum post. it says "page not found"',
  'the new settings page: lots of white space and a big gold kindly+ button',
  'photographer friend is screenshotting her whole kindly account. 3,000 photos. by hand',
  '"export has been retired." enjoy retirement, export. my photos would like to come with you',
  'asked kindly for a copy of my photos. they sent me a coupon',
  { text: 'settings got "simpler" and my privacy got worse. surely a coincidence', npsMax: 15 },
]);

const T_STORAGE = pool('gb', { act: A23, after: 'storage_limit' }, [
  'kindly sent me a list of my "largest memories" to delete. the largest is my son being born',
  '5 GB free. my wedding alone is 12',
  'deleting old photos to stay under 5 gigs. today I deleted 2014. I didn\'t need 2014. I did',
  'the storage bar on kindly is red. it\'s always red now',
  'got a "you\'re almost out of room" email. with a little sad cloud emoji',
  'my mom asked which grandchildren\'s photos she should delete. I said none. she paid',
  'kindly made storage free and unlimited so we\'d put everything there. we did. here we are',
  'can\'t upload the first birthday because I\'m over the limit. the baby will understand',
  'the 5 GB counts videos. one recital video ate a whole gig',
  'kindly shrinks your photos if you\'re over the limit? my wedding looks like a watercolor',
  'we added it up: the family album is 61 GB. kindly+ for everyone costs more than our phone bill',
  'they let us fill the house and then started charging for the rooms',
  'kindly says photos over the limit are "safe, just paused". paused memories',
  'I\'ve been here since the unlimited era. I\'m a dinosaur with 44 GB',
  'photographer friend always said "never trust free storage". I laughed. she\'s laughing now',
  'spent sunday deciding which of my dog\'s puppy photos were "essential"',
  'every photo I take, my phone asks to upload to kindly. every time I think "can I afford it"',
  'storage limit email arrived on my mom\'s birthday. her whole album is over the limit',
  'bought kindly+ for the storage. nobody\'s happy about it. least of all me',
  { text: '5 gigs is an insult and they know it', npsMax: 10 },
  'my kids\' childhood is 38 GB. kindly+ it is',
  { text: 'kindly told grandpa his storage was full. he thought his phone was broken and bought a new phone', npsMax: 20 },
  'started saving photos to an old laptop again. full circle',
  { text: 'storage at 4.9 of 5 GB. I\'ve stopped taking pictures of my kids so I don\'t go over. that\'s where we are', npsMax: 0 },
  { text: 'paying kindly+ for me AND grandma now. family plan when', handle: 'maya.k' },
  { text: 'good morning ☀️ the photos of the new baby say "upgrade to view". I would like to view', handle: 'nana.joan' },
]);

const T_ALGO = pool('algo', { act: A23, after: 'algo_feed' }, [
  'the feed is a slot machine. pull down, maybe a friend, probably a stranger\'s kitchen',
  'best friend posted her engagement monday. kindly showed it to me thursday',
  'my cousin, then 20 people I\'ve never heard of, then my cousin again',
  'the feed decided I like trucks. I do not like trucks. I looked at one truck once',
  'kindly thinks I\'m into luxury watches. I\'m into my kids',
  'the "following" tab is three taps deep now',
  'a post from a friend is a rare treat now. like finding money in an old coat',
  { text: 'posted my kid\'s drawing: 2 likes. posted an angry rant: 300. kindly has learned something about me', npsMax: 10 },
  'kindly says it knows what I want to see before I do. I don\'t want to see this',
  'mom\'s posts are buried. a stranger\'s kayak is front and center',
  'the feed shows me arguments now. people I don\'t know fighting about lawns',
  'my feed: 1 friend, 1 ad, 4 strangers, 1 "suggested group", 1 friend from 2019',
  { text: 'I don\'t post anymore. the feed won\'t show it to anyone anyway', npsMax: 0 },
  'liked one dog post and now my whole feed is dogs. ok that one\'s actually fine',
  'kindly showed me my coworker\'s month-old post. "trending". it was about a sandwich',
  'friend had a baby and I heard from my mom. kindly showed me a wrestling clip instead',
  'the feed refreshed by itself and my sister\'s post disappeared forever',
  'scrolling kindly feels like being in a room where someone keeps changing the channel',
  'I keep pulling to refresh hoping for a friend. it\'s a lottery ticket. I keep losing',
  'the algorithm decided my aunt isn\'t interesting. my aunt is extremely interesting',
  'a stranger\'s rant about parking got more of my feed than my whole family',
  'tried to find my friend\'s vacation album. kindly showed me "people also liked" 17 times',
  { text: 'a stranger crying in her car: 2 million views. my friend\'s new puppy: 4', npsMax: 10 },
  'is anyone else\'s feed just strangers being mad now',
  'I used to know when my friends usually posted. now everything\'s out of order. time is soup',
  'kindly hid my brother\'s promotion and showed me three people yelling about a movie',
  'kindly said I\'d "love" this post. it was a man reviewing gravel',
  'I visit my friends\' profiles one by one now. like it\'s 2006',
  'same 4 posts every time I open the app. none from anyone I know',
  { text: 'grandma asked me to print the family photos and mail them. says it\'s faster than finding us on kindly', handle: 'maya.k' },
  { text: 'set grandma\'s feed to show my posts first. kindly reset it after an update', handle: 'maya.k' },
  { text: 'finished a walnut bench. kindly showed it to 11 people and a bench ad to 11,000', handle: 'theo.makes' },
]);

const T_CANCEL = pool('cancel', { act: A23, after: 'cancel_flow' }, [
  'cancel step 3: "would your family want you to leave?" they\'re on kindly. they would not',
  'cancelling took 22 minutes and two tries. still not sure it worked',
  'halfway through cancelling, kindly offered me 50% off. then 60. then the slideshow',
  'cancel step 8 is a video of the founder saying "we\'ll miss you". can\'t skip it',
  'finally cancelled kindly+. the confirmation said "we\'ve paused your memories". paused?',
  'the 9 cancel steps: a survey, a discount, a guilt trip, a puppy. not my puppy',
  'signing up for kindly+ is one tap. cancelling is a hike',
  'timed it. upgrading: 4 seconds. cancelling: 18 minutes',
  'end of the cancel flow, the last button just said "keep my memories"',
  'cancel step 5: "are you SURE sure?"',
  { text: 'cancelling kindly+ made me look at a photo of my late dog first. that should be illegal', npsMax: 10 },
  'tried to cancel for my grandpa. security question: "first pet". he\'s 88. it was a long time ago',
  'my friend\'s whole weekend is cancelling kindly+ for her parents. sixth attempt',
  'cancelled kindly+. got three "come back!" emails before I\'d even closed the app',
  '"we\'re sorry to see you go" on screen 1. you\'re not. eight more screens prove it',
]);

const T_NOTIF = pool('ping', { act: A23, after: 'lever_notif' }, [
  'kindly sent 9 notifications today. two were from people',
  '"you have unseen memories!" I have unseen memories because I\'m busy making them',
  'turned off kindly notifications. a week later they were back. "we updated your preferences"',
  'buzz. kindly. "see what\'s trending". nothing is trending in my life',
  '6am kindly: "good morning! 3 friends posted". none had',
  'the kindly notification sound is my new least favorite sound',
  '"you haven\'t posted in a while 😢" don\'t use emojis to guilt me, kindly',
  'kindly pinged me during my kid\'s school play. "something new is happening!" yes. the play',
  'kindly notifications feel like a toddler tugging my sleeve',
  'kindly: "your friends miss you!" my friends: never said that',
  'got a kindly notification that someone liked a comment I made years ago',
  'kindly sends more notifications than my bank, my kid\'s school and my doctor combined',
  'muted kindly. it found email. then texts',
  'my watch buzzed. kindly. "people are reacting!" to what. nobody posted',
  'kindly pings me the exact second I open a book',
  'kindly notifications arrive in clumps of three now, like pigeons',
  'off in kindly, off in my phone settings, still got one. how',
  { text: 'my lock screen is 60% kindly', npsMax: 15 },
]);

const T_ANNUAL = pool('year', { act: A23, after: 'annual' }, [
  'kindly+ annual renewed itself. $72 on a tuesday morning. surprise',
  'locked into kindly+ until next spring. that\'s how they keep you',
  { text: 'the annual plan felt smart in january. it\'s june and I hate it here', npsMax: 15 },
  '"save 20%!" by paying for a year of a thing that gets worse every month',
  'they call annual plans "for our most loyal members". loyal, or stuck',
  'the annual email says "lock in your price". what they mean is lock in me',
  'kindly\'s annual plan has no refunds. found that out in month 2',
]);

const T_PRICE = pool('price', { act: A23, after: 'lever_price' }, [
  'kindly+ goes up a dollar at a time. like a frog in a pot. I\'m the frog',
  'every kindly+ price email starts with "we\'re excited". never be excited about my money',
  'kindly+ went up. my grandma\'s pension didn\'t',
  'I keep a spreadsheet of kindly+ prices. it\'s a staircase',
  { text: 'the price went up and nothing got better. not one thing', npsMax: 15 },
  'the kindly+ price-hike email arrived on my birthday. thanks',
  'raising the price of the app my family uses to see each other. heartwarming',
]);

// Regulars, without a topic gate.
const REGULARS = pool('reg', { act: A23 }, [
  { text: 'thinking about leaving kindly but my whole customer list lives here', handle: 'theo.makes', npsMax: 0 },
  { text: 'renamed the folder kindly lives in on my phone to "regret". still opening it', handle: 'dev_on_bikes', npsMax: -10 },
  { text: 'my therapist asked what I do when I\'m bored. I said kindly. she wrote something down', handle: 'rina', npsMax: 5 },
  { text: 'moved kindly off my home screen to the second page. baby steps', handle: 'rina', npsMax: -10 },
  { text: 'made a list of reasons to stay on kindly. it\'s just people\'s names', handle: 'rina', npsMax: -10 },
  { text: 'good morning ☀️ the app asked me to "boost my memories". I said yes. it charged me', handle: 'nana.joan', after: 'kindlyplus', npsMax: 15 },
  { text: 'grandma called asking if kindly is "the computer people". I said yes. she said "tell them to stop"', handle: 'maya.k', npsMax: 0 },
  { text: 'rode 80 miles, posted it, 6 likes. posted a flat tire rant, 140. noted', handle: 'dev_on_bikes', after: 'algo_feed' },
]);

// Hidden path, Act 2: Kindly grows big and stays kind. Members pleased, a little wary.
const HIDDEN: PostDef[] = [
  { id: "f2h_001", act: 2, npsMin: 30, text: "kindly got huge this year and my feed still feels like my living room" },
  { id: "f2h_002", act: 2, npsMin: 30, text: "heard kindly took more investor money. bracing myself. nothing happened yet" },
  { id: "f2h_003", act: 2, npsMin: 30, text: "every app on my phone got pushier this year except one" },
  { id: "f2h_004", act: 2, npsMin: 30, text: "kindly's update notes read like a letter from a friend. \"we fixed the thing you hated\"" },
  { id: "f2h_005", act: 2, npsMin: 30, text: "waiting for the catch with kindly. it's been a while" },
  { id: "f2h_006", act: 2, npsMin: 30, text: "kindly emailed asking if we'd pay a bit to keep it mostly ad-free. a lot of us said yes" },
  { id: "f2h_007", act: 2, npsMin: 30, text: "huddle just added a shopping tab. kindly added a \"print this album\" button. different priorities" },
  { id: "f2h_008", act: 2, npsMin: 30, text: "my feed is still in order. still friends. still ends" },
  { id: "f2h_009", act: 2, npsMin: 30, text: "new phone, new everything. kindly logged me in and everything was where I left it" },
  { id: "f2h_010", act: 2, npsMin: 30, text: "kindly's office tour video was mostly the support team waving. cute" },
  { id: "f2h_011", act: 2, npsMin: 30, text: "sixty new people joined my neighborhood group this month. still no spam" },
  { id: "f2h_012", act: 2, npsMin: 30, text: "kindly hit some huge user number. the celebration post was a photo of a cake. that's it" },
  { id: "f2h_013", act: 2, npsMin: 30, text: "my aunt asked if kindly is \"going to go the way of the others\". not yet, auntie" },
  { id: "f2h_014", act: 2, npsMin: 30, text: "kindly support fixed my login and wished me happy birthday. it was my birthday" },
  { id: "f2h_015", act: 2, npsMin: 30, text: "the ads on kindly are rare and local. today: a pumpkin patch. I'm going to the pumpkin patch" },
  { id: "f2h_016", act: 2, npsMin: 30, text: "counted one ad in my whole scroll this morning. a bakery. fine by me" },
  { id: "f2h_017", act: 2, npsMin: 30, text: "kindly's founder said on a podcast \"we'd rather be loved than huge\". kindly's turning out to be both" },
  { id: "f2h_018", act: 2, npsMin: 30, text: "everyone says kindly will sell out once it gets big. it's big. go on, I'm watching" },
  { id: "f2h_019", act: 2, npsMin: 30, text: "a news site called kindly \"the polite giant\". accurate" },
  { id: "f2h_020", act: 2, npsMin: 30, text: "moved my mom from huddle to kindly. she says it's \"less shouty\"" },
  { id: "f2h_021", act: 2, npsMin: 30, text: "kindly made me a \"year in photos\" slideshow. no music upsell. no watermark" },
  { id: "f2h_022", act: 2, npsMin: 30, text: "I like that kindly tells you what it's working on. this month: fewer bugs" },
  { id: "f2h_023", act: 2, npsMin: 30, text: "kindly still lets me turn off every single suggestion. and remembers that I did" },
  { id: "f2h_024", act: 2, npsMin: 30, text: "my friend thinks kindly is a nonprofit. I keep telling her it just acts like one" },
  { id: "f2h_025", act: 2, npsMin: 30, text: "kindly's investor news always makes me nervous. then I open the app and it's just dogs" },
  { id: "f2h_026", act: 2, npsMin: 30, text: "the board must be thrilled with kindly's growth. hopefully not thrilled enough to change it" },
  { id: "f2h_027", act: 2, npsMin: 30, text: "posted my first pottery bowl. lopsided. 52 hearts. this app is too kind to me" },
  { id: "f2h_028", act: 2, npsMin: 30, text: "my grandson set up kindly for me. now I see his band play every week" },
  { id: "f2h_029", act: 2, npsMin: 30, text: "kindly warned me before changing the photo layout. and gave me an off switch" },
  { id: "f2h_030", act: 2, npsMin: 30, text: "kindly's growing so fast and the moderators still know my town's group by name" },
  { id: "f2h_031", act: 2, npsMin: 30, text: "at a friend's house everyone was passing phones around showing kindly photos. like old albums" },
  { id: "f2h_032", act: 2, npsMin: 30, text: "been on kindly since the start. it's bigger, shinier, and still kind. surprising" },
  { id: "f2h_033", act: 2, npsMin: 30, text: "read that kindly said no to some ad network deal. good. I don't want to be \"networked\"" },
  { id: "f2h_034", act: 2, npsMin: 30, text: "kindly passed on the ad deal and the founder posted \"we'll find another way\". respect" },
  { id: "f2h_035", act: 2, npsMin: 30, text: "read that kindly's investors wanted an ad every three posts. kindly went with one per ten. thank you" },
  { id: "f2h_036", act: 2, npsMin: 30, text: "my teenage cousin says kindly is \"for old people\". then posts on it every day" },
  { id: "f2h_037", act: 2, npsMin: 30, text: "kindly's comment sections are still where I go to feel better about people" },
  { id: "f2h_038", act: 2, npsMin: 30, text: "my college roommate found me on kindly after 15 years. we talked for three hours" },
  { id: "f2h_039", act: 2, npsMin: 30, text: "hearthstead started selling \"featured friends\". kindly please don't. (kindly didn't)" },
  { id: "f2h_040", act: 2, npsMin: 30, text: "kindly's user graph is up and to the right and my feed is still down to earth" },
  { id: "f2h_041", act: 2, npsMin: 30, text: "grandma posted a soup recipe and 200 strangers made it. she's insufferable now" },
  { id: "f2h_042", act: 2, npsMin: 30, text: "good morning ☀️ maya showed me how to post two photos at once. here are my two cats", handle: "nana.joan" },
  { id: "f2h_043", act: 2, npsMin: 30, text: "kindly fixed the bug that ate my long rides. a human replied to my report", handle: "dev_on_bikes" },
  { id: "f2h_044", act: 2, npsMin: 30, text: "sold my first chair to someone who saw it on a friend's feed. just friends of friends", handle: "theo.makes" },
  { id: "f2h_045", act: 2, npsMin: 30, text: "everyone keeps telling me kindly will turn on me. I keep checking. still nice", handle: "rina" },
  { id: "f2h_046", act: 2, npsMin: 30, text: "paying for supporter because I want this place to exist in ten years", after: "supporter" },
  { id: "f2h_047", act: 2, npsMin: 30, text: "the supporter email said \"this is optional, forever\". bold words. I believe it", after: "supporter" },
  { id: "f2h_048", act: 2, npsMin: 30, text: "the photo backup on kindly is still free. every other app turned that into a subscription", notAfter: "storage_limit" },
];

export const POSTS_ACT2: PostDef[] = [
  ...reactions(REACTIONS),
  ...INSIDER,
  ...CONTENT,
  ...POSITIVE,
  ...HIDDEN,
  ...MIXED,
  ...GRUMBLE,
  ...STUCK,
  ...T_PLUS,
  ...T_DARK,
  ...T_ADS,
  ...T_SIMPLIFY,
  ...T_STORAGE,
  ...T_ALGO,
  ...T_CANCEL,
  ...T_NOTIF,
  ...T_ANNUAL,
  ...T_PRICE,
  ...REGULARS,
];
