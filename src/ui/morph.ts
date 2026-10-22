// A tiny DOM morph: update `target` to match `html` in place, so buttons under the cursor survive re-renders.
// Lists whose items carry `data-key` are matched by key, so a new item at the top is inserted
// without rebuilding the items below it. Newly inserted keyed items get `data-m-enter` for animation.
const tpl = document.createElement('template');

export function morphInto(target: Element, html: string): void {
  tpl.innerHTML = html;
  morphChildren(target, tpl.content);
}

function morphChildren(from: Node, to: Node): void {
  if (isKeyedList(to)) { morphKeyed(from, to); return; }
  const a = Array.from(from.childNodes);
  const b = Array.from(to.childNodes);
  for (let i = 0; i < b.length; i++) {
    const n = b[i];
    const o = a[i];
    if (!o) { from.appendChild(n.cloneNode(true)); continue; }
    if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName || keyOf(o) !== keyOf(n)) {
      from.replaceChild(n.cloneNode(true), o);
      continue;
    }
    morphNode(o, n);
  }
  for (let i = a.length - 1; i >= b.length; i--) from.removeChild(a[i]);
}

function morphNode(o: Node, n: Node): void {
  if (n.nodeType === Node.TEXT_NODE || n.nodeType === Node.COMMENT_NODE) {
    if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
    return;
  }
  syncAttrs(o as Element, n as Element);
  morphChildren(o, n);
}

// A list counts as keyed when it has at least two element children and all of them have keys
// (whitespace text between them is ignored).
function isKeyedList(to: Node): boolean {
  let elements = 0;
  for (const c of Array.from(to.childNodes)) {
    if (c.nodeType === Node.TEXT_NODE && !c.nodeValue!.trim()) continue;
    if (c.nodeType !== Node.ELEMENT_NODE || keyOf(c) === null) return false;
    elements++;
  }
  return elements >= 2;
}

function morphKeyed(from: Node, to: Node): void {
  const existing = new Map<string, Element>();
  for (const c of Array.from(from.childNodes)) {
    const k = keyOf(c);
    if (k !== null) existing.set(k, c as Element);
    else from.removeChild(c);
  }
  const hadItems = existing.size > 0;
  const wanted = Array.from(to.childNodes).filter(c => c.nodeType === Node.ELEMENT_NODE) as Element[];
  let cursor: Node | null = from.firstChild;
  for (const n of wanted) {
    const k = keyOf(n)!;
    let o = existing.get(k);
    if (o) {
      existing.delete(k);
      morphNode(o, n);
    } else {
      o = n.cloneNode(true) as Element;
      if (hadItems) o.setAttribute('data-m-enter', '');
    }
    if (o !== cursor) from.insertBefore(o, cursor);
    else cursor = cursor.nextSibling;
  }
  for (const leftover of existing.values()) leftover.remove();
}

function keyOf(n: Node): string | null {
  return n.nodeType === Node.ELEMENT_NODE ? (n as Element).getAttribute('data-key') : null;
}

function syncAttrs(o: Element, n: Element): void {
  for (const at of Array.from(o.attributes)) if (!n.hasAttribute(at.name) && !at.name.startsWith('data-m-') && at.name !== 'class') o.removeAttribute(at.name);
  for (const at of Array.from(n.attributes)) {
    let val = at.value;
    // Keep effect classes (fx-*) that juice.ts added, so animations aren't cut off by re-renders.
    if (at.name === 'class') {
      const fx = Array.from(o.classList).filter(c => c.startsWith('fx-') && !n.classList.contains(c));
      if (fx.length) val = (val + ' ' + fx.join(' ')).trim();
    }
    if (o.getAttribute(at.name) !== val) o.setAttribute(at.name, val);
  }
  if (!n.hasAttribute('class') && o.hasAttribute('class')) {
    const fx = Array.from(o.classList).filter(c => c.startsWith('fx-'));
    if (fx.length) o.setAttribute('class', fx.join(' ')); else o.removeAttribute('class');
  }
  if (o instanceof HTMLButtonElement && n instanceof HTMLButtonElement) o.disabled = n.disabled;
}
