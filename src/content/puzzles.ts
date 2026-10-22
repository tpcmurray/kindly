// Bug-fix puzzles: a short code snippet with empty slots. Each slot has a tetromino shape and only the
// block with that shape (and the right code) fits. ⟦0⟧ ⟦1⟧ ⟦2⟧ mark the slots in the code.
// Early puzzles use only the first two slots; the third is shown already filled in.

export type Shape = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z';
export const SHAPES: Shape[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];

export interface PuzzleDef {
  outage: number;                 // index into OUTAGES
  code: string[];                 // lines of code, with ⟦n⟧ slot markers
  slots: { answer: string; shape: Shape }[];
  decoys: string[];               // wrong blocks (their shapes are assigned so they fit no slot)
}

export const PUZZLES: PuzzleDef[] = [
  { outage: 0, code: ['function upload(photo) {', '  if (photo.size > ⟦0⟧) resize(photo);', '  ⟦1⟧ storage.save(photo);', '  return ⟦2⟧;', '}'],
    slots: [{ answer: 'MAX_SIZE', shape: 'I' }, { answer: 'await', shape: 'T' }, { answer: 'photo.id', shape: 'L' }], decoys: ['null', 'delete'] },
  { outage: 1, code: ['const posts = await db.feed(user.id, {', '  order: ⟦0⟧,', '  limit: ⟦1⟧,', '  cache: ⟦2⟧,', '});'],
    slots: [{ answer: "'newest'", shape: 'S' }, { answer: '50', shape: 'O' }, { answer: 'true', shape: 'J' }], decoys: ['undefined', "'random'"] },
  { outage: 2, code: ['onNewPhoto(friend => {', '  if (⟦0⟧(friend.id)) return;', '  sent.⟦1⟧(friend.id);', '  ⟦2⟧(friend);', '});'],
    slots: [{ answer: 'sent.has', shape: 'Z' }, { answer: 'add', shape: 'I' }, { answer: 'notify', shape: 'T' }], decoys: ['notifyAll', 'loop'] },
  { outage: 3, code: ['async function logIn(email, pass) {', '  const user = ⟦0⟧ auth.check(email, pass);', '  if (!user) throw ⟦1⟧;', '  return ⟦2⟧(user);', '}'],
    slots: [{ answer: 'await', shape: 'L' }, { answer: 'BadLogin', shape: 'O' }, { answer: 'session', shape: 'S' }], decoys: ['android', 'retry()'] },
  { outage: 4, code: ['messages.sort((a, b) =>', '  ⟦0⟧ - ⟦1⟧', ');', 'chat.⟦2⟧(messages);'],
    slots: [{ answer: 'a.time', shape: 'J' }, { answer: 'b.time', shape: 'T' }, { answer: 'render', shape: 'I' }], decoys: ['b.name', 'shuffle'] },
  { outage: 5, code: ['const photos = album.photos', '  .filter(p => p.albumId === ⟦0⟧)', '  .sort(by(⟦1⟧));', 'show(⟦2⟧);'],
    slots: [{ answer: 'album.id', shape: 'O' }, { answer: "'takenAt'", shape: 'Z' }, { answer: 'photos', shape: 'L' }], decoys: ['user.id', "'size'"] },
  { outage: 6, code: ['const today = ⟦0⟧(user.timezone);', 'const memories = photos.filter(p =>', '  sameDay(p.takenAt, ⟦1⟧)', ');', 'show(⟦2⟧);'],
    slots: [{ answer: 'localDate', shape: 'T' }, { answer: 'today', shape: 'S' }, { answer: 'memories', shape: 'J' }], decoys: ['utcNow', 'yesterday'] },
  { outage: 7, code: ['function search(q) {', '  const words = q.⟦0⟧().split(" ");', '  return index.⟦1⟧(words)', '    .slice(0, ⟦2⟧);', '}'],
    slots: [{ answer: 'toLowerCase', shape: 'I' }, { answer: 'match', shape: 'L' }, { answer: '20', shape: 'O' }], decoys: ['reverse', '-1'] },
  { outage: 8, code: ['sendEmail({', '  to: friend.email,', '  from: ⟦0⟧,', '  subject: ⟦1⟧,', '  signed: ⟦2⟧,', '});'],
    slots: [{ answer: "'hi@kindly'", shape: 'Z' }, { answer: 'inviteTitle', shape: 'T' }, { answer: 'true', shape: 'I' }], decoys: ["'noreply'", 'false'] },
  { outage: 9, code: ['function start() {', '  const cfg = ⟦0⟧ ?? defaults;', '  ⟦1⟧(cfg);', '  return ⟦2⟧();', '}'],
    slots: [{ answer: 'savedConfig', shape: 'S' }, { answer: 'loadTheme', shape: 'O' }, { answer: 'openFeed', shape: 'J' }], decoys: ['null', 'crash'] },
  { outage: 10, code: ['const video = document.⟦0⟧("video");', 'video.src = ⟦1⟧;', 'video.⟦2⟧();'],
    slots: [{ answer: 'querySelector', shape: 'L' }, { answer: 'clip.url', shape: 'I' }, { answer: 'play', shape: 'T' }], decoys: ['pause', 'clip.name'] },
  { outage: 11, code: ['const token = ⟦0⟧(32);', 'await db.saveReset(user.id, token);', 'await mail.⟦1⟧(user.email,', '  resetLink(⟦2⟧));'],
    slots: [{ answer: 'randomToken', shape: 'J' }, { answer: 'send', shape: 'Z' }, { answer: 'token', shape: 'O' }], decoys: ['user.password', 'skip'] },
  { outage: 12, code: ['function addComment(post, text) {', '  const c = { text, at: ⟦0⟧ };', '  post.comments.⟦1⟧(c);', '  return ⟦2⟧(post);', '}'],
    slots: [{ answer: 'Date.now()', shape: 'T' }, { answer: 'push', shape: 'S' }, { answer: 'db.save', shape: 'L' }], decoys: ['pop', 'clear'] },
];

// From Act 2 on, these start turning up in the block tray. They fit nowhere.
export const LATE_DECOYS = ['trackLocation()', 'sellToPartners()', 'showAd()', 'autoRenew()', 'hideCancel()', 'shareContacts()', 'readMessages()', 'boostEngagement()'];
