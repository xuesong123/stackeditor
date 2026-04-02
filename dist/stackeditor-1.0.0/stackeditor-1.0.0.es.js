function X(i) {
  this.content = i;
}
X.prototype = {
  constructor: X,
  find: function(i) {
    for (var t = 0; t < this.content.length; t += 2)
      if (this.content[t] === i) return t;
    return -1;
  },
  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(i) {
    var t = this.find(i);
    return t == -1 ? void 0 : this.content[t + 1];
  },
  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(i, t, n) {
    var r = n && n != i ? this.remove(n) : this, s = r.find(i), o = r.content.slice();
    return s == -1 ? o.push(n || i, t) : (o[s + 1] = t, n && (o[s] = n)), new X(o);
  },
  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(i) {
    var t = this.find(i);
    if (t == -1) return this;
    var n = this.content.slice();
    return n.splice(t, 2), new X(n);
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(i, t) {
    return new X([i, t].concat(this.remove(i).content));
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(i, t) {
    var n = this.remove(i).content.slice();
    return n.push(i, t), new X(n);
  },
  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(i, t, n) {
    var r = this.remove(t), s = r.content.slice(), o = r.find(i);
    return s.splice(o == -1 ? s.length : o, 0, t, n), new X(s);
  },
  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(i) {
    for (var t = 0; t < this.content.length; t += 2)
      i(this.content[t], this.content[t + 1]);
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(i) {
    return i = X.from(i), i.size ? new X(i.content.concat(this.subtract(i).content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(i) {
    return i = X.from(i), i.size ? new X(this.subtract(i).content.concat(i.content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(i) {
    var t = this;
    i = X.from(i);
    for (var n = 0; n < i.content.length; n += 2)
      t = t.remove(i.content[n]);
    return t;
  },
  // :: () → Object
  // Turn ordered map into a plain object.
  toObject: function() {
    var i = {};
    return this.forEach(function(t, n) {
      i[t] = n;
    }), i;
  },
  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1;
  }
};
X.from = function(i) {
  if (i instanceof X) return i;
  var t = [];
  if (i) for (var n in i) t.push(n, i[n]);
  return new X(t);
};
function No(i, t, n) {
  for (let r = 0; ; r++) {
    if (r == i.childCount || r == t.childCount)
      return i.childCount == t.childCount ? null : n;
    let s = i.child(r), o = t.child(r);
    if (s == o) {
      n += s.nodeSize;
      continue;
    }
    if (!s.sameMarkup(o))
      return n;
    if (s.isText && s.text != o.text) {
      for (let l = 0; s.text[l] == o.text[l]; l++)
        n++;
      return n;
    }
    if (s.content.size || o.content.size) {
      let l = No(s.content, o.content, n + 1);
      if (l != null)
        return l;
    }
    n += s.nodeSize;
  }
}
function To(i, t, n, r) {
  for (let s = i.childCount, o = t.childCount; ; ) {
    if (s == 0 || o == 0)
      return s == o ? null : { a: n, b: r };
    let l = i.child(--s), a = t.child(--o), c = l.nodeSize;
    if (l == a) {
      n -= c, r -= c;
      continue;
    }
    if (!l.sameMarkup(a))
      return { a: n, b: r };
    if (l.isText && l.text != a.text) {
      let u = 0, d = Math.min(l.text.length, a.text.length);
      for (; u < d && l.text[l.text.length - u - 1] == a.text[a.text.length - u - 1]; )
        u++, n--, r--;
      return { a: n, b: r };
    }
    if (l.content.size || a.content.size) {
      let u = To(l.content, a.content, n - 1, r - 1);
      if (u)
        return u;
    }
    n -= c, r -= c;
  }
}
let x = class se {
  /**
  @internal
  */
  constructor(t, n) {
    if (this.content = t, this.size = n || 0, n == null)
      for (let r = 0; r < t.length; r++)
        this.size += t[r].nodeSize;
  }
  /**
  Invoke a callback for all descendant nodes between the given two
  positions (relative to start of this fragment). Doesn't descend
  into a node when the callback returns `false`.
  */
  nodesBetween(t, n, r, s = 0, o) {
    for (let l = 0, a = 0; a < n; l++) {
      let c = this.content[l], u = a + c.nodeSize;
      if (u > t && r(c, s + a, o || null, l) !== !1 && c.content.size) {
        let d = a + 1;
        c.nodesBetween(Math.max(0, t - d), Math.min(c.content.size, n - d), r, s + d);
      }
      a = u;
    }
  }
  /**
  Call the given callback for every descendant node. `pos` will be
  relative to the start of the fragment. The callback may return
  `false` to prevent traversal of a given node's children.
  */
  descendants(t) {
    this.nodesBetween(0, this.size, t);
  }
  /**
  Extract the text between `from` and `to`. See the same method on
  [`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
  */
  textBetween(t, n, r, s) {
    let o = "", l = !0;
    return this.nodesBetween(t, n, (a, c) => {
      let u = a.isText ? a.text.slice(Math.max(t, c) - c, n - c) : a.isLeaf ? s ? typeof s == "function" ? s(a) : s : a.type.spec.leafText ? a.type.spec.leafText(a) : "" : "";
      a.isBlock && (a.isLeaf && u || a.isTextblock) && r && (l ? l = !1 : o += r), o += u;
    }, 0), o;
  }
  /**
  Create a new fragment containing the combined content of this
  fragment and the other.
  */
  append(t) {
    if (!t.size)
      return this;
    if (!this.size)
      return t;
    let n = this.lastChild, r = t.firstChild, s = this.content.slice(), o = 0;
    for (n.isText && n.sameMarkup(r) && (s[s.length - 1] = n.withText(n.text + r.text), o = 1); o < t.content.length; o++)
      s.push(t.content[o]);
    return new se(s, this.size + t.size);
  }
  /**
  Cut out the sub-fragment between the two given positions.
  */
  cut(t, n = this.size) {
    if (t == 0 && n == this.size)
      return this;
    let r = [], s = 0;
    if (n > t)
      for (let o = 0, l = 0; l < n; o++) {
        let a = this.content[o], c = l + a.nodeSize;
        c > t && ((l < t || c > n) && (a.isText ? a = a.cut(Math.max(0, t - l), Math.min(a.text.length, n - l)) : a = a.cut(Math.max(0, t - l - 1), Math.min(a.content.size, n - l - 1))), r.push(a), s += a.nodeSize), l = c;
      }
    return new se(r, s);
  }
  /**
  @internal
  */
  cutByIndex(t, n) {
    return t == n ? se.empty : t == 0 && n == this.content.length ? this : new se(this.content.slice(t, n));
  }
  /**
  Create a new fragment in which the node at the given index is
  replaced by the given node.
  */
  replaceChild(t, n) {
    let r = this.content[t];
    if (r == n)
      return this;
    let s = this.content.slice(), o = this.size + n.nodeSize - r.nodeSize;
    return s[t] = n, new se(s, o);
  }
  /**
  Create a new fragment by prepending the given node to this
  fragment.
  */
  addToStart(t) {
    return new se([t].concat(this.content), this.size + t.nodeSize);
  }
  /**
  Create a new fragment by appending the given node to this
  fragment.
  */
  addToEnd(t) {
    return new se(this.content.concat(t), this.size + t.nodeSize);
  }
  /**
  Compare this fragment to another one.
  */
  eq(t) {
    if (this.content.length != t.content.length)
      return !1;
    for (let n = 0; n < this.content.length; n++)
      if (!this.content[n].eq(t.content[n]))
        return !1;
    return !0;
  }
  /**
  The first child of the fragment, or `null` if it is empty.
  */
  get firstChild() {
    return this.content.length ? this.content[0] : null;
  }
  /**
  The last child of the fragment, or `null` if it is empty.
  */
  get lastChild() {
    return this.content.length ? this.content[this.content.length - 1] : null;
  }
  /**
  The number of child nodes in this fragment.
  */
  get childCount() {
    return this.content.length;
  }
  /**
  Get the child node at the given index. Raise an error when the
  index is out of range.
  */
  child(t) {
    let n = this.content[t];
    if (!n)
      throw new RangeError("Index " + t + " out of range for " + this);
    return n;
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(t) {
    return this.content[t] || null;
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(t) {
    for (let n = 0, r = 0; n < this.content.length; n++) {
      let s = this.content[n];
      t(s, r, n), r += s.nodeSize;
    }
  }
  /**
  Find the first position at which this fragment and another
  fragment differ, or `null` if they are the same.
  */
  findDiffStart(t, n = 0) {
    return No(this, t, n);
  }
  /**
  Find the first position, searching from the end, at which this
  fragment and the given fragment differ, or `null` if they are
  the same. Since this position will not be the same in both
  nodes, an object with two separate positions is returned.
  */
  findDiffEnd(t, n = this.size, r = t.size) {
    return To(this, t, n, r);
  }
  /**
  Find the index and inner offset corresponding to a given relative
  position in this fragment. The result object will be reused
  (overwritten) the next time the function is called. @internal
  */
  findIndex(t) {
    if (t == 0)
      return Zn(0, t);
    if (t == this.size)
      return Zn(this.content.length, t);
    if (t > this.size || t < 0)
      throw new RangeError(`Position ${t} outside of fragment (${this})`);
    for (let n = 0, r = 0; ; n++) {
      let s = this.child(n), o = r + s.nodeSize;
      if (o >= t)
        return o == t ? Zn(n + 1, o) : Zn(n, r);
      r = o;
    }
  }
  /**
  Return a debugging string that describes this fragment.
  */
  toString() {
    return "<" + this.toStringInner() + ">";
  }
  /**
  @internal
  */
  toStringInner() {
    return this.content.join(", ");
  }
  /**
  Create a JSON-serializeable representation of this fragment.
  */
  toJSON() {
    return this.content.length ? this.content.map((t) => t.toJSON()) : null;
  }
  /**
  Deserialize a fragment from its JSON representation.
  */
  static fromJSON(t, n) {
    if (!n)
      return se.empty;
    if (!Array.isArray(n))
      throw new RangeError("Invalid input for Fragment.fromJSON");
    return new se(n.map(t.nodeFromJSON));
  }
  /**
  Build a fragment from an array of nodes. Ensures that adjacent
  text nodes with the same marks are joined together.
  */
  static fromArray(t) {
    if (!t.length)
      return se.empty;
    let n, r = 0;
    for (let s = 0; s < t.length; s++) {
      let o = t[s];
      r += o.nodeSize, s && o.isText && t[s - 1].sameMarkup(o) ? (n || (n = t.slice(0, s)), n[n.length - 1] = o.withText(n[n.length - 1].text + o.text)) : n && n.push(o);
    }
    return new se(n || t, r);
  }
  /**
  Create a fragment from something that can be interpreted as a
  set of nodes. For `null`, it returns the empty fragment. For a
  fragment, the fragment itself. For a node or array of nodes, a
  fragment containing those nodes.
  */
  static from(t) {
    if (!t)
      return se.empty;
    if (t instanceof se)
      return t;
    if (Array.isArray(t))
      return this.fromArray(t);
    if (t.attrs)
      return new se([t], t.nodeSize);
    throw new RangeError("Can not convert " + t + " to a Fragment" + (t.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
  }
};
x.empty = new x([], 0);
const $i = { index: 0, offset: 0 };
function Zn(i, t) {
  return $i.index = i, $i.offset = t, $i;
}
function mi(i, t) {
  if (i === t)
    return !0;
  if (!(i && typeof i == "object") || !(t && typeof t == "object"))
    return !1;
  let n = Array.isArray(i);
  if (Array.isArray(t) != n)
    return !1;
  if (n) {
    if (i.length != t.length)
      return !1;
    for (let r = 0; r < i.length; r++)
      if (!mi(i[r], t[r]))
        return !1;
  } else {
    for (let r in i)
      if (!(r in t) || !mi(i[r], t[r]))
        return !1;
    for (let r in t)
      if (!(r in i))
        return !1;
  }
  return !0;
}
class I {
  /**
  @internal
  */
  constructor(t, n) {
    this.type = t, this.attrs = n;
  }
  /**
  Given a set of marks, create a new set which contains this one as
  well, in the right position. If this mark is already in the set,
  the set itself is returned. If any marks that are set to be
  [exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
  those are replaced by this one.
  */
  addToSet(t) {
    let n, r = !1;
    for (let s = 0; s < t.length; s++) {
      let o = t[s];
      if (this.eq(o))
        return t;
      if (this.type.excludes(o.type))
        n || (n = t.slice(0, s));
      else {
        if (o.type.excludes(this.type))
          return t;
        !r && o.type.rank > this.type.rank && (n || (n = t.slice(0, s)), n.push(this), r = !0), n && n.push(o);
      }
    }
    return n || (n = t.slice()), r || n.push(this), n;
  }
  /**
  Remove this mark from the given set, returning a new set. If this
  mark is not in the set, the set itself is returned.
  */
  removeFromSet(t) {
    for (let n = 0; n < t.length; n++)
      if (this.eq(t[n]))
        return t.slice(0, n).concat(t.slice(n + 1));
    return t;
  }
  /**
  Test whether this mark is in the given set of marks.
  */
  isInSet(t) {
    for (let n = 0; n < t.length; n++)
      if (this.eq(t[n]))
        return !0;
    return !1;
  }
  /**
  Test whether this mark has the same type and attributes as
  another mark.
  */
  eq(t) {
    return this == t || this.type == t.type && mi(this.attrs, t.attrs);
  }
  /**
  Convert this mark to a JSON-serializeable representation.
  */
  toJSON() {
    let t = { type: this.type.name };
    for (let n in this.attrs) {
      t.attrs = this.attrs;
      break;
    }
    return t;
  }
  /**
  Deserialize a mark from JSON.
  */
  static fromJSON(t, n) {
    if (!n)
      throw new RangeError("Invalid input for Mark.fromJSON");
    let r = t.marks[n.type];
    if (!r)
      throw new RangeError(`There is no mark type ${n.type} in this schema`);
    let s = r.create(n.attrs);
    return r.checkAttrs(s.attrs), s;
  }
  /**
  Test whether two sets of marks are identical.
  */
  static sameSet(t, n) {
    if (t == n)
      return !0;
    if (t.length != n.length)
      return !1;
    for (let r = 0; r < t.length; r++)
      if (!t[r].eq(n[r]))
        return !1;
    return !0;
  }
  /**
  Create a properly sorted mark set from null, a single mark, or an
  unsorted array of marks.
  */
  static setFrom(t) {
    if (!t || Array.isArray(t) && t.length == 0)
      return I.none;
    if (t instanceof I)
      return [t];
    let n = t.slice();
    return n.sort((r, s) => r.type.rank - s.type.rank), n;
  }
}
I.none = [];
class qn extends Error {
}
class k {
  /**
  Create a slice. When specifying a non-zero open depth, you must
  make sure that there are nodes of at least that depth at the
  appropriate side of the fragment—i.e. if the fragment is an
  empty paragraph node, `openStart` and `openEnd` can't be greater
  than 1.
  
  It is not necessary for the content of open nodes to conform to
  the schema's content constraints, though it should be a valid
  start/end/middle for such a node, depending on which sides are
  open.
  */
  constructor(t, n, r) {
    this.content = t, this.openStart = n, this.openEnd = r;
  }
  /**
  The size this slice would add when inserted into a document.
  */
  get size() {
    return this.content.size - this.openStart - this.openEnd;
  }
  /**
  @internal
  */
  insertAt(t, n) {
    let r = Oo(this.content, t + this.openStart, n);
    return r && new k(r, this.openStart, this.openEnd);
  }
  /**
  @internal
  */
  removeBetween(t, n) {
    return new k(Ao(this.content, t + this.openStart, n + this.openStart), this.openStart, this.openEnd);
  }
  /**
  Tests whether this slice is equal to another slice.
  */
  eq(t) {
    return this.content.eq(t.content) && this.openStart == t.openStart && this.openEnd == t.openEnd;
  }
  /**
  @internal
  */
  toString() {
    return this.content + "(" + this.openStart + "," + this.openEnd + ")";
  }
  /**
  Convert a slice to a JSON-serializable representation.
  */
  toJSON() {
    if (!this.content.size)
      return null;
    let t = { content: this.content.toJSON() };
    return this.openStart > 0 && (t.openStart = this.openStart), this.openEnd > 0 && (t.openEnd = this.openEnd), t;
  }
  /**
  Deserialize a slice from its JSON representation.
  */
  static fromJSON(t, n) {
    if (!n)
      return k.empty;
    let r = n.openStart || 0, s = n.openEnd || 0;
    if (typeof r != "number" || typeof s != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new k(x.fromJSON(t, n.content), r, s);
  }
  /**
  Create a slice from a fragment by taking the maximum possible
  open value on both side of the fragment.
  */
  static maxOpen(t, n = !0) {
    let r = 0, s = 0;
    for (let o = t.firstChild; o && !o.isLeaf && (n || !o.type.spec.isolating); o = o.firstChild)
      r++;
    for (let o = t.lastChild; o && !o.isLeaf && (n || !o.type.spec.isolating); o = o.lastChild)
      s++;
    return new k(t, r, s);
  }
}
k.empty = new k(x.empty, 0, 0);
function Ao(i, t, n) {
  let { index: r, offset: s } = i.findIndex(t), o = i.maybeChild(r), { index: l, offset: a } = i.findIndex(n);
  if (s == t || o.isText) {
    if (a != n && !i.child(l).isText)
      throw new RangeError("Removing non-flat range");
    return i.cut(0, t).append(i.cut(n));
  }
  if (r != l)
    throw new RangeError("Removing non-flat range");
  return i.replaceChild(r, o.copy(Ao(o.content, t - s - 1, n - s - 1)));
}
function Oo(i, t, n, r) {
  let { index: s, offset: o } = i.findIndex(t), l = i.maybeChild(s);
  if (o == t || l.isText)
    return r && !r.canReplace(s, s, n) ? null : i.cut(0, t).append(n).append(i.cut(t));
  let a = Oo(l.content, t - o - 1, n, l);
  return a && i.replaceChild(s, l.copy(a));
}
function Aa(i, t, n) {
  if (n.openStart > i.depth)
    throw new qn("Inserted content deeper than insertion position");
  if (i.depth - n.openStart != t.depth - n.openEnd)
    throw new qn("Inconsistent open depths");
  return qo(i, t, n, 0);
}
function qo(i, t, n, r) {
  let s = i.index(r), o = i.node(r);
  if (s == t.index(r) && r < i.depth - n.openStart) {
    let l = qo(i, t, n, r + 1);
    return o.copy(o.content.replaceChild(s, l));
  } else if (n.content.size)
    if (!n.openStart && !n.openEnd && i.depth == r && t.depth == r) {
      let l = i.parent, a = l.content;
      return It(l, a.cut(0, i.parentOffset).append(n.content).append(a.cut(t.parentOffset)));
    } else {
      let { start: l, end: a } = Oa(n, i);
      return It(o, zo(i, l, a, t, r));
    }
  else return It(o, gi(i, t, r));
}
function Do(i, t) {
  if (!t.type.compatibleContent(i.type))
    throw new qn("Cannot join " + t.type.name + " onto " + i.type.name);
}
function ar(i, t, n) {
  let r = i.node(n);
  return Do(r, t.node(n)), r;
}
function Rt(i, t) {
  let n = t.length - 1;
  n >= 0 && i.isText && i.sameMarkup(t[n]) ? t[n] = i.withText(t[n].text + i.text) : t.push(i);
}
function En(i, t, n, r) {
  let s = (t || i).node(n), o = 0, l = t ? t.index(n) : s.childCount;
  i && (o = i.index(n), i.depth > n ? o++ : i.textOffset && (Rt(i.nodeAfter, r), o++));
  for (let a = o; a < l; a++)
    Rt(s.child(a), r);
  t && t.depth == n && t.textOffset && Rt(t.nodeBefore, r);
}
function It(i, t) {
  return i.type.checkContent(t), i.copy(t);
}
function zo(i, t, n, r, s) {
  let o = i.depth > s && ar(i, t, s + 1), l = r.depth > s && ar(n, r, s + 1), a = [];
  return En(null, i, s, a), o && l && t.index(s) == n.index(s) ? (Do(o, l), Rt(It(o, zo(i, t, n, r, s + 1)), a)) : (o && Rt(It(o, gi(i, t, s + 1)), a), En(t, n, s, a), l && Rt(It(l, gi(n, r, s + 1)), a)), En(r, null, s, a), new x(a);
}
function gi(i, t, n) {
  let r = [];
  if (En(null, i, n, r), i.depth > n) {
    let s = ar(i, t, n + 1);
    Rt(It(s, gi(i, t, n + 1)), r);
  }
  return En(t, null, n, r), new x(r);
}
function Oa(i, t) {
  let n = t.depth - i.openStart, s = t.node(n).copy(i.content);
  for (let o = n - 1; o >= 0; o--)
    s = t.node(o).copy(x.from(s));
  return {
    start: s.resolveNoCache(i.openStart + n),
    end: s.resolveNoCache(s.content.size - i.openEnd - n)
  };
}
class rn {
  /**
  @internal
  */
  constructor(t, n, r) {
    this.pos = t, this.path = n, this.parentOffset = r, this.depth = n.length / 3 - 1;
  }
  /**
  @internal
  */
  resolveDepth(t) {
    return t == null ? this.depth : t < 0 ? this.depth + t : t;
  }
  /**
  The parent node that the position points into. Note that even if
  a position points into a text node, that node is not considered
  the parent—text nodes are ‘flat’ in this model, and have no content.
  */
  get parent() {
    return this.node(this.depth);
  }
  /**
  The root node in which the position was resolved.
  */
  get doc() {
    return this.node(0);
  }
  /**
  The ancestor node at the given level. `p.node(p.depth)` is the
  same as `p.parent`.
  */
  node(t) {
    return this.path[this.resolveDepth(t) * 3];
  }
  /**
  The index into the ancestor at the given level. If this points
  at the 3rd node in the 2nd paragraph on the top level, for
  example, `p.index(0)` is 1 and `p.index(1)` is 2.
  */
  index(t) {
    return this.path[this.resolveDepth(t) * 3 + 1];
  }
  /**
  The index pointing after this position into the ancestor at the
  given level.
  */
  indexAfter(t) {
    return t = this.resolveDepth(t), this.index(t) + (t == this.depth && !this.textOffset ? 0 : 1);
  }
  /**
  The (absolute) position at the start of the node at the given
  level.
  */
  start(t) {
    return t = this.resolveDepth(t), t == 0 ? 0 : this.path[t * 3 - 1] + 1;
  }
  /**
  The (absolute) position at the end of the node at the given
  level.
  */
  end(t) {
    return t = this.resolveDepth(t), this.start(t) + this.node(t).content.size;
  }
  /**
  The (absolute) position directly before the wrapping node at the
  given level, or, when `depth` is `this.depth + 1`, the original
  position.
  */
  before(t) {
    if (t = this.resolveDepth(t), !t)
      throw new RangeError("There is no position before the top-level node");
    return t == this.depth + 1 ? this.pos : this.path[t * 3 - 1];
  }
  /**
  The (absolute) position directly after the wrapping node at the
  given level, or the original position when `depth` is `this.depth + 1`.
  */
  after(t) {
    if (t = this.resolveDepth(t), !t)
      throw new RangeError("There is no position after the top-level node");
    return t == this.depth + 1 ? this.pos : this.path[t * 3 - 1] + this.path[t * 3].nodeSize;
  }
  /**
  When this position points into a text node, this returns the
  distance between the position and the start of the text node.
  Will be zero for positions that point between nodes.
  */
  get textOffset() {
    return this.pos - this.path[this.path.length - 1];
  }
  /**
  Get the node directly after the position, if any. If the position
  points into a text node, only the part of that node after the
  position is returned.
  */
  get nodeAfter() {
    let t = this.parent, n = this.index(this.depth);
    if (n == t.childCount)
      return null;
    let r = this.pos - this.path[this.path.length - 1], s = t.child(n);
    return r ? t.child(n).cut(r) : s;
  }
  /**
  Get the node directly before the position, if any. If the
  position points into a text node, only the part of that node
  before the position is returned.
  */
  get nodeBefore() {
    let t = this.index(this.depth), n = this.pos - this.path[this.path.length - 1];
    return n ? this.parent.child(t).cut(0, n) : t == 0 ? null : this.parent.child(t - 1);
  }
  /**
  Get the position at the given index in the parent node at the
  given depth (which defaults to `this.depth`).
  */
  posAtIndex(t, n) {
    n = this.resolveDepth(n);
    let r = this.path[n * 3], s = n == 0 ? 0 : this.path[n * 3 - 1] + 1;
    for (let o = 0; o < t; o++)
      s += r.child(o).nodeSize;
    return s;
  }
  /**
  Get the marks at this position, factoring in the surrounding
  marks' [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) property. If the
  position is at the start of a non-empty node, the marks of the
  node after it (if any) are returned.
  */
  marks() {
    let t = this.parent, n = this.index();
    if (t.content.size == 0)
      return I.none;
    if (this.textOffset)
      return t.child(n).marks;
    let r = t.maybeChild(n - 1), s = t.maybeChild(n);
    if (!r) {
      let a = r;
      r = s, s = a;
    }
    let o = r.marks;
    for (var l = 0; l < o.length; l++)
      o[l].type.spec.inclusive === !1 && (!s || !o[l].isInSet(s.marks)) && (o = o[l--].removeFromSet(o));
    return o;
  }
  /**
  Get the marks after the current position, if any, except those
  that are non-inclusive and not present at position `$end`. This
  is mostly useful for getting the set of marks to preserve after a
  deletion. Will return `null` if this position is at the end of
  its parent node or its parent node isn't a textblock (in which
  case no marks should be preserved).
  */
  marksAcross(t) {
    let n = this.parent.maybeChild(this.index());
    if (!n || !n.isInline)
      return null;
    let r = n.marks, s = t.parent.maybeChild(t.index());
    for (var o = 0; o < r.length; o++)
      r[o].type.spec.inclusive === !1 && (!s || !r[o].isInSet(s.marks)) && (r = r[o--].removeFromSet(r));
    return r;
  }
  /**
  The depth up to which this position and the given (non-resolved)
  position share the same parent nodes.
  */
  sharedDepth(t) {
    for (let n = this.depth; n > 0; n--)
      if (this.start(n) <= t && this.end(n) >= t)
        return n;
    return 0;
  }
  /**
  Returns a range based on the place where this position and the
  given position diverge around block content. If both point into
  the same textblock, for example, a range around that textblock
  will be returned. If they point into different blocks, the range
  around those blocks in their shared ancestor is returned. You can
  pass in an optional predicate that will be called with a parent
  node to see if a range into that parent is acceptable.
  */
  blockRange(t = this, n) {
    if (t.pos < this.pos)
      return t.blockRange(this);
    for (let r = this.depth - (this.parent.inlineContent || this.pos == t.pos ? 1 : 0); r >= 0; r--)
      if (t.pos <= this.end(r) && (!n || n(this.node(r))))
        return new yi(this, t, r);
    return null;
  }
  /**
  Query whether the given position shares the same parent node.
  */
  sameParent(t) {
    return this.pos - this.parentOffset == t.pos - t.parentOffset;
  }
  /**
  Return the greater of this and the given position.
  */
  max(t) {
    return t.pos > this.pos ? t : this;
  }
  /**
  Return the smaller of this and the given position.
  */
  min(t) {
    return t.pos < this.pos ? t : this;
  }
  /**
  @internal
  */
  toString() {
    let t = "";
    for (let n = 1; n <= this.depth; n++)
      t += (t ? "/" : "") + this.node(n).type.name + "_" + this.index(n - 1);
    return t + ":" + this.parentOffset;
  }
  /**
  @internal
  */
  static resolve(t, n) {
    if (!(n >= 0 && n <= t.content.size))
      throw new RangeError("Position " + n + " out of range");
    let r = [], s = 0, o = n;
    for (let l = t; ; ) {
      let { index: a, offset: c } = l.content.findIndex(o), u = o - c;
      if (r.push(l, a, s + c), !u || (l = l.child(a), l.isText))
        break;
      o = u - 1, s += c + 1;
    }
    return new rn(n, r, o);
  }
  /**
  @internal
  */
  static resolveCached(t, n) {
    let r = ss.get(t);
    if (r)
      for (let o = 0; o < r.elts.length; o++) {
        let l = r.elts[o];
        if (l.pos == n)
          return l;
      }
    else
      ss.set(t, r = new qa());
    let s = r.elts[r.i] = rn.resolve(t, n);
    return r.i = (r.i + 1) % Da, s;
  }
}
class qa {
  constructor() {
    this.elts = [], this.i = 0;
  }
}
const Da = 12, ss = /* @__PURE__ */ new WeakMap();
class yi {
  /**
  Construct a node range. `$from` and `$to` should point into the
  same node until at least the given `depth`, since a node range
  denotes an adjacent set of nodes in a single parent node.
  */
  constructor(t, n, r) {
    this.$from = t, this.$to = n, this.depth = r;
  }
  /**
  The position at the start of the range.
  */
  get start() {
    return this.$from.before(this.depth + 1);
  }
  /**
  The position at the end of the range.
  */
  get end() {
    return this.$to.after(this.depth + 1);
  }
  /**
  The parent node that the range points into.
  */
  get parent() {
    return this.$from.node(this.depth);
  }
  /**
  The start index of the range in the parent node.
  */
  get startIndex() {
    return this.$from.index(this.depth);
  }
  /**
  The end index of the range in the parent node.
  */
  get endIndex() {
    return this.$to.indexAfter(this.depth);
  }
}
const za = /* @__PURE__ */ Object.create(null);
let ft = class cr {
  /**
  @internal
  */
  constructor(t, n, r, s = I.none) {
    this.type = t, this.attrs = n, this.marks = s, this.content = r || x.empty;
  }
  /**
  The array of this node's child nodes.
  */
  get children() {
    return this.content.content;
  }
  /**
  The size of this node, as defined by the integer-based [indexing
  scheme](https://prosemirror.net/docs/guide/#doc.indexing). For text nodes, this is the
  amount of characters. For other leaf nodes, it is one. For
  non-leaf nodes, it is the size of the content plus two (the
  start and end token).
  */
  get nodeSize() {
    return this.isLeaf ? 1 : 2 + this.content.size;
  }
  /**
  The number of children that the node has.
  */
  get childCount() {
    return this.content.childCount;
  }
  /**
  Get the child node at the given index. Raises an error when the
  index is out of range.
  */
  child(t) {
    return this.content.child(t);
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(t) {
    return this.content.maybeChild(t);
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(t) {
    this.content.forEach(t);
  }
  /**
  Invoke a callback for all descendant nodes recursively between
  the given two positions that are relative to start of this
  node's content. The callback is invoked with the node, its
  position relative to the original node (method receiver),
  its parent node, and its child index. When the callback returns
  false for a given node, that node's children will not be
  recursed over. The last parameter can be used to specify a
  starting position to count from.
  */
  nodesBetween(t, n, r, s = 0) {
    this.content.nodesBetween(t, n, r, s, this);
  }
  /**
  Call the given callback for every descendant node. Doesn't
  descend into a node when the callback returns `false`.
  */
  descendants(t) {
    this.nodesBetween(0, this.content.size, t);
  }
  /**
  Concatenates all the text nodes found in this fragment and its
  children.
  */
  get textContent() {
    return this.isLeaf && this.type.spec.leafText ? this.type.spec.leafText(this) : this.textBetween(0, this.content.size, "");
  }
  /**
  Get all text between positions `from` and `to`. When
  `blockSeparator` is given, it will be inserted to separate text
  from different block nodes. If `leafText` is given, it'll be
  inserted for every non-text leaf node encountered, otherwise
  [`leafText`](https://prosemirror.net/docs/ref/#model.NodeSpec.leafText) will be used.
  */
  textBetween(t, n, r, s) {
    return this.content.textBetween(t, n, r, s);
  }
  /**
  Returns this node's first child, or `null` if there are no
  children.
  */
  get firstChild() {
    return this.content.firstChild;
  }
  /**
  Returns this node's last child, or `null` if there are no
  children.
  */
  get lastChild() {
    return this.content.lastChild;
  }
  /**
  Test whether two nodes represent the same piece of document.
  */
  eq(t) {
    return this == t || this.sameMarkup(t) && this.content.eq(t.content);
  }
  /**
  Compare the markup (type, attributes, and marks) of this node to
  those of another. Returns `true` if both have the same markup.
  */
  sameMarkup(t) {
    return this.hasMarkup(t.type, t.attrs, t.marks);
  }
  /**
  Check whether this node's markup correspond to the given type,
  attributes, and marks.
  */
  hasMarkup(t, n, r) {
    return this.type == t && mi(this.attrs, n || t.defaultAttrs || za) && I.sameSet(this.marks, r || I.none);
  }
  /**
  Create a new node with the same markup as this node, containing
  the given content (or empty, if no content is given).
  */
  copy(t = null) {
    return t == this.content ? this : new cr(this.type, this.attrs, t, this.marks);
  }
  /**
  Create a copy of this node, with the given set of marks instead
  of the node's own marks.
  */
  mark(t) {
    return t == this.marks ? this : new cr(this.type, this.attrs, this.content, t);
  }
  /**
  Create a copy of this node with only the content between the
  given positions. If `to` is not given, it defaults to the end of
  the node.
  */
  cut(t, n = this.content.size) {
    return t == 0 && n == this.content.size ? this : this.copy(this.content.cut(t, n));
  }
  /**
  Cut out the part of the document between the given positions, and
  return it as a `Slice` object.
  */
  slice(t, n = this.content.size, r = !1) {
    if (t == n)
      return k.empty;
    let s = this.resolve(t), o = this.resolve(n), l = r ? 0 : s.sharedDepth(n), a = s.start(l), u = s.node(l).content.cut(s.pos - a, o.pos - a);
    return new k(u, s.depth - l, o.depth - l);
  }
  /**
  Replace the part of the document between the given positions with
  the given slice. The slice must 'fit', meaning its open sides
  must be able to connect to the surrounding content, and its
  content nodes must be valid children for the node they are placed
  into. If any of this is violated, an error of type
  [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
  */
  replace(t, n, r) {
    return Aa(this.resolve(t), this.resolve(n), r);
  }
  /**
  Find the node directly after the given position.
  */
  nodeAt(t) {
    for (let n = this; ; ) {
      let { index: r, offset: s } = n.content.findIndex(t);
      if (n = n.maybeChild(r), !n)
        return null;
      if (s == t || n.isText)
        return n;
      t -= s + 1;
    }
  }
  /**
  Find the (direct) child node after the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childAfter(t) {
    let { index: n, offset: r } = this.content.findIndex(t);
    return { node: this.content.maybeChild(n), index: n, offset: r };
  }
  /**
  Find the (direct) child node before the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childBefore(t) {
    if (t == 0)
      return { node: null, index: 0, offset: 0 };
    let { index: n, offset: r } = this.content.findIndex(t);
    if (r < t)
      return { node: this.content.child(n), index: n, offset: r };
    let s = this.content.child(n - 1);
    return { node: s, index: n - 1, offset: r - s.nodeSize };
  }
  /**
  Resolve the given position in the document, returning an
  [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
  */
  resolve(t) {
    return rn.resolveCached(this, t);
  }
  /**
  @internal
  */
  resolveNoCache(t) {
    return rn.resolve(this, t);
  }
  /**
  Test whether a given mark or mark type occurs in this document
  between the two given positions.
  */
  rangeHasMark(t, n, r) {
    let s = !1;
    return n > t && this.nodesBetween(t, n, (o) => (r.isInSet(o.marks) && (s = !0), !s)), s;
  }
  /**
  True when this is a block (non-inline node)
  */
  get isBlock() {
    return this.type.isBlock;
  }
  /**
  True when this is a textblock node, a block node with inline
  content.
  */
  get isTextblock() {
    return this.type.isTextblock;
  }
  /**
  True when this node allows inline content.
  */
  get inlineContent() {
    return this.type.inlineContent;
  }
  /**
  True when this is an inline node (a text node or a node that can
  appear among text).
  */
  get isInline() {
    return this.type.isInline;
  }
  /**
  True when this is a text node.
  */
  get isText() {
    return this.type.isText;
  }
  /**
  True when this is a leaf node.
  */
  get isLeaf() {
    return this.type.isLeaf;
  }
  /**
  True when this is an atom, i.e. when it does not have directly
  editable content. This is usually the same as `isLeaf`, but can
  be configured with the [`atom` property](https://prosemirror.net/docs/ref/#model.NodeSpec.atom)
  on a node's spec (typically used when the node is displayed as
  an uneditable [node view](https://prosemirror.net/docs/ref/#view.NodeView)).
  */
  get isAtom() {
    return this.type.isAtom;
  }
  /**
  Return a string representation of this node for debugging
  purposes.
  */
  toString() {
    if (this.type.spec.toDebugString)
      return this.type.spec.toDebugString(this);
    let t = this.type.name;
    return this.content.size && (t += "(" + this.content.toStringInner() + ")"), Ro(this.marks, t);
  }
  /**
  Get the content match in this node at the given index.
  */
  contentMatchAt(t) {
    let n = this.type.contentMatch.matchFragment(this.content, 0, t);
    if (!n)
      throw new Error("Called contentMatchAt on a node with invalid content");
    return n;
  }
  /**
  Test whether replacing the range between `from` and `to` (by
  child index) with the given replacement fragment (which defaults
  to the empty fragment) would leave the node's content valid. You
  can optionally pass `start` and `end` indices into the
  replacement fragment.
  */
  canReplace(t, n, r = x.empty, s = 0, o = r.childCount) {
    let l = this.contentMatchAt(t).matchFragment(r, s, o), a = l && l.matchFragment(this.content, n);
    if (!a || !a.validEnd)
      return !1;
    for (let c = s; c < o; c++)
      if (!this.type.allowsMarks(r.child(c).marks))
        return !1;
    return !0;
  }
  /**
  Test whether replacing the range `from` to `to` (by index) with
  a node of the given type would leave the node's content valid.
  */
  canReplaceWith(t, n, r, s) {
    if (s && !this.type.allowsMarks(s))
      return !1;
    let o = this.contentMatchAt(t).matchType(r), l = o && o.matchFragment(this.content, n);
    return l ? l.validEnd : !1;
  }
  /**
  Test whether the given node's content could be appended to this
  node. If that node is empty, this will only return true if there
  is at least one node type that can appear in both nodes (to avoid
  merging completely incompatible nodes).
  */
  canAppend(t) {
    return t.content.size ? this.canReplace(this.childCount, this.childCount, t.content) : this.type.compatibleContent(t.type);
  }
  /**
  Check whether this node and its descendants conform to the
  schema, and raise an exception when they do not.
  */
  check() {
    this.type.checkContent(this.content), this.type.checkAttrs(this.attrs);
    let t = I.none;
    for (let n = 0; n < this.marks.length; n++) {
      let r = this.marks[n];
      r.type.checkAttrs(r.attrs), t = r.addToSet(t);
    }
    if (!I.sameSet(t, this.marks))
      throw new RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((n) => n.type.name)}`);
    this.content.forEach((n) => n.check());
  }
  /**
  Return a JSON-serializeable representation of this node.
  */
  toJSON() {
    let t = { type: this.type.name };
    for (let n in this.attrs) {
      t.attrs = this.attrs;
      break;
    }
    return this.content.size && (t.content = this.content.toJSON()), this.marks.length && (t.marks = this.marks.map((n) => n.toJSON())), t;
  }
  /**
  Deserialize a node from its JSON representation.
  */
  static fromJSON(t, n) {
    if (!n)
      throw new RangeError("Invalid input for Node.fromJSON");
    let r;
    if (n.marks) {
      if (!Array.isArray(n.marks))
        throw new RangeError("Invalid mark data for Node.fromJSON");
      r = n.marks.map(t.markFromJSON);
    }
    if (n.type == "text") {
      if (typeof n.text != "string")
        throw new RangeError("Invalid text node in JSON");
      return t.text(n.text, r);
    }
    let s = x.fromJSON(t, n.content), o = t.nodeType(n.type).create(n.attrs, s, r);
    return o.type.checkAttrs(o.attrs), o;
  }
};
ft.prototype.text = void 0;
class bi extends ft {
  /**
  @internal
  */
  constructor(t, n, r, s) {
    if (super(t, n, null, s), !r)
      throw new RangeError("Empty text nodes are not allowed");
    this.text = r;
  }
  toString() {
    return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : Ro(this.marks, JSON.stringify(this.text));
  }
  get textContent() {
    return this.text;
  }
  textBetween(t, n) {
    return this.text.slice(t, n);
  }
  get nodeSize() {
    return this.text.length;
  }
  mark(t) {
    return t == this.marks ? this : new bi(this.type, this.attrs, this.text, t);
  }
  withText(t) {
    return t == this.text ? this : new bi(this.type, this.attrs, t, this.marks);
  }
  cut(t = 0, n = this.text.length) {
    return t == 0 && n == this.text.length ? this : this.withText(this.text.slice(t, n));
  }
  eq(t) {
    return this.sameMarkup(t) && this.text == t.text;
  }
  toJSON() {
    let t = super.toJSON();
    return t.text = this.text, t;
  }
}
function Ro(i, t) {
  for (let n = i.length - 1; n >= 0; n--)
    t = i[n].type.name + "(" + t + ")";
  return t;
}
class vt {
  /**
  @internal
  */
  constructor(t) {
    this.validEnd = t, this.next = [], this.wrapCache = [];
  }
  /**
  @internal
  */
  static parse(t, n) {
    let r = new Ra(t, n);
    if (r.next == null)
      return vt.empty;
    let s = Io(r);
    r.next && r.err("Unexpected trailing text");
    let o = Ha(Va(s));
    return $a(o, r), o;
  }
  /**
  Match a node type, returning a match after that node if
  successful.
  */
  matchType(t) {
    for (let n = 0; n < this.next.length; n++)
      if (this.next[n].type == t)
        return this.next[n].next;
    return null;
  }
  /**
  Try to match a fragment. Returns the resulting match when
  successful.
  */
  matchFragment(t, n = 0, r = t.childCount) {
    let s = this;
    for (let o = n; s && o < r; o++)
      s = s.matchType(t.child(o).type);
    return s;
  }
  /**
  @internal
  */
  get inlineContent() {
    return this.next.length != 0 && this.next[0].type.isInline;
  }
  /**
  Get the first matching node type at this match position that can
  be generated.
  */
  get defaultType() {
    for (let t = 0; t < this.next.length; t++) {
      let { type: n } = this.next[t];
      if (!(n.isText || n.hasRequiredAttrs()))
        return n;
    }
    return null;
  }
  /**
  @internal
  */
  compatible(t) {
    for (let n = 0; n < this.next.length; n++)
      for (let r = 0; r < t.next.length; r++)
        if (this.next[n].type == t.next[r].type)
          return !0;
    return !1;
  }
  /**
  Try to match the given fragment, and if that fails, see if it can
  be made to match by inserting nodes in front of it. When
  successful, return a fragment of inserted nodes (which may be
  empty if nothing had to be inserted). When `toEnd` is true, only
  return a fragment if the resulting match goes to the end of the
  content expression.
  */
  fillBefore(t, n = !1, r = 0) {
    let s = [this];
    function o(l, a) {
      let c = l.matchFragment(t, r);
      if (c && (!n || c.validEnd))
        return x.from(a.map((u) => u.createAndFill()));
      for (let u = 0; u < l.next.length; u++) {
        let { type: d, next: h } = l.next[u];
        if (!(d.isText || d.hasRequiredAttrs()) && s.indexOf(h) == -1) {
          s.push(h);
          let f = o(h, a.concat(d));
          if (f)
            return f;
        }
      }
      return null;
    }
    return o(this, []);
  }
  /**
  Find a set of wrapping node types that would allow a node of the
  given type to appear at this position. The result may be empty
  (when it fits directly) and will be null when no such wrapping
  exists.
  */
  findWrapping(t) {
    for (let r = 0; r < this.wrapCache.length; r += 2)
      if (this.wrapCache[r] == t)
        return this.wrapCache[r + 1];
    let n = this.computeWrapping(t);
    return this.wrapCache.push(t, n), n;
  }
  /**
  @internal
  */
  computeWrapping(t) {
    let n = /* @__PURE__ */ Object.create(null), r = [{ match: this, type: null, via: null }];
    for (; r.length; ) {
      let s = r.shift(), o = s.match;
      if (o.matchType(t)) {
        let l = [];
        for (let a = s; a.type; a = a.via)
          l.push(a.type);
        return l.reverse();
      }
      for (let l = 0; l < o.next.length; l++) {
        let { type: a, next: c } = o.next[l];
        !a.isLeaf && !a.hasRequiredAttrs() && !(a.name in n) && (!s.type || c.validEnd) && (r.push({ match: a.contentMatch, type: a, via: s }), n[a.name] = !0);
      }
    }
    return null;
  }
  /**
  The number of outgoing edges this node has in the finite
  automaton that describes the content expression.
  */
  get edgeCount() {
    return this.next.length;
  }
  /**
  Get the _n_​th outgoing edge from this node in the finite
  automaton that describes the content expression.
  */
  edge(t) {
    if (t >= this.next.length)
      throw new RangeError(`There's no ${t}th edge in this content match`);
    return this.next[t];
  }
  /**
  @internal
  */
  toString() {
    let t = [];
    function n(r) {
      t.push(r);
      for (let s = 0; s < r.next.length; s++)
        t.indexOf(r.next[s].next) == -1 && n(r.next[s].next);
    }
    return n(this), t.map((r, s) => {
      let o = s + (r.validEnd ? "*" : " ") + " ";
      for (let l = 0; l < r.next.length; l++)
        o += (l ? ", " : "") + r.next[l].type.name + "->" + t.indexOf(r.next[l].next);
      return o;
    }).join(`
`);
  }
}
vt.empty = new vt(!0);
class Ra {
  constructor(t, n) {
    this.string = t, this.nodeTypes = n, this.inline = null, this.pos = 0, this.tokens = t.split(/\s*(?=\b|\W|$)/), this.tokens[this.tokens.length - 1] == "" && this.tokens.pop(), this.tokens[0] == "" && this.tokens.shift();
  }
  get next() {
    return this.tokens[this.pos];
  }
  eat(t) {
    return this.next == t && (this.pos++ || !0);
  }
  err(t) {
    throw new SyntaxError(t + " (in content expression '" + this.string + "')");
  }
}
function Io(i) {
  let t = [];
  do
    t.push(Ia(i));
  while (i.eat("|"));
  return t.length == 1 ? t[0] : { type: "choice", exprs: t };
}
function Ia(i) {
  let t = [];
  do
    t.push(La(i));
  while (i.next && i.next != ")" && i.next != "|");
  return t.length == 1 ? t[0] : { type: "seq", exprs: t };
}
function La(i) {
  let t = Fa(i);
  for (; ; )
    if (i.eat("+"))
      t = { type: "plus", expr: t };
    else if (i.eat("*"))
      t = { type: "star", expr: t };
    else if (i.eat("?"))
      t = { type: "opt", expr: t };
    else if (i.eat("{"))
      t = Ba(i, t);
    else
      break;
  return t;
}
function ls(i) {
  /\D/.test(i.next) && i.err("Expected number, got '" + i.next + "'");
  let t = Number(i.next);
  return i.pos++, t;
}
function Ba(i, t) {
  let n = ls(i), r = n;
  return i.eat(",") && (i.next != "}" ? r = ls(i) : r = -1), i.eat("}") || i.err("Unclosed braced range"), { type: "range", min: n, max: r, expr: t };
}
function Pa(i, t) {
  let n = i.nodeTypes, r = n[t];
  if (r)
    return [r];
  let s = [];
  for (let o in n) {
    let l = n[o];
    l.isInGroup(t) && s.push(l);
  }
  return s.length == 0 && i.err("No node type or group '" + t + "' found"), s;
}
function Fa(i) {
  if (i.eat("(")) {
    let t = Io(i);
    return i.eat(")") || i.err("Missing closing paren"), t;
  } else if (/\W/.test(i.next))
    i.err("Unexpected token '" + i.next + "'");
  else {
    let t = Pa(i, i.next).map((n) => (i.inline == null ? i.inline = n.isInline : i.inline != n.isInline && i.err("Mixing inline and block content"), { type: "name", value: n }));
    return i.pos++, t.length == 1 ? t[0] : { type: "choice", exprs: t };
  }
}
function Va(i) {
  let t = [[]];
  return s(o(i, 0), n()), t;
  function n() {
    return t.push([]) - 1;
  }
  function r(l, a, c) {
    let u = { term: c, to: a };
    return t[l].push(u), u;
  }
  function s(l, a) {
    l.forEach((c) => c.to = a);
  }
  function o(l, a) {
    if (l.type == "choice")
      return l.exprs.reduce((c, u) => c.concat(o(u, a)), []);
    if (l.type == "seq")
      for (let c = 0; ; c++) {
        let u = o(l.exprs[c], a);
        if (c == l.exprs.length - 1)
          return u;
        s(u, a = n());
      }
    else if (l.type == "star") {
      let c = n();
      return r(a, c), s(o(l.expr, c), c), [r(c)];
    } else if (l.type == "plus") {
      let c = n();
      return s(o(l.expr, a), c), s(o(l.expr, c), c), [r(c)];
    } else {
      if (l.type == "opt")
        return [r(a)].concat(o(l.expr, a));
      if (l.type == "range") {
        let c = a;
        for (let u = 0; u < l.min; u++) {
          let d = n();
          s(o(l.expr, c), d), c = d;
        }
        if (l.max == -1)
          s(o(l.expr, c), c);
        else
          for (let u = l.min; u < l.max; u++) {
            let d = n();
            r(c, d), s(o(l.expr, c), d), c = d;
          }
        return [r(c)];
      } else {
        if (l.type == "name")
          return [r(a, void 0, l.value)];
        throw new Error("Unknown expr type");
      }
    }
  }
}
function Lo(i, t) {
  return t - i;
}
function as(i, t) {
  let n = [];
  return r(t), n.sort(Lo);
  function r(s) {
    let o = i[s];
    if (o.length == 1 && !o[0].term)
      return r(o[0].to);
    n.push(s);
    for (let l = 0; l < o.length; l++) {
      let { term: a, to: c } = o[l];
      !a && n.indexOf(c) == -1 && r(c);
    }
  }
}
function Ha(i) {
  let t = /* @__PURE__ */ Object.create(null);
  return n(as(i, 0));
  function n(r) {
    let s = [];
    r.forEach((l) => {
      i[l].forEach(({ term: a, to: c }) => {
        if (!a)
          return;
        let u;
        for (let d = 0; d < s.length; d++)
          s[d][0] == a && (u = s[d][1]);
        as(i, c).forEach((d) => {
          u || s.push([a, u = []]), u.indexOf(d) == -1 && u.push(d);
        });
      });
    });
    let o = t[r.join(",")] = new vt(r.indexOf(i.length - 1) > -1);
    for (let l = 0; l < s.length; l++) {
      let a = s[l][1].sort(Lo);
      o.next.push({ type: s[l][0], next: t[a.join(",")] || n(a) });
    }
    return o;
  }
}
function $a(i, t) {
  for (let n = 0, r = [i]; n < r.length; n++) {
    let s = r[n], o = !s.validEnd, l = [];
    for (let a = 0; a < s.next.length; a++) {
      let { type: c, next: u } = s.next[a];
      l.push(c.name), o && !(c.isText || c.hasRequiredAttrs()) && (o = !1), r.indexOf(u) == -1 && r.push(u);
    }
    o && t.err("Only non-generatable nodes (" + l.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
  }
}
function Bo(i) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let n in i) {
    let r = i[n];
    if (!r.hasDefault)
      return null;
    t[n] = r.default;
  }
  return t;
}
function Po(i, t) {
  let n = /* @__PURE__ */ Object.create(null);
  for (let r in i) {
    let s = t && t[r];
    if (s === void 0) {
      let o = i[r];
      if (o.hasDefault)
        s = o.default;
      else
        throw new RangeError("No value supplied for attribute " + r);
    }
    n[r] = s;
  }
  return n;
}
function Fo(i, t, n, r) {
  for (let s in t)
    if (!(s in i))
      throw new RangeError(`Unsupported attribute ${s} for ${n} of type ${s}`);
  for (let s in i) {
    let o = i[s];
    o.validate && o.validate(t[s]);
  }
}
function Vo(i, t) {
  let n = /* @__PURE__ */ Object.create(null);
  if (t)
    for (let r in t)
      n[r] = new Ua(i, r, t[r]);
  return n;
}
let ur = class Ho {
  /**
  @internal
  */
  constructor(t, n, r) {
    this.name = t, this.schema = n, this.spec = r, this.markSet = null, this.groups = r.group ? r.group.split(" ") : [], this.attrs = Vo(t, r.attrs), this.defaultAttrs = Bo(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(r.inline || t == "text"), this.isText = t == "text";
  }
  /**
  True if this is an inline type.
  */
  get isInline() {
    return !this.isBlock;
  }
  /**
  True if this is a textblock type, a block that contains inline
  content.
  */
  get isTextblock() {
    return this.isBlock && this.inlineContent;
  }
  /**
  True for node types that allow no content.
  */
  get isLeaf() {
    return this.contentMatch == vt.empty;
  }
  /**
  True when this node is an atom, i.e. when it does not have
  directly editable content.
  */
  get isAtom() {
    return this.isLeaf || !!this.spec.atom;
  }
  /**
  Return true when this node type is part of the given
  [group](https://prosemirror.net/docs/ref/#model.NodeSpec.group).
  */
  isInGroup(t) {
    return this.groups.indexOf(t) > -1;
  }
  /**
  The node type's [whitespace](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) option.
  */
  get whitespace() {
    return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
  }
  /**
  Tells you whether this node type has any required attributes.
  */
  hasRequiredAttrs() {
    for (let t in this.attrs)
      if (this.attrs[t].isRequired)
        return !0;
    return !1;
  }
  /**
  Indicates whether this node allows some of the same content as
  the given node type.
  */
  compatibleContent(t) {
    return this == t || this.contentMatch.compatible(t.contentMatch);
  }
  /**
  @internal
  */
  computeAttrs(t) {
    return !t && this.defaultAttrs ? this.defaultAttrs : Po(this.attrs, t);
  }
  /**
  Create a `Node` of this type. The given attributes are
  checked and defaulted (you can pass `null` to use the type's
  defaults entirely, if no required attributes exist). `content`
  may be a `Fragment`, a node, an array of nodes, or
  `null`. Similarly `marks` may be `null` to default to the empty
  set of marks.
  */
  create(t = null, n, r) {
    if (this.isText)
      throw new Error("NodeType.create can't construct text nodes");
    return new ft(this, this.computeAttrs(t), x.from(n), I.setFrom(r));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
  against the node type's content restrictions, and throw an error
  if it doesn't match.
  */
  createChecked(t = null, n, r) {
    return n = x.from(n), this.checkContent(n), new ft(this, this.computeAttrs(t), n, I.setFrom(r));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
  necessary to add nodes to the start or end of the given fragment
  to make it fit the node. If no fitting wrapping can be found,
  return null. Note that, due to the fact that required nodes can
  always be created, this will always succeed if you pass null or
  `Fragment.empty` as content.
  */
  createAndFill(t = null, n, r) {
    if (t = this.computeAttrs(t), n = x.from(n), n.size) {
      let l = this.contentMatch.fillBefore(n);
      if (!l)
        return null;
      n = l.append(n);
    }
    let s = this.contentMatch.matchFragment(n), o = s && s.fillBefore(x.empty, !0);
    return o ? new ft(this, t, n.append(o), I.setFrom(r)) : null;
  }
  /**
  Returns true if the given fragment is valid content for this node
  type.
  */
  validContent(t) {
    let n = this.contentMatch.matchFragment(t);
    if (!n || !n.validEnd)
      return !1;
    for (let r = 0; r < t.childCount; r++)
      if (!this.allowsMarks(t.child(r).marks))
        return !1;
    return !0;
  }
  /**
  Throws a RangeError if the given fragment is not valid content for this
  node type.
  @internal
  */
  checkContent(t) {
    if (!this.validContent(t))
      throw new RangeError(`Invalid content for node ${this.name}: ${t.toString().slice(0, 50)}`);
  }
  /**
  @internal
  */
  checkAttrs(t) {
    Fo(this.attrs, t, "node", this.name);
  }
  /**
  Check whether the given mark type is allowed in this node.
  */
  allowsMarkType(t) {
    return this.markSet == null || this.markSet.indexOf(t) > -1;
  }
  /**
  Test whether the given set of marks are allowed in this node.
  */
  allowsMarks(t) {
    if (this.markSet == null)
      return !0;
    for (let n = 0; n < t.length; n++)
      if (!this.allowsMarkType(t[n].type))
        return !1;
    return !0;
  }
  /**
  Removes the marks that are not allowed in this node from the given set.
  */
  allowedMarks(t) {
    if (this.markSet == null)
      return t;
    let n;
    for (let r = 0; r < t.length; r++)
      this.allowsMarkType(t[r].type) ? n && n.push(t[r]) : n || (n = t.slice(0, r));
    return n ? n.length ? n : I.none : t;
  }
  /**
  @internal
  */
  static compile(t, n) {
    let r = /* @__PURE__ */ Object.create(null);
    t.forEach((o, l) => r[o] = new Ho(o, n, l));
    let s = n.spec.topNode || "doc";
    if (!r[s])
      throw new RangeError("Schema is missing its top node type ('" + s + "')");
    if (!r.text)
      throw new RangeError("Every schema needs a 'text' type");
    for (let o in r.text.attrs)
      throw new RangeError("The text node type should not have attributes");
    return r;
  }
};
function Wa(i, t, n) {
  let r = n.split("|");
  return (s) => {
    let o = s === null ? "null" : typeof s;
    if (r.indexOf(o) < 0)
      throw new RangeError(`Expected value of type ${r} for attribute ${t} on type ${i}, got ${o}`);
  };
}
class Ua {
  constructor(t, n, r) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(r, "default"), this.default = r.default, this.validate = typeof r.validate == "string" ? Wa(t, n, r.validate) : r.validate;
  }
  get isRequired() {
    return !this.hasDefault;
  }
}
class Fn {
  /**
  @internal
  */
  constructor(t, n, r, s) {
    this.name = t, this.rank = n, this.schema = r, this.spec = s, this.attrs = Vo(t, s.attrs), this.excluded = null;
    let o = Bo(this.attrs);
    this.instance = o ? new I(this, o) : null;
  }
  /**
  Create a mark of this type. `attrs` may be `null` or an object
  containing only some of the mark's attributes. The others, if
  they have defaults, will be added.
  */
  create(t = null) {
    return !t && this.instance ? this.instance : new I(this, Po(this.attrs, t));
  }
  /**
  @internal
  */
  static compile(t, n) {
    let r = /* @__PURE__ */ Object.create(null), s = 0;
    return t.forEach((o, l) => r[o] = new Fn(o, s++, n, l)), r;
  }
  /**
  When there is a mark of this type in the given set, a new set
  without it is returned. Otherwise, the input set is returned.
  */
  removeFromSet(t) {
    for (var n = 0; n < t.length; n++)
      t[n].type == this && (t = t.slice(0, n).concat(t.slice(n + 1)), n--);
    return t;
  }
  /**
  Tests whether there is a mark of this type in the given set.
  */
  isInSet(t) {
    for (let n = 0; n < t.length; n++)
      if (t[n].type == this)
        return t[n];
  }
  /**
  @internal
  */
  checkAttrs(t) {
    Fo(this.attrs, t, "mark", this.name);
  }
  /**
  Queries whether a given mark type is
  [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
  */
  excludes(t) {
    return this.excluded.indexOf(t) > -1;
  }
}
class qr {
  /**
  Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
  */
  constructor(t) {
    this.linebreakReplacement = null, this.cached = /* @__PURE__ */ Object.create(null);
    let n = this.spec = {};
    for (let s in t)
      n[s] = t[s];
    n.nodes = X.from(t.nodes), n.marks = X.from(t.marks || {}), this.nodes = ur.compile(this.spec.nodes, this), this.marks = Fn.compile(this.spec.marks, this);
    let r = /* @__PURE__ */ Object.create(null);
    for (let s in this.nodes) {
      if (s in this.marks)
        throw new RangeError(s + " can not be both a node and a mark");
      let o = this.nodes[s], l = o.spec.content || "", a = o.spec.marks;
      if (o.contentMatch = r[l] || (r[l] = vt.parse(l, this.nodes)), o.inlineContent = o.contentMatch.inlineContent, o.spec.linebreakReplacement) {
        if (this.linebreakReplacement)
          throw new RangeError("Multiple linebreak nodes defined");
        if (!o.isInline || !o.isLeaf)
          throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
        this.linebreakReplacement = o;
      }
      o.markSet = a == "_" ? null : a ? cs(this, a.split(" ")) : a == "" || !o.inlineContent ? [] : null;
    }
    for (let s in this.marks) {
      let o = this.marks[s], l = o.spec.excludes;
      o.excluded = l == null ? [o] : l == "" ? [] : cs(this, l.split(" "));
    }
    this.nodeFromJSON = (s) => ft.fromJSON(this, s), this.markFromJSON = (s) => I.fromJSON(this, s), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = /* @__PURE__ */ Object.create(null);
  }
  /**
  Create a node in this schema. The `type` may be a string or a
  `NodeType` instance. Attributes will be extended with defaults,
  `content` may be a `Fragment`, `null`, a `Node`, or an array of
  nodes.
  */
  node(t, n = null, r, s) {
    if (typeof t == "string")
      t = this.nodeType(t);
    else if (t instanceof ur) {
      if (t.schema != this)
        throw new RangeError("Node type from different schema used (" + t.name + ")");
    } else throw new RangeError("Invalid node type: " + t);
    return t.createChecked(n, r, s);
  }
  /**
  Create a text node in the schema. Empty text nodes are not
  allowed.
  */
  text(t, n) {
    let r = this.nodes.text;
    return new bi(r, r.defaultAttrs, t, I.setFrom(n));
  }
  /**
  Create a mark with the given type and attributes.
  */
  mark(t, n) {
    return typeof t == "string" && (t = this.marks[t]), t.create(n);
  }
  /**
  @internal
  */
  nodeType(t) {
    let n = this.nodes[t];
    if (!n)
      throw new RangeError("Unknown node type: " + t);
    return n;
  }
}
function cs(i, t) {
  let n = [];
  for (let r = 0; r < t.length; r++) {
    let s = t[r], o = i.marks[s], l = o;
    if (o)
      n.push(o);
    else
      for (let a in i.marks) {
        let c = i.marks[a];
        (s == "_" || c.spec.group && c.spec.group.split(" ").indexOf(s) > -1) && n.push(l = c);
      }
    if (!l)
      throw new SyntaxError("Unknown mark type: '" + t[r] + "'");
  }
  return n;
}
function ja(i) {
  return i.tag != null;
}
function _a(i) {
  return i.style != null;
}
let Wt = class dr {
  /**
  Create a parser that targets the given schema, using the given
  parsing rules.
  */
  constructor(t, n) {
    this.schema = t, this.rules = n, this.tags = [], this.styles = [];
    let r = this.matchedStyles = [];
    n.forEach((s) => {
      if (ja(s))
        this.tags.push(s);
      else if (_a(s)) {
        let o = /[^=]*/.exec(s.style)[0];
        r.indexOf(o) < 0 && r.push(o), this.styles.push(s);
      }
    }), this.normalizeLists = !this.tags.some((s) => {
      if (!/^(ul|ol)\b/.test(s.tag) || !s.node)
        return !1;
      let o = t.nodes[s.node];
      return o.contentMatch.matchType(o);
    });
  }
  /**
  Parse a document from the content of a DOM node.
  */
  parse(t, n = {}) {
    let r = new ds(this, n, !1);
    return r.addAll(t, I.none, n.from, n.to), r.finish();
  }
  /**
  Parses the content of the given DOM node, like
  [`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
  options. But unlike that method, which produces a whole node,
  this one returns a slice that is open at the sides, meaning that
  the schema constraints aren't applied to the start of nodes to
  the left of the input and the end of nodes at the end.
  */
  parseSlice(t, n = {}) {
    let r = new ds(this, n, !0);
    return r.addAll(t, I.none, n.from, n.to), k.maxOpen(r.finish());
  }
  /**
  @internal
  */
  matchTag(t, n, r) {
    for (let s = r ? this.tags.indexOf(r) + 1 : 0; s < this.tags.length; s++) {
      let o = this.tags[s];
      if (Xa(t, o.tag) && (o.namespace === void 0 || t.namespaceURI == o.namespace) && (!o.context || n.matchesContext(o.context))) {
        if (o.getAttrs) {
          let l = o.getAttrs(t);
          if (l === !1)
            continue;
          o.attrs = l || void 0;
        }
        return o;
      }
    }
  }
  /**
  @internal
  */
  matchStyle(t, n, r, s) {
    for (let o = s ? this.styles.indexOf(s) + 1 : 0; o < this.styles.length; o++) {
      let l = this.styles[o], a = l.style;
      if (!(a.indexOf(t) != 0 || l.context && !r.matchesContext(l.context) || // Test that the style string either precisely matches the prop,
      // or has an '=' sign after the prop, followed by the given
      // value.
      a.length > t.length && (a.charCodeAt(t.length) != 61 || a.slice(t.length + 1) != n))) {
        if (l.getAttrs) {
          let c = l.getAttrs(n);
          if (c === !1)
            continue;
          l.attrs = c || void 0;
        }
        return l;
      }
    }
  }
  /**
  @internal
  */
  static schemaRules(t) {
    let n = [];
    function r(s) {
      let o = s.priority == null ? 50 : s.priority, l = 0;
      for (; l < n.length; l++) {
        let a = n[l];
        if ((a.priority == null ? 50 : a.priority) < o)
          break;
      }
      n.splice(l, 0, s);
    }
    for (let s in t.marks) {
      let o = t.marks[s].spec.parseDOM;
      o && o.forEach((l) => {
        r(l = hs(l)), l.mark || l.ignore || l.clearMark || (l.mark = s);
      });
    }
    for (let s in t.nodes) {
      let o = t.nodes[s].spec.parseDOM;
      o && o.forEach((l) => {
        r(l = hs(l)), l.node || l.ignore || l.mark || (l.node = s);
      });
    }
    return n;
  }
  /**
  Construct a DOM parser using the parsing rules listed in a
  schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
  [priority](https://prosemirror.net/docs/ref/#model.GenericParseRule.priority).
  */
  static fromSchema(t) {
    return t.cached.domParser || (t.cached.domParser = new dr(t, dr.schemaRules(t)));
  }
};
const $o = {
  address: !0,
  article: !0,
  aside: !0,
  blockquote: !0,
  canvas: !0,
  dd: !0,
  div: !0,
  dl: !0,
  fieldset: !0,
  figcaption: !0,
  figure: !0,
  footer: !0,
  form: !0,
  h1: !0,
  h2: !0,
  h3: !0,
  h4: !0,
  h5: !0,
  h6: !0,
  header: !0,
  hgroup: !0,
  hr: !0,
  li: !0,
  noscript: !0,
  ol: !0,
  output: !0,
  p: !0,
  pre: !0,
  section: !0,
  table: !0,
  tfoot: !0,
  ul: !0
}, Ka = {
  head: !0,
  noscript: !0,
  object: !0,
  script: !0,
  style: !0,
  title: !0
}, Wo = { ol: !0, ul: !0 }, Dn = 1, hr = 2, Nn = 4;
function us(i, t, n) {
  return t != null ? (t ? Dn : 0) | (t === "full" ? hr : 0) : i && i.whitespace == "pre" ? Dn | hr : n & ~Nn;
}
class Qn {
  constructor(t, n, r, s, o, l) {
    this.type = t, this.attrs = n, this.marks = r, this.solid = s, this.options = l, this.content = [], this.activeMarks = I.none, this.match = o || (l & Nn ? null : t.contentMatch);
  }
  findWrapping(t) {
    if (!this.match) {
      if (!this.type)
        return [];
      let n = this.type.contentMatch.fillBefore(x.from(t));
      if (n)
        this.match = this.type.contentMatch.matchFragment(n);
      else {
        let r = this.type.contentMatch, s;
        return (s = r.findWrapping(t.type)) ? (this.match = r, s) : null;
      }
    }
    return this.match.findWrapping(t.type);
  }
  finish(t) {
    if (!(this.options & Dn)) {
      let r = this.content[this.content.length - 1], s;
      if (r && r.isText && (s = /[ \t\r\n\u000c]+$/.exec(r.text))) {
        let o = r;
        r.text.length == s[0].length ? this.content.pop() : this.content[this.content.length - 1] = o.withText(o.text.slice(0, o.text.length - s[0].length));
      }
    }
    let n = x.from(this.content);
    return !t && this.match && (n = n.append(this.match.fillBefore(x.empty, !0))), this.type ? this.type.create(this.attrs, n, this.marks) : n;
  }
  inlineContext(t) {
    return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : t.parentNode && !$o.hasOwnProperty(t.parentNode.nodeName.toLowerCase());
  }
}
class ds {
  constructor(t, n, r) {
    this.parser = t, this.options = n, this.isOpen = r, this.open = 0, this.localPreserveWS = !1;
    let s = n.topNode, o, l = us(null, n.preserveWhitespace, 0) | (r ? Nn : 0);
    s ? o = new Qn(s.type, s.attrs, I.none, !0, n.topMatch || s.type.contentMatch, l) : r ? o = new Qn(null, null, I.none, !0, null, l) : o = new Qn(t.schema.topNodeType, null, I.none, !0, null, l), this.nodes = [o], this.find = n.findPositions, this.needsBlock = !1;
  }
  get top() {
    return this.nodes[this.open];
  }
  // Add a DOM node to the content. Text is inserted as text node,
  // otherwise, the node is passed to `addElement` or, if it has a
  // `style` attribute, `addElementWithStyles`.
  addDOM(t, n) {
    t.nodeType == 3 ? this.addTextNode(t, n) : t.nodeType == 1 && this.addElement(t, n);
  }
  addTextNode(t, n) {
    let r = t.nodeValue, s = this.top, o = s.options & hr ? "full" : this.localPreserveWS || (s.options & Dn) > 0, { schema: l } = this.parser;
    if (o === "full" || s.inlineContext(t) || /[^ \t\r\n\u000c]/.test(r)) {
      if (o)
        if (o === "full")
          r = r.replace(/\r\n?/g, `
`);
        else if (l.linebreakReplacement && /[\r\n]/.test(r) && this.top.findWrapping(l.linebreakReplacement.create())) {
          let a = r.split(/\r?\n|\r/);
          for (let c = 0; c < a.length; c++)
            c && this.insertNode(l.linebreakReplacement.create(), n, !0), a[c] && this.insertNode(l.text(a[c]), n, !/\S/.test(a[c]));
          r = "";
        } else
          r = r.replace(/\r?\n|\r/g, " ");
      else if (r = r.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(r) && this.open == this.nodes.length - 1) {
        let a = s.content[s.content.length - 1], c = t.previousSibling;
        (!a || c && c.nodeName == "BR" || a.isText && /[ \t\r\n\u000c]$/.test(a.text)) && (r = r.slice(1));
      }
      r && this.insertNode(l.text(r), n, !/\S/.test(r)), this.findInText(t);
    } else
      this.findInside(t);
  }
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  addElement(t, n, r) {
    let s = this.localPreserveWS, o = this.top;
    (t.tagName == "PRE" || /pre/.test(t.style && t.style.whiteSpace)) && (this.localPreserveWS = !0);
    let l = t.nodeName.toLowerCase(), a;
    Wo.hasOwnProperty(l) && this.parser.normalizeLists && Ja(t);
    let c = this.options.ruleFromNode && this.options.ruleFromNode(t) || (a = this.parser.matchTag(t, this, r));
    e: if (c ? c.ignore : Ka.hasOwnProperty(l))
      this.findInside(t), this.ignoreFallback(t, n);
    else if (!c || c.skip || c.closeParent) {
      c && c.closeParent ? this.open = Math.max(0, this.open - 1) : c && c.skip.nodeType && (t = c.skip);
      let u, d = this.needsBlock;
      if ($o.hasOwnProperty(l))
        o.content.length && o.content[0].isInline && this.open && (this.open--, o = this.top), u = !0, o.type || (this.needsBlock = !0);
      else if (!t.firstChild) {
        this.leafFallback(t, n);
        break e;
      }
      let h = c && c.skip ? n : this.readStyles(t, n);
      h && this.addAll(t, h), u && this.sync(o), this.needsBlock = d;
    } else {
      let u = this.readStyles(t, n);
      u && this.addElementByRule(t, c, u, c.consuming === !1 ? a : void 0);
    }
    this.localPreserveWS = s;
  }
  // Called for leaf DOM nodes that would otherwise be ignored
  leafFallback(t, n) {
    t.nodeName == "BR" && this.top.type && this.top.type.inlineContent && this.addTextNode(t.ownerDocument.createTextNode(`
`), n);
  }
  // Called for ignored nodes
  ignoreFallback(t, n) {
    t.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent) && this.findPlace(this.parser.schema.text("-"), n, !0);
  }
  // Run any style parser associated with the node's styles. Either
  // return an updated array of marks, or null to indicate some of the
  // styles had a rule with `ignore` set.
  readStyles(t, n) {
    let r = t.style;
    if (r && r.length)
      for (let s = 0; s < this.parser.matchedStyles.length; s++) {
        let o = this.parser.matchedStyles[s], l = r.getPropertyValue(o);
        if (l)
          for (let a = void 0; ; ) {
            let c = this.parser.matchStyle(o, l, this, a);
            if (!c)
              break;
            if (c.ignore)
              return null;
            if (c.clearMark ? n = n.filter((u) => !c.clearMark(u)) : n = n.concat(this.parser.schema.marks[c.mark].create(c.attrs)), c.consuming === !1)
              a = c;
            else
              break;
          }
      }
    return n;
  }
  // Look up a handler for the given node. If none are found, return
  // false. Otherwise, apply it, use its return value to drive the way
  // the node's content is wrapped, and return true.
  addElementByRule(t, n, r, s) {
    let o, l;
    if (n.node)
      if (l = this.parser.schema.nodes[n.node], l.isLeaf)
        this.insertNode(l.create(n.attrs), r, t.nodeName == "BR") || this.leafFallback(t, r);
      else {
        let c = this.enter(l, n.attrs || null, r, n.preserveWhitespace);
        c && (o = !0, r = c);
      }
    else {
      let c = this.parser.schema.marks[n.mark];
      r = r.concat(c.create(n.attrs));
    }
    let a = this.top;
    if (l && l.isLeaf)
      this.findInside(t);
    else if (s)
      this.addElement(t, r, s);
    else if (n.getContent)
      this.findInside(t), n.getContent(t, this.parser.schema).forEach((c) => this.insertNode(c, r, !1));
    else {
      let c = t;
      typeof n.contentElement == "string" ? c = t.querySelector(n.contentElement) : typeof n.contentElement == "function" ? c = n.contentElement(t) : n.contentElement && (c = n.contentElement), this.findAround(t, c, !0), this.addAll(c, r), this.findAround(t, c, !1);
    }
    o && this.sync(a) && this.open--;
  }
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  addAll(t, n, r, s) {
    let o = r || 0;
    for (let l = r ? t.childNodes[r] : t.firstChild, a = s == null ? null : t.childNodes[s]; l != a; l = l.nextSibling, ++o)
      this.findAtPoint(t, o), this.addDOM(l, n);
    this.findAtPoint(t, o);
  }
  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  findPlace(t, n, r) {
    let s, o;
    for (let l = this.open, a = 0; l >= 0; l--) {
      let c = this.nodes[l], u = c.findWrapping(t);
      if (u && (!s || s.length > u.length + a) && (s = u, o = c, !u.length))
        break;
      if (c.solid) {
        if (r)
          break;
        a += 2;
      }
    }
    if (!s)
      return null;
    this.sync(o);
    for (let l = 0; l < s.length; l++)
      n = this.enterInner(s[l], null, n, !1);
    return n;
  }
  // Try to insert the given node, adjusting the context when needed.
  insertNode(t, n, r) {
    if (t.isInline && this.needsBlock && !this.top.type) {
      let o = this.textblockFromContext();
      o && (n = this.enterInner(o, null, n));
    }
    let s = this.findPlace(t, n, r);
    if (s) {
      this.closeExtra();
      let o = this.top;
      o.match && (o.match = o.match.matchType(t.type));
      let l = I.none;
      for (let a of s.concat(t.marks))
        (o.type ? o.type.allowsMarkType(a.type) : fs(a.type, t.type)) && (l = a.addToSet(l));
      return o.content.push(t.mark(l)), !0;
    }
    return !1;
  }
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  enter(t, n, r, s) {
    let o = this.findPlace(t.create(n), r, !1);
    return o && (o = this.enterInner(t, n, r, !0, s)), o;
  }
  // Open a node of the given type
  enterInner(t, n, r, s = !1, o) {
    this.closeExtra();
    let l = this.top;
    l.match = l.match && l.match.matchType(t);
    let a = us(t, o, l.options);
    l.options & Nn && l.content.length == 0 && (a |= Nn);
    let c = I.none;
    return r = r.filter((u) => (l.type ? l.type.allowsMarkType(u.type) : fs(u.type, t)) ? (c = u.addToSet(c), !1) : !0), this.nodes.push(new Qn(t, n, c, s, null, a)), this.open++, r;
  }
  // Make sure all nodes above this.open are finished and added to
  // their parents
  closeExtra(t = !1) {
    let n = this.nodes.length - 1;
    if (n > this.open) {
      for (; n > this.open; n--)
        this.nodes[n - 1].content.push(this.nodes[n].finish(t));
      this.nodes.length = this.open + 1;
    }
  }
  finish() {
    return this.open = 0, this.closeExtra(this.isOpen), this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
  }
  sync(t) {
    for (let n = this.open; n >= 0; n--) {
      if (this.nodes[n] == t)
        return this.open = n, !0;
      this.localPreserveWS && (this.nodes[n].options |= Dn);
    }
    return !1;
  }
  get currentPos() {
    this.closeExtra();
    let t = 0;
    for (let n = this.open; n >= 0; n--) {
      let r = this.nodes[n].content;
      for (let s = r.length - 1; s >= 0; s--)
        t += r[s].nodeSize;
      n && t++;
    }
    return t;
  }
  findAtPoint(t, n) {
    if (this.find)
      for (let r = 0; r < this.find.length; r++)
        this.find[r].node == t && this.find[r].offset == n && (this.find[r].pos = this.currentPos);
  }
  findInside(t) {
    if (this.find)
      for (let n = 0; n < this.find.length; n++)
        this.find[n].pos == null && t.nodeType == 1 && t.contains(this.find[n].node) && (this.find[n].pos = this.currentPos);
  }
  findAround(t, n, r) {
    if (t != n && this.find)
      for (let s = 0; s < this.find.length; s++)
        this.find[s].pos == null && t.nodeType == 1 && t.contains(this.find[s].node) && n.compareDocumentPosition(this.find[s].node) & (r ? 2 : 4) && (this.find[s].pos = this.currentPos);
  }
  findInText(t) {
    if (this.find)
      for (let n = 0; n < this.find.length; n++)
        this.find[n].node == t && (this.find[n].pos = this.currentPos - (t.nodeValue.length - this.find[n].offset));
  }
  // Determines whether the given context string matches this context.
  matchesContext(t) {
    if (t.indexOf("|") > -1)
      return t.split(/\s*\|\s*/).some(this.matchesContext, this);
    let n = t.split("/"), r = this.options.context, s = !this.isOpen && (!r || r.parent.type == this.nodes[0].type), o = -(r ? r.depth + 1 : 0) + (s ? 0 : 1), l = (a, c) => {
      for (; a >= 0; a--) {
        let u = n[a];
        if (u == "") {
          if (a == n.length - 1 || a == 0)
            continue;
          for (; c >= o; c--)
            if (l(a - 1, c))
              return !0;
          return !1;
        } else {
          let d = c > 0 || c == 0 && s ? this.nodes[c].type : r && c >= o ? r.node(c - o).type : null;
          if (!d || d.name != u && !d.isInGroup(u))
            return !1;
          c--;
        }
      }
      return !0;
    };
    return l(n.length - 1, this.open);
  }
  textblockFromContext() {
    let t = this.options.context;
    if (t)
      for (let n = t.depth; n >= 0; n--) {
        let r = t.node(n).contentMatchAt(t.indexAfter(n)).defaultType;
        if (r && r.isTextblock && r.defaultAttrs)
          return r;
      }
    for (let n in this.parser.schema.nodes) {
      let r = this.parser.schema.nodes[n];
      if (r.isTextblock && r.defaultAttrs)
        return r;
    }
  }
}
function Ja(i) {
  for (let t = i.firstChild, n = null; t; t = t.nextSibling) {
    let r = t.nodeType == 1 ? t.nodeName.toLowerCase() : null;
    r && Wo.hasOwnProperty(r) && n ? (n.appendChild(t), t = n) : r == "li" ? n = t : r && (n = null);
  }
}
function Xa(i, t) {
  return (i.matches || i.msMatchesSelector || i.webkitMatchesSelector || i.mozMatchesSelector).call(i, t);
}
function hs(i) {
  let t = {};
  for (let n in i)
    t[n] = i[n];
  return t;
}
function fs(i, t) {
  let n = t.schema.nodes;
  for (let r in n) {
    let s = n[r];
    if (!s.allowsMarkType(i))
      continue;
    let o = [], l = (a) => {
      o.push(a);
      for (let c = 0; c < a.edgeCount; c++) {
        let { type: u, next: d } = a.edge(c);
        if (u == t || o.indexOf(d) < 0 && l(d))
          return !0;
      }
    };
    if (l(s.contentMatch))
      return !0;
  }
}
class kt {
  /**
  Create a serializer. `nodes` should map node names to functions
  that take a node and return a description of the corresponding
  DOM. `marks` does the same for mark names, but also gets an
  argument that tells it whether the mark's content is block or
  inline content (for typical use, it'll always be inline). A mark
  serializer may be `null` to indicate that marks of that type
  should not be serialized.
  */
  constructor(t, n) {
    this.nodes = t, this.marks = n;
  }
  /**
  Serialize the content of this fragment to a DOM fragment. When
  not in the browser, the `document` option, containing a DOM
  document, should be passed so that the serializer can create
  nodes.
  */
  serializeFragment(t, n = {}, r) {
    r || (r = Wi(n).createDocumentFragment());
    let s = r, o = [];
    return t.forEach((l) => {
      if (o.length || l.marks.length) {
        let a = 0, c = 0;
        for (; a < o.length && c < l.marks.length; ) {
          let u = l.marks[c];
          if (!this.marks[u.type.name]) {
            c++;
            continue;
          }
          if (!u.eq(o[a][0]) || u.type.spec.spanning === !1)
            break;
          a++, c++;
        }
        for (; a < o.length; )
          s = o.pop()[1];
        for (; c < l.marks.length; ) {
          let u = l.marks[c++], d = this.serializeMark(u, l.isInline, n);
          d && (o.push([u, s]), s.appendChild(d.dom), s = d.contentDOM || d.dom);
        }
      }
      s.appendChild(this.serializeNodeInner(l, n));
    }), r;
  }
  /**
  @internal
  */
  serializeNodeInner(t, n) {
    let { dom: r, contentDOM: s } = oi(Wi(n), this.nodes[t.type.name](t), null, t.attrs);
    if (s) {
      if (t.isLeaf)
        throw new RangeError("Content hole not allowed in a leaf node spec");
      this.serializeFragment(t.content, n, s);
    }
    return r;
  }
  /**
  Serialize this node to a DOM node. This can be useful when you
  need to serialize a part of a document, as opposed to the whole
  document. To serialize a whole document, use
  [`serializeFragment`](https://prosemirror.net/docs/ref/#model.DOMSerializer.serializeFragment) on
  its [content](https://prosemirror.net/docs/ref/#model.Node.content).
  */
  serializeNode(t, n = {}) {
    let r = this.serializeNodeInner(t, n);
    for (let s = t.marks.length - 1; s >= 0; s--) {
      let o = this.serializeMark(t.marks[s], t.isInline, n);
      o && ((o.contentDOM || o.dom).appendChild(r), r = o.dom);
    }
    return r;
  }
  /**
  @internal
  */
  serializeMark(t, n, r = {}) {
    let s = this.marks[t.type.name];
    return s && oi(Wi(r), s(t, n), null, t.attrs);
  }
  static renderSpec(t, n, r = null, s) {
    return oi(t, n, r, s);
  }
  /**
  Build a serializer using the [`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM)
  properties in a schema's node and mark specs.
  */
  static fromSchema(t) {
    return t.cached.domSerializer || (t.cached.domSerializer = new kt(this.nodesFromSchema(t), this.marksFromSchema(t)));
  }
  /**
  Gather the serializers in a schema's node specs into an object.
  This can be useful as a base to build a custom serializer from.
  */
  static nodesFromSchema(t) {
    let n = ps(t.nodes);
    return n.text || (n.text = (r) => r.text), n;
  }
  /**
  Gather the serializers in a schema's mark specs into an object.
  */
  static marksFromSchema(t) {
    return ps(t.marks);
  }
}
function ps(i) {
  let t = {};
  for (let n in i) {
    let r = i[n].spec.toDOM;
    r && (t[n] = r);
  }
  return t;
}
function Wi(i) {
  return i.document || window.document;
}
const ms = /* @__PURE__ */ new WeakMap();
function Ya(i) {
  let t = ms.get(i);
  return t === void 0 && ms.set(i, t = Ga(i)), t;
}
function Ga(i) {
  let t = null;
  function n(r) {
    if (r && typeof r == "object")
      if (Array.isArray(r))
        if (typeof r[0] == "string")
          t || (t = []), t.push(r);
        else
          for (let s = 0; s < r.length; s++)
            n(r[s]);
      else
        for (let s in r)
          n(r[s]);
  }
  return n(i), t;
}
function oi(i, t, n, r) {
  if (typeof t == "string")
    return { dom: i.createTextNode(t) };
  if (t.nodeType != null)
    return { dom: t };
  if (t.dom && t.dom.nodeType != null)
    return t;
  let s = t[0], o;
  if (typeof s != "string")
    throw new RangeError("Invalid array passed to renderSpec");
  if (r && (o = Ya(r)) && o.indexOf(t) > -1)
    throw new RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
  let l = s.indexOf(" ");
  l > 0 && (n = s.slice(0, l), s = s.slice(l + 1));
  let a, c = n ? i.createElementNS(n, s) : i.createElement(s), u = t[1], d = 1;
  if (u && typeof u == "object" && u.nodeType == null && !Array.isArray(u)) {
    d = 2;
    for (let h in u)
      if (u[h] != null) {
        let f = h.indexOf(" ");
        f > 0 ? c.setAttributeNS(h.slice(0, f), h.slice(f + 1), u[h]) : h == "style" && c.style ? c.style.cssText = u[h] : c.setAttribute(h, u[h]);
      }
  }
  for (let h = d; h < t.length; h++) {
    let f = t[h];
    if (f === 0) {
      if (h < t.length - 1 || h > d)
        throw new RangeError("Content hole must be the only child of its parent node");
      return { dom: c, contentDOM: c };
    } else {
      let { dom: p, contentDOM: m } = oi(i, f, n, r);
      if (c.appendChild(p), m) {
        if (a)
          throw new RangeError("Multiple content holes");
        a = m;
      }
    }
  }
  return { dom: c, contentDOM: a };
}
const Za = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ContentMatch: vt,
  DOMParser: Wt,
  DOMSerializer: kt,
  Fragment: x,
  Mark: I,
  MarkType: Fn,
  Node: ft,
  NodeRange: yi,
  NodeType: ur,
  ReplaceError: qn,
  ResolvedPos: rn,
  Schema: qr,
  Slice: k
}, Symbol.toStringTag, { value: "Module" })), Uo = 65535, jo = Math.pow(2, 16);
function Qa(i, t) {
  return i + t * jo;
}
function gs(i) {
  return i & Uo;
}
function ec(i) {
  return (i - (i & Uo)) / jo;
}
const _o = 1, Ko = 2, li = 4, Jo = 8;
class fr {
  /**
  @internal
  */
  constructor(t, n, r) {
    this.pos = t, this.delInfo = n, this.recover = r;
  }
  /**
  Tells you whether the position was deleted, that is, whether the
  step removed the token on the side queried (via the `assoc`)
  argument from the document.
  */
  get deleted() {
    return (this.delInfo & Jo) > 0;
  }
  /**
  Tells you whether the token before the mapped position was deleted.
  */
  get deletedBefore() {
    return (this.delInfo & (_o | li)) > 0;
  }
  /**
  True when the token after the mapped position was deleted.
  */
  get deletedAfter() {
    return (this.delInfo & (Ko | li)) > 0;
  }
  /**
  Tells whether any of the steps mapped through deletes across the
  position (including both the token before and after the
  position).
  */
  get deletedAcross() {
    return (this.delInfo & li) > 0;
  }
}
class ye {
  /**
  Create a position map. The modifications to the document are
  represented as an array of numbers, in which each group of three
  represents a modified chunk as `[start, oldSize, newSize]`.
  */
  constructor(t, n = !1) {
    if (this.ranges = t, this.inverted = n, !t.length && ye.empty)
      return ye.empty;
  }
  /**
  @internal
  */
  recover(t) {
    let n = 0, r = gs(t);
    if (!this.inverted)
      for (let s = 0; s < r; s++)
        n += this.ranges[s * 3 + 2] - this.ranges[s * 3 + 1];
    return this.ranges[r * 3] + n + ec(t);
  }
  mapResult(t, n = 1) {
    return this._map(t, n, !1);
  }
  map(t, n = 1) {
    return this._map(t, n, !0);
  }
  /**
  @internal
  */
  _map(t, n, r) {
    let s = 0, o = this.inverted ? 2 : 1, l = this.inverted ? 1 : 2;
    for (let a = 0; a < this.ranges.length; a += 3) {
      let c = this.ranges[a] - (this.inverted ? s : 0);
      if (c > t)
        break;
      let u = this.ranges[a + o], d = this.ranges[a + l], h = c + u;
      if (t <= h) {
        let f = u ? t == c ? -1 : t == h ? 1 : n : n, p = c + s + (f < 0 ? 0 : d);
        if (r)
          return p;
        let m = t == (n < 0 ? c : h) ? null : Qa(a / 3, t - c), y = t == c ? Ko : t == h ? _o : li;
        return (n < 0 ? t != c : t != h) && (y |= Jo), new fr(p, y, m);
      }
      s += d - u;
    }
    return r ? t + s : new fr(t + s, 0, null);
  }
  /**
  @internal
  */
  touches(t, n) {
    let r = 0, s = gs(n), o = this.inverted ? 2 : 1, l = this.inverted ? 1 : 2;
    for (let a = 0; a < this.ranges.length; a += 3) {
      let c = this.ranges[a] - (this.inverted ? r : 0);
      if (c > t)
        break;
      let u = this.ranges[a + o], d = c + u;
      if (t <= d && a == s * 3)
        return !0;
      r += this.ranges[a + l] - u;
    }
    return !1;
  }
  /**
  Calls the given function on each of the changed ranges included in
  this map.
  */
  forEach(t) {
    let n = this.inverted ? 2 : 1, r = this.inverted ? 1 : 2;
    for (let s = 0, o = 0; s < this.ranges.length; s += 3) {
      let l = this.ranges[s], a = l - (this.inverted ? o : 0), c = l + (this.inverted ? 0 : o), u = this.ranges[s + n], d = this.ranges[s + r];
      t(a, a + u, c, c + d), o += d - u;
    }
  }
  /**
  Create an inverted version of this map. The result can be used to
  map positions in the post-step document to the pre-step document.
  */
  invert() {
    return new ye(this.ranges, !this.inverted);
  }
  /**
  @internal
  */
  toString() {
    return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
  }
  /**
  Create a map that moves all positions by offset `n` (which may be
  negative). This can be useful when applying steps meant for a
  sub-document to a larger document, or vice-versa.
  */
  static offset(t) {
    return t == 0 ? ye.empty : new ye(t < 0 ? [0, -t, 0] : [0, 0, t]);
  }
}
ye.empty = new ye([]);
class zn {
  /**
  Create a new mapping with the given position maps.
  */
  constructor(t, n, r = 0, s = t ? t.length : 0) {
    this.mirror = n, this.from = r, this.to = s, this._maps = t || [], this.ownData = !(t || n);
  }
  /**
  The step maps in this mapping.
  */
  get maps() {
    return this._maps;
  }
  /**
  Create a mapping that maps only through a part of this one.
  */
  slice(t = 0, n = this.maps.length) {
    return new zn(this._maps, this.mirror, t, n);
  }
  /**
  Add a step map to the end of this mapping. If `mirrors` is
  given, it should be the index of the step map that is the mirror
  image of this one.
  */
  appendMap(t, n) {
    this.ownData || (this._maps = this._maps.slice(), this.mirror = this.mirror && this.mirror.slice(), this.ownData = !0), this.to = this._maps.push(t), n != null && this.setMirror(this._maps.length - 1, n);
  }
  /**
  Add all the step maps in a given mapping to this one (preserving
  mirroring information).
  */
  appendMapping(t) {
    for (let n = 0, r = this._maps.length; n < t._maps.length; n++) {
      let s = t.getMirror(n);
      this.appendMap(t._maps[n], s != null && s < n ? r + s : void 0);
    }
  }
  /**
  Finds the offset of the step map that mirrors the map at the
  given offset, in this mapping (as per the second argument to
  `appendMap`).
  */
  getMirror(t) {
    if (this.mirror) {
      for (let n = 0; n < this.mirror.length; n++)
        if (this.mirror[n] == t)
          return this.mirror[n + (n % 2 ? -1 : 1)];
    }
  }
  /**
  @internal
  */
  setMirror(t, n) {
    this.mirror || (this.mirror = []), this.mirror.push(t, n);
  }
  /**
  Append the inverse of the given mapping to this one.
  */
  appendMappingInverted(t) {
    for (let n = t.maps.length - 1, r = this._maps.length + t._maps.length; n >= 0; n--) {
      let s = t.getMirror(n);
      this.appendMap(t._maps[n].invert(), s != null && s > n ? r - s - 1 : void 0);
    }
  }
  /**
  Create an inverted version of this mapping.
  */
  invert() {
    let t = new zn();
    return t.appendMappingInverted(this), t;
  }
  /**
  Map a position through this mapping.
  */
  map(t, n = 1) {
    if (this.mirror)
      return this._map(t, n, !0);
    for (let r = this.from; r < this.to; r++)
      t = this._maps[r].map(t, n);
    return t;
  }
  /**
  Map a position through this mapping, returning a mapping
  result.
  */
  mapResult(t, n = 1) {
    return this._map(t, n, !1);
  }
  /**
  @internal
  */
  _map(t, n, r) {
    let s = 0;
    for (let o = this.from; o < this.to; o++) {
      let l = this._maps[o], a = l.mapResult(t, n);
      if (a.recover != null) {
        let c = this.getMirror(o);
        if (c != null && c > o && c < this.to) {
          o = c, t = this._maps[c].recover(a.recover);
          continue;
        }
      }
      s |= a.delInfo, t = a.pos;
    }
    return r ? t : new fr(t, s, null);
  }
}
const Ui = /* @__PURE__ */ Object.create(null);
class re {
  /**
  Get the step map that represents the changes made by this step,
  and which can be used to transform between positions in the old
  and the new document.
  */
  getMap() {
    return ye.empty;
  }
  /**
  Try to merge this step with another one, to be applied directly
  after it. Returns the merged step when possible, null if the
  steps can't be merged.
  */
  merge(t) {
    return null;
  }
  /**
  Deserialize a step from its JSON representation. Will call
  through to the step class' own implementation of this method.
  */
  static fromJSON(t, n) {
    if (!n || !n.stepType)
      throw new RangeError("Invalid input for Step.fromJSON");
    let r = Ui[n.stepType];
    if (!r)
      throw new RangeError(`No step type ${n.stepType} defined`);
    return r.fromJSON(t, n);
  }
  /**
  To be able to serialize steps to JSON, each step needs a string
  ID to attach to its JSON representation. Use this method to
  register an ID for your step classes. Try to pick something
  that's unlikely to clash with steps from other modules.
  */
  static jsonID(t, n) {
    if (t in Ui)
      throw new RangeError("Duplicate use of step JSON ID " + t);
    return Ui[t] = n, n.prototype.jsonID = t, n;
  }
}
class W {
  /**
  @internal
  */
  constructor(t, n) {
    this.doc = t, this.failed = n;
  }
  /**
  Create a successful step result.
  */
  static ok(t) {
    return new W(t, null);
  }
  /**
  Create a failed step result.
  */
  static fail(t) {
    return new W(null, t);
  }
  /**
  Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
  arguments. Create a successful result if it succeeds, and a
  failed one if it throws a `ReplaceError`.
  */
  static fromReplace(t, n, r, s) {
    try {
      return W.ok(t.replace(n, r, s));
    } catch (o) {
      if (o instanceof qn)
        return W.fail(o.message);
      throw o;
    }
  }
}
function Dr(i, t, n) {
  let r = [];
  for (let s = 0; s < i.childCount; s++) {
    let o = i.child(s);
    o.content.size && (o = o.copy(Dr(o.content, t, o))), o.isInline && (o = t(o, n, s)), r.push(o);
  }
  return x.fromArray(r);
}
class at extends re {
  /**
  Create a mark step.
  */
  constructor(t, n, r) {
    super(), this.from = t, this.to = n, this.mark = r;
  }
  apply(t) {
    let n = t.slice(this.from, this.to), r = t.resolve(this.from), s = r.node(r.sharedDepth(this.to)), o = new k(Dr(n.content, (l, a) => !l.isAtom || !a.type.allowsMarkType(this.mark.type) ? l : l.mark(this.mark.addToSet(l.marks)), s), n.openStart, n.openEnd);
    return W.fromReplace(t, this.from, this.to, o);
  }
  invert() {
    return new Be(this.from, this.to, this.mark);
  }
  map(t) {
    let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1);
    return n.deleted && r.deleted || n.pos >= r.pos ? null : new at(n.pos, r.pos, this.mark);
  }
  merge(t) {
    return t instanceof at && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new at(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "addMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(t, n) {
    if (typeof n.from != "number" || typeof n.to != "number")
      throw new RangeError("Invalid input for AddMarkStep.fromJSON");
    return new at(n.from, n.to, t.markFromJSON(n.mark));
  }
}
re.jsonID("addMark", at);
class Be extends re {
  /**
  Create a mark-removing step.
  */
  constructor(t, n, r) {
    super(), this.from = t, this.to = n, this.mark = r;
  }
  apply(t) {
    let n = t.slice(this.from, this.to), r = new k(Dr(n.content, (s) => s.mark(this.mark.removeFromSet(s.marks)), t), n.openStart, n.openEnd);
    return W.fromReplace(t, this.from, this.to, r);
  }
  invert() {
    return new at(this.from, this.to, this.mark);
  }
  map(t) {
    let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1);
    return n.deleted && r.deleted || n.pos >= r.pos ? null : new Be(n.pos, r.pos, this.mark);
  }
  merge(t) {
    return t instanceof Be && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new Be(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "removeMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(t, n) {
    if (typeof n.from != "number" || typeof n.to != "number")
      throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
    return new Be(n.from, n.to, t.markFromJSON(n.mark));
  }
}
re.jsonID("removeMark", Be);
class ct extends re {
  /**
  Create a node mark step.
  */
  constructor(t, n) {
    super(), this.pos = t, this.mark = n;
  }
  apply(t) {
    let n = t.nodeAt(this.pos);
    if (!n)
      return W.fail("No node at mark step's position");
    let r = n.type.create(n.attrs, null, this.mark.addToSet(n.marks));
    return W.fromReplace(t, this.pos, this.pos + 1, new k(x.from(r), 0, n.isLeaf ? 0 : 1));
  }
  invert(t) {
    let n = t.nodeAt(this.pos);
    if (n) {
      let r = this.mark.addToSet(n.marks);
      if (r.length == n.marks.length) {
        for (let s = 0; s < n.marks.length; s++)
          if (!n.marks[s].isInSet(r))
            return new ct(this.pos, n.marks[s]);
        return new ct(this.pos, this.mark);
      }
    }
    return new Ft(this.pos, this.mark);
  }
  map(t) {
    let n = t.mapResult(this.pos, 1);
    return n.deletedAfter ? null : new ct(n.pos, this.mark);
  }
  toJSON() {
    return { stepType: "addNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(t, n) {
    if (typeof n.pos != "number")
      throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
    return new ct(n.pos, t.markFromJSON(n.mark));
  }
}
re.jsonID("addNodeMark", ct);
class Ft extends re {
  /**
  Create a mark-removing step.
  */
  constructor(t, n) {
    super(), this.pos = t, this.mark = n;
  }
  apply(t) {
    let n = t.nodeAt(this.pos);
    if (!n)
      return W.fail("No node at mark step's position");
    let r = n.type.create(n.attrs, null, this.mark.removeFromSet(n.marks));
    return W.fromReplace(t, this.pos, this.pos + 1, new k(x.from(r), 0, n.isLeaf ? 0 : 1));
  }
  invert(t) {
    let n = t.nodeAt(this.pos);
    return !n || !this.mark.isInSet(n.marks) ? this : new ct(this.pos, this.mark);
  }
  map(t) {
    let n = t.mapResult(this.pos, 1);
    return n.deletedAfter ? null : new Ft(n.pos, this.mark);
  }
  toJSON() {
    return { stepType: "removeNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(t, n) {
    if (typeof n.pos != "number")
      throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
    return new Ft(n.pos, t.markFromJSON(n.mark));
  }
}
re.jsonID("removeNodeMark", Ft);
class te extends re {
  /**
  The given `slice` should fit the 'gap' between `from` and
  `to`—the depths must line up, and the surrounding nodes must be
  able to be joined with the open sides of the slice. When
  `structure` is true, the step will fail if the content between
  from and to is not just a sequence of closing and then opening
  tokens (this is to guard against rebased replace steps
  overwriting something they weren't supposed to).
  */
  constructor(t, n, r, s = !1) {
    super(), this.from = t, this.to = n, this.slice = r, this.structure = s;
  }
  apply(t) {
    return this.structure && pr(t, this.from, this.to) ? W.fail("Structure replace would overwrite content") : W.fromReplace(t, this.from, this.to, this.slice);
  }
  getMap() {
    return new ye([this.from, this.to - this.from, this.slice.size]);
  }
  invert(t) {
    return new te(this.from, this.from + this.slice.size, t.slice(this.from, this.to));
  }
  map(t) {
    let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1);
    return n.deletedAcross && r.deletedAcross ? null : new te(n.pos, Math.max(n.pos, r.pos), this.slice, this.structure);
  }
  merge(t) {
    if (!(t instanceof te) || t.structure || this.structure)
      return null;
    if (this.from + this.slice.size == t.from && !this.slice.openEnd && !t.slice.openStart) {
      let n = this.slice.size + t.slice.size == 0 ? k.empty : new k(this.slice.content.append(t.slice.content), this.slice.openStart, t.slice.openEnd);
      return new te(this.from, this.to + (t.to - t.from), n, this.structure);
    } else if (t.to == this.from && !this.slice.openStart && !t.slice.openEnd) {
      let n = this.slice.size + t.slice.size == 0 ? k.empty : new k(t.slice.content.append(this.slice.content), t.slice.openStart, this.slice.openEnd);
      return new te(t.from, this.to, n, this.structure);
    } else
      return null;
  }
  toJSON() {
    let t = { stepType: "replace", from: this.from, to: this.to };
    return this.slice.size && (t.slice = this.slice.toJSON()), this.structure && (t.structure = !0), t;
  }
  /**
  @internal
  */
  static fromJSON(t, n) {
    if (typeof n.from != "number" || typeof n.to != "number")
      throw new RangeError("Invalid input for ReplaceStep.fromJSON");
    return new te(n.from, n.to, k.fromJSON(t, n.slice), !!n.structure);
  }
}
re.jsonID("replace", te);
class fe extends re {
  /**
  Create a replace-around step with the given range and gap.
  `insert` should be the point in the slice into which the content
  of the gap should be moved. `structure` has the same meaning as
  it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
  */
  constructor(t, n, r, s, o, l, a = !1) {
    super(), this.from = t, this.to = n, this.gapFrom = r, this.gapTo = s, this.slice = o, this.insert = l, this.structure = a;
  }
  apply(t) {
    if (this.structure && (pr(t, this.from, this.gapFrom) || pr(t, this.gapTo, this.to)))
      return W.fail("Structure gap-replace would overwrite content");
    let n = t.slice(this.gapFrom, this.gapTo);
    if (n.openStart || n.openEnd)
      return W.fail("Gap is not a flat range");
    let r = this.slice.insertAt(this.insert, n.content);
    return r ? W.fromReplace(t, this.from, this.to, r) : W.fail("Content does not fit in gap");
  }
  getMap() {
    return new ye([
      this.from,
      this.gapFrom - this.from,
      this.insert,
      this.gapTo,
      this.to - this.gapTo,
      this.slice.size - this.insert
    ]);
  }
  invert(t) {
    let n = this.gapTo - this.gapFrom;
    return new fe(this.from, this.from + this.slice.size + n, this.from + this.insert, this.from + this.insert + n, t.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
  }
  map(t) {
    let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1), s = this.from == this.gapFrom ? n.pos : t.map(this.gapFrom, -1), o = this.to == this.gapTo ? r.pos : t.map(this.gapTo, 1);
    return n.deletedAcross && r.deletedAcross || s < n.pos || o > r.pos ? null : new fe(n.pos, r.pos, s, o, this.slice, this.insert, this.structure);
  }
  toJSON() {
    let t = {
      stepType: "replaceAround",
      from: this.from,
      to: this.to,
      gapFrom: this.gapFrom,
      gapTo: this.gapTo,
      insert: this.insert
    };
    return this.slice.size && (t.slice = this.slice.toJSON()), this.structure && (t.structure = !0), t;
  }
  /**
  @internal
  */
  static fromJSON(t, n) {
    if (typeof n.from != "number" || typeof n.to != "number" || typeof n.gapFrom != "number" || typeof n.gapTo != "number" || typeof n.insert != "number")
      throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
    return new fe(n.from, n.to, n.gapFrom, n.gapTo, k.fromJSON(t, n.slice), n.insert, !!n.structure);
  }
}
re.jsonID("replaceAround", fe);
function pr(i, t, n) {
  let r = i.resolve(t), s = n - t, o = r.depth;
  for (; s > 0 && o > 0 && r.indexAfter(o) == r.node(o).childCount; )
    o--, s--;
  if (s > 0) {
    let l = r.node(o).maybeChild(r.indexAfter(o));
    for (; s > 0; ) {
      if (!l || l.isLeaf)
        return !0;
      l = l.firstChild, s--;
    }
  }
  return !1;
}
function tc(i, t, n, r) {
  let s = [], o = [], l, a;
  i.doc.nodesBetween(t, n, (c, u, d) => {
    if (!c.isInline)
      return;
    let h = c.marks;
    if (!r.isInSet(h) && d.type.allowsMarkType(r.type)) {
      let f = Math.max(u, t), p = Math.min(u + c.nodeSize, n), m = r.addToSet(h);
      for (let y = 0; y < h.length; y++)
        h[y].isInSet(m) || (l && l.to == f && l.mark.eq(h[y]) ? l.to = p : s.push(l = new Be(f, p, h[y])));
      a && a.to == f ? a.to = p : o.push(a = new at(f, p, r));
    }
  }), s.forEach((c) => i.step(c)), o.forEach((c) => i.step(c));
}
function nc(i, t, n, r) {
  let s = [], o = 0;
  i.doc.nodesBetween(t, n, (l, a) => {
    if (!l.isInline)
      return;
    o++;
    let c = null;
    if (r instanceof Fn) {
      let u = l.marks, d;
      for (; d = r.isInSet(u); )
        (c || (c = [])).push(d), u = d.removeFromSet(u);
    } else r ? r.isInSet(l.marks) && (c = [r]) : c = l.marks;
    if (c && c.length) {
      let u = Math.min(a + l.nodeSize, n);
      for (let d = 0; d < c.length; d++) {
        let h = c[d], f;
        for (let p = 0; p < s.length; p++) {
          let m = s[p];
          m.step == o - 1 && h.eq(s[p].style) && (f = m);
        }
        f ? (f.to = u, f.step = o) : s.push({ style: h, from: Math.max(a, t), to: u, step: o });
      }
    }
  }), s.forEach((l) => i.step(new Be(l.from, l.to, l.style)));
}
function zr(i, t, n, r = n.contentMatch, s = !0) {
  let o = i.doc.nodeAt(t), l = [], a = t + 1;
  for (let c = 0; c < o.childCount; c++) {
    let u = o.child(c), d = a + u.nodeSize, h = r.matchType(u.type);
    if (!h)
      l.push(new te(a, d, k.empty));
    else {
      r = h;
      for (let f = 0; f < u.marks.length; f++)
        n.allowsMarkType(u.marks[f].type) || i.step(new Be(a, d, u.marks[f]));
      if (s && u.isText && n.whitespace != "pre") {
        let f, p = /\r?\n|\r/g, m;
        for (; f = p.exec(u.text); )
          m || (m = new k(x.from(n.schema.text(" ", n.allowedMarks(u.marks))), 0, 0)), l.push(new te(a + f.index, a + f.index + f[0].length, m));
      }
    }
    a = d;
  }
  if (!r.validEnd) {
    let c = r.fillBefore(x.empty, !0);
    i.replace(a, a, new k(c, 0, 0));
  }
  for (let c = l.length - 1; c >= 0; c--)
    i.step(l[c]);
}
function ic(i, t, n) {
  return (t == 0 || i.canReplace(t, i.childCount)) && (n == i.childCount || i.canReplace(0, n));
}
function Di(i) {
  let n = i.parent.content.cutByIndex(i.startIndex, i.endIndex);
  for (let r = i.depth, s = 0, o = 0; ; --r) {
    let l = i.$from.node(r), a = i.$from.index(r) + s, c = i.$to.indexAfter(r) - o;
    if (r < i.depth && l.canReplace(a, c, n))
      return r;
    if (r == 0 || l.type.spec.isolating || !ic(l, a, c))
      break;
    a && (s = 1), c < l.childCount && (o = 1);
  }
  return null;
}
function rc(i, t, n) {
  let { $from: r, $to: s, depth: o } = t, l = r.before(o + 1), a = s.after(o + 1), c = l, u = a, d = x.empty, h = 0;
  for (let m = o, y = !1; m > n; m--)
    y || r.index(m) > 0 ? (y = !0, d = x.from(r.node(m).copy(d)), h++) : c--;
  let f = x.empty, p = 0;
  for (let m = o, y = !1; m > n; m--)
    y || s.after(m + 1) < s.end(m) ? (y = !0, f = x.from(s.node(m).copy(f)), p++) : u++;
  i.step(new fe(c, u, l, a, new k(d.append(f), h, p), d.size - h, !0));
}
function Xo(i, t, n = null, r = i) {
  let s = sc(i, t), o = s && oc(r, t);
  return o ? s.map(ys).concat({ type: t, attrs: n }).concat(o.map(ys)) : null;
}
function ys(i) {
  return { type: i, attrs: null };
}
function sc(i, t) {
  let { parent: n, startIndex: r, endIndex: s } = i, o = n.contentMatchAt(r).findWrapping(t);
  if (!o)
    return null;
  let l = o.length ? o[0] : t;
  return n.canReplaceWith(r, s, l) ? o : null;
}
function oc(i, t) {
  let { parent: n, startIndex: r, endIndex: s } = i, o = n.child(r), l = t.contentMatch.findWrapping(o.type);
  if (!l)
    return null;
  let c = (l.length ? l[l.length - 1] : t).contentMatch;
  for (let u = r; c && u < s; u++)
    c = c.matchType(n.child(u).type);
  return !c || !c.validEnd ? null : l;
}
function lc(i, t, n) {
  let r = x.empty;
  for (let l = n.length - 1; l >= 0; l--) {
    if (r.size) {
      let a = n[l].type.contentMatch.matchFragment(r);
      if (!a || !a.validEnd)
        throw new RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
    }
    r = x.from(n[l].type.create(n[l].attrs, r));
  }
  let s = t.start, o = t.end;
  i.step(new fe(s, o, s, o, new k(r, 0, 0), n.length, !0));
}
function ac(i, t, n, r, s) {
  if (!r.isTextblock)
    throw new RangeError("Type given to setBlockType should be a textblock");
  let o = i.steps.length;
  i.doc.nodesBetween(t, n, (l, a) => {
    let c = typeof s == "function" ? s(l) : s;
    if (l.isTextblock && !l.hasMarkup(r, c) && cc(i.doc, i.mapping.slice(o).map(a), r)) {
      let u = null;
      if (r.schema.linebreakReplacement) {
        let p = r.whitespace == "pre", m = !!r.contentMatch.matchType(r.schema.linebreakReplacement);
        p && !m ? u = !1 : !p && m && (u = !0);
      }
      u === !1 && Go(i, l, a, o), zr(i, i.mapping.slice(o).map(a, 1), r, void 0, u === null);
      let d = i.mapping.slice(o), h = d.map(a, 1), f = d.map(a + l.nodeSize, 1);
      return i.step(new fe(h, f, h + 1, f - 1, new k(x.from(r.create(c, null, l.marks)), 0, 0), 1, !0)), u === !0 && Yo(i, l, a, o), !1;
    }
  });
}
function Yo(i, t, n, r) {
  t.forEach((s, o) => {
    if (s.isText) {
      let l, a = /\r?\n|\r/g;
      for (; l = a.exec(s.text); ) {
        let c = i.mapping.slice(r).map(n + 1 + o + l.index);
        i.replaceWith(c, c + 1, t.type.schema.linebreakReplacement.create());
      }
    }
  });
}
function Go(i, t, n, r) {
  t.forEach((s, o) => {
    if (s.type == s.type.schema.linebreakReplacement) {
      let l = i.mapping.slice(r).map(n + 1 + o);
      i.replaceWith(l, l + 1, t.type.schema.text(`
`));
    }
  });
}
function cc(i, t, n) {
  let r = i.resolve(t), s = r.index();
  return r.parent.canReplaceWith(s, s + 1, n);
}
function uc(i, t, n, r, s) {
  let o = i.doc.nodeAt(t);
  if (!o)
    throw new RangeError("No node at given position");
  n || (n = o.type);
  let l = n.create(r, null, s || o.marks);
  if (o.isLeaf)
    return i.replaceWith(t, t + o.nodeSize, l);
  if (!n.validContent(o.content))
    throw new RangeError("Invalid content for node type " + n.name);
  i.step(new fe(t, t + o.nodeSize, t + 1, t + o.nodeSize - 1, new k(x.from(l), 0, 0), 1, !0));
}
function Tn(i, t, n = 1, r) {
  let s = i.resolve(t), o = s.depth - n, l = r && r[r.length - 1] || s.parent;
  if (o < 0 || s.parent.type.spec.isolating || !s.parent.canReplace(s.index(), s.parent.childCount) || !l.type.validContent(s.parent.content.cutByIndex(s.index(), s.parent.childCount)))
    return !1;
  for (let u = s.depth - 1, d = n - 2; u > o; u--, d--) {
    let h = s.node(u), f = s.index(u);
    if (h.type.spec.isolating)
      return !1;
    let p = h.content.cutByIndex(f, h.childCount), m = r && r[d + 1];
    m && (p = p.replaceChild(0, m.type.create(m.attrs)));
    let y = r && r[d] || h;
    if (!h.canReplace(f + 1, h.childCount) || !y.type.validContent(p))
      return !1;
  }
  let a = s.indexAfter(o), c = r && r[0];
  return s.node(o).canReplaceWith(a, a, c ? c.type : s.node(o + 1).type);
}
function dc(i, t, n = 1, r) {
  let s = i.doc.resolve(t), o = x.empty, l = x.empty;
  for (let a = s.depth, c = s.depth - n, u = n - 1; a > c; a--, u--) {
    o = x.from(s.node(a).copy(o));
    let d = r && r[u];
    l = x.from(d ? d.type.create(d.attrs, l) : s.node(a).copy(l));
  }
  i.step(new te(t, t, new k(o.append(l), n, n), !0));
}
function Zo(i, t) {
  let n = i.resolve(t), r = n.index();
  return fc(n.nodeBefore, n.nodeAfter) && n.parent.canReplace(r, r + 1);
}
function hc(i, t) {
  t.content.size || i.type.compatibleContent(t.type);
  let n = i.contentMatchAt(i.childCount), { linebreakReplacement: r } = i.type.schema;
  for (let s = 0; s < t.childCount; s++) {
    let o = t.child(s), l = o.type == r ? i.type.schema.nodes.text : o.type;
    if (n = n.matchType(l), !n || !i.type.allowsMarks(o.marks))
      return !1;
  }
  return n.validEnd;
}
function fc(i, t) {
  return !!(i && t && !i.isLeaf && hc(i, t));
}
function pc(i, t, n) {
  let r = null, { linebreakReplacement: s } = i.doc.type.schema, o = i.doc.resolve(t - n), l = o.node().type;
  if (s && l.inlineContent) {
    let d = l.whitespace == "pre", h = !!l.contentMatch.matchType(s);
    d && !h ? r = !1 : !d && h && (r = !0);
  }
  let a = i.steps.length;
  if (r === !1) {
    let d = i.doc.resolve(t + n);
    Go(i, d.node(), d.before(), a);
  }
  l.inlineContent && zr(i, t + n - 1, l, o.node().contentMatchAt(o.index()), r == null);
  let c = i.mapping.slice(a), u = c.map(t - n);
  if (i.step(new te(u, c.map(t + n, -1), k.empty, !0)), r === !0) {
    let d = i.doc.resolve(u);
    Yo(i, d.node(), d.before(), i.steps.length);
  }
  return i;
}
function mc(i, t, n) {
  let r = i.resolve(t);
  if (r.parent.canReplaceWith(r.index(), r.index(), n))
    return t;
  if (r.parentOffset == 0)
    for (let s = r.depth - 1; s >= 0; s--) {
      let o = r.index(s);
      if (r.node(s).canReplaceWith(o, o, n))
        return r.before(s + 1);
      if (o > 0)
        return null;
    }
  if (r.parentOffset == r.parent.content.size)
    for (let s = r.depth - 1; s >= 0; s--) {
      let o = r.indexAfter(s);
      if (r.node(s).canReplaceWith(o, o, n))
        return r.after(s + 1);
      if (o < r.node(s).childCount)
        return null;
    }
  return null;
}
function gc(i, t, n) {
  let r = i.resolve(t);
  if (!n.content.size)
    return t;
  let s = n.content;
  for (let o = 0; o < n.openStart; o++)
    s = s.firstChild.content;
  for (let o = 1; o <= (n.openStart == 0 && n.size ? 2 : 1); o++)
    for (let l = r.depth; l >= 0; l--) {
      let a = l == r.depth ? 0 : r.pos <= (r.start(l + 1) + r.end(l + 1)) / 2 ? -1 : 1, c = r.index(l) + (a > 0 ? 1 : 0), u = r.node(l), d = !1;
      if (o == 1)
        d = u.canReplace(c, c, s);
      else {
        let h = u.contentMatchAt(c).findWrapping(s.firstChild.type);
        d = h && u.canReplaceWith(c, c, h[0]);
      }
      if (d)
        return a == 0 ? r.pos : a < 0 ? r.before(l + 1) : r.after(l + 1);
    }
  return null;
}
function Rr(i, t, n = t, r = k.empty) {
  if (t == n && !r.size)
    return null;
  let s = i.resolve(t), o = i.resolve(n);
  return Qo(s, o, r) ? new te(t, n, r) : new yc(s, o, r).fit();
}
function Qo(i, t, n) {
  return !n.openStart && !n.openEnd && i.start() == t.start() && i.parent.canReplace(i.index(), t.index(), n.content);
}
class yc {
  constructor(t, n, r) {
    this.$from = t, this.$to = n, this.unplaced = r, this.frontier = [], this.placed = x.empty;
    for (let s = 0; s <= t.depth; s++) {
      let o = t.node(s);
      this.frontier.push({
        type: o.type,
        match: o.contentMatchAt(t.indexAfter(s))
      });
    }
    for (let s = t.depth; s > 0; s--)
      this.placed = x.from(t.node(s).copy(this.placed));
  }
  get depth() {
    return this.frontier.length - 1;
  }
  fit() {
    for (; this.unplaced.size; ) {
      let u = this.findFittable();
      u ? this.placeNodes(u) : this.openMore() || this.dropNode();
    }
    let t = this.mustMoveInline(), n = this.placed.size - this.depth - this.$from.depth, r = this.$from, s = this.close(t < 0 ? this.$to : r.doc.resolve(t));
    if (!s)
      return null;
    let o = this.placed, l = r.depth, a = s.depth;
    for (; l && a && o.childCount == 1; )
      o = o.firstChild.content, l--, a--;
    let c = new k(o, l, a);
    return t > -1 ? new fe(r.pos, t, this.$to.pos, this.$to.end(), c, n) : c.size || r.pos != this.$to.pos ? new te(r.pos, s.pos, c) : null;
  }
  // Find a position on the start spine of `this.unplaced` that has
  // content that can be moved somewhere on the frontier. Returns two
  // depths, one for the slice and one for the frontier.
  findFittable() {
    let t = this.unplaced.openStart;
    for (let n = this.unplaced.content, r = 0, s = this.unplaced.openEnd; r < t; r++) {
      let o = n.firstChild;
      if (n.childCount > 1 && (s = 0), o.type.spec.isolating && s <= r) {
        t = r;
        break;
      }
      n = o.content;
    }
    for (let n = 1; n <= 2; n++)
      for (let r = n == 1 ? t : this.unplaced.openStart; r >= 0; r--) {
        let s, o = null;
        r ? (o = ji(this.unplaced.content, r - 1).firstChild, s = o.content) : s = this.unplaced.content;
        let l = s.firstChild;
        for (let a = this.depth; a >= 0; a--) {
          let { type: c, match: u } = this.frontier[a], d, h = null;
          if (n == 1 && (l ? u.matchType(l.type) || (h = u.fillBefore(x.from(l), !1)) : o && c.compatibleContent(o.type)))
            return { sliceDepth: r, frontierDepth: a, parent: o, inject: h };
          if (n == 2 && l && (d = u.findWrapping(l.type)))
            return { sliceDepth: r, frontierDepth: a, parent: o, wrap: d };
          if (o && u.matchType(o.type))
            break;
        }
      }
  }
  openMore() {
    let { content: t, openStart: n, openEnd: r } = this.unplaced, s = ji(t, n);
    return !s.childCount || s.firstChild.isLeaf ? !1 : (this.unplaced = new k(t, n + 1, Math.max(r, s.size + n >= t.size - r ? n + 1 : 0)), !0);
  }
  dropNode() {
    let { content: t, openStart: n, openEnd: r } = this.unplaced, s = ji(t, n);
    if (s.childCount <= 1 && n > 0) {
      let o = t.size - n <= n + s.size;
      this.unplaced = new k(xn(t, n - 1, 1), n - 1, o ? n - 1 : r);
    } else
      this.unplaced = new k(xn(t, n, 1), n, r);
  }
  // Move content from the unplaced slice at `sliceDepth` to the
  // frontier node at `frontierDepth`. Close that frontier node when
  // applicable.
  placeNodes({ sliceDepth: t, frontierDepth: n, parent: r, inject: s, wrap: o }) {
    for (; this.depth > n; )
      this.closeFrontierNode();
    if (o)
      for (let y = 0; y < o.length; y++)
        this.openFrontierNode(o[y]);
    let l = this.unplaced, a = r ? r.content : l.content, c = l.openStart - t, u = 0, d = [], { match: h, type: f } = this.frontier[n];
    if (s) {
      for (let y = 0; y < s.childCount; y++)
        d.push(s.child(y));
      h = h.matchFragment(s);
    }
    let p = a.size + t - (l.content.size - l.openEnd);
    for (; u < a.childCount; ) {
      let y = a.child(u), b = h.matchType(y.type);
      if (!b)
        break;
      u++, (u > 1 || c == 0 || y.content.size) && (h = b, d.push(el(y.mark(f.allowedMarks(y.marks)), u == 1 ? c : 0, u == a.childCount ? p : -1)));
    }
    let m = u == a.childCount;
    m || (p = -1), this.placed = kn(this.placed, n, x.from(d)), this.frontier[n].match = h, m && p < 0 && r && r.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
    for (let y = 0, b = a; y < p; y++) {
      let w = b.lastChild;
      this.frontier.push({ type: w.type, match: w.contentMatchAt(w.childCount) }), b = w.content;
    }
    this.unplaced = m ? t == 0 ? k.empty : new k(xn(l.content, t - 1, 1), t - 1, p < 0 ? l.openEnd : t - 1) : new k(xn(l.content, t, u), l.openStart, l.openEnd);
  }
  mustMoveInline() {
    if (!this.$to.parent.isTextblock)
      return -1;
    let t = this.frontier[this.depth], n;
    if (!t.type.isTextblock || !_i(this.$to, this.$to.depth, t.type, t.match, !1) || this.$to.depth == this.depth && (n = this.findCloseLevel(this.$to)) && n.depth == this.depth)
      return -1;
    let { depth: r } = this.$to, s = this.$to.after(r);
    for (; r > 1 && s == this.$to.end(--r); )
      ++s;
    return s;
  }
  findCloseLevel(t) {
    e: for (let n = Math.min(this.depth, t.depth); n >= 0; n--) {
      let { match: r, type: s } = this.frontier[n], o = n < t.depth && t.end(n + 1) == t.pos + (t.depth - (n + 1)), l = _i(t, n, s, r, o);
      if (l) {
        for (let a = n - 1; a >= 0; a--) {
          let { match: c, type: u } = this.frontier[a], d = _i(t, a, u, c, !0);
          if (!d || d.childCount)
            continue e;
        }
        return { depth: n, fit: l, move: o ? t.doc.resolve(t.after(n + 1)) : t };
      }
    }
  }
  close(t) {
    let n = this.findCloseLevel(t);
    if (!n)
      return null;
    for (; this.depth > n.depth; )
      this.closeFrontierNode();
    n.fit.childCount && (this.placed = kn(this.placed, n.depth, n.fit)), t = n.move;
    for (let r = n.depth + 1; r <= t.depth; r++) {
      let s = t.node(r), o = s.type.contentMatch.fillBefore(s.content, !0, t.index(r));
      this.openFrontierNode(s.type, s.attrs, o);
    }
    return t;
  }
  openFrontierNode(t, n = null, r) {
    let s = this.frontier[this.depth];
    s.match = s.match.matchType(t), this.placed = kn(this.placed, this.depth, x.from(t.create(n, r))), this.frontier.push({ type: t, match: t.contentMatch });
  }
  closeFrontierNode() {
    let n = this.frontier.pop().match.fillBefore(x.empty, !0);
    n.childCount && (this.placed = kn(this.placed, this.frontier.length, n));
  }
}
function xn(i, t, n) {
  return t == 0 ? i.cutByIndex(n, i.childCount) : i.replaceChild(0, i.firstChild.copy(xn(i.firstChild.content, t - 1, n)));
}
function kn(i, t, n) {
  return t == 0 ? i.append(n) : i.replaceChild(i.childCount - 1, i.lastChild.copy(kn(i.lastChild.content, t - 1, n)));
}
function ji(i, t) {
  for (let n = 0; n < t; n++)
    i = i.firstChild.content;
  return i;
}
function el(i, t, n) {
  if (t <= 0)
    return i;
  let r = i.content;
  return t > 1 && (r = r.replaceChild(0, el(r.firstChild, t - 1, r.childCount == 1 ? n - 1 : 0))), t > 0 && (r = i.type.contentMatch.fillBefore(r).append(r), n <= 0 && (r = r.append(i.type.contentMatch.matchFragment(r).fillBefore(x.empty, !0)))), i.copy(r);
}
function _i(i, t, n, r, s) {
  let o = i.node(t), l = s ? i.indexAfter(t) : i.index(t);
  if (l == o.childCount && !n.compatibleContent(o.type))
    return null;
  let a = r.fillBefore(o.content, !0, l);
  return a && !bc(n, o.content, l) ? a : null;
}
function bc(i, t, n) {
  for (let r = n; r < t.childCount; r++)
    if (!i.allowsMarks(t.child(r).marks))
      return !0;
  return !1;
}
function vc(i) {
  return i.spec.defining || i.spec.definingForContent;
}
function wc(i, t, n, r) {
  if (!r.size)
    return i.deleteRange(t, n);
  let s = i.doc.resolve(t), o = i.doc.resolve(n);
  if (Qo(s, o, r))
    return i.step(new te(t, n, r));
  let l = nl(s, o);
  l[l.length - 1] == 0 && l.pop();
  let a = -(s.depth + 1);
  l.unshift(a);
  for (let f = s.depth, p = s.pos - 1; f > 0; f--, p--) {
    let m = s.node(f).type.spec;
    if (m.defining || m.definingAsContext || m.isolating)
      break;
    l.indexOf(f) > -1 ? a = f : s.before(f) == p && l.splice(1, 0, -f);
  }
  let c = l.indexOf(a), u = [], d = r.openStart;
  for (let f = r.content, p = 0; ; p++) {
    let m = f.firstChild;
    if (u.push(m), p == r.openStart)
      break;
    f = m.content;
  }
  for (let f = d - 1; f >= 0; f--) {
    let p = u[f], m = vc(p.type);
    if (m && !p.sameMarkup(s.node(Math.abs(a) - 1)))
      d = f;
    else if (m || !p.type.isTextblock)
      break;
  }
  for (let f = r.openStart; f >= 0; f--) {
    let p = (f + d + 1) % (r.openStart + 1), m = u[p];
    if (m)
      for (let y = 0; y < l.length; y++) {
        let b = l[(y + c) % l.length], w = !0;
        b < 0 && (w = !1, b = -b);
        let D = s.node(b - 1), B = s.index(b - 1);
        if (D.canReplaceWith(B, B, m.type, m.marks))
          return i.replace(s.before(b), w ? o.after(b) : n, new k(tl(r.content, 0, r.openStart, p), p, r.openEnd));
      }
  }
  let h = i.steps.length;
  for (let f = l.length - 1; f >= 0 && (i.replace(t, n, r), !(i.steps.length > h)); f--) {
    let p = l[f];
    p < 0 || (t = s.before(p), n = o.after(p));
  }
}
function tl(i, t, n, r, s) {
  if (t < n) {
    let o = i.firstChild;
    i = i.replaceChild(0, o.copy(tl(o.content, t + 1, n, r, o)));
  }
  if (t > r) {
    let o = s.contentMatchAt(0), l = o.fillBefore(i).append(i);
    i = l.append(o.matchFragment(l).fillBefore(x.empty, !0));
  }
  return i;
}
function xc(i, t, n, r) {
  if (!r.isInline && t == n && i.doc.resolve(t).parent.content.size) {
    let s = mc(i.doc, t, r.type);
    s != null && (t = n = s);
  }
  i.replaceRange(t, n, new k(x.from(r), 0, 0));
}
function kc(i, t, n) {
  let r = i.doc.resolve(t), s = i.doc.resolve(n), o = nl(r, s);
  for (let l = 0; l < o.length; l++) {
    let a = o[l], c = l == o.length - 1;
    if (c && a == 0 || r.node(a).type.contentMatch.validEnd)
      return i.delete(r.start(a), s.end(a));
    if (a > 0 && (c || r.node(a - 1).canReplace(r.index(a - 1), s.indexAfter(a - 1))))
      return i.delete(r.before(a), s.after(a));
  }
  for (let l = 1; l <= r.depth && l <= s.depth; l++)
    if (t - r.start(l) == r.depth - l && n > r.end(l) && s.end(l) - n != s.depth - l && r.start(l - 1) == s.start(l - 1) && r.node(l - 1).canReplace(r.index(l - 1), s.index(l - 1)))
      return i.delete(r.before(l), n);
  i.delete(t, n);
}
function nl(i, t) {
  let n = [], r = Math.min(i.depth, t.depth);
  for (let s = r; s >= 0; s--) {
    let o = i.start(s);
    if (o < i.pos - (i.depth - s) || t.end(s) > t.pos + (t.depth - s) || i.node(s).type.spec.isolating || t.node(s).type.spec.isolating)
      break;
    (o == t.start(s) || s == i.depth && s == t.depth && i.parent.inlineContent && t.parent.inlineContent && s && t.start(s - 1) == o - 1) && n.push(s);
  }
  return n;
}
class Zt extends re {
  /**
  Construct an attribute step.
  */
  constructor(t, n, r) {
    super(), this.pos = t, this.attr = n, this.value = r;
  }
  apply(t) {
    let n = t.nodeAt(this.pos);
    if (!n)
      return W.fail("No node at attribute step's position");
    let r = /* @__PURE__ */ Object.create(null);
    for (let o in n.attrs)
      r[o] = n.attrs[o];
    r[this.attr] = this.value;
    let s = n.type.create(r, null, n.marks);
    return W.fromReplace(t, this.pos, this.pos + 1, new k(x.from(s), 0, n.isLeaf ? 0 : 1));
  }
  getMap() {
    return ye.empty;
  }
  invert(t) {
    return new Zt(this.pos, this.attr, t.nodeAt(this.pos).attrs[this.attr]);
  }
  map(t) {
    let n = t.mapResult(this.pos, 1);
    return n.deletedAfter ? null : new Zt(n.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(t, n) {
    if (typeof n.pos != "number" || typeof n.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new Zt(n.pos, n.attr, n.value);
  }
}
re.jsonID("attr", Zt);
class Rn extends re {
  /**
  Construct an attribute step.
  */
  constructor(t, n) {
    super(), this.attr = t, this.value = n;
  }
  apply(t) {
    let n = /* @__PURE__ */ Object.create(null);
    for (let s in t.attrs)
      n[s] = t.attrs[s];
    n[this.attr] = this.value;
    let r = t.type.create(n, t.content, t.marks);
    return W.ok(r);
  }
  getMap() {
    return ye.empty;
  }
  invert(t) {
    return new Rn(this.attr, t.attrs[this.attr]);
  }
  map(t) {
    return this;
  }
  toJSON() {
    return { stepType: "docAttr", attr: this.attr, value: this.value };
  }
  static fromJSON(t, n) {
    if (typeof n.attr != "string")
      throw new RangeError("Invalid input for DocAttrStep.fromJSON");
    return new Rn(n.attr, n.value);
  }
}
re.jsonID("docAttr", Rn);
let sn = class extends Error {
};
sn = function i(t) {
  let n = Error.call(this, t);
  return n.__proto__ = i.prototype, n;
};
sn.prototype = Object.create(Error.prototype);
sn.prototype.constructor = sn;
sn.prototype.name = "TransformError";
class il {
  /**
  Create a transform that starts with the given document.
  */
  constructor(t) {
    this.doc = t, this.steps = [], this.docs = [], this.mapping = new zn();
  }
  /**
  The starting document.
  */
  get before() {
    return this.docs.length ? this.docs[0] : this.doc;
  }
  /**
  Apply a new step in this transform, saving the result. Throws an
  error when the step fails.
  */
  step(t) {
    let n = this.maybeStep(t);
    if (n.failed)
      throw new sn(n.failed);
    return this;
  }
  /**
  Try to apply a step in this transformation, ignoring it if it
  fails. Returns the step result.
  */
  maybeStep(t) {
    let n = t.apply(this.doc);
    return n.failed || this.addStep(t, n.doc), n;
  }
  /**
  True when the document has been changed (when there are any
  steps).
  */
  get docChanged() {
    return this.steps.length > 0;
  }
  /**
  Return a single range, in post-transform document positions,
  that covers all content changed by this transform. Returns null
  if no replacements are made. Note that this will ignore changes
  that add/remove marks without replacing the underlying content.
  */
  changedRange() {
    let t = 1e9, n = -1e9;
    for (let r = 0; r < this.mapping.maps.length; r++) {
      let s = this.mapping.maps[r];
      r && (t = s.map(t, 1), n = s.map(n, -1)), s.forEach((o, l, a, c) => {
        t = Math.min(t, a), n = Math.max(n, c);
      });
    }
    return t == 1e9 ? null : { from: t, to: n };
  }
  /**
  @internal
  */
  addStep(t, n) {
    this.docs.push(this.doc), this.steps.push(t), this.mapping.appendMap(t.getMap()), this.doc = n;
  }
  /**
  Replace the part of the document between `from` and `to` with the
  given `slice`.
  */
  replace(t, n = t, r = k.empty) {
    let s = Rr(this.doc, t, n, r);
    return s && this.step(s), this;
  }
  /**
  Replace the given range with the given content, which may be a
  fragment, node, or array of nodes.
  */
  replaceWith(t, n, r) {
    return this.replace(t, n, new k(x.from(r), 0, 0));
  }
  /**
  Delete the content between the given positions.
  */
  delete(t, n) {
    return this.replace(t, n, k.empty);
  }
  /**
  Insert the given content at the given position.
  */
  insert(t, n) {
    return this.replaceWith(t, t, n);
  }
  /**
  Replace a range of the document with a given slice, using
  `from`, `to`, and the slice's
  [`openStart`](https://prosemirror.net/docs/ref/#model.Slice.openStart) property as hints, rather
  than fixed start and end points. This method may grow the
  replaced area or close open nodes in the slice in order to get a
  fit that is more in line with WYSIWYG expectations, by dropping
  fully covered parent nodes of the replaced region when they are
  marked [non-defining as
  context](https://prosemirror.net/docs/ref/#model.NodeSpec.definingAsContext), or including an
  open parent node from the slice that _is_ marked as [defining
  its content](https://prosemirror.net/docs/ref/#model.NodeSpec.definingForContent).
  
  This is the method, for example, to handle paste. The similar
  [`replace`](https://prosemirror.net/docs/ref/#transform.Transform.replace) method is a more
  primitive tool which will _not_ move the start and end of its given
  range, and is useful in situations where you need more precise
  control over what happens.
  */
  replaceRange(t, n, r) {
    return wc(this, t, n, r), this;
  }
  /**
  Replace the given range with a node, but use `from` and `to` as
  hints, rather than precise positions. When from and to are the same
  and are at the start or end of a parent node in which the given
  node doesn't fit, this method may _move_ them out towards a parent
  that does allow the given node to be placed. When the given range
  completely covers a parent node, this method may completely replace
  that parent node.
  */
  replaceRangeWith(t, n, r) {
    return xc(this, t, n, r), this;
  }
  /**
  Delete the given range, expanding it to cover fully covered
  parent nodes until a valid replace is found.
  */
  deleteRange(t, n) {
    return kc(this, t, n), this;
  }
  /**
  Split the content in the given range off from its parent, if there
  is sibling content before or after it, and move it up the tree to
  the depth specified by `target`. You'll probably want to use
  [`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
  sure the lift is valid.
  */
  lift(t, n) {
    return rc(this, t, n), this;
  }
  /**
  Join the blocks around the given position. If depth is 2, their
  last and first siblings are also joined, and so on.
  */
  join(t, n = 1) {
    return pc(this, t, n), this;
  }
  /**
  Wrap the given [range](https://prosemirror.net/docs/ref/#model.NodeRange) in the given set of wrappers.
  The wrappers are assumed to be valid in this position, and should
  probably be computed with [`findWrapping`](https://prosemirror.net/docs/ref/#transform.findWrapping).
  */
  wrap(t, n) {
    return lc(this, t, n), this;
  }
  /**
  Set the type of all textblocks (partly) between `from` and `to` to
  the given node type with the given attributes.
  */
  setBlockType(t, n = t, r, s = null) {
    return ac(this, t, n, r, s), this;
  }
  /**
  Change the type, attributes, and/or marks of the node at `pos`.
  When `type` isn't given, the existing node type is preserved,
  */
  setNodeMarkup(t, n, r = null, s) {
    return uc(this, t, n, r, s), this;
  }
  /**
  Set a single attribute on a given node to a new value.
  The `pos` addresses the document content. Use `setDocAttribute`
  to set attributes on the document itself.
  */
  setNodeAttribute(t, n, r) {
    return this.step(new Zt(t, n, r)), this;
  }
  /**
  Set a single attribute on the document to a new value.
  */
  setDocAttribute(t, n) {
    return this.step(new Rn(t, n)), this;
  }
  /**
  Add a mark to the node at position `pos`.
  */
  addNodeMark(t, n) {
    return this.step(new ct(t, n)), this;
  }
  /**
  Remove a mark (or all marks of the given type) from the node at
  position `pos`.
  */
  removeNodeMark(t, n) {
    let r = this.doc.nodeAt(t);
    if (!r)
      throw new RangeError("No node at position " + t);
    if (n instanceof I)
      n.isInSet(r.marks) && this.step(new Ft(t, n));
    else {
      let s = r.marks, o, l = [];
      for (; o = n.isInSet(s); )
        l.push(new Ft(t, o)), s = o.removeFromSet(s);
      for (let a = l.length - 1; a >= 0; a--)
        this.step(l[a]);
    }
    return this;
  }
  /**
  Split the node at the given position, and optionally, if `depth` is
  greater than one, any number of nodes above that. By default, the
  parts split off will inherit the node type of the original node.
  This can be changed by passing an array of types and attributes to
  use after the split (with the outermost nodes coming first).
  */
  split(t, n = 1, r) {
    return dc(this, t, n, r), this;
  }
  /**
  Add the given mark to the inline content between `from` and `to`.
  */
  addMark(t, n, r) {
    return tc(this, t, n, r), this;
  }
  /**
  Remove marks from inline nodes between `from` and `to`. When
  `mark` is a single mark, remove precisely that mark. When it is
  a mark type, remove all marks of that type. When it is null,
  remove all marks of any type.
  */
  removeMark(t, n, r) {
    return nc(this, t, n, r), this;
  }
  /**
  Removes all marks and nodes from the content of the node at
  `pos` that don't match the given new parent node type. Accepts
  an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
  third argument.
  */
  clearIncompatible(t, n, r) {
    return zr(this, t, n, r), this;
  }
}
const Ki = /* @__PURE__ */ Object.create(null);
class q {
  /**
  Initialize a selection with the head and anchor and ranges. If no
  ranges are given, constructs a single range across `$anchor` and
  `$head`.
  */
  constructor(t, n, r) {
    this.$anchor = t, this.$head = n, this.ranges = r || [new Ir(t.min(n), t.max(n))];
  }
  /**
  The selection's anchor, as an unresolved position.
  */
  get anchor() {
    return this.$anchor.pos;
  }
  /**
  The selection's head.
  */
  get head() {
    return this.$head.pos;
  }
  /**
  The lower bound of the selection's main range.
  */
  get from() {
    return this.$from.pos;
  }
  /**
  The upper bound of the selection's main range.
  */
  get to() {
    return this.$to.pos;
  }
  /**
  The resolved lower  bound of the selection's main range.
  */
  get $from() {
    return this.ranges[0].$from;
  }
  /**
  The resolved upper bound of the selection's main range.
  */
  get $to() {
    return this.ranges[0].$to;
  }
  /**
  Indicates whether the selection contains any content.
  */
  get empty() {
    let t = this.ranges;
    for (let n = 0; n < t.length; n++)
      if (t[n].$from.pos != t[n].$to.pos)
        return !1;
    return !0;
  }
  /**
  Get the content of this selection as a slice.
  */
  content() {
    return this.$from.doc.slice(this.from, this.to, !0);
  }
  /**
  Replace the selection with a slice or, if no slice is given,
  delete the selection. Will append to the given transaction.
  */
  replace(t, n = k.empty) {
    let r = n.content.lastChild, s = null;
    for (let a = 0; a < n.openEnd; a++)
      s = r, r = r.lastChild;
    let o = t.steps.length, l = this.ranges;
    for (let a = 0; a < l.length; a++) {
      let { $from: c, $to: u } = l[a], d = t.mapping.slice(o);
      t.replaceRange(d.map(c.pos), d.map(u.pos), a ? k.empty : n), a == 0 && ws(t, o, (r ? r.isInline : s && s.isTextblock) ? -1 : 1);
    }
  }
  /**
  Replace the selection with the given node, appending the changes
  to the given transaction.
  */
  replaceWith(t, n) {
    let r = t.steps.length, s = this.ranges;
    for (let o = 0; o < s.length; o++) {
      let { $from: l, $to: a } = s[o], c = t.mapping.slice(r), u = c.map(l.pos), d = c.map(a.pos);
      o ? t.deleteRange(u, d) : (t.replaceRangeWith(u, d, n), ws(t, r, n.isInline ? -1 : 1));
    }
  }
  /**
  Find a valid cursor or leaf node selection starting at the given
  position and searching back if `dir` is negative, and forward if
  positive. When `textOnly` is true, only consider cursor
  selections. Will return null when no valid selection position is
  found.
  */
  static findFrom(t, n, r = !1) {
    let s = t.parent.inlineContent ? new L(t) : Yt(t.node(0), t.parent, t.pos, t.index(), n, r);
    if (s)
      return s;
    for (let o = t.depth - 1; o >= 0; o--) {
      let l = n < 0 ? Yt(t.node(0), t.node(o), t.before(o + 1), t.index(o), n, r) : Yt(t.node(0), t.node(o), t.after(o + 1), t.index(o) + 1, n, r);
      if (l)
        return l;
    }
    return null;
  }
  /**
  Find a valid cursor or leaf node selection near the given
  position. Searches forward first by default, but if `bias` is
  negative, it will search backwards first.
  */
  static near(t, n = 1) {
    return this.findFrom(t, n) || this.findFrom(t, -n) || new pe(t.node(0));
  }
  /**
  Find the cursor or leaf node selection closest to the start of
  the given document. Will return an
  [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
  exists.
  */
  static atStart(t) {
    return Yt(t, t, 0, 0, 1) || new pe(t);
  }
  /**
  Find the cursor or leaf node selection closest to the end of the
  given document.
  */
  static atEnd(t) {
    return Yt(t, t, t.content.size, t.childCount, -1) || new pe(t);
  }
  /**
  Deserialize the JSON representation of a selection. Must be
  implemented for custom classes (as a static class method).
  */
  static fromJSON(t, n) {
    if (!n || !n.type)
      throw new RangeError("Invalid input for Selection.fromJSON");
    let r = Ki[n.type];
    if (!r)
      throw new RangeError(`No selection type ${n.type} defined`);
    return r.fromJSON(t, n);
  }
  /**
  To be able to deserialize selections from JSON, custom selection
  classes must register themselves with an ID string, so that they
  can be disambiguated. Try to pick something that's unlikely to
  clash with classes from other modules.
  */
  static jsonID(t, n) {
    if (t in Ki)
      throw new RangeError("Duplicate use of selection JSON ID " + t);
    return Ki[t] = n, n.prototype.jsonID = t, n;
  }
  /**
  Get a [bookmark](https://prosemirror.net/docs/ref/#state.SelectionBookmark) for this selection,
  which is a value that can be mapped without having access to a
  current document, and later resolved to a real selection for a
  given document again. (This is used mostly by the history to
  track and restore old selections.) The default implementation of
  this method just converts the selection to a text selection and
  returns the bookmark for that.
  */
  getBookmark() {
    return L.between(this.$anchor, this.$head).getBookmark();
  }
}
q.prototype.visible = !0;
class Ir {
  /**
  Create a range.
  */
  constructor(t, n) {
    this.$from = t, this.$to = n;
  }
}
let bs = !1;
function vs(i) {
  !bs && !i.parent.inlineContent && (bs = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + i.parent.type.name + ")"));
}
let L = class Sn extends q {
  /**
  Construct a text selection between the given points.
  */
  constructor(t, n = t) {
    vs(t), vs(n), super(t, n);
  }
  /**
  Returns a resolved position if this is a cursor selection (an
  empty text selection), and null otherwise.
  */
  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }
  map(t, n) {
    let r = t.resolve(n.map(this.head));
    if (!r.parent.inlineContent)
      return q.near(r);
    let s = t.resolve(n.map(this.anchor));
    return new Sn(s.parent.inlineContent ? s : r, r);
  }
  replace(t, n = k.empty) {
    if (super.replace(t, n), n == k.empty) {
      let r = this.$from.marksAcross(this.$to);
      r && t.ensureMarks(r);
    }
  }
  eq(t) {
    return t instanceof Sn && t.anchor == this.anchor && t.head == this.head;
  }
  getBookmark() {
    return new zi(this.anchor, this.head);
  }
  toJSON() {
    return { type: "text", anchor: this.anchor, head: this.head };
  }
  /**
  @internal
  */
  static fromJSON(t, n) {
    if (typeof n.anchor != "number" || typeof n.head != "number")
      throw new RangeError("Invalid input for TextSelection.fromJSON");
    return new Sn(t.resolve(n.anchor), t.resolve(n.head));
  }
  /**
  Create a text selection from non-resolved positions.
  */
  static create(t, n, r = n) {
    let s = t.resolve(n);
    return new this(s, r == n ? s : t.resolve(r));
  }
  /**
  Return a text selection that spans the given positions or, if
  they aren't text positions, find a text selection near them.
  `bias` determines whether the method searches forward (default)
  or backwards (negative number) first. Will fall back to calling
  [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
  doesn't contain a valid text position.
  */
  static between(t, n, r) {
    let s = t.pos - n.pos;
    if ((!r || s) && (r = s >= 0 ? 1 : -1), !n.parent.inlineContent) {
      let o = q.findFrom(n, r, !0) || q.findFrom(n, -r, !0);
      if (o)
        n = o.$head;
      else
        return q.near(n, r);
    }
    return t.parent.inlineContent || (s == 0 ? t = n : (t = (q.findFrom(t, -r, !0) || q.findFrom(t, r, !0)).$anchor, t.pos < n.pos != s < 0 && (t = n))), new Sn(t, n);
  }
};
q.jsonID("text", L);
class zi {
  constructor(t, n) {
    this.anchor = t, this.head = n;
  }
  map(t) {
    return new zi(t.map(this.anchor), t.map(this.head));
  }
  resolve(t) {
    return L.between(t.resolve(this.anchor), t.resolve(this.head));
  }
}
class A extends q {
  /**
  Create a node selection. Does not verify the validity of its
  argument.
  */
  constructor(t) {
    let n = t.nodeAfter, r = t.node(0).resolve(t.pos + n.nodeSize);
    super(t, r), this.node = n;
  }
  map(t, n) {
    let { deleted: r, pos: s } = n.mapResult(this.anchor), o = t.resolve(s);
    return r ? q.near(o) : new A(o);
  }
  content() {
    return new k(x.from(this.node), 0, 0);
  }
  eq(t) {
    return t instanceof A && t.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new Lr(this.anchor);
  }
  /**
  @internal
  */
  static fromJSON(t, n) {
    if (typeof n.anchor != "number")
      throw new RangeError("Invalid input for NodeSelection.fromJSON");
    return new A(t.resolve(n.anchor));
  }
  /**
  Create a node selection from non-resolved positions.
  */
  static create(t, n) {
    return new A(t.resolve(n));
  }
  /**
  Determines whether the given node may be selected as a node
  selection.
  */
  static isSelectable(t) {
    return !t.isText && t.type.spec.selectable !== !1;
  }
}
A.prototype.visible = !1;
q.jsonID("node", A);
class Lr {
  constructor(t) {
    this.anchor = t;
  }
  map(t) {
    let { deleted: n, pos: r } = t.mapResult(this.anchor);
    return n ? new zi(r, r) : new Lr(r);
  }
  resolve(t) {
    let n = t.resolve(this.anchor), r = n.nodeAfter;
    return r && A.isSelectable(r) ? new A(n) : q.near(n);
  }
}
class pe extends q {
  /**
  Create an all-selection over the given document.
  */
  constructor(t) {
    super(t.resolve(0), t.resolve(t.content.size));
  }
  replace(t, n = k.empty) {
    if (n == k.empty) {
      t.delete(0, t.doc.content.size);
      let r = q.atStart(t.doc);
      r.eq(t.selection) || t.setSelection(r);
    } else
      super.replace(t, n);
  }
  toJSON() {
    return { type: "all" };
  }
  /**
  @internal
  */
  static fromJSON(t) {
    return new pe(t);
  }
  map(t) {
    return new pe(t);
  }
  eq(t) {
    return t instanceof pe;
  }
  getBookmark() {
    return Sc;
  }
}
q.jsonID("all", pe);
const Sc = {
  map() {
    return this;
  },
  resolve(i) {
    return new pe(i);
  }
};
function Yt(i, t, n, r, s, o = !1) {
  if (t.inlineContent)
    return L.create(i, n);
  for (let l = r - (s > 0 ? 0 : 1); s > 0 ? l < t.childCount : l >= 0; l += s) {
    let a = t.child(l);
    if (a.isAtom) {
      if (!o && A.isSelectable(a))
        return A.create(i, n - (s < 0 ? a.nodeSize : 0));
    } else {
      let c = Yt(i, a, n + s, s < 0 ? a.childCount : 0, s, o);
      if (c)
        return c;
    }
    n += a.nodeSize * s;
  }
  return null;
}
function ws(i, t, n) {
  let r = i.steps.length - 1;
  if (r < t)
    return;
  let s = i.steps[r];
  if (!(s instanceof te || s instanceof fe))
    return;
  let o = i.mapping.maps[r], l;
  o.forEach((a, c, u, d) => {
    l == null && (l = d);
  }), i.setSelection(q.near(i.doc.resolve(l), n));
}
const xs = 1, ei = 2, ks = 4;
class rl extends il {
  /**
  @internal
  */
  constructor(t) {
    super(t.doc), this.curSelectionFor = 0, this.updated = 0, this.meta = /* @__PURE__ */ Object.create(null), this.time = Date.now(), this.curSelection = t.selection, this.storedMarks = t.storedMarks;
  }
  /**
  The transaction's current selection. This defaults to the editor
  selection [mapped](https://prosemirror.net/docs/ref/#state.Selection.map) through the steps in the
  transaction, but can be overwritten with
  [`setSelection`](https://prosemirror.net/docs/ref/#state.Transaction.setSelection).
  */
  get selection() {
    return this.curSelectionFor < this.steps.length && (this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor)), this.curSelectionFor = this.steps.length), this.curSelection;
  }
  /**
  Update the transaction's current selection. Will determine the
  selection that the editor gets when the transaction is applied.
  */
  setSelection(t) {
    if (t.$from.doc != this.doc)
      throw new RangeError("Selection passed to setSelection must point at the current document");
    return this.curSelection = t, this.curSelectionFor = this.steps.length, this.updated = (this.updated | xs) & ~ei, this.storedMarks = null, this;
  }
  /**
  Whether the selection was explicitly updated by this transaction.
  */
  get selectionSet() {
    return (this.updated & xs) > 0;
  }
  /**
  Set the current stored marks.
  */
  setStoredMarks(t) {
    return this.storedMarks = t, this.updated |= ei, this;
  }
  /**
  Make sure the current stored marks or, if that is null, the marks
  at the selection, match the given set of marks. Does nothing if
  this is already the case.
  */
  ensureMarks(t) {
    return I.sameSet(this.storedMarks || this.selection.$from.marks(), t) || this.setStoredMarks(t), this;
  }
  /**
  Add a mark to the set of stored marks.
  */
  addStoredMark(t) {
    return this.ensureMarks(t.addToSet(this.storedMarks || this.selection.$head.marks()));
  }
  /**
  Remove a mark or mark type from the set of stored marks.
  */
  removeStoredMark(t) {
    return this.ensureMarks(t.removeFromSet(this.storedMarks || this.selection.$head.marks()));
  }
  /**
  Whether the stored marks were explicitly set for this transaction.
  */
  get storedMarksSet() {
    return (this.updated & ei) > 0;
  }
  /**
  @internal
  */
  addStep(t, n) {
    super.addStep(t, n), this.updated = this.updated & ~ei, this.storedMarks = null;
  }
  /**
  Update the timestamp for the transaction.
  */
  setTime(t) {
    return this.time = t, this;
  }
  /**
  Replace the current selection with the given slice.
  */
  replaceSelection(t) {
    return this.selection.replace(this, t), this;
  }
  /**
  Replace the selection with the given node. When `inheritMarks` is
  true and the content is inline, it inherits the marks from the
  place where it is inserted.
  */
  replaceSelectionWith(t, n = !0) {
    let r = this.selection;
    return n && (t = t.mark(this.storedMarks || (r.empty ? r.$from.marks() : r.$from.marksAcross(r.$to) || I.none))), r.replaceWith(this, t), this;
  }
  /**
  Delete the selection.
  */
  deleteSelection() {
    return this.selection.replace(this), this;
  }
  /**
  Replace the given range, or the selection if no range is given,
  with a text node containing the given string.
  */
  insertText(t, n, r) {
    let s = this.doc.type.schema;
    if (n == null)
      return t ? this.replaceSelectionWith(s.text(t), !0) : this.deleteSelection();
    {
      if (r == null && (r = n), !t)
        return this.deleteRange(n, r);
      let o = this.storedMarks;
      if (!o) {
        let l = this.doc.resolve(n);
        o = r == n ? l.marks() : l.marksAcross(this.doc.resolve(r));
      }
      return this.replaceRangeWith(n, r, s.text(t, o)), !this.selection.empty && this.selection.to == n + t.length && this.setSelection(q.near(this.selection.$to)), this;
    }
  }
  /**
  Store a metadata property in this transaction, keyed either by
  name or by plugin.
  */
  setMeta(t, n) {
    return this.meta[typeof t == "string" ? t : t.key] = n, this;
  }
  /**
  Retrieve a metadata property for a given name or plugin.
  */
  getMeta(t) {
    return this.meta[typeof t == "string" ? t : t.key];
  }
  /**
  Returns true if this transaction doesn't contain any metadata,
  and can thus safely be extended.
  */
  get isGeneric() {
    for (let t in this.meta)
      return !1;
    return !0;
  }
  /**
  Indicate that the editor should scroll the selection into view
  when updated to the state produced by this transaction.
  */
  scrollIntoView() {
    return this.updated |= ks, this;
  }
  /**
  True when this transaction has had `scrollIntoView` called on it.
  */
  get scrolledIntoView() {
    return (this.updated & ks) > 0;
  }
}
function Ss(i, t) {
  return !t || !i ? i : i.bind(t);
}
class Cn {
  constructor(t, n, r) {
    this.name = t, this.init = Ss(n.init, r), this.apply = Ss(n.apply, r);
  }
}
const Cc = [
  new Cn("doc", {
    init(i) {
      return i.doc || i.schema.topNodeType.createAndFill();
    },
    apply(i) {
      return i.doc;
    }
  }),
  new Cn("selection", {
    init(i, t) {
      return i.selection || q.atStart(t.doc);
    },
    apply(i) {
      return i.selection;
    }
  }),
  new Cn("storedMarks", {
    init(i) {
      return i.storedMarks || null;
    },
    apply(i, t, n, r) {
      return r.selection.$cursor ? i.storedMarks : null;
    }
  }),
  new Cn("scrollToSelection", {
    init() {
      return 0;
    },
    apply(i, t) {
      return i.scrolledIntoView ? t + 1 : t;
    }
  })
];
class Ji {
  constructor(t, n) {
    this.schema = t, this.plugins = [], this.pluginsByKey = /* @__PURE__ */ Object.create(null), this.fields = Cc.slice(), n && n.forEach((r) => {
      if (this.pluginsByKey[r.key])
        throw new RangeError("Adding different instances of a keyed plugin (" + r.key + ")");
      this.plugins.push(r), this.pluginsByKey[r.key] = r, r.spec.state && this.fields.push(new Cn(r.key, r.spec.state, r));
    });
  }
}
class ut {
  /**
  @internal
  */
  constructor(t) {
    this.config = t;
  }
  /**
  The schema of the state's document.
  */
  get schema() {
    return this.config.schema;
  }
  /**
  The plugins that are active in this state.
  */
  get plugins() {
    return this.config.plugins;
  }
  /**
  Apply the given transaction to produce a new state.
  */
  apply(t) {
    return this.applyTransaction(t).state;
  }
  /**
  @internal
  */
  filterTransaction(t, n = -1) {
    for (let r = 0; r < this.config.plugins.length; r++)
      if (r != n) {
        let s = this.config.plugins[r];
        if (s.spec.filterTransaction && !s.spec.filterTransaction.call(s, t, this))
          return !1;
      }
    return !0;
  }
  /**
  Verbose variant of [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) that
  returns the precise transactions that were applied (which might
  be influenced by the [transaction
  hooks](https://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction) of
  plugins) along with the new state.
  */
  applyTransaction(t) {
    if (!this.filterTransaction(t))
      return { state: this, transactions: [] };
    let n = [t], r = this.applyInner(t), s = null;
    for (; ; ) {
      let o = !1;
      for (let l = 0; l < this.config.plugins.length; l++) {
        let a = this.config.plugins[l];
        if (a.spec.appendTransaction) {
          let c = s ? s[l].n : 0, u = s ? s[l].state : this, d = c < n.length && a.spec.appendTransaction.call(a, c ? n.slice(c) : n, u, r);
          if (d && r.filterTransaction(d, l)) {
            if (d.setMeta("appendedTransaction", t), !s) {
              s = [];
              for (let h = 0; h < this.config.plugins.length; h++)
                s.push(h < l ? { state: r, n: n.length } : { state: this, n: 0 });
            }
            n.push(d), r = r.applyInner(d), o = !0;
          }
          s && (s[l] = { state: r, n: n.length });
        }
      }
      if (!o)
        return { state: r, transactions: n };
    }
  }
  /**
  @internal
  */
  applyInner(t) {
    if (!t.before.eq(this.doc))
      throw new RangeError("Applying a mismatched transaction");
    let n = new ut(this.config), r = this.config.fields;
    for (let s = 0; s < r.length; s++) {
      let o = r[s];
      n[o.name] = o.apply(t, this[o.name], this, n);
    }
    return n;
  }
  /**
  Accessor that constructs and returns a new [transaction](https://prosemirror.net/docs/ref/#state.Transaction) from this state.
  */
  get tr() {
    return new rl(this);
  }
  /**
  Create a new state.
  */
  static create(t) {
    let n = new Ji(t.doc ? t.doc.type.schema : t.schema, t.plugins), r = new ut(n);
    for (let s = 0; s < n.fields.length; s++)
      r[n.fields[s].name] = n.fields[s].init(t, r);
    return r;
  }
  /**
  Create a new state based on this one, but with an adjusted set
  of active plugins. State fields that exist in both sets of
  plugins are kept unchanged. Those that no longer exist are
  dropped, and those that are new are initialized using their
  [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method, passing in the new
  configuration object..
  */
  reconfigure(t) {
    let n = new Ji(this.schema, t.plugins), r = n.fields, s = new ut(n);
    for (let o = 0; o < r.length; o++) {
      let l = r[o].name;
      s[l] = this.hasOwnProperty(l) ? this[l] : r[o].init(t, s);
    }
    return s;
  }
  /**
  Serialize this state to JSON. If you want to serialize the state
  of plugins, pass an object mapping property names to use in the
  resulting JSON object to plugin objects. The argument may also be
  a string or number, in which case it is ignored, to support the
  way `JSON.stringify` calls `toString` methods.
  */
  toJSON(t) {
    let n = { doc: this.doc.toJSON(), selection: this.selection.toJSON() };
    if (this.storedMarks && (n.storedMarks = this.storedMarks.map((r) => r.toJSON())), t && typeof t == "object")
      for (let r in t) {
        if (r == "doc" || r == "selection")
          throw new RangeError("The JSON fields `doc` and `selection` are reserved");
        let s = t[r], o = s.spec.state;
        o && o.toJSON && (n[r] = o.toJSON.call(s, this[s.key]));
      }
    return n;
  }
  /**
  Deserialize a JSON representation of a state. `config` should
  have at least a `schema` field, and should contain array of
  plugins to initialize the state with. `pluginFields` can be used
  to deserialize the state of plugins, by associating plugin
  instances with the property names they use in the JSON object.
  */
  static fromJSON(t, n, r) {
    if (!n)
      throw new RangeError("Invalid input for EditorState.fromJSON");
    if (!t.schema)
      throw new RangeError("Required config field 'schema' missing");
    let s = new Ji(t.schema, t.plugins), o = new ut(s);
    return s.fields.forEach((l) => {
      if (l.name == "doc")
        o.doc = ft.fromJSON(t.schema, n.doc);
      else if (l.name == "selection")
        o.selection = q.fromJSON(o.doc, n.selection);
      else if (l.name == "storedMarks")
        n.storedMarks && (o.storedMarks = n.storedMarks.map(t.schema.markFromJSON));
      else {
        if (r)
          for (let a in r) {
            let c = r[a], u = c.spec.state;
            if (c.key == l.name && u && u.fromJSON && Object.prototype.hasOwnProperty.call(n, a)) {
              o[l.name] = u.fromJSON.call(c, t, n[a], o);
              return;
            }
          }
        o[l.name] = l.init(t, o);
      }
    }), o;
  }
}
function sl(i, t, n) {
  for (let r in i) {
    let s = i[r];
    s instanceof Function ? s = s.bind(t) : r == "handleDOMEvents" && (s = sl(s, t, {})), n[r] = s;
  }
  return n;
}
class xe {
  /**
  Create a plugin.
  */
  constructor(t) {
    this.spec = t, this.props = {}, t.props && sl(t.props, this, this.props), this.key = t.key ? t.key.key : ol("plugin");
  }
  /**
  Extract the plugin's state field from an editor state.
  */
  getState(t) {
    return t[this.key];
  }
}
const Xi = /* @__PURE__ */ Object.create(null);
function ol(i) {
  return i in Xi ? i + "$" + ++Xi[i] : (Xi[i] = 0, i + "$");
}
class Ut {
  /**
  Create a plugin key.
  */
  constructor(t = "key") {
    this.key = ol(t);
  }
  /**
  Get the active plugin with this key, if any, from an editor
  state.
  */
  get(t) {
    return t.config.pluginsByKey[this.key];
  }
  /**
  Get the plugin's state from an editor state.
  */
  getState(t) {
    return t[this.key];
  }
}
const Mc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AllSelection: pe,
  EditorState: ut,
  NodeSelection: A,
  Plugin: xe,
  PluginKey: Ut,
  Selection: q,
  SelectionRange: Ir,
  TextSelection: L,
  Transaction: rl
}, Symbol.toStringTag, { value: "Module" })), Y = function(i) {
  for (var t = 0; ; t++)
    if (i = i.previousSibling, !i)
      return t;
}, on = function(i) {
  let t = i.assignedSlot || i.parentNode;
  return t && t.nodeType == 11 ? t.host : t;
};
let mr = null;
const je = function(i, t, n) {
  let r = mr || (mr = document.createRange());
  return r.setEnd(i, n ?? i.nodeValue.length), r.setStart(i, t || 0), r;
}, Ec = function() {
  mr = null;
}, Vt = function(i, t, n, r) {
  return n && (Cs(i, t, n, r, -1) || Cs(i, t, n, r, 1));
}, Nc = /^(img|br|input|textarea|hr)$/i;
function Cs(i, t, n, r, s) {
  for (var o; ; ) {
    if (i == n && t == r)
      return !0;
    if (t == (s < 0 ? 0 : Ee(i))) {
      let l = i.parentNode;
      if (!l || l.nodeType != 1 || Vn(i) || Nc.test(i.nodeName) || i.contentEditable == "false")
        return !1;
      t = Y(i) + (s < 0 ? 0 : 1), i = l;
    } else if (i.nodeType == 1) {
      let l = i.childNodes[t + (s < 0 ? -1 : 0)];
      if (l.nodeType == 1 && l.contentEditable == "false")
        if (!((o = l.pmViewDesc) === null || o === void 0) && o.ignoreForSelection)
          t += s;
        else
          return !1;
      else
        i = l, t = s < 0 ? Ee(i) : 0;
    } else
      return !1;
  }
}
function Ee(i) {
  return i.nodeType == 3 ? i.nodeValue.length : i.childNodes.length;
}
function Tc(i, t) {
  for (; ; ) {
    if (i.nodeType == 3 && t)
      return i;
    if (i.nodeType == 1 && t > 0) {
      if (i.contentEditable == "false")
        return null;
      i = i.childNodes[t - 1], t = Ee(i);
    } else if (i.parentNode && !Vn(i))
      t = Y(i), i = i.parentNode;
    else
      return null;
  }
}
function Ac(i, t) {
  for (; ; ) {
    if (i.nodeType == 3 && t < i.nodeValue.length)
      return i;
    if (i.nodeType == 1 && t < i.childNodes.length) {
      if (i.contentEditable == "false")
        return null;
      i = i.childNodes[t], t = 0;
    } else if (i.parentNode && !Vn(i))
      t = Y(i) + 1, i = i.parentNode;
    else
      return null;
  }
}
function Oc(i, t, n) {
  for (let r = t == 0, s = t == Ee(i); r || s; ) {
    if (i == n)
      return !0;
    let o = Y(i);
    if (i = i.parentNode, !i)
      return !1;
    r = r && o == 0, s = s && o == Ee(i);
  }
}
function Vn(i) {
  let t;
  for (let n = i; n && !(t = n.pmViewDesc); n = n.parentNode)
    ;
  return t && t.node && t.node.isBlock && (t.dom == i || t.contentDOM == i);
}
const Ri = function(i) {
  return i.focusNode && Vt(i.focusNode, i.focusOffset, i.anchorNode, i.anchorOffset);
};
function Nt(i, t) {
  let n = document.createEvent("Event");
  return n.initEvent("keydown", !0, !0), n.keyCode = i, n.key = n.code = t, n;
}
function qc(i) {
  let t = i.activeElement;
  for (; t && t.shadowRoot; )
    t = t.shadowRoot.activeElement;
  return t;
}
function Dc(i, t, n) {
  if (i.caretPositionFromPoint)
    try {
      let r = i.caretPositionFromPoint(t, n);
      if (r)
        return { node: r.offsetNode, offset: Math.min(Ee(r.offsetNode), r.offset) };
    } catch {
    }
  if (i.caretRangeFromPoint) {
    let r = i.caretRangeFromPoint(t, n);
    if (r)
      return { node: r.startContainer, offset: Math.min(Ee(r.startContainer), r.startOffset) };
  }
}
const Ve = typeof navigator < "u" ? navigator : null, Ms = typeof document < "u" ? document : null, St = Ve && Ve.userAgent || "", gr = /Edge\/(\d+)/.exec(St), ll = /MSIE \d/.exec(St), yr = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(St), me = !!(ll || yr || gr), pt = ll ? document.documentMode : yr ? +yr[1] : gr ? +gr[1] : 0, Ne = !me && /gecko\/(\d+)/i.test(St);
Ne && +(/Firefox\/(\d+)/.exec(St) || [0, 0])[1];
const br = !me && /Chrome\/(\d+)/.exec(St), Z = !!br, al = br ? +br[1] : 0, ie = !me && !!Ve && /Apple Computer/.test(Ve.vendor), ln = ie && (/Mobile\/\w+/.test(St) || !!Ve && Ve.maxTouchPoints > 2), Ce = ln || (Ve ? /Mac/.test(Ve.platform) : !1), cl = Ve ? /Win/.test(Ve.platform) : !1, Ke = /Android \d/.test(St), Hn = !!Ms && "webkitFontSmoothing" in Ms.documentElement.style, zc = Hn ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
function Rc(i) {
  let t = i.defaultView && i.defaultView.visualViewport;
  return t ? {
    left: 0,
    right: t.width,
    top: 0,
    bottom: t.height
  } : {
    left: 0,
    right: i.documentElement.clientWidth,
    top: 0,
    bottom: i.documentElement.clientHeight
  };
}
function We(i, t) {
  return typeof i == "number" ? i : i[t];
}
function Ic(i) {
  let t = i.getBoundingClientRect(), n = t.width / i.offsetWidth || 1, r = t.height / i.offsetHeight || 1;
  return {
    left: t.left,
    right: t.left + i.clientWidth * n,
    top: t.top,
    bottom: t.top + i.clientHeight * r
  };
}
function Es(i, t, n) {
  let r = i.someProp("scrollThreshold") || 0, s = i.someProp("scrollMargin") || 5, o = i.dom.ownerDocument;
  for (let l = n || i.dom; l; ) {
    if (l.nodeType != 1) {
      l = on(l);
      continue;
    }
    let a = l, c = a == o.body, u = c ? Rc(o) : Ic(a), d = 0, h = 0;
    if (t.top < u.top + We(r, "top") ? h = -(u.top - t.top + We(s, "top")) : t.bottom > u.bottom - We(r, "bottom") && (h = t.bottom - t.top > u.bottom - u.top ? t.top + We(s, "top") - u.top : t.bottom - u.bottom + We(s, "bottom")), t.left < u.left + We(r, "left") ? d = -(u.left - t.left + We(s, "left")) : t.right > u.right - We(r, "right") && (d = t.right - u.right + We(s, "right")), d || h)
      if (c)
        o.defaultView.scrollBy(d, h);
      else {
        let p = a.scrollLeft, m = a.scrollTop;
        h && (a.scrollTop += h), d && (a.scrollLeft += d);
        let y = a.scrollLeft - p, b = a.scrollTop - m;
        t = { left: t.left - y, top: t.top - b, right: t.right - y, bottom: t.bottom - b };
      }
    let f = c ? "fixed" : getComputedStyle(l).position;
    if (/^(fixed|sticky)$/.test(f))
      break;
    l = f == "absolute" ? l.offsetParent : on(l);
  }
}
function Lc(i) {
  let t = i.dom.getBoundingClientRect(), n = Math.max(0, t.top), r, s;
  for (let o = (t.left + t.right) / 2, l = n + 1; l < Math.min(innerHeight, t.bottom); l += 5) {
    let a = i.root.elementFromPoint(o, l);
    if (!a || a == i.dom || !i.dom.contains(a))
      continue;
    let c = a.getBoundingClientRect();
    if (c.top >= n - 20) {
      r = a, s = c.top;
      break;
    }
  }
  return { refDOM: r, refTop: s, stack: ul(i.dom) };
}
function ul(i) {
  let t = [], n = i.ownerDocument;
  for (let r = i; r && (t.push({ dom: r, top: r.scrollTop, left: r.scrollLeft }), i != n); r = on(r))
    ;
  return t;
}
function Bc({ refDOM: i, refTop: t, stack: n }) {
  let r = i ? i.getBoundingClientRect().top : 0;
  dl(n, r == 0 ? 0 : r - t);
}
function dl(i, t) {
  for (let n = 0; n < i.length; n++) {
    let { dom: r, top: s, left: o } = i[n];
    r.scrollTop != s + t && (r.scrollTop = s + t), r.scrollLeft != o && (r.scrollLeft = o);
  }
}
let Jt = null;
function Pc(i) {
  if (i.setActive)
    return i.setActive();
  if (Jt)
    return i.focus(Jt);
  let t = ul(i);
  i.focus(Jt == null ? {
    get preventScroll() {
      return Jt = { preventScroll: !0 }, !0;
    }
  } : void 0), Jt || (Jt = !1, dl(t, 0));
}
function hl(i, t) {
  let n, r = 2e8, s, o = 0, l = t.top, a = t.top, c, u;
  for (let d = i.firstChild, h = 0; d; d = d.nextSibling, h++) {
    let f;
    if (d.nodeType == 1)
      f = d.getClientRects();
    else if (d.nodeType == 3)
      f = je(d).getClientRects();
    else
      continue;
    for (let p = 0; p < f.length; p++) {
      let m = f[p];
      if (m.top <= l && m.bottom >= a) {
        l = Math.max(m.bottom, l), a = Math.min(m.top, a);
        let y = m.left > t.left ? m.left - t.left : m.right < t.left ? t.left - m.right : 0;
        if (y < r) {
          n = d, r = y, s = y && n.nodeType == 3 ? {
            left: m.right < t.left ? m.right : m.left,
            top: t.top
          } : t, d.nodeType == 1 && y && (o = h + (t.left >= (m.left + m.right) / 2 ? 1 : 0));
          continue;
        }
      } else m.top > t.top && !c && m.left <= t.left && m.right >= t.left && (c = d, u = { left: Math.max(m.left, Math.min(m.right, t.left)), top: m.top });
      !n && (t.left >= m.right && t.top >= m.top || t.left >= m.left && t.top >= m.bottom) && (o = h + 1);
    }
  }
  return !n && c && (n = c, s = u, r = 0), n && n.nodeType == 3 ? Fc(n, s) : !n || r && n.nodeType == 1 ? { node: i, offset: o } : hl(n, s);
}
function Fc(i, t) {
  let n = i.nodeValue.length, r = document.createRange(), s;
  for (let o = 0; o < n; o++) {
    r.setEnd(i, o + 1), r.setStart(i, o);
    let l = it(r, 1);
    if (l.top != l.bottom && Br(t, l)) {
      s = { node: i, offset: o + (t.left >= (l.left + l.right) / 2 ? 1 : 0) };
      break;
    }
  }
  return r.detach(), s || { node: i, offset: 0 };
}
function Br(i, t) {
  return i.left >= t.left - 1 && i.left <= t.right + 1 && i.top >= t.top - 1 && i.top <= t.bottom + 1;
}
function Vc(i, t) {
  let n = i.parentNode;
  return n && /^li$/i.test(n.nodeName) && t.left < i.getBoundingClientRect().left ? n : i;
}
function Hc(i, t, n) {
  let { node: r, offset: s } = hl(t, n), o = -1;
  if (r.nodeType == 1 && !r.firstChild) {
    let l = r.getBoundingClientRect();
    o = l.left != l.right && n.left > (l.left + l.right) / 2 ? 1 : -1;
  }
  return i.docView.posFromDOM(r, s, o);
}
function $c(i, t, n, r) {
  let s = -1;
  for (let o = t, l = !1; o != i.dom; ) {
    let a = i.docView.nearestDesc(o, !0), c;
    if (!a)
      return null;
    if (a.dom.nodeType == 1 && (a.node.isBlock && a.parent || !a.contentDOM) && // Ignore elements with zero-size bounding rectangles
    ((c = a.dom.getBoundingClientRect()).width || c.height) && (a.node.isBlock && a.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(a.dom.nodeName) && (!l && c.left > r.left || c.top > r.top ? s = a.posBefore : (!l && c.right < r.left || c.bottom < r.top) && (s = a.posAfter), l = !0), !a.contentDOM && s < 0 && !a.node.isText))
      return (a.node.isBlock ? r.top < (c.top + c.bottom) / 2 : r.left < (c.left + c.right) / 2) ? a.posBefore : a.posAfter;
    o = a.dom.parentNode;
  }
  return s > -1 ? s : i.docView.posFromDOM(t, n, -1);
}
function fl(i, t, n) {
  let r = i.childNodes.length;
  if (r && n.top < n.bottom)
    for (let s = Math.max(0, Math.min(r - 1, Math.floor(r * (t.top - n.top) / (n.bottom - n.top)) - 2)), o = s; ; ) {
      let l = i.childNodes[o];
      if (l.nodeType == 1) {
        let a = l.getClientRects();
        for (let c = 0; c < a.length; c++) {
          let u = a[c];
          if (Br(t, u))
            return fl(l, t, u);
        }
      }
      if ((o = (o + 1) % r) == s)
        break;
    }
  return i;
}
function Wc(i, t) {
  let n = i.dom.ownerDocument, r, s = 0, o = Dc(n, t.left, t.top);
  o && ({ node: r, offset: s } = o);
  let l = (i.root.elementFromPoint ? i.root : n).elementFromPoint(t.left, t.top), a;
  if (!l || !i.dom.contains(l.nodeType != 1 ? l.parentNode : l)) {
    let u = i.dom.getBoundingClientRect();
    if (!Br(t, u) || (l = fl(i.dom, t, u), !l))
      return null;
  }
  if (ie)
    for (let u = l; r && u; u = on(u))
      u.draggable && (r = void 0);
  if (l = Vc(l, t), r) {
    if (Ne && r.nodeType == 1 && (s = Math.min(s, r.childNodes.length), s < r.childNodes.length)) {
      let d = r.childNodes[s], h;
      d.nodeName == "IMG" && (h = d.getBoundingClientRect()).right <= t.left && h.bottom > t.top && s++;
    }
    let u;
    Hn && s && r.nodeType == 1 && (u = r.childNodes[s - 1]).nodeType == 1 && u.contentEditable == "false" && u.getBoundingClientRect().top >= t.top && s--, r == i.dom && s == r.childNodes.length - 1 && r.lastChild.nodeType == 1 && t.top > r.lastChild.getBoundingClientRect().bottom ? a = i.state.doc.content.size : (s == 0 || r.nodeType != 1 || r.childNodes[s - 1].nodeName != "BR") && (a = $c(i, r, s, t));
  }
  a == null && (a = Hc(i, l, t));
  let c = i.docView.nearestDesc(l, !0);
  return { pos: a, inside: c ? c.posAtStart - c.border : -1 };
}
function Ns(i) {
  return i.top < i.bottom || i.left < i.right;
}
function it(i, t) {
  let n = i.getClientRects();
  if (n.length) {
    let r = n[t < 0 ? 0 : n.length - 1];
    if (Ns(r))
      return r;
  }
  return Array.prototype.find.call(n, Ns) || i.getBoundingClientRect();
}
const Uc = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
function pl(i, t, n) {
  let { node: r, offset: s, atom: o } = i.docView.domFromPos(t, n < 0 ? -1 : 1), l = Hn || Ne;
  if (r.nodeType == 3)
    if (l && (Uc.test(r.nodeValue) || (n < 0 ? !s : s == r.nodeValue.length))) {
      let c = it(je(r, s, s), n);
      if (Ne && s && /\s/.test(r.nodeValue[s - 1]) && s < r.nodeValue.length) {
        let u = it(je(r, s - 1, s - 1), -1);
        if (u.top == c.top) {
          let d = it(je(r, s, s + 1), -1);
          if (d.top != c.top)
            return bn(d, d.left < u.left);
        }
      }
      return c;
    } else {
      let c = s, u = s, d = n < 0 ? 1 : -1;
      return n < 0 && !s ? (u++, d = -1) : n >= 0 && s == r.nodeValue.length ? (c--, d = 1) : n < 0 ? c-- : u++, bn(it(je(r, c, u), d), d < 0);
    }
  if (!i.state.doc.resolve(t - (o || 0)).parent.inlineContent) {
    if (o == null && s && (n < 0 || s == Ee(r))) {
      let c = r.childNodes[s - 1];
      if (c.nodeType == 1)
        return Yi(c.getBoundingClientRect(), !1);
    }
    if (o == null && s < Ee(r)) {
      let c = r.childNodes[s];
      if (c.nodeType == 1)
        return Yi(c.getBoundingClientRect(), !0);
    }
    return Yi(r.getBoundingClientRect(), n >= 0);
  }
  if (o == null && s && (n < 0 || s == Ee(r))) {
    let c = r.childNodes[s - 1], u = c.nodeType == 3 ? je(c, Ee(c) - (l ? 0 : 1)) : c.nodeType == 1 && (c.nodeName != "BR" || !c.nextSibling) ? c : null;
    if (u)
      return bn(it(u, 1), !1);
  }
  if (o == null && s < Ee(r)) {
    let c = r.childNodes[s];
    for (; c.pmViewDesc && c.pmViewDesc.ignoreForCoords; )
      c = c.nextSibling;
    let u = c ? c.nodeType == 3 ? je(c, 0, l ? 0 : 1) : c.nodeType == 1 ? c : null : null;
    if (u)
      return bn(it(u, -1), !0);
  }
  return bn(it(r.nodeType == 3 ? je(r) : r, -n), n >= 0);
}
function bn(i, t) {
  if (i.width == 0)
    return i;
  let n = t ? i.left : i.right;
  return { top: i.top, bottom: i.bottom, left: n, right: n };
}
function Yi(i, t) {
  if (i.height == 0)
    return i;
  let n = t ? i.top : i.bottom;
  return { top: n, bottom: n, left: i.left, right: i.right };
}
function ml(i, t, n) {
  let r = i.state, s = i.root.activeElement;
  r != t && i.updateState(t), s != i.dom && i.focus();
  try {
    return n();
  } finally {
    r != t && i.updateState(r), s != i.dom && s && s.focus();
  }
}
function jc(i, t, n) {
  let r = t.selection, s = n == "up" ? r.$from : r.$to;
  return ml(i, t, () => {
    let { node: o } = i.docView.domFromPos(s.pos, n == "up" ? -1 : 1);
    for (; ; ) {
      let a = i.docView.nearestDesc(o, !0);
      if (!a)
        break;
      if (a.node.isBlock) {
        o = a.contentDOM || a.dom;
        break;
      }
      o = a.dom.parentNode;
    }
    let l = pl(i, s.pos, 1);
    for (let a = o.firstChild; a; a = a.nextSibling) {
      let c;
      if (a.nodeType == 1)
        c = a.getClientRects();
      else if (a.nodeType == 3)
        c = je(a, 0, a.nodeValue.length).getClientRects();
      else
        continue;
      for (let u = 0; u < c.length; u++) {
        let d = c[u];
        if (d.bottom > d.top + 1 && (n == "up" ? l.top - d.top > (d.bottom - l.top) * 2 : d.bottom - l.bottom > (l.bottom - d.top) * 2))
          return !1;
      }
    }
    return !0;
  });
}
const _c = /[\u0590-\u08ac]/;
function Kc(i, t, n) {
  let { $head: r } = t.selection;
  if (!r.parent.isTextblock)
    return !1;
  let s = r.parentOffset, o = !s, l = s == r.parent.content.size, a = i.domSelection();
  return a ? !_c.test(r.parent.textContent) || !a.modify ? n == "left" || n == "backward" ? o : l : ml(i, t, () => {
    let { focusNode: c, focusOffset: u, anchorNode: d, anchorOffset: h } = i.domSelectionRange(), f = a.caretBidiLevel;
    a.modify("move", n, "character");
    let p = r.depth ? i.docView.domAfterPos(r.before()) : i.dom, { focusNode: m, focusOffset: y } = i.domSelectionRange(), b = m && !p.contains(m.nodeType == 1 ? m : m.parentNode) || c == m && u == y;
    try {
      a.collapse(d, h), c && (c != d || u != h) && a.extend && a.extend(c, u);
    } catch {
    }
    return f != null && (a.caretBidiLevel = f), b;
  }) : r.pos == r.start() || r.pos == r.end();
}
let Ts = null, As = null, Os = !1;
function Jc(i, t, n) {
  return Ts == t && As == n ? Os : (Ts = t, As = n, Os = n == "up" || n == "down" ? jc(i, t, n) : Kc(i, t, n));
}
const Te = 0, qs = 1, Tt = 2, He = 3;
class $n {
  constructor(t, n, r, s) {
    this.parent = t, this.children = n, this.dom = r, this.contentDOM = s, this.dirty = Te, r.pmViewDesc = this;
  }
  // Used to check whether a given description corresponds to a
  // widget/mark/node.
  matchesWidget(t) {
    return !1;
  }
  matchesMark(t) {
    return !1;
  }
  matchesNode(t, n, r) {
    return !1;
  }
  matchesHack(t) {
    return !1;
  }
  // When parsing in-editor content (in domchange.js), we allow
  // descriptions to determine the parse rules that should be used to
  // parse them.
  parseRule() {
    return null;
  }
  // Used by the editor's event handler to ignore events that come
  // from certain descs.
  stopEvent(t) {
    return !1;
  }
  // The size of the content represented by this desc.
  get size() {
    let t = 0;
    for (let n = 0; n < this.children.length; n++)
      t += this.children[n].size;
    return t;
  }
  // For block nodes, this represents the space taken up by their
  // start/end tokens.
  get border() {
    return 0;
  }
  destroy() {
    this.parent = void 0, this.dom.pmViewDesc == this && (this.dom.pmViewDesc = void 0);
    for (let t = 0; t < this.children.length; t++)
      this.children[t].destroy();
  }
  posBeforeChild(t) {
    for (let n = 0, r = this.posAtStart; ; n++) {
      let s = this.children[n];
      if (s == t)
        return r;
      r += s.size;
    }
  }
  get posBefore() {
    return this.parent.posBeforeChild(this);
  }
  get posAtStart() {
    return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
  }
  get posAfter() {
    return this.posBefore + this.size;
  }
  get posAtEnd() {
    return this.posAtStart + this.size - 2 * this.border;
  }
  localPosFromDOM(t, n, r) {
    if (this.contentDOM && this.contentDOM.contains(t.nodeType == 1 ? t : t.parentNode))
      if (r < 0) {
        let o, l;
        if (t == this.contentDOM)
          o = t.childNodes[n - 1];
        else {
          for (; t.parentNode != this.contentDOM; )
            t = t.parentNode;
          o = t.previousSibling;
        }
        for (; o && !((l = o.pmViewDesc) && l.parent == this); )
          o = o.previousSibling;
        return o ? this.posBeforeChild(l) + l.size : this.posAtStart;
      } else {
        let o, l;
        if (t == this.contentDOM)
          o = t.childNodes[n];
        else {
          for (; t.parentNode != this.contentDOM; )
            t = t.parentNode;
          o = t.nextSibling;
        }
        for (; o && !((l = o.pmViewDesc) && l.parent == this); )
          o = o.nextSibling;
        return o ? this.posBeforeChild(l) : this.posAtEnd;
      }
    let s;
    if (t == this.dom && this.contentDOM)
      s = n > Y(this.contentDOM);
    else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM))
      s = t.compareDocumentPosition(this.contentDOM) & 2;
    else if (this.dom.firstChild) {
      if (n == 0)
        for (let o = t; ; o = o.parentNode) {
          if (o == this.dom) {
            s = !1;
            break;
          }
          if (o.previousSibling)
            break;
        }
      if (s == null && n == t.childNodes.length)
        for (let o = t; ; o = o.parentNode) {
          if (o == this.dom) {
            s = !0;
            break;
          }
          if (o.nextSibling)
            break;
        }
    }
    return s ?? r > 0 ? this.posAtEnd : this.posAtStart;
  }
  nearestDesc(t, n = !1) {
    for (let r = !0, s = t; s; s = s.parentNode) {
      let o = this.getDesc(s), l;
      if (o && (!n || o.node))
        if (r && (l = o.nodeDOM) && !(l.nodeType == 1 ? l.contains(t.nodeType == 1 ? t : t.parentNode) : l == t))
          r = !1;
        else
          return o;
    }
  }
  getDesc(t) {
    let n = t.pmViewDesc;
    for (let r = n; r; r = r.parent)
      if (r == this)
        return n;
  }
  posFromDOM(t, n, r) {
    for (let s = t; s; s = s.parentNode) {
      let o = this.getDesc(s);
      if (o)
        return o.localPosFromDOM(t, n, r);
    }
    return -1;
  }
  // Find the desc for the node after the given pos, if any. (When a
  // parent node overrode rendering, there might not be one.)
  descAt(t) {
    for (let n = 0, r = 0; n < this.children.length; n++) {
      let s = this.children[n], o = r + s.size;
      if (r == t && o != r) {
        for (; !s.border && s.children.length; )
          for (let l = 0; l < s.children.length; l++) {
            let a = s.children[l];
            if (a.size) {
              s = a;
              break;
            }
          }
        return s;
      }
      if (t < o)
        return s.descAt(t - r - s.border);
      r = o;
    }
  }
  domFromPos(t, n) {
    if (!this.contentDOM)
      return { node: this.dom, offset: 0, atom: t + 1 };
    let r = 0, s = 0;
    for (let o = 0; r < this.children.length; r++) {
      let l = this.children[r], a = o + l.size;
      if (a > t || l instanceof yl) {
        s = t - o;
        break;
      }
      o = a;
    }
    if (s)
      return this.children[r].domFromPos(s - this.children[r].border, n);
    for (let o; r && !(o = this.children[r - 1]).size && o instanceof gl && o.side >= 0; r--)
      ;
    if (n <= 0) {
      let o, l = !0;
      for (; o = r ? this.children[r - 1] : null, !(!o || o.dom.parentNode == this.contentDOM); r--, l = !1)
        ;
      return o && n && l && !o.border && !o.domAtom ? o.domFromPos(o.size, n) : { node: this.contentDOM, offset: o ? Y(o.dom) + 1 : 0 };
    } else {
      let o, l = !0;
      for (; o = r < this.children.length ? this.children[r] : null, !(!o || o.dom.parentNode == this.contentDOM); r++, l = !1)
        ;
      return o && l && !o.border && !o.domAtom ? o.domFromPos(0, n) : { node: this.contentDOM, offset: o ? Y(o.dom) : this.contentDOM.childNodes.length };
    }
  }
  // Used to find a DOM range in a single parent for a given changed
  // range.
  parseRange(t, n, r = 0) {
    if (this.children.length == 0)
      return { node: this.contentDOM, from: t, to: n, fromOffset: 0, toOffset: this.contentDOM.childNodes.length };
    let s = -1, o = -1;
    for (let l = r, a = 0; ; a++) {
      let c = this.children[a], u = l + c.size;
      if (s == -1 && t <= u) {
        let d = l + c.border;
        if (t >= d && n <= u - c.border && c.node && c.contentDOM && this.contentDOM.contains(c.contentDOM))
          return c.parseRange(t, n, d);
        t = l;
        for (let h = a; h > 0; h--) {
          let f = this.children[h - 1];
          if (f.size && f.dom.parentNode == this.contentDOM && !f.emptyChildAt(1)) {
            s = Y(f.dom) + 1;
            break;
          }
          t -= f.size;
        }
        s == -1 && (s = 0);
      }
      if (s > -1 && (u > n || a == this.children.length - 1)) {
        n = u;
        for (let d = a + 1; d < this.children.length; d++) {
          let h = this.children[d];
          if (h.size && h.dom.parentNode == this.contentDOM && !h.emptyChildAt(-1)) {
            o = Y(h.dom);
            break;
          }
          n += h.size;
        }
        o == -1 && (o = this.contentDOM.childNodes.length);
        break;
      }
      l = u;
    }
    return { node: this.contentDOM, from: t, to: n, fromOffset: s, toOffset: o };
  }
  emptyChildAt(t) {
    if (this.border || !this.contentDOM || !this.children.length)
      return !1;
    let n = this.children[t < 0 ? 0 : this.children.length - 1];
    return n.size == 0 || n.emptyChildAt(t);
  }
  domAfterPos(t) {
    let { node: n, offset: r } = this.domFromPos(t, 0);
    if (n.nodeType != 1 || r == n.childNodes.length)
      throw new RangeError("No node after pos " + t);
    return n.childNodes[r];
  }
  // View descs are responsible for setting any selection that falls
  // entirely inside of them, so that custom implementations can do
  // custom things with the selection. Note that this falls apart when
  // a selection starts in such a node and ends in another, in which
  // case we just use whatever domFromPos produces as a best effort.
  setSelection(t, n, r, s = !1) {
    let o = Math.min(t, n), l = Math.max(t, n);
    for (let p = 0, m = 0; p < this.children.length; p++) {
      let y = this.children[p], b = m + y.size;
      if (o > m && l < b)
        return y.setSelection(t - m - y.border, n - m - y.border, r, s);
      m = b;
    }
    let a = this.domFromPos(t, t ? -1 : 1), c = n == t ? a : this.domFromPos(n, n ? -1 : 1), u = r.root.getSelection(), d = r.domSelectionRange(), h = !1;
    if ((Ne || ie) && t == n) {
      let { node: p, offset: m } = a;
      if (p.nodeType == 3) {
        if (h = !!(m && p.nodeValue[m - 1] == `
`), h && m == p.nodeValue.length)
          for (let y = p, b; y; y = y.parentNode) {
            if (b = y.nextSibling) {
              b.nodeName == "BR" && (a = c = { node: b.parentNode, offset: Y(b) + 1 });
              break;
            }
            let w = y.pmViewDesc;
            if (w && w.node && w.node.isBlock)
              break;
          }
      } else {
        let y = p.childNodes[m - 1];
        h = y && (y.nodeName == "BR" || y.contentEditable == "false");
      }
    }
    if (Ne && d.focusNode && d.focusNode != c.node && d.focusNode.nodeType == 1) {
      let p = d.focusNode.childNodes[d.focusOffset];
      p && p.contentEditable == "false" && (s = !0);
    }
    if (!(s || h && ie) && Vt(a.node, a.offset, d.anchorNode, d.anchorOffset) && Vt(c.node, c.offset, d.focusNode, d.focusOffset))
      return;
    let f = !1;
    if ((u.extend || t == n) && !(h && Ne)) {
      u.collapse(a.node, a.offset);
      try {
        t != n && u.extend(c.node, c.offset), f = !0;
      } catch {
      }
    }
    if (!f) {
      if (t > n) {
        let m = a;
        a = c, c = m;
      }
      let p = document.createRange();
      p.setEnd(c.node, c.offset), p.setStart(a.node, a.offset), u.removeAllRanges(), u.addRange(p);
    }
  }
  ignoreMutation(t) {
    return !this.contentDOM && t.type != "selection";
  }
  get contentLost() {
    return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
  }
  // Remove a subtree of the element tree that has been touched
  // by a DOM change, so that the next update will redraw it.
  markDirty(t, n) {
    for (let r = 0, s = 0; s < this.children.length; s++) {
      let o = this.children[s], l = r + o.size;
      if (r == l ? t <= l && n >= r : t < l && n > r) {
        let a = r + o.border, c = l - o.border;
        if (t >= a && n <= c) {
          this.dirty = t == r || n == l ? Tt : qs, t == a && n == c && (o.contentLost || o.dom.parentNode != this.contentDOM) ? o.dirty = He : o.markDirty(t - a, n - a);
          return;
        } else
          o.dirty = o.dom == o.contentDOM && o.dom.parentNode == this.contentDOM && !o.children.length ? Tt : He;
      }
      r = l;
    }
    this.dirty = Tt;
  }
  markParentsDirty() {
    let t = 1;
    for (let n = this.parent; n; n = n.parent, t++) {
      let r = t == 1 ? Tt : qs;
      n.dirty < r && (n.dirty = r);
    }
  }
  get domAtom() {
    return !1;
  }
  get ignoreForCoords() {
    return !1;
  }
  get ignoreForSelection() {
    return !1;
  }
  isText(t) {
    return !1;
  }
}
class gl extends $n {
  constructor(t, n, r, s) {
    let o, l = n.type.toDOM;
    if (typeof l == "function" && (l = l(r, () => {
      if (!o)
        return s;
      if (o.parent)
        return o.parent.posBeforeChild(o);
    })), !n.type.spec.raw) {
      if (l.nodeType != 1) {
        let a = document.createElement("span");
        a.appendChild(l), l = a;
      }
      l.contentEditable = "false", l.classList.add("ProseMirror-widget");
    }
    super(t, [], l, null), this.widget = n, this.widget = n, o = this;
  }
  matchesWidget(t) {
    return this.dirty == Te && t.type.eq(this.widget.type);
  }
  parseRule() {
    return { ignore: !0 };
  }
  stopEvent(t) {
    let n = this.widget.spec.stopEvent;
    return n ? n(t) : !1;
  }
  ignoreMutation(t) {
    return t.type != "selection" || this.widget.spec.ignoreSelection;
  }
  destroy() {
    this.widget.type.destroy(this.dom), super.destroy();
  }
  get domAtom() {
    return !0;
  }
  get ignoreForSelection() {
    return !!this.widget.type.spec.relaxedSide;
  }
  get side() {
    return this.widget.type.side;
  }
}
class Xc extends $n {
  constructor(t, n, r, s) {
    super(t, [], n, null), this.textDOM = r, this.text = s;
  }
  get size() {
    return this.text.length;
  }
  localPosFromDOM(t, n) {
    return t != this.textDOM ? this.posAtStart + (n ? this.size : 0) : this.posAtStart + n;
  }
  domFromPos(t) {
    return { node: this.textDOM, offset: t };
  }
  ignoreMutation(t) {
    return t.type === "characterData" && t.target.nodeValue == t.oldValue;
  }
}
class Ht extends $n {
  constructor(t, n, r, s, o) {
    super(t, [], r, s), this.mark = n, this.spec = o;
  }
  static create(t, n, r, s) {
    let o = s.nodeViews[n.type.name], l = o && o(n, s, r);
    return (!l || !l.dom) && (l = kt.renderSpec(document, n.type.spec.toDOM(n, r), null, n.attrs)), new Ht(t, n, l.dom, l.contentDOM || l.dom, l);
  }
  parseRule() {
    return this.dirty & He || this.mark.type.spec.reparseInView ? null : { mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM };
  }
  matchesMark(t) {
    return this.dirty != He && this.mark.eq(t);
  }
  markDirty(t, n) {
    if (super.markDirty(t, n), this.dirty != Te) {
      let r = this.parent;
      for (; !r.node; )
        r = r.parent;
      r.dirty < this.dirty && (r.dirty = this.dirty), this.dirty = Te;
    }
  }
  slice(t, n, r) {
    let s = Ht.create(this.parent, this.mark, !0, r), o = this.children, l = this.size;
    n < l && (o = wr(o, n, l, r)), t > 0 && (o = wr(o, 0, t, r));
    for (let a = 0; a < o.length; a++)
      o[a].parent = s;
    return s.children = o, s;
  }
  ignoreMutation(t) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(t) : super.ignoreMutation(t);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
}
class mt extends $n {
  constructor(t, n, r, s, o, l, a, c, u) {
    super(t, [], o, l), this.node = n, this.outerDeco = r, this.innerDeco = s, this.nodeDOM = a;
  }
  // By default, a node is rendered using the `toDOM` method from the
  // node type spec. But client code can use the `nodeViews` spec to
  // supply a custom node view, which can influence various aspects of
  // the way the node works.
  //
  // (Using subclassing for this was intentionally decided against,
  // since it'd require exposing a whole slew of finicky
  // implementation details to the user code that they probably will
  // never need.)
  static create(t, n, r, s, o, l) {
    let a = o.nodeViews[n.type.name], c, u = a && a(n, o, () => {
      if (!c)
        return l;
      if (c.parent)
        return c.parent.posBeforeChild(c);
    }, r, s), d = u && u.dom, h = u && u.contentDOM;
    if (n.isText) {
      if (!d)
        d = document.createTextNode(n.text);
      else if (d.nodeType != 3)
        throw new RangeError("Text must be rendered as a DOM text node");
    } else d || ({ dom: d, contentDOM: h } = kt.renderSpec(document, n.type.spec.toDOM(n), null, n.attrs));
    !h && !n.isText && d.nodeName != "BR" && (d.hasAttribute("contenteditable") || (d.contentEditable = "false"), n.type.spec.draggable && (d.draggable = !0));
    let f = d;
    return d = wl(d, r, n), u ? c = new Yc(t, n, r, s, d, h || null, f, u, o, l + 1) : n.isText ? new Ii(t, n, r, s, d, f, o) : new mt(t, n, r, s, d, h || null, f, o, l + 1);
  }
  parseRule() {
    if (this.node.type.spec.reparseInView)
      return null;
    let t = { node: this.node.type.name, attrs: this.node.attrs };
    if (this.node.type.whitespace == "pre" && (t.preserveWhitespace = "full"), !this.contentDOM)
      t.getContent = () => this.node.content;
    else if (!this.contentLost)
      t.contentElement = this.contentDOM;
    else {
      for (let n = this.children.length - 1; n >= 0; n--) {
        let r = this.children[n];
        if (this.dom.contains(r.dom.parentNode)) {
          t.contentElement = r.dom.parentNode;
          break;
        }
      }
      t.contentElement || (t.getContent = () => x.empty);
    }
    return t;
  }
  matchesNode(t, n, r) {
    return this.dirty == Te && t.eq(this.node) && vi(n, this.outerDeco) && r.eq(this.innerDeco);
  }
  get size() {
    return this.node.nodeSize;
  }
  get border() {
    return this.node.isLeaf ? 0 : 1;
  }
  // Syncs `this.children` to match `this.node.content` and the local
  // decorations, possibly introducing nesting for marks. Then, in a
  // separate step, syncs the DOM inside `this.contentDOM` to
  // `this.children`.
  updateChildren(t, n) {
    let r = this.node.inlineContent, s = n, o = t.composing ? this.localCompositionInfo(t, n) : null, l = o && o.pos > -1 ? o : null, a = o && o.pos < 0, c = new Zc(this, l && l.node, t);
    tu(this.node, this.innerDeco, (u, d, h) => {
      u.spec.marks ? c.syncToMarks(u.spec.marks, r, t, d) : u.type.side >= 0 && !h && c.syncToMarks(d == this.node.childCount ? I.none : this.node.child(d).marks, r, t, d), c.placeWidget(u, t, s);
    }, (u, d, h, f) => {
      c.syncToMarks(u.marks, r, t, f);
      let p;
      c.findNodeMatch(u, d, h, f) || a && t.state.selection.from > s && t.state.selection.to < s + u.nodeSize && (p = c.findIndexWithChild(o.node)) > -1 && c.updateNodeAt(u, d, h, p, t) || c.updateNextNode(u, d, h, t, f, s) || c.addNode(u, d, h, t, s), s += u.nodeSize;
    }), c.syncToMarks([], r, t, 0), this.node.isTextblock && c.addTextblockHacks(), c.destroyRest(), (c.changed || this.dirty == Tt) && (l && this.protectLocalComposition(t, l), bl(this.contentDOM, this.children, t), ln && nu(this.dom));
  }
  localCompositionInfo(t, n) {
    let { from: r, to: s } = t.state.selection;
    if (!(t.state.selection instanceof L) || r < n || s > n + this.node.content.size)
      return null;
    let o = t.input.compositionNode;
    if (!o || !this.dom.contains(o.parentNode))
      return null;
    if (this.node.inlineContent) {
      let l = o.nodeValue, a = iu(this.node.content, l, r - n, s - n);
      return a < 0 ? null : { node: o, pos: a, text: l };
    } else
      return { node: o, pos: -1, text: "" };
  }
  protectLocalComposition(t, { node: n, pos: r, text: s }) {
    if (this.getDesc(n))
      return;
    let o = n;
    for (; o.parentNode != this.contentDOM; o = o.parentNode) {
      for (; o.previousSibling; )
        o.parentNode.removeChild(o.previousSibling);
      for (; o.nextSibling; )
        o.parentNode.removeChild(o.nextSibling);
      o.pmViewDesc && (o.pmViewDesc = void 0);
    }
    let l = new Xc(this, o, n, s);
    t.input.compositionNodes.push(l), this.children = wr(this.children, r, r + s.length, t, l);
  }
  // If this desc must be updated to match the given node decoration,
  // do so and return true.
  update(t, n, r, s) {
    return this.dirty == He || !t.sameMarkup(this.node) ? !1 : (this.updateInner(t, n, r, s), !0);
  }
  updateInner(t, n, r, s) {
    this.updateOuterDeco(n), this.node = t, this.innerDeco = r, this.contentDOM && this.updateChildren(s, this.posAtStart), this.dirty = Te;
  }
  updateOuterDeco(t) {
    if (vi(t, this.outerDeco))
      return;
    let n = this.nodeDOM.nodeType != 1, r = this.dom;
    this.dom = vl(this.dom, this.nodeDOM, vr(this.outerDeco, this.node, n), vr(t, this.node, n)), this.dom != r && (r.pmViewDesc = void 0, this.dom.pmViewDesc = this), this.outerDeco = t;
  }
  // Mark this node as being the selected node.
  selectNode() {
    this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.add("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && (this.nodeDOM.draggable = !0));
  }
  // Remove selected node marking from this node.
  deselectNode() {
    this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.remove("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && this.nodeDOM.removeAttribute("draggable"));
  }
  get domAtom() {
    return this.node.isAtom;
  }
}
function Ds(i, t, n, r, s) {
  wl(r, t, i);
  let o = new mt(void 0, i, t, n, r, r, r, s, 0);
  return o.contentDOM && o.updateChildren(s, 0), o;
}
class Ii extends mt {
  constructor(t, n, r, s, o, l, a) {
    super(t, n, r, s, o, null, l, a, 0);
  }
  parseRule() {
    let t = this.nodeDOM.parentNode;
    for (; t && t != this.dom && !t.pmIsDeco; )
      t = t.parentNode;
    return { skip: t || !0 };
  }
  update(t, n, r, s) {
    return this.dirty == He || this.dirty != Te && !this.inParent() || !t.sameMarkup(this.node) ? !1 : (this.updateOuterDeco(n), (this.dirty != Te || t.text != this.node.text) && t.text != this.nodeDOM.nodeValue && (this.nodeDOM.nodeValue = t.text, s.trackWrites == this.nodeDOM && (s.trackWrites = null)), this.node = t, this.dirty = Te, !0);
  }
  inParent() {
    let t = this.parent.contentDOM;
    for (let n = this.nodeDOM; n; n = n.parentNode)
      if (n == t)
        return !0;
    return !1;
  }
  domFromPos(t) {
    return { node: this.nodeDOM, offset: t };
  }
  localPosFromDOM(t, n, r) {
    return t == this.nodeDOM ? this.posAtStart + Math.min(n, this.node.text.length) : super.localPosFromDOM(t, n, r);
  }
  ignoreMutation(t) {
    return t.type != "characterData" && t.type != "selection";
  }
  slice(t, n, r) {
    let s = this.node.cut(t, n), o = document.createTextNode(s.text);
    return new Ii(this.parent, s, this.outerDeco, this.innerDeco, o, o, r);
  }
  markDirty(t, n) {
    super.markDirty(t, n), this.dom != this.nodeDOM && (t == 0 || n == this.nodeDOM.nodeValue.length) && (this.dirty = He);
  }
  get domAtom() {
    return !1;
  }
  isText(t) {
    return this.node.text == t;
  }
}
class yl extends $n {
  parseRule() {
    return { ignore: !0 };
  }
  matchesHack(t) {
    return this.dirty == Te && this.dom.nodeName == t;
  }
  get domAtom() {
    return !0;
  }
  get ignoreForCoords() {
    return this.dom.nodeName == "IMG";
  }
}
class Yc extends mt {
  constructor(t, n, r, s, o, l, a, c, u, d) {
    super(t, n, r, s, o, l, a, u, d), this.spec = c;
  }
  // A custom `update` method gets to decide whether the update goes
  // through. If it does, and there's a `contentDOM` node, our logic
  // updates the children.
  update(t, n, r, s) {
    if (this.dirty == He)
      return !1;
    if (this.spec.update && (this.node.type == t.type || this.spec.multiType)) {
      let o = this.spec.update(t, n, r);
      return o && this.updateInner(t, n, r, s), o;
    } else return !this.contentDOM && !t.isLeaf ? !1 : super.update(t, n, r, s);
  }
  selectNode() {
    this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
  }
  deselectNode() {
    this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
  }
  setSelection(t, n, r, s) {
    this.spec.setSelection ? this.spec.setSelection(t, n, r.root) : super.setSelection(t, n, r, s);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
  stopEvent(t) {
    return this.spec.stopEvent ? this.spec.stopEvent(t) : !1;
  }
  ignoreMutation(t) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(t) : super.ignoreMutation(t);
  }
}
function bl(i, t, n) {
  let r = i.firstChild, s = !1;
  for (let o = 0; o < t.length; o++) {
    let l = t[o], a = l.dom;
    if (a.parentNode == i) {
      for (; a != r; )
        r = zs(r), s = !0;
      r = r.nextSibling;
    } else
      s = !0, i.insertBefore(a, r);
    if (l instanceof Ht) {
      let c = r ? r.previousSibling : i.lastChild;
      bl(l.contentDOM, l.children, n), r = c ? c.nextSibling : i.firstChild;
    }
  }
  for (; r; )
    r = zs(r), s = !0;
  s && n.trackWrites == i && (n.trackWrites = null);
}
const An = function(i) {
  i && (this.nodeName = i);
};
An.prototype = /* @__PURE__ */ Object.create(null);
const At = [new An()];
function vr(i, t, n) {
  if (i.length == 0)
    return At;
  let r = n ? At[0] : new An(), s = [r];
  for (let o = 0; o < i.length; o++) {
    let l = i[o].type.attrs;
    if (l) {
      l.nodeName && s.push(r = new An(l.nodeName));
      for (let a in l) {
        let c = l[a];
        c != null && (n && s.length == 1 && s.push(r = new An(t.isInline ? "span" : "div")), a == "class" ? r.class = (r.class ? r.class + " " : "") + c : a == "style" ? r.style = (r.style ? r.style + ";" : "") + c : a != "nodeName" && (r[a] = c));
      }
    }
  }
  return s;
}
function vl(i, t, n, r) {
  if (n == At && r == At)
    return t;
  let s = t;
  for (let o = 0; o < r.length; o++) {
    let l = r[o], a = n[o];
    if (o) {
      let c;
      a && a.nodeName == l.nodeName && s != i && (c = s.parentNode) && c.nodeName.toLowerCase() == l.nodeName || (c = document.createElement(l.nodeName), c.pmIsDeco = !0, c.appendChild(s), a = At[0]), s = c;
    }
    Gc(s, a || At[0], l);
  }
  return s;
}
function Gc(i, t, n) {
  for (let r in t)
    r != "class" && r != "style" && r != "nodeName" && !(r in n) && i.removeAttribute(r);
  for (let r in n)
    r != "class" && r != "style" && r != "nodeName" && n[r] != t[r] && i.setAttribute(r, n[r]);
  if (t.class != n.class) {
    let r = t.class ? t.class.split(" ").filter(Boolean) : [], s = n.class ? n.class.split(" ").filter(Boolean) : [];
    for (let o = 0; o < r.length; o++)
      s.indexOf(r[o]) == -1 && i.classList.remove(r[o]);
    for (let o = 0; o < s.length; o++)
      r.indexOf(s[o]) == -1 && i.classList.add(s[o]);
    i.classList.length == 0 && i.removeAttribute("class");
  }
  if (t.style != n.style) {
    if (t.style) {
      let r = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, s;
      for (; s = r.exec(t.style); )
        i.style.removeProperty(s[1]);
    }
    n.style && (i.style.cssText += n.style);
  }
}
function wl(i, t, n) {
  return vl(i, i, At, vr(t, n, i.nodeType != 1));
}
function vi(i, t) {
  if (i.length != t.length)
    return !1;
  for (let n = 0; n < i.length; n++)
    if (!i[n].type.eq(t[n].type))
      return !1;
  return !0;
}
function zs(i) {
  let t = i.nextSibling;
  return i.parentNode.removeChild(i), t;
}
class Zc {
  constructor(t, n, r) {
    this.lock = n, this.view = r, this.index = 0, this.stack = [], this.changed = !1, this.top = t, this.preMatch = Qc(t.node.content, t);
  }
  // Destroy and remove the children between the given indices in
  // `this.top`.
  destroyBetween(t, n) {
    if (t != n) {
      for (let r = t; r < n; r++)
        this.top.children[r].destroy();
      this.top.children.splice(t, n - t), this.changed = !0;
    }
  }
  // Destroy all remaining children in `this.top`.
  destroyRest() {
    this.destroyBetween(this.index, this.top.children.length);
  }
  // Sync the current stack of mark descs with the given array of
  // marks, reusing existing mark descs when possible.
  syncToMarks(t, n, r, s) {
    let o = 0, l = this.stack.length >> 1, a = Math.min(l, t.length);
    for (; o < a && (o == l - 1 ? this.top : this.stack[o + 1 << 1]).matchesMark(t[o]) && t[o].type.spec.spanning !== !1; )
      o++;
    for (; o < l; )
      this.destroyRest(), this.top.dirty = Te, this.index = this.stack.pop(), this.top = this.stack.pop(), l--;
    for (; l < t.length; ) {
      this.stack.push(this.top, this.index + 1);
      let c = -1, u = this.top.children.length;
      s < this.preMatch.index && (u = Math.min(this.index + 3, u));
      for (let d = this.index; d < u; d++) {
        let h = this.top.children[d];
        if (h.matchesMark(t[l]) && !this.isLocked(h.dom)) {
          c = d;
          break;
        }
      }
      if (c > -1)
        c > this.index && (this.changed = !0, this.destroyBetween(this.index, c)), this.top = this.top.children[this.index];
      else {
        let d = Ht.create(this.top, t[l], n, r);
        this.top.children.splice(this.index, 0, d), this.top = d, this.changed = !0;
      }
      this.index = 0, l++;
    }
  }
  // Try to find a node desc matching the given data. Skip over it and
  // return true when successful.
  findNodeMatch(t, n, r, s) {
    let o = -1, l;
    if (s >= this.preMatch.index && (l = this.preMatch.matches[s - this.preMatch.index]).parent == this.top && l.matchesNode(t, n, r))
      o = this.top.children.indexOf(l, this.index);
    else
      for (let a = this.index, c = Math.min(this.top.children.length, a + 5); a < c; a++) {
        let u = this.top.children[a];
        if (u.matchesNode(t, n, r) && !this.preMatch.matched.has(u)) {
          o = a;
          break;
        }
      }
    return o < 0 ? !1 : (this.destroyBetween(this.index, o), this.index++, !0);
  }
  updateNodeAt(t, n, r, s, o) {
    let l = this.top.children[s];
    return l.dirty == He && l.dom == l.contentDOM && (l.dirty = Tt), l.update(t, n, r, o) ? (this.destroyBetween(this.index, s), this.index++, !0) : !1;
  }
  findIndexWithChild(t) {
    for (; ; ) {
      let n = t.parentNode;
      if (!n)
        return -1;
      if (n == this.top.contentDOM) {
        let r = t.pmViewDesc;
        if (r) {
          for (let s = this.index; s < this.top.children.length; s++)
            if (this.top.children[s] == r)
              return s;
        }
        return -1;
      }
      t = n;
    }
  }
  // Try to update the next node, if any, to the given data. Checks
  // pre-matches to avoid overwriting nodes that could still be used.
  updateNextNode(t, n, r, s, o, l) {
    for (let a = this.index; a < this.top.children.length; a++) {
      let c = this.top.children[a];
      if (c instanceof mt) {
        let u = this.preMatch.matched.get(c);
        if (u != null && u != o)
          return !1;
        let d = c.dom, h, f = this.isLocked(d) && !(t.isText && c.node && c.node.isText && c.nodeDOM.nodeValue == t.text && c.dirty != He && vi(n, c.outerDeco));
        if (!f && c.update(t, n, r, s))
          return this.destroyBetween(this.index, a), c.dom != d && (this.changed = !0), this.index++, !0;
        if (!f && (h = this.recreateWrapper(c, t, n, r, s, l)))
          return this.destroyBetween(this.index, a), this.top.children[this.index] = h, h.contentDOM && (h.dirty = Tt, h.updateChildren(s, l + 1), h.dirty = Te), this.changed = !0, this.index++, !0;
        break;
      }
    }
    return !1;
  }
  // When a node with content is replaced by a different node with
  // identical content, move over its children.
  recreateWrapper(t, n, r, s, o, l) {
    if (t.dirty || n.isAtom || !t.children.length || !t.node.content.eq(n.content) || !vi(r, t.outerDeco) || !s.eq(t.innerDeco))
      return null;
    let a = mt.create(this.top, n, r, s, o, l);
    if (a.contentDOM) {
      a.children = t.children, t.children = [];
      for (let c of a.children)
        c.parent = a;
    }
    return t.destroy(), a;
  }
  // Insert the node as a newly created node desc.
  addNode(t, n, r, s, o) {
    let l = mt.create(this.top, t, n, r, s, o);
    l.contentDOM && l.updateChildren(s, o + 1), this.top.children.splice(this.index++, 0, l), this.changed = !0;
  }
  placeWidget(t, n, r) {
    let s = this.index < this.top.children.length ? this.top.children[this.index] : null;
    if (s && s.matchesWidget(t) && (t == s.widget || !s.widget.type.toDOM.parentNode))
      this.index++;
    else {
      let o = new gl(this.top, t, n, r);
      this.top.children.splice(this.index++, 0, o), this.changed = !0;
    }
  }
  // Make sure a textblock looks and behaves correctly in
  // contentEditable.
  addTextblockHacks() {
    let t = this.top.children[this.index - 1], n = this.top;
    for (; t instanceof Ht; )
      n = t, t = n.children[n.children.length - 1];
    (!t || // Empty textblock
    !(t instanceof Ii) || /\n$/.test(t.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(t.node.text)) && ((ie || Z) && t && t.dom.contentEditable == "false" && this.addHackNode("IMG", n), this.addHackNode("BR", this.top));
  }
  addHackNode(t, n) {
    if (n == this.top && this.index < n.children.length && n.children[this.index].matchesHack(t))
      this.index++;
    else {
      let r = document.createElement(t);
      t == "IMG" && (r.className = "ProseMirror-separator", r.alt = ""), t == "BR" && (r.className = "ProseMirror-trailingBreak");
      let s = new yl(this.top, [], r, null);
      n != this.top ? n.children.push(s) : n.children.splice(this.index++, 0, s), this.changed = !0;
    }
  }
  isLocked(t) {
    return this.lock && (t == this.lock || t.nodeType == 1 && t.contains(this.lock.parentNode));
  }
}
function Qc(i, t) {
  let n = t, r = n.children.length, s = i.childCount, o = /* @__PURE__ */ new Map(), l = [];
  e: for (; s > 0; ) {
    let a;
    for (; ; )
      if (r) {
        let u = n.children[r - 1];
        if (u instanceof Ht)
          n = u, r = u.children.length;
        else {
          a = u, r--;
          break;
        }
      } else {
        if (n == t)
          break e;
        r = n.parent.children.indexOf(n), n = n.parent;
      }
    let c = a.node;
    if (c) {
      if (c != i.child(s - 1))
        break;
      --s, o.set(a, s), l.push(a);
    }
  }
  return { index: s, matched: o, matches: l.reverse() };
}
function eu(i, t) {
  return i.type.side - t.type.side;
}
function tu(i, t, n, r) {
  let s = t.locals(i), o = 0;
  if (s.length == 0) {
    for (let u = 0; u < i.childCount; u++) {
      let d = i.child(u);
      r(d, s, t.forChild(o, d), u), o += d.nodeSize;
    }
    return;
  }
  let l = 0, a = [], c = null;
  for (let u = 0; ; ) {
    let d, h;
    for (; l < s.length && s[l].to == o; ) {
      let b = s[l++];
      b.widget && (d ? (h || (h = [d])).push(b) : d = b);
    }
    if (d)
      if (h) {
        h.sort(eu);
        for (let b = 0; b < h.length; b++)
          n(h[b], u, !!c);
      } else
        n(d, u, !!c);
    let f, p;
    if (c)
      p = -1, f = c, c = null;
    else if (u < i.childCount)
      p = u, f = i.child(u++);
    else
      break;
    for (let b = 0; b < a.length; b++)
      a[b].to <= o && a.splice(b--, 1);
    for (; l < s.length && s[l].from <= o && s[l].to > o; )
      a.push(s[l++]);
    let m = o + f.nodeSize;
    if (f.isText) {
      let b = m;
      l < s.length && s[l].from < b && (b = s[l].from);
      for (let w = 0; w < a.length; w++)
        a[w].to < b && (b = a[w].to);
      b < m && (c = f.cut(b - o), f = f.cut(0, b - o), m = b, p = -1);
    } else
      for (; l < s.length && s[l].to < m; )
        l++;
    let y = f.isInline && !f.isLeaf ? a.filter((b) => !b.inline) : a.slice();
    r(f, y, t.forChild(o, f), p), o = m;
  }
}
function nu(i) {
  if (i.nodeName == "UL" || i.nodeName == "OL") {
    let t = i.style.cssText;
    i.style.cssText = t + "; list-style: square !important", window.getComputedStyle(i).listStyle, i.style.cssText = t;
  }
}
function iu(i, t, n, r) {
  for (let s = 0, o = 0; s < i.childCount && o <= r; ) {
    let l = i.child(s++), a = o;
    if (o += l.nodeSize, !l.isText)
      continue;
    let c = l.text;
    for (; s < i.childCount; ) {
      let u = i.child(s++);
      if (o += u.nodeSize, !u.isText)
        break;
      c += u.text;
    }
    if (o >= n) {
      if (o >= r && c.slice(r - t.length - a, r - a) == t)
        return r - t.length;
      let u = a < r ? c.lastIndexOf(t, r - a - 1) : -1;
      if (u >= 0 && u + t.length + a >= n)
        return a + u;
      if (n == r && c.length >= r + t.length - a && c.slice(r - a, r - a + t.length) == t)
        return r;
    }
  }
  return -1;
}
function wr(i, t, n, r, s) {
  let o = [];
  for (let l = 0, a = 0; l < i.length; l++) {
    let c = i[l], u = a, d = a += c.size;
    u >= n || d <= t ? o.push(c) : (u < t && o.push(c.slice(0, t - u, r)), s && (o.push(s), s = void 0), d > n && o.push(c.slice(n - u, c.size, r)));
  }
  return o;
}
function Pr(i, t = null) {
  let n = i.domSelectionRange(), r = i.state.doc;
  if (!n.focusNode)
    return null;
  let s = i.docView.nearestDesc(n.focusNode), o = s && s.size == 0, l = i.docView.posFromDOM(n.focusNode, n.focusOffset, 1);
  if (l < 0)
    return null;
  let a = r.resolve(l), c, u;
  if (Ri(n)) {
    for (c = l; s && !s.node; )
      s = s.parent;
    let h = s.node;
    if (s && h.isAtom && A.isSelectable(h) && s.parent && !(h.isInline && Oc(n.focusNode, n.focusOffset, s.dom))) {
      let f = s.posBefore;
      u = new A(l == f ? a : r.resolve(f));
    }
  } else {
    if (n instanceof i.dom.ownerDocument.defaultView.Selection && n.rangeCount > 1) {
      let h = l, f = l;
      for (let p = 0; p < n.rangeCount; p++) {
        let m = n.getRangeAt(p);
        h = Math.min(h, i.docView.posFromDOM(m.startContainer, m.startOffset, 1)), f = Math.max(f, i.docView.posFromDOM(m.endContainer, m.endOffset, -1));
      }
      if (h < 0)
        return null;
      [c, l] = f == i.state.selection.anchor ? [f, h] : [h, f], a = r.resolve(l);
    } else
      c = i.docView.posFromDOM(n.anchorNode, n.anchorOffset, 1);
    if (c < 0)
      return null;
  }
  let d = r.resolve(c);
  if (!u) {
    let h = t == "pointer" || i.state.selection.head < a.pos && !o ? 1 : -1;
    u = Fr(i, d, a, h);
  }
  return u;
}
function xl(i) {
  return i.editable ? i.hasFocus() : Sl(i) && document.activeElement && document.activeElement.contains(i.dom);
}
function Xe(i, t = !1) {
  let n = i.state.selection;
  if (kl(i, n), !!xl(i)) {
    if (!t && i.input.mouseDown && i.input.mouseDown.allowDefault && Z) {
      let r = i.domSelectionRange(), s = i.domObserver.currentSelection;
      if (r.anchorNode && s.anchorNode && Vt(r.anchorNode, r.anchorOffset, s.anchorNode, s.anchorOffset)) {
        i.input.mouseDown.delayedSelectionSync = !0, i.domObserver.setCurSelection();
        return;
      }
    }
    if (i.domObserver.disconnectSelection(), i.cursorWrapper)
      su(i);
    else {
      let { anchor: r, head: s } = n, o, l;
      Rs && !(n instanceof L) && (n.$from.parent.inlineContent || (o = Is(i, n.from)), !n.empty && !n.$from.parent.inlineContent && (l = Is(i, n.to))), i.docView.setSelection(r, s, i, t), Rs && (o && Ls(o), l && Ls(l)), n.visible ? i.dom.classList.remove("ProseMirror-hideselection") : (i.dom.classList.add("ProseMirror-hideselection"), "onselectionchange" in document && ru(i));
    }
    i.domObserver.setCurSelection(), i.domObserver.connectSelection();
  }
}
const Rs = ie || Z && al < 63;
function Is(i, t) {
  let { node: n, offset: r } = i.docView.domFromPos(t, 0), s = r < n.childNodes.length ? n.childNodes[r] : null, o = r ? n.childNodes[r - 1] : null;
  if (ie && s && s.contentEditable == "false")
    return Gi(s);
  if ((!s || s.contentEditable == "false") && (!o || o.contentEditable == "false")) {
    if (s)
      return Gi(s);
    if (o)
      return Gi(o);
  }
}
function Gi(i) {
  return i.contentEditable = "true", ie && i.draggable && (i.draggable = !1, i.wasDraggable = !0), i;
}
function Ls(i) {
  i.contentEditable = "false", i.wasDraggable && (i.draggable = !0, i.wasDraggable = null);
}
function ru(i) {
  let t = i.dom.ownerDocument;
  t.removeEventListener("selectionchange", i.input.hideSelectionGuard);
  let n = i.domSelectionRange(), r = n.anchorNode, s = n.anchorOffset;
  t.addEventListener("selectionchange", i.input.hideSelectionGuard = () => {
    (n.anchorNode != r || n.anchorOffset != s) && (t.removeEventListener("selectionchange", i.input.hideSelectionGuard), setTimeout(() => {
      (!xl(i) || i.state.selection.visible) && i.dom.classList.remove("ProseMirror-hideselection");
    }, 20));
  });
}
function su(i) {
  let t = i.domSelection();
  if (!t)
    return;
  let n = i.cursorWrapper.dom, r = n.nodeName == "IMG";
  r ? t.collapse(n.parentNode, Y(n) + 1) : t.collapse(n, 0), !r && !i.state.selection.visible && me && pt <= 11 && (n.disabled = !0, n.disabled = !1);
}
function kl(i, t) {
  if (t instanceof A) {
    let n = i.docView.descAt(t.from);
    n != i.lastSelectedViewDesc && (Bs(i), n && n.selectNode(), i.lastSelectedViewDesc = n);
  } else
    Bs(i);
}
function Bs(i) {
  i.lastSelectedViewDesc && (i.lastSelectedViewDesc.parent && i.lastSelectedViewDesc.deselectNode(), i.lastSelectedViewDesc = void 0);
}
function Fr(i, t, n, r) {
  return i.someProp("createSelectionBetween", (s) => s(i, t, n)) || L.between(t, n, r);
}
function Ps(i) {
  return i.editable && !i.hasFocus() ? !1 : Sl(i);
}
function Sl(i) {
  let t = i.domSelectionRange();
  if (!t.anchorNode)
    return !1;
  try {
    return i.dom.contains(t.anchorNode.nodeType == 3 ? t.anchorNode.parentNode : t.anchorNode) && (i.editable || i.dom.contains(t.focusNode.nodeType == 3 ? t.focusNode.parentNode : t.focusNode));
  } catch {
    return !1;
  }
}
function ou(i) {
  let t = i.docView.domFromPos(i.state.selection.anchor, 0), n = i.domSelectionRange();
  return Vt(t.node, t.offset, n.anchorNode, n.anchorOffset);
}
function xr(i, t) {
  let { $anchor: n, $head: r } = i.selection, s = t > 0 ? n.max(r) : n.min(r), o = s.parent.inlineContent ? s.depth ? i.doc.resolve(t > 0 ? s.after() : s.before()) : null : s;
  return o && q.findFrom(o, t);
}
function rt(i, t) {
  return i.dispatch(i.state.tr.setSelection(t).scrollIntoView()), !0;
}
function Fs(i, t, n) {
  let r = i.state.selection;
  if (r instanceof L)
    if (n.indexOf("s") > -1) {
      let { $head: s } = r, o = s.textOffset ? null : t < 0 ? s.nodeBefore : s.nodeAfter;
      if (!o || o.isText || !o.isLeaf)
        return !1;
      let l = i.state.doc.resolve(s.pos + o.nodeSize * (t < 0 ? -1 : 1));
      return rt(i, new L(r.$anchor, l));
    } else if (r.empty) {
      if (i.endOfTextblock(t > 0 ? "forward" : "backward")) {
        let s = xr(i.state, t);
        return s && s instanceof A ? rt(i, s) : !1;
      } else if (!(Ce && n.indexOf("m") > -1)) {
        let s = r.$head, o = s.textOffset ? null : t < 0 ? s.nodeBefore : s.nodeAfter, l;
        if (!o || o.isText)
          return !1;
        let a = t < 0 ? s.pos - o.nodeSize : s.pos;
        return o.isAtom || (l = i.docView.descAt(a)) && !l.contentDOM ? A.isSelectable(o) ? rt(i, new A(t < 0 ? i.state.doc.resolve(s.pos - o.nodeSize) : s)) : Hn ? rt(i, new L(i.state.doc.resolve(t < 0 ? a : a + o.nodeSize))) : !1 : !1;
      }
    } else return !1;
  else {
    if (r instanceof A && r.node.isInline)
      return rt(i, new L(t > 0 ? r.$to : r.$from));
    {
      let s = xr(i.state, t);
      return s ? rt(i, s) : !1;
    }
  }
}
function wi(i) {
  return i.nodeType == 3 ? i.nodeValue.length : i.childNodes.length;
}
function On(i, t) {
  let n = i.pmViewDesc;
  return n && n.size == 0 && (t < 0 || i.nextSibling || i.nodeName != "BR");
}
function Xt(i, t) {
  return t < 0 ? lu(i) : au(i);
}
function lu(i) {
  let t = i.domSelectionRange(), n = t.focusNode, r = t.focusOffset;
  if (!n)
    return;
  let s, o, l = !1;
  for (Ne && n.nodeType == 1 && r < wi(n) && On(n.childNodes[r], -1) && (l = !0); ; )
    if (r > 0) {
      if (n.nodeType != 1)
        break;
      {
        let a = n.childNodes[r - 1];
        if (On(a, -1))
          s = n, o = --r;
        else if (a.nodeType == 3)
          n = a, r = n.nodeValue.length;
        else
          break;
      }
    } else {
      if (Cl(n))
        break;
      {
        let a = n.previousSibling;
        for (; a && On(a, -1); )
          s = n.parentNode, o = Y(a), a = a.previousSibling;
        if (a)
          n = a, r = wi(n);
        else {
          if (n = n.parentNode, n == i.dom)
            break;
          r = 0;
        }
      }
    }
  l ? kr(i, n, r) : s && kr(i, s, o);
}
function au(i) {
  let t = i.domSelectionRange(), n = t.focusNode, r = t.focusOffset;
  if (!n)
    return;
  let s = wi(n), o, l;
  for (; ; )
    if (r < s) {
      if (n.nodeType != 1)
        break;
      let a = n.childNodes[r];
      if (On(a, 1))
        o = n, l = ++r;
      else
        break;
    } else {
      if (Cl(n))
        break;
      {
        let a = n.nextSibling;
        for (; a && On(a, 1); )
          o = a.parentNode, l = Y(a) + 1, a = a.nextSibling;
        if (a)
          n = a, r = 0, s = wi(n);
        else {
          if (n = n.parentNode, n == i.dom)
            break;
          r = s = 0;
        }
      }
    }
  o && kr(i, o, l);
}
function Cl(i) {
  let t = i.pmViewDesc;
  return t && t.node && t.node.isBlock;
}
function cu(i, t) {
  for (; i && t == i.childNodes.length && !Vn(i); )
    t = Y(i) + 1, i = i.parentNode;
  for (; i && t < i.childNodes.length; ) {
    let n = i.childNodes[t];
    if (n.nodeType == 3)
      return n;
    if (n.nodeType == 1 && n.contentEditable == "false")
      break;
    i = n, t = 0;
  }
}
function uu(i, t) {
  for (; i && !t && !Vn(i); )
    t = Y(i), i = i.parentNode;
  for (; i && t; ) {
    let n = i.childNodes[t - 1];
    if (n.nodeType == 3)
      return n;
    if (n.nodeType == 1 && n.contentEditable == "false")
      break;
    i = n, t = i.childNodes.length;
  }
}
function kr(i, t, n) {
  if (t.nodeType != 3) {
    let o, l;
    (l = cu(t, n)) ? (t = l, n = 0) : (o = uu(t, n)) && (t = o, n = o.nodeValue.length);
  }
  let r = i.domSelection();
  if (!r)
    return;
  if (Ri(r)) {
    let o = document.createRange();
    o.setEnd(t, n), o.setStart(t, n), r.removeAllRanges(), r.addRange(o);
  } else r.extend && r.extend(t, n);
  i.domObserver.setCurSelection();
  let { state: s } = i;
  setTimeout(() => {
    i.state == s && Xe(i);
  }, 50);
}
function Vs(i, t) {
  let n = i.state.doc.resolve(t);
  if (!(Z || cl) && n.parent.inlineContent) {
    let s = i.coordsAtPos(t);
    if (t > n.start()) {
      let o = i.coordsAtPos(t - 1), l = (o.top + o.bottom) / 2;
      if (l > s.top && l < s.bottom && Math.abs(o.left - s.left) > 1)
        return o.left < s.left ? "ltr" : "rtl";
    }
    if (t < n.end()) {
      let o = i.coordsAtPos(t + 1), l = (o.top + o.bottom) / 2;
      if (l > s.top && l < s.bottom && Math.abs(o.left - s.left) > 1)
        return o.left > s.left ? "ltr" : "rtl";
    }
  }
  return getComputedStyle(i.dom).direction == "rtl" ? "rtl" : "ltr";
}
function Hs(i, t, n) {
  let r = i.state.selection;
  if (r instanceof L && !r.empty || n.indexOf("s") > -1 || Ce && n.indexOf("m") > -1)
    return !1;
  let { $from: s, $to: o } = r;
  if (!s.parent.inlineContent || i.endOfTextblock(t < 0 ? "up" : "down")) {
    let l = xr(i.state, t);
    if (l && l instanceof A)
      return rt(i, l);
  }
  if (!s.parent.inlineContent) {
    let l = t < 0 ? s : o, a = r instanceof pe ? q.near(l, t) : q.findFrom(l, t);
    return a ? rt(i, a) : !1;
  }
  return !1;
}
function $s(i, t) {
  if (!(i.state.selection instanceof L))
    return !0;
  let { $head: n, $anchor: r, empty: s } = i.state.selection;
  if (!n.sameParent(r))
    return !0;
  if (!s)
    return !1;
  if (i.endOfTextblock(t > 0 ? "forward" : "backward"))
    return !0;
  let o = !n.textOffset && (t < 0 ? n.nodeBefore : n.nodeAfter);
  if (o && !o.isText) {
    let l = i.state.tr;
    return t < 0 ? l.delete(n.pos - o.nodeSize, n.pos) : l.delete(n.pos, n.pos + o.nodeSize), i.dispatch(l), !0;
  }
  return !1;
}
function Ws(i, t, n) {
  i.domObserver.stop(), t.contentEditable = n, i.domObserver.start();
}
function du(i) {
  if (!ie || i.state.selection.$head.parentOffset > 0)
    return !1;
  let { focusNode: t, focusOffset: n } = i.domSelectionRange();
  if (t && t.nodeType == 1 && n == 0 && t.firstChild && t.firstChild.contentEditable == "false") {
    let r = t.firstChild;
    Ws(i, r, "true"), setTimeout(() => Ws(i, r, "false"), 20);
  }
  return !1;
}
function hu(i) {
  let t = "";
  return i.ctrlKey && (t += "c"), i.metaKey && (t += "m"), i.altKey && (t += "a"), i.shiftKey && (t += "s"), t;
}
function fu(i, t) {
  let n = t.keyCode, r = hu(t);
  if (n == 8 || Ce && n == 72 && r == "c")
    return $s(i, -1) || Xt(i, -1);
  if (n == 46 && !t.shiftKey || Ce && n == 68 && r == "c")
    return $s(i, 1) || Xt(i, 1);
  if (n == 13 || n == 27)
    return !0;
  if (n == 37 || Ce && n == 66 && r == "c") {
    let s = n == 37 ? Vs(i, i.state.selection.from) == "ltr" ? -1 : 1 : -1;
    return Fs(i, s, r) || Xt(i, s);
  } else if (n == 39 || Ce && n == 70 && r == "c") {
    let s = n == 39 ? Vs(i, i.state.selection.from) == "ltr" ? 1 : -1 : 1;
    return Fs(i, s, r) || Xt(i, s);
  } else {
    if (n == 38 || Ce && n == 80 && r == "c")
      return Hs(i, -1, r) || Xt(i, -1);
    if (n == 40 || Ce && n == 78 && r == "c")
      return du(i) || Hs(i, 1, r) || Xt(i, 1);
    if (r == (Ce ? "m" : "c") && (n == 66 || n == 73 || n == 89 || n == 90))
      return !0;
  }
  return !1;
}
function Vr(i, t) {
  i.someProp("transformCopied", (p) => {
    t = p(t, i);
  });
  let n = [], { content: r, openStart: s, openEnd: o } = t;
  for (; s > 1 && o > 1 && r.childCount == 1 && r.firstChild.childCount == 1; ) {
    s--, o--;
    let p = r.firstChild;
    n.push(p.type.name, p.attrs != p.type.defaultAttrs ? p.attrs : null), r = p.content;
  }
  let l = i.someProp("clipboardSerializer") || kt.fromSchema(i.state.schema), a = Ol(), c = a.createElement("div");
  c.appendChild(l.serializeFragment(r, { document: a }));
  let u = c.firstChild, d, h = 0;
  for (; u && u.nodeType == 1 && (d = Al[u.nodeName.toLowerCase()]); ) {
    for (let p = d.length - 1; p >= 0; p--) {
      let m = a.createElement(d[p]);
      for (; c.firstChild; )
        m.appendChild(c.firstChild);
      c.appendChild(m), h++;
    }
    u = c.firstChild;
  }
  u && u.nodeType == 1 && u.setAttribute("data-pm-slice", `${s} ${o}${h ? ` -${h}` : ""} ${JSON.stringify(n)}`);
  let f = i.someProp("clipboardTextSerializer", (p) => p(t, i)) || t.content.textBetween(0, t.content.size, `

`);
  return { dom: c, text: f, slice: t };
}
function Ml(i, t, n, r, s) {
  let o = s.parent.type.spec.code, l, a;
  if (!n && !t)
    return null;
  let c = !!t && (r || o || !n);
  if (c) {
    if (i.someProp("transformPastedText", (f) => {
      t = f(t, o || r, i);
    }), o)
      return a = new k(x.from(i.state.schema.text(t.replace(/\r\n?/g, `
`))), 0, 0), i.someProp("transformPasted", (f) => {
        a = f(a, i, !0);
      }), a;
    let h = i.someProp("clipboardTextParser", (f) => f(t, s, r, i));
    if (h)
      a = h;
    else {
      let f = s.marks(), { schema: p } = i.state, m = kt.fromSchema(p);
      l = document.createElement("div"), t.split(/(?:\r\n?|\n)+/).forEach((y) => {
        let b = l.appendChild(document.createElement("p"));
        y && b.appendChild(m.serializeNode(p.text(y, f)));
      });
    }
  } else
    i.someProp("transformPastedHTML", (h) => {
      n = h(n, i);
    }), l = yu(n), Hn && bu(l);
  let u = l && l.querySelector("[data-pm-slice]"), d = u && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(u.getAttribute("data-pm-slice") || "");
  if (d && d[3])
    for (let h = +d[3]; h > 0; h--) {
      let f = l.firstChild;
      for (; f && f.nodeType != 1; )
        f = f.nextSibling;
      if (!f)
        break;
      l = f;
    }
  if (a || (a = (i.someProp("clipboardParser") || i.someProp("domParser") || Wt.fromSchema(i.state.schema)).parseSlice(l, {
    preserveWhitespace: !!(c || d),
    context: s,
    ruleFromNode(f) {
      return f.nodeName == "BR" && !f.nextSibling && f.parentNode && !pu.test(f.parentNode.nodeName) ? { ignore: !0 } : null;
    }
  })), d)
    a = vu(Us(a, +d[1], +d[2]), d[4]);
  else if (a = k.maxOpen(mu(a.content, s), !0), a.openStart || a.openEnd) {
    let h = 0, f = 0;
    for (let p = a.content.firstChild; h < a.openStart && !p.type.spec.isolating; h++, p = p.firstChild)
      ;
    for (let p = a.content.lastChild; f < a.openEnd && !p.type.spec.isolating; f++, p = p.lastChild)
      ;
    a = Us(a, h, f);
  }
  return i.someProp("transformPasted", (h) => {
    a = h(a, i, c);
  }), a;
}
const pu = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
function mu(i, t) {
  if (i.childCount < 2)
    return i;
  for (let n = t.depth; n >= 0; n--) {
    let s = t.node(n).contentMatchAt(t.index(n)), o, l = [];
    if (i.forEach((a) => {
      if (!l)
        return;
      let c = s.findWrapping(a.type), u;
      if (!c)
        return l = null;
      if (u = l.length && o.length && Nl(c, o, a, l[l.length - 1], 0))
        l[l.length - 1] = u;
      else {
        l.length && (l[l.length - 1] = Tl(l[l.length - 1], o.length));
        let d = El(a, c);
        l.push(d), s = s.matchType(d.type), o = c;
      }
    }), l)
      return x.from(l);
  }
  return i;
}
function El(i, t, n = 0) {
  for (let r = t.length - 1; r >= n; r--)
    i = t[r].create(null, x.from(i));
  return i;
}
function Nl(i, t, n, r, s) {
  if (s < i.length && s < t.length && i[s] == t[s]) {
    let o = Nl(i, t, n, r.lastChild, s + 1);
    if (o)
      return r.copy(r.content.replaceChild(r.childCount - 1, o));
    if (r.contentMatchAt(r.childCount).matchType(s == i.length - 1 ? n.type : i[s + 1]))
      return r.copy(r.content.append(x.from(El(n, i, s + 1))));
  }
}
function Tl(i, t) {
  if (t == 0)
    return i;
  let n = i.content.replaceChild(i.childCount - 1, Tl(i.lastChild, t - 1)), r = i.contentMatchAt(i.childCount).fillBefore(x.empty, !0);
  return i.copy(n.append(r));
}
function Sr(i, t, n, r, s, o) {
  let l = t < 0 ? i.firstChild : i.lastChild, a = l.content;
  return i.childCount > 1 && (o = 0), s < r - 1 && (a = Sr(a, t, n, r, s + 1, o)), s >= n && (a = t < 0 ? l.contentMatchAt(0).fillBefore(a, o <= s).append(a) : a.append(l.contentMatchAt(l.childCount).fillBefore(x.empty, !0))), i.replaceChild(t < 0 ? 0 : i.childCount - 1, l.copy(a));
}
function Us(i, t, n) {
  return t < i.openStart && (i = new k(Sr(i.content, -1, t, i.openStart, 0, i.openEnd), t, i.openEnd)), n < i.openEnd && (i = new k(Sr(i.content, 1, n, i.openEnd, 0, 0), i.openStart, n)), i;
}
const Al = {
  thead: ["table"],
  tbody: ["table"],
  tfoot: ["table"],
  caption: ["table"],
  colgroup: ["table"],
  col: ["table", "colgroup"],
  tr: ["table", "tbody"],
  td: ["table", "tbody", "tr"],
  th: ["table", "tbody", "tr"]
};
let js = null;
function Ol() {
  return js || (js = document.implementation.createHTMLDocument("title"));
}
let Zi = null;
function gu(i) {
  let t = window.trustedTypes;
  return t ? (Zi || (Zi = t.defaultPolicy || t.createPolicy("ProseMirrorClipboard", { createHTML: (n) => n })), Zi.createHTML(i)) : i;
}
function yu(i) {
  let t = /^(\s*<meta [^>]*>)*/.exec(i);
  t && (i = i.slice(t[0].length));
  let n = Ol().createElement("div"), r = /<([a-z][^>\s]+)/i.exec(i), s;
  if ((s = r && Al[r[1].toLowerCase()]) && (i = s.map((o) => "<" + o + ">").join("") + i + s.map((o) => "</" + o + ">").reverse().join("")), n.innerHTML = gu(i), s)
    for (let o = 0; o < s.length; o++)
      n = n.querySelector(s[o]) || n;
  return n;
}
function bu(i) {
  let t = i.querySelectorAll(Z ? "span:not([class]):not([style])" : "span.Apple-converted-space");
  for (let n = 0; n < t.length; n++) {
    let r = t[n];
    r.childNodes.length == 1 && r.textContent == " " && r.parentNode && r.parentNode.replaceChild(i.ownerDocument.createTextNode(" "), r);
  }
}
function vu(i, t) {
  if (!i.size)
    return i;
  let n = i.content.firstChild.type.schema, r;
  try {
    r = JSON.parse(t);
  } catch {
    return i;
  }
  let { content: s, openStart: o, openEnd: l } = i;
  for (let a = r.length - 2; a >= 0; a -= 2) {
    let c = n.nodes[r[a]];
    if (!c || c.hasRequiredAttrs())
      break;
    s = x.from(c.create(r[a + 1], s)), o++, l++;
  }
  return new k(s, o, l);
}
const ae = {}, ce = {}, wu = { touchstart: !0, touchmove: !0 };
class xu {
  constructor() {
    this.shiftKey = !1, this.mouseDown = null, this.lastKeyCode = null, this.lastKeyCodeTime = 0, this.lastClick = { time: 0, x: 0, y: 0, type: "", button: 0 }, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastIOSEnter = 0, this.lastIOSEnterFallbackTimeout = -1, this.lastFocus = 0, this.lastTouch = 0, this.lastChromeDelete = 0, this.composing = !1, this.compositionNode = null, this.composingTimeout = -1, this.compositionNodes = [], this.compositionEndedAt = -2e8, this.compositionID = 1, this.badSafariComposition = !1, this.compositionPendingChanges = 0, this.domChangeCount = 0, this.eventHandlers = /* @__PURE__ */ Object.create(null), this.hideSelectionGuard = null;
  }
}
function ku(i) {
  for (let t in ae) {
    let n = ae[t];
    i.dom.addEventListener(t, i.input.eventHandlers[t] = (r) => {
      Cu(i, r) && !Hr(i, r) && (i.editable || !(r.type in ce)) && n(i, r);
    }, wu[t] ? { passive: !0 } : void 0);
  }
  ie && i.dom.addEventListener("input", () => null), Cr(i);
}
function dt(i, t) {
  i.input.lastSelectionOrigin = t, i.input.lastSelectionTime = Date.now();
}
function Su(i) {
  i.domObserver.stop();
  for (let t in i.input.eventHandlers)
    i.dom.removeEventListener(t, i.input.eventHandlers[t]);
  clearTimeout(i.input.composingTimeout), clearTimeout(i.input.lastIOSEnterFallbackTimeout);
}
function Cr(i) {
  i.someProp("handleDOMEvents", (t) => {
    for (let n in t)
      i.input.eventHandlers[n] || i.dom.addEventListener(n, i.input.eventHandlers[n] = (r) => Hr(i, r));
  });
}
function Hr(i, t) {
  return i.someProp("handleDOMEvents", (n) => {
    let r = n[t.type];
    return r ? r(i, t) || t.defaultPrevented : !1;
  });
}
function Cu(i, t) {
  if (!t.bubbles)
    return !0;
  if (t.defaultPrevented)
    return !1;
  for (let n = t.target; n != i.dom; n = n.parentNode)
    if (!n || n.nodeType == 11 || n.pmViewDesc && n.pmViewDesc.stopEvent(t))
      return !1;
  return !0;
}
function Mu(i, t) {
  !Hr(i, t) && ae[t.type] && (i.editable || !(t.type in ce)) && ae[t.type](i, t);
}
ce.keydown = (i, t) => {
  let n = t;
  if (i.input.shiftKey = n.keyCode == 16 || n.shiftKey, !Dl(i, n) && (i.input.lastKeyCode = n.keyCode, i.input.lastKeyCodeTime = Date.now(), !(Ke && Z && n.keyCode == 13)))
    if (n.keyCode != 229 && i.domObserver.forceFlush(), ln && n.keyCode == 13 && !n.ctrlKey && !n.altKey && !n.metaKey) {
      let r = Date.now();
      i.input.lastIOSEnter = r, i.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
        i.input.lastIOSEnter == r && (i.someProp("handleKeyDown", (s) => s(i, Nt(13, "Enter"))), i.input.lastIOSEnter = 0);
      }, 200);
    } else i.someProp("handleKeyDown", (r) => r(i, n)) || fu(i, n) ? n.preventDefault() : dt(i, "key");
};
ce.keyup = (i, t) => {
  t.keyCode == 16 && (i.input.shiftKey = !1);
};
ce.keypress = (i, t) => {
  let n = t;
  if (Dl(i, n) || !n.charCode || n.ctrlKey && !n.altKey || Ce && n.metaKey)
    return;
  if (i.someProp("handleKeyPress", (s) => s(i, n))) {
    n.preventDefault();
    return;
  }
  let r = i.state.selection;
  if (!(r instanceof L) || !r.$from.sameParent(r.$to)) {
    let s = String.fromCharCode(n.charCode), o = () => i.state.tr.insertText(s).scrollIntoView();
    !/[\r\n]/.test(s) && !i.someProp("handleTextInput", (l) => l(i, r.$from.pos, r.$to.pos, s, o)) && i.dispatch(o()), n.preventDefault();
  }
};
function Li(i) {
  return { left: i.clientX, top: i.clientY };
}
function Eu(i, t) {
  let n = t.x - i.clientX, r = t.y - i.clientY;
  return n * n + r * r < 100;
}
function $r(i, t, n, r, s) {
  if (r == -1)
    return !1;
  let o = i.state.doc.resolve(r);
  for (let l = o.depth + 1; l > 0; l--)
    if (i.someProp(t, (a) => l > o.depth ? a(i, n, o.nodeAfter, o.before(l), s, !0) : a(i, n, o.node(l), o.before(l), s, !1)))
      return !0;
  return !1;
}
function Qt(i, t, n) {
  if (i.focused || i.focus(), i.state.selection.eq(t))
    return;
  let r = i.state.tr.setSelection(t);
  r.setMeta("pointer", !0), i.dispatch(r);
}
function Nu(i, t) {
  if (t == -1)
    return !1;
  let n = i.state.doc.resolve(t), r = n.nodeAfter;
  return r && r.isAtom && A.isSelectable(r) ? (Qt(i, new A(n)), !0) : !1;
}
function Tu(i, t) {
  if (t == -1)
    return !1;
  let n = i.state.selection, r, s;
  n instanceof A && (r = n.node);
  let o = i.state.doc.resolve(t);
  for (let l = o.depth + 1; l > 0; l--) {
    let a = l > o.depth ? o.nodeAfter : o.node(l);
    if (A.isSelectable(a)) {
      r && n.$from.depth > 0 && l >= n.$from.depth && o.before(n.$from.depth + 1) == n.$from.pos ? s = o.before(n.$from.depth) : s = o.before(l);
      break;
    }
  }
  return s != null ? (Qt(i, A.create(i.state.doc, s)), !0) : !1;
}
function Au(i, t, n, r, s) {
  return $r(i, "handleClickOn", t, n, r) || i.someProp("handleClick", (o) => o(i, t, r)) || (s ? Tu(i, n) : Nu(i, n));
}
function Ou(i, t, n, r) {
  return $r(i, "handleDoubleClickOn", t, n, r) || i.someProp("handleDoubleClick", (s) => s(i, t, r));
}
function qu(i, t, n, r) {
  return $r(i, "handleTripleClickOn", t, n, r) || i.someProp("handleTripleClick", (s) => s(i, t, r)) || Du(i, n, r);
}
function Du(i, t, n) {
  if (n.button != 0)
    return !1;
  let r = i.state.doc;
  if (t == -1)
    return r.inlineContent ? (Qt(i, L.create(r, 0, r.content.size)), !0) : !1;
  let s = r.resolve(t);
  for (let o = s.depth + 1; o > 0; o--) {
    let l = o > s.depth ? s.nodeAfter : s.node(o), a = s.before(o);
    if (l.inlineContent)
      Qt(i, L.create(r, a + 1, a + 1 + l.content.size));
    else if (A.isSelectable(l))
      Qt(i, A.create(r, a));
    else
      continue;
    return !0;
  }
}
function Wr(i) {
  return xi(i);
}
const ql = Ce ? "metaKey" : "ctrlKey";
ae.mousedown = (i, t) => {
  let n = t;
  i.input.shiftKey = n.shiftKey;
  let r = Wr(i), s = Date.now(), o = "singleClick";
  s - i.input.lastClick.time < 500 && Eu(n, i.input.lastClick) && !n[ql] && i.input.lastClick.button == n.button && (i.input.lastClick.type == "singleClick" ? o = "doubleClick" : i.input.lastClick.type == "doubleClick" && (o = "tripleClick")), i.input.lastClick = { time: s, x: n.clientX, y: n.clientY, type: o, button: n.button };
  let l = i.posAtCoords(Li(n));
  l && (o == "singleClick" ? (i.input.mouseDown && i.input.mouseDown.done(), i.input.mouseDown = new zu(i, l, n, !!r)) : (o == "doubleClick" ? Ou : qu)(i, l.pos, l.inside, n) ? n.preventDefault() : dt(i, "pointer"));
};
class zu {
  constructor(t, n, r, s) {
    this.view = t, this.pos = n, this.event = r, this.flushed = s, this.delayedSelectionSync = !1, this.mightDrag = null, this.startDoc = t.state.doc, this.selectNode = !!r[ql], this.allowDefault = r.shiftKey;
    let o, l;
    if (n.inside > -1)
      o = t.state.doc.nodeAt(n.inside), l = n.inside;
    else {
      let d = t.state.doc.resolve(n.pos);
      o = d.parent, l = d.depth ? d.before() : 0;
    }
    const a = s ? null : r.target, c = a ? t.docView.nearestDesc(a, !0) : null;
    this.target = c && c.nodeDOM.nodeType == 1 ? c.nodeDOM : null;
    let { selection: u } = t.state;
    (r.button == 0 && o.type.spec.draggable && o.type.spec.selectable !== !1 || u instanceof A && u.from <= l && u.to > l) && (this.mightDrag = {
      node: o,
      pos: l,
      addAttr: !!(this.target && !this.target.draggable),
      setUneditable: !!(this.target && Ne && !this.target.hasAttribute("contentEditable"))
    }), this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable) && (this.view.domObserver.stop(), this.mightDrag.addAttr && (this.target.draggable = !0), this.mightDrag.setUneditable && setTimeout(() => {
      this.view.input.mouseDown == this && this.target.setAttribute("contentEditable", "false");
    }, 20), this.view.domObserver.start()), t.root.addEventListener("mouseup", this.up = this.up.bind(this)), t.root.addEventListener("mousemove", this.move = this.move.bind(this)), dt(t, "pointer");
  }
  done() {
    this.view.root.removeEventListener("mouseup", this.up), this.view.root.removeEventListener("mousemove", this.move), this.mightDrag && this.target && (this.view.domObserver.stop(), this.mightDrag.addAttr && this.target.removeAttribute("draggable"), this.mightDrag.setUneditable && this.target.removeAttribute("contentEditable"), this.view.domObserver.start()), this.delayedSelectionSync && setTimeout(() => Xe(this.view)), this.view.input.mouseDown = null;
  }
  up(t) {
    if (this.done(), !this.view.dom.contains(t.target))
      return;
    let n = this.pos;
    this.view.state.doc != this.startDoc && (n = this.view.posAtCoords(Li(t))), this.updateAllowDefault(t), this.allowDefault || !n ? dt(this.view, "pointer") : Au(this.view, n.pos, n.inside, t, this.selectNode) ? t.preventDefault() : t.button == 0 && (this.flushed || // Safari ignores clicks on draggable elements
    ie && this.mightDrag && !this.mightDrag.node.isAtom || // Chrome will sometimes treat a node selection as a
    // cursor, but still report that the node is selected
    // when asked through getSelection. You'll then get a
    // situation where clicking at the point where that
    // (hidden) cursor is doesn't change the selection, and
    // thus doesn't get a reaction from ProseMirror. This
    // works around that.
    Z && !this.view.state.selection.visible && Math.min(Math.abs(n.pos - this.view.state.selection.from), Math.abs(n.pos - this.view.state.selection.to)) <= 2) ? (Qt(this.view, q.near(this.view.state.doc.resolve(n.pos))), t.preventDefault()) : dt(this.view, "pointer");
  }
  move(t) {
    this.updateAllowDefault(t), dt(this.view, "pointer"), t.buttons == 0 && this.done();
  }
  updateAllowDefault(t) {
    !this.allowDefault && (Math.abs(this.event.x - t.clientX) > 4 || Math.abs(this.event.y - t.clientY) > 4) && (this.allowDefault = !0);
  }
}
ae.touchstart = (i) => {
  i.input.lastTouch = Date.now(), Wr(i), dt(i, "pointer");
};
ae.touchmove = (i) => {
  i.input.lastTouch = Date.now(), dt(i, "pointer");
};
ae.contextmenu = (i) => Wr(i);
function Dl(i, t) {
  return i.composing ? !0 : ie && Math.abs(t.timeStamp - i.input.compositionEndedAt) < 500 ? (i.input.compositionEndedAt = -2e8, !0) : !1;
}
const Ru = Ke ? 5e3 : -1;
ce.compositionstart = ce.compositionupdate = (i) => {
  if (!i.composing) {
    i.domObserver.flush();
    let { state: t } = i, n = t.selection.$to;
    if (t.selection instanceof L && (t.storedMarks || !n.textOffset && n.parentOffset && n.nodeBefore.marks.some((r) => r.type.spec.inclusive === !1) || Z && cl && Iu(i)))
      i.markCursor = i.state.storedMarks || n.marks(), xi(i, !0), i.markCursor = null;
    else if (xi(i, !t.selection.empty), Ne && t.selection.empty && n.parentOffset && !n.textOffset && n.nodeBefore.marks.length) {
      let r = i.domSelectionRange();
      for (let s = r.focusNode, o = r.focusOffset; s && s.nodeType == 1 && o != 0; ) {
        let l = o < 0 ? s.lastChild : s.childNodes[o - 1];
        if (!l)
          break;
        if (l.nodeType == 3) {
          let a = i.domSelection();
          a && a.collapse(l, l.nodeValue.length);
          break;
        } else
          s = l, o = -1;
      }
    }
    i.input.composing = !0;
  }
  zl(i, Ru);
};
function Iu(i) {
  let { focusNode: t, focusOffset: n } = i.domSelectionRange();
  if (!t || t.nodeType != 1 || n >= t.childNodes.length)
    return !1;
  let r = t.childNodes[n];
  return r.nodeType == 1 && r.contentEditable == "false";
}
ce.compositionend = (i, t) => {
  i.composing && (i.input.composing = !1, i.input.compositionEndedAt = t.timeStamp, i.input.compositionPendingChanges = i.domObserver.pendingRecords().length ? i.input.compositionID : 0, i.input.compositionNode = null, i.input.badSafariComposition ? i.domObserver.forceFlush() : i.input.compositionPendingChanges && Promise.resolve().then(() => i.domObserver.flush()), i.input.compositionID++, zl(i, 20));
};
function zl(i, t) {
  clearTimeout(i.input.composingTimeout), t > -1 && (i.input.composingTimeout = setTimeout(() => xi(i), t));
}
function Rl(i) {
  for (i.composing && (i.input.composing = !1, i.input.compositionEndedAt = Bu()); i.input.compositionNodes.length > 0; )
    i.input.compositionNodes.pop().markParentsDirty();
}
function Lu(i) {
  let t = i.domSelectionRange();
  if (!t.focusNode)
    return null;
  let n = Tc(t.focusNode, t.focusOffset), r = Ac(t.focusNode, t.focusOffset);
  if (n && r && n != r) {
    let s = r.pmViewDesc, o = i.domObserver.lastChangedTextNode;
    if (n == o || r == o)
      return o;
    if (!s || !s.isText(r.nodeValue))
      return r;
    if (i.input.compositionNode == r) {
      let l = n.pmViewDesc;
      if (!(!l || !l.isText(n.nodeValue)))
        return r;
    }
  }
  return n || r;
}
function Bu() {
  let i = document.createEvent("Event");
  return i.initEvent("event", !0, !0), i.timeStamp;
}
function xi(i, t = !1) {
  if (!(Ke && i.domObserver.flushingSoon >= 0)) {
    if (i.domObserver.forceFlush(), Rl(i), t || i.docView && i.docView.dirty) {
      let n = Pr(i), r = i.state.selection;
      return n && !n.eq(r) ? i.dispatch(i.state.tr.setSelection(n)) : (i.markCursor || t) && !r.$from.node(r.$from.sharedDepth(r.to)).inlineContent ? i.dispatch(i.state.tr.deleteSelection()) : i.updateState(i.state), !0;
    }
    return !1;
  }
}
function Pu(i, t) {
  if (!i.dom.parentNode)
    return;
  let n = i.dom.parentNode.appendChild(document.createElement("div"));
  n.appendChild(t), n.style.cssText = "position: fixed; left: -10000px; top: 10px";
  let r = getSelection(), s = document.createRange();
  s.selectNodeContents(t), i.dom.blur(), r.removeAllRanges(), r.addRange(s), setTimeout(() => {
    n.parentNode && n.parentNode.removeChild(n), i.focus();
  }, 50);
}
const In = me && pt < 15 || ln && zc < 604;
ae.copy = ce.cut = (i, t) => {
  let n = t, r = i.state.selection, s = n.type == "cut";
  if (r.empty)
    return;
  let o = In ? null : n.clipboardData, l = r.content(), { dom: a, text: c } = Vr(i, l);
  o ? (n.preventDefault(), o.clearData(), o.setData("text/html", a.innerHTML), o.setData("text/plain", c)) : Pu(i, a), s && i.dispatch(i.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function Fu(i) {
  return i.openStart == 0 && i.openEnd == 0 && i.content.childCount == 1 ? i.content.firstChild : null;
}
function Vu(i, t) {
  if (!i.dom.parentNode)
    return;
  let n = i.input.shiftKey || i.state.selection.$from.parent.type.spec.code, r = i.dom.parentNode.appendChild(document.createElement(n ? "textarea" : "div"));
  n || (r.contentEditable = "true"), r.style.cssText = "position: fixed; left: -10000px; top: 10px", r.focus();
  let s = i.input.shiftKey && i.input.lastKeyCode != 45;
  setTimeout(() => {
    i.focus(), r.parentNode && r.parentNode.removeChild(r), n ? Ln(i, r.value, null, s, t) : Ln(i, r.textContent, r.innerHTML, s, t);
  }, 50);
}
function Ln(i, t, n, r, s) {
  let o = Ml(i, t, n, r, i.state.selection.$from);
  if (i.someProp("handlePaste", (c) => c(i, s, o || k.empty)))
    return !0;
  if (!o)
    return !1;
  let l = Fu(o), a = l ? i.state.tr.replaceSelectionWith(l, r) : i.state.tr.replaceSelection(o);
  return i.dispatch(a.scrollIntoView().setMeta("paste", !0).setMeta("uiEvent", "paste")), !0;
}
function Il(i) {
  let t = i.getData("text/plain") || i.getData("Text");
  if (t)
    return t;
  let n = i.getData("text/uri-list");
  return n ? n.replace(/\r?\n/g, " ") : "";
}
ce.paste = (i, t) => {
  let n = t;
  if (i.composing && !Ke)
    return;
  let r = In ? null : n.clipboardData, s = i.input.shiftKey && i.input.lastKeyCode != 45;
  r && Ln(i, Il(r), r.getData("text/html"), s, n) ? n.preventDefault() : Vu(i, n);
};
class Ll {
  constructor(t, n, r) {
    this.slice = t, this.move = n, this.node = r;
  }
}
const Hu = Ce ? "altKey" : "ctrlKey";
function Bl(i, t) {
  let n = i.someProp("dragCopies", (r) => !r(t));
  return n ?? !t[Hu];
}
ae.dragstart = (i, t) => {
  let n = t, r = i.input.mouseDown;
  if (r && r.done(), !n.dataTransfer)
    return;
  let s = i.state.selection, o = s.empty ? null : i.posAtCoords(Li(n)), l;
  if (!(o && o.pos >= s.from && o.pos <= (s instanceof A ? s.to - 1 : s.to))) {
    if (r && r.mightDrag)
      l = A.create(i.state.doc, r.mightDrag.pos);
    else if (n.target && n.target.nodeType == 1) {
      let h = i.docView.nearestDesc(n.target, !0);
      h && h.node.type.spec.draggable && h != i.docView && (l = A.create(i.state.doc, h.posBefore));
    }
  }
  let a = (l || i.state.selection).content(), { dom: c, text: u, slice: d } = Vr(i, a);
  (!n.dataTransfer.files.length || !Z || al > 120) && n.dataTransfer.clearData(), n.dataTransfer.setData(In ? "Text" : "text/html", c.innerHTML), n.dataTransfer.effectAllowed = "copyMove", In || n.dataTransfer.setData("text/plain", u), i.dragging = new Ll(d, Bl(i, n), l);
};
ae.dragend = (i) => {
  let t = i.dragging;
  window.setTimeout(() => {
    i.dragging == t && (i.dragging = null);
  }, 50);
};
ce.dragover = ce.dragenter = (i, t) => t.preventDefault();
ce.drop = (i, t) => {
  try {
    $u(i, t, i.dragging);
  } finally {
    i.dragging = null;
  }
};
function $u(i, t, n) {
  if (!t.dataTransfer)
    return;
  let r = i.posAtCoords(Li(t));
  if (!r)
    return;
  let s = i.state.doc.resolve(r.pos), o = n && n.slice;
  o ? i.someProp("transformPasted", (p) => {
    o = p(o, i, !1);
  }) : o = Ml(i, Il(t.dataTransfer), In ? null : t.dataTransfer.getData("text/html"), !1, s);
  let l = !!(n && Bl(i, t));
  if (i.someProp("handleDrop", (p) => p(i, t, o || k.empty, l))) {
    t.preventDefault();
    return;
  }
  if (!o)
    return;
  t.preventDefault();
  let a = o ? gc(i.state.doc, s.pos, o) : s.pos;
  a == null && (a = s.pos);
  let c = i.state.tr;
  if (l) {
    let { node: p } = n;
    p ? p.replace(c) : c.deleteSelection();
  }
  let u = c.mapping.map(a), d = o.openStart == 0 && o.openEnd == 0 && o.content.childCount == 1, h = c.doc;
  if (d ? c.replaceRangeWith(u, u, o.content.firstChild) : c.replaceRange(u, u, o), c.doc.eq(h))
    return;
  let f = c.doc.resolve(u);
  if (d && A.isSelectable(o.content.firstChild) && f.nodeAfter && f.nodeAfter.sameMarkup(o.content.firstChild))
    c.setSelection(new A(f));
  else {
    let p = c.mapping.map(a);
    c.mapping.maps[c.mapping.maps.length - 1].forEach((m, y, b, w) => p = w), c.setSelection(Fr(i, f, c.doc.resolve(p)));
  }
  i.focus(), i.dispatch(c.setMeta("uiEvent", "drop"));
}
ae.focus = (i) => {
  i.input.lastFocus = Date.now(), i.focused || (i.domObserver.stop(), i.dom.classList.add("ProseMirror-focused"), i.domObserver.start(), i.focused = !0, setTimeout(() => {
    i.docView && i.hasFocus() && !i.domObserver.currentSelection.eq(i.domSelectionRange()) && Xe(i);
  }, 20));
};
ae.blur = (i, t) => {
  let n = t;
  i.focused && (i.domObserver.stop(), i.dom.classList.remove("ProseMirror-focused"), i.domObserver.start(), n.relatedTarget && i.dom.contains(n.relatedTarget) && i.domObserver.currentSelection.clear(), i.focused = !1);
};
ae.beforeinput = (i, t) => {
  if (Z && Ke && t.inputType == "deleteContentBackward") {
    i.domObserver.flushSoon();
    let { domChangeCount: r } = i.input;
    setTimeout(() => {
      if (i.input.domChangeCount != r || (i.dom.blur(), i.focus(), i.someProp("handleKeyDown", (o) => o(i, Nt(8, "Backspace")))))
        return;
      let { $cursor: s } = i.state.selection;
      s && s.pos > 0 && i.dispatch(i.state.tr.delete(s.pos - 1, s.pos).scrollIntoView());
    }, 50);
  }
};
for (let i in ce)
  ae[i] = ce[i];
function Bn(i, t) {
  if (i == t)
    return !0;
  for (let n in i)
    if (i[n] !== t[n])
      return !1;
  for (let n in t)
    if (!(n in i))
      return !1;
  return !0;
}
class ki {
  constructor(t, n) {
    this.toDOM = t, this.spec = n || Lt, this.side = this.spec.side || 0;
  }
  map(t, n, r, s) {
    let { pos: o, deleted: l } = t.mapResult(n.from + s, this.side < 0 ? -1 : 1);
    return l ? null : new le(o - r, o - r, this);
  }
  valid() {
    return !0;
  }
  eq(t) {
    return this == t || t instanceof ki && (this.spec.key && this.spec.key == t.spec.key || this.toDOM == t.toDOM && Bn(this.spec, t.spec));
  }
  destroy(t) {
    this.spec.destroy && this.spec.destroy(t);
  }
}
class gt {
  constructor(t, n) {
    this.attrs = t, this.spec = n || Lt;
  }
  map(t, n, r, s) {
    let o = t.map(n.from + s, this.spec.inclusiveStart ? -1 : 1) - r, l = t.map(n.to + s, this.spec.inclusiveEnd ? 1 : -1) - r;
    return o >= l ? null : new le(o, l, this);
  }
  valid(t, n) {
    return n.from < n.to;
  }
  eq(t) {
    return this == t || t instanceof gt && Bn(this.attrs, t.attrs) && Bn(this.spec, t.spec);
  }
  static is(t) {
    return t.type instanceof gt;
  }
  destroy() {
  }
}
class Ur {
  constructor(t, n) {
    this.attrs = t, this.spec = n || Lt;
  }
  map(t, n, r, s) {
    let o = t.mapResult(n.from + s, 1);
    if (o.deleted)
      return null;
    let l = t.mapResult(n.to + s, -1);
    return l.deleted || l.pos <= o.pos ? null : new le(o.pos - r, l.pos - r, this);
  }
  valid(t, n) {
    let { index: r, offset: s } = t.content.findIndex(n.from), o;
    return s == n.from && !(o = t.child(r)).isText && s + o.nodeSize == n.to;
  }
  eq(t) {
    return this == t || t instanceof Ur && Bn(this.attrs, t.attrs) && Bn(this.spec, t.spec);
  }
  destroy() {
  }
}
class le {
  /**
  @internal
  */
  constructor(t, n, r) {
    this.from = t, this.to = n, this.type = r;
  }
  /**
  @internal
  */
  copy(t, n) {
    return new le(t, n, this.type);
  }
  /**
  @internal
  */
  eq(t, n = 0) {
    return this.type.eq(t.type) && this.from + n == t.from && this.to + n == t.to;
  }
  /**
  @internal
  */
  map(t, n, r) {
    return this.type.map(t, this, n, r);
  }
  /**
  Creates a widget decoration, which is a DOM node that's shown in
  the document at the given position. It is recommended that you
  delay rendering the widget by passing a function that will be
  called when the widget is actually drawn in a view, but you can
  also directly pass a DOM node. `getPos` can be used to find the
  widget's current document position.
  */
  static widget(t, n, r) {
    return new le(t, t, new ki(n, r));
  }
  /**
  Creates an inline decoration, which adds the given attributes to
  each inline node between `from` and `to`.
  */
  static inline(t, n, r, s) {
    return new le(t, n, new gt(r, s));
  }
  /**
  Creates a node decoration. `from` and `to` should point precisely
  before and after a node in the document. That node, and only that
  node, will receive the given attributes.
  */
  static node(t, n, r, s) {
    return new le(t, n, new Ur(r, s));
  }
  /**
  The spec provided when creating this decoration. Can be useful
  if you've stored extra information in that object.
  */
  get spec() {
    return this.type.spec;
  }
  /**
  @internal
  */
  get inline() {
    return this.type instanceof gt;
  }
  /**
  @internal
  */
  get widget() {
    return this.type instanceof ki;
  }
}
const Gt = [], Lt = {};
class H {
  /**
  @internal
  */
  constructor(t, n) {
    this.local = t.length ? t : Gt, this.children = n.length ? n : Gt;
  }
  /**
  Create a set of decorations, using the structure of the given
  document. This will consume (modify) the `decorations` array, so
  you must make a copy if you want need to preserve that.
  */
  static create(t, n) {
    return n.length ? Si(n, t, 0, Lt) : ee;
  }
  /**
  Find all decorations in this set which touch the given range
  (including decorations that start or end directly at the
  boundaries) and match the given predicate on their spec. When
  `start` and `end` are omitted, all decorations in the set are
  considered. When `predicate` isn't given, all decorations are
  assumed to match.
  */
  find(t, n, r) {
    let s = [];
    return this.findInner(t ?? 0, n ?? 1e9, s, 0, r), s;
  }
  findInner(t, n, r, s, o) {
    for (let l = 0; l < this.local.length; l++) {
      let a = this.local[l];
      a.from <= n && a.to >= t && (!o || o(a.spec)) && r.push(a.copy(a.from + s, a.to + s));
    }
    for (let l = 0; l < this.children.length; l += 3)
      if (this.children[l] < n && this.children[l + 1] > t) {
        let a = this.children[l] + 1;
        this.children[l + 2].findInner(t - a, n - a, r, s + a, o);
      }
  }
  /**
  Map the set of decorations in response to a change in the
  document.
  */
  map(t, n, r) {
    return this == ee || t.maps.length == 0 ? this : this.mapInner(t, n, 0, 0, r || Lt);
  }
  /**
  @internal
  */
  mapInner(t, n, r, s, o) {
    let l;
    for (let a = 0; a < this.local.length; a++) {
      let c = this.local[a].map(t, r, s);
      c && c.type.valid(n, c) ? (l || (l = [])).push(c) : o.onRemove && o.onRemove(this.local[a].spec);
    }
    return this.children.length ? Wu(this.children, l || [], t, n, r, s, o) : l ? new H(l.sort(Bt), Gt) : ee;
  }
  /**
  Add the given array of decorations to the ones in the set,
  producing a new set. Consumes the `decorations` array. Needs
  access to the current document to create the appropriate tree
  structure.
  */
  add(t, n) {
    return n.length ? this == ee ? H.create(t, n) : this.addInner(t, n, 0) : this;
  }
  addInner(t, n, r) {
    let s, o = 0;
    t.forEach((a, c) => {
      let u = c + r, d;
      if (d = Fl(n, a, u)) {
        for (s || (s = this.children.slice()); o < s.length && s[o] < c; )
          o += 3;
        s[o] == c ? s[o + 2] = s[o + 2].addInner(a, d, u + 1) : s.splice(o, 0, c, c + a.nodeSize, Si(d, a, u + 1, Lt)), o += 3;
      }
    });
    let l = Pl(o ? Vl(n) : n, -r);
    for (let a = 0; a < l.length; a++)
      l[a].type.valid(t, l[a]) || l.splice(a--, 1);
    return new H(l.length ? this.local.concat(l).sort(Bt) : this.local, s || this.children);
  }
  /**
  Create a new set that contains the decorations in this set, minus
  the ones in the given array.
  */
  remove(t) {
    return t.length == 0 || this == ee ? this : this.removeInner(t, 0);
  }
  removeInner(t, n) {
    let r = this.children, s = this.local;
    for (let o = 0; o < r.length; o += 3) {
      let l, a = r[o] + n, c = r[o + 1] + n;
      for (let d = 0, h; d < t.length; d++)
        (h = t[d]) && h.from > a && h.to < c && (t[d] = null, (l || (l = [])).push(h));
      if (!l)
        continue;
      r == this.children && (r = this.children.slice());
      let u = r[o + 2].removeInner(l, a + 1);
      u != ee ? r[o + 2] = u : (r.splice(o, 3), o -= 3);
    }
    if (s.length) {
      for (let o = 0, l; o < t.length; o++)
        if (l = t[o])
          for (let a = 0; a < s.length; a++)
            s[a].eq(l, n) && (s == this.local && (s = this.local.slice()), s.splice(a--, 1));
    }
    return r == this.children && s == this.local ? this : s.length || r.length ? new H(s, r) : ee;
  }
  forChild(t, n) {
    if (this == ee)
      return this;
    if (n.isLeaf)
      return H.empty;
    let r, s;
    for (let a = 0; a < this.children.length; a += 3)
      if (this.children[a] >= t) {
        this.children[a] == t && (r = this.children[a + 2]);
        break;
      }
    let o = t + 1, l = o + n.content.size;
    for (let a = 0; a < this.local.length; a++) {
      let c = this.local[a];
      if (c.from < l && c.to > o && c.type instanceof gt) {
        let u = Math.max(o, c.from) - o, d = Math.min(l, c.to) - o;
        u < d && (s || (s = [])).push(c.copy(u, d));
      }
    }
    if (s) {
      let a = new H(s.sort(Bt), Gt);
      return r ? new ot([a, r]) : a;
    }
    return r || ee;
  }
  /**
  @internal
  */
  eq(t) {
    if (this == t)
      return !0;
    if (!(t instanceof H) || this.local.length != t.local.length || this.children.length != t.children.length)
      return !1;
    for (let n = 0; n < this.local.length; n++)
      if (!this.local[n].eq(t.local[n]))
        return !1;
    for (let n = 0; n < this.children.length; n += 3)
      if (this.children[n] != t.children[n] || this.children[n + 1] != t.children[n + 1] || !this.children[n + 2].eq(t.children[n + 2]))
        return !1;
    return !0;
  }
  /**
  @internal
  */
  locals(t) {
    return jr(this.localsInner(t));
  }
  /**
  @internal
  */
  localsInner(t) {
    if (this == ee)
      return Gt;
    if (t.inlineContent || !this.local.some(gt.is))
      return this.local;
    let n = [];
    for (let r = 0; r < this.local.length; r++)
      this.local[r].type instanceof gt || n.push(this.local[r]);
    return n;
  }
  forEachSet(t) {
    t(this);
  }
}
H.empty = new H([], []);
H.removeOverlap = jr;
const ee = H.empty;
class ot {
  constructor(t) {
    this.members = t;
  }
  map(t, n) {
    const r = this.members.map((s) => s.map(t, n, Lt));
    return ot.from(r);
  }
  forChild(t, n) {
    if (n.isLeaf)
      return H.empty;
    let r = [];
    for (let s = 0; s < this.members.length; s++) {
      let o = this.members[s].forChild(t, n);
      o != ee && (o instanceof ot ? r = r.concat(o.members) : r.push(o));
    }
    return ot.from(r);
  }
  eq(t) {
    if (!(t instanceof ot) || t.members.length != this.members.length)
      return !1;
    for (let n = 0; n < this.members.length; n++)
      if (!this.members[n].eq(t.members[n]))
        return !1;
    return !0;
  }
  locals(t) {
    let n, r = !0;
    for (let s = 0; s < this.members.length; s++) {
      let o = this.members[s].localsInner(t);
      if (o.length)
        if (!n)
          n = o;
        else {
          r && (n = n.slice(), r = !1);
          for (let l = 0; l < o.length; l++)
            n.push(o[l]);
        }
    }
    return n ? jr(r ? n : n.sort(Bt)) : Gt;
  }
  // Create a group for the given array of decoration sets, or return
  // a single set when possible.
  static from(t) {
    switch (t.length) {
      case 0:
        return ee;
      case 1:
        return t[0];
      default:
        return new ot(t.every((n) => n instanceof H) ? t : t.reduce((n, r) => n.concat(r instanceof H ? r : r.members), []));
    }
  }
  forEachSet(t) {
    for (let n = 0; n < this.members.length; n++)
      this.members[n].forEachSet(t);
  }
}
function Wu(i, t, n, r, s, o, l) {
  let a = i.slice();
  for (let u = 0, d = o; u < n.maps.length; u++) {
    let h = 0;
    n.maps[u].forEach((f, p, m, y) => {
      let b = y - m - (p - f);
      for (let w = 0; w < a.length; w += 3) {
        let D = a[w + 1];
        if (D < 0 || f > D + d - h)
          continue;
        let B = a[w] + d - h;
        p >= B ? a[w + 1] = f <= B ? -2 : -1 : f >= d && b && (a[w] += b, a[w + 1] += b);
      }
      h += b;
    }), d = n.maps[u].map(d, -1);
  }
  let c = !1;
  for (let u = 0; u < a.length; u += 3)
    if (a[u + 1] < 0) {
      if (a[u + 1] == -2) {
        c = !0, a[u + 1] = -1;
        continue;
      }
      let d = n.map(i[u] + o), h = d - s;
      if (h < 0 || h >= r.content.size) {
        c = !0;
        continue;
      }
      let f = n.map(i[u + 1] + o, -1), p = f - s, { index: m, offset: y } = r.content.findIndex(h), b = r.maybeChild(m);
      if (b && y == h && y + b.nodeSize == p) {
        let w = a[u + 2].mapInner(n, b, d + 1, i[u] + o + 1, l);
        w != ee ? (a[u] = h, a[u + 1] = p, a[u + 2] = w) : (a[u + 1] = -2, c = !0);
      } else
        c = !0;
    }
  if (c) {
    let u = Uu(a, i, t, n, s, o, l), d = Si(u, r, 0, l);
    t = d.local;
    for (let h = 0; h < a.length; h += 3)
      a[h + 1] < 0 && (a.splice(h, 3), h -= 3);
    for (let h = 0, f = 0; h < d.children.length; h += 3) {
      let p = d.children[h];
      for (; f < a.length && a[f] < p; )
        f += 3;
      a.splice(f, 0, d.children[h], d.children[h + 1], d.children[h + 2]);
    }
  }
  return new H(t.sort(Bt), a);
}
function Pl(i, t) {
  if (!t || !i.length)
    return i;
  let n = [];
  for (let r = 0; r < i.length; r++) {
    let s = i[r];
    n.push(new le(s.from + t, s.to + t, s.type));
  }
  return n;
}
function Uu(i, t, n, r, s, o, l) {
  function a(c, u) {
    for (let d = 0; d < c.local.length; d++) {
      let h = c.local[d].map(r, s, u);
      h ? n.push(h) : l.onRemove && l.onRemove(c.local[d].spec);
    }
    for (let d = 0; d < c.children.length; d += 3)
      a(c.children[d + 2], c.children[d] + u + 1);
  }
  for (let c = 0; c < i.length; c += 3)
    i[c + 1] == -1 && a(i[c + 2], t[c] + o + 1);
  return n;
}
function Fl(i, t, n) {
  if (t.isLeaf)
    return null;
  let r = n + t.nodeSize, s = null;
  for (let o = 0, l; o < i.length; o++)
    (l = i[o]) && l.from > n && l.to < r && ((s || (s = [])).push(l), i[o] = null);
  return s;
}
function Vl(i) {
  let t = [];
  for (let n = 0; n < i.length; n++)
    i[n] != null && t.push(i[n]);
  return t;
}
function Si(i, t, n, r) {
  let s = [], o = !1;
  t.forEach((a, c) => {
    let u = Fl(i, a, c + n);
    if (u) {
      o = !0;
      let d = Si(u, a, n + c + 1, r);
      d != ee && s.push(c, c + a.nodeSize, d);
    }
  });
  let l = Pl(o ? Vl(i) : i, -n).sort(Bt);
  for (let a = 0; a < l.length; a++)
    l[a].type.valid(t, l[a]) || (r.onRemove && r.onRemove(l[a].spec), l.splice(a--, 1));
  return l.length || s.length ? new H(l, s) : ee;
}
function Bt(i, t) {
  return i.from - t.from || i.to - t.to;
}
function jr(i) {
  let t = i;
  for (let n = 0; n < t.length - 1; n++) {
    let r = t[n];
    if (r.from != r.to)
      for (let s = n + 1; s < t.length; s++) {
        let o = t[s];
        if (o.from == r.from) {
          o.to != r.to && (t == i && (t = i.slice()), t[s] = o.copy(o.from, r.to), _s(t, s + 1, o.copy(r.to, o.to)));
          continue;
        } else {
          o.from < r.to && (t == i && (t = i.slice()), t[n] = r.copy(r.from, o.from), _s(t, s, r.copy(o.from, r.to)));
          break;
        }
      }
  }
  return t;
}
function _s(i, t, n) {
  for (; t < i.length && Bt(n, i[t]) > 0; )
    t++;
  i.splice(t, 0, n);
}
function Qi(i) {
  let t = [];
  return i.someProp("decorations", (n) => {
    let r = n(i.state);
    r && r != ee && t.push(r);
  }), i.cursorWrapper && t.push(H.create(i.state.doc, [i.cursorWrapper.deco])), ot.from(t);
}
const ju = {
  childList: !0,
  characterData: !0,
  characterDataOldValue: !0,
  attributes: !0,
  attributeOldValue: !0,
  subtree: !0
}, _u = me && pt <= 11;
class Ku {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  set(t) {
    this.anchorNode = t.anchorNode, this.anchorOffset = t.anchorOffset, this.focusNode = t.focusNode, this.focusOffset = t.focusOffset;
  }
  clear() {
    this.anchorNode = this.focusNode = null;
  }
  eq(t) {
    return t.anchorNode == this.anchorNode && t.anchorOffset == this.anchorOffset && t.focusNode == this.focusNode && t.focusOffset == this.focusOffset;
  }
}
class Ju {
  constructor(t, n) {
    this.view = t, this.handleDOMChange = n, this.queue = [], this.flushingSoon = -1, this.observer = null, this.currentSelection = new Ku(), this.onCharData = null, this.suppressingSelectionUpdates = !1, this.lastChangedTextNode = null, this.observer = window.MutationObserver && new window.MutationObserver((r) => {
      for (let s = 0; s < r.length; s++)
        this.queue.push(r[s]);
      me && pt <= 11 && r.some((s) => s.type == "childList" && s.removedNodes.length || s.type == "characterData" && s.oldValue.length > s.target.nodeValue.length) ? this.flushSoon() : ie && t.composing && r.some((s) => s.type == "childList" && s.target.nodeName == "TR") ? (t.input.badSafariComposition = !0, this.flushSoon()) : this.flush();
    }), _u && (this.onCharData = (r) => {
      this.queue.push({ target: r.target, type: "characterData", oldValue: r.prevValue }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this);
  }
  flushSoon() {
    this.flushingSoon < 0 && (this.flushingSoon = window.setTimeout(() => {
      this.flushingSoon = -1, this.flush();
    }, 20));
  }
  forceFlush() {
    this.flushingSoon > -1 && (window.clearTimeout(this.flushingSoon), this.flushingSoon = -1, this.flush());
  }
  start() {
    this.observer && (this.observer.takeRecords(), this.observer.observe(this.view.dom, ju)), this.onCharData && this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.connectSelection();
  }
  stop() {
    if (this.observer) {
      let t = this.observer.takeRecords();
      if (t.length) {
        for (let n = 0; n < t.length; n++)
          this.queue.push(t[n]);
        window.setTimeout(() => this.flush(), 20);
      }
      this.observer.disconnect();
    }
    this.onCharData && this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData), this.disconnectSelection();
  }
  connectSelection() {
    this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
  }
  disconnectSelection() {
    this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
  }
  suppressSelectionUpdates() {
    this.suppressingSelectionUpdates = !0, setTimeout(() => this.suppressingSelectionUpdates = !1, 50);
  }
  onSelectionChange() {
    if (Ps(this.view)) {
      if (this.suppressingSelectionUpdates)
        return Xe(this.view);
      if (me && pt <= 11 && !this.view.state.selection.empty) {
        let t = this.view.domSelectionRange();
        if (t.focusNode && Vt(t.focusNode, t.focusOffset, t.anchorNode, t.anchorOffset))
          return this.flushSoon();
      }
      this.flush();
    }
  }
  setCurSelection() {
    this.currentSelection.set(this.view.domSelectionRange());
  }
  ignoreSelectionChange(t) {
    if (!t.focusNode)
      return !0;
    let n = /* @__PURE__ */ new Set(), r;
    for (let o = t.focusNode; o; o = on(o))
      n.add(o);
    for (let o = t.anchorNode; o; o = on(o))
      if (n.has(o)) {
        r = o;
        break;
      }
    let s = r && this.view.docView.nearestDesc(r);
    if (s && s.ignoreMutation({
      type: "selection",
      target: r.nodeType == 3 ? r.parentNode : r
    }))
      return this.setCurSelection(), !0;
  }
  pendingRecords() {
    if (this.observer)
      for (let t of this.observer.takeRecords())
        this.queue.push(t);
    return this.queue;
  }
  flush() {
    let { view: t } = this;
    if (!t.docView || this.flushingSoon > -1)
      return;
    let n = this.pendingRecords();
    n.length && (this.queue = []);
    let r = t.domSelectionRange(), s = !this.suppressingSelectionUpdates && !this.currentSelection.eq(r) && Ps(t) && !this.ignoreSelectionChange(r), o = -1, l = -1, a = !1, c = [];
    if (t.editable)
      for (let d = 0; d < n.length; d++) {
        let h = this.registerMutation(n[d], c);
        h && (o = o < 0 ? h.from : Math.min(h.from, o), l = l < 0 ? h.to : Math.max(h.to, l), h.typeOver && (a = !0));
      }
    if (c.some((d) => d.nodeName == "BR") && (t.input.lastKeyCode == 8 || t.input.lastKeyCode == 46)) {
      for (let d of c)
        if (d.nodeName == "BR" && d.parentNode) {
          let h = d.nextSibling;
          h && h.nodeType == 1 && h.contentEditable == "false" && d.parentNode.removeChild(d);
        }
    } else if (Ne && c.length) {
      let d = c.filter((h) => h.nodeName == "BR");
      if (d.length == 2) {
        let [h, f] = d;
        h.parentNode && h.parentNode.parentNode == f.parentNode ? f.remove() : h.remove();
      } else {
        let { focusNode: h } = this.currentSelection;
        for (let f of d) {
          let p = f.parentNode;
          p && p.nodeName == "LI" && (!h || Gu(t, h) != p) && f.remove();
        }
      }
    }
    let u = null;
    o < 0 && s && t.input.lastFocus > Date.now() - 200 && Math.max(t.input.lastTouch, t.input.lastClick.time) < Date.now() - 300 && Ri(r) && (u = Pr(t)) && u.eq(q.near(t.state.doc.resolve(0), 1)) ? (t.input.lastFocus = 0, Xe(t), this.currentSelection.set(r), t.scrollToSelection()) : (o > -1 || s) && (o > -1 && (t.docView.markDirty(o, l), Xu(t)), t.input.badSafariComposition && (t.input.badSafariComposition = !1, Zu(t, c)), this.handleDOMChange(o, l, a, c), t.docView && t.docView.dirty ? t.updateState(t.state) : this.currentSelection.eq(r) || Xe(t), this.currentSelection.set(r));
  }
  registerMutation(t, n) {
    if (n.indexOf(t.target) > -1)
      return null;
    let r = this.view.docView.nearestDesc(t.target);
    if (t.type == "attributes" && (r == this.view.docView || t.attributeName == "contenteditable" || // Firefox sometimes fires spurious events for null/empty styles
    t.attributeName == "style" && !t.oldValue && !t.target.getAttribute("style")) || !r || r.ignoreMutation(t))
      return null;
    if (t.type == "childList") {
      for (let d = 0; d < t.addedNodes.length; d++) {
        let h = t.addedNodes[d];
        n.push(h), h.nodeType == 3 && (this.lastChangedTextNode = h);
      }
      if (r.contentDOM && r.contentDOM != r.dom && !r.contentDOM.contains(t.target))
        return { from: r.posBefore, to: r.posAfter };
      let s = t.previousSibling, o = t.nextSibling;
      if (me && pt <= 11 && t.addedNodes.length)
        for (let d = 0; d < t.addedNodes.length; d++) {
          let { previousSibling: h, nextSibling: f } = t.addedNodes[d];
          (!h || Array.prototype.indexOf.call(t.addedNodes, h) < 0) && (s = h), (!f || Array.prototype.indexOf.call(t.addedNodes, f) < 0) && (o = f);
        }
      let l = s && s.parentNode == t.target ? Y(s) + 1 : 0, a = r.localPosFromDOM(t.target, l, -1), c = o && o.parentNode == t.target ? Y(o) : t.target.childNodes.length, u = r.localPosFromDOM(t.target, c, 1);
      return { from: a, to: u };
    } else return t.type == "attributes" ? { from: r.posAtStart - r.border, to: r.posAtEnd + r.border } : (this.lastChangedTextNode = t.target, {
      from: r.posAtStart,
      to: r.posAtEnd,
      // An event was generated for a text change that didn't change
      // any text. Mark the dom change to fall back to assuming the
      // selection was typed over with an identical value if it can't
      // find another change.
      typeOver: t.target.nodeValue == t.oldValue
    });
  }
}
let Ks = /* @__PURE__ */ new WeakMap(), Js = !1;
function Xu(i) {
  if (!Ks.has(i) && (Ks.set(i, null), ["normal", "nowrap", "pre-line"].indexOf(getComputedStyle(i.dom).whiteSpace) !== -1)) {
    if (i.requiresGeckoHackNode = Ne, Js)
      return;
    console.warn("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package."), Js = !0;
  }
}
function Xs(i, t) {
  let n = t.startContainer, r = t.startOffset, s = t.endContainer, o = t.endOffset, l = i.domAtPos(i.state.selection.anchor);
  return Vt(l.node, l.offset, s, o) && ([n, r, s, o] = [s, o, n, r]), { anchorNode: n, anchorOffset: r, focusNode: s, focusOffset: o };
}
function Yu(i, t) {
  if (t.getComposedRanges) {
    let s = t.getComposedRanges(i.root)[0];
    if (s)
      return Xs(i, s);
  }
  let n;
  function r(s) {
    s.preventDefault(), s.stopImmediatePropagation(), n = s.getTargetRanges()[0];
  }
  return i.dom.addEventListener("beforeinput", r, !0), document.execCommand("indent"), i.dom.removeEventListener("beforeinput", r, !0), n ? Xs(i, n) : null;
}
function Gu(i, t) {
  for (let n = t.parentNode; n && n != i.dom; n = n.parentNode) {
    let r = i.docView.nearestDesc(n, !0);
    if (r && r.node.isBlock)
      return n;
  }
  return null;
}
function Zu(i, t) {
  var n;
  let { focusNode: r, focusOffset: s } = i.domSelectionRange();
  for (let o of t)
    if (((n = o.parentNode) === null || n === void 0 ? void 0 : n.nodeName) == "TR") {
      let l = o.nextSibling;
      for (; l && l.nodeName != "TD" && l.nodeName != "TH"; )
        l = l.nextSibling;
      if (l) {
        let a = l;
        for (; ; ) {
          let c = a.firstChild;
          if (!c || c.nodeType != 1 || c.contentEditable == "false" || /^(BR|IMG)$/.test(c.nodeName))
            break;
          a = c;
        }
        a.insertBefore(o, a.firstChild), r == o && i.domSelection().collapse(o, s);
      } else
        o.parentNode.removeChild(o);
    }
}
function Qu(i, t, n) {
  let { node: r, fromOffset: s, toOffset: o, from: l, to: a } = i.docView.parseRange(t, n), c = i.domSelectionRange(), u, d = c.anchorNode;
  if (d && i.dom.contains(d.nodeType == 1 ? d : d.parentNode) && (u = [{ node: d, offset: c.anchorOffset }], Ri(c) || u.push({ node: c.focusNode, offset: c.focusOffset })), Z && i.input.lastKeyCode === 8)
    for (let b = o; b > s; b--) {
      let w = r.childNodes[b - 1], D = w.pmViewDesc;
      if (w.nodeName == "BR" && !D) {
        o = b;
        break;
      }
      if (!D || D.size)
        break;
    }
  let h = i.state.doc, f = i.someProp("domParser") || Wt.fromSchema(i.state.schema), p = h.resolve(l), m = null, y = f.parse(r, {
    topNode: p.parent,
    topMatch: p.parent.contentMatchAt(p.index()),
    topOpen: !0,
    from: s,
    to: o,
    preserveWhitespace: p.parent.type.whitespace == "pre" ? "full" : !0,
    findPositions: u,
    ruleFromNode: ed,
    context: p
  });
  if (u && u[0].pos != null) {
    let b = u[0].pos, w = u[1] && u[1].pos;
    w == null && (w = b), m = { anchor: b + l, head: w + l };
  }
  return { doc: y, sel: m, from: l, to: a };
}
function ed(i) {
  let t = i.pmViewDesc;
  if (t)
    return t.parseRule();
  if (i.nodeName == "BR" && i.parentNode) {
    if (ie && /^(ul|ol)$/i.test(i.parentNode.nodeName)) {
      let n = document.createElement("div");
      return n.appendChild(document.createElement("li")), { skip: n };
    } else if (i.parentNode.lastChild == i || ie && /^(tr|table)$/i.test(i.parentNode.nodeName))
      return { ignore: !0 };
  } else if (i.nodeName == "IMG" && i.getAttribute("mark-placeholder"))
    return { ignore: !0 };
  return null;
}
const td = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function nd(i, t, n, r, s) {
  let o = i.input.compositionPendingChanges || (i.composing ? i.input.compositionID : 0);
  if (i.input.compositionPendingChanges = 0, t < 0) {
    let g = i.input.lastSelectionTime > Date.now() - 50 ? i.input.lastSelectionOrigin : null, S = Pr(i, g);
    if (S && !i.state.selection.eq(S)) {
      if (Z && Ke && i.input.lastKeyCode === 13 && Date.now() - 100 < i.input.lastKeyCodeTime && i.someProp("handleKeyDown", (he) => he(i, Nt(13, "Enter"))))
        return;
      let E = i.state.tr.setSelection(S);
      g == "pointer" ? E.setMeta("pointer", !0) : g == "key" && E.scrollIntoView(), o && E.setMeta("composition", o), i.dispatch(E);
    }
    return;
  }
  let l = i.state.doc.resolve(t), a = l.sharedDepth(n);
  t = l.before(a + 1), n = i.state.doc.resolve(n).after(a + 1);
  let c = i.state.selection, u = Qu(i, t, n), d = i.state.doc, h = d.slice(u.from, u.to), f, p;
  i.input.lastKeyCode === 8 && Date.now() - 100 < i.input.lastKeyCodeTime ? (f = i.state.selection.to, p = "end") : (f = i.state.selection.from, p = "start"), i.input.lastKeyCode = null;
  let m = sd(h.content, u.doc.content, u.from, f, p);
  if (m && i.input.domChangeCount++, (ln && i.input.lastIOSEnter > Date.now() - 225 || Ke) && s.some((g) => g.nodeType == 1 && !td.test(g.nodeName)) && (!m || m.endA >= m.endB) && i.someProp("handleKeyDown", (g) => g(i, Nt(13, "Enter")))) {
    i.input.lastIOSEnter = 0;
    return;
  }
  if (!m)
    if (r && c instanceof L && !c.empty && c.$head.sameParent(c.$anchor) && !i.composing && !(u.sel && u.sel.anchor != u.sel.head))
      m = { start: c.from, endA: c.to, endB: c.to };
    else {
      if (u.sel) {
        let g = Ys(i, i.state.doc, u.sel);
        if (g && !g.eq(i.state.selection)) {
          let S = i.state.tr.setSelection(g);
          o && S.setMeta("composition", o), i.dispatch(S);
        }
      }
      return;
    }
  i.state.selection.from < i.state.selection.to && m.start == m.endB && i.state.selection instanceof L && (m.start > i.state.selection.from && m.start <= i.state.selection.from + 2 && i.state.selection.from >= u.from ? m.start = i.state.selection.from : m.endA < i.state.selection.to && m.endA >= i.state.selection.to - 2 && i.state.selection.to <= u.to && (m.endB += i.state.selection.to - m.endA, m.endA = i.state.selection.to)), me && pt <= 11 && m.endB == m.start + 1 && m.endA == m.start && m.start > u.from && u.doc.textBetween(m.start - u.from - 1, m.start - u.from + 1) == "  " && (m.start--, m.endA--, m.endB--);
  let y = u.doc.resolveNoCache(m.start - u.from), b = u.doc.resolveNoCache(m.endB - u.from), w = d.resolve(m.start), D = y.sameParent(b) && y.parent.inlineContent && w.end() >= m.endA;
  if ((ln && i.input.lastIOSEnter > Date.now() - 225 && (!D || s.some((g) => g.nodeName == "DIV" || g.nodeName == "P")) || !D && y.pos < u.doc.content.size && (!y.sameParent(b) || !y.parent.inlineContent) && y.pos < b.pos && !/\S/.test(u.doc.textBetween(y.pos, b.pos, "", ""))) && i.someProp("handleKeyDown", (g) => g(i, Nt(13, "Enter")))) {
    i.input.lastIOSEnter = 0;
    return;
  }
  if (i.state.selection.anchor > m.start && rd(d, m.start, m.endA, y, b) && i.someProp("handleKeyDown", (g) => g(i, Nt(8, "Backspace")))) {
    Ke && Z && i.domObserver.suppressSelectionUpdates();
    return;
  }
  Z && m.endB == m.start && (i.input.lastChromeDelete = Date.now()), Ke && !D && y.start() != b.start() && b.parentOffset == 0 && y.depth == b.depth && u.sel && u.sel.anchor == u.sel.head && u.sel.head == m.endA && (m.endB -= 2, b = u.doc.resolveNoCache(m.endB - u.from), setTimeout(() => {
    i.someProp("handleKeyDown", function(g) {
      return g(i, Nt(13, "Enter"));
    });
  }, 20));
  let B = m.start, ge = m.endA, J = (g) => {
    let S = g || i.state.tr.replace(B, ge, u.doc.slice(m.start - u.from, m.endB - u.from));
    if (u.sel) {
      let E = Ys(i, S.doc, u.sel);
      E && !(Z && i.composing && E.empty && (m.start != m.endB || i.input.lastChromeDelete < Date.now() - 100) && (E.head == B || E.head == S.mapping.map(ge) - 1) || me && E.empty && E.head == B) && S.setSelection(E);
    }
    return o && S.setMeta("composition", o), S.scrollIntoView();
  }, Se;
  if (D)
    if (y.pos == b.pos) {
      me && pt <= 11 && y.parentOffset == 0 && (i.domObserver.suppressSelectionUpdates(), setTimeout(() => Xe(i), 20));
      let g = J(i.state.tr.delete(B, ge)), S = d.resolve(m.start).marksAcross(d.resolve(m.endA));
      S && g.ensureMarks(S), i.dispatch(g);
    } else if (
      // Adding or removing a mark
      m.endA == m.endB && (Se = id(y.parent.content.cut(y.parentOffset, b.parentOffset), w.parent.content.cut(w.parentOffset, m.endA - w.start())))
    ) {
      let g = J(i.state.tr);
      Se.type == "add" ? g.addMark(B, ge, Se.mark) : g.removeMark(B, ge, Se.mark), i.dispatch(g);
    } else if (y.parent.child(y.index()).isText && y.index() == b.index() - (b.textOffset ? 0 : 1)) {
      let g = y.parent.textBetween(y.parentOffset, b.parentOffset), S = () => J(i.state.tr.insertText(g, B, ge));
      i.someProp("handleTextInput", (E) => E(i, B, ge, g, S)) || i.dispatch(S());
    } else
      i.dispatch(J());
  else
    i.dispatch(J());
}
function Ys(i, t, n) {
  return Math.max(n.anchor, n.head) > t.content.size ? null : Fr(i, t.resolve(n.anchor), t.resolve(n.head));
}
function id(i, t) {
  let n = i.firstChild.marks, r = t.firstChild.marks, s = n, o = r, l, a, c;
  for (let d = 0; d < r.length; d++)
    s = r[d].removeFromSet(s);
  for (let d = 0; d < n.length; d++)
    o = n[d].removeFromSet(o);
  if (s.length == 1 && o.length == 0)
    a = s[0], l = "add", c = (d) => d.mark(a.addToSet(d.marks));
  else if (s.length == 0 && o.length == 1)
    a = o[0], l = "remove", c = (d) => d.mark(a.removeFromSet(d.marks));
  else
    return null;
  let u = [];
  for (let d = 0; d < t.childCount; d++)
    u.push(c(t.child(d)));
  if (x.from(u).eq(i))
    return { mark: a, type: l };
}
function rd(i, t, n, r, s) {
  if (
    // The content must have shrunk
    n - t <= s.pos - r.pos || // newEnd must point directly at or after the end of the block that newStart points into
    er(r, !0, !1) < s.pos
  )
    return !1;
  let o = i.resolve(t);
  if (!r.parent.isTextblock) {
    let a = o.nodeAfter;
    return a != null && n == t + a.nodeSize;
  }
  if (o.parentOffset < o.parent.content.size || !o.parent.isTextblock)
    return !1;
  let l = i.resolve(er(o, !0, !0));
  return !l.parent.isTextblock || l.pos > n || er(l, !0, !1) < n ? !1 : r.parent.content.cut(r.parentOffset).eq(l.parent.content);
}
function er(i, t, n) {
  let r = i.depth, s = t ? i.end() : i.pos;
  for (; r > 0 && (t || i.indexAfter(r) == i.node(r).childCount); )
    r--, s++, t = !1;
  if (n) {
    let o = i.node(r).maybeChild(i.indexAfter(r));
    for (; o && !o.isLeaf; )
      o = o.firstChild, s++;
  }
  return s;
}
function sd(i, t, n, r, s) {
  let o = i.findDiffStart(t, n);
  if (o == null)
    return null;
  let { a: l, b: a } = i.findDiffEnd(t, n + i.size, n + t.size);
  if (s == "end") {
    let c = Math.max(0, o - Math.min(l, a));
    r -= l + c - o;
  }
  if (l < o && i.size < t.size) {
    let c = r <= o && r >= l ? o - r : 0;
    o -= c, o && o < t.size && Gs(t.textBetween(o - 1, o + 1)) && (o += c ? 1 : -1), a = o + (a - l), l = o;
  } else if (a < o) {
    let c = r <= o && r >= a ? o - r : 0;
    o -= c, o && o < i.size && Gs(i.textBetween(o - 1, o + 1)) && (o += c ? 1 : -1), l = o + (l - a), a = o;
  }
  return { start: o, endA: l, endB: a };
}
function Gs(i) {
  if (i.length != 2)
    return !1;
  let t = i.charCodeAt(0), n = i.charCodeAt(1);
  return t >= 56320 && t <= 57343 && n >= 55296 && n <= 56319;
}
class Hl {
  /**
  Create a view. `place` may be a DOM node that the editor should
  be appended to, a function that will place it into the document,
  or an object whose `mount` property holds the node to use as the
  document container. If it is `null`, the editor will not be
  added to the document.
  */
  constructor(t, n) {
    this._root = null, this.focused = !1, this.trackWrites = null, this.mounted = !1, this.markCursor = null, this.cursorWrapper = null, this.lastSelectedViewDesc = void 0, this.input = new xu(), this.prevDirectPlugins = [], this.pluginViews = [], this.requiresGeckoHackNode = !1, this.dragging = null, this._props = n, this.state = n.state, this.directPlugins = n.plugins || [], this.directPlugins.forEach(no), this.dispatch = this.dispatch.bind(this), this.dom = t && t.mount || document.createElement("div"), t && (t.appendChild ? t.appendChild(this.dom) : typeof t == "function" ? t(this.dom) : t.mount && (this.mounted = !0)), this.editable = eo(this), Qs(this), this.nodeViews = to(this), this.docView = Ds(this.state.doc, Zs(this), Qi(this), this.dom, this), this.domObserver = new Ju(this, (r, s, o, l) => nd(this, r, s, o, l)), this.domObserver.start(), ku(this), this.updatePluginViews();
  }
  /**
  Holds `true` when a
  [composition](https://w3c.github.io/uievents/#events-compositionevents)
  is active.
  */
  get composing() {
    return this.input.composing;
  }
  /**
  The view's current [props](https://prosemirror.net/docs/ref/#view.EditorProps).
  */
  get props() {
    if (this._props.state != this.state) {
      let t = this._props;
      this._props = {};
      for (let n in t)
        this._props[n] = t[n];
      this._props.state = this.state;
    }
    return this._props;
  }
  /**
  Update the view's props. Will immediately cause an update to
  the DOM.
  */
  update(t) {
    t.handleDOMEvents != this._props.handleDOMEvents && Cr(this);
    let n = this._props;
    this._props = t, t.plugins && (t.plugins.forEach(no), this.directPlugins = t.plugins), this.updateStateInner(t.state, n);
  }
  /**
  Update the view by updating existing props object with the object
  given as argument. Equivalent to `view.update(Object.assign({},
  view.props, props))`.
  */
  setProps(t) {
    let n = {};
    for (let r in this._props)
      n[r] = this._props[r];
    n.state = this.state;
    for (let r in t)
      n[r] = t[r];
    this.update(n);
  }
  /**
  Update the editor's `state` prop, without touching any of the
  other props.
  */
  updateState(t) {
    this.updateStateInner(t, this._props);
  }
  updateStateInner(t, n) {
    var r;
    let s = this.state, o = !1, l = !1;
    t.storedMarks && this.composing && (Rl(this), l = !0), this.state = t;
    let a = s.plugins != t.plugins || this._props.plugins != n.plugins;
    if (a || this._props.plugins != n.plugins || this._props.nodeViews != n.nodeViews) {
      let p = to(this);
      ld(p, this.nodeViews) && (this.nodeViews = p, o = !0);
    }
    (a || n.handleDOMEvents != this._props.handleDOMEvents) && Cr(this), this.editable = eo(this), Qs(this);
    let c = Qi(this), u = Zs(this), d = s.plugins != t.plugins && !s.doc.eq(t.doc) ? "reset" : t.scrollToSelection > s.scrollToSelection ? "to selection" : "preserve", h = o || !this.docView.matchesNode(t.doc, u, c);
    (h || !t.selection.eq(s.selection)) && (l = !0);
    let f = d == "preserve" && l && this.dom.style.overflowAnchor == null && Lc(this);
    if (l) {
      this.domObserver.stop();
      let p = h && (me || Z) && !this.composing && !s.selection.empty && !t.selection.empty && od(s.selection, t.selection);
      if (h) {
        let m = Z ? this.trackWrites = this.domSelectionRange().focusNode : null;
        this.composing && (this.input.compositionNode = Lu(this)), (o || !this.docView.update(t.doc, u, c, this)) && (this.docView.updateOuterDeco(u), this.docView.destroy(), this.docView = Ds(t.doc, u, c, this.dom, this)), m && (!this.trackWrites || !this.dom.contains(this.trackWrites)) && (p = !0);
      }
      p || !(this.input.mouseDown && this.domObserver.currentSelection.eq(this.domSelectionRange()) && ou(this)) ? Xe(this, p) : (kl(this, t.selection), this.domObserver.setCurSelection()), this.domObserver.start();
    }
    this.updatePluginViews(s), !((r = this.dragging) === null || r === void 0) && r.node && !s.doc.eq(t.doc) && this.updateDraggedNode(this.dragging, s), d == "reset" ? this.dom.scrollTop = 0 : d == "to selection" ? this.scrollToSelection() : f && Bc(f);
  }
  /**
  @internal
  */
  scrollToSelection() {
    let t = this.domSelectionRange().focusNode;
    if (!(!t || !this.dom.contains(t.nodeType == 1 ? t : t.parentNode))) {
      if (!this.someProp("handleScrollToSelection", (n) => n(this))) if (this.state.selection instanceof A) {
        let n = this.docView.domAfterPos(this.state.selection.from);
        n.nodeType == 1 && Es(this, n.getBoundingClientRect(), t);
      } else
        Es(this, this.coordsAtPos(this.state.selection.head, 1), t);
    }
  }
  destroyPluginViews() {
    let t;
    for (; t = this.pluginViews.pop(); )
      t.destroy && t.destroy();
  }
  updatePluginViews(t) {
    if (!t || t.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
      this.prevDirectPlugins = this.directPlugins, this.destroyPluginViews();
      for (let n = 0; n < this.directPlugins.length; n++) {
        let r = this.directPlugins[n];
        r.spec.view && this.pluginViews.push(r.spec.view(this));
      }
      for (let n = 0; n < this.state.plugins.length; n++) {
        let r = this.state.plugins[n];
        r.spec.view && this.pluginViews.push(r.spec.view(this));
      }
    } else
      for (let n = 0; n < this.pluginViews.length; n++) {
        let r = this.pluginViews[n];
        r.update && r.update(this, t);
      }
  }
  updateDraggedNode(t, n) {
    let r = t.node, s = -1;
    if (this.state.doc.nodeAt(r.from) == r.node)
      s = r.from;
    else {
      let o = r.from + (this.state.doc.content.size - n.doc.content.size);
      (o > 0 && this.state.doc.nodeAt(o)) == r.node && (s = o);
    }
    this.dragging = new Ll(t.slice, t.move, s < 0 ? void 0 : A.create(this.state.doc, s));
  }
  someProp(t, n) {
    let r = this._props && this._props[t], s;
    if (r != null && (s = n ? n(r) : r))
      return s;
    for (let l = 0; l < this.directPlugins.length; l++) {
      let a = this.directPlugins[l].props[t];
      if (a != null && (s = n ? n(a) : a))
        return s;
    }
    let o = this.state.plugins;
    if (o)
      for (let l = 0; l < o.length; l++) {
        let a = o[l].props[t];
        if (a != null && (s = n ? n(a) : a))
          return s;
      }
  }
  /**
  Query whether the view has focus.
  */
  hasFocus() {
    if (me) {
      let t = this.root.activeElement;
      if (t == this.dom)
        return !0;
      if (!t || !this.dom.contains(t))
        return !1;
      for (; t && this.dom != t && this.dom.contains(t); ) {
        if (t.contentEditable == "false")
          return !1;
        t = t.parentElement;
      }
      return !0;
    }
    return this.root.activeElement == this.dom;
  }
  /**
  Focus the editor.
  */
  focus() {
    this.domObserver.stop(), this.editable && Pc(this.dom), Xe(this), this.domObserver.start();
  }
  /**
  Get the document root in which the editor exists. This will
  usually be the top-level `document`, but might be a [shadow
  DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
  root if the editor is inside one.
  */
  get root() {
    let t = this._root;
    if (t == null) {
      for (let n = this.dom.parentNode; n; n = n.parentNode)
        if (n.nodeType == 9 || n.nodeType == 11 && n.host)
          return n.getSelection || (Object.getPrototypeOf(n).getSelection = () => n.ownerDocument.getSelection()), this._root = n;
    }
    return t || document;
  }
  /**
  When an existing editor view is moved to a new document or
  shadow tree, call this to make it recompute its root.
  */
  updateRoot() {
    this._root = null;
  }
  /**
  Given a pair of viewport coordinates, return the document
  position that corresponds to them. May return null if the given
  coordinates aren't inside of the editor. When an object is
  returned, its `pos` property is the position nearest to the
  coordinates, and its `inside` property holds the position of the
  inner node that the position falls inside of, or -1 if it is at
  the top level, not in any node.
  */
  posAtCoords(t) {
    return Wc(this, t);
  }
  /**
  Returns the viewport rectangle at a given document position.
  `left` and `right` will be the same number, as this returns a
  flat cursor-ish rectangle. If the position is between two things
  that aren't directly adjacent, `side` determines which element
  is used. When < 0, the element before the position is used,
  otherwise the element after.
  */
  coordsAtPos(t, n = 1) {
    return pl(this, t, n);
  }
  /**
  Find the DOM position that corresponds to the given document
  position. When `side` is negative, find the position as close as
  possible to the content before the position. When positive,
  prefer positions close to the content after the position. When
  zero, prefer as shallow a position as possible.
  
  Note that you should **not** mutate the editor's internal DOM,
  only inspect it (and even that is usually not necessary).
  */
  domAtPos(t, n = 0) {
    return this.docView.domFromPos(t, n);
  }
  /**
  Find the DOM node that represents the document node after the
  given position. May return `null` when the position doesn't point
  in front of a node or if the node is inside an opaque node view.
  
  This is intended to be able to call things like
  `getBoundingClientRect` on that DOM node. Do **not** mutate the
  editor DOM directly, or add styling this way, since that will be
  immediately overriden by the editor as it redraws the node.
  */
  nodeDOM(t) {
    let n = this.docView.descAt(t);
    return n ? n.nodeDOM : null;
  }
  /**
  Find the document position that corresponds to a given DOM
  position. (Whenever possible, it is preferable to inspect the
  document structure directly, rather than poking around in the
  DOM, but sometimes—for example when interpreting an event
  target—you don't have a choice.)
  
  The `bias` parameter can be used to influence which side of a DOM
  node to use when the position is inside a leaf node.
  */
  posAtDOM(t, n, r = -1) {
    let s = this.docView.posFromDOM(t, n, r);
    if (s == null)
      throw new RangeError("DOM position not inside the editor");
    return s;
  }
  /**
  Find out whether the selection is at the end of a textblock when
  moving in a given direction. When, for example, given `"left"`,
  it will return true if moving left from the current cursor
  position would leave that position's parent textblock. Will apply
  to the view's current state by default, but it is possible to
  pass a different state.
  */
  endOfTextblock(t, n) {
    return Jc(this, n || this.state, t);
  }
  /**
  Run the editor's paste logic with the given HTML string. The
  `event`, if given, will be passed to the
  [`handlePaste`](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste) hook.
  */
  pasteHTML(t, n) {
    return Ln(this, "", t, !1, n || new ClipboardEvent("paste"));
  }
  /**
  Run the editor's paste logic with the given plain-text input.
  */
  pasteText(t, n) {
    return Ln(this, t, null, !0, n || new ClipboardEvent("paste"));
  }
  /**
  Serialize the given slice as it would be if it was copied from
  this editor. Returns a DOM element that contains a
  representation of the slice as its children, a textual
  representation, and the transformed slice (which can be
  different from the given input due to hooks like
  [`transformCopied`](https://prosemirror.net/docs/ref/#view.EditorProps.transformCopied)).
  */
  serializeForClipboard(t) {
    return Vr(this, t);
  }
  /**
  Removes the editor from the DOM and destroys all [node
  views](https://prosemirror.net/docs/ref/#view.NodeView).
  */
  destroy() {
    this.docView && (Su(this), this.destroyPluginViews(), this.mounted ? (this.docView.update(this.state.doc, [], Qi(this), this), this.dom.textContent = "") : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom), this.docView.destroy(), this.docView = null, Ec());
  }
  /**
  This is true when the view has been
  [destroyed](https://prosemirror.net/docs/ref/#view.EditorView.destroy) (and thus should not be
  used anymore).
  */
  get isDestroyed() {
    return this.docView == null;
  }
  /**
  Used for testing.
  */
  dispatchEvent(t) {
    return Mu(this, t);
  }
  /**
  @internal
  */
  domSelectionRange() {
    let t = this.domSelection();
    return t ? ie && this.root.nodeType === 11 && qc(this.dom.ownerDocument) == this.dom && Yu(this, t) || t : { focusNode: null, focusOffset: 0, anchorNode: null, anchorOffset: 0 };
  }
  /**
  @internal
  */
  domSelection() {
    return this.root.getSelection();
  }
}
Hl.prototype.dispatch = function(i) {
  let t = this._props.dispatchTransaction;
  t ? t.call(this, i) : this.updateState(this.state.apply(i));
};
function Zs(i) {
  let t = /* @__PURE__ */ Object.create(null);
  return t.class = "ProseMirror", t.contenteditable = String(i.editable), i.someProp("attributes", (n) => {
    if (typeof n == "function" && (n = n(i.state)), n)
      for (let r in n)
        r == "class" ? t.class += " " + n[r] : r == "style" ? t.style = (t.style ? t.style + ";" : "") + n[r] : !t[r] && r != "contenteditable" && r != "nodeName" && (t[r] = String(n[r]));
  }), t.translate || (t.translate = "no"), [le.node(0, i.state.doc.content.size, t)];
}
function Qs(i) {
  if (i.markCursor) {
    let t = document.createElement("img");
    t.className = "ProseMirror-separator", t.setAttribute("mark-placeholder", "true"), t.setAttribute("alt", ""), i.cursorWrapper = { dom: t, deco: le.widget(i.state.selection.from, t, { raw: !0, marks: i.markCursor }) };
  } else
    i.cursorWrapper = null;
}
function eo(i) {
  return !i.someProp("editable", (t) => t(i.state) === !1);
}
function od(i, t) {
  let n = Math.min(i.$anchor.sharedDepth(i.head), t.$anchor.sharedDepth(t.head));
  return i.$anchor.start(n) != t.$anchor.start(n);
}
function to(i) {
  let t = /* @__PURE__ */ Object.create(null);
  function n(r) {
    for (let s in r)
      Object.prototype.hasOwnProperty.call(t, s) || (t[s] = r[s]);
  }
  return i.someProp("nodeViews", n), i.someProp("markViews", n), t;
}
function ld(i, t) {
  let n = 0, r = 0;
  for (let s in i) {
    if (i[s] != t[s])
      return !0;
    n++;
  }
  for (let s in t)
    r++;
  return n != r;
}
function no(i) {
  if (i.spec.state || i.spec.filterTransaction || i.spec.appendTransaction)
    throw new RangeError("Plugins passed directly to the view must not have a state component");
}
const ad = ["p", 0], cd = ["blockquote", 0], ud = ["hr"], dd = ["pre", ["code", 0]], hd = ["br"], fd = {
  /**
  NodeSpec The top level document node.
  */
  doc: {
    content: "block+"
  },
  /**
  A plain paragraph textblock. Represented in the DOM
  as a `<p>` element.
  */
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM() {
      return ad;
    }
  },
  /**
  A blockquote (`<blockquote>`) wrapping one or more blocks.
  */
  blockquote: {
    content: "block+",
    group: "block",
    defining: !0,
    parseDOM: [{ tag: "blockquote" }],
    toDOM() {
      return cd;
    }
  },
  /**
  A horizontal rule (`<hr>`).
  */
  horizontal_rule: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM() {
      return ud;
    }
  },
  /**
  A heading textblock, with a `level` attribute that
  should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  `<h6>` elements.
  */
  heading: {
    attrs: { level: { default: 1, validate: "number" } },
    content: "inline*",
    group: "block",
    defining: !0,
    parseDOM: [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
      { tag: "h4", attrs: { level: 4 } },
      { tag: "h5", attrs: { level: 5 } },
      { tag: "h6", attrs: { level: 6 } }
    ],
    toDOM(i) {
      return ["h" + i.attrs.level, 0];
    }
  },
  /**
  A code listing. Disallows marks or non-text inline
  nodes by default. Represented as a `<pre>` element with a
  `<code>` element inside of it.
  */
  code_block: {
    content: "text*",
    marks: "",
    group: "block",
    code: !0,
    defining: !0,
    parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
    toDOM() {
      return dd;
    }
  },
  /**
  The text node.
  */
  text: {
    group: "inline"
  },
  /**
  An inline image (`<img>`) node. Supports `src`,
  `alt`, and `href` attributes. The latter two default to the empty
  string.
  */
  image: {
    inline: !0,
    attrs: {
      src: { validate: "string" },
      alt: { default: null, validate: "string|null" },
      title: { default: null, validate: "string|null" }
    },
    group: "inline",
    draggable: !0,
    parseDOM: [{ tag: "img[src]", getAttrs(i) {
      return {
        src: i.getAttribute("src"),
        title: i.getAttribute("title"),
        alt: i.getAttribute("alt")
      };
    } }],
    toDOM(i) {
      let { src: t, alt: n, title: r } = i.attrs;
      return ["img", { src: t, alt: n, title: r }];
    }
  },
  /**
  A hard line break, represented in the DOM as `<br>`.
  */
  hard_break: {
    inline: !0,
    group: "inline",
    selectable: !1,
    parseDOM: [{ tag: "br" }],
    toDOM() {
      return hd;
    }
  }
}, pd = ["em", 0], md = ["strong", 0], gd = ["code", 0], yd = {
  /**
  A link. Has `href` and `title` attributes. `title`
  defaults to the empty string. Rendered and parsed as an `<a>`
  element.
  */
  link: {
    attrs: {
      href: { validate: "string" },
      title: { default: null, validate: "string|null" }
    },
    inclusive: !1,
    parseDOM: [{ tag: "a[href]", getAttrs(i) {
      return { href: i.getAttribute("href"), title: i.getAttribute("title") };
    } }],
    toDOM(i) {
      let { href: t, title: n } = i.attrs;
      return ["a", { href: t, title: n }, 0];
    }
  },
  /**
  An emphasis mark. Rendered as an `<em>` element. Has parse rules
  that also match `<i>` and `font-style: italic`.
  */
  em: {
    parseDOM: [
      { tag: "i" },
      { tag: "em" },
      { style: "font-style=italic" },
      { style: "font-style=normal", clearMark: (i) => i.type.name == "em" }
    ],
    toDOM() {
      return pd;
    }
  },
  /**
  A strong mark. Rendered as `<strong>`, parse rules also match
  `<b>` and `font-weight: bold`.
  */
  strong: {
    parseDOM: [
      { tag: "strong" },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      { tag: "b", getAttrs: (i) => i.style.fontWeight != "normal" && null },
      { style: "font-weight=400", clearMark: (i) => i.type.name == "strong" },
      { style: "font-weight", getAttrs: (i) => /^(bold(er)?|[5-9]\d{2,})$/.test(i) && null }
    ],
    toDOM() {
      return md;
    }
  },
  /**
  Code font mark. Represented as a `<code>` element.
  */
  code: {
    code: !0,
    parseDOM: [{ tag: "code" }],
    toDOM() {
      return gd;
    }
  }
}, bd = new qr({ nodes: fd, marks: yd }), vd = ["ol", 0], wd = ["ul", 0], xd = ["li", 0], kd = {
  attrs: { order: { default: 1, validate: "number" } },
  parseDOM: [{ tag: "ol", getAttrs(i) {
    return { order: i.hasAttribute("start") ? +i.getAttribute("start") : 1 };
  } }],
  toDOM(i) {
    return i.attrs.order == 1 ? vd : ["ol", { start: i.attrs.order }, 0];
  }
}, Sd = {
  parseDOM: [{ tag: "ul" }],
  toDOM() {
    return wd;
  }
}, Cd = {
  parseDOM: [{ tag: "li" }],
  toDOM() {
    return xd;
  },
  defining: !0
};
function tr(i, t) {
  let n = {};
  for (let r in i)
    n[r] = i[r];
  for (let r in t)
    n[r] = t[r];
  return n;
}
function Md(i, t, n) {
  return i.append({
    ordered_list: tr(kd, { content: "list_item+", group: n }),
    bullet_list: tr(Sd, { content: "list_item+", group: n }),
    list_item: tr(Cd, { content: t })
  });
}
function $l(i, t = null) {
  return function(n, r) {
    let { $from: s, $to: o } = n.selection, l = s.blockRange(o);
    if (!l)
      return !1;
    let a = r ? n.tr : null;
    return Ed(a, l, i, t) ? (r && r(a.scrollIntoView()), !0) : !1;
  };
}
function Ed(i, t, n, r = null) {
  let s = !1, o = t, l = t.$from.doc;
  if (t.depth >= 2 && t.$from.node(t.depth - 1).type.compatibleContent(n) && t.startIndex == 0) {
    if (t.$from.index(t.depth - 1) == 0)
      return !1;
    let c = l.resolve(t.start - 2);
    o = new yi(c, c, t.depth), t.endIndex < t.parent.childCount && (t = new yi(t.$from, l.resolve(t.$to.end(t.depth)), t.depth)), s = !0;
  }
  let a = Xo(o, n, r, t);
  return a ? (i && Nd(i, t, a, s, n), !0) : !1;
}
function Nd(i, t, n, r, s) {
  let o = x.empty;
  for (let d = n.length - 1; d >= 0; d--)
    o = x.from(n[d].type.create(n[d].attrs, o));
  i.step(new fe(t.start - (r ? 2 : 0), t.end, t.start, t.end, new k(o, 0, 0), n.length, !0));
  let l = 0;
  for (let d = 0; d < n.length; d++)
    n[d].type == s && (l = d + 1);
  let a = n.length - l, c = t.start + n.length - (r ? 2 : 0), u = t.parent;
  for (let d = t.startIndex, h = t.endIndex, f = !0; d < h; d++, f = !1)
    !f && Tn(i.doc, c, a) && (i.split(c, a), c += 2 * a), c += u.child(d).nodeSize;
  return i;
}
var wt = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, Ci = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, Td = typeof navigator < "u" && /Mac/.test(navigator.platform), Ad = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var G = 0; G < 10; G++) wt[48 + G] = wt[96 + G] = String(G);
for (var G = 1; G <= 24; G++) wt[G + 111] = "F" + G;
for (var G = 65; G <= 90; G++)
  wt[G] = String.fromCharCode(G + 32), Ci[G] = String.fromCharCode(G);
for (var nr in wt) Ci.hasOwnProperty(nr) || (Ci[nr] = wt[nr]);
function Od(i) {
  var t = Td && i.metaKey && i.shiftKey && !i.ctrlKey && !i.altKey || Ad && i.shiftKey && i.key && i.key.length == 1 || i.key == "Unidentified", n = !t && i.key || (i.shiftKey ? Ci : wt)[i.keyCode] || i.key || "Unidentified";
  return n == "Esc" && (n = "Escape"), n == "Del" && (n = "Delete"), n == "Left" && (n = "ArrowLeft"), n == "Up" && (n = "ArrowUp"), n == "Right" && (n = "ArrowRight"), n == "Down" && (n = "ArrowDown"), n;
}
const qd = typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), Dd = typeof navigator < "u" && /Win/.test(navigator.platform);
function zd(i) {
  let t = i.split(/-(?!$)/), n = t[t.length - 1];
  n == "Space" && (n = " ");
  let r, s, o, l;
  for (let a = 0; a < t.length - 1; a++) {
    let c = t[a];
    if (/^(cmd|meta|m)$/i.test(c))
      l = !0;
    else if (/^a(lt)?$/i.test(c))
      r = !0;
    else if (/^(c|ctrl|control)$/i.test(c))
      s = !0;
    else if (/^s(hift)?$/i.test(c))
      o = !0;
    else if (/^mod$/i.test(c))
      qd ? l = !0 : s = !0;
    else
      throw new Error("Unrecognized modifier name: " + c);
  }
  return r && (n = "Alt-" + n), s && (n = "Ctrl-" + n), l && (n = "Meta-" + n), o && (n = "Shift-" + n), n;
}
function Rd(i) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let n in i)
    t[zd(n)] = i[n];
  return t;
}
function ir(i, t, n = !0) {
  return t.altKey && (i = "Alt-" + i), t.ctrlKey && (i = "Ctrl-" + i), t.metaKey && (i = "Meta-" + i), n && t.shiftKey && (i = "Shift-" + i), i;
}
function io(i) {
  return new xe({ props: { handleKeyDown: Wl(i) } });
}
function Wl(i) {
  let t = Rd(i);
  return function(n, r) {
    let s = Od(r), o, l = t[ir(s, r)];
    if (l && l(n.state, n.dispatch, n))
      return !0;
    if (s.length == 1 && s != " ") {
      if (r.shiftKey) {
        let a = t[ir(s, r, !1)];
        if (a && a(n.state, n.dispatch, n))
          return !0;
      }
      if ((r.altKey || r.metaKey || r.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
      !(Dd && r.ctrlKey && r.altKey) && (o = wt[r.keyCode]) && o != s) {
        let a = t[ir(o, r)];
        if (a && a(n.state, n.dispatch, n))
          return !0;
      }
    }
    return !1;
  };
}
let Mr, Er;
if (typeof WeakMap < "u") {
  let i = /* @__PURE__ */ new WeakMap();
  Mr = (t) => i.get(t), Er = (t, n) => (i.set(t, n), n);
} else {
  const i = [];
  let n = 0;
  Mr = (r) => {
    for (let s = 0; s < i.length; s += 2) if (i[s] == r) return i[s + 1];
  }, Er = (r, s) => (n == 10 && (n = 0), i[n++] = r, i[n++] = s);
}
var $ = class {
  constructor(i, t, n, r) {
    this.width = i, this.height = t, this.map = n, this.problems = r;
  }
  findCell(i) {
    for (let t = 0; t < this.map.length; t++) {
      const n = this.map[t];
      if (n != i) continue;
      const r = t % this.width, s = t / this.width | 0;
      let o = r + 1, l = s + 1;
      for (let a = 1; o < this.width && this.map[t + a] == n; a++) o++;
      for (let a = 1; l < this.height && this.map[t + this.width * a] == n; a++) l++;
      return {
        left: r,
        top: s,
        right: o,
        bottom: l
      };
    }
    throw new RangeError(`No cell with offset ${i} found`);
  }
  colCount(i) {
    for (let t = 0; t < this.map.length; t++) if (this.map[t] == i) return t % this.width;
    throw new RangeError(`No cell with offset ${i} found`);
  }
  nextCell(i, t, n) {
    const { left: r, right: s, top: o, bottom: l } = this.findCell(i);
    return t == "horiz" ? (n < 0 ? r == 0 : s == this.width) ? null : this.map[o * this.width + (n < 0 ? r - 1 : s)] : (n < 0 ? o == 0 : l == this.height) ? null : this.map[r + this.width * (n < 0 ? o - 1 : l)];
  }
  rectBetween(i, t) {
    const { left: n, right: r, top: s, bottom: o } = this.findCell(i), { left: l, right: a, top: c, bottom: u } = this.findCell(t);
    return {
      left: Math.min(n, l),
      top: Math.min(s, c),
      right: Math.max(r, a),
      bottom: Math.max(o, u)
    };
  }
  cellsInRect(i) {
    const t = [], n = {};
    for (let r = i.top; r < i.bottom; r++) for (let s = i.left; s < i.right; s++) {
      const o = r * this.width + s, l = this.map[o];
      n[l] || (n[l] = !0, !(s == i.left && s && this.map[o - 1] == l || r == i.top && r && this.map[o - this.width] == l) && t.push(l));
    }
    return t;
  }
  positionAt(i, t, n) {
    for (let r = 0, s = 0; ; r++) {
      const o = s + n.child(r).nodeSize;
      if (r == i) {
        let l = t + i * this.width;
        const a = (i + 1) * this.width;
        for (; l < a && this.map[l] < s; ) l++;
        return l == a ? o - 1 : this.map[l];
      }
      s = o;
    }
  }
  static get(i) {
    return Mr(i) || Er(i, Id(i));
  }
};
function Id(i) {
  if (i.type.spec.tableRole != "table") throw new RangeError("Not a table node: " + i.type.name);
  const t = Ld(i), n = i.childCount, r = [];
  let s = 0, o = null;
  const l = [];
  for (let u = 0, d = t * n; u < d; u++) r[u] = 0;
  for (let u = 0, d = 0; u < n; u++) {
    const h = i.child(u);
    d++;
    for (let m = 0; ; m++) {
      for (; s < r.length && r[s] != 0; ) s++;
      if (m == h.childCount) break;
      const y = h.child(m), { colspan: b, rowspan: w, colwidth: D } = y.attrs;
      for (let B = 0; B < w; B++) {
        if (B + u >= n) {
          (o || (o = [])).push({
            type: "overlong_rowspan",
            pos: d,
            n: w - B
          });
          break;
        }
        const ge = s + B * t;
        for (let J = 0; J < b; J++) {
          r[ge + J] == 0 ? r[ge + J] = d : (o || (o = [])).push({
            type: "collision",
            row: u,
            pos: d,
            n: b - J
          });
          const Se = D && D[J];
          if (Se) {
            const g = (ge + J) % t * 2, S = l[g];
            S == null || S != Se && l[g + 1] == 1 ? (l[g] = Se, l[g + 1] = 1) : S == Se && l[g + 1]++;
          }
        }
      }
      s += b, d += y.nodeSize;
    }
    const f = (u + 1) * t;
    let p = 0;
    for (; s < f; ) r[s++] == 0 && p++;
    p && (o || (o = [])).push({
      type: "missing",
      row: u,
      n: p
    }), d++;
  }
  (t === 0 || n === 0) && (o || (o = [])).push({ type: "zero_sized" });
  const a = new $(t, n, r, o);
  let c = !1;
  for (let u = 0; !c && u < l.length; u += 2) l[u] != null && l[u + 1] < n && (c = !0);
  return c && Bd(a, l, i), a;
}
function Ld(i) {
  let t = -1, n = !1;
  for (let r = 0; r < i.childCount; r++) {
    const s = i.child(r);
    let o = 0;
    if (n) for (let l = 0; l < r; l++) {
      const a = i.child(l);
      for (let c = 0; c < a.childCount; c++) {
        const u = a.child(c);
        l + u.attrs.rowspan > r && (o += u.attrs.colspan);
      }
    }
    for (let l = 0; l < s.childCount; l++) {
      const a = s.child(l);
      o += a.attrs.colspan, a.attrs.rowspan > 1 && (n = !0);
    }
    t == -1 ? t = o : t != o && (t = Math.max(t, o));
  }
  return t;
}
function Bd(i, t, n) {
  i.problems || (i.problems = []);
  const r = {};
  for (let s = 0; s < i.map.length; s++) {
    const o = i.map[s];
    if (r[o]) continue;
    r[o] = !0;
    const l = n.nodeAt(o);
    if (!l) throw new RangeError(`No cell with offset ${o} found`);
    let a = null;
    const c = l.attrs;
    for (let u = 0; u < c.colspan; u++) {
      const d = t[(s + u) % i.width * 2];
      d != null && (!c.colwidth || c.colwidth[u] != d) && ((a || (a = Pd(c)))[u] = d);
    }
    a && i.problems.unshift({
      type: "colwidth mismatch",
      pos: o,
      colwidth: a
    });
  }
}
function Pd(i) {
  if (i.colwidth) return i.colwidth.slice();
  const t = [];
  for (let n = 0; n < i.colspan; n++) t.push(0);
  return t;
}
function ro(i, t) {
  if (typeof i == "string") return {};
  const n = i.getAttribute("data-colwidth"), r = n && /^\d+(,\d+)*$/.test(n) ? n.split(",").map((l) => Number(l)) : null, s = Number(i.getAttribute("colspan") || 1), o = {
    colspan: s,
    rowspan: Number(i.getAttribute("rowspan") || 1),
    colwidth: r && r.length == s ? r : null
  };
  for (const l in t) {
    const a = t[l].getFromDOM, c = a && a(i);
    c != null && (o[l] = c);
  }
  return o;
}
function so(i, t) {
  const n = {};
  i.attrs.colspan != 1 && (n.colspan = i.attrs.colspan), i.attrs.rowspan != 1 && (n.rowspan = i.attrs.rowspan), i.attrs.colwidth && (n["data-colwidth"] = i.attrs.colwidth.join(","));
  for (const r in t) {
    const s = t[r].setDOMAttr;
    s && s(i.attrs[r], n);
  }
  return n;
}
function Fd(i) {
  if (i !== null) {
    if (!Array.isArray(i)) throw new TypeError("colwidth must be null or an array");
    for (const t of i) if (typeof t != "number") throw new TypeError("colwidth must be null or an array of numbers");
  }
}
function Vd(i) {
  const t = i.cellAttributes || {}, n = {
    colspan: {
      default: 1,
      validate: "number"
    },
    rowspan: {
      default: 1,
      validate: "number"
    },
    colwidth: {
      default: null,
      validate: Fd
    }
  };
  for (const r in t) n[r] = {
    default: t[r].default,
    validate: t[r].validate
  };
  return {
    table: {
      content: "table_row+",
      tableRole: "table",
      isolating: !0,
      group: i.tableGroup,
      parseDOM: [{ tag: "table" }],
      toDOM() {
        return ["table", ["tbody", 0]];
      }
    },
    table_row: {
      content: "(table_cell | table_header)*",
      tableRole: "row",
      parseDOM: [{ tag: "tr" }],
      toDOM() {
        return ["tr", 0];
      }
    },
    table_cell: {
      content: i.cellContent,
      attrs: n,
      tableRole: "cell",
      isolating: !0,
      parseDOM: [{
        tag: "td",
        getAttrs: (r) => ro(r, t)
      }],
      toDOM(r) {
        return [
          "td",
          so(r, t),
          0
        ];
      }
    },
    table_header: {
      content: i.cellContent,
      attrs: n,
      tableRole: "header_cell",
      isolating: !0,
      parseDOM: [{
        tag: "th",
        getAttrs: (r) => ro(r, t)
      }],
      toDOM(r) {
        return [
          "th",
          so(r, t),
          0
        ];
      }
    }
  };
}
function ue(i) {
  let t = i.cached.tableNodeTypes;
  if (!t) {
    t = i.cached.tableNodeTypes = {};
    for (const n in i.nodes) {
      const r = i.nodes[n], s = r.spec.tableRole;
      s && (t[s] = r);
    }
  }
  return t;
}
const lt = new Ut("selectingCells");
function an(i) {
  for (let t = i.depth - 1; t > 0; t--) if (i.node(t).type.spec.tableRole == "row") return i.node(0).resolve(i.before(t + 1));
  return null;
}
function De(i) {
  const t = i.selection.$head;
  for (let n = t.depth; n > 0; n--) if (t.node(n).type.spec.tableRole == "row") return !0;
  return !1;
}
function _r(i) {
  const t = i.selection;
  if ("$anchorCell" in t && t.$anchorCell) return t.$anchorCell.pos > t.$headCell.pos ? t.$anchorCell : t.$headCell;
  if ("node" in t && t.node && t.node.type.spec.tableRole == "cell") return t.$anchor;
  const n = an(t.$head) || Hd(t.$head);
  if (n) return n;
  throw new RangeError(`No cell found around position ${t.head}`);
}
function Hd(i) {
  for (let t = i.nodeAfter, n = i.pos; t; t = t.firstChild, n++) {
    const r = t.type.spec.tableRole;
    if (r == "cell" || r == "header_cell") return i.doc.resolve(n);
  }
  for (let t = i.nodeBefore, n = i.pos; t; t = t.lastChild, n--) {
    const r = t.type.spec.tableRole;
    if (r == "cell" || r == "header_cell") return i.doc.resolve(n - t.nodeSize);
  }
}
function Nr(i) {
  return i.parent.type.spec.tableRole == "row" && !!i.nodeAfter;
}
function $d(i) {
  return i.node(0).resolve(i.pos + i.nodeAfter.nodeSize);
}
function Kr(i, t) {
  return i.depth == t.depth && i.pos >= t.start(-1) && i.pos <= t.end(-1);
}
function Ul(i, t, n) {
  const r = i.node(-1), s = $.get(r), o = i.start(-1), l = s.nextCell(i.pos - o, t, n);
  return l == null ? null : i.node(0).resolve(o + l);
}
function $t(i, t, n = 1) {
  const r = {
    ...i,
    colspan: i.colspan - n
  };
  return r.colwidth && (r.colwidth = r.colwidth.slice(), r.colwidth.splice(t, n), r.colwidth.some((s) => s > 0) || (r.colwidth = null)), r;
}
function Wd(i, t, n = 1) {
  const r = {
    ...i,
    colspan: i.colspan + n
  };
  if (r.colwidth) {
    r.colwidth = r.colwidth.slice();
    for (let s = 0; s < n; s++) r.colwidth.splice(t, 0, 0);
  }
  return r;
}
function Ud(i, t, n) {
  const r = ue(t.type.schema).header_cell;
  for (let s = 0; s < i.height; s++) if (t.nodeAt(i.map[n + s * i.width]).type != r) return !1;
  return !0;
}
var _ = class Ue extends q {
  constructor(t, n = t) {
    const r = t.node(-1), s = $.get(r), o = t.start(-1), l = s.rectBetween(t.pos - o, n.pos - o), a = t.node(0), c = s.cellsInRect(l).filter((d) => d != n.pos - o);
    c.unshift(n.pos - o);
    const u = c.map((d) => {
      const h = r.nodeAt(d);
      if (!h) throw new RangeError(`No cell with offset ${d} found`);
      const f = o + d + 1;
      return new Ir(a.resolve(f), a.resolve(f + h.content.size));
    });
    super(u[0].$from, u[0].$to, u), this.$anchorCell = t, this.$headCell = n;
  }
  map(t, n) {
    const r = t.resolve(n.map(this.$anchorCell.pos)), s = t.resolve(n.map(this.$headCell.pos));
    if (Nr(r) && Nr(s) && Kr(r, s)) {
      const o = this.$anchorCell.node(-1) != r.node(-1);
      return o && this.isRowSelection() ? Ue.rowSelection(r, s) : o && this.isColSelection() ? Ue.colSelection(r, s) : new Ue(r, s);
    }
    return L.between(r, s);
  }
  content() {
    const t = this.$anchorCell.node(-1), n = $.get(t), r = this.$anchorCell.start(-1), s = n.rectBetween(this.$anchorCell.pos - r, this.$headCell.pos - r), o = {}, l = [];
    for (let c = s.top; c < s.bottom; c++) {
      const u = [];
      for (let d = c * n.width + s.left, h = s.left; h < s.right; h++, d++) {
        const f = n.map[d];
        if (o[f]) continue;
        o[f] = !0;
        const p = n.findCell(f);
        let m = t.nodeAt(f);
        if (!m) throw new RangeError(`No cell with offset ${f} found`);
        const y = s.left - p.left, b = p.right - s.right;
        if (y > 0 || b > 0) {
          let w = m.attrs;
          if (y > 0 && (w = $t(w, 0, y)), b > 0 && (w = $t(w, w.colspan - b, b)), p.left < s.left) {
            if (m = m.type.createAndFill(w), !m) throw new RangeError(`Could not create cell with attrs ${JSON.stringify(w)}`);
          } else m = m.type.create(w, m.content);
        }
        if (p.top < s.top || p.bottom > s.bottom) {
          const w = {
            ...m.attrs,
            rowspan: Math.min(p.bottom, s.bottom) - Math.max(p.top, s.top)
          };
          p.top < s.top ? m = m.type.createAndFill(w) : m = m.type.create(w, m.content);
        }
        u.push(m);
      }
      l.push(t.child(c).copy(x.from(u)));
    }
    const a = this.isColSelection() && this.isRowSelection() ? t : l;
    return new k(x.from(a), 1, 1);
  }
  replace(t, n = k.empty) {
    const r = t.steps.length, s = this.ranges;
    for (let l = 0; l < s.length; l++) {
      const { $from: a, $to: c } = s[l], u = t.mapping.slice(r);
      t.replace(u.map(a.pos), u.map(c.pos), l ? k.empty : n);
    }
    const o = q.findFrom(t.doc.resolve(t.mapping.slice(r).map(this.to)), -1);
    o && t.setSelection(o);
  }
  replaceWith(t, n) {
    this.replace(t, new k(x.from(n), 0, 0));
  }
  forEachCell(t) {
    const n = this.$anchorCell.node(-1), r = $.get(n), s = this.$anchorCell.start(-1), o = r.cellsInRect(r.rectBetween(this.$anchorCell.pos - s, this.$headCell.pos - s));
    for (let l = 0; l < o.length; l++) t(n.nodeAt(o[l]), s + o[l]);
  }
  isColSelection() {
    const t = this.$anchorCell.index(-1), n = this.$headCell.index(-1);
    if (Math.min(t, n) > 0) return !1;
    const r = t + this.$anchorCell.nodeAfter.attrs.rowspan, s = n + this.$headCell.nodeAfter.attrs.rowspan;
    return Math.max(r, s) == this.$headCell.node(-1).childCount;
  }
  static colSelection(t, n = t) {
    const r = t.node(-1), s = $.get(r), o = t.start(-1), l = s.findCell(t.pos - o), a = s.findCell(n.pos - o), c = t.node(0);
    return l.top <= a.top ? (l.top > 0 && (t = c.resolve(o + s.map[l.left])), a.bottom < s.height && (n = c.resolve(o + s.map[s.width * (s.height - 1) + a.right - 1]))) : (a.top > 0 && (n = c.resolve(o + s.map[a.left])), l.bottom < s.height && (t = c.resolve(o + s.map[s.width * (s.height - 1) + l.right - 1]))), new Ue(t, n);
  }
  isRowSelection() {
    const t = this.$anchorCell.node(-1), n = $.get(t), r = this.$anchorCell.start(-1), s = n.colCount(this.$anchorCell.pos - r), o = n.colCount(this.$headCell.pos - r);
    if (Math.min(s, o) > 0) return !1;
    const l = s + this.$anchorCell.nodeAfter.attrs.colspan, a = o + this.$headCell.nodeAfter.attrs.colspan;
    return Math.max(l, a) == n.width;
  }
  eq(t) {
    return t instanceof Ue && t.$anchorCell.pos == this.$anchorCell.pos && t.$headCell.pos == this.$headCell.pos;
  }
  static rowSelection(t, n = t) {
    const r = t.node(-1), s = $.get(r), o = t.start(-1), l = s.findCell(t.pos - o), a = s.findCell(n.pos - o), c = t.node(0);
    return l.left <= a.left ? (l.left > 0 && (t = c.resolve(o + s.map[l.top * s.width])), a.right < s.width && (n = c.resolve(o + s.map[s.width * (a.top + 1) - 1]))) : (a.left > 0 && (n = c.resolve(o + s.map[a.top * s.width])), l.right < s.width && (t = c.resolve(o + s.map[s.width * (l.top + 1) - 1]))), new Ue(t, n);
  }
  toJSON() {
    return {
      type: "cell",
      anchor: this.$anchorCell.pos,
      head: this.$headCell.pos
    };
  }
  static fromJSON(t, n) {
    return new Ue(t.resolve(n.anchor), t.resolve(n.head));
  }
  static create(t, n, r = n) {
    return new Ue(t.resolve(n), t.resolve(r));
  }
  getBookmark() {
    return new jd(this.$anchorCell.pos, this.$headCell.pos);
  }
};
_.prototype.visible = !1;
q.jsonID("cell", _);
var jd = class jl {
  constructor(t, n) {
    this.anchor = t, this.head = n;
  }
  map(t) {
    return new jl(t.map(this.anchor), t.map(this.head));
  }
  resolve(t) {
    const n = t.resolve(this.anchor), r = t.resolve(this.head);
    return n.parent.type.spec.tableRole == "row" && r.parent.type.spec.tableRole == "row" && n.index() < n.parent.childCount && r.index() < r.parent.childCount && Kr(n, r) ? new _(n, r) : q.near(r, 1);
  }
};
function _d(i) {
  if (!(i.selection instanceof _)) return null;
  const t = [];
  return i.selection.forEachCell((n, r) => {
    t.push(le.node(r, r + n.nodeSize, { class: "selectedCell" }));
  }), H.create(i.doc, t);
}
function Kd({ $from: i, $to: t }) {
  if (i.pos == t.pos || i.pos < t.pos - 6) return !1;
  let n = i.pos, r = t.pos, s = i.depth;
  for (; s >= 0 && !(i.after(s + 1) < i.end(s)); s--, n++) ;
  for (let o = t.depth; o >= 0 && !(t.before(o + 1) > t.start(o)); o--, r--) ;
  return n == r && /row|table/.test(i.node(s).type.spec.tableRole);
}
function Jd({ $from: i, $to: t }) {
  let n, r;
  for (let s = i.depth; s > 0; s--) {
    const o = i.node(s);
    if (o.type.spec.tableRole === "cell" || o.type.spec.tableRole === "header_cell") {
      n = o;
      break;
    }
  }
  for (let s = t.depth; s > 0; s--) {
    const o = t.node(s);
    if (o.type.spec.tableRole === "cell" || o.type.spec.tableRole === "header_cell") {
      r = o;
      break;
    }
  }
  return n !== r && t.parentOffset === 0;
}
function Xd(i, t, n) {
  const r = (t || i).selection, s = (t || i).doc;
  let o, l;
  if (r instanceof A && (l = r.node.type.spec.tableRole)) {
    if (l == "cell" || l == "header_cell") o = _.create(s, r.from);
    else if (l == "row") {
      const a = s.resolve(r.from + 1);
      o = _.rowSelection(a, a);
    } else if (!n) {
      const a = $.get(r.node), c = r.from + 1, u = c + a.map[a.width * a.height - 1];
      o = _.create(s, c + 1, u);
    }
  } else r instanceof L && Kd(r) ? o = L.create(s, r.from) : r instanceof L && Jd(r) && (o = L.create(s, r.$from.start(), r.$from.end()));
  return o && (t || (t = i.tr)).setSelection(o), t;
}
const Yd = new Ut("fix-tables");
function _l(i, t, n, r) {
  const s = i.childCount, o = t.childCount;
  e: for (let l = 0, a = 0; l < o; l++) {
    const c = t.child(l);
    for (let u = a, d = Math.min(s, l + 3); u < d; u++) if (i.child(u) == c) {
      a = u + 1, n += c.nodeSize;
      continue e;
    }
    r(c, n), a < s && i.child(a).sameMarkup(c) ? _l(i.child(a), c, n + 1, r) : c.nodesBetween(0, c.content.size, r, n + 1), n += c.nodeSize;
  }
}
function Gd(i, t) {
  let n;
  const r = (s, o) => {
    s.type.spec.tableRole == "table" && (n = Zd(i, s, o, n));
  };
  return t ? t.doc != i.doc && _l(t.doc, i.doc, 0, r) : i.doc.descendants(r), n;
}
function Zd(i, t, n, r) {
  const s = $.get(t);
  if (!s.problems) return r;
  r || (r = i.tr);
  const o = [];
  for (let c = 0; c < s.height; c++) o.push(0);
  for (let c = 0; c < s.problems.length; c++) {
    const u = s.problems[c];
    if (u.type == "collision") {
      const d = t.nodeAt(u.pos);
      if (!d) continue;
      const h = d.attrs;
      for (let f = 0; f < h.rowspan; f++) o[u.row + f] += u.n;
      r.setNodeMarkup(r.mapping.map(n + 1 + u.pos), null, $t(h, h.colspan - u.n, u.n));
    } else if (u.type == "missing") o[u.row] += u.n;
    else if (u.type == "overlong_rowspan") {
      const d = t.nodeAt(u.pos);
      if (!d) continue;
      r.setNodeMarkup(r.mapping.map(n + 1 + u.pos), null, {
        ...d.attrs,
        rowspan: d.attrs.rowspan - u.n
      });
    } else if (u.type == "colwidth mismatch") {
      const d = t.nodeAt(u.pos);
      if (!d) continue;
      r.setNodeMarkup(r.mapping.map(n + 1 + u.pos), null, {
        ...d.attrs,
        colwidth: u.colwidth
      });
    } else if (u.type == "zero_sized") {
      const d = r.mapping.map(n);
      r.delete(d, d + t.nodeSize);
    }
  }
  let l, a;
  for (let c = 0; c < o.length; c++) o[c] && (l == null && (l = c), a = c);
  for (let c = 0, u = n + 1; c < s.height; c++) {
    const d = t.child(c), h = u + d.nodeSize, f = o[c];
    if (f > 0) {
      let p = "cell";
      d.firstChild && (p = d.firstChild.type.spec.tableRole);
      const m = [];
      for (let b = 0; b < f; b++) {
        const w = ue(i.schema)[p].createAndFill();
        w && m.push(w);
      }
      const y = (c == 0 || l == c - 1) && a == c ? u + 1 : h - 1;
      r.insert(r.mapping.map(y), m);
    }
    u = h;
  }
  return r.setMeta(Yd, { fixTables: !0 });
}
function Ct(i) {
  const t = i.selection, n = _r(i), r = n.node(-1), s = n.start(-1), o = $.get(r);
  return {
    ...t instanceof _ ? o.rectBetween(t.$anchorCell.pos - s, t.$headCell.pos - s) : o.findCell(n.pos - s),
    tableStart: s,
    map: o,
    table: r
  };
}
function Kl(i, { map: t, tableStart: n, table: r }, s) {
  let o = s > 0 ? -1 : 0;
  Ud(t, r, s + o) && (o = s == 0 || s == t.width ? null : 0);
  for (let l = 0; l < t.height; l++) {
    const a = l * t.width + s;
    if (s > 0 && s < t.width && t.map[a - 1] == t.map[a]) {
      const c = t.map[a], u = r.nodeAt(c);
      i.setNodeMarkup(i.mapping.map(n + c), null, Wd(u.attrs, s - t.colCount(c))), l += u.attrs.rowspan - 1;
    } else {
      const c = o == null ? ue(r.type.schema).cell : r.nodeAt(t.map[a + o]).type, u = t.positionAt(l, s, r);
      i.insert(i.mapping.map(n + u), c.createAndFill());
    }
  }
  return i;
}
function oo(i, t) {
  if (!De(i)) return !1;
  if (t) {
    const n = Ct(i);
    t(Kl(i.tr, n, n.left));
  }
  return !0;
}
function lo(i, t) {
  if (!De(i)) return !1;
  if (t) {
    const n = Ct(i);
    t(Kl(i.tr, n, n.right));
  }
  return !0;
}
function Qd(i, { map: t, table: n, tableStart: r }, s) {
  const o = i.mapping.maps.length;
  for (let l = 0; l < t.height; ) {
    const a = l * t.width + s, c = t.map[a], u = n.nodeAt(c), d = u.attrs;
    if (s > 0 && t.map[a - 1] == c || s < t.width - 1 && t.map[a + 1] == c) i.setNodeMarkup(i.mapping.slice(o).map(r + c), null, $t(d, s - t.colCount(c)));
    else {
      const h = i.mapping.slice(o).map(r + c);
      i.delete(h, h + u.nodeSize);
    }
    l += d.rowspan;
  }
}
function e1(i, t) {
  if (!De(i)) return !1;
  if (t) {
    const n = Ct(i), r = i.tr;
    if (n.left == 0 && n.right == n.map.width) return !1;
    for (let s = n.right - 1; Qd(r, n, s), s != n.left; s--) {
      const o = n.tableStart ? r.doc.nodeAt(n.tableStart - 1) : r.doc;
      if (!o) throw new RangeError("No table found");
      n.table = o, n.map = $.get(o);
    }
    t(r);
  }
  return !0;
}
function t1(i, t, n) {
  var r;
  const s = ue(t.type.schema).header_cell;
  for (let o = 0; o < i.width; o++) if (((r = t.nodeAt(i.map[o + n * i.width])) === null || r === void 0 ? void 0 : r.type) != s) return !1;
  return !0;
}
function Jl(i, { map: t, tableStart: n, table: r }, s) {
  let o = n;
  for (let u = 0; u < s; u++) o += r.child(u).nodeSize;
  const l = [];
  let a = s > 0 ? -1 : 0;
  t1(t, r, s + a) && (a = s == 0 || s == t.height ? null : 0);
  for (let u = 0, d = t.width * s; u < t.width; u++, d++) if (s > 0 && s < t.height && t.map[d] == t.map[d - t.width]) {
    const h = t.map[d], f = r.nodeAt(h).attrs;
    i.setNodeMarkup(n + h, null, {
      ...f,
      rowspan: f.rowspan + 1
    }), u += f.colspan - 1;
  } else {
    var c;
    const h = a == null ? ue(r.type.schema).cell : (c = r.nodeAt(t.map[d + a * t.width])) === null || c === void 0 ? void 0 : c.type, f = h?.createAndFill();
    f && l.push(f);
  }
  return i.insert(o, ue(r.type.schema).row.create(null, l)), i;
}
function Tr(i, t) {
  if (!De(i)) return !1;
  if (t) {
    const n = Ct(i);
    t(Jl(i.tr, n, n.top));
  }
  return !0;
}
function ao(i, t) {
  if (!De(i)) return !1;
  if (t) {
    const n = Ct(i);
    t(Jl(i.tr, n, n.bottom));
  }
  return !0;
}
function n1(i, { map: t, table: n, tableStart: r }, s) {
  let o = 0;
  for (let u = 0; u < s; u++) o += n.child(u).nodeSize;
  const l = o + n.child(s).nodeSize, a = i.mapping.maps.length;
  i.delete(o + r, l + r);
  const c = /* @__PURE__ */ new Set();
  for (let u = 0, d = s * t.width; u < t.width; u++, d++) {
    const h = t.map[d];
    if (!c.has(h)) {
      if (c.add(h), s > 0 && h == t.map[d - t.width]) {
        const f = n.nodeAt(h).attrs;
        i.setNodeMarkup(i.mapping.slice(a).map(h + r), null, {
          ...f,
          rowspan: f.rowspan - 1
        }), u += f.colspan - 1;
      } else if (s < t.height && h == t.map[d + t.width]) {
        const f = n.nodeAt(h), p = f.attrs, m = f.type.create({
          ...p,
          rowspan: f.attrs.rowspan - 1
        }, f.content), y = t.positionAt(s + 1, u, n);
        i.insert(i.mapping.slice(a).map(r + y), m), u += p.colspan - 1;
      }
    }
  }
}
function i1(i, t) {
  if (!De(i)) return !1;
  if (t) {
    const n = Ct(i), r = i.tr;
    if (n.top == 0 && n.bottom == n.map.height) return !1;
    for (let s = n.bottom - 1; n1(r, n, s), s != n.top; s--) {
      const o = n.tableStart ? r.doc.nodeAt(n.tableStart - 1) : r.doc;
      if (!o) throw new RangeError("No table found");
      n.table = o, n.map = $.get(n.table);
    }
    t(r);
  }
  return !0;
}
function r1(i) {
  return function(t, n) {
    if (!De(t)) return !1;
    if (n) {
      const r = ue(t.schema), s = Ct(t), o = t.tr, l = s.map.cellsInRect(i == "column" ? {
        left: s.left,
        top: 0,
        right: s.right,
        bottom: s.map.height
      } : i == "row" ? {
        left: 0,
        top: s.top,
        right: s.map.width,
        bottom: s.bottom
      } : s), a = l.map((c) => s.table.nodeAt(c));
      for (let c = 0; c < l.length; c++) a[c].type == r.header_cell && o.setNodeMarkup(s.tableStart + l[c], r.cell, a[c].attrs);
      if (o.steps.length === 0) for (let c = 0; c < l.length; c++) o.setNodeMarkup(s.tableStart + l[c], r.header_cell, a[c].attrs);
      n(o);
    }
    return !0;
  };
}
function co(i, t, n) {
  const r = t.map.cellsInRect({
    left: 0,
    top: 0,
    right: i == "row" ? t.map.width : 1,
    bottom: i == "column" ? t.map.height : 1
  });
  for (let s = 0; s < r.length; s++) {
    const o = t.table.nodeAt(r[s]);
    if (o && o.type !== n.header_cell) return !1;
  }
  return !0;
}
function Jr(i, t) {
  return t = t || { useDeprecatedLogic: !1 }, t.useDeprecatedLogic ? r1(i) : function(n, r) {
    if (!De(n)) return !1;
    if (r) {
      const s = ue(n.schema), o = Ct(n), l = n.tr, a = co("row", o, s), c = co("column", o, s), u = (i === "column" ? a : i === "row" && c) ? 1 : 0, d = i == "column" ? {
        left: 0,
        top: u,
        right: 1,
        bottom: o.map.height
      } : i == "row" ? {
        left: u,
        top: 0,
        right: o.map.width,
        bottom: 1
      } : o, h = i == "column" ? c ? s.cell : s.header_cell : i == "row" ? a ? s.cell : s.header_cell : s.cell;
      o.map.cellsInRect(d).forEach((f) => {
        const p = f + o.tableStart, m = l.doc.nodeAt(p);
        m && l.setNodeMarkup(p, h, m.attrs);
      }), r(l);
    }
    return !0;
  };
}
Jr("row", { useDeprecatedLogic: !0 });
Jr("column", { useDeprecatedLogic: !0 });
Jr("cell", { useDeprecatedLogic: !0 });
function s1(i, t) {
  if (t < 0) {
    const n = i.nodeBefore;
    if (n) return i.pos - n.nodeSize;
    for (let r = i.index(-1) - 1, s = i.before(); r >= 0; r--) {
      const o = i.node(-1).child(r), l = o.lastChild;
      if (l) return s - 1 - l.nodeSize;
      s -= o.nodeSize;
    }
  } else {
    if (i.index() < i.parent.childCount - 1) return i.pos + i.nodeAfter.nodeSize;
    const n = i.node(-1);
    for (let r = i.indexAfter(-1), s = i.after(); r < n.childCount; r++) {
      const o = n.child(r);
      if (o.childCount) return s + 1;
      s += o.nodeSize;
    }
  }
  return null;
}
function uo(i) {
  return function(t, n) {
    if (!De(t)) return !1;
    const r = s1(_r(t), i);
    if (r == null) return !1;
    if (n) {
      const s = t.doc.resolve(r);
      n(t.tr.setSelection(L.between(s, $d(s))).scrollIntoView());
    }
    return !0;
  };
}
function ti(i, t) {
  const n = i.selection;
  if (!(n instanceof _)) return !1;
  if (t) {
    const r = i.tr, s = ue(i.schema).cell.createAndFill().content;
    n.forEachCell((o, l) => {
      o.content.eq(s) || r.replace(r.mapping.map(l + 1), r.mapping.map(l + o.nodeSize - 1), new k(s, 0, 0));
    }), r.docChanged && t(r);
  }
  return !0;
}
function o1(i) {
  if (i.size === 0) return null;
  let { content: t, openStart: n, openEnd: r } = i;
  for (; t.childCount == 1 && (n > 0 && r > 0 || t.child(0).type.spec.tableRole == "table"); )
    n--, r--, t = t.child(0).content;
  const s = t.child(0), o = s.type.spec.tableRole, l = s.type.schema, a = [];
  if (o == "row") for (let c = 0; c < t.childCount; c++) {
    let u = t.child(c).content;
    const d = c ? 0 : Math.max(0, n - 1), h = c < t.childCount - 1 ? 0 : Math.max(0, r - 1);
    (d || h) && (u = Ar(ue(l).row, new k(u, d, h)).content), a.push(u);
  }
  else if (o == "cell" || o == "header_cell") a.push(n || r ? Ar(ue(l).row, new k(t, n, r)).content : t);
  else return null;
  return l1(l, a);
}
function l1(i, t) {
  const n = [];
  for (let s = 0; s < t.length; s++) {
    const o = t[s];
    for (let l = o.childCount - 1; l >= 0; l--) {
      const { rowspan: a, colspan: c } = o.child(l).attrs;
      for (let u = s; u < s + a; u++) n[u] = (n[u] || 0) + c;
    }
  }
  let r = 0;
  for (let s = 0; s < n.length; s++) r = Math.max(r, n[s]);
  for (let s = 0; s < n.length; s++)
    if (s >= t.length && t.push(x.empty), n[s] < r) {
      const o = ue(i).cell.createAndFill(), l = [];
      for (let a = n[s]; a < r; a++) l.push(o);
      t[s] = t[s].append(x.from(l));
    }
  return {
    height: t.length,
    width: r,
    rows: t
  };
}
function Ar(i, t) {
  const n = i.createAndFill();
  return new il(n).replace(0, n.content.size, t).doc;
}
function a1({ width: i, height: t, rows: n }, r, s) {
  if (i != r) {
    const o = [], l = [];
    for (let a = 0; a < n.length; a++) {
      const c = n[a], u = [];
      for (let d = o[a] || 0, h = 0; d < r; h++) {
        let f = c.child(h % c.childCount);
        d + f.attrs.colspan > r && (f = f.type.createChecked($t(f.attrs, f.attrs.colspan, d + f.attrs.colspan - r), f.content)), u.push(f), d += f.attrs.colspan;
        for (let p = 1; p < f.attrs.rowspan; p++) o[a + p] = (o[a + p] || 0) + f.attrs.colspan;
      }
      l.push(x.from(u));
    }
    n = l, i = r;
  }
  if (t != s) {
    const o = [];
    for (let l = 0, a = 0; l < s; l++, a++) {
      const c = [], u = n[a % t];
      for (let d = 0; d < u.childCount; d++) {
        let h = u.child(d);
        l + h.attrs.rowspan > s && (h = h.type.create({
          ...h.attrs,
          rowspan: Math.max(1, s - h.attrs.rowspan)
        }, h.content)), c.push(h);
      }
      o.push(x.from(c));
    }
    n = o, t = s;
  }
  return {
    width: i,
    height: t,
    rows: n
  };
}
function c1(i, t, n, r, s, o, l) {
  const a = i.doc.type.schema, c = ue(a);
  let u, d;
  if (s > t.width) for (let h = 0, f = 0; h < t.height; h++) {
    const p = n.child(h);
    f += p.nodeSize;
    const m = [];
    let y;
    p.lastChild == null || p.lastChild.type == c.cell ? y = u || (u = c.cell.createAndFill()) : y = d || (d = c.header_cell.createAndFill());
    for (let b = t.width; b < s; b++) m.push(y);
    i.insert(i.mapping.slice(l).map(f - 1 + r), m);
  }
  if (o > t.height) {
    const h = [];
    for (let m = 0, y = (t.height - 1) * t.width; m < Math.max(t.width, s); m++) {
      const b = m >= t.width ? !1 : n.nodeAt(t.map[y + m]).type == c.header_cell;
      h.push(b ? d || (d = c.header_cell.createAndFill()) : u || (u = c.cell.createAndFill()));
    }
    const f = c.row.create(null, x.from(h)), p = [];
    for (let m = t.height; m < o; m++) p.push(f);
    i.insert(i.mapping.slice(l).map(r + n.nodeSize - 2), p);
  }
  return !!(u || d);
}
function ho(i, t, n, r, s, o, l, a) {
  if (l == 0 || l == t.height) return !1;
  let c = !1;
  for (let u = s; u < o; u++) {
    const d = l * t.width + u, h = t.map[d];
    if (t.map[d - t.width] == h) {
      c = !0;
      const f = n.nodeAt(h), { top: p, left: m } = t.findCell(h);
      i.setNodeMarkup(i.mapping.slice(a).map(h + r), null, {
        ...f.attrs,
        rowspan: l - p
      }), i.insert(i.mapping.slice(a).map(t.positionAt(l, m, n)), f.type.createAndFill({
        ...f.attrs,
        rowspan: p + f.attrs.rowspan - l
      })), u += f.attrs.colspan - 1;
    }
  }
  return c;
}
function fo(i, t, n, r, s, o, l, a) {
  if (l == 0 || l == t.width) return !1;
  let c = !1;
  for (let u = s; u < o; u++) {
    const d = u * t.width + l, h = t.map[d];
    if (t.map[d - 1] == h) {
      c = !0;
      const f = n.nodeAt(h), p = t.colCount(h), m = i.mapping.slice(a).map(h + r);
      i.setNodeMarkup(m, null, $t(f.attrs, l - p, f.attrs.colspan - (l - p))), i.insert(m + f.nodeSize, f.type.createAndFill($t(f.attrs, 0, l - p))), u += f.attrs.rowspan - 1;
    }
  }
  return c;
}
function po(i, t, n, r, s) {
  let o = n ? i.doc.nodeAt(n - 1) : i.doc;
  if (!o) throw new Error("No table found");
  let l = $.get(o);
  const { top: a, left: c } = r, u = c + s.width, d = a + s.height, h = i.tr;
  let f = 0;
  function p() {
    if (o = n ? h.doc.nodeAt(n - 1) : h.doc, !o) throw new Error("No table found");
    l = $.get(o), f = h.mapping.maps.length;
  }
  c1(h, l, o, n, u, d, f) && p(), ho(h, l, o, n, c, u, a, f) && p(), ho(h, l, o, n, c, u, d, f) && p(), fo(h, l, o, n, a, d, c, f) && p(), fo(h, l, o, n, a, d, u, f) && p();
  for (let m = a; m < d; m++) {
    const y = l.positionAt(m, c, o), b = l.positionAt(m, u, o);
    h.replace(h.mapping.slice(f).map(y + n), h.mapping.slice(f).map(b + n), new k(s.rows[m - a], 0, 0));
  }
  p(), h.setSelection(new _(h.doc.resolve(n + l.positionAt(a, c, o)), h.doc.resolve(n + l.positionAt(d - 1, u - 1, o)))), t(h);
}
const u1 = Wl({
  ArrowLeft: ni("horiz", -1),
  ArrowRight: ni("horiz", 1),
  ArrowUp: ni("vert", -1),
  ArrowDown: ni("vert", 1),
  "Shift-ArrowLeft": ii("horiz", -1),
  "Shift-ArrowRight": ii("horiz", 1),
  "Shift-ArrowUp": ii("vert", -1),
  "Shift-ArrowDown": ii("vert", 1),
  Backspace: ti,
  "Mod-Backspace": ti,
  Delete: ti,
  "Mod-Delete": ti
});
function ai(i, t, n) {
  return n.eq(i.selection) ? !1 : (t && t(i.tr.setSelection(n).scrollIntoView()), !0);
}
function ni(i, t) {
  return (n, r, s) => {
    if (!s) return !1;
    const o = n.selection;
    if (o instanceof _) return ai(n, r, q.near(o.$headCell, t));
    if (i != "horiz" && !o.empty) return !1;
    const l = Xl(s, i, t);
    if (l == null) return !1;
    if (i == "horiz") return ai(n, r, q.near(n.doc.resolve(o.head + t), t));
    {
      const a = n.doc.resolve(l), c = Ul(a, i, t);
      let u;
      return c ? u = q.near(c, 1) : t < 0 ? u = q.near(n.doc.resolve(a.before(-1)), -1) : u = q.near(n.doc.resolve(a.after(-1)), 1), ai(n, r, u);
    }
  };
}
function ii(i, t) {
  return (n, r, s) => {
    if (!s) return !1;
    const o = n.selection;
    let l;
    if (o instanceof _) l = o;
    else {
      const c = Xl(s, i, t);
      if (c == null) return !1;
      l = new _(n.doc.resolve(c));
    }
    const a = Ul(l.$headCell, i, t);
    return a ? ai(n, r, new _(l.$anchorCell, a)) : !1;
  };
}
function d1(i, t) {
  const n = i.state.doc, r = an(n.resolve(t));
  return r ? (i.dispatch(i.state.tr.setSelection(new _(r))), !0) : !1;
}
function h1(i, t, n) {
  if (!De(i.state)) return !1;
  let r = o1(n);
  const s = i.state.selection;
  if (s instanceof _) {
    r || (r = {
      width: 1,
      height: 1,
      rows: [x.from(Ar(ue(i.state.schema).cell, n))]
    });
    const o = s.$anchorCell.node(-1), l = s.$anchorCell.start(-1), a = $.get(o).rectBetween(s.$anchorCell.pos - l, s.$headCell.pos - l);
    return r = a1(r, a.right - a.left, a.bottom - a.top), po(i.state, i.dispatch, l, a, r), !0;
  } else if (r) {
    const o = _r(i.state), l = o.start(-1);
    return po(i.state, i.dispatch, l, $.get(o.node(-1)).findCell(o.pos - l), r), !0;
  } else return !1;
}
function f1(i, t) {
  var n;
  if (t.button != 0 || t.ctrlKey || t.metaKey) return;
  const r = mo(i, t.target);
  let s;
  if (t.shiftKey && i.state.selection instanceof _)
    o(i.state.selection.$anchorCell, t), t.preventDefault();
  else if (t.shiftKey && r && (s = an(i.state.selection.$anchor)) != null && ((n = rr(i, t)) === null || n === void 0 ? void 0 : n.pos) != s.pos)
    o(s, t), t.preventDefault();
  else if (!r) return;
  function o(c, u) {
    let d = rr(i, u);
    const h = lt.getState(i.state) == null;
    if (!d || !Kr(c, d)) if (h) d = c;
    else return;
    const f = new _(c, d);
    if (h || !i.state.selection.eq(f)) {
      const p = i.state.tr.setSelection(f);
      h && p.setMeta(lt, c.pos), i.dispatch(p);
    }
  }
  function l() {
    i.root.removeEventListener("mouseup", l), i.root.removeEventListener("dragstart", l), i.root.removeEventListener("mousemove", a), lt.getState(i.state) != null && i.dispatch(i.state.tr.setMeta(lt, -1));
  }
  function a(c) {
    const u = c, d = lt.getState(i.state);
    let h;
    if (d != null) h = i.state.doc.resolve(d);
    else if (mo(i, u.target) != r && (h = rr(i, t), !h))
      return l();
    h && o(h, u);
  }
  i.root.addEventListener("mouseup", l), i.root.addEventListener("dragstart", l), i.root.addEventListener("mousemove", a);
}
function Xl(i, t, n) {
  if (!(i.state.selection instanceof L)) return null;
  const { $head: r } = i.state.selection;
  for (let s = r.depth - 1; s >= 0; s--) {
    const o = r.node(s);
    if ((n < 0 ? r.index(s) : r.indexAfter(s)) != (n < 0 ? 0 : o.childCount)) return null;
    if (o.type.spec.tableRole == "cell" || o.type.spec.tableRole == "header_cell") {
      const l = r.before(s), a = t == "vert" ? n > 0 ? "down" : "up" : n > 0 ? "right" : "left";
      return i.endOfTextblock(a) ? l : null;
    }
  }
  return null;
}
function mo(i, t) {
  for (; t && t != i.dom; t = t.parentNode) if (t.nodeName == "TD" || t.nodeName == "TH") return t;
  return null;
}
function rr(i, t) {
  const n = i.posAtCoords({
    left: t.clientX,
    top: t.clientY
  });
  if (!n) return null;
  let { inside: r, pos: s } = n;
  return r >= 0 && an(i.state.doc.resolve(r)) || an(i.state.doc.resolve(s));
}
var p1 = class {
  constructor(i, t) {
    this.node = i, this.defaultCellMinWidth = t, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), this.table.style.setProperty("--default-cell-min-width", `${t}px`), this.colgroup = this.table.appendChild(document.createElement("colgroup")), Or(i, this.colgroup, this.table, t), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(i) {
    return i.type != this.node.type ? !1 : (this.node = i, Or(i, this.colgroup, this.table, this.defaultCellMinWidth), !0);
  }
  ignoreMutation(i) {
    return i.type == "attributes" && (i.target == this.table || this.colgroup.contains(i.target));
  }
};
function Or(i, t, n, r, s, o) {
  let l = 0, a = !0, c = t.firstChild;
  const u = i.firstChild;
  if (u) {
    for (let h = 0, f = 0; h < u.childCount; h++) {
      const { colspan: p, colwidth: m } = u.child(h).attrs;
      for (let y = 0; y < p; y++, f++) {
        const b = s == f ? o : m && m[y], w = b ? b + "px" : "";
        if (l += b || r, b || (a = !1), c)
          c.style.width != w && (c.style.width = w), c = c.nextSibling;
        else {
          const D = document.createElement("col");
          D.style.width = w, t.appendChild(D);
        }
      }
    }
    for (; c; ) {
      var d;
      const h = c.nextSibling;
      (d = c.parentNode) === null || d === void 0 || d.removeChild(c), c = h;
    }
    a ? (n.style.width = l + "px", n.style.minWidth = "") : (n.style.width = "", n.style.minWidth = l + "px");
  }
}
const be = new Ut("tableColumnResizing");
function m1({ handleWidth: i = 5, cellMinWidth: t = 25, defaultCellMinWidth: n = 100, View: r = p1, lastColumnResizable: s = !0 } = {}) {
  const o = new xe({
    key: be,
    state: {
      init(l, a) {
        var c;
        const u = (c = o.spec) === null || c === void 0 || (c = c.props) === null || c === void 0 ? void 0 : c.nodeViews, d = ue(a.schema).table.name;
        return r && u && (u[d] = (h, f) => new r(h, n, f)), new g1(-1, !1);
      },
      apply(l, a) {
        return a.apply(l);
      }
    },
    props: {
      attributes: (l) => {
        const a = be.getState(l);
        return a && a.activeHandle > -1 ? { class: "resize-cursor" } : {};
      },
      handleDOMEvents: {
        mousemove: (l, a) => {
          y1(l, a, i, s);
        },
        mouseleave: (l) => {
          b1(l);
        },
        mousedown: (l, a) => {
          v1(l, a, t, n);
        }
      },
      decorations: (l) => {
        const a = be.getState(l);
        if (a && a.activeHandle > -1) return C1(l, a.activeHandle);
      },
      nodeViews: {}
    }
  });
  return o;
}
var g1 = class ci {
  constructor(t, n) {
    this.activeHandle = t, this.dragging = n;
  }
  apply(t) {
    const n = this, r = t.getMeta(be);
    if (r && r.setHandle != null) return new ci(r.setHandle, !1);
    if (r && r.setDragging !== void 0) return new ci(n.activeHandle, r.setDragging);
    if (n.activeHandle > -1 && t.docChanged) {
      let s = t.mapping.map(n.activeHandle, -1);
      return Nr(t.doc.resolve(s)) || (s = -1), new ci(s, n.dragging);
    }
    return n;
  }
};
function y1(i, t, n, r) {
  if (!i.editable) return;
  const s = be.getState(i.state);
  if (s && !s.dragging) {
    const o = x1(t.target);
    let l = -1;
    if (o) {
      const { left: a, right: c } = o.getBoundingClientRect();
      t.clientX - a <= n ? l = go(i, t, "left", n) : c - t.clientX <= n && (l = go(i, t, "right", n));
    }
    if (l != s.activeHandle) {
      if (!r && l !== -1) {
        const a = i.state.doc.resolve(l), c = a.node(-1), u = $.get(c), d = a.start(-1);
        if (u.colCount(a.pos - d) + a.nodeAfter.attrs.colspan - 1 == u.width - 1) return;
      }
      Yl(i, l);
    }
  }
}
function b1(i) {
  if (!i.editable) return;
  const t = be.getState(i.state);
  t && t.activeHandle > -1 && !t.dragging && Yl(i, -1);
}
function v1(i, t, n, r) {
  var s;
  if (!i.editable) return !1;
  const o = (s = i.dom.ownerDocument.defaultView) !== null && s !== void 0 ? s : window, l = be.getState(i.state);
  if (!l || l.activeHandle == -1 || l.dragging) return !1;
  const a = i.state.doc.nodeAt(l.activeHandle), c = w1(i, l.activeHandle, a.attrs);
  i.dispatch(i.state.tr.setMeta(be, { setDragging: {
    startX: t.clientX,
    startWidth: c
  } }));
  function u(h) {
    o.removeEventListener("mouseup", u), o.removeEventListener("mousemove", d);
    const f = be.getState(i.state);
    f?.dragging && (k1(i, f.activeHandle, yo(f.dragging, h, n)), i.dispatch(i.state.tr.setMeta(be, { setDragging: null })));
  }
  function d(h) {
    if (!h.which) return u(h);
    const f = be.getState(i.state);
    if (f && f.dragging) {
      const p = yo(f.dragging, h, n);
      bo(i, f.activeHandle, p, r);
    }
  }
  return bo(i, l.activeHandle, c, r), o.addEventListener("mouseup", u), o.addEventListener("mousemove", d), t.preventDefault(), !0;
}
function w1(i, t, { colspan: n, colwidth: r }) {
  const s = r && r[r.length - 1];
  if (s) return s;
  const o = i.domAtPos(t);
  let l = o.node.childNodes[o.offset].offsetWidth, a = n;
  if (r)
    for (let c = 0; c < n; c++) r[c] && (l -= r[c], a--);
  return l / a;
}
function x1(i) {
  for (; i && i.nodeName != "TD" && i.nodeName != "TH"; ) i = i.classList && i.classList.contains("ProseMirror") ? null : i.parentNode;
  return i;
}
function go(i, t, n, r) {
  const s = n == "right" ? -r : r, o = i.posAtCoords({
    left: t.clientX + s,
    top: t.clientY
  });
  if (!o) return -1;
  const { pos: l } = o, a = an(i.state.doc.resolve(l));
  if (!a) return -1;
  if (n == "right") return a.pos;
  const c = $.get(a.node(-1)), u = a.start(-1), d = c.map.indexOf(a.pos - u);
  return d % c.width == 0 ? -1 : u + c.map[d - 1];
}
function yo(i, t, n) {
  const r = t.clientX - i.startX;
  return Math.max(n, i.startWidth + r);
}
function Yl(i, t) {
  i.dispatch(i.state.tr.setMeta(be, { setHandle: t }));
}
function k1(i, t, n) {
  const r = i.state.doc.resolve(t), s = r.node(-1), o = $.get(s), l = r.start(-1), a = o.colCount(r.pos - l) + r.nodeAfter.attrs.colspan - 1, c = i.state.tr;
  for (let u = 0; u < o.height; u++) {
    const d = u * o.width + a;
    if (u && o.map[d] == o.map[d - o.width]) continue;
    const h = o.map[d], f = s.nodeAt(h).attrs, p = f.colspan == 1 ? 0 : a - o.colCount(h);
    if (f.colwidth && f.colwidth[p] == n) continue;
    const m = f.colwidth ? f.colwidth.slice() : S1(f.colspan);
    m[p] = n, c.setNodeMarkup(l + h, null, {
      ...f,
      colwidth: m
    });
  }
  c.docChanged && i.dispatch(c);
}
function bo(i, t, n, r) {
  const s = i.state.doc.resolve(t), o = s.node(-1), l = s.start(-1), a = $.get(o).colCount(s.pos - l) + s.nodeAfter.attrs.colspan - 1;
  let c = i.domAtPos(s.start(-1)).node;
  for (; c && c.nodeName != "TABLE"; ) c = c.parentNode;
  c && Or(o, c.firstChild, c, r, a, n);
}
function S1(i) {
  return Array(i).fill(0);
}
function C1(i, t) {
  const n = [], r = i.doc.resolve(t), s = r.node(-1);
  if (!s) return H.empty;
  const o = $.get(s), l = r.start(-1), a = o.colCount(r.pos - l) + r.nodeAfter.attrs.colspan - 1;
  for (let u = 0; u < o.height; u++) {
    const d = a + u * o.width;
    if ((a == o.width - 1 || o.map[d] != o.map[d + 1]) && (u == 0 || o.map[d] != o.map[d - o.width])) {
      var c;
      const h = o.map[d], f = l + h + s.nodeAt(h).nodeSize - 1, p = document.createElement("div");
      p.className = "column-resize-handle", !((c = be.getState(i)) === null || c === void 0) && c.dragging && n.push(le.node(l + h, l + h + s.nodeAt(h).nodeSize, { class: "column-resize-dragging" })), n.push(le.widget(f, p));
    }
  }
  return H.create(i.doc, n);
}
function M1({ allowTableNodeSelection: i = !1 } = {}) {
  return new xe({
    key: lt,
    state: {
      init() {
        return null;
      },
      apply(t, n) {
        const r = t.getMeta(lt);
        if (r != null) return r == -1 ? null : r;
        if (n == null || !t.docChanged) return n;
        const { deleted: s, pos: o } = t.mapping.mapResult(n);
        return s ? null : o;
      }
    },
    props: {
      decorations: _d,
      handleDOMEvents: { mousedown: f1 },
      createSelectionBetween(t) {
        return lt.getState(t.state) != null ? t.state.selection : null;
      },
      handleTripleClick: d1,
      handleKeyDown: u1,
      handlePaste: h1
    },
    appendTransaction(t, n, r) {
      return Xd(r, Gd(r, n), i);
    }
  });
}
const Gl = (i, t) => i.selection.empty ? !1 : (t && t(i.tr.deleteSelection().scrollIntoView()), !0);
function E1(i, t) {
  let { $cursor: n } = i.selection;
  return !n || (t ? !t.endOfTextblock("backward", i) : n.parentOffset > 0) ? null : n;
}
const N1 = (i, t, n) => {
  let r = E1(i, n);
  if (!r)
    return !1;
  let s = Zl(r);
  if (!s) {
    let l = r.blockRange(), a = l && Di(l);
    return a == null ? !1 : (t && t(i.tr.lift(l, a).scrollIntoView()), !0);
  }
  let o = s.nodeBefore;
  if (ea(i, s, t, -1))
    return !0;
  if (r.parent.content.size == 0 && (cn(o, "end") || A.isSelectable(o)))
    for (let l = r.depth; ; l--) {
      let a = Rr(i.doc, r.before(l), r.after(l), k.empty);
      if (a && a.slice.size < a.to - a.from) {
        if (t) {
          let c = i.tr.step(a);
          c.setSelection(cn(o, "end") ? q.findFrom(c.doc.resolve(c.mapping.map(s.pos, -1)), -1) : A.create(c.doc, s.pos - o.nodeSize)), t(c.scrollIntoView());
        }
        return !0;
      }
      if (l == 1 || r.node(l - 1).childCount > 1)
        break;
    }
  return o.isAtom && s.depth == r.depth - 1 ? (t && t(i.tr.delete(s.pos - o.nodeSize, s.pos).scrollIntoView()), !0) : !1;
};
function cn(i, t, n = !1) {
  for (let r = i; r; r = t == "start" ? r.firstChild : r.lastChild) {
    if (r.isTextblock)
      return !0;
    if (n && r.childCount != 1)
      return !1;
  }
  return !1;
}
const T1 = (i, t, n) => {
  let { $head: r, empty: s } = i.selection, o = r;
  if (!s)
    return !1;
  if (r.parent.isTextblock) {
    if (n ? !n.endOfTextblock("backward", i) : r.parentOffset > 0)
      return !1;
    o = Zl(r);
  }
  let l = o && o.nodeBefore;
  return !l || !A.isSelectable(l) ? !1 : (t && t(i.tr.setSelection(A.create(i.doc, o.pos - l.nodeSize)).scrollIntoView()), !0);
};
function Zl(i) {
  if (!i.parent.type.spec.isolating)
    for (let t = i.depth - 1; t >= 0; t--) {
      if (i.index(t) > 0)
        return i.doc.resolve(i.before(t + 1));
      if (i.node(t).type.spec.isolating)
        break;
    }
  return null;
}
function A1(i, t) {
  let { $cursor: n } = i.selection;
  return !n || (t ? !t.endOfTextblock("forward", i) : n.parentOffset < n.parent.content.size) ? null : n;
}
const O1 = (i, t, n) => {
  let r = A1(i, n);
  if (!r)
    return !1;
  let s = Ql(r);
  if (!s)
    return !1;
  let o = s.nodeAfter;
  if (ea(i, s, t, 1))
    return !0;
  if (r.parent.content.size == 0 && (cn(o, "start") || A.isSelectable(o))) {
    let l = Rr(i.doc, r.before(), r.after(), k.empty);
    if (l && l.slice.size < l.to - l.from) {
      if (t) {
        let a = i.tr.step(l);
        a.setSelection(cn(o, "start") ? q.findFrom(a.doc.resolve(a.mapping.map(s.pos)), 1) : A.create(a.doc, a.mapping.map(s.pos))), t(a.scrollIntoView());
      }
      return !0;
    }
  }
  return o.isAtom && s.depth == r.depth - 1 ? (t && t(i.tr.delete(s.pos, s.pos + o.nodeSize).scrollIntoView()), !0) : !1;
}, q1 = (i, t, n) => {
  let { $head: r, empty: s } = i.selection, o = r;
  if (!s)
    return !1;
  if (r.parent.isTextblock) {
    if (n ? !n.endOfTextblock("forward", i) : r.parentOffset < r.parent.content.size)
      return !1;
    o = Ql(r);
  }
  let l = o && o.nodeAfter;
  return !l || !A.isSelectable(l) ? !1 : (t && t(i.tr.setSelection(A.create(i.doc, o.pos)).scrollIntoView()), !0);
};
function Ql(i) {
  if (!i.parent.type.spec.isolating)
    for (let t = i.depth - 1; t >= 0; t--) {
      let n = i.node(t);
      if (i.index(t) + 1 < n.childCount)
        return i.doc.resolve(i.after(t + 1));
      if (n.type.spec.isolating)
        break;
    }
  return null;
}
const D1 = (i, t) => {
  let { $from: n, $to: r } = i.selection, s = n.blockRange(r), o = s && Di(s);
  return o == null ? !1 : (t && t(i.tr.lift(s, o).scrollIntoView()), !0);
}, z1 = (i, t) => {
  let { $head: n, $anchor: r } = i.selection;
  return !n.parent.type.spec.code || !n.sameParent(r) ? !1 : (t && t(i.tr.insertText(`
`).scrollIntoView()), !0);
};
function Xr(i) {
  for (let t = 0; t < i.edgeCount; t++) {
    let { type: n } = i.edge(t);
    if (n.isTextblock && !n.hasRequiredAttrs())
      return n;
  }
  return null;
}
const R1 = (i, t) => {
  let { $head: n, $anchor: r } = i.selection;
  if (!n.parent.type.spec.code || !n.sameParent(r))
    return !1;
  let s = n.node(-1), o = n.indexAfter(-1), l = Xr(s.contentMatchAt(o));
  if (!l || !s.canReplaceWith(o, o, l))
    return !1;
  if (t) {
    let a = n.after(), c = i.tr.replaceWith(a, a, l.createAndFill());
    c.setSelection(q.near(c.doc.resolve(a), 1)), t(c.scrollIntoView());
  }
  return !0;
}, I1 = (i, t) => {
  let n = i.selection, { $from: r, $to: s } = n;
  if (n instanceof pe || r.parent.inlineContent || s.parent.inlineContent)
    return !1;
  let o = Xr(s.parent.contentMatchAt(s.indexAfter()));
  if (!o || !o.isTextblock)
    return !1;
  if (t) {
    let l = (!r.parentOffset && s.index() < s.parent.childCount ? r : s).pos, a = i.tr.insert(l, o.createAndFill());
    a.setSelection(L.create(a.doc, l + 1)), t(a.scrollIntoView());
  }
  return !0;
}, L1 = (i, t) => {
  let { $cursor: n } = i.selection;
  if (!n || n.parent.content.size)
    return !1;
  if (n.depth > 1 && n.after() != n.end(-1)) {
    let o = n.before();
    if (Tn(i.doc, o))
      return t && t(i.tr.split(o).scrollIntoView()), !0;
  }
  let r = n.blockRange(), s = r && Di(r);
  return s == null ? !1 : (t && t(i.tr.lift(r, s).scrollIntoView()), !0);
};
function B1(i) {
  return (t, n) => {
    let { $from: r, $to: s } = t.selection;
    if (t.selection instanceof A && t.selection.node.isBlock)
      return !r.parentOffset || !Tn(t.doc, r.pos) ? !1 : (n && n(t.tr.split(r.pos).scrollIntoView()), !0);
    if (!r.depth)
      return !1;
    let o = [], l, a, c = !1, u = !1;
    for (let p = r.depth; ; p--)
      if (r.node(p).isBlock) {
        c = r.end(p) == r.pos + (r.depth - p), u = r.start(p) == r.pos - (r.depth - p), a = Xr(r.node(p - 1).contentMatchAt(r.indexAfter(p - 1))), o.unshift(c && a ? { type: a } : null), l = p;
        break;
      } else {
        if (p == 1)
          return !1;
        o.unshift(null);
      }
    let d = t.tr;
    (t.selection instanceof L || t.selection instanceof pe) && d.deleteSelection();
    let h = d.mapping.map(r.pos), f = Tn(d.doc, h, o.length, o);
    if (f || (o[0] = a ? { type: a } : null, f = Tn(d.doc, h, o.length, o)), !f)
      return !1;
    if (d.split(h, o.length, o), !c && u && r.node(l).type != a) {
      let p = d.mapping.map(r.before(l)), m = d.doc.resolve(p);
      a && r.node(l - 1).canReplaceWith(m.index(), m.index() + 1, a) && d.setNodeMarkup(d.mapping.map(r.before(l)), a);
    }
    return n && n(d.scrollIntoView()), !0;
  };
}
const P1 = B1(), F1 = (i, t) => {
  let { $from: n, to: r } = i.selection, s, o = n.sharedDepth(r);
  return o == 0 ? !1 : (s = n.before(o), t && t(i.tr.setSelection(A.create(i.doc, s))), !0);
}, V1 = (i, t) => (t && t(i.tr.setSelection(new pe(i.doc))), !0);
function H1(i, t, n) {
  let r = t.nodeBefore, s = t.nodeAfter, o = t.index();
  return !r || !s || !r.type.compatibleContent(s.type) ? !1 : !r.content.size && t.parent.canReplace(o - 1, o) ? (n && n(i.tr.delete(t.pos - r.nodeSize, t.pos).scrollIntoView()), !0) : !t.parent.canReplace(o, o + 1) || !(s.isTextblock || Zo(i.doc, t.pos)) ? !1 : (n && n(i.tr.join(t.pos).scrollIntoView()), !0);
}
function ea(i, t, n, r) {
  let s = t.nodeBefore, o = t.nodeAfter, l, a, c = s.type.spec.isolating || o.type.spec.isolating;
  if (!c && H1(i, t, n))
    return !0;
  let u = !c && t.parent.canReplace(t.index(), t.index() + 1);
  if (u && (l = (a = s.contentMatchAt(s.childCount)).findWrapping(o.type)) && a.matchType(l[0] || o.type).validEnd) {
    if (n) {
      let p = t.pos + o.nodeSize, m = x.empty;
      for (let w = l.length - 1; w >= 0; w--)
        m = x.from(l[w].create(null, m));
      m = x.from(s.copy(m));
      let y = i.tr.step(new fe(t.pos - 1, p, t.pos, p, new k(m, 1, 0), l.length, !0)), b = y.doc.resolve(p + 2 * l.length);
      b.nodeAfter && b.nodeAfter.type == s.type && Zo(y.doc, b.pos) && y.join(b.pos), n(y.scrollIntoView());
    }
    return !0;
  }
  let d = o.type.spec.isolating || r > 0 && c ? null : q.findFrom(t, 1), h = d && d.$from.blockRange(d.$to), f = h && Di(h);
  if (f != null && f >= t.depth)
    return n && n(i.tr.lift(h, f).scrollIntoView()), !0;
  if (u && cn(o, "start", !0) && cn(s, "end")) {
    let p = s, m = [];
    for (; m.push(p), !p.isTextblock; )
      p = p.lastChild;
    let y = o, b = 1;
    for (; !y.isTextblock; y = y.firstChild)
      b++;
    if (p.canReplace(p.childCount, p.childCount, y.content)) {
      if (n) {
        let w = x.empty;
        for (let B = m.length - 1; B >= 0; B--)
          w = x.from(m[B].copy(w));
        let D = i.tr.step(new fe(t.pos - m.length, t.pos + o.nodeSize, t.pos + b, t.pos + o.nodeSize - b, new k(w, m.length, 0), 0, !0));
        n(D.scrollIntoView());
      }
      return !0;
    }
  }
  return !1;
}
function ta(i) {
  return function(t, n) {
    let r = t.selection, s = i < 0 ? r.$from : r.$to, o = s.depth;
    for (; s.node(o).isInline; ) {
      if (!o)
        return !1;
      o--;
    }
    return s.node(o).isTextblock ? (n && n(t.tr.setSelection(L.create(t.doc, i < 0 ? s.start(o) : s.end(o)))), !0) : !1;
  };
}
const $1 = ta(-1), W1 = ta(1);
function U1(i, t = null) {
  return function(n, r) {
    let { $from: s, $to: o } = n.selection, l = s.blockRange(o), a = l && Xo(l, i, t);
    return a ? (r && r(n.tr.wrap(l, a).scrollIntoView()), !0) : !1;
  };
}
function Mt(i, t = null) {
  return function(n, r) {
    let s = !1;
    for (let o = 0; o < n.selection.ranges.length && !s; o++) {
      let { $from: { pos: l }, $to: { pos: a } } = n.selection.ranges[o];
      n.doc.nodesBetween(l, a, (c, u) => {
        if (s)
          return !1;
        if (!(!c.isTextblock || c.hasMarkup(i, t)))
          if (c.type == i)
            s = !0;
          else {
            let d = n.doc.resolve(u), h = d.index();
            s = d.parent.canReplaceWith(h, h + 1, i);
          }
      });
    }
    if (!s)
      return !1;
    if (r) {
      let o = n.tr;
      for (let l = 0; l < n.selection.ranges.length; l++) {
        let { $from: { pos: a }, $to: { pos: c } } = n.selection.ranges[l];
        o.setBlockType(a, c, i, t);
      }
      r(o.scrollIntoView());
    }
    return !0;
  };
}
function j1(i, t, n, r) {
  for (let s = 0; s < t.length; s++) {
    let { $from: o, $to: l } = t[s], a = o.depth == 0 ? i.inlineContent && i.type.allowsMarkType(n) : !1;
    if (i.nodesBetween(o.pos, l.pos, (c, u) => {
      if (a)
        return !1;
      a = c.inlineContent && c.type.allowsMarkType(n);
    }), a)
      return !0;
  }
  return !1;
}
function xt(i, t = null, n) {
  return function(r, s) {
    let { empty: o, $cursor: l, ranges: a } = r.selection;
    if (o && !l || !j1(r.doc, a, i))
      return !1;
    if (s)
      if (l)
        i.isInSet(r.storedMarks || l.marks()) ? s(r.tr.removeStoredMark(i)) : s(r.tr.addStoredMark(i.create(t)));
      else {
        let c, u = r.tr;
        c = !a.some((d) => r.doc.rangeHasMark(d.$from.pos, d.$to.pos, i));
        for (let d = 0; d < a.length; d++) {
          let { $from: h, $to: f } = a[d];
          if (!c)
            u.removeMark(h.pos, f.pos, i);
          else {
            let p = h.pos, m = f.pos, y = h.nodeAfter, b = f.nodeBefore, w = y && y.isText ? /^\s*/.exec(y.text)[0].length : 0, D = b && b.isText ? /\s*$/.exec(b.text)[0].length : 0;
            p + w < m && (p += w, m -= D), u.addMark(p, m, i.create(t));
          }
        }
        s(u.scrollIntoView());
      }
    return !0;
  };
}
function Yr(...i) {
  return function(t, n, r) {
    for (let s = 0; s < i.length; s++)
      if (i[s](t, n, r))
        return !0;
    return !1;
  };
}
let sr = Yr(Gl, N1, T1), vo = Yr(Gl, O1, q1);
const _e = {
  Enter: Yr(z1, I1, L1, P1),
  "Mod-Enter": R1,
  Backspace: sr,
  "Mod-Backspace": sr,
  "Shift-Backspace": sr,
  Delete: vo,
  "Mod-Delete": vo,
  "Mod-a": V1
}, na = {
  "Ctrl-h": _e.Backspace,
  "Alt-Backspace": _e["Mod-Backspace"],
  "Ctrl-d": _e.Delete,
  "Ctrl-Alt-Backspace": _e["Mod-Delete"],
  "Alt-Delete": _e["Mod-Delete"],
  "Alt-d": _e["Mod-Delete"],
  "Ctrl-a": $1,
  "Ctrl-e": W1
};
for (let i in _e)
  na[i] = _e[i];
const _1 = typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform ? os.platform() == "darwin" : !1, K1 = _1 ? na : _e;
var Mi = 200, K = function() {
};
K.prototype.append = function(t) {
  return t.length ? (t = K.from(t), !this.length && t || t.length < Mi && this.leafAppend(t) || this.length < Mi && t.leafPrepend(this) || this.appendInner(t)) : this;
};
K.prototype.prepend = function(t) {
  return t.length ? K.from(t).append(this) : this;
};
K.prototype.appendInner = function(t) {
  return new J1(this, t);
};
K.prototype.slice = function(t, n) {
  return t === void 0 && (t = 0), n === void 0 && (n = this.length), t >= n ? K.empty : this.sliceInner(Math.max(0, t), Math.min(this.length, n));
};
K.prototype.get = function(t) {
  if (!(t < 0 || t >= this.length))
    return this.getInner(t);
};
K.prototype.forEach = function(t, n, r) {
  n === void 0 && (n = 0), r === void 0 && (r = this.length), n <= r ? this.forEachInner(t, n, r, 0) : this.forEachInvertedInner(t, n, r, 0);
};
K.prototype.map = function(t, n, r) {
  n === void 0 && (n = 0), r === void 0 && (r = this.length);
  var s = [];
  return this.forEach(function(o, l) {
    return s.push(t(o, l));
  }, n, r), s;
};
K.from = function(t) {
  return t instanceof K ? t : t && t.length ? new ia(t) : K.empty;
};
var ia = /* @__PURE__ */ (function(i) {
  function t(r) {
    i.call(this), this.values = r;
  }
  i && (t.__proto__ = i), t.prototype = Object.create(i && i.prototype), t.prototype.constructor = t;
  var n = { length: { configurable: !0 }, depth: { configurable: !0 } };
  return t.prototype.flatten = function() {
    return this.values;
  }, t.prototype.sliceInner = function(s, o) {
    return s == 0 && o == this.length ? this : new t(this.values.slice(s, o));
  }, t.prototype.getInner = function(s) {
    return this.values[s];
  }, t.prototype.forEachInner = function(s, o, l, a) {
    for (var c = o; c < l; c++)
      if (s(this.values[c], a + c) === !1)
        return !1;
  }, t.prototype.forEachInvertedInner = function(s, o, l, a) {
    for (var c = o - 1; c >= l; c--)
      if (s(this.values[c], a + c) === !1)
        return !1;
  }, t.prototype.leafAppend = function(s) {
    if (this.length + s.length <= Mi)
      return new t(this.values.concat(s.flatten()));
  }, t.prototype.leafPrepend = function(s) {
    if (this.length + s.length <= Mi)
      return new t(s.flatten().concat(this.values));
  }, n.length.get = function() {
    return this.values.length;
  }, n.depth.get = function() {
    return 0;
  }, Object.defineProperties(t.prototype, n), t;
})(K);
K.empty = new ia([]);
var J1 = /* @__PURE__ */ (function(i) {
  function t(n, r) {
    i.call(this), this.left = n, this.right = r, this.length = n.length + r.length, this.depth = Math.max(n.depth, r.depth) + 1;
  }
  return i && (t.__proto__ = i), t.prototype = Object.create(i && i.prototype), t.prototype.constructor = t, t.prototype.flatten = function() {
    return this.left.flatten().concat(this.right.flatten());
  }, t.prototype.getInner = function(r) {
    return r < this.left.length ? this.left.get(r) : this.right.get(r - this.left.length);
  }, t.prototype.forEachInner = function(r, s, o, l) {
    var a = this.left.length;
    if (s < a && this.left.forEachInner(r, s, Math.min(o, a), l) === !1 || o > a && this.right.forEachInner(r, Math.max(s - a, 0), Math.min(this.length, o) - a, l + a) === !1)
      return !1;
  }, t.prototype.forEachInvertedInner = function(r, s, o, l) {
    var a = this.left.length;
    if (s > a && this.right.forEachInvertedInner(r, s - a, Math.max(o, a) - a, l + a) === !1 || o < a && this.left.forEachInvertedInner(r, Math.min(s, a), o, l) === !1)
      return !1;
  }, t.prototype.sliceInner = function(r, s) {
    if (r == 0 && s == this.length)
      return this;
    var o = this.left.length;
    return s <= o ? this.left.slice(r, s) : r >= o ? this.right.slice(r - o, s - o) : this.left.slice(r, o).append(this.right.slice(0, s - o));
  }, t.prototype.leafAppend = function(r) {
    var s = this.right.leafAppend(r);
    if (s)
      return new t(this.left, s);
  }, t.prototype.leafPrepend = function(r) {
    var s = this.left.leafPrepend(r);
    if (s)
      return new t(s, this.right);
  }, t.prototype.appendInner = function(r) {
    return this.left.depth >= Math.max(this.right.depth, r.depth) + 1 ? new t(this.left, new t(this.right, r)) : new t(this, r);
  }, t;
})(K);
const X1 = 500;
class Oe {
  constructor(t, n) {
    this.items = t, this.eventCount = n;
  }
  // Pop the latest event off the branch's history and apply it
  // to a document transform.
  popEvent(t, n) {
    if (this.eventCount == 0)
      return null;
    let r = this.items.length;
    for (; ; r--)
      if (this.items.get(r - 1).selection) {
        --r;
        break;
      }
    let s, o;
    n && (s = this.remapping(r, this.items.length), o = s.maps.length);
    let l = t.tr, a, c, u = [], d = [];
    return this.items.forEach((h, f) => {
      if (!h.step) {
        s || (s = this.remapping(r, f + 1), o = s.maps.length), o--, d.push(h);
        return;
      }
      if (s) {
        d.push(new Re(h.map));
        let p = h.step.map(s.slice(o)), m;
        p && l.maybeStep(p).doc && (m = l.mapping.maps[l.mapping.maps.length - 1], u.push(new Re(m, void 0, void 0, u.length + d.length))), o--, m && s.appendMap(m, o);
      } else
        l.maybeStep(h.step);
      if (h.selection)
        return a = s ? h.selection.map(s.slice(o)) : h.selection, c = new Oe(this.items.slice(0, r).append(d.reverse().concat(u)), this.eventCount - 1), !1;
    }, this.items.length, 0), { remaining: c, transform: l, selection: a };
  }
  // Create a new branch with the given transform added.
  addTransform(t, n, r, s) {
    let o = [], l = this.eventCount, a = this.items, c = !s && a.length ? a.get(a.length - 1) : null;
    for (let d = 0; d < t.steps.length; d++) {
      let h = t.steps[d].invert(t.docs[d]), f = new Re(t.mapping.maps[d], h, n), p;
      (p = c && c.merge(f)) && (f = p, d ? o.pop() : a = a.slice(0, a.length - 1)), o.push(f), n && (l++, n = void 0), s || (c = f);
    }
    let u = l - r.depth;
    return u > G1 && (a = Y1(a, u), l -= u), new Oe(a.append(o), l);
  }
  remapping(t, n) {
    let r = new zn();
    return this.items.forEach((s, o) => {
      let l = s.mirrorOffset != null && o - s.mirrorOffset >= t ? r.maps.length - s.mirrorOffset : void 0;
      r.appendMap(s.map, l);
    }, t, n), r;
  }
  addMaps(t) {
    return this.eventCount == 0 ? this : new Oe(this.items.append(t.map((n) => new Re(n))), this.eventCount);
  }
  // When the collab module receives remote changes, the history has
  // to know about those, so that it can adjust the steps that were
  // rebased on top of the remote changes, and include the position
  // maps for the remote changes in its array of items.
  rebased(t, n) {
    if (!this.eventCount)
      return this;
    let r = [], s = Math.max(0, this.items.length - n), o = t.mapping, l = t.steps.length, a = this.eventCount;
    this.items.forEach((f) => {
      f.selection && a--;
    }, s);
    let c = n;
    this.items.forEach((f) => {
      let p = o.getMirror(--c);
      if (p == null)
        return;
      l = Math.min(l, p);
      let m = o.maps[p];
      if (f.step) {
        let y = t.steps[p].invert(t.docs[p]), b = f.selection && f.selection.map(o.slice(c + 1, p));
        b && a++, r.push(new Re(m, y, b));
      } else
        r.push(new Re(m));
    }, s);
    let u = [];
    for (let f = n; f < l; f++)
      u.push(new Re(o.maps[f]));
    let d = this.items.slice(0, s).append(u).append(r), h = new Oe(d, a);
    return h.emptyItemCount() > X1 && (h = h.compress(this.items.length - r.length)), h;
  }
  emptyItemCount() {
    let t = 0;
    return this.items.forEach((n) => {
      n.step || t++;
    }), t;
  }
  // Compressing a branch means rewriting it to push the air (map-only
  // items) out. During collaboration, these naturally accumulate
  // because each remote change adds one. The `upto` argument is used
  // to ensure that only the items below a given level are compressed,
  // because `rebased` relies on a clean, untouched set of items in
  // order to associate old items with rebased steps.
  compress(t = this.items.length) {
    let n = this.remapping(0, t), r = n.maps.length, s = [], o = 0;
    return this.items.forEach((l, a) => {
      if (a >= t)
        s.push(l), l.selection && o++;
      else if (l.step) {
        let c = l.step.map(n.slice(r)), u = c && c.getMap();
        if (r--, u && n.appendMap(u, r), c) {
          let d = l.selection && l.selection.map(n.slice(r));
          d && o++;
          let h = new Re(u.invert(), c, d), f, p = s.length - 1;
          (f = s.length && s[p].merge(h)) ? s[p] = f : s.push(h);
        }
      } else l.map && r--;
    }, this.items.length, 0), new Oe(K.from(s.reverse()), o);
  }
}
Oe.empty = new Oe(K.empty, 0);
function Y1(i, t) {
  let n;
  return i.forEach((r, s) => {
    if (r.selection && t-- == 0)
      return n = s, !1;
  }), i.slice(n);
}
class Re {
  constructor(t, n, r, s) {
    this.map = t, this.step = n, this.selection = r, this.mirrorOffset = s;
  }
  merge(t) {
    if (this.step && t.step && !t.selection) {
      let n = t.step.merge(this.step);
      if (n)
        return new Re(n.getMap().invert(), n, this.selection);
    }
  }
}
class st {
  constructor(t, n, r, s, o) {
    this.done = t, this.undone = n, this.prevRanges = r, this.prevTime = s, this.prevComposition = o;
  }
}
const G1 = 20;
function Z1(i, t, n, r) {
  let s = n.getMeta(Pt), o;
  if (s)
    return s.historyState;
  n.getMeta(th) && (i = new st(i.done, i.undone, null, 0, -1));
  let l = n.getMeta("appendedTransaction");
  if (n.steps.length == 0)
    return i;
  if (l && l.getMeta(Pt))
    return l.getMeta(Pt).redo ? new st(i.done.addTransform(n, void 0, r, ui(t)), i.undone, wo(n.mapping.maps), i.prevTime, i.prevComposition) : new st(i.done, i.undone.addTransform(n, void 0, r, ui(t)), null, i.prevTime, i.prevComposition);
  if (n.getMeta("addToHistory") !== !1 && !(l && l.getMeta("addToHistory") === !1)) {
    let a = n.getMeta("composition"), c = i.prevTime == 0 || !l && i.prevComposition != a && (i.prevTime < (n.time || 0) - r.newGroupDelay || !Q1(n, i.prevRanges)), u = l ? or(i.prevRanges, n.mapping) : wo(n.mapping.maps);
    return new st(i.done.addTransform(n, c ? t.selection.getBookmark() : void 0, r, ui(t)), Oe.empty, u, n.time, a ?? i.prevComposition);
  } else return (o = n.getMeta("rebased")) ? new st(i.done.rebased(n, o), i.undone.rebased(n, o), or(i.prevRanges, n.mapping), i.prevTime, i.prevComposition) : new st(i.done.addMaps(n.mapping.maps), i.undone.addMaps(n.mapping.maps), or(i.prevRanges, n.mapping), i.prevTime, i.prevComposition);
}
function Q1(i, t) {
  if (!t)
    return !1;
  if (!i.docChanged)
    return !0;
  let n = !1;
  return i.mapping.maps[0].forEach((r, s) => {
    for (let o = 0; o < t.length; o += 2)
      r <= t[o + 1] && s >= t[o] && (n = !0);
  }), n;
}
function wo(i) {
  let t = [];
  for (let n = i.length - 1; n >= 0 && t.length == 0; n--)
    i[n].forEach((r, s, o, l) => t.push(o, l));
  return t;
}
function or(i, t) {
  if (!i)
    return null;
  let n = [];
  for (let r = 0; r < i.length; r += 2) {
    let s = t.map(i[r], 1), o = t.map(i[r + 1], -1);
    s <= o && n.push(s, o);
  }
  return n;
}
function eh(i, t, n) {
  let r = ui(t), s = Pt.get(t).spec.config, o = (n ? i.undone : i.done).popEvent(t, r);
  if (!o)
    return null;
  let l = o.selection.resolve(o.transform.doc), a = (n ? i.done : i.undone).addTransform(o.transform, t.selection.getBookmark(), s, r), c = new st(n ? a : o.remaining, n ? o.remaining : a, null, 0, -1);
  return o.transform.setSelection(l).setMeta(Pt, { redo: n, historyState: c });
}
let lr = !1, xo = null;
function ui(i) {
  let t = i.plugins;
  if (xo != t) {
    lr = !1, xo = t;
    for (let n = 0; n < t.length; n++)
      if (t[n].spec.historyPreserveItems) {
        lr = !0;
        break;
      }
  }
  return lr;
}
const Pt = new Ut("history"), th = new Ut("closeHistory");
function nh(i = {}) {
  return i = {
    depth: i.depth || 100,
    newGroupDelay: i.newGroupDelay || 500
  }, new xe({
    key: Pt,
    state: {
      init() {
        return new st(Oe.empty, Oe.empty, null, 0, -1);
      },
      apply(t, n, r) {
        return Z1(n, r, t, i);
      }
    },
    config: i,
    props: {
      handleDOMEvents: {
        beforeinput(t, n) {
          let r = n.inputType, s = r == "historyUndo" ? Gr : r == "historyRedo" ? Ei : null;
          return !s || !t.editable ? !1 : (n.preventDefault(), s(t.state, t.dispatch));
        }
      }
    }
  });
}
function ra(i, t) {
  return (n, r) => {
    let s = Pt.getState(n);
    if (!s || (i ? s.undone : s.done).eventCount == 0)
      return !1;
    if (r) {
      let o = eh(s, n, i);
      o && r(t ? o.scrollIntoView() : o);
    }
    return !0;
  };
}
const Gr = ra(!1, !0), Ei = ra(!0, !0), N = {};
N.SAVE = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M292.571429 877.714286l438.857143 0 0-219.428571-438.857143 0 0 219.428571zm512 0l73.142857 0 0-512q0-8-5.714286-22t-11.428571-19.714286l-160.571429-160.571429q-5.714286-5.714286-19.428571-11.428571t-22.285714-5.714286l0 237.714286q0 22.857143-16 38.857143t-38.857143 16l-329.142857 0q-22.857143 0-38.857143-16t-16-38.857143l0-237.714286-73.142857 0 0 731.428571 73.142857 0 0-237.714286q0-22.857143 16-38.857143t38.857143-16l475.428571 0q22.857143 0 38.857143 16t16 38.857143l0 237.714286zm-219.428571-530.285714l0-182.857143q0-7.428571-5.428571-12.857143t-12.857143-5.428571l-109.714286 0q-7.428571 0-12.857143 5.428571t-5.428571 12.857143l0 182.857143q0 7.428571 5.428571 12.857143t12.857143 5.428571l109.714286 0q7.428571 0 12.857143-5.428571t5.428571-12.857143zm365.714286 18.285714l0 530.285714q0 22.857143-16 38.857143t-38.857143 16l-768 0q-22.857143 0-38.857143-16t-16-38.857143l0-768q0-22.857143 16-38.857143t38.857143-16l530.285714 0q22.857143 0 50.285714 11.428571t43.428571 27.428571l160 160q16 16 27.428571 43.428571t11.428571 50.285714z"></path></svg>';
N.CUT = '<svg aria-hidden="true" viewBox="0 0 1025 1024"><path d="M548.571429 512q14.857143 0 25.714286 10.857143t10.857143 25.714286-10.857143 25.714286-25.714286 10.857143-25.714286-10.857143-10.857143-25.714286 10.857143-25.714286 25.714286-10.857143zm171.428571 36.571429l289.714286 227.428571q16 11.428571 14.285714 32-2.857143 20-20 29.142857l-73.142857 36.571429q-7.428571 4-16.571429 4-9.714286 0-17.714286-4.571429l-394.285714-221.142857-62.857143 37.714286q-4.571429 2.285714-6.857143 2.857143 8 28 5.714286 55.428571-4 44-32 84.285714t-75.428571 70.571429q-75.428571 48-158.285714 48-77.714286 0-126.857143-44.571429-51.428571-48-45.142857-118.285714 4-43.428571 32-84t74.857143-70.857143q75.428571-48 158.857143-48 47.428571 0 86.285714 17.714286 5.142857-7.428571 12.571429-12.571429l69.714286-41.714286-69.714286-41.714286q-7.428571-5.142857-12.571429-12.571429-38.857143 17.714286-86.285714 17.714286-83.428571 0-158.857143-48-46.857143-30.285714-74.857143-70.857143t-32-84q-2.857143-33.714286 8.857143-64.571429t36.285714-53.142857q48.571429-45.142857 126.857143-45.142857 82.857143 0 158.285714 48 47.428571 29.714286 75.428571 70.285714t32 84.571429q2.285714 27.428571-5.714286 55.428571 2.285714 0.571429 6.857143 2.857143l62.857143 37.714286 394.285714-221.142857q8-4.571429 17.714286-4.571429 9.142857 0 16.571429 4l73.142857 36.571429q17.142857 9.142857 20 29.142857 1.714286 20.571429-14.285714 32zm-389.142857-148.571429q26.285714-24 12-61.714286t-60.571429-66.857143q-52.571429-33.714286-109.714286-33.714286-42.285714 0-64.571429 20.571429-26.285714 24-12 61.714286t60.571429 66.857143q52.571429 33.714286 109.714286 33.714286 42.285714 0 64.571429-20.571429zm-48.571429 425.714286q46.285714-29.142857 60.571429-66.857143t-12-61.714286q-22.285714-20.571429-64.571429-20.571429-57.142857 0-109.714286 33.714286-46.285714 29.142857-60.571429 66.857143t12 61.714286q22.285714 20.571429 64.571429 20.571429 57.142857 0 109.714286-33.714286zm101.714286-350.285714l54.857143 33.142857 0-6.285714q0-20.571429 18.857143-32l8-4.571429-45.142857-26.857143-14.857143 14.857143q-1.714286 1.714286-5.714286 6.285714t-6.857143 6.857143q-1.142857 1.142857-2.285714 2t-1.714286 1.428571zm128 128l54.857143 18.285714 420.571429-329.142857-73.142857-36.571429-438.857143 246.285714 0 64.571429-91.428571 54.857143 5.142857 4.571429q1.142857 1.142857 4 3.428571 2.285714 2.285714 6.285714 6.857143t6.285714 6.857143l14.857143 14.857143zm402.285714 237.714286l73.142857-36.571429-297.142857-233.142857-101.142857 78.857143q-1.142857 1.714286-7.428571 4z"></path></svg>';
N.COPY = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M969.142857 219.428571q22.857143 0 38.857143 16t16 38.857143l0 694.857143q0 22.857143-16 38.857143t-38.857143 16l-548.571429 0q-22.857143 0-38.857143-16t-16-38.857143l0-164.571429-310.857143 0q-22.857143 0-38.857143-16t-16-38.857143l0-384q0-22.857143 11.428571-50.285714t27.428571-43.428571l233.142857-233.142857q16-16 43.428571-27.428571t50.285714-11.428571l237.714286 0q22.857143 0 38.857143 16t16 38.857143l0 187.428571q38.857143-22.857143 73.142857-22.857143l237.714286 0zm-310.857143 121.714286l-170.857143 170.857143 170.857143 0 0-170.857143zm-365.714286-219.428571l-170.857143 170.857143 170.857143 0 0-170.857143zm112 369.714286l180.571429-180.571429 0-237.714286-219.428571 0 0 237.714286q0 22.857143-16 38.857143t-38.857143 16l-237.714286 0 0 365.714286 292.571429 0 0-146.285714q0-22.857143 11.428571-50.285714t27.428571-43.428571zm546.285714 459.428571l0-658.285714-219.428571 0 0 237.714286q0 22.857143-16 38.857143t-38.857143 16l-237.714286 0 0 365.714286 512 0z"></path></svg>';
N.PASTE = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M438.857143 950.857143l512 0 0-365.714286-237.714286 0q-22.857143 0-38.857143-16t-16-38.857143l0-237.714286-219.428571 0 0 658.285714zm146.285714-822.857143l0-36.571429q0-7.428571-5.428571-12.857143t-12.857143-5.428571l-402.285714 0q-7.428571 0-12.857143 5.428571t-5.428571 12.857143l0 36.571429q0 7.428571 5.428571 12.857143t12.857143 5.428571l402.285714 0q7.428571 0 12.857143-5.428571t5.428571-12.857143zm146.285714 384l170.857143 0-170.857143-170.857143 0 170.857143zm292.571429 73.142857l0 384q0 22.857143-16 38.857143t-38.857143 16l-548.571429 0q-22.857143 0-38.857143-16t-16-38.857143l0-91.428571-310.857143 0q-22.857143 0-38.857143-16t-16-38.857143l0-768q0-22.857143 16-38.857143t38.857143-16l621.714286 0q22.857143 0 38.857143 16t16 38.857143l0 187.428571q12 7.428571 20.571429 16l233.142857 233.142857q16 16 27.428571 43.428571t11.428571 50.285714z"></path></svg>';
N.STRONG = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M426.857143 869.142857q42.285714 18.285714 80 18.285714 214.857143 0 214.857143-191.428571 0-65.142857-23.428571-102.857143-15.428571-25.142857-35.142857-42.285714t-38.571429-26.571429-46-14.285714-48-6-54-1.142857q-41.714286 0-57.714286 5.714286 0 30.285714 2.857143 90.857143t2.857143 90.285714q0 4.571429-0.571429 38.571429t2.857143 55.142857 2.571429 47.714286 6.857143 38zm-8-426.285714q24 4 62.285714 4 46.857143 0 81.714286-7.428571t62.857143-25.428571 42.571429-51.142857 14.571429-81.142857q0-40-16.571429-70t-45.142857-46.857143-61.714286-24.857143-70.857143-8q-28.571429 0-74.285714 7.428571 0 28.571429 2.285714 86.285714t2.285714 86.857143q0 15.428571 2.857143 45.714286t2.857143 45.142857q0 26.285714 0.571429 39.428571zm-309.142857 508l1.142857-53.714286q8.571429-2.285714 48.571429-9.142857t60.571429-15.428571q4-6.857143 7.142857-15.428571t4.857143-19.142857 3.142857-18.571429 1.714286-21.428571 2.857143-19.428571l0-37.428571q0-561.142857-12.571429-585.714286-2.285714-4.571429-12.571429-8.285714t-25.428571-6.285714-28.285714-4-27.714286-2.571429-17.428571-1.714286l-2.285714-47.428571q56-1.142857 194.285714-6.571429t213.142857-5.428571q13.142857 0 39.142857 2.857143t38.571429 2.857143q40 0 78 7.428571t73.428571 24 61.714286 40.571429 42.285714 59.714286 16 78.571429q0 29.714286-9.428571 54.571429t-22.285714 41.142857-36.857143 32.857143-41.714286 25.714286-48 22.857143q88 20 146.571429 76.571429t58.571429 141.714286q0 57.142857-20 102.571429t-53.428571 74.571429-78.857143 48.857143-93.428571 27.714286-100.571429 8q-25.142857 0-75.428571-1.714286t-75.428571-1.714286q-60.571429 0-175.428571 6.285714t-132 6.857143z"></path></svg>';
N.ITALIC = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M219.428571 949.714286l9.714286-48.571429q3.428571-1.142857 46.571429-12.285714t63.714286-21.428571q16-20 23.428571-57.714286 0.571429-4 35.428571-165.142857t65.142857-310.571429 29.714286-169.428571l0-14.285714q-13.714286-7.428571-31.142857-10.571429t-39.714286-4.571429-33.142857-3.142857l10.857143-58.857143q18.857143 1.142857 68.571429 3.714286t85.428571 4 68.857143 1.428571q27.428571 0 56.285714-1.428571t69.142857-4 56.285714-3.714286q-2.857143 22.285714-10.857143 50.857143-17.142857 5.714286-58 16.285714t-62 19.142857q-4.571429 10.857143-8 24.285714t-5.142857 22.857143-4.285714 26-3.714286 24q-15.428571 84.571429-50 239.714286t-44.285714 203.142857q-1.142857 5.142857-7.428571 33.142857t-11.428571 51.428571-9.142857 47.714286-3.428571 32.857143l0.571429 10.285714q9.714286 2.285714 105.714286 17.714286-1.714286 25.142857-9.142857 56.571429-6.285714 0-18.571429 0.857143t-18.571429 0.857143q-16.571429 0-49.714286-5.714286t-49.142857-5.714286q-78.857143-1.142857-117.714286-1.142857-29.142857 0-81.714286 5.142857t-69.142857 6.285714z"></path></svg>';
N.UNDERLINE = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M100.571429 127.428571q-21.142857-1.142857-25.714286-2.285714l-1.714286-50.285714q7.428571-0.571429 22.857143-0.571429 34.285714 0 64 2.285714 75.428571 4 94.857143 4 49.142857 0 96-1.714286 66.285714-2.285714 83.428571-2.857143 32 0 49.142857-1.142857l-0.571429 8 1.142857 36.571429 0 5.142857q-34.285714 5.142857-70.857143 5.142857-34.285714 0-45.142857 14.285714-7.428571 8-7.428571 75.428571 0 7.428571 2.857143 18.571429t2.857143 14.571429l0.571429 130.857143 8 160q3.428571 70.857143 29.142857 115.428571 20 33.714286 54.857143 52.571429 50.285714 26.857143 101.142857 26.857143 59.428571 0 109.142857-16 32-10.285714 56.571429-29.142857 27.428571-20.571429 37.142857-36.571429 20.571429-32 30.285714-65.142857 12-41.714286 12-130.857143 0-45.142857-2-73.142857t-6.285714-70-7.714286-91.142857l-2.285714-33.714286q-2.857143-38.285714-13.714286-50.285714-19.428571-20-44-19.428571l-57.142857 1.142857-8-1.714286 1.142857-49.142857 48 0 117.142857 5.714286q43.428571 1.714286 112-5.714286l10.285714 1.142857q3.428571 21.714286 3.428571 29.142857 0 4-2.285714 17.714286-25.714286 6.857143-48 7.428571-41.714286 6.285714-45.142857 9.714286-8.571429 8.571429-8.571429 23.428571 0 4 0.857143 15.428571t0.857143 17.714286q4.571429 10.857143 12.571429 226.285714 3.428571 111.428571-8.571429 173.714286-8.571429 43.428571-23.428571 69.714286-21.714286 37.142857-64 70.285714-42.857143 32.571429-104 50.857143-62.285714 18.857143-145.714286 18.857143-95.428571 0-162.285714-26.285714-68-26.857143-102.285714-69.714286-34.857143-43.428571-47.428571-111.428571-9.142857-45.714286-9.142857-135.428571l0-190.285714q0-107.428571-9.714286-121.714286-14.285714-20.571429-84-22.285714zm850.285714 805.142857l0-36.571429q0-8-5.142857-13.142857t-13.142857-5.142857l-841.142857 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 36.571429q0 8 5.142857 13.142857t13.142857 5.142857l841.142857 0q8 0 13.142857-5.142857t5.142857-13.142857z"></path></svg>';
N.STRIKE = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M1005.714286 512q8 0 13.142857 5.142857t5.142857 13.142857l0 36.571429q0 8-5.142857 13.142857t-13.142857 5.142857l-987.428571 0q-8 0-13.142857-5.142857t-5.142857-13.142857l0-36.571429q0-8 5.142857-13.142857t13.142857-5.142857l987.428571 0zm-729.714286-36.571429q-16-20-29.142857-45.714286-27.428571-55.428571-27.428571-107.428571 0-103.428571 76.571429-176.571429 76-72.571429 224.571429-72.571429 28.571429 0 95.428571 10.857143 37.714286 6.857143 101.142857 27.428571 5.714286 21.714286 12 67.428571 8 70.285714 8 104.571429 0 10.285714-2.857143 25.714286l-6.857143 1.714286-48-3.428571-8-1.142857q-28.571429-85.142857-58.857143-117.142857-50.285714-52-120-52-65.142857 0-104 33.714286-38.285714 33.142857-38.285714 83.428571 0 41.714286 37.714286 80t159.428571 73.714286q39.428571 11.428571 98.857143 37.714286 33.142857 16 54.285714 29.714286l-424.571429 0zm289.714286 146.285714l234.857143 0q4 22.285714 4 52.571429 0 63.428571-23.428571 121.142857-13.142857 31.428571-40.571429 59.428571-21.142857 20-62.285714 46.285714-45.714286 27.428571-87.428571 37.714286-45.714286 12-116 12-65.142857 0-111.428571-13.142857l-80-22.857143q-32.571429-9.142857-41.142857-16-4.571429-4.571429-4.571429-12.571429l0-7.428571q0-61.714286-1.142857-89.142857-0.571429-17.142857 0-38.857143l1.142857-21.142857 0-25.142857 58.285714-1.142857q8.571429 19.428571 17.142857 40.571429t12.857143 32 7.142857 15.428571q20 32.571429 45.714286 53.714286 24.571429 20.571429 60 32.571429 33.714286 12.571429 75.428571 12.571429 36.571429 0 79.428571-15.428571 44-14.857143 69.714286-49.142857 26.857143-34.857143 26.857143-73.714286 0-48-46.285714-89.714286-19.428571-16.571429-78.285714-40.571429z"></path></svg>';
N.FORECOLOR = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M456.021333 0L163.157333 768h139.264l60.757334-179.2h297.642666l65.536 179.2h139.264L572.757333 0h-116.736zM512 163.157333l107.178667 318.464h-219.136L512 163.157333zM102.4 870.4v153.6h819.2v-153.6H102.4z m0 0"></path></svg>';
N.BACKCOLOR1 = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M0 0v1024h1024V0H0z m928 898.29376c0 16.39936-13.30688 29.70624-29.70624 29.70624h-237.72416c-16.41216 0-29.70624-13.30688-29.70624-29.70624v-29.72416c0-16.41216 13.29408-29.70624 29.70624-29.70624h65.8176l-61.85984-178.29376H359.47008l-61.85728 178.29376h65.8176c16.40704 0 29.71648 13.29408 29.71648 29.70624v29.72416c0 16.39936-13.30944 29.70624-29.71648 29.70624H125.71648c-16.41472 0-29.71648-13.30688-29.71648-29.70624v-29.72416c0-16.41216 13.30176-29.70624 29.71648-29.70624H187.5968l250.7264-722.87744a29.71136 29.71136 0 0 1 28.08064-19.98336h91.18976a29.71392 29.71392 0 0 1 28.09344 19.98336l250.72128 722.87744h61.88544c16.39936 0 29.70624 13.29408 29.70624 29.70624v29.72416z"></path><path d="M390.41024 571.43296h243.1744L512 221.00224z"></path></svg>';
N.BACKCOLOR = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M0 0v1024h1024V0H0z m960 928c0 17.67168-14.32832 32-32 32h-256c-17.67168 0-32-14.32832-32-32V896c0-17.67168 14.32832-32 32-32h70.88128l-66.61888-192H347.74016l-66.61888 192H352c17.67168 0 32 14.32832 32 32v32c0 17.67168-14.32832 32-32 32h-256c-17.67168 0-32-14.32832-32-32V896c0-17.67168 14.32832-32 32-32h66.63936L432.66048 85.51936A31.99744 31.99744 0 0 1 462.90176 64h98.19904A32 32 0 0 1 591.36 85.51936L861.36064 864H928c17.67168 0 32 14.32832 32 32v32z"></path><path d="M381.06112 576h261.87776L512 198.62016z"></path></svg>';
N.CLEAN = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M969.382408 288.738615l-319.401123-270.852152a67.074236 67.074236 0 0 0-96.459139 5.74922l-505.931379 574.922021a68.35184 68.35184 0 0 0-17.886463 47.910169 74.101061 74.101061 0 0 0 24.274486 47.910168l156.50655 132.232065h373.060512L975.131628 383.281347a67.074236 67.074236 0 0 0-5.74922-96.459139z m-440.134747 433.746725H264.144729l-90.071117-78.572676c-5.74922-5.74922-12.137243-12.137243-12.137243-17.886463a36.411728 36.411728 0 0 1 5.749221-24.274485l210.804741-240.828447 265.102932 228.691204z m-439.495945 180.781036h843.218964a60.047411 60.047411 0 1 1 0 120.733624H89.751716a60.047411 60.047411 0 1 1 0-120.733624z m0 0"></path></svg>';
N.QUOTE = '<svg aria-hidden="true" viewBox="0 0 640 896"><path d="M0 448v256h256v-256h-128c0 0 0-128 128-128v-128c0 0-256 0-256 256zM640 320v-128c0 0-256 0-256 256v256h256v-256h-128c0 0 0-128 128-128z"></path></svg>';
N.ALIGN = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M1024 768l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-950.857143 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l950.857143 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm0-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-950.857143 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l950.857143 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm0-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-950.857143 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l950.857143 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm0-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-950.857143 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l950.857143 0q14.857143 0 25.714286 10.857143t10.857143 25.714286z"></path></svg>';
N.ALIGNCENTER = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M1024 768l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-950.857143 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l950.857143 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm-219.428571-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-512 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l512 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm146.285714-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-804.571429 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l804.571429 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm-219.428571-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-365.714286 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l365.714286 0q14.857143 0 25.714286 10.857143t10.857143 25.714286z"></path></svg>';
N.ALIGNLEFT = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M1024 768l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-950.857143 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l950.857143 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm-219.428571-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-731.428571 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l731.428571 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm146.285714-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-877.714286 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l877.714286 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm-219.428571-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-658.285714 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l658.285714 0q14.857143 0 25.714286 10.857143t10.857143 25.714286z"></path></svg>';
N.ALIGNRIGHT = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M1024 768l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-950.857143 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l950.857143 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm0-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-731.428571 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l731.428571 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm0-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-877.714286 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l877.714286 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm0-219.428571l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-658.285714 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l658.285714 0q14.857143 0 25.714286 10.857143t10.857143 25.714286z"></path></svg>';
N.DEDENT = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M219.428571 310.857143l0 329.142857q0 7.428571-5.428571 12.857143t-12.857143 5.428571q-8 0-13.142857-5.142857l-164.571429-164.571429q-5.142857-5.142857-5.142857-13.142857t5.142857-13.142857l164.571429-164.571429q5.142857-5.142857 13.142857-5.142857 7.428571 0 12.857143 5.428571t5.428571 12.857143zm804.571429 438.857143l0 109.714286q0 7.428571-5.428571 12.857143t-12.857143 5.428571l-987.428571 0q-7.428571 0-12.857143-5.428571t-5.428571-12.857143l0-109.714286q0-7.428571 5.428571-12.857143t12.857143-5.428571l987.428571 0q7.428571 0 12.857143 5.428571t5.428571 12.857143zm0-219.428571l0 109.714286q0 7.428571-5.428571 12.857143t-12.857143 5.428571l-621.714286 0q-7.428571 0-12.857143-5.428571t-5.428571-12.857143l0-109.714286q0-7.428571 5.428571-12.857143t12.857143-5.428571l621.714286 0q7.428571 0 12.857143 5.428571t5.428571 12.857143zm0-219.428571l0 109.714286q0 7.428571-5.428571 12.857143t-12.857143 5.428571l-621.714286 0q-7.428571 0-12.857143-5.428571t-5.428571-12.857143l0-109.714286q0-7.428571 5.428571-12.857143t12.857143-5.428571l621.714286 0q7.428571 0 12.857143 5.428571t5.428571 12.857143zm0-219.428571l0 109.714286q0 7.428571-5.428571 12.857143t-12.857143 5.428571l-987.428571 0q-7.428571 0-12.857143-5.428571t-5.428571-12.857143l0-109.714286q0-7.428571 5.428571-12.857143t12.857143-5.428571l987.428571 0q7.428571 0 12.857143 5.428571t5.428571 12.857143z"></path></svg>';
N.INDENT = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M201.142857 475.428571q0 8-5.142857 13.142857l-164.571429 164.571429q-5.142857 5.142857-13.142857 5.142857-7.428571 0-12.857143-5.428571t-5.428571-12.857143l0-329.142857q0-7.428571 5.428571-12.857143t12.857143-5.428571q8 0 13.142857 5.142857l164.571429 164.571429q5.142857 5.142857 5.142857 13.142857zm822.857143 274.285714l0 109.714286q0 7.428571-5.428571 12.857143t-12.857143 5.428571l-987.428571 0q-7.428571 0-12.857143-5.428571t-5.428571-12.857143l0-109.714286q0-7.428571 5.428571-12.857143t12.857143-5.428571l987.428571 0q7.428571 0 12.857143 5.428571t5.428571 12.857143zm0-219.428571l0 109.714286q0 7.428571-5.428571 12.857143t-12.857143 5.428571l-621.714286 0q-7.428571 0-12.857143-5.428571t-5.428571-12.857143l0-109.714286q0-7.428571 5.428571-12.857143t12.857143-5.428571l621.714286 0q7.428571 0 12.857143 5.428571t5.428571 12.857143zm0-219.428571l0 109.714286q0 7.428571-5.428571 12.857143t-12.857143 5.428571l-621.714286 0q-7.428571 0-12.857143-5.428571t-5.428571-12.857143l0-109.714286q0-7.428571 5.428571-12.857143t12.857143-5.428571l621.714286 0q7.428571 0 12.857143 5.428571t5.428571 12.857143zm0-219.428571l0 109.714286q0 7.428571-5.428571 12.857143t-12.857143 5.428571l-987.428571 0q-7.428571 0-12.857143-5.428571t-5.428571-12.857143l0-109.714286q0-7.428571 5.428571-12.857143t12.857143-5.428571l987.428571 0q7.428571 0 12.857143 5.428571t5.428571 12.857143z"></path></svg>';
N.LINK = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M868.571429 694.857143q0-22.857143-16-38.857143l-118.857143-118.857143q-16-16-38.857143-16-24 0-41.142857 18.285714 1.714286 1.714286 10.857143 10.571429t12.285714 12.285714 8.571429 10.857143 7.428571 14.571429 2 15.714286q0 22.857143-16 38.857143t-38.857143 16q-8.571429 0-15.714286-2t-14.571429-7.428571-10.857143-8.571429-12.285714-12.285714-10.571429-10.857143q-18.857143 17.714286-18.857143 41.714286 0 22.857143 16 38.857143l117.714286 118.285714q15.428571 15.428571 38.857143 15.428571 22.857143 0 38.857143-14.857143l84-83.428571q16-16 16-38.285714zm-401.714286-402.857143q0-22.857143-16-38.857143l-117.714286-118.285714q-16-16-38.857143-16-22.285714 0-38.857143 15.428571l-84 83.428571q-16 16-16 38.285714 0 22.857143 16 38.857143l118.857143 118.857143q15.428571 15.428571 38.857143 15.428571 24 0 41.142857-17.714286-1.714286-1.714286-10.857143-10.571429t-12.285714-12.285714-8.571429-10.857143-7.428571-14.571429-2-15.714286q0-22.857143 16-38.857143t38.857143-16q8.571429 0 15.714286 2t14.571429 7.428571 10.857143 8.571429 12.285714 12.285714 10.571429 10.857143q18.857143-17.714286 18.857143-41.714286zm511.428571 402.857143q0 68.571429-48.571429 116l-84 83.428571q-47.428571 47.428571-116 47.428571-69.142857 0-116.571429-48.571429l-117.714286-118.285714q-47.428571-47.428571-47.428571-116 0-70.285714 50.285714-119.428571l-50.285714-50.285714q-49.142857 50.285714-118.857143 50.285714-68.571429 0-116.571429-48l-118.857143-118.857143q-48-48-48-116.571429t48.571429-116l84-83.428571q47.428571-47.428571 116-47.428571 69.142857 0 116.571429 48.571429l117.714286 118.285714q47.428571 47.428571 47.428571 116 0 70.285714-50.285714 119.428571l50.285714 50.285714q49.142857-50.285714 118.857143-50.285714 68.571429 0 116.571429 48l118.857143 118.857143q48 48 48 116.571429z"></path></svg>';
N.UNLINK = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M287.428571 726.285714l-146.285714 146.285714q-5.714286 5.142857-13.142857 5.142857-6.857143 0-13.142857-5.142857-5.142857-5.714286-5.142857-13.142857t5.142857-13.142857l146.285714-146.285714q5.714286-5.142857 13.142857-5.142857t13.142857 5.142857q5.142857 5.714286 5.142857 13.142857t-5.142857 13.142857zm96.571429 23.428571l0 182.857143q0 8-5.142857 13.142857t-13.142857 5.142857-13.142857-5.142857-5.142857-13.142857l0-182.857143q0-8 5.142857-13.142857t13.142857-5.142857 13.142857 5.142857 5.142857 13.142857zm-128-128q0 8-5.142857 13.142857t-13.142857 5.142857l-182.857143 0q-8 0-13.142857-5.142857t-5.142857-13.142857 5.142857-13.142857 13.142857-5.142857l182.857143 0q8 0 13.142857 5.142857t5.142857 13.142857zm722.285714 73.142857q0 68.571429-48.571429 116l-84 83.428571q-47.428571 47.428571-116 47.428571-69.142857 0-116.571429-48.571429l-190.857143-191.428571q-12-12-24-32l136.571429-10.285714 156 156.571429q15.428571 15.428571 38.857143 15.714286t38.857143-15.142857l84-83.428571q16-16 16-38.285714 0-22.857143-16-38.857143l-156.571429-157.142857 10.285714-136.571429q20 12 32 24l192 192q48 49.142857 48 116.571429zm-352.571429-413.714286l-136.571429 10.285714-156-156.571429q-16-16-38.857143-16-22.285714 0-38.857143 15.428571l-84 83.428571q-16 16-16 38.285714 0 22.857143 16 38.857143l156.571429 156.571429-10.285714 137.142857q-20-12-32-24l-192-192q-48-49.142857-48-116.571429 0-68.571429 48.571429-116l84-83.428571q47.428571-47.428571 116-47.428571 69.142857 0 116.571429 48.571429l190.857143 191.428571q12 12 24 32zm361.714286 48q0 8-5.142857 13.142857t-13.142857 5.142857l-182.857143 0q-8 0-13.142857-5.142857t-5.142857-13.142857 5.142857-13.142857 13.142857-5.142857l182.857143 0q8 0 13.142857 5.142857t5.142857 13.142857zm-310.857143-310.857143l0 182.857143q0 8-5.142857 13.142857t-13.142857 5.142857-13.142857-5.142857-5.142857-13.142857l0-182.857143q0-8 5.142857-13.142857t13.142857-5.142857 13.142857 5.142857 5.142857 13.142857zm232.571429 86.285714l-146.285714 146.285714q-6.285714 5.142857-13.142857 5.142857t-13.142857-5.142857q-5.142857-5.714286-5.142857-13.142857t5.142857-13.142857l146.285714-146.285714q5.714286-5.142857 13.142857-5.142857t13.142857 5.142857q5.142857 5.714286 5.142857 13.142857t-5.142857 13.142857z"></path></svg>';
N.ANCHOR = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M548.571429 146.285714q0-14.857143-10.857143-25.714286t-25.714286-10.857143-25.714286 10.857143-10.857143 25.714286 10.857143 25.714286 25.714286 10.857143 25.714286-10.857143 10.857143-25.714286zm475.428571 530.285714l0 201.142857q0 12.571429-11.428571 17.142857-4.571429 1.142857-6.857143 1.142857-7.428571 0-13.142857-5.142857l-53.142857-53.142857q-68 81.714286-182 129.428571t-245.428571 47.714286-245.428571-47.714286-182-129.428571l-53.142857 53.142857q-5.142857 5.142857-13.142857 5.142857-2.285714 0-6.857143-1.142857-11.428571-4.571429-11.428571-17.142857l0-201.142857q0-8 5.142857-13.142857t13.142857-5.142857l201.142857 0q12.571429 0 17.142857 11.428571 4.571429 10.857143-4 20l-57.142857 57.142857q38.285714 52 108.285714 87.714286t155.142857 47.142857l0-369.714286-109.714286 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l109.714286 0 0-93.142857q-33.142857-19.428571-53.142857-52.857143t-20-73.428571q0-60.571429 42.857143-103.428571t103.428571-42.857143 103.428571 42.857143 42.857143 103.428571q0 40-20 73.428571t-53.142857 52.857143l0 93.142857 109.714286 0q14.857143 0 25.714286 10.857143t10.857143 25.714286l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-109.714286 0 0 369.714286q85.142857-11.428571 155.142857-47.142857t108.285714-87.714286l-57.142857-57.142857q-8.571429-9.142857-4-20 4.571429-11.428571 17.142857-11.428571l201.142857 0q8 0 13.142857 5.142857t5.142857 13.142857z"></path></svg>';
N.TRASH = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M402.285714 420.571429l0 329.142857q0 8-5.142857 13.142857t-13.142857 5.142857l-36.571429 0q-8 0-13.142857-5.142857t-5.142857-13.142857l0-329.142857q0-8 5.142857-13.142857t13.142857-5.142857l36.571429 0q8 0 13.142857 5.142857t5.142857 13.142857zm146.285714 0l0 329.142857q0 8-5.142857 13.142857t-13.142857 5.142857l-36.571429 0q-8 0-13.142857-5.142857t-5.142857-13.142857l0-329.142857q0-8 5.142857-13.142857t13.142857-5.142857l36.571429 0q8 0 13.142857 5.142857t5.142857 13.142857zm146.285714 0l0 329.142857q0 8-5.142857 13.142857t-13.142857 5.142857l-36.571429 0q-8 0-13.142857-5.142857t-5.142857-13.142857l0-329.142857q0-8 5.142857-13.142857t13.142857-5.142857l36.571429 0q8 0 13.142857 5.142857t5.142857 13.142857zm73.142857 413.714286l0-541.714286-512 0 0 541.714286q0 12.571429 4 23.142857t8.285714 15.428571 6 4.857143l475.428571 0q1.714286 0 6-4.857143t8.285714-15.428571 4-23.142857zm-384-614.857143l256 0-27.428571-66.857143q-4-5.142857-9.714286-6.285714l-181.142857 0q-5.714286 1.142857-9.714286 6.285714zm530.285714 18.285714l0 36.571429q0 8-5.142857 13.142857t-13.142857 5.142857l-54.857143 0 0 541.714286q0 47.428571-26.857143 82t-64.571429 34.571429l-475.428571 0q-37.714286 0-64.571429-33.428571t-26.857143-80.857143l0-544-54.857143 0q-8 0-13.142857-5.142857t-5.142857-13.142857l0-36.571429q0-8 5.142857-13.142857t13.142857-5.142857l176.571429 0 40-95.428571q8.571429-21.142857 30.857143-36t45.142857-14.857143l182.857143 0q22.857143 0 45.142857 14.857143t30.857143 36l40 95.428571 176.571429 0q8 0 13.142857 5.142857t5.142857 13.142857z"></path></svg>';
N.IMAGE = '<svg aria-hidden="true" viewBox="0 0 1098 1024"><path d="M365.714286 329.142857q0 45.714286-32 77.714286t-77.714286 32-77.714286-32-32-77.714286 32-77.714286 77.714286-32 77.714286 32 32 77.714286zm585.142857 219.428571l0 256-804.571429 0 0-109.714286 182.857143-182.857143 91.428571 91.428571 292.571429-292.571429zm54.857143-402.285714l-914.285714 0q-7.428571 0-12.857143 5.428571t-5.428571 12.857143l0 694.857143q0 7.428571 5.428571 12.857143t12.857143 5.428571l914.285714 0q7.428571 0 12.857143-5.428571t5.428571-12.857143l0-694.857143q0-7.428571-5.428571-12.857143t-12.857143-5.428571zm91.428571 18.285714l0 694.857143q0 37.714286-26.857143 64.571429t-64.571429 26.857143l-914.285714 0q-37.714286 0-64.571429-26.857143t-26.857143-64.571429l0-694.857143q0-37.714286 26.857143-64.571429t64.571429-26.857143l914.285714 0q37.714286 0 64.571429 26.857143t26.857143 64.571429z"></path></svg>';
N.IMAGE_U = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M576 928H192c-52.992 0-96-43.093333-96-96V192c0-52.992 43.093333-96 96-96h640c52.992 0 96 43.093333 96 96v384.064c0 17.706667-14.293333 32-32 32s-32-14.293333-32-32V192.021333c0-17.706667-14.4-32-32-32H192c-17.706667 0-32 14.378667-32 32v639.957334c0 17.706667 14.4 32 32 32h384c17.706667 0 32 14.314667 32 32 0 17.706667-14.293333 32.021333-32 32.021333zM128 693.312a32.064 32.064 0 0 1-22.613333-54.698667l159.402666-159.338666a95.786667 95.786667 0 0 1 110.72-17.984l173.589334 86.805333c12.309333 6.186667 27.093333 3.797333 36.8-5.994667l287.402666-287.445333a32.042667 32.042667 0 0 1 45.290667 45.312L631.210667 587.392a95.786667 95.786667 0 0 1-110.72 18.005333l-173.589334-86.826666a31.616 31.616 0 0 0-36.8 6.016l-159.509333 159.317333c-6.186667 6.314667-14.4 9.386667-22.592 9.386667z m320-277.376c-52.906667 0-96-43.093333-96-96s43.093333-96.021333 96-96.021333 96 43.093333 96 96-43.093333 96.021333-96 96.021333z m0-128c-17.6 0-32 14.378667-32 32 0 17.6 14.4 32 32 32s32-14.4 32-32c0-17.621333-14.4-32-32-32zM768 928c-17.706667 0-32-14.293333-32-32v-192.021333c0-17.706667 14.293333-32 32-32s32 14.293333 32 32v192c0 17.706667-14.293333 32.021333-32 32.021333z m128-128c-7.893333 0-15.701333-2.922667-21.909333-8.725333L768 691.669333l-106.090667 99.712a31.936 31.936 0 0 1-45.226666-1.408 31.957333 31.957333 0 0 1 1.408-45.205333l112.213333-105.386667A48.554667 48.554667 0 0 1 768 621.44c14.72 0 28.501333 6.613333 37.696 17.92l112.213333 105.386667A31.957333 31.957333 0 0 1 896 800z"></path></svg>';
N.ULIST = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M76.00082,576.40071l146.00019,0l0,-148.80023l-146.00019,0l0,148.80023zm0,-297.60046l146.00019,0l0,-148.80023l-146.00019,0l0,148.80023zm0,595.20091l146.00019,0l0,-148.80023l-146.00019,0l0,148.80023zm292.00037,-297.60046l584.00074,0l0,-148.80023l-584.00074,0l0,148.80023zm0,-297.60046l584.00074,0l0,-148.80023l-584.00074,0l0,148.80023zm0,595.20091l584.00074,0l0,-148.80023l-584.00074,0l0,148.80023z"></path></svg>';
N.OLIST = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M431.8334,587.83157l554.16674,0l0,-163.94386l-554.16674,0l0,163.94386zm0,327.88773l554.16674,0l0,-163.94386l-554.16674,0l0,163.94386zm0,-819.71932l0,163.94386l554.16674,0l0,-163.94386l-554.16674,0zm-298.11202,327.88773l96.48439,0l0,-327.88773l-44.53126,0l-105.14324,29.45866l0,64.04057l53.19011,-2.56162l0,236.95012zm136.06773,263.84716c0,-46.10921 -14.84375,-99.90329 -118.75002,-99.90329c-40.82032,0 -79.16668,7.68487 -102.66928,20.49298l1.23698,84.53355c25.97657,-12.80811 51.95313,-19.21217 82.87761,-19.21217s39.58334,14.08893 39.58334,35.86272c0,33.3011 -37.10938,74.28706 -136.06773,143.45088l0,64.04057l237.50003,0l0,-85.81437l-112.56512,2.56162c60.61199,-38.42434 107.6172,-84.53355 107.6172,-144.73169l1.23698,-1.28081z"></path></svg>';
N.AUDIO = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M512 624.014222c93.895111 0 170.012444-75.207111 170.012444-168.021333V231.992889C682.012444 139.207111 605.866667 64 512 64s-170.012444 75.207111-170.012444 167.992889v224c0 92.814222 76.117333 168.021333 170.012444 168.021333z m330.012444-170.012444a8.021333 8.021333 0 0 0-8.021333-7.992889h-60.017778a8.021333 8.021333 0 0 0-7.964444 7.964444A253.980444 253.980444 0 0 1 512 707.982222a253.980444 253.980444 0 0 1-254.008889-254.008889 8.021333 8.021333 0 0 0-7.964444-7.964444H190.008889a8.021333 8.021333 0 0 0-8.021333 7.964444c0 168.732444 126.606222 307.911111 290.019555 327.623111v102.4h-145.322667c-13.681778 0-24.689778 14.307556-24.689777 32v36.010667c0 4.380444 2.816 7.992889 6.200889 7.992889h407.608888c3.413333 0 6.200889-3.612444 6.200889-7.992889v-36.010667c0-17.692444-11.008-32-24.689777-32h-149.333334v-101.888c165.319111-18.005333 294.030222-158.008889 294.030222-328.106666z"></path></svg>';
N.AUDIO_U = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="m629.86951,898.36701l-470.79428,0a33.30357,32.69724 0 0 1 -33.1854,-32.59177l0,-700.16401a33.30357,32.69724 0 0 1 33.1854,-32.59177l713.12609,0a33.30357,32.69724 0 0 1 33.19613,32.58122l0,463.80513l49.28928,0l0,-468.62533a77.57583,76.16348 0 0 0 -77.55434,-76.14239l-723.00973,0a77.55434,76.14239 0 0 0 -54.78974,22.29741a77.55434,76.14239 0 0 0 -22.73237,53.84498l0,709.84661a77.57583,76.16348 0 0 0 22.70014,53.86607a77.57583,76.16348 0 0 0 54.8542,22.31851l475.71462,0l0,-48.44466zm0,0"></path><path d="m712.48786,803.03276l240.17459,0l0,57.23486l-240.17459,0l0,-57.23486z"></path><path d="m806.97524,712.97285l51.21736,0l0,233.77715l-51.21736,0l0,-233.77715zm-287.15064,-133.7533a150.82095,137.67581 0 0 0 -73.28435,-16.54806c-73.28434,0 -133.07335,44.71042 -133.07335,99.9932s59.39735,99.99321 133.07335,99.99321s132.68171,-45.41524 132.68171,-98.58355l0,-292.58407a104.1468,95.06965 0 0 0 103.37468,-8.8052c18.90018,-9.85733 10.7985,-20.42971 0,-20.42971a259.61167,236.98462 0 0 1 -141.96953,-42.23841c-13.11487,-7.74287 -20.44442,-5.28108 -20.44442,5.63859l-0.35808,273.56401z"></path></svg>';
N.VIDEO = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="m209.4999,108l585.0001,0c96.92516,0 175.50003,68.83695 175.50003,153.75l0,512.49999c0,84.91305 -78.57487,153.75 -175.50003,153.75l-585.0001,0c-96.92516,0 -175.50003,-68.83695 -175.50003,-153.75l0,-512.49999c0,-84.91305 78.57487,-153.75 175.50003,-153.75zm188.71635,251.91834a56.59993,49.5854 0 0 0 -26.8164,-5.91835c-31.25773,0 -56.59993,22.2015 -56.59993,49.5854l0,228.81689c0,7.18115 1.7784,14.2762 5.2182,20.7952c13.11102,24.8624 46.74385,35.70485 75.12103,24.2187l261.18382,-105.7103a56.59993,49.5854 0 0 0 26.10738,-21.5209c14.8122,-24.1162 4.49982,-54.1856 -23.0256,-67.16005l-261.1885,-123.1066z"></path></svg>';
N.VIDEO_U = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M801.64478269 947.69722487c-14.11322323 0-25.50738533-11.39416211-25.50738534-25.50738534V679.54597568c0-14.11322323 11.39416211-25.50738533 25.50738534-25.50738533 14.11322323 0 25.50738533 11.39416211 25.50738532 25.50738533v242.51438543c0 14.24270295-11.39416211 25.63686506-25.50738532 25.63686376z"></path><path d="M654.81546478 800.86790826c0-13.20687039 10.7467661-23.95363649 23.95363649-23.95363649h245.62188311c13.20687039 0 23.95363649 10.7467661 23.95363648 23.95363649s-10.7467661 23.95363649-23.95363648 23.95363649H678.76910127c-13.20687039 0-23.95363649-10.7467661-23.95363649-23.95363649z"></path><path d="M606.77871338 948.60357902H251.48801792c-97.10933664 0-175.96211852-78.72330213-175.96211851-175.96211852V251.3585395c0-97.10933664 78.72330213-175.96211852 175.96211851-175.96211852h521.41240071c97.10933664 0 175.96211852 78.72330213 175.96211852 175.96211852v361.24673399c0 14.24270295-11.65312023 25.89582319-25.89582319 25.89582319s-25.89582319-11.65312023-25.89582319-25.89582319v-361.24673399c0-68.62393204-55.54654138-124.17047213-124.17047214-124.17047213H251.48801792c-68.62393204 0-124.17047213 55.54654138-124.17047212 124.17047213v521.41240071c0 68.62393204 55.54654138 124.17047213 124.17047212 124.17047213h355.29069546c14.24270295 0 25.89582319 11.65312023 25.8958232 25.8958232s-11.65312023 25.76634348-25.8958232 25.76634348z"></path><path d="M644.32765681 561.20206368L442.21075696 677.86274713c-37.9373813 21.88197006-85.32673798-5.43812227-85.32673797-49.20206368V395.20983684c0-43.76394141 47.38935669-71.21351345 85.32673797-49.20206368l202.11689985 116.66068345c37.80790157 22.01144978 37.80790157 76.65163702 0 98.53360707z"></path></svg>';
N.ATTACHMENT = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M924.672 126.976q36.864 36.864 54.784 82.432t17.92 93.696-17.92 93.696-54.784 82.432l-392.192 389.12q-36.864 36.864-90.624 61.44t-113.664 28.672-122.368-16.384-115.712-73.728q-52.224-52.224-72.704-113.152t-16.384-121.344 28.16-113.664 60.928-90.112l348.16-345.088q9.216-9.216 27.136-4.608t27.136 13.824q8.192 9.216 13.312 27.136t-4.096 27.136l-347.136 344.064q-27.648 27.648-46.08 64.512t-21.504 78.848 12.288 84.992 55.296 82.944q35.84 35.84 79.36 50.688t86.528 12.288 81.92-18.944 66.56-44.032l391.168-388.096q27.648-27.648 39.424-57.344t11.264-58.88-13.824-56.832-36.864-51.2q-44.032-43.008-98.816-40.448t-110.08 57.856l-353.28 351.232q-23.552 23.552-23.04 52.224t18.944 47.104q22.528 22.528 51.712 18.432t47.616-22.528l320.512-318.464q9.216-9.216 27.136-4.608t27.136 13.824 14.336 27.136-4.096 27.136l-321.536 318.464q-36.864 36.864-70.656 51.2t-63.488 12.8-55.296-15.872-47.104-34.816q-17.408-16.384-31.232-41.984t-15.872-56.32 10.752-65.536 49.664-70.656q18.432-18.432 32.768-33.792 12.288-13.312 23.04-23.552t11.776-11.264l285.696-284.672q36.864-36.864 80.384-57.856t88.576-24.064 88.576 12.288 80.384 52.224z"></path></svg>';
N.HR = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M116.4921875 183.18469238m32.13500977 1e-8l726.74560546 0q32.13500977 0 32.13500977 32.13500976l0 0q0 32.13500977-32.13500977 32.13500977l-726.74560546 0q-32.13500977 0-32.13500977-32.13500977l0 0q0-32.13500977 32.13500977-32.13500976Z"></path><path d="M116.4921875 479.81555175m32.13500977 0l133.48388671 0q32.13500977 0 32.13500977 32.13500977l0 0q0 32.13500977-32.13500977 32.13500976l-133.48388671 0q-32.13500977 0-32.13500977-32.13500976l0 0q0-32.13500977 32.13500977-32.13500977Z"></path><path d="M413.12304687 479.81555175m32.13500977 0l133.48388672 0q32.13500977 0 32.13500977 32.13500977l0 0q0 32.13500977-32.13500977 32.13500976l-133.48388672 0q-32.13500977 0-32.13500977-32.13500976l0 0q0-32.13500977 32.13500977-32.13500977Z"></path><path d="M709.75390625 479.81555175m32.13500977 0l133.48388671 0q32.13500977 0 32.13500977 32.13500977l0 0q0 32.13500977-32.13500977 32.13500976l-133.48388671 0q-32.13500977 0-32.13500977-32.13500976l0 0q0-32.13500977 32.13500977-32.13500977Z"></path><path d="M116.4921875 776.44641114m32.13500977-1e-8l726.74560546 0q32.13500977 0 32.13500977 32.13500976l0 0q0 32.13500977-32.13500977 32.13500977l-726.74560546 0q-32.13500977 0-32.13500977-32.13500977l0 0q0-32.13500977 32.13500977-32.13500976Z"></path></svg>';
N.EMOT = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M782.4 606.4a30.4 30.4 0 0 0-41.6 16c0 1.6-65.6 144-228.8 145.6h-3.2c-153.6 0-219.2-140.8-222.4-147.2a32 32 0 0 0-41.6-16 30.88 30.88 0 0 0-16 41.6c3.2 8 84.8 184 281.6 184h3.2c203.2-3.2 283.2-176 286.4-184a33.44 33.44 0 0 0-17.6-40zM512 0a512 512 0 1 0 512 512A512 512 0 0 0 512 0z m0 960a448 448 0 1 1 448-448 449.28 449.28 0 0 1-448 448zM352 480a64 64 0 1 0-64-64 64 64 0 0 0 64 64z m320 0a64 64 0 1 0-64-64 64 64 0 0 0 64 64z"></path></svg>';
N.TABLE = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M329.142857 786.285714l0-109.714286q0-8-5.142857-13.142857t-13.142857-5.142857l-182.857143 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 109.714286q0 8 5.142857 13.142857t13.142857 5.142857l182.857143 0q8 0 13.142857-5.142857t5.142857-13.142857zm0-219.428571l0-109.714286q0-8-5.142857-13.142857t-13.142857-5.142857l-182.857143 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 109.714286q0 8 5.142857 13.142857t13.142857 5.142857l182.857143 0q8 0 13.142857-5.142857t5.142857-13.142857zm292.571429 219.428571l0-109.714286q0-8-5.142857-13.142857t-13.142857-5.142857l-182.857143 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 109.714286q0 8 5.142857 13.142857t13.142857 5.142857l182.857143 0q8 0 13.142857-5.142857t5.142857-13.142857zm-292.571429-438.857143l0-109.714286q0-8-5.142857-13.142857t-13.142857-5.142857l-182.857143 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 109.714286q0 8 5.142857 13.142857t13.142857 5.142857l182.857143 0q8 0 13.142857-5.142857t5.142857-13.142857zm292.571429 219.428571l0-109.714286q0-8-5.142857-13.142857t-13.142857-5.142857l-182.857143 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 109.714286q0 8 5.142857 13.142857t13.142857 5.142857l182.857143 0q8 0 13.142857-5.142857t5.142857-13.142857zm292.571429 219.428571l0-109.714286q0-8-5.142857-13.142857t-13.142857-5.142857l-182.857143 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 109.714286q0 8 5.142857 13.142857t13.142857 5.142857l182.857143 0q8 0 13.142857-5.142857t5.142857-13.142857zm-292.571429-438.857143l0-109.714286q0-8-5.142857-13.142857t-13.142857-5.142857l-182.857143 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 109.714286q0 8 5.142857 13.142857t13.142857 5.142857l182.857143 0q8 0 13.142857-5.142857t5.142857-13.142857zm292.571429 219.428571l0-109.714286q0-8-5.142857-13.142857t-13.142857-5.142857l-182.857143 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 109.714286q0 8 5.142857 13.142857t13.142857 5.142857l182.857143 0q8 0 13.142857-5.142857t5.142857-13.142857zm0-219.428571l0-109.714286q0-8-5.142857-13.142857t-13.142857-5.142857l-182.857143 0q-8 0-13.142857 5.142857t-5.142857 13.142857l0 109.714286q0 8 5.142857 13.142857t13.142857 5.142857l182.857143 0q8 0 13.142857-5.142857t5.142857-13.142857zm73.142857-182.857143l0 621.714286q0 37.714286-26.857143 64.571429t-64.571429 26.857143l-768 0q-37.714286 0-64.571429-26.857143t-26.857143-64.571429l0-621.714286q0-37.714286 26.857143-64.571429t64.571429-26.857143l768 0q37.714286 0 64.571429 26.857143t26.857143 64.571429z"></path></svg>';
N.CODE = '<svg aria-hidden="true" viewBox="0 0 1046 1024"><path d="M326.857143 799.428571l-28.571429 28.571429q-5.714286 5.714286-13.142857 5.714286t-13.142857-5.714286l-266.285714-266.285714q-5.714286-5.714286-5.714286-13.142857t5.714286-13.142857l266.285714-266.285714q5.714286-5.714286 13.142857-5.714286t13.142857 5.714286l28.571429 28.571429q5.714286 5.714286 5.714286 13.142857t-5.714286 13.142857l-224.571429 224.571429 224.571429 224.571429q5.714286 5.714286 5.714286 13.142857t-5.714286 13.142857zm337.714286-609.714286l-213.142857 737.714286q-2.285714 7.428571-8.857143 11.142857t-13.428571 1.428571l-35.428571-9.714286q-7.428571-2.285714-11.142857-8.857143t-1.428571-14l213.142857-737.714286q2.285714-7.428571 8.857143-11.142857t13.428571-1.428571l35.428571 9.714286q7.428571 2.285714 11.142857 8.857143t1.428571 14zm375.428571 372l-266.285714 266.285714q-5.714286 5.714286-13.142857 5.714286t-13.142857-5.714286l-28.571429-28.571429q-5.714286-5.714286-5.714286-13.142857t5.714286-13.142857l224.571429-224.571429-224.571429-224.571429q-5.714286-5.714286-5.714286-13.142857t5.714286-13.142857l28.571429-28.571429q5.714286-5.714286 13.142857-5.714286t13.142857 5.714286l266.285714 266.285714q5.714286 5.714286 5.714286 13.142857t-5.714286 13.142857z"></path></svg>';
N.FOLDER = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M861.9 843.5c0 31.1-25.2 56.2-56.2 56.2H103.5l98.3-454.2c0-31 25-56.2 56.1-56.2h646.2c31 0 56.1 25.2 56.1 56.2l-98.3 398zM215.8 347.1h632v-55.2c0-31-25.2-56.2-56.2-56.2h-337v-50.9c0-31-25.2-56.2-56.2-56.2H117.6c-31 0-56.2 25.2-56.2 56.2v658.6l98.2-440.2c0-30.9 25.2-56.1 56.2-56.1z m0 0"></path></svg>';
N.FULLSCREEN = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M806.285714 309.142857l-202.857143 202.857143 202.857143 202.857143 82.285714-82.285714q16.571429-17.714286 40-8 22.285714 9.714286 22.285714 33.714286l0 256q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-256 0q-24 0-33.714286-22.857143-9.714286-22.285714 8-39.428571l82.285714-82.285714-202.857143-202.857143-202.857143 202.857143 82.285714 82.285714q17.714286 17.142857 8 39.428571-9.714286 22.857143-33.714286 22.857143l-256 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-256q0-24 22.857143-33.714286 22.285714-9.714286 39.428571 8l82.285714 82.285714 202.857143-202.857143-202.857143-202.857143-82.285714 82.285714q-10.857143 10.857143-25.714286 10.857143-6.857143 0-13.714286-2.857143-22.857143-9.714286-22.857143-33.714286l0-256q0-14.857143 10.857143-25.714286t25.714286-10.857143l256 0q24 0 33.714286 22.857143 9.714286 22.285714-8 39.428571l-82.285714 82.285714 202.857143 202.857143 202.857143-202.857143-82.285714-82.285714q-17.714286-17.142857-8-39.428571 9.714286-22.857143 33.714286-22.857143l256 0q14.857143 0 25.714286 10.857143t10.857143 25.714286l0 256q0 24-22.285714 33.714286-7.428571 2.857143-14.285714 2.857143-14.857143 0-25.714286-10.857143z"></path></svg>';
N.SHARE = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M768 585.142857q76 0 129.428571 53.428571t53.428571 129.428571-53.428571 129.428571-129.428571 53.428571-129.428571-53.428571-53.428571-129.428571q0-6.857143 1.142857-19.428571l-205.714286-102.857143q-52.571429 49.142857-124.571429 49.142857-76 0-129.428571-53.428571t-53.428571-129.428571 53.428571-129.428571 129.428571-53.428571q72 0 124.571429 49.142857l205.714286-102.857143q-1.142857-12.571429-1.142857-19.428571 0-76 53.428571-129.428571t129.428571-53.428571 129.428571 53.428571 53.428571 129.428571-53.428571 129.428571-129.428571 53.428571q-72 0-124.571429-49.142857l-205.714286 102.857143q1.142857 12.571429 1.142857 19.428571t-1.142857 19.428571l205.714286 102.857143q52.571429-49.142857 124.571429-49.142857z"></path></svg>';
N.LOCK = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M475.428571 292.571429q0-45.714286-32-77.714286t-77.714286-32-77.714286 32-32 77.714286q0 24 10.857143 47.428571-23.428571-10.857143-47.428571-10.857143-45.714286 0-77.714286 32t-32 77.714286 32 77.714286 77.714286 32 77.714286-32 32-77.714286q0-24-10.857143-47.428571 23.428571 10.857143 47.428571 10.857143 45.714286 0 77.714286-32t32-77.714286zm486.285714 402.285714q0 9.714286-28 37.714286t-37.714286 28q-5.142857 0-16.285714-9.142857t-20.857143-18.857143-22-22.857143-14-14.857143l-54.857143 54.857143 125.714286 125.714286q16 16 16 38.857143 0 24-22.285714 46.285714t-46.285714 22.285714q-22.857143 0-38.857143-16l-383.428571-383.428571q-100.571429 74.857143-208.571429 74.857143-93.142857 0-151.714286-58.571429t-58.571429-151.714286q0-91.428571 54.285714-178.857143t141.714286-141.714286 178.857143-54.285714q93.142857 0 151.714286 58.571429t58.571429 151.714286q0 108-74.857143 208.571429l202.857143 202.857143 54.857143-54.857143q-1.714286-1.714286-14.857143-14t-22.857143-22-18.857143-20.857143-9.142857-16.285714q0-9.714286 28-37.714286t37.714286-28q7.428571 0 13.142857 5.714286 3.428571 3.428571 26.285714 25.428571t46.857143 45.428571 49.428571 49.142857 41.714286 44.571429 16.285714 23.428571z"></path></svg>';
N.INFO = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M694.857143 768l0 73.142857q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-292.571429 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l36.571429 0 0-219.428571-36.571429 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-73.142857q0-14.857143 10.857143-25.714286t25.714286-10.857143l219.428571 0q14.857143 0 25.714286 10.857143t10.857143 25.714286l0 329.142857 36.571429 0q14.857143 0 25.714286 10.857143t10.857143 25.714286zm-73.142857-658.285714l0 109.714286q0 14.857143-10.857143 25.714286t-25.714286 10.857143l-146.285714 0q-14.857143 0-25.714286-10.857143t-10.857143-25.714286l0-109.714286q0-14.857143 10.857143-25.714286t25.714286-10.857143l146.285714 0q14.857143 0 25.714286 10.857143t10.857143 25.714286z"></path></svg>';
N.ARROW = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M498.7 655.8l-197.6-268c-8.1-10.9-0.3-26.4 13.3-26.4h395.2c13.6 0 21.4 15.4 13.3 26.4l-197.6 268c-6.6 9-20 9-26.6 0z"></path></svg>';
N.UNDO = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M761 1024c113-206 132-520-313-509v253l-384-384 384-384v248c534-13 594 472 313 775z"></path></svg>';
N.REDO = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M576 248v-248l384 384-384 384v-253c-446-10-427 303-313 509-280-303-221-789 313-775z"></path></svg>';
N.CLOSE = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M1024 896.1024l-128 128L512 640 128 1024 0 896 384 512 0 128 128 0 512 384 896.1024 0l128 128L640 512z"></path></svg>';
N.WARN = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M511.999 95.003c-230.524 0-418.076 187.552-418.075 418.077 0 230.527 187.552 418.077 418.075 418.077s418.077-187.55 418.077-418.077c0-230.525-187.552-418.077-418.077-418.077zM512 722.12c-28.86 0-52.26-23.399-52.26-52.263 0-28.858 23.399-52.257 52.26-52.257s52.26 23.399 52.26 52.257c0 28.863-23.399 52.263-52.26 52.263zM564.26 513.078c0 28.86-23.399 52.26-52.26 52.26s-52.26-23.399-52.26-52.26l0-156.775c0-28.86 23.399-52.26 52.26-52.26s52.26 23.399 52.26 52.26l0 156.775z" fill="#EDA338"></path></svg>';
N.UPLOAD = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M507.136 514.944c3.072-4.362667 7.210667-7.925333 12.032-10.314667a37.365333 37.365333 0 0 1 46.634667 6.144l97.418666 102.794667a32 32 0 0 1-46.442666 44.021333L565.333333 603.317333V853.333333a32 32 0 1 1-64 0V608.757333l-52.618666 50.016a32 32 0 0 1-44.096-46.4l102.517333-97.429333zM512 138.666667c123.018667 0 228.213333 85.696 259.424 204.469333C864.298667 344.736 938.666667 422.752 938.666667 518.218667 938.666667 614.688 862.752 693.333333 768.533333 693.333333a32 32 0 0 1 0-64C826.890667 629.333333 874.666667 579.84 874.666667 518.218667c0-61.610667-47.776-111.104-106.133334-111.104-5.856 0-11.626667 0.490667-17.301333 1.461333a32 32 0 0 1-37.024-26.666667C698.346667 279.04 612.714667 202.666667 512 202.666667c-73.834667 0-140.928 41.066667-177.376 106.613333a32 32 0 0 1-30.122667 16.373333c-3.168-0.213333-6.357333-0.32-9.568-0.32C214.784 325.333333 149.333333 393.141333 149.333333 477.333333S214.784 629.333333 294.933333 629.333333a32 32 0 1 1 0 64C178.912 693.333333 85.333333 596.373333 85.333333 477.333333c0-116.938667 90.293333-212.554667 203.456-215.904C338.090667 185.696 421.013333 138.666667 512 138.666667z"></path></svg>';
N.DOWNLOAD = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M565.333333 779.914667l51.445334-54.912a31.733333 31.733333 0 0 1 45.226666-1.226667 32.64 32.64 0 0 1 1.216 45.770667l-97.418666 104a37.034667 37.034667 0 0 1-52.821334 1.397333l-108.362666-104.202667a32.64 32.64 0 0 1-1.152-45.770666 31.733333 31.733333 0 0 1 45.248-1.173334L501.333333 774.421333V512.074667c0-17.877333 14.325333-32.373333 32-32.373334s32 14.506667 32 32.373334v267.84zM512 138.666667c123.018667 0 228.213333 86.709333 259.424 206.88C864.298667 347.146667 938.666667 426.090667 938.666667 522.688c0 97.6-75.914667 177.173333-170.133334 177.173333-17.674667 0-32-14.496-32-32.373333 0-17.877333 14.325333-32.373333 32-32.373333 58.357333 0 106.133333-50.08 106.133334-112.426667 0-62.336-47.776-112.416-106.133334-112.416-5.856 0-11.626667 0.501333-17.301333 1.482667-17.621333 3.050667-34.304-9.098667-37.024-26.986667C698.346667 280.693333 612.714667 203.424 512 203.424c-73.834667 0-140.928 41.536-177.376 107.861333a31.914667 31.914667 0 0 1-30.122667 16.576 140.373333 140.373333 0 0 0-9.568-0.32c-80.149333 0-145.6 68.586667-145.6 153.781334 0 85.184 65.450667 153.792 145.6 153.792 17.674667 0 32 14.496 32 32.373333 0 17.877333-14.325333 32.373333-32 32.373333C178.912 699.861333 85.333333 601.770667 85.333333 481.322667c0-118.314667 90.293333-215.061333 203.456-218.453334C338.090667 186.24 421.013333 138.666667 512 138.666667z"></path></svg>';
N.PLUS = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M448 576H128V448h320V128h128v320h320v128H576v320H448V576z"></path></svg>';
N.MINUS = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M128 512 h768 v128 H128 z"></path></svg>';
N.HELP = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M512 993.882353C245.850353 993.882353 30.117647 778.149647 30.117647 512S245.850353 30.117647 512 30.117647s481.882353 215.732706 481.882353 481.882353-215.732706 481.882353-481.882353 481.882353z m0-60.235294c232.869647 0 421.647059-188.777412 421.647059-421.647059S744.869647 90.352941 512 90.352941 90.352941 279.130353 90.352941 512s188.777412 421.647059 421.647059 421.647059z"></path><path d="M510.132706 778.511059a43.760941 43.760941 0 1 1 0-87.521883 43.760941 43.760941 0 0 1 0 87.521883zM391.830588 433.814588a30.659765 30.659765 0 0 1-30.208-34.42447c1.987765-17.016471 5.150118-30.930824 9.487059-41.743059a124.325647 124.325647 0 0 1 33.400471-46.592 148.961882 148.961882 0 0 1 51.109647-30.238118A180.615529 180.615529 0 0 1 515.132235 271.058824c42.164706 0 77.251765 12.408471 105.321412 37.255529 28.069647 24.756706 42.134588 57.825882 42.134588 99.087059 0 18.552471-3.614118 35.358118-10.842353 50.416941-7.168 15.088941-22.467765 33.882353-45.869176 56.350118-23.461647 22.497882-38.942118 38.490353-46.622118 48.007529a98.243765 98.243765 0 0 0-17.347764 34.063059c-2.108235 6.957176-3.614118 15.179294-4.427295 24.636235-1.445647 15.962353-14.275765 28.611765-30.298353 28.611765a30.659765 30.659765 0 0 1-30.32847-33.641412c1.054118-10.962824 2.650353-20.510118 4.879059-28.641882 4.126118-15.510588 10.390588-29.063529 18.763294-40.658824 8.342588-11.625412 23.401412-28.672 45.17647-51.169882 21.805176-22.467765 35.84-38.851765 42.164706-49.001412 6.204235-10.209882 12.739765-26.804706 12.739765-46.983529s-10.631529-36.592941-24.937412-52.133647c-14.396235-15.540706-35.267765-23.341176-62.644706-23.341177-53.428706 0-83.727059 27.497412-90.834823 82.492235-2.017882 15.480471-14.607059 27.407059-30.208 27.407059h-0.120471z"></path></svg>';
N.SETTING = '<svg aria-hidden="true" viewBox="0 0 1024 1024"><path d="M844.70029297 553.80957031c1.85888672-14.32089844 3.06123047-28.64091797 3.06123047-43.9453125 0-15.19453125-1.42119141-29.51542969-3.06123047-43.94443359L939.1484375 392.02314453c8.52626953-6.66914062 10.82197266-18.80332031 5.35605469-28.64179687L854.97646484 208.48203125c-5.35693359-9.83759766-17.49023438-13.44550781-27.32871093-9.83759766l-111.50244141 44.81894532c-23.28398437-17.92705078-48.42597656-32.68476563-75.64570312-43.9453125L623.44707031 80.80332031C622.02675781 69.98046875 612.73320313 62 601.47441406 62H422.30761719c-11.15068359 0-20.55234375 8.08945313-21.97265625 18.80244141l-17.05341797 118.7165039c-27.32871094 11.14980469-52.36171875 26.45507813-75.64570313 43.9444336L196.13251953 198.64355469c-10.38427734-4.04472656-21.97177734 0-27.32871094 9.83935547L79.27578125 363.38134766c-5.90273437 9.83847656-3.06035156 21.97265625 5.35693359 28.64179687l94.44814453 73.89667969c-1.85800781 14.32001953-3.06035156 29.07773437-3.06035156 43.9453125 0 14.86582031 1.4203125 29.51455078 3.06035157 43.94443359L84.52373047 627.70625c-8.52802734 6.66826172-10.82285156 18.80244141-5.35693359 28.64003906l89.52890625 154.90019532c5.35605469 9.83847656 17.49023438 13.44550781 27.32871093 9.83847656l111.50244141-44.82070313c23.28398437 17.92880859 48.42597656 32.68652344 75.64570312 43.9453125l17.05253907 118.71738282c1.42119141 10.71210937 10.71386719 18.8015625 21.97265625 18.8015625h179.16679687c11.15068359 0 20.55234375-8.08945313 21.97265625-18.8015625l17.05341797-118.71650391c27.32871094-11.15068359 52.36171875-26.45507813 75.64658203-43.9453125l111.5015625 44.81982422c10.38427734 4.04472656 21.97265625 0 27.32783203-9.83847656l89.52890625-154.90019532c5.35693359-9.83759766 3.06123047-21.97177734-5.35517578-28.64003906L844.70029297 553.80957031zM511.94550781 666.73144531c-86.46855469 0-156.75820313-70.28964844-156.75820312-156.75732422s70.28964844-156.75820313 156.75820312-156.75820312 156.75820313 70.28964844 156.75820313 156.75820312S598.4140625 666.73144531 511.94550781 666.73144531z m0 0"></path></svg>';
const ih = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Sprite: N
}, Symbol.toStringTag, { value: "Module" })), { Sprite: rh } = ih, z = {};
z.create = function(i, t, n) {
  const r = document.createElement(i);
  if (t) {
    const s = t.className;
    s && (r.className = s);
    for (let o in t)
      r.setAttribute(o, t[o]);
  }
  if (n)
    if (Array.isArray(n))
      for (let s = 0; s < n.length; s++) {
        let o = n[s];
        typeof o == "string" ? r.appendChild(document.createTextNode(o)) : r.appendChild(z.create(o.tag, o.attrs, o.children));
      }
    else
      r.innerHTML = n.toString();
  return r;
};
z.from = function(i) {
  const t = document.createElement("template");
  return t.innerHTML = i, t.content.firstElementChild;
};
z.move = function(i, t) {
  for (; t.firstChild; )
    i.appendChild(t.firstChild);
};
z.empty = function(i) {
  for (; i.firstChild; )
    i.removeChild(i.firstChild);
};
z.setClass = function(i, t, n) {
  n ? i.classList.add(t) : i.classList.remove(t);
};
z.getStyle = function(i, t) {
  if (i.style[t])
    return i.style[t];
  if (document.defaultView != null && document.defaultView.getComputedStyle != null) {
    let n = document.defaultView.getComputedStyle(i, null);
    if (n != null) {
      let r = t.replace(/([A-Z])/g, "-$1").toLowerCase();
      return n.getPropertyValue(r);
    }
  } else if (i.currentStyle != null)
    return i.currentStyle[t];
  return null;
};
z.getWidth = function(i) {
  if (i.nodeName == "BODY")
    return document.documentElement.clientWidth;
  let t = z.getStyle(i, "width");
  return t != null && (t = parseInt(t.replace("px", ""))), isNaN(t) ? 0 : t;
};
z.getHeight = function(i) {
  if (i.nodeName == "BODY")
    return document.documentElement.clientWidth;
  let t = z.getStyle(i, "height");
  return t != null && (t = parseInt(t.replace("px", ""))), isNaN(t) ? 0 : t;
};
z.getRelativeRect = function(i) {
  if (!i || i.nodeType != 1)
    return { top: 0, left: 0, width: 0, height: 0 };
  const t = i.offsetParent || document.body, n = i.getBoundingClientRect(), r = t.getBoundingClientRect(), s = window.getComputedStyle(t), o = parseFloat(s.borderTopWidth) || 0, l = parseFloat(s.borderLeftWidth) || 0, a = n.top - r.top - o, c = n.left - r.left - l;
  return { top: Math.round(a), left: Math.round(c), width: i.offsetWidth, height: i.offsetHeight };
};
z.getPosition = function(i) {
  const t = i.getBoundingClientRect();
  return { top: t.top, left: t.left };
};
z.getZIndex = function(i) {
  const t = parseInt(z.getStyle(i, "zIndex"));
  return isNaN(t) ? 0 : t;
};
z.getZoom = function(i) {
  if (document.defaultView && document.defaultView.getComputedStyle) {
    const t = document.defaultView.getComputedStyle(i, null);
    if (t != null)
      return parseFloat(t.getPropertyValue("zoom")) || 1;
  }
  return 1;
};
z.center = function(i) {
  let t = i;
  typeof i == "string" && (t = document.getElementById(i)), t.style.display = "block";
  const n = z.getWidth(t), r = z.getHeight(t), s = window.pageYOffset || document.documentElement.scrollTop, o = window.pageXOffset || document.documentElement.scrollLeft, l = s + parseInt((document.documentElement.clientHeight - r) / 2), a = o + parseInt((document.documentElement.clientWidth - n) / 2);
  t.style.top = (l > 0 ? l : 0) + "px", t.style.left = (a > 0 ? a : 0) + "px";
};
z.scrollToTop = function(i = window, t = 500) {
  const n = i == window, r = n ? window.pageYOffset || document.documentElement.scrollTop : i.scrollTop;
  if (r == 0)
    return;
  let s = null;
  const o = function(a, c, u, d) {
    return a /= d, a--, u * (a * a * a + 1) + c;
  }, l = function(a) {
    s || (s = a);
    const c = a - s, u = o(
      c,
      r,
      -r,
      // 目标：从 startTop 到 0
      t
    );
    n ? window.scrollTo(0, u) : i.scrollTop = u, c < t ? requestAnimationFrame(l) : n ? window.scrollTo(0, 0) : i.scrollTop = 0;
  };
  requestAnimationFrame(l);
};
z.select = function(i) {
  let t = i.nodeName;
  if (t == "INPUT" || t == "TEXTAREA") {
    i.select();
    return;
  }
  try {
    const n = document.createRange();
    n.selectNodeContents(i);
    const r = window.getSelection();
    r.removeAllRanges(), r.addRange(n);
  } catch (n) {
    console.error(n);
  }
};
z.copy = function(i) {
  let t = i.nodeName;
  return t == "INPUT" || t == "TEXTAREA" ? un.copy(i.value) : un.copy(i.textContent);
};
z.fullscreen = function(i, t) {
  i instanceof HTMLElement && (t == 2 ? i.classList.contains("fullscreen") ? i.classList.remove("fullscreen") : i.classList.add("fullscreen") : Me.toggle(i));
};
z.tooltip = function(i, t) {
  un.tooltip(i, t);
};
z.print = function(i) {
  HTMLElement.prototype.parents = function() {
    let n = [], r = this.parentElement;
    for (; r; )
      n.push(r), r = r.parentElement;
    return n;
  };
  const t = i.getBoundingClientRect();
  console.log("视口位置 left/top：", t.left, t.top), console.log("文档位置 left/top：", t.left + window.scrollX, t.top + window.scrollY), console.log("元素宽高：", t.width, t.height), console.log("是否有 transform：", getComputedStyle(i).transform !== "none"), console.log("box-sizing：", getComputedStyle(i).boxSizing), console.log("position：", getComputedStyle(i).position), console.log("display：", getComputedStyle(i).display), console.log("父元素是否有 transform：", Array.from(i.parents()).some(function(n) {
    getComputedStyle(n).transform != "none";
  }));
};
const un = {};
un.copy = function(i) {
  if (fn.safe())
    try {
      return window.navigator.clipboard.writeText(i), !0;
    } catch (t) {
      console.error(t);
    }
  if (document.execCommand) {
    const t = document.createElement("textarea");
    return t.style.cssText = "position: absolute; top: 0px; left: 0px; width: 100px; height: 100px; opacity: 0.01; z-index: -10;", t.value = i, document.body.appendChild(t), t.focus(), t.select(), document.execCommand("copy", !0), document.body.removeChild(t), !0;
  }
  return !1;
};
un.copyHTML = function(i) {
  try {
    const t = document.createElement("div");
    t.contentEditable = !0, t.style.position = "absolute", t.style.top = "-9999px", t.style.left = "-9999px", t.style.width = "1px", t.style.height = "1px", t.style.overflow = "hidden", t.style.userSelect = "text", t.innerHTML = i.innerHTML, document.body.appendChild(t);
    const n = document.createRange();
    n.selectNodeContents(t);
    const r = window.getSelection();
    r.removeAllRanges(), r.addRange(n);
    let s = !1;
    if (navigator.clipboard && window.ClipboardItem) {
      const o = new Blob([i.innerHTML], { type: "text/html" }), l = new Blob([i.textContent], { type: "text/plain" });
      navigator.clipboard.write([
        new ClipboardItem({ "text/html": htmlContent, "text/plain": textContent })
      ]), s = !0;
    } else
      s = document.execCommand("copy");
    return r.removeAllRanges(), document.body.removeChild(t), s;
  } catch (t) {
    console.error(t);
  }
  return !1;
};
un.tooltip = function(i, t) {
  const n = document.createElement("div");
  if (n.className = "se-widget-tooltip", n.appendChild(document.createTextNode(t)), i) {
    const r = i.getBoundingClientRect();
    n.style.top = r.top + r.height + 4 + "px", n.style.left = r.left + "px";
  }
  document.body.appendChild(n), setTimeout(function() {
    const r = function s() {
      document.body.removeChild(n), n.removeEventListener("transitionend", s);
    };
    n.classList.add("fade-out"), n.addEventListener("transitionend", r, { once: !0 });
  }, 1e3);
};
const Me = {};
Me.toggle = function(i) {
  if (i == document.body || i == document.documentElement) {
    Me.current() ? Me.exit() : Me.open(document.documentElement);
    return;
  }
  const t = "fullscreenchange", n = function() {
    const r = Me.current();
    (r == null || r == null) && (i.classList.remove("fullscreen"), document.removeEventListener(t, n));
  };
  i.classList.contains("fullscreen") ? (i.classList.remove("fullscreen"), Me.exit(), document.removeEventListener(t, n)) : (i.classList.add("fullscreen"), Me.open(document.documentElement), document.addEventListener(t, n, { once: !1 }));
};
Me.open = function(i) {
  try {
    i.requestFullscreen ? i.requestFullscreen() : i.webkitRequestFullScreen ? window.navigator.userAgent.toUpperCase().indexOf("CHROME") >= 0 ? i.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : i.webkitRequestFullScreen() : i.mozRequestFullScreen ? i.mozRequestFullScreen() : i.msRequestFullscreen && i.msRequestFullscreen();
  } catch {
  }
};
Me.exit = function(i) {
  try {
    Me.current() && (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen ? document.webkitExitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.msExitFullscreen && document.msExitFullscreen());
  } catch {
  }
};
Me.current = function() {
  return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
};
const en = {};
en.stop = function(i) {
  return i != null && (i.stopPropagation && i.stopPropagation(), i.preventDefault && i.preventDefault(), i.cancel = !0, i.cancelBubble = !0, i.returnValue = null), !1;
};
const Ae = {
  KB: 1024,
  MB: 1048576,
  GB: 1073741824,
  TB: 1099511627776,
  PB: 1125899906842624,
  format: function(i, t) {
    return isNaN(i) ? "NaN" : ((t == null || t == null) && (t = 0), i < Ae.KB ? i + " B" : i < Ae.MB ? (i / Ae.KB).toFixed(t) + " KB" : i < Ae.GB ? (i / Ae.MB).toFixed(t) + " MB" : i < Ae.TB ? (i / Ae.GB).toFixed(t) + " GB" : i < Ae.PB ? (i / Ae.TB).toFixed(t) + " TB" : (i / Ae.PB).toFixed(t) + " PB");
  },
  keep: function(i, t) {
    const n = Math.pow(10, t);
    return Math.round(i * n) / n;
  }
}, Zr = { timestamp: 0 };
Zr.next = function() {
  let i = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3) * 1e3;
  return i > this.timestamp ? this.timestamp = i : this.timestamp = this.timestamp + 1e3;
};
Zr.format = function() {
  const i = new Date(this.next()), t = i.getFullYear(), n = i.getMonth() + 1, r = i.getDate(), s = i.getHours(), o = i.getMinutes(), l = i.getSeconds(), a = [];
  return a.push(t.toString()), a.push(n < 10 ? "0" + n : n), a.push(r < 10 ? "0" + r : r), a.push(s < 10 ? "0" + s : s), a.push(o < 10 ? "0" + o : o), a.push(l < 10 ? "0" + l : l), a.join("");
};
const yt = {};
yt.test = function(i) {
  return i.startsWith("data:image/");
};
yt.toBlob = function(i) {
  const [t, n] = i.split(",");
  if (!n)
    throw new Error("无效的 DataURL 格式，缺少 base64 数据");
  const r = yt.getMimeType(t), s = atob(n), o = s.length, l = new Uint8Array(o);
  for (let u = 0; u < o; u++)
    l[u] = s.charCodeAt(u);
  const a = yt.getExtension(r), c = new Blob([l], { type: r });
  return c.name = "base64." + a, c.lastModified = (/* @__PURE__ */ new Date()).getTime(), c;
};
yt.clean = function() {
  return data.replace(/\s+/g, "").replace(/^data:.+;base64,/, "").replace(/-/g, "+").replace(/_/g, "/");
};
yt.getMimeType = function(i) {
  const t = i.match(/:(.*?);/);
  return t ? t[1] : "application/octet-stream";
};
yt.getExtension = function(i) {
  return i.startsWith("image/") ? i.substring(6) : "bin";
};
const Qr = {};
Qr.getName = function(i) {
  if (i == null || i == null || i.length < 1)
    return "";
  let t = null, n = i.length - 1;
  for (; n > -1 && (t = i.charAt(n), !(t == "/" || t == "\\" || t == ":")); n--)
    ;
  return i.substring(n + 1);
};
Qr.getType = function(i) {
  if (i == null || i == null || i.length < 1)
    return "";
  let t = null, n = i.length - 1;
  for (; n > -1; n--) {
    if (t = i.charAt(n), t == ".")
      return i.substring(n + 1).toLowerCase();
    if (t == "/" || t == "\\" || t == ":")
      return "";
  }
  return "";
};
const sa = {};
sa.choose = function(i, t, n) {
  let r = "se6_file_picker_input", s = document.getElementById(r);
  if (s == null || s == null) {
    s = document.createElement("input"), s.id = r, s.type = "file";
    let o = document.createElement("div");
    o.style.display = "none", o.appendChild(s), document.body.appendChild(o), s.addEventListener("change", function() {
      let l = s.files;
      l == null || l.length < 1 || s.callback == null || s.callback == null || (s.callback(l), s.callback = null);
    });
  }
  s.value = "", s.accept = i || "*", s.multiple = "multiple", s.callback = n, s.click();
};
const Pe = { HOME: "" };
Pe.guess = function() {
  Pe.HOME = Pe.find(), ne.FILE = Pe.HOME + "/images/icons.svg";
};
Pe.find = function() {
  let i = "";
  try {
    i = Pe.getURL("./", import.meta.url).href;
  } catch (t) {
    console.error(t);
  }
  if (i == "") {
    const t = "stackeditor", n = document.getElementsByTagName("script");
    for (let r = 0; r < n.length; r++) {
      let s = n[r].src;
      s && s.length > 0 && Pe.parse(s).name == t && (i = new URL("./", s).href);
    }
  }
  return i.endsWith("/") && (i = i.substring(0, i.length - 1)), i;
};
Pe.getURL = function(i, t) {
  return new URL(i, t);
};
Pe.parse = function(i) {
  const n = function(l, a) {
    let c = l;
    for (let u = 0; u < a.length; u++) {
      const d = c.lastIndexOf(a[u]);
      d > -1 && (c = c.substring(0, d));
    }
    return c;
  }(i.split("/").pop(), ["?", "#"]), r = /stackeditor-(\d+\.\d+\.\d+)\.([a-z]+)\.js$/, s = n.match(r), o = {
    name: null,
    version: "1.0.0",
    format: "UK"
  };
  return s && (o.name = "stackeditor", o.version = s[1], o.format = s[2]), o;
};
const es = {};
es.create = function(i) {
  const t = document.createElementNS("http://www.w3.org/2000/svg", "svg"), n = document.createElementNS("http://www.w3.org/2000/svg", "use");
  return t.setAttribute("aria-hidden", "true"), n.setAttributeNS("http://www.w3.org/1999/xlink", "href", i), t.appendChild(n), t;
};
const ne = { FILE: "/stackeditor-1.0.0/images/icons.svg" };
ne.create = function(i) {
  if (i) {
    if (i instanceof Node)
      return i;
    if (i.length > 0) {
      if (i.charAt(0) == "<")
        return z.from(i);
      if (i.indexOf("#") < 0) {
        const n = ne.get(i);
        return n ? z.from(n) : z.from('<span class="none"></span>');
      } else
        return es.create(i);
    }
  }
  return null;
};
ne.get = function(i) {
  const t = i.replace(/-/g, "_").toUpperCase();
  return rh[t];
};
ne.forecolor = function(i) {
  const t = document.createElementNS("http://www.w3.org/2000/svg", "svg"), n = document.createElementNS("http://www.w3.org/2000/svg", "path"), r = document.createElementNS("http://www.w3.org/2000/svg", "path");
  return t.setAttribute("viewBox", "0 0 1024 1024"), n.setAttribute("d", "M456.021333 0L163.157333 768h139.264l60.757334-179.2h297.642666l65.536 179.2h139.264L572.757333 0h-116.736zM512 163.157333l107.178667 318.464h-219.136L512 163.157333z"), r.setAttribute("d", "M102.4 870.4v153.6h819.2v-153.6H102.4z m0 0"), i && r.setAttribute("fill", i), t.appendChild(n), t.appendChild(r), t;
};
ne.backcolor = function(i) {
  const t = document.createElementNS("http://www.w3.org/2000/svg", "svg"), n = document.createElementNS("http://www.w3.org/2000/svg", "path"), r = document.createElementNS("http://www.w3.org/2000/svg", "path");
  return t.setAttribute("viewBox", "0 0 1024 1024"), n.setAttribute("d", "M0 0v1024h1024V0H0z m928 898.29376c0 16.39936-13.30688 29.70624-29.70624 29.70624h-237.72416c-16.41216 0-29.70624-13.30688-29.70624-29.70624v-29.72416c0-16.41216 13.29408-29.70624 29.70624-29.70624h65.8176l-61.85984-178.29376H359.47008l-61.85728 178.29376h65.8176c16.40704 0 29.71648 13.29408 29.71648 29.70624v29.72416c0 16.39936-13.30944 29.70624-29.71648 29.70624H125.71648c-16.41472 0-29.71648-13.30688-29.71648-29.70624v-29.72416c0-16.41216 13.30176-29.70624 29.71648-29.70624H187.5968l250.7264-722.87744a29.71136 29.71136 0 0 1 28.08064-19.98336h91.18976a29.71392 29.71392 0 0 1 28.09344 19.98336l250.72128 722.87744h61.88544c16.39936 0 29.70624 13.29408 29.70624 29.70624v29.72416z"), r.setAttribute("d", "M390.41024 571.43296h243.1744L512 221.00224z"), i && (n.setAttribute("fill", i), r.setAttribute("fill", i)), t.appendChild(n), t.appendChild(r), t;
};
const oa = {};
oa.merge = function(i, t) {
  let n, r = [], s = t || {};
  for (let o = 0, l = i.length; o < l; o++)
    if (n = i.charAt(o), n == "$" && o < l - 1 && i.charAt(o + 1) == "{") {
      let a = i.indexOf("}", o + 2);
      if (a > -1) {
        let c = i.substring(o + 2, a), u = s[c];
        u != null && r.push(u), o = a;
      } else {
        r.push(i.substring(o + 2));
        break;
      }
    } else
      r.push(n);
  return r.join("");
};
const la = {};
la.equals = function(i, t) {
  return (i != null && i != null ? i : "") == (t != null && t != null ? t : "");
};
const fn = {};
fn.http = function() {
  return window.location.protocol == "http:";
};
fn.https = function() {
  return window.location.protocol == "https:";
};
fn.local = function() {
  const i = window.location.protocol;
  return i == "file:" || i == "localhost" || i == "127.0.0.1";
};
fn.safe = function() {
  const i = window.location.protocol;
  return i == "https:" || i == "file:" || i == "localhost" || i == "127.0.0.1";
};
let dn = function(i, t) {
  this.x = 0, this.y = 0, this.element = i, this.target = t, this.dragging = !1, this.mask = document.getElementById("se-draggable-mask"), this.frame = document.getElementById("se-draggable-frame");
  const n = this;
  this.stopHandler = function(r) {
    en.stop(r), n.stop(r);
  }, this.moveHandler = function(r) {
    en.stop(r), n.move(r);
  }, this.mask == null && (this.mask = document.createElement("div"), this.mask.id = "se-draggable-mask", this.mask.className = "se-draggable-mask", document.body.appendChild(this.mask)), this.frame == null && (this.frame = document.createElement("div"), this.frame.id = "se-draggable-frame", this.frame.className = "se-draggable-frame", this.frame.innerHTML = '<div class="se-draggable-body"></div>', document.body.appendChild(this.frame)), this.target != null && (this.target.style.position = "absolute"), this.element != null && this.element.addEventListener("mousedown", function(r) {
    en.stop(r), n.start(r);
  });
};
dn.prototype.start = function(i) {
  const t = i.srcElement || i.target;
  return i.button != 0 || t.getAttribute("draggable") == "false" || (this.dragging = !1, this.startX = i.clientX, this.startY = i.clientY, this.offsetY = i.clientY - this.target.offsetTop, this.offsetX = i.clientX - this.target.offsetLeft, this.frame.style.width = this.target.offsetWidth - 2 + "px", this.frame.style.height = this.target.offsetHeight - 2 + "px", this.frame.style.display = "none", this.sync = this.element.getAttribute("data-drag-sync") == "true", document.addEventListener("mouseup", this.stopHandler), document.addEventListener("mousemove", this.moveHandler)), !0;
};
dn.prototype.move = function(i) {
  const t = i.clientX - this.offsetX, n = i.clientY - this.offsetY;
  if (n < 0)
    return !1;
  if (this.dragging == !1)
    if (Math.abs(i.clientX - this.startX) > 2 || Math.abs(i.clientY - this.startY) > 2)
      this.dragging = !0;
    else
      return !1;
  const r = z.getZIndex(this.target);
  return this.mask.style.zIndex = r + 8, this.mask.style.display = "block", this.frame.style.top = n + "px", this.frame.style.left = t + "px", this.frame.style.zIndex = r + 10, this.frame.style.display = "block", this.sync && (this.target.style.top = n + "px", this.target.style.left = t + "px"), !1;
};
dn.prototype.stop = function(i) {
  let t = this.frame.offsetTop, n = this.frame.offsetLeft;
  return t < 0 && (t = 0), document.removeEventListener("mouseup", this.stopHandler), document.removeEventListener("mousemove", this.moveHandler), this.frame.style.zIndex = -1, this.frame.style.display = "none", this.mask.style.display = "none", this.dragging != !0 || (this.dragging = !1, this.target.style.marginTop = "0px", this.target.style.marginLeft = "0px", this.target.style.top = t + "px", this.target.style.left = n + "px"), !1;
};
dn.bind = function(i, t) {
  let n = null, r = null;
  typeof i == "string" ? n = document.getElementById(i) : n = i, typeof t == "string" ? r = document.getElementById(t) : r = t, n != null && r != null && new dn(n, r);
};
let sh = class {
  constructor(t) {
    this.container = t.parentNode, this.container.classList.add("resizable-wrapper"), this.element = t, this.create();
  }
  create() {
    const t = ["n", "s", "w", "e"], n = ["nw", "ne", "sw", "se"];
    this.handles = [], t.concat(n).forEach((r) => {
      const s = document.createElement("span");
      s.className = "resize-handle " + r, s.addEventListener("mousedown", (o) => this.start(o, r)), this.container.appendChild(s), this.handles.push(s);
    }), this.element.addEventListener("click", (r) => {
      r.stopPropagation(), this.select();
    }), this.element.addEventListener("dblclick", () => {
      this.keepRatio = !this.keepRatio, this.info(this.keepRatio ? "锁定比例" : "自由调整");
    });
  }
  info(t) {
    const n = document.createElement("div");
    n.className = "tooltip", n.textContent = t, this.container.appendChild(n), setTimeout(function() {
      n.style.opacity = 0;
    }, 1e3), setTimeout(function() {
      n.remove();
    }, 2e3);
  }
  start(t, n) {
    t.preventDefault(), t.stopPropagation();
    const r = t.clientX, s = t.clientY, o = this.element.getBoundingClientRect(), l = o.width, a = o.height, c = l / a;
    this.container.classList.add("resizing");
    const u = (h) => {
      let f = l, p = a;
      const m = h.clientX - r, y = h.clientY - s;
      n.includes("e") && (f = l + m), n.includes("w") && (f = l - m), n.includes("s") && (p = a + y), n.includes("n") && (p = a - y), this.keepRatio && (n === "n" || n === "s" || n === "e" || n === "w") && (n === "n" || n === "s" ? f = p * c : p = f / c), f = Math.max(30, f), p = Math.max(30, p), this.element.style.width = Math.round(f) + "px", this.element.style.height = Math.round(p) + "px", this.update(f, p), this.pending = { width: f, height: p };
    }, d = () => {
      document.removeEventListener("mousemove", u), document.removeEventListener("mouseup", d), this.container.classList.remove("resizing"), this.commit(this.pending), this.pending = null;
    };
    document.addEventListener("mousemove", u), document.addEventListener("mouseup", d);
  }
  commit(t) {
  }
  /**
   * @Override
   */
  select() {
  }
  /**
   * @Override
   */
  deselect() {
  }
  /**
   * @Override
   */
  destroy() {
  }
};
const jt = function(i) {
  this.spec = i, this.name = i.name, this.icon = i.icon, this.label = i.label, this.title = i.title, this.shortcut = i.shortcut, this.className = i.className, this.style = i.style, this.disabled = i.disabled, this.items = i.items;
};
jt.prototype.render = function(i) {
  if (this.spec && this.spec.render)
    return this.spec.render.apply(this, [i]);
  let t = document.createElement("div");
  t.className = "se-menuitem";
  let n = document.createElement("button");
  if (n.type = "button", n.className = "se-button", this.disabled == !0 && (n.disabled = !0), this.style && n.setAttribute("style", this.style), n.setAttribute("data-name", this.name), n.setAttribute("data-title", this.title || this.label), n.setAttribute("aria-label", this.title || this.label), this.items != null && this.items != null && this.items.length > 0 && n.setAttribute("data-value", "#"), t.appendChild(n), this.items != null && this.items != null && this.items.length > 0)
    if (this.icon)
      n.style.width = "52px", n.appendChild(ne.create(this.icon)), n.appendChild(ne.create("arrow"));
    else {
      let r = document.createElement("span"), s = document.createElement("span");
      r.className = "text ellipsis", r.style.width = "80px", r.appendChild(document.createTextNode(this.label)), s.className = "more", s.appendChild(ne.create("arrow")), n.appendChild(r), n.appendChild(s), t.appendChild(n);
    }
  else
    n.appendChild(ne.create(this.icon));
  return this.element = t;
};
jt.prototype.run = function() {
  this.spec && this.spec.run ? this.spec.run.apply(this, arguments) : console.log("MenuItem.spec.run() is undefined: " + this.name);
};
jt.prototype.select = function() {
  return this.spec && this.spec.select ? this.spec.select.apply(this, arguments) : !0;
};
jt.prototype.enable = function() {
  return this.spec && this.spec.enable ? this.spec.enable.apply(this, arguments) : !0;
};
jt.prototype.active = function() {
  return this.spec && this.spec.active ? this.spec.enable.active(this, arguments) : !1;
};
jt.prototype.update = function() {
};
const Bi = function() {
  this.spec = {}, this.name = "|";
};
Bi.prototype.render = function() {
  return this.element = document.createElement("div"), this.element.className = "divider", this.element.role = "separator", this.element;
};
Bi.prototype.update = function() {
};
const $e = function(i) {
  this.spec = i, this.name = i.name, this.icon = i.icon, this.label = i.label, this.title = i.title, this.shortcut = i.shortcut, this.className = i.className, this.style = i.style, this.value = i.value, this.items = i.items;
};
$e.prototype.render = function() {
  if (this.spec && this.spec.render)
    return this.spec.render.apply(this);
  const i = document.createElement("div");
  i.className = "se-menuitem se-dropdown";
  const t = document.createElement("button");
  if (t.type = "button", t.className = "se-button", t.disabled = this.disabled == !0, this.style && t.setAttribute("style", this.style), t.setAttribute("aria-haspopup", "menu"), t.setAttribute("aria-expanded", "false"), t.setAttribute("data-name", this.name), t.setAttribute("data-title", this.title), this.icon)
    t.style.width = "52px", t.appendChild(ne.create(this.icon)), t.appendChild(ne.create("arrow"));
  else {
    let n = document.createElement("span");
    n.className = "text ellipsis", n.style.width = "80px", n.appendChild(document.createTextNode(this.label));
    let r = document.createElement("span");
    r.className = "more", r.appendChild(ne.create("arrow")), t.appendChild(n), t.appendChild(r);
  }
  return t.addEventListener("click", this.open.bind(this)), i.appendChild(t), this.element = i, i;
};
$e.prototype.open = function(i) {
  if (this.element.querySelector("div.se-dropdown-menu"))
    return;
  const t = this, n = this.items, r = document.createElement("div");
  r.className = "se-dropdown-menu", r.tabIndex = -1;
  for (let l = 0; l < n.length; l++) {
    const a = n[l], c = a.render(), u = c.querySelector("button.se-button");
    u ? (this.value == a.value && u.classList.add("active"), u.addEventListener("click", this.select.bind(this, a.value))) : (this.value == a.value && c.classList.add("active"), c.setAttribute("role", "button"), c.addEventListener("click", this.select.bind(this, a.value))), r.appendChild(c);
  }
  const s = this.element.querySelector("button.se-button");
  s && (s.setAttribute("aria-expanded", "true"), s.classList.add("active")), this.element.appendChild(r), r.focus();
  const o = function(l) {
    const a = l.target || l.srcElement, c = a.closest("button.se-button");
    r.contains(a) || c == t.element.querySelector("button.se-button") || (s && s.setAttribute("aria-expanded", "false"), document.removeEventListener("click", o), t.close());
  };
  setTimeout(function() {
    document.addEventListener("click", o);
  }, 200);
};
$e.prototype.select = function(i, t) {
  en.stop(t), this.close(), this.setValue(i), this.change(t);
};
$e.prototype.update = function() {
  for (let i = 0; i < this.items.length; i++) {
    let t = this.items[i];
    if (t.spec.active && t.spec.active(state)) {
      this.setValue(t.label);
      break;
    }
  }
};
$e.prototype.setValue = function(i) {
  let t = "";
  const n = this.element.querySelector("button.se-button");
  if (n) {
    const r = n.querySelector("span.text");
    if (r) {
      for (let s = 0; s < this.items.length; s++)
        if (this.items[s].value == i) {
          t = this.items[s].label;
          break;
        }
      r.textContent = t;
    }
  }
  this.label = t, this.value = i;
};
$e.prototype.getValue = function(i) {
  return this.value;
};
$e.prototype.change = function() {
};
$e.prototype.close = function() {
  const i = this.element.querySelector("button.se-button"), t = this.element.querySelector("div.se-dropdown-menu");
  i && i.classList.remove("active"), t && t.remove();
};
const aa = function(i) {
  this.spec = i, this.icon = i.icon, this.label = i.label, this.value = i.value;
};
aa.prototype.render = function() {
  if (this.element = document.createElement("div"), this.element.className = "se-dropdown-item", this.spec.render)
    this.spec.render.apply(this);
  else {
    const i = z.create("button", { class: "se-button" }), t = z.create("span", { class: "icon" }), n = z.create("span", { class: "text" }, [this.label]);
    this.icon ? t.appendChild(ne.create(this.icon)) : t.className = "checkable", i.appendChild(t), i.appendChild(n), this.element.appendChild(i);
  }
  return this.element;
};
const Wn = function(i, t, n) {
  this.container = i, this.items = t, this.bind = n;
};
Wn.prototype.render = function() {
  let i = document.createDocumentFragment();
  for (let t = 0; t < this.items.length; t++) {
    const n = this.items[t], r = n.render(this.bind), s = r.querySelectorAll("button.se-button");
    if (n instanceof $e) {
      for (let o = 0; o < s.length; o++)
        s[o].role = "menuitem";
      n.change = this.bind.change(n);
    } else if (!(n instanceof Bi)) if (n.items && n.items.length > 0) {
      let o = document.createElement("div");
      o.className = "se-contextmenu", n.element.appendChild(o), n.submenu = new Qe(o, n.items, this.bind);
      const l = (function(a) {
        this.submenu.open({ top: "36px", left: "0px" });
      }).bind(n);
      if (s.length > 0) {
        const a = s[0];
        a.role = "menuitem", a.setAttribute("aria-haspopup", "menu"), a.setAttribute("aria-expanded", "false"), a.addEventListener("click", l);
      } else
        r.setAttribute("role", "menuitem"), r.setAttribute("aria-haspopup", "menu"), r.setAttribute("aria-expanded", "false"), r.addEventListener("click", l);
    } else if (s.length > 0)
      for (let o = 0; o < s.length; o++) {
        const l = s[o];
        l.role = "menuitem", l.role = "menuitem", l.addEventListener("click", this.bind.click(n));
      }
    else
      r.setAttribute("role", "menuitem"), r.addEventListener("click", this.bind.click(n));
    i.appendChild(r);
  }
  this.container.appendChild(i), this.resize();
};
Wn.prototype.update = function() {
  for (let i = 0; i < this.items.length; i++) {
    let t = this.items[i];
    t.update && t.update.apply(t, arguments);
  }
};
Wn.prototype.resize = function() {
  let i = this.container.querySelectorAll("div.divider");
  for (let t = 0; t < i.length; t++) {
    let n = i[t], r = n.nextElementSibling;
    r && n.classList.toggle("hide", r.offsetTop > n.offsetTop);
  }
};
Wn.prototype.destroy = function() {
  this.container && (this.container.remove(), this.container = null);
};
const Qe = function(i, t, n) {
  this.container = i, this.items = t, this.bind = n, this.closeHandler = this.close.bind(this);
};
Qe.prototype.getContainer = function(i) {
  return this.container == null || this.container == null ? this.container = this.create() : this.container.querySelectorAll("div.item").length < 1 && (this.container = this.create()), this.container;
};
Qe.prototype.create = function() {
  let i = this.container;
  i == null || i == null ? (i = document.createElement("div"), i.className = "se-contextmenu", i.role = "menu", i.draggable = !1, i.tabIndex = -1, document.body.appendChild(i)) : (i.classList.add("se-contextmenu", "fixed"), i.role = "menu", i.innerHTML = "");
  for (let t = 0; t < this.items.length; t++) {
    const n = this.items[t], r = this.build(n), s = r.querySelector("se-button");
    s ? (s.addEventListener("click", this.bind.click(n)), s.addEventListener("click", this.closeHandler)) : (r.addEventListener("click", this.bind.click(n)), r.addEventListener("click", this.closeHandler)), i.appendChild(r);
  }
  return i;
};
Qe.prototype.build = function(i) {
  if (i.spec && i.spec.render)
    return i.spec.render.apply(i);
  const t = document.createElement("div");
  if (t.role = "menuitem", t.className = "item", i.name == "|")
    return t.className = "divider", t.role = "separator", t;
  const n = document.createElement("button");
  n.type = "button", n.className = "se-button", n.role = "menuitem", n.disabled = i.disabled == !0, n.setAttribute("title", i.title || i.label);
  const r = document.createElement("span");
  r.className = "icon", i.icon && r.appendChild(ne.create(i.icon));
  const s = document.createElement("span");
  s.className = "text", s.appendChild(document.createTextNode(i.label));
  const o = document.createElement("span");
  return o.className = "shortcut", i.shortcut && o.appendChild(document.createTextNode(i.shortcut)), n.appendChild(r), n.appendChild(s), n.appendChild(o), t.appendChild(n), t;
};
Qe.prototype.open = function(i, t) {
  const n = this, r = this.getContainer(!0);
  r.style.top = i.top, r.style.left = i.left, r.style.display = "block", this.callback = t, setTimeout(function() {
    document.body.addEventListener("click", n.closeHandler), document.body.addEventListener("contextmenu", n.closeHandler);
  }, 200);
};
Qe.prototype.show = function(i) {
  let t = this, n = this.getContainer(!0), r = document.documentElement.scrollTop, s = document.documentElement.scrollLeft, o = r + i.clientY, l = s + i.clientX;
  return n.style.display = "block", o + n.offsetHeight > r + document.documentElement.clientHeight && (o = o - n.offsetHeight), o < r && (o = r), l + n.offsetWidth > s + document.documentElement.clientWidth && (l = l - n.offsetWidth), l < s && (l = s), n.style.top = o + "px", n.style.left = l + "px", n.style.display = "block", n.focus(), setTimeout(function() {
    document.body.addEventListener("click", t.closeHandler), document.body.addEventListener("contextmenu", t.closeHandler);
  }, 200), this;
};
Qe.prototype.close = function() {
  const i = this.getContainer(!1);
  i && (i.classList.contains("fixed") ? (i.style.display = "none", i.innerHTML = "") : (i.remove(!0), this.container = null)), document.body.removeEventListener("click", this.closeHandler), document.body.removeEventListener("contextmenu", this.closeHandler);
};
Qe.prototype.destroy = function() {
  const i = this.getContainer(!1);
  i && (i.remove(!0), this.container = null), document.body.removeEventListener("click", this.closeHandler), document.body.removeEventListener("contextmenu", this.closeHandler), this.container = null, this.items = null, this.bind = null, this.closeHandler = null;
};
const ze = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Bytes: Ae,
  ContextMenu: Qe,
  DOM: z,
  DataURI: yt,
  Divider: Bi,
  Draggable: dn,
  DropdownItem: aa,
  DropdownMenu: $e,
  Env: fn,
  Events: en,
  FilePicker: sa,
  FileType: Qr,
  ID: Zr,
  Icon: ne,
  MenuBar: Wn,
  MenuItem: jt,
  Resizable: sh,
  Resource: Pe,
  SVG: es,
  Template: oa,
  Value: la
}, Symbol.toStringTag, { value: "Module" })), { DOM: oh, Events: lh, MenuBar: ah, MenuItem: ch, DropdownMenu: uh } = ze, Pi = function(i, t) {
  this.editorView = i, this.items = t || [], this.render(i);
};
Pi.prototype.render = function(i) {
  let t = i.dom.closest("div.se-container"), n = t.querySelector("div.se-toolbar");
  if ((n == null || n == null) && (n = document.createElement("div"), n.className = "se-toolbar", t.firstChild ? t.insertBefore(n, t.firstChild) : t.appendChild(n)), n.childNodes.length < 1) {
    const r = {};
    r.click = function(o) {
      return function(l) {
        lh.stop(l), o.run && o.run(i.state, i.dispatch, i, l);
      };
    }, r.change = function(o) {
      return function(l) {
        for (let a = 0; a < o.items.length; a++) {
          const c = o.items[a];
          if (c.value == o.value) {
            c.spec.run && c.spec.run.apply(c, [i.state, i.dispatch, i, l]);
            break;
          }
        }
      };
    };
    const s = function(o, l) {
      if (this instanceof ch) {
        const a = this.element.querySelector("button.se-button");
        if (this.spec.select) {
          let u = this.spec.select(o.state);
          if (a.disabled = !u, !u)
            return !1;
        }
        let c = !0;
        if (this.spec.enable && (c = this.spec.enable(o.state) || !1, a.disabled = !c), this.spec.active) {
          let u = c && this.spec.active(o.state) || !1;
          oh.setClass(a, "active", u), a.setAttribute("aria-pressed", u.toString());
        }
      } else if (this instanceof uh) {
        this.name == "format";
        for (let a = 0; a < this.items.length; a++) {
          let c = this.items[a];
          if (c.spec.active && c.spec.active(o.state)) {
            this.setValue(c.value);
            break;
          }
        }
      }
      return !0;
    };
    for (let o = 0; o < this.items.length; o++) {
      let l = this.items[o];
      l.name != "|" && (l.update = s);
    }
    this.menubar = new ah(n, this.items, r), this.menubar.render();
  }
};
Pi.prototype.update = function(i, t) {
  this.menubar.update(i, t);
};
Pi.prototype.destroy = function() {
  this.menubar && this.menubar.destroy();
};
const ca = {};
ca.create = function(i) {
  return new xe({
    view: function(t) {
      return new Pi(t, i);
    }
  });
};
const V = {};
V.defaults = function() {
  return {
    // 菜单项配置
    menubar: {
      // 自定义菜单项，数组
      items: null,
      // 需要显示的菜单项，分隔符: [逗号 | 分号 | 空格 | 换行 | 回车]
      // 示例: save | bold italic underline strike forecolor backcolor clean | quote
      enabled: "*"
    },
    editor: {
      // 节点条配置
      nodebar: {
        enabled: !0
      },
      // 页面标题配置, 开启之后在编辑区顶部显式可输入的标题框
      title: {
        placeholder: "Page Title...",
        title: "Page Title",
        align: "center",
        value: "",
        enabled: !1
      },
      codeblock: {
        // 代码块高亮允许使用的语言
        languages: [
          { text: "Plain Text", value: "plaintext" },
          { text: "HTML", value: "html" },
          { text: "CSS", value: "css" },
          { text: "XML", value: "xml" },
          { text: "Javascript", value: "javascript" },
          { text: "Typescript", value: "typescript" },
          { text: "Python", value: "python" },
          { text: "PHP", value: "php" },
          { text: "Java", value: "cpp" },
          { text: "C#", value: "csharp" },
          { text: "SQL", value: "sql" },
          { text: "Ruby", value: "ruby" },
          { text: "Swift", value: "swift" },
          { text: "Bash", value: "bash" },
          { text: "Lua", value: "lua" },
          { text: "Groovy", value: "groovy" },
          { text: "Markdown", value: "markdown" }
        ]
      },
      // 编辑器打开时是否可编辑
      editable: !0,
      // 全屏方式，取值范围: [1 | 2]
      // 1: 系统级全屏，没有浏览器的地址栏、菜单等
      // 2: 页面级全屏，编辑器占满整个网页
      fullscreen: 1
    },
    // 上传配置
    upload: {
      image: {
        // 允许上传的图片类型
        accept: ".jpg, .png, .bmp, .gif, .webp",
        // 允许的图片最大大小
        maxSize: 2 * 1024 * 1024,
        // 是否允许上传图片
        enabled: !0
      },
      audio: {
        accept: ".mp3",
        maxSize: 5 * 1024 * 1024,
        enabled: !0
      },
      video: {
        accept: ".mp4",
        maxSize: 100 * 1024 * 1024,
        enabled: !0
      },
      attachment: {
        // 附件的默认类型为 *，当用户拖拽上传时，如果图片、视频、音频等都未能匹配到类型，将会匹配到附件的 *，这会导致任意类型都可以作为附件上传
        // 所以通常需要根据需要重新设置
        accept: "*",
        maxSize: 100 * 1024 * 1024,
        enabled: !0
      }
    },
    // 创建编辑器时的初始值，数据类型: [HTMLElement | String]
    value: null
  };
};
V.getValue = function(i, t) {
  const n = V.get(i, t, null);
  return n ?? V.get(V.DEFAULTS, t, null);
};
V.get = function(i, t, n) {
  let r = i, s = t.split(".").map(function(l) {
    return l.trim();
  });
  const o = /* @__PURE__ */ new Set([
    "__proto__",
    "constructor",
    "prototype",
    "eval",
    "Function",
    "Symbol",
    "Object"
  ]);
  for (let l = 0; l < s.length; l++) {
    let a = s[l];
    if (r == null || r == null)
      break;
    if (a.length < 1)
      continue;
    let c = a.indexOf("["), u = a.lastIndexOf("]");
    if (c > -1 && u > c && a.endsWith("]")) {
      let d = a.substring(0, c), h = parseInt(a.substring(c + 1, u).trim(), 10), f = r[d];
      if (o.has(d)) {
        r = null;
        break;
      }
      if (Array.isArray(f) && isNaN(h) == !1 && h >= 0 && h < f.length)
        r = f[h];
      else {
        r = null;
        break;
      }
    } else {
      if (o.has(a)) {
        r = null;
        break;
      }
      r = Object.prototype.hasOwnProperty.call(r, a) ? r[a] : null;
    }
  }
  return r != null && r != null ? r : n;
};
V.freeze = function(i) {
  return Object.freeze(i), Object.keys(i).forEach(function(t) {
    const n = i[t];
    typeof n == "object" && n != null && V.freeze(n);
  }), i;
};
V.getUploadConfig = function(i, t) {
  let n = V.get(V.DEFAULTS, t, null), r = Object.assign({}, n), s = V.get(i, t, null);
  if (s)
    for (const o in s) {
      const l = s[o];
      l != null && l != null && (r[o] = s[o]);
    }
  return r.test = function(o) {
    return this.accept == "*" ? !0 : this.accept.split(",").map(function(a) {
      return a.replace(/\./, "").trim();
    }).includes(o.toLowerCase());
  }, r;
};
V.getImage = function(i) {
  return V.getUploadConfig(i, "upload.image");
};
V.getAudio = function(i) {
  return V.getUploadConfig(i, "upload.audio");
};
V.getVideo = function(i) {
  return V.getUploadConfig(i, "upload.video");
};
V.getAttachment = function(i) {
  return V.getUploadConfig(i, "upload.attachment");
};
V.DEFAULTS = V.freeze(V.defaults());
const Un = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Config: V
}, Symbol.toStringTag, { value: "Module" })), { Config: dh } = Un, Et = function(i, t) {
  this.hlsb = !0, this.render(i);
};
Et.prototype.render = function(i) {
  const t = this, n = i.dom.closest("div.se-container");
  this.wrapper = n.querySelector(":scope > div.se-nodebar"), this.enabled = dh.getValue(this.opts, "editor.nodebar.enabled"), (this.wrapper == null || this.wrapper == null) && (this.wrapper = document.createElement("div"), this.wrapper.className = "se-nodebar", n.querySelector("div.se-frame") ? n.insertBefore(this.wrapper, n.querySelector("div.se-frame")) : n.appendChild(this.wrapper)), this.enabled == !1 && (this.wrapper.style.display = "none"), this.wrapper.childNodes.length < 1 && (this.wrapper.innerHTML = [
    '<span class="checkbox checked" role="checkbox" aria-checked="true" tabindex="0" title="是否高亮显示当前块。"></span>',
    '<span class="se-root">html</span>',
    '<span class="se-body">body</span>'
  ].join(""), this.wrapper.querySelector("span.checkbox").addEventListener("click", function() {
    this.classList.toggle("checked");
    const r = this.classList.contains("checked");
    this.setAttribute("aria-checked", r), t.hlsb = r, t.backbar.style.display = r ? "block" : "none";
  }), this.backbar = document.createElement("div"), this.backbar.className = "se-backbar", this.backbar.style.display = "none", i.dom.parentNode.appendChild(this.backbar), t.hls(i));
};
Et.prototype.update = function(i, t) {
  const n = i.state;
  if (t && t.doc.eq(n.doc) && t.selection.eq(n.selection))
    return;
  this.hls(i), this.wrapper.querySelectorAll(":scope span.se-node").forEach(function(s) {
    s.remove();
  });
  const r = this.getActiveElement(i);
  if (r) {
    let s = [], o = r;
    for (; o && !(o.classList.contains("ProseMirror") || o.nodeName == "BODY"); )
      s.push(o), o = o.parentNode;
    for (let l = s.length - 1; l > -1; l--) {
      const a = s[l], c = document.createElement("span");
      c.className = "se-node", c.appendChild(document.createTextNode(a.nodeName.toLowerCase())), this.wrapper.appendChild(c);
    }
  }
};
Et.prototype.hls = function(i) {
  const t = this.getBlockElement(i);
  if (t == null || t == null || t.parentNode == null) {
    this.backbar.style.display = "none";
    return;
  }
  const n = this.backbar.parentNode, r = n.getBoundingClientRect(), s = t.getBoundingClientRect(), o = this.getZoom(n), l = s.left - r.left + n.scrollLeft, a = s.top - r.top + n.scrollTop - 1, c = s.width + 0, u = s.height + 1;
  t.classList.contains("tableWrapper") ? this.backbar.classList.add("table") : this.backbar.classList.remove("table"), this.backbar.style.top = (a / o).toFixed(2) + "px", this.backbar.style.left = (l / o).toFixed(2) + "px", this.backbar.style.width = (c / o).toFixed(2) + "px", this.backbar.style.height = (u / o).toFixed(2) + "px", this.backbar.style.display = this.hlsb ? "block" : "none";
};
Et.prototype.getZoom = function(i) {
  if (document.defaultView && document.defaultView.getComputedStyle) {
    const t = document.defaultView.getComputedStyle(i, null);
    if (t != null)
      return parseFloat(t.getPropertyValue("zoom")) || 1;
  }
  return 1;
};
Et.prototype.getActiveElement = function(i) {
  const { selection: t } = i.state, n = t.$from;
  for (let r = n.depth; r >= 0; r--) {
    const s = n.start(r), o = i.domAtPos(s).node;
    if (o)
      return o;
  }
  return null;
};
Et.prototype.getBlockElement = function(i) {
  const { selection: t } = i.state, { $from: n } = t;
  let r = -1;
  for (let l = n.depth; l >= 0; l--)
    if (n.node(l).isBlock) {
      r = l;
      break;
    }
  if (r < 0)
    return null;
  const s = t.$from.start(r), o = i.domAtPos(s).node;
  if (o) {
    let l = o;
    for (; l != null; ) {
      if (l.parentNode == null || l.nodeName == "BODY")
        return null;
      if (l.parentNode.classList.contains("ProseMirror"))
        return l;
      l = l.parentNode;
    }
  }
  return null;
};
Et.prototype.destroy = function() {
  this.wrapper && this.wrapper.remove(), this.backbar && this.backbar.remove(), this.wrapper = null, this.backbar = null;
};
const ua = {};
ua.create = function(i, t) {
  return new xe({
    view: function(n) {
      return new Et(n);
    }
  });
};
const { DOM: hh } = ze, { Config: vn } = Un, Fi = function(i, t) {
  this.view = i, this.opts = t, this.render(i);
};
Fi.prototype.render = function(i) {
  const t = i.dom.parentNode;
  if (this.wrapper = t.querySelector(":scope > div.se-title"), this.wrapper == null || this.wrapper == null) {
    const n = hh.create("input", {
      name: "title",
      type: "text",
      class: "title",
      placeholder: vn.getValue(this.opts, "editor.title.placeholder"),
      title: vn.getValue(this.opts, "editor.title.title"),
      value: vn.getValue(this.opts, "editor.title.value")
    }), r = vn.getValue(this.opts, "editor.title.align");
    (r == "left" || r == "right") && (n.className = "title " + r), vn.getValue(this.opts, "editor.editable") == !1 && (n.readonly = !0), this.opts.title && (n.value = this.opts.title), this.wrapper = document.createElement("div"), this.wrapper.className = "se-title", this.wrapper.appendChild(n), t.firstChild ? t.insertBefore(this.wrapper, t.firstChild) : t.appendChild(this.wrapper);
  }
};
Fi.prototype.update = function(i, t) {
};
Fi.prototype.destroy = function() {
  this.wrapper && this.wrapper.remove(), this.wrapper = null;
};
const da = {};
da.create = function(i) {
  return new xe({
    view: function(t) {
      return new Fi(t, i);
    }
  });
};
const ts = function() {
};
ts.prototype.decorations = function(i) {
  const t = i.doc;
  if ((t.childCount == 1 && t.firstChild.isTextblock && t.firstChild.content.size == 0) == !1)
    return H.empty;
  const r = function() {
    const o = document.createElement("div");
    return o.className = "se-placeholder", o.textContent = "Type here", o;
  }, s = le.widget(
    0,
    // 插入位置
    r,
    {
      // 确保 placeholder 只在编辑器空且失焦/聚焦但无内容时显示
      key: "placeholder",
      side: -1
    }
  );
  return H.create(t, [s]);
};
ts.prototype.handleDOMEvents = {
  focus: function(i) {
    i.dom.style.position = "relative";
  },
  blur: function(i) {
    i.dom.style.position = "relative";
  }
};
const ha = {};
ha.create = function() {
  return new xe({
    props: new ts()
  });
};
const jn = function(i, t) {
  this.lang = i, this.bundle = t || {};
};
jn.prototype.get = function(i) {
  return this.bundle[i];
};
jn.prototype.format = function(i) {
  let t, n = [], r = [].slice.call(arguments, 1);
  for (let s = 0, o = i.length; s < o; s++)
    if (t = i.charAt(s), t == "\\" && s < o - 1)
      if (s = s + 1, t = i.charAt(s), t == "{" || t == "}") {
        n.push(t);
        continue;
      } else {
        n.push("\\"), n.push(t);
        continue;
      }
    else if (t == "{") {
      let l = i.indexOf("}", s + 1);
      if (l > -1) {
        let a = parseInt(i.substring(s + 1, l));
        !isNaN(a) && a < r.length && n.push(r[a] || ""), s = l;
      } else {
        n.push(i.substring(s + 1));
        break;
      }
    } else
      n.push(t);
  return n.join("");
};
jn.prototype.replace = function(i) {
  this.bundle = Object.assign({}, i);
};
const _n = {
  bundles: {}
};
_n.getName = function(i) {
  return i.replace(/-/g, "_").toUpperCase();
};
_n.getBundle = function(i) {
  const t = this.getName(i), n = this.bundles[t];
  return new jn(i, n);
};
_n.setup = function(i, t) {
  const n = this.getName(i), r = Object.assign({}, t);
  this.bundles[n] = r;
};
_n.setup("default", {
  "tool.save.label": "保存",
  "tool.save.title": "保存",
  "tool.cut.label": "剪切",
  "tool.cut.title": "剪切",
  "tool.copy.label": "复制",
  "tool.copy.title": "复制",
  "tool.paste.label": "粘贴",
  "tool.paste.title": "粘贴",
  "tool.format.label": "正文",
  "tool.format.title": "正文",
  "tool.fontfamily.label": "默认",
  "tool.fontfamily.title": "字体",
  "tool.fontsize.label": "默认",
  "tool.fontsize.title": "字体大小",
  "tool.quote.label": "块引用",
  "tool.quote.title": "块引用",
  "tool.strong.label": "加粗",
  "tool.strong.title": "加粗",
  "tool.italic.label": "斜体",
  "tool.italic.title": "斜体",
  "tool.underline.label": "下划线",
  "tool.underline.title": "下划线",
  "tool.strike.label": "删除线",
  "tool.strike.title": "删除线",
  "tool.forecolor.label": "字体颜色",
  "tool.forecolor.title": "字体颜色",
  "tool.backcolor.label": "背景颜色",
  "tool.backcolor.title": "背景颜色",
  "tool.clean.label": "清除文字格式",
  "tool.clean.title": "清除文字格式",
  "tool.ulist.label": "无序列表",
  "tool.ulist.title": "无序列表",
  "tool.olist.label": "有序列表",
  "tool.olist.title": "有序列表",
  "tool.lift.label": "提升块",
  "tool.lift.title": "提升块",
  "tool.align.label": "对齐",
  "tool.align.title": "对齐",
  "tool.dedent.label": "减少缩进",
  "tool.dedent.title": "减少缩进",
  "tool.indent.label": "增加缩进",
  "tool.indent.title": "增加缩进",
  "tool.link.label": "超链接",
  "tool.link.title": "超链接",
  "tool.unlink.label": "取消超链接",
  "tool.unlink.title": "取消超链接",
  "tool.anchor.label": "锚点",
  "tool.anchor.title": "锚点",
  "tool.image.label": "插入图片",
  "tool.image.title": "插入图片",
  "tool.audio.label": "插入音频",
  "tool.audio.title": "插入音频",
  "tool.video.label": "插入视频",
  "tool.video.title": "插入视频",
  "tool.attachment.label": "插入附件",
  "tool.attachment.title": "插入附件",
  "tool.hr.label": "插入水平线",
  "tool.hr.title": "插入水平线",
  "tool.emot.label": "插入表情",
  "tool.emot.title": "插入表情",
  "tool.table.label": "插入表格",
  "tool.table.title": "插入表格",
  "tool.code.label": "代码块",
  "tool.code.title": "代码块",
  "tool.preview.label": "预览",
  "tool.preview.title": "预览",
  "tool.undo.label": "撤销",
  "tool.undo.title": "撤销",
  "tool.redo.label": "重做",
  "tool.redo.title": "重做",
  "tool.print.label": "打印",
  "tool.print.title": "打印",
  "tool.fullscreen.label": "全屏",
  "tool.fullscreen.title": "全屏",
  "tool.assets.label": "资源管理",
  "tool.assets.title": "资源管理",
  "tool.about.label": "关于 StackEditor",
  "tool.about.title": "关于 StackEditor",
  "tool.share.label": "分享",
  "tool.share.title": "分享",
  "tool.lock.label": "加锁",
  "tool.lock.title": "加锁",
  "tool.info.label": "属性",
  "tool.info.title": "属性",
  "tool.setting.label": "设置",
  "tool.setting.title": "设置",
  "cut.unavailable": "您的浏览器安全设置不允许使用剪切操作，请使用键盘(Ctrl + X)来完成。",
  "copy.unavailable": "您的浏览器安全设置不允许使用复制操作，请使用键盘(Ctrl + C)来完成。",
  "paste.unavailable": "您的浏览器安全设置不允许使用粘贴操作，请使用键盘(Ctrl + V)来完成。",
  "format.h1": "标题1",
  "format.h2": "标题2",
  "format.h3": "标题3",
  "format.h4": "标题4",
  "format.h5": "标题5",
  "format.h6": "标题6",
  "format.p": "正文",
  "format.pre": "已编排格式",
  "align.left": "左对齐",
  "align.center": "居中",
  "align.right": "右对齐",
  "align.justify": "两端对齐",
  "image.online": "网络图片",
  "image.upload": "上传图片",
  "video.online": "网络视频",
  "video.upload": "上传视频",
  "audio.online": "网络音频",
  "audio.upload": "上传音频",
  "attachment.upload": "上传附件",
  "text.none": "无",
  "select.default": "默认",
  "link.url": "链接地址",
  "link.title": "链接標題",
  "link.title.value": "点击打开链接",
  "link.target.type": "打开方式",
  "link.target.newwindow": "新窗口",
  "link.target.self": "当前窗口",
  "link.target.parent": "父窗口",
  "link.referer": "引用",
  "anchor.name": "锚点名称",
  "image.url": "图片文件",
  "image.alt": "替换文本",
  "image.width": "图片宽度",
  "image.height": "图片高度",
  "image.border": "边框大小",
  "image.hspace": "水平间距",
  "image.vspace": "垂直间距",
  "audio.url": "音频文件",
  "audio.width": "音频宽度",
  "audio.height": "音频高度",
  "video.url": "视频地址",
  "video.width": "视频宽度",
  "video.height": "视频高度",
  "dialog.back": "返 回",
  "dialog.ensure": "确 定",
  "dialog.cancel": "取 消"
});
const fa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BundleManager: _n,
  LocalizationContext: jn
}, Symbol.toStringTag, { value: "Module" })), { DOM: ns, Template: pn } = ze, { BundleManager: fh } = fa, mn = fh.getBundle("default"), Q = function() {
  this.block = !1, this.callback = null;
};
Q.prototype.open = function(i, t) {
  const n = this.create();
  if (i) {
    let r = this.getPosition(i), s = r.y + 32, o = r.x;
    o + n.offsetWidth > document.documentElement.scrollLeft + document.documentElement.clientWidth && (o = document.documentElement.scrollLeft + document.documentElement.clientWidth - n.offsetWidth - 20), n.style.top = s + "px", n.style.left = o + "px";
  } else
    ns.center(n);
  n.focus(), this.callback = t;
};
Q.prototype.create = function(i, t) {
  return this.getContainer();
};
Q.prototype.getContainer = function(i) {
  let t = this, n = document.getElementById("se-menu-dialog");
  if (n == null && i == !0) {
    let r = document.createElement("div");
    r.className = "se-mask", n = document.createElement("div"), n.id = "se-menu-dialog", n.className = "se-dialog", n.tabIndex = -1, n.addEventListener("keydown", function(s) {
      (s.target || s.srcElement).getAttribute("data-esc") != "0" && s.key == "Escape" && t.close();
    }), r.addEventListener("click", function(s) {
      if (t.block == !0)
        return;
      (s.target || s.srcElement).className == "se-mask" && t.close();
    }), r.appendChild(n), document.body.appendChild(r);
  }
  return n;
};
Q.prototype.getPosition = function(i) {
  const t = i.getBoundingClientRect();
  return { x: t.left, y: t.top };
};
Q.prototype.getData = function(i) {
  return null;
};
Q.prototype.click = Q.prototype.ensure = function(i) {
  this.close(this.getData(i));
};
Q.prototype.close = function(i) {
  const t = this.getContainer(), n = this.callback;
  t && t.closest("div.se-mask").remove(), this.callback = null, n && n(i);
};
const Ie = new Q();
Ie.create = function() {
  const i = this.getContainer(!0);
  i.innerHTML = this.getContent();
  const t = i.querySelectorAll("div.se-color-panel"), n = i.querySelector("button.se-cp-clear");
  return t.forEach(function(r) {
    r.addEventListener("mouseover", function(s) {
      Ie.setColor(s);
    }), r.addEventListener("click", function(s) {
      Ie.click(s);
    });
  }), n && (n.addEventListener("mouseover", function(r) {
    Ie.setColor(r);
  }), n.addEventListener("click", function(r) {
    Ie.click(r);
  })), i;
};
Ie.getContent = function() {
  const i = [
    "ffffff",
    "000000",
    "eeece1",
    "1f497d",
    "4f81bd",
    "c0504d",
    "9bbb59",
    "8064a2",
    "4bacc6",
    "f79646",
    "f2f2f2",
    "7f7f7f",
    "ddd9c3",
    "c6d9f0",
    "dbe5f1",
    "f2dcdb",
    "ebf1dd",
    "e5e0ec",
    "dbeef3",
    "fdeada",
    "d8d8d8",
    "595959",
    "c4bd97",
    "8db3e2",
    "b8cce4",
    "e5b9b7",
    "d7e3bc",
    "ccc1d9",
    "b7dde8",
    "fbd5b5",
    "bfbfbf",
    "3f3f3f",
    "938953",
    "548dd4",
    "95b3d7",
    "d99694",
    "c3d69b",
    "b2a2c7",
    "92cddc",
    "fac08f",
    "a5a5a5",
    "262626",
    "494429",
    "17365d",
    "366092",
    "953734",
    "76923c",
    "5f497a",
    "31859b",
    "e36c09",
    "7f7f7f",
    "0c0c0c",
    "1d1b10",
    "0f243e",
    "244061",
    "632423",
    "4f6128",
    "3f3151",
    "205867",
    "974806",
    "c00000",
    "ff0000",
    "ffc000",
    "ffff00",
    "92d050",
    "00b050",
    "00b0f0",
    "0070c0",
    "002060",
    "7030a0"
  ], t = [
    '<div style="padding: 16px;">',
    '<div style="clear: both; height: 28px;">',
    '<input id="se-cp-preview" class="se-cp-preview" value=""/>',
    '<button class="se-cp-clear none" data-value="default">默认颜色</button>',
    "</div>",
    '<div class="se-cp-label">主题颜色</div>'
  ];
  for (let n = 0; n < 6; n++) {
    t.push('<div class="se-color-panel">');
    for (let r = 0; r < 10; r++) {
      let s = n * 10 + r;
      t.push('<span class="se-cp-box" style="background-color: #' + i[s] + ';" data-value="' + i[s] + '" tabindex="0" title="#' + i[s] + '""></span>');
    }
    t.push("</div>");
  }
  t.push('<div class="se-cp-label">标准颜色</div>'), t.push('<div class="se-color-panel">');
  for (let n = 0; n < 10; n++) {
    let r = 60 + n;
    t.push('<span class="se-cp-box" style="background-color: #' + i[r] + ';" data-value="' + i[r] + '" tabindex="0" title="' + i[r] + '"></span>');
  }
  return t.push("</div></div></div>"), t.join("");
};
Ie.setColor = function(i) {
  const t = this.getContainer(), r = (i.srcElement || i.target).getAttribute("data-value");
  if (!i.ctrlKey && r) {
    const s = t.querySelector("input.se-cp-preview");
    if (s)
      if (r == "default")
        s.classList.add("none"), s.style.backgroundColor = "unset", s.style.color = "unset", s.value = "";
      else {
        const o = this.getForeColor(r);
        s.classList.remove("none"), s.setAttribute("data-value", r), s.style.backgroundColor = "#" + r, s.style.color = "#" + o, s.value = "#" + r;
      }
  }
};
Ie.getForeColor = function(i) {
  let t = [], n = parseInt(i.substring(0, 2), 16), r = parseInt(i.substring(2, 4), 16), s = parseInt(i.substring(4, 6), 16);
  return n = n > 255 - n ? 0 : 255, r = r > 255 - r ? 0 : 255, s = s > 255 - s ? 0 : 255, t.push(n.toString(16).padStart(2, "0")), t.push(r.toString(16).padStart(2, "0")), t.push(s.toString(16).padStart(2, "0")), t.join("");
};
Ie.getData = function(i) {
  return "#" + (i.srcElement || i.target).getAttribute("data-value");
};
const Ot = new Q();
Ot.create = function() {
  const i = this.getContainer(!0);
  return this.block = !0, i.innerHTML = pn.merge(this.getContent(), mn.bundle), i.querySelector(":scope > span.close").addEventListener("click", function() {
    Ot.close();
  }), i.querySelector("button[name='ensure']").addEventListener("click", function() {
    Ot.ensure();
  }), i.querySelector("button[name='cancel']").addEventListener("click", function() {
    Ot.close();
  }), i;
};
Ot.getContent = function() {
  return [
    '<span class="close"></span>',
    '<div class="se-form" style="width: 400px;">',
    '<div class="se-form-row">',
    '<div class="se-form-label">${link.url}</div>',
    '<div class="se-form-field"><input type="text" name="url" spellcheck="false" value="http://"/></div>',
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">${link.title}</div>',
    '<div class="se-form-field"><input type="text" name="title" spellcheck="false" value="${link.title.value}"/></div>',
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">${link.target.type}</div>',
    '<div class="se-form-field">',
    '<select name="target">',
    '<option selected="true" value="">${select.default}</option>',
    '<option value="_blank">${link.target.newwindow}</option>',
    '<option value="_self">${link.target.self}</option>',
    '<option value="_parent">${link.target.parent}</option>',
    "</select>",
    "</div>",
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">${link.referer}</div>',
    '<div class="se-form-field"><input name="referer" type="checkbox" style="margin-top: 0px; vertical-align: middle;" value="1"/></div>',
    "</div>",
    '<div class="se-form-ctrl center"><button name="ensure">${dialog.ensure}</button><button name="cancel">${dialog.cancel}</button></div>',
    "</div>"
  ].join("");
};
Ot.getData = function() {
  const i = this.getContainer(), t = {};
  return i && (t.href = i.querySelector("input[name='url']").value, t.title = i.querySelector("input[name='title']").value, t.target = i.querySelector("select[name='target']").value, t.referer = i.querySelector("input[name='referer']").checked, t.target == "" && (t.target = null), t.referer != !0 && (t.referer = null)), t;
};
const tn = new Q();
tn.create = function() {
  const i = this.getContainer(!0);
  return this.block = !0, i.innerHTML = pn.merge(this.getContent(), mn.bundle), i.querySelector("button[name='ensure']").addEventListener("click", function() {
    tn.ensure();
  }), i.querySelector("button[name='cancel']").addEventListener("click", function() {
    tn.close();
  }), i;
};
tn.getContent = function() {
  return [
    '<div class="se-form" style="width: 400px;">',
    '<div class="se-form-row">',
    '<div class="se-form-label">${anchor.name}</div>',
    '<div class="se-form-field"><input type="text" name="href" spellcheck="false" value=""/></div>',
    "</div>",
    '<div class="se-form-ctrl center"><button name="ensure">${dialog.ensure}</button><button name="cancel">${dialog.cancel}</button></div>',
    "</div>"
  ].join("");
};
tn.getData = function() {
  const i = this.getContainer(), t = { class: "anchor", href: "#unnamed", title: "#unnamed", text: "¶" };
  if (i) {
    const n = "#" + i.querySelector("input[name='href']").value;
    t.href = n, t.title = n;
  }
  return t;
};
const qt = new Q();
qt.create = function() {
  const i = this.getContainer(!0);
  return this.block = !0, i.innerHTML = pn.merge(this.getContent(), mn.bundle), i.querySelector(":scope > span.close").addEventListener("click", function() {
    qt.close();
  }), i.querySelector("button[name='ensure']").addEventListener("click", function() {
    qt.ensure();
  }), i.querySelector("button[name='cancel']").addEventListener("click", function() {
    qt.close();
  }), i;
};
qt.getContent = function() {
  return [
    '<span class="close"></span>',
    '<div class="se-form" style="width: 400px;">',
    '<div class="se-form-row">',
    '<div class="se-form-label">图片地址</div>',
    '<div class="se-form-field"><input type="text" name="src" spellcheck="false" value="http://"></div>',
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">图片描述</div>',
    '<div class="se-form-field"><input type="text" name="title" spellcheck="false" value=""></div>',
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">图片链接</div>',
    '<div class="se-form-field"><input type="text" name="url" spellcheck="false" style="" value=""></div>',
    "</div>",
    '<div class="se-form-ctrl center"><button name="ensure">${dialog.ensure}</button><button name="cancel">${dialog.cancel}</button></div>',
    "</div>"
  ].join("");
};
qt.getData = function(i) {
  const t = this.getContainer(), n = {};
  return t && (n.src = t.querySelector("input[name='src']").value, n.title = t.querySelector("input[name='title']").value, n.url = t.querySelector("input[name='url']").value), n;
};
const Dt = new Q();
Dt.create = function() {
  const i = this.getContainer(!0);
  return this.block = !0, i.innerHTML = pn.merge(this.getContent(), mn.bundle), i.querySelector(":scope > span.close").addEventListener("click", function() {
    Dt.close();
  }), i.querySelector("button[name='ensure']").addEventListener("click", function() {
    Dt.ensure();
  }), i.querySelector("button[name='cancel']").addEventListener("click", function() {
    Dt.close();
  }), i;
};
Dt.getContent = function() {
  return [
    '<span class="close"></span>',
    '<div class="se-form" style="width: 400px;">',
    '<div class="se-form-row">',
    '<div class="se-form-label">${video.url}</div>',
    '<div class="se-form-field"><input type="text" name="url" spellcheck="false" placeholder="音频频 URL 或第三方 &lt;iframe&gt;" value=""></div>',
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">${video.width}</div>',
    '<div class="se-form-field"><input type="text" name="width" spellcheck="false" style="width: 200px;" value="600"></div>',
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">${video.height}</div>',
    '<div class="se-form-field"><input type="text" name="height" spellcheck="false" style="width: 200px;" value="480"></div>',
    "</div>",
    '<div class="se-form-ctrl center"><button name="ensure">${dialog.ensure}</button><button name="cancel">${dialog.cancel}</button></div>',
    "</div>"
  ].join("");
};
Dt.getData = function(i) {
  const t = this.getContainer(), n = {};
  return t && (n.src = t.querySelector("input[name='url']").value, n.width = t.querySelector("input[name='width']").value, n.height = t.querySelector("input[name='height']").value), n;
};
const zt = new Q();
zt.create = function() {
  const i = this.getContainer(!0);
  return this.block = !0, i.innerHTML = pn.merge(this.getContent(), mn.bundle), i.querySelector(":scope > span.close").addEventListener("click", function() {
    zt.close();
  }), i.querySelector("button[name='ensure']").addEventListener("click", function() {
    zt.ensure();
  }), i.querySelector("button[name='cancel']").addEventListener("click", function() {
    zt.close();
  }), i;
};
zt.getContent = function() {
  return [
    '<span class="close"></span>',
    '<div class="se-form" style="width: 400px;">',
    '<div class="se-form-row">',
    '<div class="se-form-label">${audio.url}</div>',
    '<div class="se-form-field"><input type="text" name="url" spellcheck="false" placeholder="音频 URL" value=""></div>',
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">${audio.width}</div>',
    '<div class="se-form-field"><input type="text" name="width" spellcheck="false" style="width: 200px;" value="600"></div>',
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">${audio.height}</div>',
    '<div class="se-form-field"><input type="text" name="height" spellcheck="false" style="width: 200px;" value="480"></div>',
    "</div>",
    '<div class="se-form-ctrl center"><button name="ensure">${dialog.ensure}</button><button name="cancel">${dialog.cancel}</button></div>',
    "</div>"
  ].join("");
};
zt.getData = function(i) {
  const t = this.getContainer(), n = {};
  return t && (n.src = t.querySelector("input[name='url']").value, n.width = t.querySelector("input[name='width']").value, n.height = t.querySelector("input[name='height']").value), n;
};
const bt = new Q();
bt.create = function() {
  const i = this.getContainer(!0);
  i.innerHTML = this.getContent();
  const t = i.querySelectorAll("div.se-emot-panel ul li"), n = i.querySelectorAll("div.pagebar span.page");
  return t.forEach(function(r) {
    r.addEventListener("click", function(s) {
      bt.click(s);
    });
  }), n.forEach(function(r) {
    r.addEventListener("click", function(s) {
      bt.scroll(s);
    });
  }), i;
};
bt.getContent = function() {
  return [
    '<div class="se-emot-panel" style="padding: 16px 16px;">',
    "<ul>",
    "<li>😀</li>",
    "<li>😃</li>",
    "<li>😄</li>",
    "<li>😁</li>",
    "<li>😆</li>",
    "<li>😅</li>",
    "<li>😂</li>",
    "<li>🤣</li>",
    "<li>😊</li>",
    "<li>😇</li>",
    "<li>🙂</li>",
    "<li>🙃</li>",
    "<li>😉</li>",
    "<li>😌</li>",
    "<li>😍</li>",
    "<li>😘</li>",
    "<li>😗</li>",
    "<li>😙</li>",
    "<li>😚</li>",
    "<li>😋</li>",
    "<li>😛</li>",
    "<li>😝</li>",
    "<li>😜</li>",
    "<li>🤓</li>",
    "<li>😎</li>",
    "<li>😏</li>",
    "<li>😒</li>",
    "<li>😞</li>",
    "<li>😔</li>",
    "<li>😟</li>",
    "<li>😕</li>",
    "<li>🙁</li>",
    "<li>😣</li>",
    "<li>😖</li>",
    "<li>😫</li>",
    "<li>😩</li>",
    "<li>😢</li>",
    "<li>😭</li>",
    "<li>😤</li>",
    "<li>😠</li>",
    "<li>😡</li>",
    "<li>😳</li>",
    "<li>😱</li>",
    "<li>😨</li>",
    "<li>🤗</li>",
    "<li>🤔</li>",
    "<li>😶</li>",
    "<li>😑</li>",
    "<li>😬</li>",
    "<li>🙄</li>",
    "<li>😯</li>",
    "<li>😴</li>",
    "<li>😷</li>",
    "<li>🤑</li>",
    "<li>😈</li>",
    "<li>🤡</li>",
    "<li>💩</li>",
    "<li>👻</li>",
    "<li>💀</li>",
    "<li>👀</li>",
    "<li>👣</li>",
    "<li>👐</li>",
    "<li>🙌</li>",
    "<li>👏</li>",
    "<li>🤝</li>",
    "<li>👍</li>",
    "<li>👎</li>",
    "<li>👊</li>",
    "<li>✊</li>",
    "<li>🤛</li>",
    "<li>🤜</li>",
    "<li>🤞</li>",
    "<li>✌️</li>",
    "<li>🤘</li>",
    "<li>👌</li>",
    "<li>👈</li>",
    "<li>👉</li>",
    "<li>👆</li>",
    "<li>👇</li>",
    "<li>☝️</li>",
    "<li>✋</li>",
    "<li>🤚</li>",
    "<li>🖐</li>",
    "<li>🖖</li>",
    "<li>👋</li>",
    "<li>🤙</li>",
    "<li>💪</li>",
    "<li>🖕</li>",
    "<li>✍️</li>",
    "<li>🙏</li>",
    "<ul >",
    "</div>"
  ].join("");
};
bt.scroll = function(i) {
  let t = this.getContainer(), r = (i.srcElement || i.target).getAttribute("data-page");
  r && (t.querySelectorAll("div[data-page]").forEach(function(s) {
    s.style.display = "none";
  }), t.querySelector("div[data-page='" + r + "']").style.display = "block", t.querySelectorAll("div.pagebar span[data-page]").forEach(function(s) {
    s.classList.remove("active");
  }), t.querySelector("div.pagebar span[data-page='" + r + "']").classList.add("active"));
};
bt.getImage = function(i) {
  return { src: (i.srcElement || i.target).getAttribute("data-value") + ".gif", title: null, alt: null };
};
bt.getData = function(i) {
  return (i.srcElement || i.target).textContent;
};
const Vi = new Q();
Vi.create = function() {
  const i = this, t = this.getContainer(!0);
  this.block = !1, t.innerHTML = pn.merge(this.getContent(), mn.bundle);
  const n = t.querySelector("div.se-pick-info span.text"), r = t.querySelector("div.se-pick-area"), s = t.querySelector("div.se-pick-mask");
  return t.querySelector("div.se-form.f1 div.se-pick-info span.btn").addEventListener("click", function(o) {
    t.querySelector("div.se-form.f1").style.display = "none", t.querySelector("div.se-form.f2").style.display = "block", i.block = !0;
  }), t.querySelector("div.se-form.f2 button[name='back']").addEventListener("click", function(o) {
    t.querySelector("div.se-form.f1").style.display = "block", t.querySelector("div.se-form.f2").style.display = "none", i.block = !1;
  }), t.querySelector("div.se-form.f2 button[name='ensure']").addEventListener("click", function(o) {
    i.click(o);
  }), r.style.minWidth = "300px", r.style.minHeight = "300px", r.addEventListener("mousemove", function(o) {
    const l = o.srcElement || o.target;
    if (l.className.indexOf("se-pick-") < 0)
      return;
    const a = ns.getPosition(l), c = o.clientY - a.top, u = o.clientX - a.left, d = Math.max(Math.floor((c + 19) / 20), 1), h = Math.max(Math.floor((u + 19) / 20), 1), f = h * 20, p = d * 20;
    f >= 100 && f < 300 && (r.style.width = f + 20 + "px"), p >= 100 && p < 300 && (r.style.height = p + 20 + "px"), s.style.width = f + "px", s.style.height = p + "px", n.innerHTML = d + " x " + h;
  }), s.addEventListener("click", function(o) {
    i.click(o);
  }), t;
};
Vi.getContent = function() {
  return [
    '<div class="se-form f1" style="display: block;">',
    '<div class="se-pick-info"><span class="text">3 x 3</span><span class="btn">手动设置</span></div>',
    '<div class="se-pick-area">',
    '<div class="se-pick-mask"></div>',
    "</div>",
    "</div>",
    '<div class="se-form f2" style="width: 300px; display: none;">',
    '<div class="se-form-row">',
    '<div class="se-form-label">行数</div>',
    '<div class="se-form-field"><input type="text" name="rows" style="width: 80px;" spellcheck="false" value="3"/></div>',
    "</div>",
    '<div class="se-form-row">',
    '<div class="se-form-label">列数</div>',
    '<div class="se-form-field"><input type="text" name="cols" style="width: 80px;" spellcheck="false" value="3"/></div>',
    "</div>",
    '<div class="se-form-ctrl center"><button name="back">${dialog.back}</button><button name="ensure">${dialog.ensure}</button></div>',
    "</div>"
  ].join("");
};
Vi.getData = function(i) {
  const t = i.srcElement || i.target;
  if (t.nodeName == "BUTTON") {
    const r = this.getContainer(!0).querySelector("div.se-form.f2"), s = parseInt(r.querySelector("input[name='rows']").value);
    return parseInt(r.querySelector("input[name='cols']").value), { rows: s || 3, cols: s || 3 };
  } else {
    const n = ns.getPosition(t), r = i.clientY - n.top, s = i.clientX - n.left, o = Math.floor((r + 19) / 20), l = Math.floor((s + 19) / 20);
    return { rows: o, cols: l };
  }
};
const ph = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AnchorMenu: tn,
  AudioMenu: zt,
  ColorMenu: Ie,
  EmotMenu: bt,
  ImageMenu: qt,
  LinkMenu: Ot,
  TableMenu: Vi,
  ToolMenu: Q,
  VideoMenu: Dt
}, Symbol.toStringTag, { value: "Module" })), { DOM: Ge, Events: Ze, Bytes: di, Icon: Kn, Draggable: Jn } = ze, et = function(i) {
  this.container = null, this.files = i;
};
et.prototype.open = function(i) {
  const t = this.create();
  Ge.center(t), t.focus(), this.callback = i, this.load();
};
et.prototype.create = function() {
  const i = this, t = this.getContainer(!0);
  return t.innerHTML = this.getContent(), t.addEventListener("keydown", function(n) {
    const r = n.target || n.srcElement, s = n.key;
    if (r.getAttribute("data-esc") != "0") {
      if (s == "Enter") {
        Ze.stop(n), i.ensure();
        return;
      }
      s == "Escape" && (Ze.stop(n), i.close());
    }
  }), t.querySelector("div.header button.close").addEventListener("click", function(n) {
    i.close();
  }), t.querySelector("ul.se-outline-view").addEventListener("dblclick", function(n) {
    const s = (n.target || n.srcElement).closest("li.item");
    if (s) {
      const o = s.getAttribute("data-id");
      i.ensure(o);
    }
  }), Jn.bind(t.querySelector("div.header"), t), t;
};
et.prototype.getContainer = function() {
  if (this.container == null || this.container == null) {
    let i = document.createElement("div");
    i.className = "se-mask", i.style.display = "block";
    let t = document.createElement("div");
    t.className = "se-dialog", t.style.width = "800px", t.style.display = "block", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.tabIndex = -1, i.appendChild(t);
    const n = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    n ? n.appendChild(i) : document.body.appendChild(i), this.container = t;
  }
  return this.container;
};
et.prototype.getContent = function() {
  return [
    '<div class="header">',
    '<span class="icon">' + Kn.get("folder") + "</span>",
    "<h2>资源管理</h2>",
    '<button type="button" class="close" draggable="false" aria-label="关闭对话框；快捷键: ESC" title="快捷键: ESC"></button>',
    "</div>",
    "<div>",
    '<div style="height: 400px; overflow: auto;">',
    '<div class="se-info-view"></div>',
    '<ul class="se-outline-view"></ul>',
    "</div>",
    '<div class="se-status-bar" style="height: 32px; box-sizing: border-box; border-top: 1px solid #dddddd; overflow: auto;"></div>',
    "</div>"
  ].join("");
};
et.prototype.load = function() {
  this.show(this.files || []);
};
et.prototype.show = function(i) {
  const t = this.getContainer(), n = t.querySelector(":scope div.se-info-view"), r = t.querySelector(":scope div ul.se-outline-view");
  r.querySelectorAll(":scope > li.item").forEach(function(s) {
    s.remove();
  });
  for (let s = 0; s < i.length; s++) {
    let o = i[s], l = document.createElement("li");
    if (l.className = "item", l.draggable = !0, l.setAttribute("data-id", o.id), l.innerHTML = [
      '<div class="box" title="0.00 KB" tabindex="-1">',
      '<div class="icon"></div>',
      '<div class="name"></div>',
      "</div>"
    ].join(""), o.title ? l.querySelector(":scope > div.box").setAttribute("title", o.title) : o.name && l.querySelector(":scope > div.box").setAttribute("title", o.name), l.querySelector(":scope > div.box > div.name").textContent = o.name, o.type == "image") {
      let a = document.createElement("img");
      a.src = o.url, l.querySelector(":scope > div.box > div.icon").appendChild(a);
    } else o.type == "audio" ? l.querySelector(":scope > div.box > div.icon").classList.add("audio") : o.type == "video" ? l.querySelector(":scope > div.box > div.icon").classList.add("video") : l.querySelector(":scope > div.box > div.icon").classList.add("attachment");
    r.appendChild(l);
  }
  if (i.length < 1) {
    const s = document.createElement("div");
    s.style.cssText = "padding-top: 100px; font-size: 20px; color: #c0c0c0; text-align: center;", s.appendChild(document.createTextNode("资源库为空")), n.replaceChildren(s), n.style.display = "block", r.style.display = "none";
  } else
    n.style.display = "none", r.style.display = "block";
};
et.prototype.ensure = function(i) {
  this.view;
  let t = null;
  this.callback;
  for (let n = 0; n < this.files.length; n++)
    if (this.files[n].id == i) {
      t = Object.assign({}, this.files[n]);
      break;
    }
  t && this.callback && this.callback([t]);
};
et.prototype.close = function() {
  const i = this.getContainer();
  i && i.closest("div.se-mask").remove(), this.files = null, this.callback = null, this.container = null;
};
const ke = function(i, t) {
  this.files = i, this.handler = t;
};
ke.prototype.open = function() {
  const i = this.create();
  this.init(), Ge.center(i);
};
ke.prototype.init = function() {
  const i = this, t = this.files, n = this.getContainer();
  if (!(t == null || t == null || t.length < 1))
    if (t.length == 1)
      n.style.width = "600px", n.style.height = "300px", n.querySelector(":scope > div.body div.progress-panel").style.display = "block", n.querySelector(":scope > div.body div.files-panel").style.display = "none", n.querySelector(":scope > div.body div.progress-panel div.se-name").textContent = t[0].name;
    else {
      const r = n.querySelector(":scope > div.body div.files-panel > div.se-meta-data"), s = n.querySelector(":scope > div.body div.files-panel table.se-table");
      n.querySelector(":scope > div.body div.progress-panel").style.display = "none", n.querySelector(":scope > div.body div.files-panel").style.display = "block", r && (r.querySelector(":scope > div.se-meta-item span[data-name='threads']").textContent = Math.min(t.length, 5));
      for (let o = 0; o < t.length; o++) {
        const l = t[o], a = s.insertRow(-1), c = a.insertCell(-1), u = a.insertCell(-1), d = a.insertCell(-1), h = Ge.create("input", { name: "fileName", type: "text", class: "text", readonly: !0, value: l.name }), f = Ge.create("button", { type: "button", class: "btn abort" }, ["取 消"]);
        h.setAttribute("title", l.name + `\r
` + di.format(l.size, 2)), f.addEventListener("click", function(p) {
          Ze.stop(p), i.cancel(this.closest("tr.item"));
        }), a.className = "item", a.setAttribute("data-id", l.id), c.style.width = "200px", u.style.width = "400px", c.appendChild(h), u.innerHTML = [
          '<div class="se-progress thin">',
          '<div class="text">等待中...</div>',
          '<div class="xbar"></div>',
          "</div>"
        ].join(""), d.appendChild(f);
      }
    }
};
ke.prototype.create = function() {
  const i = this, t = this.getContainer();
  return t.innerHTML = this.getContent(), Jn.bind(t.querySelector("div.header"), t), t.querySelector("div.header button.close").addEventListener("click", function(n) {
    i.close();
  }), t.querySelector("div.progress-panel div.se-form-ctrl button.cancel").addEventListener("click", function(n) {
    this.getAttribute("data-status") != "4" ? (this.setAttribute("data-status", "4"), this.textContent = "关 闭", i.cancel(null)) : i.close();
  }), t.querySelector("div.files-panel div.se-form-ctrl button.cancel").addEventListener("click", function(n) {
    i.close();
  }), t;
};
ke.prototype.getContainer = function() {
  if (this.container == null || this.container == null) {
    const i = document.createElement("div");
    i.className = "se-mask", i.style.display = "block";
    const t = document.createElement("div");
    t.className = "se-dialog", t.style.width = "800px", t.style.height = "600px", t.style.display = "block", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.tabIndex = -1, i.appendChild(t), document.body.appendChild(i), this.container = t;
  }
  return this.container;
};
ke.prototype.getContent = function() {
  return [
    '<div class="header">',
    '<span class="icon">' + Kn.get("upload") + "</span>",
    "<h2>文件上传</h2>",
    '<button type="button" class="close" draggable="false" aria-label="关闭对话框；快捷键: ESC" title="快捷键: ESC"></button>',
    "</div>",
    '<div class="body">',
    '<div class="progress-panel" style="padding: 20px 40px; box-sizing: border-box; border: none; display: none;">',
    '<div style="height: 120px;">',
    '<div class="se-name"></div>',
    '<div class="se-progress" style="margin: 20px 0px;">',
    '<div class="text">0%</div>',
    '<div class="xbar"><div class="percent" style="width: 0%"></div></div>',
    "</div>",
    '<div class="se-meta-item"><span class="se-data-label">上传速度</span><span class="se-data-value" data-name="speed">--</span></div>',
    '<div class="se-meta-item"><span class="se-data-label">已传数据</span><span class="se-data-value" data-name="total">--</span></div>',
    "</div>",
    '<div class="se-form-ctrl pad20">',
    '<button class="button cancel">取 消</button>',
    "</div>",
    "</div>",
    '<div class="files-panel" style="margin: 20px 20px; padding: 20px 20px; display: none;">',
    '<div class="se-meta-data" style="clear: both; margin-bottom: 20px; overflow: hidden;">',
    '<div class="se-meta-item tasks"><span class="se-data-label">任务数</span><span class="se-data-value" data-name="tasks">0</span></div>',
    '<div class="se-meta-item success"><span class="se-data-label">成功数</span><span class="se-data-value" data-name="success">0</span></div>',
    '<div class="se-meta-item failed"><span class="se-data-label">失败数</span><span class="se-data-value" data-name="failed">0</span></div>',
    '<div class="se-meta-item loading"><span class="se-data-label">上传中</span><span class="se-data-value" data-name="loading">0</span></div>',
    '<div class="se-meta-item threads"><span class="se-data-label">并行数</span><span class="se-data-value" data-name="threads">5</span></div>',
    "</div>",
    '<div style="clear: both; height: 360px; box-sizing: border-box; border: 1px solid #f1f1f1; overflow: auto;">',
    '<table class="se-table"></table>',
    "</div>",
    '<div class="se-form-ctrl">',
    '<button title="button" class="button cancel" title="关闭">关 闭</button>',
    "</div>",
    "</div>",
    "</div>"
  ].join("");
};
ke.prototype.update = function(i, t, n) {
  const r = this.getContainer(), s = Math.min(Math.floor(t / n * 100), 100), o = t >= n, l = this.getMeta(i), a = (/* @__PURE__ */ new Date()).getTime(), c = a - l.time;
  if (!(l.status != 0 && l.status != 1)) {
    if (l.status = o ? 2 : 1, c > 200) {
      const u = (t - l.loaded) / (c / 1e3);
      l.loaded = t, l.time = a, l.speed = di.format(u, 2);
    }
    if (this.files.length == 1) {
      const u = r.querySelector(":scope > div.body div.progress-panel");
      u.querySelector(":scope div.se-progress > div.text").textContent = s + "%", u.querySelector(":scope div.se-progress > div.xbar").style.width = s + "%", c > 200 && (u.querySelector(":scope div.se-meta-item span[data-name='speed']").textContent = l.speed + "/s"), u.querySelector(":scope div.se-meta-item span[data-name='total']").textContent = di.format(t, 2) + "/" + di.format(n, 2);
    } else {
      const u = this.stat(), h = r.querySelector(":scope > div.body div.files-panel table.se-table").querySelector(":scope tr[data-id='" + i + "']");
      h && (h.querySelector(":scope td > div.se-progress > div.text").textContent = s + "%", h.querySelector(":scope td > div.se-progress > div.xbar").style.width = s + "%", o && (h.querySelector(":scope td > button.abort").disabled = !0));
      const f = r.querySelector(":scope > div.body div.files-panel > div.se-meta-data");
      f && (f.querySelector(":scope > div.se-meta-item span[data-name='tasks']").textContent = u.tasks, f.querySelector(":scope > div.se-meta-item span[data-name='loading']").textContent = u.loading, f.querySelector(":scope > div.se-meta-item span[data-name='success']").textContent = u.success, f.querySelector(":scope > div.se-meta-item span[data-name='failed']").textContent = u.failed);
    }
  }
};
ke.prototype.getMeta = function(i) {
  (this.context == null || this.context == null) && (this.context = {});
  let t = this.context[i];
  return (t == null || t == null) && (this.context[i] = t = { id: i, loaded: 0, time: (/* @__PURE__ */ new Date()).getTime(), speed: "0.00 KB", status: 0 }), t;
};
ke.prototype.stat = function(i) {
  const t = {
    tasks: 0,
    loading: 0,
    success: 0,
    failed: 0,
    cancel: 0
  };
  (this.context == null || this.context == null) && (this.context = {}), t.tasks = this.files.length;
  for (let n in this.context) {
    let r = this.context[n];
    r.status == 1 ? t.loading++ : r.status == 2 ? t.success++ : r.status == 3 ? t.failed++ : r.status == 4 && t.cancel++;
  }
  return t;
};
ke.prototype.cancel = function(i) {
  if (i) {
    const t = parseInt(i.getAttribute("data-id")), n = this.getMeta(t);
    this.handler && this.handler.abort && this.handler.abort(t), n.status = 4, i.querySelector("td div.se-progress div.text").textContent = "已取消";
  } else if (this.files.length == 1) {
    const t = this.files[0], n = this.getMeta(t.id);
    n.status == 1 ? (this.handler && this.handler.abort && this.handler.abort(t.id), n.status = 4) : this.close();
  }
};
ke.prototype.error = function(i, t) {
  const n = this.getContainer(), r = this.getMeta(i);
  if (r.status = 3, this.files.length == 1) {
    const s = n.querySelector(":scope > div.body div.progress-panel");
    s.querySelector(":scope div.se-progress > div.text").style.color = "#ff0000", s.querySelector(":scope div.se-progress > div.text").textContent = t;
  } else {
    const o = n.querySelector(":scope > div.body div.files-panel table.se-table").querySelector(":scope tr[data-id='" + i + "']"), l = Ge.create("input", { name: "error", type: "text", class: "error", readonly: !0, value: t });
    o && (o.querySelector(":scope td:nth-child(2)").replaceChildren(l), o.querySelector(":scope td > button.abort").disabled = !1);
    const a = this.stat(), c = n.querySelector(":scope > div.body div.files-panel > div.se-meta-data");
    c && (c.querySelector(":scope > div.se-meta-item span[data-name='tasks']").textContent = a.tasks, c.querySelector(":scope > div.se-meta-item span[data-name='loading']").textContent = a.loading, c.querySelector(":scope > div.se-meta-item span[data-name='success']").textContent = a.success, c.querySelector(":scope > div.se-meta-item span[data-name='failed']").textContent = a.failed);
  }
};
ke.prototype.close = function(i) {
  let t = this.getContainer();
  t && t.closest("div.se-mask").remove();
};
const tt = function(i) {
  this.container = null, this.data = i;
};
tt.prototype.open = function() {
  const i = this.create();
  i.focus(), Ge.center(i), this.show(this.data);
};
tt.prototype.create = function() {
  const i = this, t = this.getContainer(!0);
  return t.innerHTML = this.getContent(), t.addEventListener("keydown", function(n) {
    const r = n.target || n.srcElement, s = n.key;
    if (r.getAttribute("data-esc") != "0") {
      if (s == "Enter") {
        Ze.stop(n), i.ensure();
        return;
      }
      s == "Escape" && (Ze.stop(n), i.close());
    }
  }), t.querySelector("div.header button.close").addEventListener("click", function(n) {
    i.close();
  }), t.querySelector("div.se-form div.se-form-ctrl button.ensure").addEventListener("click", function(n) {
    i.ensure();
  }), t.querySelector("div.se-form div.se-form-ctrl button.cancel").addEventListener("click", function(n) {
    i.close();
  }), Jn.bind(t.querySelector("div.header"), t), t;
};
tt.prototype.getContainer = function() {
  if (this.container == null || this.container == null) {
    let i = document.createElement("div");
    i.className = "se-mask", i.style.display = "block";
    let t = document.createElement("div");
    t.className = "se-dialog", t.style.width = "800px", t.style.display = "block", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.tabIndex = -1, i.appendChild(t), document.body.appendChild(i), this.container = t;
  }
  return this.container;
};
tt.prototype.getContent = function() {
  return [
    '<div class="header">',
    '<span class="icon">' + Kn.get("info") + "</span>",
    "<h2>文档属性</h2>",
    '<button type="button" class="close" draggable="false" aria-label="关闭对话框；快捷键: ESC" title="快捷键: ESC"></button>',
    "</div>",
    '<div class="se-form" style="padding: 20px 80px;">',
    '<div class="se-g1" style="margin-bottom: 20px;">',
    '<input name="id" type="hidden" value="193">',
    '<input name="title" type="text" class="title" title="文档标题" value="">',
    "</div>",
    '<div class="se-g2">',
    '<div class="se-c1">文档类型:</div>',
    '<div class="se-c2">',
    '<select name="mimeType" style="width: 160px;" title="文档类型">',
    '<option value="text/html">text/html</option>',
    '<option value="text/mark">text/mark</option>',
    '<option value="text/plain">text/plain</option>',
    '<option value="text/javascript">text/javascript</option>',
    "</select>",
    "</div>",
    "</div>",
    '<div class="se-g2">',
    '<div class="se-c1">文档主题:</div>',
    '<div class="se-c2">',
    '<select name="theme" style="width: 160px;" title="文档主题">',
    '<option value="wiki">wiki</option>',
    '<option value="word">word</option>',
    '<option value="xxqx">小清新</option>',
    '<option value="code">技术型</option>',
    "</select>",
    '<div class="form-comment" style="clear: both; padding: 20px 0px;">文档主题用来指定文档的显示样式。文档主题分为全局主题和分类主题，全局主题针对所有分类和文档有效；分类主题针对该分类和该分类下的子分类、文档有效。全局主题请在设置项里面进行指定。分类主题请在分类属性中指定。</div>',
    "</div>",
    "</div>",
    '<div class="se-g2">',
    '<div class="se-c1">文档连接:</div>',
    '<div class="se-c2" data-name="url"></div>',
    "</div>",
    '<div class="se-g2">',
    '<div class="se-c1">创建时间:</div>',
    '<div class="se-c2"><input name="createTime" type="text" class="label" style="width: 200px;" title="创建时间" value="--"/></div>',
    "</div>",
    '<div class="se-g2">',
    '<div class="se-c1">更新时间:</div>',
    '<div class="se-c2"><input name="updateTime" type="text" class="label" style="width: 200px;" title="更新时间" value="--"/></div>',
    "</div>",
    '<div class="se-form-ctrl center">',
    '<button type="button" class="button ensure" title="确定 快捷键: ENTER">确 定</button>',
    '<button type="button" class="button cancel" title="取消 快捷键: ESC">取 消</button>',
    "</div>",
    "</div>"
  ].join("");
};
tt.prototype.show = function(i) {
  const n = this.getContainer().querySelector("div.se-form");
  n.querySelector("input[name='id']").value = i.id || "", n.querySelector("input[name='title']").value = i.title || "", n.querySelector("select[name='mimeType']").value = i.mimeType || "text/html", n.querySelector("select[name='theme']").value = i.theme || "wiki", i.url && n.querySelector("div[data-name='url']").replaceChildren(Ge.create("a", { href: i.url, title: "文档链接", target: "_blank" }, [i.url])), i.createTime && (n.querySelector("input[name='createTime']").value = i.createTime), i.updateTime && (n.querySelector("input[name='updateTime']").value = i.updateTime);
};
tt.prototype.getData = function() {
  const t = this.getContainer().querySelector("div.se-form"), n = {};
  return n.id = t.querySelector("input[name='id']").value, n.title = t.querySelector("input[name='title']").value, n.mimeType = t.querySelector("select[name='mimeType']").value, n.theme = t.querySelector("select[name='theme']").value, n;
};
tt.prototype.ensure = function() {
  this.getData(), this.close();
};
tt.prototype.close = function() {
  const i = this.getContainer();
  i && i.closest("div.se-mask").remove();
};
const nt = function(i) {
  this.container = null, this.data = i;
};
nt.prototype.open = function() {
  const i = this.create();
  i.focus(), Ge.center(i);
};
nt.prototype.create = function() {
  const i = this, t = this.getContainer(!0);
  return t.innerHTML = this.getContent(), t.addEventListener("keydown", function(n) {
    const r = n.target || n.srcElement, s = n.key;
    if (r.getAttribute("data-esc") != "0") {
      if (s == "Enter") {
        Ze.stop(n), i.ensure();
        return;
      }
      s == "Escape" && (Ze.stop(n), i.close());
    }
  }), t.querySelector("div.header button.close").addEventListener("click", function(n) {
    i.close();
  }), t.querySelector("div.se-form div.se-form-ctrl button.ensure").addEventListener("click", function(n) {
    i.ensure();
  }), t.querySelector("div.se-form div.se-form-ctrl button.cancel").addEventListener("click", function(n) {
    i.close();
  }), Jn.bind(t.querySelector("div.header"), t), t;
};
nt.prototype.getContainer = function() {
  if (this.container == null || this.container == null) {
    const i = document.createElement("div");
    i.className = "se-mask", i.style.display = "block";
    const t = document.createElement("div");
    t.className = "se-dialog", t.style.width = "800px", t.style.display = "block", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.tabIndex = -1, i.appendChild(t), document.body.appendChild(i), this.container = t;
  }
  return this.container;
};
nt.prototype.getContent = function() {
  return [
    '<div class="header">',
    '<span class="icon">' + Kn.get("setting") + "</span>",
    "<h2>设置</h2>",
    '<button type="button" class="close" draggable="false" aria-label="关闭对话框；快捷键: ESC" title="快捷键: ESC"></button>',
    "</div>",
    '<div class="se-form" style="padding: 20px 80px;">',
    '<div><p style="font-size: 16px;">暂时不需要任何设置</p></div>',
    '<div class="se-form-ctrl center">',
    '<button type="button" class="button ensure" title="确定 快捷键: ENTER">确 定</button>',
    '<button type="button" class="button cancel" title="取消 快捷键: ESC">取 消</button>',
    "</div>",
    "</div>"
  ].join("");
};
nt.prototype.show = function(i) {
  this.getContainer().querySelector("div.se-form");
};
nt.prototype.getData = function() {
  const t = this.getContainer().querySelector("div.se-form"), n = {};
  return n.id = t.querySelector("input[name='id']").value, n.title = t.querySelector("input[name='title']").value, n.mimeType = t.querySelector("select[name='mimeType']").value, n.theme = t.querySelector("select[name='theme']").value, n;
};
nt.prototype.ensure = function() {
  this.close();
};
nt.prototype.close = function() {
  const i = this.getContainer();
  i && i.closest("div.se-mask").remove();
};
const _t = function() {
  this.container = null;
};
_t.prototype.open = function(i, t, n, r) {
  const s = this.create();
  this.callback = r, i ? (s.querySelector("div.title").innerHTML = i, s.querySelector("div.title").style.display = "block") : s.querySelector("div.title").style.display = "none", t ? (s.querySelector("div.message").innerHTML = t, s.querySelector("div.message").style.display = "block") : s.querySelector("div.message").style.display = "none", n ? (n.includes("ensure") || s.querySelector("div.se-form-ctrl button.ensure").remove(), n.includes("cancel") || s.querySelector("div.se-form-ctrl button.cancel").remove()) : s.querySelector("div.se-form-ctrl button.cancel").remove(), Ge.center(s), s.focus();
};
_t.prototype.create = function() {
  const i = this, t = this.getContainer();
  return t.innerHTML = this.getContent(), t.addEventListener("keydown", function(n) {
    const r = n.target || n.srcElement, s = n.key;
    if (r.getAttribute("data-esc") != "0") {
      if (s == "Enter") {
        Ze.stop(n), i.ensure();
        return;
      }
      s == "Escape" && (Ze.stop(n), i.close());
    }
  }), t.querySelector("div.header button.close").addEventListener("click", function(n) {
    i.close();
  }), t.querySelector("div.se-form div.se-form-ctrl button.ensure").addEventListener("click", function(n) {
    i.ensure();
  }), t.querySelector("div.se-form div.se-form-ctrl button.cancel").addEventListener("click", function(n) {
    i.close();
  }), Jn.bind(t.querySelector("div.header"), t), t;
};
_t.prototype.getContainer = function() {
  if (this.container == null || this.container == null) {
    const i = document.createElement("div");
    i.className = "se-mask", i.style.display = "block";
    const t = document.createElement("div");
    t.className = "se-dialog", t.style.width = "600px", t.style.display = "block", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.tabIndex = -1, i.appendChild(t), document.body.appendChild(i), this.container = t;
  }
  return this.container;
};
_t.prototype.getContent = function() {
  return [
    '<div class="header">',
    '<span class="icon">' + Kn.get("warn") + "</span>",
    "<h2>提示</h2>",
    '<button type="button" class="close" draggable="false" aria-label="关闭对话框；快捷键: ESC" title="快捷键: ESC"></button>',
    "</div>",
    '<div class="se-form" style="padding: 40px 40px 0px 40px;;">',
    '<div class="title" style="font-size: 16px; line-height: 32px; font-weight: bold; color: #ff0000;"></div>',
    '<div class="message" style="font-size: 16px; line-height: 32px;"></div>',
    '<div class="se-form-ctrl pad40">',
    '<button class="button ensure" title="快捷键: ENTER">确 定</button>',
    '<button class="button cancel" title="快捷键: ESC">取 消</button>',
    "</div>",
    "</div>"
  ].join("");
};
_t.prototype.ensure = function() {
  const i = this.callback;
  this.close(), i && i();
};
_t.prototype.close = function() {
  const i = this.getContainer();
  i && i.closest("div.se-mask").remove(), this.callback = null;
};
const pa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AssetsDialog: et,
  ProfileDialog: nt,
  PropertyDialog: tt,
  UploadDialog: ke,
  WarnDialog: _t
}, Symbol.toStringTag, { value: "Module" })), mh = ke, ve = {};
ve.getXmlHttpRequest = function() {
  let i = null;
  return window.ActiveXObject != null && window.ActiveXObject != null ? i = new ActiveXObject("Microsoft.XMLHTTP") : i = new XMLHttpRequest(), i;
};
ve.request = function(i) {
  const t = i.transport ? i.transport : this.getXmlHttpRequest();
  if (t == null || t == null) {
    i.error && i.error("Can't create XMLHttpRequest instance.");
    return;
  }
  i.url;
  const n = i.method, r = i.headers;
  if (i.timeout && (t.timeout = i.timeout), t.open(n, i.url, i.async != !1), t.onreadystatechange = function() {
    t.readyState == XMLHttpRequest.DONE && t.status == 200, t.readyState == 4 && (i.callback != null ? i.callback(t) : t.status == 0 || t.status == 200 ? i.success != null && i.success(t) : (t.status == 404 || t.status == 500, i.error != null && i.error(t)));
  }, i.ontimeout && t.upload.addEventListener("timeout", i.ontimeout), i.onprogress && t.addEventListener("progress", i.onprogress), i.onuploadprogress && t.upload.addEventListener("progress", i.onuploadprogress), r != null)
    for (let s = 0; s < r.length; s++) {
      let o = r[s];
      t.setRequestHeader(o.name, o.value);
    }
  return t.send(i.data), t;
};
ve.slice = function(i, t, n) {
  let r = i;
  return t = t || 0, n = n || 0, i.slice && (r = i.slice(t, n)), i.webkitSlice && (r = i.webkitSlice(t, n)), i.mozSlice && (r = i.mozSlice(t, n)), r.contentType = i.type, i.fileName != null && i.fileName != null ? r.name = i.fileName : r.name = i.name, r;
};
ve.getFormData = function(i, t) {
  const n = arguments, r = new FormData();
  for (let s = 2; s < n.length; s++)
    this.append(r, n[s]);
  return r.append(i, t, t.name), r;
};
ve.append = function(i, t) {
  if (!(i == null || t == null))
    for (let n in t) {
      let r = t[n], s = typeof t[n];
      if (s == "string" || s == "number" || s == "boolean")
        i.append(n, r);
      else if (s == "object" && r.length != null)
        for (let o = 0; o < r.length; o++)
          r[o] != null && i.append(n, r[o]);
      else
        i.append(n, r);
    }
};
ve.getResponse = function(i) {
  try {
    return JSON.parse(i.responseText);
  } catch (t) {
    console.log("error: ", t.name, t.message), console.log(i.responseText);
  }
  return null;
};
let ma = class {
  constructor(t) {
    this.opts = t;
  }
  /**
   * @Override
   */
  upload(t, n) {
    const r = this, s = {}, o = Array.from(t).map(function(h, f) {
      return { id: f + 1, name: h.name, size: h.size };
    }), l = { abort: null }, a = new mh(o, l), c = o.slice(0), u = function() {
      if (c.length > 0) {
        const h = c.shift(), f = {
          item: h,
          update: function(m, y) {
            a.update(this.item.id, m, y);
          },
          success: function(m, y) {
            this.item.status != "ABORT" && n(m, y), u();
          },
          error: function(m) {
            a.error(this.item.id, m), u();
          }
        }, p = {};
        p.item = h, p.file = t[h.id - 1], p.handler = r.submit(t[h.id - 1], f), s[h.id] = p;
      } else
        a.close();
    };
    l.abort = function(h) {
      const f = s[h];
      f && (f.item.status = "ABORT", f.handler.abort());
    }, a.open();
    const d = Math.min(t.length, 5);
    for (let h = 0; h < d; h++)
      u();
  }
  submit(t, n) {
    const r = this.opts.url, s = this.getData(), o = this.opts.chunk || 5 * 1024 * 1024, l = new Xn();
    return l.upload({
      url: r,
      name: "file",
      file: t,
      data: s,
      chunk: o,
      retry: this.opts.retry || 3,
      getResponse: this.opts.getResponse,
      progress: function(a, c) {
        n.update(a, c);
      },
      cancel: function() {
        n.error("已取消");
      },
      success: function(a, c) {
        n.success(a, c.value);
      },
      error: function(a, c, u) {
        n.error(u);
      }
    }), {
      abort: function() {
        l.abort();
      }
    };
  }
  getData() {
    return this.opts.getData ? this.opts.getData() : null;
  }
}, gh = class {
  constructor(t) {
    this.opts = t;
  }
  upload(t, n) {
    const r = this, o = Array.from(t).slice(0), l = function() {
      if (o.length > 0) {
        const c = o.shift();
        r.submit(c, {
          success: function(u, d) {
            n(u, d), l();
          },
          error: function(u, d, h) {
            console.error(d.name, h), l();
          }
        });
      }
    }, a = Math.min(t.length, 5);
    for (let c = 0; c < a; c++)
      l();
  }
  submit(t, n) {
    const r = this, s = this.opts.url, o = function(l, a) {
      const c = r.getData(t, a);
      ve.request({
        method: "POST",
        url: s,
        headers: [{ name: "Content-type", value: "application/json" }],
        data: JSON.stringify(c),
        success: function(u) {
          let d = r.getResponse(u);
          d.status == 200 && d.value ? n.success(t, d.value) : n.error("上传失败: " + t.name);
        },
        error: function(u) {
          n.error("上传失败: " + t.name);
        }
      });
    };
    this.read(t, o);
  }
  read(t, n) {
    const r = new FileReader();
    r.onload = function(s) {
      const o = {};
      o.name = t.name, o.ext = t.name.split(".").pop(), o.size = t.size, o.data = s.target.result, n && n(t, o);
    }, r.readAsDataURL(t);
  }
  getData(t, n) {
    if (this.opts.getData)
      return this.opts.getData(t, n);
    const r = t.name.split(".").pop();
    return {
      docId: 1,
      name: t.name,
      ext: r,
      data: n.data.split(";base64,").pop()
    };
  }
  getResponse(t) {
    return this.opts.getResponse ? this.opts.getResponse(t) : ve.getResponse(t);
  }
}, yh = class extends ma {
  constructor() {
    super();
  }
  submit(t, n) {
    let r = this, s = 0, o = t.size, l = Math.max(Math.floor(o / 60), 1), a = 1, c = function() {
      s = Math.min(s + l, o), n.update(s, o), s < o ? a == 1 && setTimeout(c, 50) : r.read(t, function(u, d) {
        a == 1 && n.success(u, d);
      });
    };
    return c(), { abort: function() {
      a = 3;
    } };
  }
  read(t, n) {
    if (t.size < 1024) {
      const s = new FileReader();
      s.onload = function(o) {
        const l = {};
        l.url = o.target.result, l.ext = t.name.split(".").pop(), l.name = t.name, l.size = t.size, n && n(t, l);
      }, s.readAsDataURL(t);
    } else {
      const s = {};
      s.url = URL.createObjectURL(t), s.name = t.name, s.ext = t.name.split(".").pop(), s.size = t.size, n && n(t, s);
    }
  }
};
const Xn = function() {
  this.status = "done", this.transport = null;
};
Xn.prototype.upload = function(i) {
  if (this.status == "load")
    throw { name: "UploadException", message: "501" };
  this.submit(i, 0, 1, i.retry || 3);
};
Xn.prototype.submit = function(i, t, n, r) {
  const s = this, o = i.name, l = i.file, a = l.size, c = i.data, u = Math.min(t + i.chunk, a), d = "bytes " + t + "-" + u + "/" + a, h = ve.slice(l, t, u), f = ve.getFormData(o, h, c, {
    offset: t,
    length: u - t,
    chunk: i.chunk,
    size: a,
    modified: l.lastModified
  }), p = {};
  p.url = i.url, p.method = "POST", p.headers = [{ name: "Content-Range", value: d }], p.data = f, p.onuploadprogress = function(m) {
    if (m.lengthComputable) {
      const y = t + (m.loaded || m.position);
      i.progress(y, Math.max(y, a));
    }
  }, p.success = function(m) {
    if (m.status == 0) {
      s.status = "done", i.error(m, l, "AbortException");
      return;
    }
    let y = i.getResponse ? i.getResponse(m) : ve.getResponse(m);
    if (y.status == 201) {
      s.submit(i, t, n + 1, r);
      return;
    } else if (y.status == 500) {
      n <= r ? s.submit(i, t, n + 1, r) : (s.status = "done", i.error(m, l, y.status + ": " + y.message));
      return;
    }
    if (y.status != 200) {
      s.status = "done", i.error(m, l, y.status + ": " + y.message);
      return;
    }
    if (u >= a)
      s.status = "done", i.success(l, y);
    else {
      const b = y.value;
      if (b.token == null || b.token == null) {
        i.error(m, l, "服务端未返回有效的 Token");
        return;
      }
      i.data ? i.data.token = b.token : i.data = { token: b.token }, s.submit(i, u, 1, r);
    }
  }, p.error = function(m) {
    if (m.readyState == 0) {
      s.status = "done", i.error(m, l, "AbortException");
      return;
    }
    n <= r ? s.submit(i, t, n + 1, r) : (s.status = "done", i.error(m, l, "Upload Failed"));
  }, n > 1 && console.log("upload.error: retry " + (n - 1)), this.status = "load", this.transport = ve.request(p);
};
Xn.prototype.abort = function() {
  if (this.transport)
    try {
      this.transport.abort();
    } catch (i) {
      console.log("XMLHttpRequest.abort error: " + i.name + ", " + i.message);
    }
};
const ga = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Ajax: ve,
  Base64Upload: gh,
  ChunkedUpload: Xn,
  DefaultUpload: ma,
  MockUpload: yh
}, Symbol.toStringTag, { value: "Module" })), { TextSelection: bh } = Mc, { Fragment: hi, DOMParser: vh } = Za, { ColorMenu: ya, LinkMenu: wh, AnchorMenu: xh, ImageMenu: kh, VideoMenu: Sh, AudioMenu: Ch, EmotMenu: Mh, TableMenu: Eh } = ph, { AssetsDialog: Nh, UploadDialog: Th, ProfileDialog: Ah, WarnDialog: U } = pa, { DOM: ba, Bytes: ht, FileType: ko, FilePicker: Hi, Value: Ni } = ze, { Ajax: So, MockUpload: Oh } = ga, { Config: Je } = Un, we = {};
we.setFontFamily = function(i, t, n, r, s) {
  we.set(i.schema.marks.fontfamily, { family: s })(i, t, n, r);
};
we.setFontSize = function(i, t, n, r, s) {
  we.set(i.schema.marks.fontsize, { size: s })(i, t, n, r);
};
we.set = function(i, t) {
  return function(n, r) {
    const s = n.selection, o = i.create(t);
    let l = n.tr;
    return s.empty ? l = l.addStoredMark(o) : l = l.addMark(s.from, s.to, o), r && r(l), !0;
  };
};
we.remove = function(i) {
  return function(t, n) {
    const r = t.selection;
    let s = t.tr;
    return r.empty ? s = s.removeStoredMark(i) : s = s.removeMark(r.from, r.to, i), n && n(s), !0;
  };
};
const qe = { STEP: 2, MAX_INDENT: 20 };
qe.increase = function(i, t, n, r) {
  qe.change(i, t, n, r, 2);
};
qe.decrease = function(i, t, n, r) {
  qe.change(i, t, n, r, -2);
};
qe.reset = function(i, t, n, r) {
  qe.change(i, t, n, r, 0);
};
qe.change = function(i, t, n, r, s) {
  const { selection: o, schema: l } = i, { $from: a, $to: c } = o;
  let u = i.tr;
  return u.doc.nodesBetween(a.pos, c.pos, function(d, h) {
    if (d.type === l.nodes.paragraph) {
      let f = parseInt(d.attrs.indent) || 0;
      s > 0 ? f = Math.min(qe.MAX_INDENT, f + s) : f = 0;
      let p = Object.assign({}, d.attrs, { indent: f });
      u = u.setNodeMarkup(h, null, p);
    }
  }), u.docChanged && t ? (t(u), !0) : !1;
};
const gn = {};
gn.align = function(i, t, n) {
  const { selection: r, schema: s } = i, { $from: o } = r, l = (function() {
    let d = { pos: -1, depth: -1 };
    for (let h = o.depth; h >= 0; h--)
      o.node(h).type == s.nodes.paragraph && (d.pos = o.before(h), d.depth = h);
    return d;
  })();
  if (l.pos < 0)
    return !1;
  const a = o.node(l.depth), c = Object.assign({}, a.attrs, { align: n }), u = i.tr.setNodeMarkup(
    l.pos,
    // 段落节点的位置
    null,
    // 节点类型不变, 仍为 paragraph
    c,
    // 新属性
    a.marks
    // 保留原有标记
  );
  return t && t(u), !0;
};
const de = {};
de.image = function(i, t, n, r) {
  const s = n.INSTANCE, o = Je.getImage(s.opts);
  if (o.enabled == !1) {
    new U().open(null, "禁止上传图片");
    return;
  }
  if (s.upload) {
    const l = function() {
      const a = function(c, u) {
        F.image(n, { src: u.url, title: u.name, alt: u.desc });
      };
      Hi.choose(o.accept, !0, function(c) {
        for (let u = 0; u < c.length; u++) {
          let d = c[u];
          if (o.maxSize > 0 && d.size > o.maxSize) {
            new U().open(null, "图片过大，最大允许：" + ht.format(o.maxSize, 2));
            return;
          }
        }
        s.upload.upload(c, a);
      });
    };
    de.execute(n, l);
  }
};
de.audio = function(i, t, n, r) {
  const s = n.INSTANCE, o = Je.getAudio(s.opts);
  if (o.enabled == !1) {
    new U().open(null, "禁止上传音频文件");
    return;
  }
  if (s.upload) {
    const l = function() {
      const a = function(c, u) {
        F.audio(n, { src: u.url, width: 800, height: 600 });
      };
      Hi.choose(o.accept, !0, function(c) {
        for (let u = 0; u < c.length; u++) {
          let d = c[u];
          if (o.maxSize > 0 && d.size > o.maxSize) {
            new U().open(null, "音频文件过大，最大允许：" + ht.format(o.maxSize, 2));
            return;
          }
        }
        s.upload.upload(c, a);
      });
    };
    de.execute(n, l);
  }
};
de.video = function(i, t, n, r) {
  const s = n.INSTANCE, o = Je.getVideo(s.opts);
  if (o.enabled == !1) {
    new U().open(null, "禁止上传视频文件");
    return;
  }
  if (s.upload) {
    const l = function() {
      const a = function(c, u) {
        F.video(n, { src: u.url, width: 800, height: 600 });
      };
      Hi.choose(o.accept, !0, function(c) {
        for (let u = 0; u < c.length; u++) {
          let d = c[u];
          if (o.maxSize > 0 && d.size > o.maxSize) {
            new U().open(null, "视频文件过大，最大允许：" + ht.format(o.maxSize, 2));
            return;
          }
        }
        s.upload.upload(c, a);
      });
    };
    de.execute(n, l);
  }
};
de.attachment = function(i, t, n, r) {
  const s = n.INSTANCE, o = Je.getAttachment(s.opts);
  if (o.enabled == !1) {
    new U().open(null, "禁止上传附件");
    return;
  }
  if (s.upload) {
    const l = function() {
      const a = function(c, u) {
        F.attach(n, { name: u.name, title: u.title, url: u.url, size: u.size });
      };
      Hi.choose(o.accept, !0, function(c) {
        for (let u = 0; u < c.length; u++) {
          let d = c[u];
          if (o.maxSize > 0 && d.size > o.maxSize) {
            new U().open(null, "附件过大，最大允许：" + ht.format(o.maxSize, 2));
            return;
          }
        }
        s.upload.upload(c, a);
      });
    };
    de.execute(n, l);
  }
};
de.upload = function(i, t) {
  const n = i.INSTANCE, r = Je.getImage(n.opts), s = Je.getAudio(n.opts), o = Je.getVideo(n.opts), l = Je.getAttachment(n.opts);
  for (let c = 0; c < t.length; c++) {
    let u = t[c], d = ko.getType(u.name);
    if (r.test(d)) {
      if (r.enabled == !1) {
        new U().open(null, "禁止上传图片");
        return;
      } else if (r.maxSize > 0 && u.size > r.maxSize) {
        new U().open(null, "图片过大，最大允许：" + ht.format(r.maxSize, 2));
        return;
      }
    } else if (s.test(d)) {
      if (s.enabled == !1) {
        new U().open(null, "禁止上传音频文件");
        return;
      } else if (s.maxSize > 0 && u.size > s.maxSize) {
        new U().open(null, "音频文件过大，最大允许：" + ht.format(s.maxSize, 2));
        return;
      }
    } else if (o.test(d)) {
      if (o.enabled == !1) {
        new U().open(null, "禁止上传视频文件");
        return;
      } else if (o.maxSize > 0 && u.size > o.maxSize) {
        new U().open(null, "视频文件过大，最大允许：" + ht.format(o.maxSize, 2));
        return;
      }
    } else if (l.test(d)) {
      if (l.enabled == !1) {
        new U().open(null, "禁止上传附件");
        return;
      } else if (l.maxSize > 0 && u.size > l.maxSize) {
        new U().open(null, "附件过大，最大允许：" + ht.format(s.maxSize, 2));
        return;
      }
    } else {
      new U().open(null, "不允许的文件类型: " + d);
      return;
    }
  }
  const a = function() {
    const c = function(u, d) {
      let h = ko.getType(d.name);
      if (r.test(h)) {
        F.image(i, { src: d.url, title: d.name, alt: d.desc });
        return;
      } else s.test(h) ? F.audio(i, { src: d.url, width: 800, height: 600 }) : o.test(h) ? F.video(i, { src: d.url, width: 800, height: 600 }) : F.attach(i, { name: d.name, title: d.title, url: d.url, size: d.size });
    };
    n.upload.upload(t, c);
  };
  de.execute(i, a);
};
de.execute = function(i, t) {
  let n = i.INSTANCE;
  if (n.upload == null || n.upload == null) {
    new U().open(null, "<p>Editor.upload 未指定！</p>", null, null);
    return;
  }
  if (n.upload instanceof Oh) {
    const r = [
      "<p>默认的上传实现不会真正的上传文件，仅用来演示效果。生产环境需自定义 Uploader 实现，并设置为 Editor 实例的 upload 属性。<p>",
      "<p>继续上传请点击【确定】，否则点击【取消】。<p>"
    ].join("");
    new U().open("Editor.upload 未实现", r, ["ensure", "cancel"], t);
  } else
    t();
};
de.test = function(i, t) {
  const s = [];
  s.push({ id: 1, name: "学习资料.zip", size: Math.floor(52428800 + Math.random() * 20971520), status: 0 });
  for (let d = 2; d <= t; d++)
    s.push({ id: d, name: "example" + d + ".jpg", size: Math.floor(52428800 + Math.random() * 20971520), status: 0 });
  const o = { abort: null }, l = new Th(s, o), a = {};
  a.upload = function(d, h) {
    let f = 0, p = d.size, m = function() {
      const y = Math.floor((20971520 + Math.random() * 4 * 1024 * 1024) / 20);
      f = Math.min(f + y, p), l.update(d.id, f, p), f < p && d.status == 1 ? setTimeout(m, 50) : h && h();
    };
    d.status == 0 ? (d.status = 1, setTimeout(m, 50)) : h();
  }, a.abort = function(d) {
    s[d - 1].status = 4;
  }, o.abort = function(d) {
    a.abort(d);
  }, l.open();
  const c = s.slice(0), u = function() {
    c.length > 0 && a.upload(c.shift(), u);
  };
  for (let d = 0; d < 5 && !(d >= s.length); d++)
    u();
};
const T = {};
T.save = function(i, t, n, r) {
  const s = n.INSTANCE;
  s && s.save && s.save(), n.focus();
};
T.cut = function(i, t, n, r) {
  console.log("UNIMPLEMENTED Command: cut"), n.focus();
};
T.copy = function(i, t, n, r) {
  console.log("UNIMPLEMENTED Command: copy"), n.focus();
};
T.paste = function(i, t, n, r) {
  console.log("UNIMPLEMENTED Command: paste"), n.focus();
};
T.h1 = function(i, t, n, r) {
  return Mt(i.schema.nodes.heading, { level: 1 })(i, t, n, r);
};
T.h2 = function(i, t, n, r) {
  return Mt(i.schema.nodes.heading, { level: 2 })(i, t, n, r);
};
T.h3 = function(i, t, n, r) {
  return Mt(i.schema.nodes.heading, { level: 3 })(i, t, n, r);
};
T.h4 = function(i, t, n, r) {
  return Mt(i.schema.nodes.heading, { level: 4 })(i, t, n, r);
};
T.h5 = function(i, t, n, r) {
  return Mt(i.schema.nodes.heading, { level: 5 })(i, t, n, r);
};
T.h6 = function(i, t, n, r) {
  return Mt(i.schema.nodes.heading, { level: 6 })(i, t, n, r);
};
T.paragraph = function(i, t, n, r) {
  return Mt(i.schema.nodes.paragraph, null)(i, t, n, r);
};
T.pre = function(i, t, n, r) {
  return Mt(i.schema.nodes.code_block, null)(i, t, n, r);
};
T.blockquote = function(i, t, n, r) {
  return U1(i.schema.nodes.blockquote, null)(i, t, n, r);
};
T.strong = function(i, t, n, r) {
  return xt(i.schema.marks.strong)(i, t, n, r);
};
T.italic = function(i, t, n, r) {
  return xt(i.schema.marks.em)(i, t, n, r);
};
T.underline = function(i, t, n, r) {
  return we.set(i.schema.marks.underline)(i, t, n, r);
};
T.strike = function(i, t, n, r) {
  return we.set(i.schema.marks.strike)(i, t, n, r);
};
T.forecolor = function(i, t, n, r) {
  const s = i.schema;
  ya.open(r.srcElement || r.target, function(o) {
    o && (o == "default" ? we.remove(s.marks.forecolor)(i, t) : we.set(s.marks.forecolor, { color: o })(i, t)), n.focus();
  });
};
T.backcolor = function(i, t, n, r) {
  const s = i.schema;
  ya.open(r.srcElement || r.target, function(o) {
    o && (o == "default" ? we.remove(s.marks.forecolor)(i, t) : we.set(s.marks.backcolor, { color: o })(i, t)), n.focus();
  });
};
T.clean = function(i, t, n) {
  let r = n.state.schema, s = i.tr;
  return [
    r.marks.strong,
    r.marks.em,
    r.marks.fontfamily,
    r.marks.fontsize,
    r.marks.forecolor,
    r.marks.backcolor,
    r.marks.decoration
  ].forEach(function(l) {
    i.selection.empty ? s = s.removeStoredMark(l) : s = s.removeMark(i.selection.from, i.selection.to, l);
  }), t && t(s), !0;
};
T.ulist = function(i, t, n, r) {
  return $l(i.schema.nodes.bullet_list, {})(i, t, n, r);
};
T.olist = function(i, t, n, r) {
  return $l(i.schema.nodes.ordered_list, {})(i, t, n, r);
};
T.lift = D1;
T.left = function(i, t, n, r) {
  return gn.align(i, t, "left");
};
T.right = function(i, t, n, r) {
  return gn.align(i, t, "right");
};
T.center = function(i, t, n, r) {
  return gn.align(i, t, "center");
};
T.justify = function(i, t, n, r) {
  return gn.align(i, t, "justify");
};
T.indent = qe.increase;
T.dedent = qe.decrease;
T.link = function(i, t, n, r) {
  let s = i.schema.marks.link;
  if (R.mark(i, s))
    return xt(s)(i, t), n.focus(), !0;
  wh.open(r.srcElement || r.target, function(o) {
    o != null && (xt(s, o)(i, t), n.focus());
  });
};
T.unlink = function(i, t, n, r) {
  let s = i.schema.marks.link;
  if (R.mark(i, s))
    return xt(s)(i, t), !0;
};
T.anchor = function(i, t, n, r) {
  xh.open(r.srcElement || r.target, function(s) {
    s && F.anchor(n, s), n.focus();
  });
};
T.image = function(i, t, n, r) {
  kh.open(null, function(s) {
    s && F.image(n, s), n.focus();
  });
};
T.video = function(i, t, n, r) {
  Sh.open(null, function(s) {
    s && F.video(n, s), n.focus();
  });
};
T.audio = function(i, t, n, r) {
  Ch.open(null, function(s) {
    s && F.audio(n, s), n.focus();
  });
};
T.br = function(i, t, n, r) {
  const { $from: s } = i.selection;
  return s.parent.inlineContent ? (t && t(i.tr.replaceSelectionWith(i.schema.nodes.hard_break.create()).scrollIntoView()), !0) : !1;
};
T.hr = function(i, t, n, r) {
  let o = i.schema.nodes.horizontal_rule;
  t(i.tr.replaceSelectionWith(o.create()));
};
T.emot = function(i, t, n, r) {
  let o = i.schema.nodes.image;
  i.selection.from, i.selection.to, i.selection instanceof A && i.selection.node.type == o && i.selection.node.attrs, Mh.open(r.srcElement || r.target, function(l) {
    l && t(typeof l == "string" ? n.state.tr.insertText(l) : n.state.tr.replaceSelectionWith(o.createAndFill(l))), n.focus();
  });
};
T.table = function(i, t, n, r) {
  Eh.open(r.srcElement || r.target, function(s) {
    s && Ye.insert(i, t, n, { rows: s.rows, cols: s.cols, header: !0 }), n.focus();
  });
};
T.code = function(i, t, n, r) {
  const s = i.schema.marks.code, o = xt(s);
  return R.mark(i, s) ? (o(i, t), !0) : o(i, t, n, r);
};
T.select = F1;
T.undo = Gr;
T.redo = Ei;
T.clear = function(i, t, n, r) {
  const s = i.doc, o = i.schema.nodes.paragraph.createAndFill(), l = i.tr.replaceWith(0, s.content.size, o);
  t(l), t(i.tr.setSelection(i.selection.constructor.near(o.resolve(0))));
};
T.fullscreen = function(i, t, n, r) {
  const s = n.dom.closest("div.se-container"), o = Je.get(n.INSTANCE.opts, "editor.fullscreen", 1);
  s && ba.fullscreen(s, o);
};
T.zoom = function(i, t, n, r) {
  const s = r.target || r.srcElement, o = s.closest("div.se-container"), l = s.closest("div.se-menuitem"), a = l.querySelector("button.se-button.left"), c = l.querySelector("button.se-button.right"), u = o.querySelector("div.se-editor"), d = ba.getZoom(u), h = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
  let f = -1, p = h.length;
  if (s.classList.contains("left")) {
    for (let m = p - 1; m > -1; m--)
      if (d > h[m]) {
        f = m;
        break;
      }
  } else if (s.classList.contains("right")) {
    for (let m = 0; m < p; m++)
      if (h[m] > d) {
        f = m;
        break;
      }
  } else {
    n.focus();
    return;
  }
  f > -1 && (u.style.zoom = h[f], l.querySelector("button.se-button.text").setAttribute("data-title", (h[f] * 100).toFixed(0) + "%"), l.querySelector("button.se-button.text").textContent = (h[f] * 100).toFixed(0) + "%"), a.disabled = f <= 0, c.disabled = f >= p - 1, n.focus();
};
T.assets = function(i, t, n, r) {
  const s = function(o) {
    for (let l = 0; l < o.length; l++) {
      const a = o[l];
      a.type == "image" ? (a.src = a.url, F.image(n, a)) : a.type == "audio" ? (a.src = a.url, F.audio(n, a)) : a.type == "video" ? (a.src = a.url, F.video(n, a)) : F.attach(n, a);
    }
  };
  new Nh(n.INSTANCE.assetsManager.all()).open(s);
};
T.share = function(i, t, n, r) {
  de.test(n, 1);
};
T.lock = function(i, t, n, r) {
  de.test(n, 30);
};
T.info = function(i, t, n, r) {
  n.INSTANCE && n.INSTANCE.info && n.INSTANCE.info();
};
T.setting = function(i, t, n, r) {
  new Ah().open();
};
const R = {};
R.mark = function(i, t) {
  let { from: n, $from: r, to: s, empty: o } = i.selection;
  return o ? !!t.isInSet(i.storedMarks || r.marks()) : i.doc.rangeHasMark(n, s, t);
};
R.match = function(i, t, n) {
  const { $from: r, to: s, node: o } = i.selection;
  for (let l = r.depth; l > -1; l--) {
    const a = r.node(l);
    if (a.type === t) {
      if (!n)
        return !0;
      for (const c in n)
        if (a.attrs[c] != n[c])
          return !1;
      return !0;
    }
  }
  return !1;
};
R.h1 = function(i) {
  return R.match(i, i.schema.nodes.heading, { level: 1 });
};
R.h2 = function(i) {
  return R.match(i, i.schema.nodes.heading, { level: 2 });
};
R.h3 = function(i) {
  return R.match(i, i.schema.nodes.heading, { level: 3 });
};
R.h4 = function(i) {
  return R.match(i, i.schema.nodes.heading, { level: 4 });
};
R.h5 = function(i) {
  return R.match(i, i.schema.nodes.heading, { level: 5 });
};
R.h6 = function(i) {
  return R.match(i, i.schema.nodes.heading, { level: 6 });
};
R.paragraph = function(i) {
  return R.match(i, i.schema.nodes.paragraph);
};
R.codeblock = function(i) {
  return R.match(i, i.schema.nodes.code_block);
};
R.fontfamily = function(i) {
  return function(t) {
    const n = t.selection.$from.marks().find(function(r) {
      return r.type == t.schema.marks.fontfamily;
    });
    return n ? Ni.equals(i, n.attrs.family) : Ni.equals(i, null);
  };
};
R.fontsize = function(i) {
  return function(t) {
    const n = t.selection.$from.marks().find(function(r) {
      return r.type == t.schema.marks.fontsize;
    });
    return n ? Ni.equals(i, n.attrs.size) : Ni.equals(i, null);
  };
};
R.blockquote = function(i) {
  return R.match(i, i.schema.nodes.blockquote);
};
R.align = function(i) {
  return R.match(i, i.schema.nodes.paragraph);
};
R.indent = function(i) {
  return R.match(i, i.schema.nodes.paragraph);
};
R.dedent = function(i) {
  return R.match(i, i.schema.nodes.paragraph);
};
const Ye = {};
Ye.create = function(i, t) {
  let n = t.rows, r = t.cols;
  const s = i.nodes.table, o = i.nodes.table_row, l = i.nodes.table_cell, a = i.nodes.table_header, c = [];
  if (t.header && n > 0) {
    const u = [];
    for (let d = 0; d < r; d++)
      u.push(a.createAndFill({}, i.nodes.paragraph.createAndFill()));
    c.push(o.createAndFill({}, hi.from(u))), n--;
  }
  for (let u = 0; u < n; u++) {
    const d = [];
    for (let h = 0; h < r; h++)
      d.push(l.createAndFill({}, i.nodes.paragraph.createAndFill()));
    c.push(o.createAndFill({}, hi.from(d)));
  }
  return s.createAndFill({}, hi.from(c));
};
Ye.findTextPosition = function(i, t) {
  const n = i.nodeAt(t);
  if (!n || n.type.name != "table_header" && n.type.name != "table_cell")
    return t;
  let r = n.content.firstChild;
  if (!r) {
    const s = i.type.schema.nodes.paragraph.createAndFill();
    n.content = n.content.append(hi.from(s)), r = s;
  }
  return t + 2;
};
Ye.insert = function(i, t, n, r) {
  const { schema: s, selection: o } = i, { $from: l } = o, a = Ye.create(s, r);
  if (!a)
    return !1;
  let c = l.pos, u = i.tr.insert(c, a), d = c + 3, h = Ye.findTextPosition(u.doc, d);
  return u.doc.nodeAt(h), u = u.setSelection(bh.create(u.doc, h)), t && t(u), !0;
};
Ye.batch = function(i, t, n) {
  let r = i.state;
  const s = [];
  for (let l = 0; l < n; l++) {
    let a = null;
    if (!t(r, function(u) {
      a = u;
    }) || !a)
      break;
    s.push(...a.steps), r = r.apply(a);
  }
  if (s.length == 0)
    return;
  const o = i.state.tr;
  s.forEach(function(l) {
    o.step(l);
  }), i.dispatch(o);
};
Ye.addRowBefore = function(i, t) {
  let n = i.state;
  const r = [];
  for (let o = 0; o < t; o++) {
    let l = null;
    if (!Tr(n, function(c) {
      l = c;
    }) || !l)
      break;
    r.push(...l.steps), n = n.apply(l);
  }
  if (r.length == 0)
    return;
  const s = i.state.tr;
  r.forEach(function(o) {
    s.step(o);
  }), i.dispatch(s);
};
const F = {};
F.link = function(i, t) {
  const n = i.state, r = n.schema.marks.link.create(t), s = n.schema.text(t.text, [r]), o = n.tr.replaceSelectionWith(s, !1);
  i.dispatch(o), i.focus();
};
F.anchor = function(i, t) {
  const n = i.state, r = n.schema.marks.link.create(t), s = n.schema.text(t.text, [r]), o = n.tr.replaceSelectionWith(s, !1);
  i.dispatch(o), i.focus();
};
F.image = function(i, t) {
  const n = i.state, r = n.schema.nodes.image.create(t);
  i.dispatch(n.tr.replaceSelectionWith(r)), i.focus();
  const s = i.INSTANCE;
  s && s.assetsManager && s.assetsManager.add(t, "image");
};
F.audio = function(i, t) {
  t.src;
  const n = i.state, r = n.schema.nodes.audio.create(t);
  i.dispatch(n.tr.replaceSelectionWith(r)), i.focus();
  const s = i.INSTANCE;
  s && s.assetsManager && s.assetsManager.add(t, "audio");
};
F.video = function(i, t) {
  const n = t.src;
  if (n.startsWith("<iframe "))
    F.html(i, n);
  else {
    const r = i.state, s = r.schema.nodes.video.create(t);
    i.dispatch(r.tr.replaceSelectionWith(s)), i.focus();
    const o = i.INSTANCE;
    o && o.assetsManager && o.assetsManager.add(t, "video");
  }
};
F.attach = function(i, t) {
  const n = i.state, r = n.schema.nodes.attachment.create(t);
  i.dispatch(n.tr.replaceSelectionWith(r)), i.focus();
  const s = i.INSTANCE;
  s && s.assetsManager && s.assetsManager.add(t, "attachment");
};
F.html = function(i, t) {
  const n = i.state, r = vh.fromSchema(n.schema), s = document.createElement("div");
  s.innerHTML = t;
  const o = r.parseSlice(s);
  i.dispatch(n.tr.replaceSelection(o)), i.focus();
};
const va = { URL: "/sharing/get.html" };
va.get = function(i, t) {
  So.request({
    method: "POST",
    url: this.URL,
    headers: [{ name: "Content-type", value: "application/x-www-form-urlencoded" }],
    data: "url=" + encodeURIComponent(i),
    success: function(n) {
      t.success(So.getResponse(n));
    },
    error: function(n) {
      t.error({ name: n.status, message: "UnknownError" });
    }
  });
};
const wa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Active: R,
  AlignCommand: gn,
  EditCommand: T,
  IndentCommand: qe,
  Insert: F,
  Sharing: va,
  StyleCommand: we,
  TableBuilder: Ye,
  UploadCommand: de
}, Symbol.toStringTag, { value: "Module" })), { Events: ri } = ze, { UploadCommand: qh } = wa, Yn = function(i, t) {
  this.editorView = i, this.wrapper = null, this.init(i);
};
Yn.prototype.init = function(i) {
  const t = this, n = i.dom.parentElement;
  this.wrapper = document.createElement("div"), this.wrapper.className = "se-drag-panel", this.wrapper.style.display = "none", this.wrapper.innerHTML = "<h2>请将文件拖拽到这里</h2>", n.parentElement.appendChild(this.wrapper);
  const r = function() {
    t.wrapper.style.display = "block";
  }, s = function() {
    t.wrapper.style.display = "none";
  };
  n.addEventListener("dragover", function(o) {
    ri.stop(o);
    let l = o.dataTransfer;
    if (!(l == null || l == null))
      for (let a = 0; a < l.types.length; a++) {
        let c = l.types[a];
        if (c == "Files" || c == "application/x-moz-file") {
          r();
          break;
        }
      }
  }, !1), this.wrapper.addEventListener("dragover", function(o) {
    ri.stop(o);
  }), this.wrapper.addEventListener("dragleave", function(o) {
    ri.stop(o), s();
  }), this.wrapper.addEventListener("drop", function(o) {
    ri.stop(o), s();
    let l = t.getTransferFiles(o);
    return l.length > 0 && qh.upload(i, l), !1;
  });
};
Yn.prototype.getTransferFiles = function(i) {
  let t = i.dataTransfer;
  if (t == null || t == null)
    return;
  let n = t.files;
  if (n != null && n.length > 0)
    return n;
  let r = t.items;
  if (r != null && r.length > 0) {
    n = [];
    for (let s = r.length - 1; s > -1; s--) {
      let o = r[s].webkitGetAsEntry();
      item && n.push(o);
    }
    return n;
  } else
    return null;
};
Yn.prototype.update = function() {
};
Yn.prototype.destroy = function() {
  this.wrapper && this.wrapper.parentElement && this.wrapper.parentElement.removeChild(this.wrapper);
};
const xa = {};
xa.create = function(i) {
  return new xe({
    view: function(t) {
      return new Yn(t);
    }
  });
};
class Dh {
  constructor(t) {
    const n = this;
    this.view = t, this.dom = document.createElement("div"), this.dom.className = "se-cursor";
    const r = function() {
      n.view.focused ? n.dom.classList.remove("show") : n.dom.classList.add("show"), n.timer = setTimeout(r, 1e3);
    };
    this.view.dom.parentNode.appendChild(this.dom), this.update(t, null), this.timer = setTimeout(r, 1e3);
  }
  update(t, n) {
    let r = t.state, { from: s, to: o } = r.selection, l = t.coordsAtPos(s), a = t.coordsAtPos(o), c = this.dom.offsetParent.getBoundingClientRect(), u = Math.max((l.left + a.left) / 2, l.left + 3) - c.left - 3, d = c.bottom - l.top, h = this.getZoom(this.dom.parentElement);
    this.dom.style.left = (u / h).toFixed(2) + "px", this.dom.style.bottom = (d / h).toFixed(2) + "px", this.dom.classList.remove("show");
  }
  getZoom(t) {
    if (document.defaultView && document.defaultView.getComputedStyle) {
      const n = document.defaultView.getComputedStyle(t, null);
      if (n != null)
        return parseFloat(n.getPropertyValue("zoom")) || 1;
    }
    return 1;
  }
  destroy() {
    this.timer && clearTimeout(this.timer), this.dom.remove();
  }
}
const ka = {};
ka.create = function(i, t) {
  return new xe({
    view(n) {
      return new Dh(n);
    }
  });
};
const { Events: zh, MenuItem: Rh, ContextMenu: Ih } = ze, Gn = function(i) {
  this.view = i, this.contextMenu = this.getContextMenu(i), this.init(i);
};
Gn.prototype.init = function(i) {
  const t = this;
  this.eventHandler = function(n) {
    t.contextMenu && (De(i.state) ? (zh.stop(n), t.contextMenu.show(n)) : t.contextMenu.close());
  }, i.dom.addEventListener("contextmenu", this.eventHandler);
};
Gn.prototype.getContextMenu = function(i) {
  const t = {
    click: function(r) {
      return function(s) {
        r.spec.run && r.spec.run.apply(r, [i.state, i.dispatch, i, s]);
      };
    }
  }, n = [
    { name: "cut", label: "剪 切", disabled: !0 },
    { name: "copy", label: "复 制", disabled: !0 },
    { name: "paste", label: "粘 贴", disabled: !0 },
    { name: "delete", label: "删 除", disabled: !0 },
    { name: "|" },
    { name: "addRowBefore", label: "上方插入行", title: "上方插入行，按住 CTRL 键，可一次插入 5 行", run: function(r, s, o, l) {
      l.ctrlKey || e.metaKey ? TableBuilder.batch(o, Tr, 5) : Tr(r, s);
    } },
    { name: "addRowAfter", label: "下方插入行", title: "下方插入行，按住 CTRL 键，可一次插入 5 行", run: function(r, s, o, l) {
      l.ctrlKey || e.metaKey ? TableBuilder.batch(o, ao, 5) : ao(r, s);
    } },
    { name: "|" },
    { name: "addColumnBefore", label: "左侧插入列", title: "左侧插入列，按住 CTRL 键，可一次插入 5 列", run: function(r, s, o, l) {
      l.ctrlKey || e.metaKey ? TableBuilder.batch(o, oo, 5) : oo(r, s);
    } },
    { name: "addColumnAfter", label: "右侧插入列", title: "右侧插入列，按住 CTRL 键，可一次插入 5 列", run: function(r, s, o, l) {
      l.ctrlKey || e.metaKey ? TableBuilder.batch(o, lo, 5) : lo(r, s);
    } },
    { name: "|" },
    { name: "deleteRow", label: "删除行", title: "删除行", run: function(r, s, o, l) {
      i1(r, s);
    } },
    { name: "deleteColumn", label: "删除列", title: "删除列", run: function(r, s, o, l) {
      e1(r, s);
    } }
  ].map(function(r) {
    return new Rh(r);
  });
  return new Ih(null, n, t);
};
Gn.prototype.update = function(i, t) {
};
Gn.prototype.destroy = function() {
  this.view.dom.removeEventListener("contextmenu", this.eventHandler), this.contextMenu && (this.contextMenu.destroy(), this.contextMenu = null);
};
const Sa = {};
Sa.create = function() {
  return new xe({
    view(i) {
      return new Gn(i);
    }
  });
};
const { DOM: wn } = ze, { Config: Lh } = Un, Bh = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M21 3.5V17a2 2 0 0 1-2 2h-2v-2h2V3.5H9v2h5.857c1.184 0 2.143.895 2.143 2v13c0 1.105-.96 2-2.143 2H5.143C3.959 22.5 3 21.605 3 20.5v-13c0-1.105.96-2 2.143-2H7v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2m-6.143 4H5.143v13h9.714z" clip-rule="evenodd"></path></svg>';
class Ph {
  /**
   * @Override
   */
  constructor(t, n, r, s) {
    this.view = n, this.node = t, this.lang = t.attrs.lang, this.getPos = r, this.opts = s;
    const o = this;
    this.wrapper = document.createElement("div"), this.wrapper.className = "se-block-wrapper", this.wrapper.setAttribute("data-lang", this.lang), this.body = document.createElement("div"), this.body.className = "se-codeblock";
    const l = this.createMenuBar();
    this.wrapper.appendChild(l), this.editDOM = document.createElement("pre"), this.editDOM.className = "se-editable", this.contentDOM = document.createElement("code"), this.contentDOM.className = "language-" + this.lang, this.editDOM.appendChild(this.contentDOM), this.highlightDOM = document.createElement("pre"), this.highlightDOM.className = "se-highlight line-numbers", this.highlightCode = document.createElement("code"), this.highlightCode.className = "language-" + this.lang, this.highlightDOM.appendChild(this.highlightCode);
    const a = document.createElement("span");
    a.className = "line-numbers-rows", a.setAttribute("aria-hidden", "true"), a.innerHTML = "<span></span><span></span>", this.body.appendChild(this.editDOM), this.body.appendChild(this.highlightDOM), this.body.appendChild(a), this.wrapper.appendChild(this.body), this.dom = this.wrapper, this.scrollHandler = function() {
      o.highlightDOM.scrollLeft = o.editDOM.scrollLeft, o.highlightDOM.scrollTop = o.editDOM.scrollTop;
    }, this.editDOM.addEventListener("scroll", this.scrollHandler), this.inputHandler = this.debounce(function() {
      const c = o.view.state.doc.textBetween(
        o.getPos() + 1,
        // 跳过 pre 节点
        o.getPos() + o.node.nodeSize - 1
      );
      o.render(c);
    }, 200), this.view.dom.addEventListener("input", this.inputHandler), this.render(this.node.textContent);
  }
  /* private void */
  createMenuBar() {
    const t = this, n = document.createElement("div");
    n.className = "se-block-menu", n.appendChild(wn.from('<div class="se-block-menu-item" data-name="copy"><button type="button" title="复制">' + Bh + "</button></div>")), n.appendChild(wn.from('<div class="se-block-menu-item" data-name="lang"><div class="se-select"></div></div>'));
    const r = this.getSupportedLanguages(), s = document.createElement("select");
    s.name = "lang", s.className = "se-minimal", s.style.width = "160px", s.setAttribute("title", "语言选项");
    for (let o = 0; o < r.length; o++)
      s.appendChild(new Option(r[o].text, r[o].value));
    return s.value = this.lang, s.addEventListener("change", function(o) {
      const l = this.value, a = t.view.state.tr.setNodeAttribute(t.getPos(), "lang", l);
      t.view.dispatch(a);
    }), n.querySelector("div[data-name='lang'] div.se-select").appendChild(s), n.querySelector("div[data-name='copy'] button").addEventListener("click", function(o) {
      if (wn.copy(t.contentDOM)) {
        wn.tooltip(this, "复制完成");
        return;
      }
      wn.select(t.contentDOM), alert("您的浏览器不支持拷贝，请使用 CTRL + C 复制");
    }), n;
  }
  /* private void */
  getSupportedLanguages() {
    let t = Lh.getValue(this.opts, "editor.codeblock.languages");
    return t && Array.isArray(t) && t.length > 0 ? t : [{ text: "Plaintext", value: "plaintext" }];
  }
  /* private void */
  debounce(t, n) {
    let r = null;
    return (...s) => {
      clearTimeout(r), r = setTimeout(() => t.apply(this, s), n);
    };
  }
  /* private void */
  render(t) {
    if (typeof Prism > "u") {
      console.log("window.Prism is undefined."), this.showLineNumbers(t), this.highlightCode.textContent = t;
      return;
    }
    const n = Prism.languages[this.lang] || Prism.languages.plaintext, r = Prism.highlight(t, n, this.lang);
    this.showLineNumbers(t), this.highlightCode.innerHTML = r;
  }
  /* private void */
  showLineNumbers(t) {
    const n = (t.match(/\n(?!$)/g) || []).length + 2, r = this.body.querySelector("span.line-numbers-rows"), s = r.querySelectorAll(":scope span"), o = n - s.length;
    if (o < 0)
      for (let l = o; l < 0; l++)
        r.removeChild(r.lastElementChild);
    else
      for (let l = 0; l < o; l++)
        r.appendChild(document.createElement("span"));
  }
  /**
   * @Override
   */
  /* public boolean */
  update(t) {
    return t.type != this.node.type ? !1 : (t.attrs.lang !== this.lang && (this.lang = t.attrs.lang, this.contentDOM.className = "language-" + this.lang, this.highlightCode.className = "language-" + this.lang), this.node = t, this.render(t.textContent), !0);
  }
  /**
   * 获取编辑器内容时，同步纯文本内容
   * @Override
   */
  /* public String */
  get content() {
    return this.node.type.schema.text(this.code.textContent);
  }
  // 销毁时移除监听，避免内存泄漏
  destroy() {
    this.editDOM.removeEventListener("scroll", this.scrollHandler), this.view.dom.removeEventListener("input", this.inputHandler), this.wrapper.remove();
  }
}
const { Resizable: Fh } = ze;
class Vh {
  constructor(t, n, r) {
    this.node = t, this.view = n, this.getPos = r, this.keepRatio = !0, this.dom = document.createElement("span"), this.img = document.createElement("img");
    let s = this;
    this.img = document.createElement("img"), this.img.addEventListener("load", function(o) {
      s.label.setAttribute("data-width", this.naturalWidth), s.label.setAttribute("data-height", this.naturalHeight);
    }), this.label = document.createElement("span"), this.label.className = "resize-label", this.label.setAttribute("data-width", this.img.clientWidth), this.label.setAttribute("data-height", this.img.clientHeight), this.label.appendChild(document.createTextNode(this.img.clientWidth + " × " + this.img.clientHeight)), this.updateImage(t), this.dom.appendChild(this.img), this.dom.appendChild(this.label), this.resizable = new Fh(this.img), this.resizable.select = function() {
      s.selectNode();
    }, this.resizable.update = function(o, l) {
      s.label.textContent = Math.round(o) + " × " + Math.round(l);
    }, this.resizable.deselect = function() {
      s.deselectNode();
    }, this.resizable.commit = function(o) {
      o && s.commit(o);
    };
  }
  /**
   * @private
   */
  updateImage(t) {
    const n = t.attrs.width, r = t.attrs.height;
    t.attrs.align, this.img.src = t.attrs.src, n ? this.img.style.width = n : this.img.style.removeProperty("width"), r ? this.img.style.height = r : this.img.style.removeProperty("height"), t.attrs.title && (this.img.title = t.attrs.title), t.attrs.alt && (this.img.alt = t.attrs.alt);
  }
  /**
   * @private
   */
  info(t) {
    const n = document.createElement("div");
    n.className = "tooltip", n.textContent = t, this.dom.appendChild(n), setTimeout(function() {
      n.style.opacity = 0;
    }, 1e3), setTimeout(function() {
      n.remove();
    }, 2e3);
  }
  /**
   * @private
   */
  commit(t) {
    const n = this.getPos();
    if (n === void 0)
      return;
    const r = t.width, s = t.height, o = this.view.state.tr.setNodeMarkup(n, null, {
      ...this.node.attrs,
      width: Math.round(r),
      height: Math.round(s)
    });
    this.view.dispatch(o);
  }
  /**
   * 调用链: mouseup > view.dispatch > update
   * @Override
   */
  update(t, n, r) {
    return t.type.name !== "image" ? !1 : (t.attrs.src != this.node.attrs.src || t.attrs.width != this.node.attrs.width || t.attrs.height != this.node.attrs.height ? (this.node = t, this.updateImage(t)) : this.node = t, !0);
  }
  /**
   * @Override
   */
  selectNode() {
    this.label.textContent = this.img.width + " × " + this.img.height, this.dom.classList.add("ProseMirror-selectednode", "active");
  }
  /**
   * @Override
   */
  deselectNode() {
    this.dom.classList.remove("ProseMirror-selectednode", "active");
  }
  /**
   * @Override
   */
  stopEvent(t) {
    return t.target != this.img;
  }
  /**
   * @Override
   */
  ignoreMutation() {
    return !0;
  }
  /**
   * @Override
   */
  destroy() {
    this.dom.remove();
  }
}
const { Bytes: Hh, Icon: $h } = ze;
class Wh {
  constructor(t, n, r) {
    this.dom = document.createElement("attachment");
    const s = document.createElement("span"), o = document.createElement("span"), l = document.createElement("span");
    s.className = "icon", o.className = "name", l.className = "size", s.appendChild($h.create("attachment")), o.appendChild(document.createTextNode(t.attrs.name)), t.attrs.size && l.appendChild(document.createTextNode("(" + Hh.format(t.attrs.size, 2) + ")")), this.dom.setAttribute("title", "附件展示内容和样式为编辑器自定义，展示端需自定义附件展示内容和样式。"), this.dom.appendChild(s), this.dom.appendChild(o), this.dom.appendChild(l), this.render(t);
  }
  /**
   * @private
   */
  render(t) {
    this.dom.setAttribute("data-name", t.attrs.name), this.dom.setAttribute("data-size", t.attrs.size), t.attrs.title && this.dom.setAttribute("data-title", t.attrs.title), this.dom.setAttribute("data-url", t.attrs.url);
  }
  /**
   * @Override
   */
  update(t, n) {
    return !0;
  }
  /**
   * @Override
   */
  destroy() {
    this.dom.remove();
  }
}
const Ca = {};
Ca.filter = function(i, t) {
  const n = t.nodeName;
  t.getAttributeNames();
  const r = ["META", "LINK", "STYLE", "SCRIPT", "HEAD", "IFRAME", "EMBED", "OBJECT", "SVG", "XML", "MATH"];
  return !!(n.indexOf(":") > -1 || r.includes(n));
};
const Ti = {};
Ti.filter = function(i, t) {
  const n = t.nodeName;
  if (n == "DIV")
    Fe.replace(i.createElement("p"), t);
  else if (n == "B")
    Fe.replace(i.createElement("strong"), t);
  else if (n == "I")
    Fe.replace(i.createElement("em"), t);
  else if (n == "FONT") {
    const r = i.createElement("span");
    t.getAttribute("face") && (r.style.fontFamily = t.getAttribute("face")), t.getAttribute("size") && (r.style.fontSize = Ti.getFontSizePx(t.getAttribute("size")) + "px"), t.getAttribute("color") && (r.style.color = t.getAttribute("color")), Fe.replace(r, t);
  } else if (n == "PRE")
    if (t.querySelectorAll("code").length == 1 && t.firstElementChild.nodeName == "CODE") {
      const s = t.firstElementChild;
      s.replaceChildren(i.createTextNode(s.textContent));
    } else {
      const s = i.createElement("code");
      s.appendChild(i.createTextNode(t.textContent)), t.replaceChildren(s);
    }
};
Ti.getFontSizePx = function(i) {
  let n = i;
  return typeof i == "string" && (i.startsWith("+") || i.startsWith("-") ? n = 3 + parseInt(i) : n = parseInt(i)), n = Math.max(1, Math.min(7, n)), fontSizeMap[n];
};
const Ma = {
  UNSAFE_ATTRS: ["id", "xmlns", "onclick", "onkeydown", "onkeyup", "onload", "onerror"],
  KEEP_ATTRS: [
    { nodeName: "A", attrs: ["data-referer"] },
    { nodeName: "IMG", attrs: ["src", "width", "height"] },
    { nodeName: "PRE", attrs: ["class"] },
    { nodeName: "CODE", attrs: ["class"] },
    { nodeName: "VIDEO", attrs: ["src", "width", "height"] },
    { nodeName: "AUDIO", attrs: ["src", "width", "height"] },
    { nodeName: "ATTACHMENT", attrs: ["data-name", "data-title", "data-url", "data-size"] },
    { nodeName: "*", attrs: ["width", "height"] }
  ],
  KEEP_STYLES: ["width", "height", "font-family", "font-size", "font-weight", "font-style", "color", "text-decoration", "text-align"]
};
Ma.filter = function(i, t) {
  const n = t.nodeName, r = t.getAttributeNames(), s = this.UNSAFE_ATTRS, o = this.KEEP_ATTRS, l = this.KEEP_STYLES;
  r.forEach(function(u) {
    (u.indexOf(":") > -1 || u.startsWith("mso-") || s.includes(u)) && t.removeAttribute(u);
    let d = !0;
    for (let h = 0; h < o.length; h++) {
      let f = o[h];
      if ((f.nodeName == "*" || f.nodeName == n) && f.attrs.includes(u)) {
        d = !1;
        break;
      }
    }
    d && t.removeAttribute(u);
  });
  const a = t.getAttribute("align");
  a && (t.removeAttribute("align"), t.style.textAlign = a);
  let c = [];
  for (let u = 0; u < t.style.length; u++) {
    const d = t.style.item(u);
    t.style.getPropertyValue(d), l.includes(d) || c.push(d);
  }
  for (let u = 0; u < c.length; u++)
    t.style.removeProperty(c[u]);
  t.style.length < 1 && t.removeAttribute("style");
};
const is = {};
is.compact = function(i) {
  const t = Array.from(i.children);
  let n = 0, r = -2;
  for (; n < t.length; ) {
    const s = t[n];
    s.nodeName == "P" && s.children.length < 1 && s.textContent.trim() == "" && (r == n - 1 && i.removeChild(s), r = n), n++;
  }
};
const nn = {};
nn.compact = function(i) {
  const t = Array.from(i.children);
  let n = 0, r = -2;
  for (; n < t.length; ) {
    const s = t[n];
    s.nodeName == "PRE" && (r == n - 1 && nn.same(t[r], s) && (nn.merge(t[r], s), i.removeChild(t[r])), r = n), n++;
  }
};
nn.same = function(i, t) {
  const n = i.firstElementChild, r = t.firstElementChild;
  return n && r ? n.className == n.className : !1;
};
nn.merge = function(i, t) {
  const n = i.firstElementChild, r = t.firstElementChild;
  n && r && (r.textContent = n.textContent + `\r
` + r.textContent);
};
const Ai = {};
Ai.remove = function(i, t) {
  const n = i.createTreeWalker(
    t,
    NodeFilter.SHOW_COMMENT,
    // 只显示注释节点
    null,
    !1
  );
  let r = [], s = null;
  for (; s = n.nextNode(); )
    r.push(s);
  r.forEach(function(o) {
    Ai.extract(i, o);
  });
};
Ai.extract = function(i, t) {
  const n = t.textContent.trim();
  if ((n.includes("if !vml") || n.includes("[if")) && (n.includes("<img") || n.includes("<div") || n.includes("<p"))) {
    let r = n.replace(/^(\[)?if\s+[^>]*>|\[!if\s+[^>]*>/, "").replace(/<!\[endif\]>$|<!endif\]>$/, "").trim();
    if (r.length > 0) {
      const s = t.parentNode, o = i.createElement("div");
      for (o.innerHTML = r; o.firstChild; )
        s.insertBefore(o.firstChild, t);
    }
  }
  t.remove();
};
const Fe = {};
Fe.lift = function(i) {
  const t = i.parentElement;
  t.removeChild(i), t.parentElement.insertBefore(e, t);
};
Fe.liftChildren = function(i) {
  const t = i.parentNode;
  for (; i.firstChild; )
    t.insertBefore(i.firstChild, i);
  i.remove();
};
Fe.replace = function(i, t) {
  const n = t.parentNode;
  for (; t.firstChild; )
    i.appendChild(t.firstChild);
  n.insertBefore(i, t), t.remove();
};
Fe.format = function(i) {
  const t = i.childNodes, n = t.length, r = [];
  for (let s = 0; s < n; s++) {
    let o = t[s];
    if (o.nodeType == 1)
      r.push(o.outerHTML);
    else if (o.nodeType == 3) {
      const l = o.textContent;
      l.trim().length > 0 && r.push(l);
    }
  }
  return r.join(`\r
`);
};
const Uh = function(i) {
  if (i == null || i == null || i.length < 1)
    return "";
  (/* @__PURE__ */ new Date()).getTime();
  const n = new window.DOMParser().parseFromString(i, "text/html"), r = [
    "IMG",
    "BR",
    "HR",
    "INPUT",
    "BUTTON",
    "SELECT",
    "TEXTAREA",
    "P",
    "BLOCKQUOTE",
    "TABLE",
    "VIDEO",
    "AUDIO",
    // "CANVAS", "SVG", "IFRAME", "EMBED"
    "SOURCE",
    "TRACK"
  ];
  return Ai.remove(n, n.body), n.body.querySelectorAll("body *").forEach(function(s) {
    if (Ca.filter(n, s)) {
      s.remove();
      return;
    }
    Ti.filter(n, s), Ma.filter(n, s);
  }), n.querySelectorAll("p, pre, ol, ul, blockquote, table").forEach(function(s) {
    for (; ; ) {
      const o = s.parentElement;
      if (o != null && o.nodeName != "LI" && o.nodeName != "BLOCKQUOTE" && o.nodeName != "TD" && o.nodeName != "BODY")
        o.removeChild(s), o.parentElement.insertBefore(s, o);
      else
        break;
    }
  }), n.querySelectorAll("body span").forEach(function(s) {
    s.getAttributeNames().length < 1 && Fe.liftChildren(s);
  }), n.querySelectorAll("body *").forEach(function(s) {
    const o = s.nodeName;
    if (r.includes(o))
      return;
    if (s.nodeName == "A") {
      const c = s.getAttribute("href");
      if (c && c.trim().length > 0)
        return;
    }
    let l = s, a = null;
    for (; l && l.nodeName != "P" && l.nodeName != "BODY" && (l.children.length < 1 && l.textContent.trim() == ""); )
      a = l.parentElement, l.remove(), l = a;
  }), is.compact(n.body), nn.compact(n.body), n.body.innerHTML.replace(/>\s+</g, "><").trim();
}, Oi = {
  clean: Uh,
  compact: is.compact,
  format: Fe.format
}, { DOM: oe, Events: jh, Bytes: _h, ID: Kh, DataURI: Co, FileType: Ea, Icon: si, Resource: Jh, Divider: Na, MenuItem: M, DropdownMenu: fi, DropdownItem: P } = ze, { PropertyDialog: Xh, WarnDialog: Mo } = pa, { Ajax: sf, DefaultUpload: of, Base64Upload: lf, MockUpload: Yh } = ga, { StyleCommand: Eo, UploadCommand: Mn, EditCommand: C, Active: O, Insert: Gh, Sharing: af } = wa, { Config: pi } = Un, { BundleManager: Zh } = fa, v = Zh.getBundle("default"), Le = {};
Le.SIMPLE = "save | quote h1 h2 h3 | strong italic underline strike forecolor backcolor clean | ulist olist left right center | link image video table code | undo redo |";
Le.defaults = function() {
  const i = {};
  i.save = new M({
    name: "save",
    icon: "save",
    label: v.get("tool.save.label"),
    title: v.get("tool.save.title"),
    shortcut: "Alt-s",
    run: C.save
  }), i.h1 = new M({ name: "h1", icon: oe.create("span", null, ["h1"]), label: v.get("format.h1"), title: "h1", run: C.h1, active: O.h1 }), i.h2 = new M({ name: "h2", icon: oe.create("span", null, ["h2"]), label: v.get("format.h2"), title: "h2", run: C.h2, active: O.h2 }), i.h3 = new M({ name: "h3", icon: oe.create("span", null, ["h3"]), label: v.get("format.h3"), title: "h3", run: C.h3, active: O.h3 }), i.h4 = new M({ name: "h4", icon: oe.create("span", null, ["h4"]), label: v.get("format.h4"), title: "h4", run: C.h4, active: O.h4 }), i.h5 = new M({ name: "h5", icon: oe.create("span", null, ["h5"]), label: v.get("format.h5"), title: "h5", run: C.h5, active: O.h5 }), i.p = new M({ name: "p", icon: oe.create("span", null, ["p"]), label: v.get("format.p"), title: "p", run: C.paragraph, active: O.paragraph }), i.format = new fi({
    name: "format",
    label: v.get("tool.format.label"),
    title: v.get("tool.format.title"),
    style: "margin-right: 8px; width: 100px;",
    value: "p"
  }), i.fontfamily = new fi({
    name: "fontfamily",
    label: "默认",
    title: "字体",
    label: v.get("tool.fontfamily.label"),
    title: v.get("tool.fontfamily.title"),
    style: "margin-right: 4px; width: 100px;",
    value: ""
  }), i.fontsize = new fi({
    name: "fontsize",
    label: v.get("tool.fontsize.label"),
    title: v.get("tool.fontsize.title"),
    style: "margin-right: 8px; width: 100px;",
    value: ""
  }), i.quote = new M({
    name: "quote",
    icon: "quote",
    label: v.get("tool.quote.label"),
    title: v.get("tool.quote.title"),
    run: C.blockquote,
    active: O.blockquote
  }), i.strong = new M({
    name: "strong",
    icon: "strong",
    label: v.get("tool.strong.label"),
    title: v.get("tool.strong.title"),
    shortcut: "Mod-b",
    run: C.strong,
    active: function(o) {
      return O.mark(o, o.schema.marks.strong);
    }
  }), i.italic = new M({
    name: "italic",
    icon: "italic",
    label: v.get("tool.italic.label"),
    title: v.get("tool.italic.title"),
    shortcut: "Mod-i",
    run: C.italic,
    active: function(o) {
      return O.mark(o, o.schema.marks.em);
    }
  }), i.underline = new M({
    name: "underline",
    icon: "underline",
    label: v.get("tool.underline.label"),
    title: v.get("tool.underline.title"),
    run: C.underline,
    active: function(o) {
      return O.mark(o, o.schema.marks.underline);
    }
  }), i.strike = new M({
    name: "strike",
    icon: "strike",
    label: v.get("tool.strike.label"),
    title: v.get("tool.strike.title"),
    run: C.strike,
    active: function(o) {
      return O.mark(o, o.schema.marks.strike);
    }
  }), i.forecolor = new M({
    name: "forecolor",
    icon: "forecolor",
    label: v.get("tool.forecolor.label"),
    title: v.get("tool.forecolor.title"),
    run: C.forecolor,
    active: function(o) {
      return O.mark(o, o.schema.marks.forecolor);
    }
  }), i.backcolor = new M({
    name: "backcolor",
    icon: "backcolor",
    label: v.get("tool.backcolor.label"),
    title: v.get("tool.backcolor.title"),
    run: C.backcolor,
    active: function(o) {
      return O.mark(o, o.schema.marks.backcolor);
    }
  }), i.clean = new M({
    name: "clean",
    icon: "clean",
    label: v.get("tool.clean.label"),
    title: v.get("tool.clean.title"),
    run: C.clean
  }), i.ulist = new M({
    name: "ulist",
    icon: "ulist",
    label: v.get("tool.ulist.label"),
    title: v.get("tool.ulist.title"),
    run: C.ulist,
    select: C.ulist
  }), i.olist = new M({
    name: "olist",
    icon: "olist",
    label: v.get("tool.olist.label"),
    title: v.get("tool.olist.title"),
    run: C.olist,
    select: C.olist
  }), i.lift = new M({
    name: "lift",
    icon: "dedent",
    label: "提升块",
    title: "提升块",
    label: v.get("tool.lift.label"),
    title: v.get("tool.lift.title"),
    run: C.lift,
    select: C.lift
  }), i.align = new M({
    name: "align",
    icon: "align",
    label: v.get("tool.align.label"),
    title: v.get("tool.align.title"),
    value: "left",
    items: [
      new M({ name: "left", icon: "alignleft", label: v.get("align.left"), run: C.left }),
      new M({ name: "right", icon: "alignright", label: v.get("align.right"), run: C.right }),
      new M({ name: "center", icon: "aligncenter", label: v.get("align.center"), run: C.center }),
      new M({ name: "justify", icon: "align", label: v.get("align.justify"), run: C.justify })
    ],
    select: O.align
  }), i.left = new M({ name: "left", icon: "alignleft", label: v.get("align.left"), run: C.left }), i.right = new M({ name: "right", icon: "alignright", label: v.get("align.right"), run: C.right }), i.center = new M({ name: "center", icon: "aligncenter", label: v.get("align.center"), run: C.center }), i.justify = new M({ name: "justify", icon: "align", label: v.get("align.justify"), run: C.justify }), i.dedent = new M({
    name: "dedent",
    icon: "dedent",
    label: v.get("tool.dedent.label"),
    title: v.get("tool.dedent.title"),
    run: C.dedent,
    select: O.dedent
  }), i.indent = new M({
    name: "indent",
    icon: "indent",
    label: v.get("tool.indent.label"),
    title: v.get("tool.indent.title"),
    run: C.indent,
    select: O.indent
  }), i.link = new M({
    name: "link",
    icon: "link",
    label: v.get("tool.link.label"),
    title: v.get("tool.link.title"),
    run: C.link,
    active: function(o) {
      return O.mark(o, o.schema.marks.link);
    },
    enable: function(o) {
      return !o.selection.empty;
    }
  }), i.unlink = new M({
    name: "unlink",
    icon: "unlink",
    label: v.get("tool.unlink.label"),
    title: v.get("tool.unlink.title"),
    ignore: !0,
    run: C.unlink
  }), i.anchor = new M({
    name: "anchor",
    icon: "anchor",
    label: v.get("tool.anchor.label"),
    title: v.get("tool.anchor.title"),
    run: C.anchor
  }), i.image = new M({
    name: "image",
    icon: "image",
    label: v.get("tool.image.label"),
    title: v.get("tool.image.title"),
    items: [
      new M({ icon: "image", label: v.get("image.online"), value: "image", run: C.image }),
      new M({ icon: "image-u", label: v.get("image.upload"), value: "image2", run: Mn.image })
    ]
  }), i.video = new M({
    name: "video",
    icon: "video",
    label: v.get("tool.video.label"),
    title: v.get("tool.video.title"),
    items: [
      new M({ icon: "video", label: v.get("video.online"), value: "video", run: C.video }),
      new M({ icon: "video-u", label: v.get("video.upload"), value: "video2", run: Mn.video })
    ]
  }), i.audio = new M({
    name: "audio",
    icon: "audio",
    label: v.get("tool.audio.label"),
    title: v.get("tool.audio.title"),
    items: [
      new M({ icon: "audio", label: v.get("audio.online"), value: "video", run: C.audio }),
      new M({ icon: "audio-u", label: v.get("audio.upload"), value: "video2", run: Mn.audio })
    ]
  }), i.attachment = new M({
    name: "attachment",
    icon: "attachment",
    label: v.get("tool.attachment.label"),
    title: v.get("tool.attachment.title"),
    run: Mn.attachment
  }), i.hr = new M({
    name: "hr",
    icon: "hr",
    label: v.get("tool.hr.label"),
    title: v.get("tool.hr.title"),
    run: C.hr
  }), i.emot = new M({
    name: "emot",
    icon: "emot",
    label: v.get("tool.emot.label"),
    title: v.get("tool.emot.title"),
    run: C.emot
  }), i.table = new M({
    name: "table",
    icon: "table",
    label: v.get("tool.table.label"),
    title: v.get("tool.table.title"),
    run: C.table
  }), i.code = new M({
    name: "code",
    icon: "code",
    label: v.get("tool.code.label"),
    title: v.get("tool.code.title"),
    run: C.code,
    active: function(o) {
      return O.mark(o, o.schema.marks.code);
    }
  }), i.undo = new M({
    name: "undo",
    icon: "undo",
    label: v.get("tool.undo.label"),
    title: v.get("tool.undo.title"),
    run: C.undo,
    enable: C.undo
  }), i.redo = new M({
    name: "redo",
    icon: "redo",
    label: v.get("tool.redo.label"),
    title: v.get("tool.redo.title"),
    run: C.redo,
    enable: C.redo
  }), i.fullscreen = new M({
    name: "fullscreen",
    icon: "fullscreen",
    label: v.get("tool.fullscreen.label"),
    title: v.get("tool.fullscreen.title"),
    run: C.fullscreen
  }), i.zoom = new M({
    name: "zoom",
    label: v.get("tool.zoom.label"),
    title: v.get("tool.zoom.title"),
    render: function(o) {
      const l = document.createElement("div");
      return l.className = "se-menuitem", l.setAttribute("role", "group"), l.innerHTML = [
        '<button type="button" class="se-button left" role="button" aria-label="缩小" data-name="zoom" data-title="缩小">' + si.get("minus") + "</button>",
        '<button type="button" class="se-button text" style="min-width: 60px;" aria-label="缩放级别" aria-expanded="false" data-title="100%">100%</button>',
        '<button type="button" class="se-button right" role="button" aria-label="放大" data-name="zoom" data-title="放大">' + si.get("plus") + "</button>"
      ].join(""), this.element = l;
    },
    run: C.zoom
  }), i.assets = new M({
    name: "assets",
    icon: "folder",
    label: v.get("tool.assets.label"),
    title: v.get("tool.assets.title"),
    run: C.assets
  }), i.share = new M({
    name: "share",
    icon: "share",
    label: v.get("tool.share.label"),
    title: v.get("tool.share.title"),
    run: C.share
  }), i.lock = new M({
    name: "lock",
    icon: "lock",
    label: v.get("tool.lock.label"),
    title: v.get("tool.lock.title"),
    run: C.lock
  }), i.info = new M({
    name: "info",
    icon: "info",
    label: v.get("tool.info.label"),
    title: v.get("tool.info.title"),
    run: C.info
  }), i.setting = new M({
    name: "setting",
    icon: "setting",
    label: v.get("tool.setting.label"),
    title: v.get("tool.setting.title"),
    run: C.setting
  });
  const t = function() {
    const o = oe.create("button", { class: "se-button flex" }), l = oe.create("span", { class: "checkable" }), a = oe.create("span", { class: this.value }, [this.label]);
    this.icon && l.appendChild(si.create(this.icon)), o.appendChild(l), o.appendChild(a), this.element.appendChild(o);
  };
  i.format.items = [
    new P({ label: v.get("format.h1"), value: "h1", render: t, run: C.h1, active: O.h1 }),
    new P({ label: v.get("format.h2"), value: "h2", render: t, run: C.h2, active: O.h2 }),
    new P({ label: v.get("format.h3"), value: "h3", render: t, run: C.h3, active: O.h3 }),
    new P({ label: v.get("format.h4"), value: "h4", render: t, run: C.h4, active: O.h4 }),
    new P({ label: v.get("format.h5"), value: "h5", render: t, run: C.h5, active: O.h5 }),
    new P({ label: v.get("format.p"), value: "p", run: C.paragraph, active: O.paragraph }),
    new P({ label: v.get("format.pre"), value: "pre", run: C.pre, active: O.codeblock })
  ];
  const n = function(o) {
    const l = oe.create("button", { class: "se-button" }), a = oe.create("span", { class: "checkable" }), c = oe.create("span", { class: "text", style: 'font-family: "' + this.value + '";' }, [this.label]);
    this.icon && a.appendChild(si.create(this.icon)), l.appendChild(a), l.appendChild(c), this.element.appendChild(l);
  }, r = function(o, l, a, c) {
    Eo.set(o.schema.marks.fontfamily, { family: this.value })(o, l, a, c);
  };
  i.fontfamily.items = [
    new P({ label: "默认", value: "", render: n, run: r, active: O.fontfamily(null) }),
    new P({ label: "宋体", value: "宋体", render: n, run: r, active: O.fontfamily("宋体") }),
    new P({ label: "仿宋", value: "仿宋", render: n, run: r, active: O.fontfamily("仿宋") }),
    new P({ label: "黑体", value: "黑体", render: n, run: r, active: O.fontfamily("黑体") }),
    new P({ label: "楷体", value: "楷体", render: n, run: r, active: O.fontfamily("楷体") }),
    new P({ label: "标楷体", value: "标楷体", render: n, run: r, active: O.fontfamily("标楷体") }),
    new P({ label: "华文仿宋", value: "华文仿宋", render: n, run: r, active: O.fontfamily("华文仿宋") }),
    new P({ label: "华文楷体", value: "华文楷体", render: n, run: r, active: O.fontfamily("华文楷体") }),
    new P({ label: "微软雅黑", value: "Microsoft YaHei", render: n, run: r, active: O.fontfamily("Microsoft YaHei") }),
    new P({ label: "Arial", value: "Arial", render: n, run: r, active: O.fontfamily("Arial") }),
    new P({ label: "Arial Black", value: "Arial Black", render: n, run: r, active: O.fontfamily("Arial Black") }),
    new P({ label: "Comic Sans MS", value: "Comic Sans MS", render: n, run: r, active: O.fontfamily("Comic Sans MS") }),
    new P({ label: "Courier New", value: "Courier New", render: n, run: r, active: O.fontfamily("Courier New") }),
    new P({ label: "System", value: "System", render: n, run: r, active: O.fontfamily("System") }),
    new P({ label: "Times New Roman", value: "Times New Roman", render: n, run: r, active: O.fontfamily("Times New Roman") }),
    new P({ label: "Tahoma", value: "Tahoma", render: n, run: r, active: O.fontfamily("Tahoma") }),
    new P({ label: "Verdana", value: "Verdana", render: n, run: r, active: O.fontfamily("Verdana") })
  ];
  const s = function(o, l, a, c) {
    Eo.set(o.schema.marks.fontsize, { size: this.value })(o, l);
  };
  return i.fontsize.items = (function() {
    let o = [], l = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px", "72px"];
    o.push(new P({ label: "默认", value: "", run: s, active: O.fontsize(null) }));
    for (let a = 0; a < l.length; a++) {
      let c = l[a];
      o.push(new P({ label: c, value: c, run: s, active: O.fontsize(c) }));
    }
    return o;
  })(), i;
};
Le.getItems = function(i, t) {
  const n = "format, fontfamily, fontsize, quote, |, strong, italic, underline, strike, forecolor, backcolor, clean, |, ulist, olist, lift, align, dedent, indent, |, link, unlink, anchor, image, video, audio, attachment, hr, emot, table, code, undo, redo, fullscreen, |, zoom, |, assets, share, lock, info, setting", r = Le.defaults();
  if (i)
    for (let a = 0; a < i.length; a++) {
      let c = i[a], u = c.name;
      r[u] = Le.build(c);
    }
  const s = [], o = [];
  if ((t || "*") == "*") {
    if (Array.prototype.push.apply(s, Le.split(n)), i)
      for (let a = 0; a < i.length; a++)
        s.push(i[a].name);
  } else
    Array.prototype.push.apply(s, Le.split(t));
  let l = -2;
  for (let a = 0; a < s.length; a++) {
    let c = null, u = s[a];
    u == "|" ? l != o.length - 1 && (c = new Na(), l = o.length) : c = r[u], c && c.spec.ignore != !0 && o.push(c);
  }
  return o;
};
Le.split = function(i) {
  let t = 0, n = [];
  for (let r = 0; r < i.length; r++) {
    let s = i.charCodeAt(r);
    (s <= 32 || s == 44 || s == 59) && (r > t && n.push(i.substring(t, r)), t = r + 1);
  }
  return t < i.length && n.push(i.substring(t, i.length)), n;
};
Le.build = function(i) {
  if (i.name == "|")
    return new Na();
  if (i instanceof M || i instanceof fi)
    return i;
  let t = new M(i);
  if (i.items) {
    t.items = [];
    for (let n = 0; n < i.items.length; n++)
      t.items.push(this.build(i.items[n]));
  }
  return t;
};
const Kt = function() {
  this.id = 1, this.assetss = [];
};
Kt.prototype.add = function(i, t) {
  if (i.store == "LOCAL")
    return i;
  const n = {};
  return t == "image" ? (n.id = this.id++, n.name = i.title, n.title = i.title, n.url = i.src, n.size = i.size, n.type = "image", n.store = "LOCAL", n.width = i.width, n.height = i.height) : t == "audio" ? (n.id = this.id++, n.name = i.name, n.title = i.name, n.url = i.src, n.size = i.size, n.type = "audio", n.store = "LOCAL") : t == "video" ? (n.id = this.id++, n.name = i.name, n.title = i.name, n.url = i.src, n.size = i.size, n.type = "video", n.store = "LOCAL") : (n.id = this.id++, n.name = i.name, n.title = i.name, n.url = i.url, n.size = i.size, n.type = "attachment", n.store = "LOCAL"), (n.name == null || n.name == null || n.name.length < 1) && (n.name = Ea.getName(n.url)), this.assetss.push(n), n;
};
Kt.prototype.put = function(i, t) {
  let n = this.add(i, t);
  n && this.change && this.change("ADD", [n]);
};
Kt.prototype.all = function() {
  return this.assetss.slice(0);
};
Kt.prototype.from = function(i) {
  i instanceof HTMLElement ? this.build(i) : this.build(oe.create("div", null, i));
};
Kt.prototype.build = function(i) {
  const t = this, n = i.querySelectorAll("img"), r = i.querySelectorAll("audio"), s = i.querySelectorAll("video"), o = i.querySelectorAll("attachment");
  n.forEach(function(l) {
    const a = {};
    a.src = l.getAttribute("src"), a.title = l.getAttribute("title"), a.width = l.style.width, a.height = l.style.height, a.src && t.add(a, "image");
  }), r.forEach(function(l) {
    const a = {};
    a.src = l.getAttribute("src"), a.name = l.getAttribute("data-name"), t.add(a, "audio");
  }), s.forEach(function(l) {
    const a = {};
    a.src = l.getAttribute("src"), a.name = l.getAttribute("data-name"), t.add(a, "video");
  }), o.forEach(function(l) {
    const a = {};
    a.name = l.getAttribute("data-name"), a.url = l.getAttribute("data-url"), a.size = parseInt(l.getAttribute("data-size")), t.add(a, "attachment");
  });
};
Kt.prototype.clear = function() {
  const i = this.assetss;
  this.assetss = [], this.change && this.change("CLEAR", i);
};
const qi = {};
qi.create = function(i, t) {
  return new xe({
    key: new Ut("se6_paste_plugin"),
    props: {
      handlePaste: qi.handle
    }
  });
};
qi.handle = function(i, t, n) {
  return !!(hn.process(i, t, n) || Pn.process(i, t, n));
};
const hn = {};
hn.process = function(i, t, n) {
  const r = pi.getImage(), s = t.clipboardData.items;
  for (let o = 0; o < s.length; o++) {
    let l = s[o];
    if (l.kind == "file" && l.type.indexOf("image") > -1) {
      const a = hn.getFile(l.getAsFile());
      return r.enabled == !1 ? (new Mo().open(null, "禁止上传图片"), !0) : r.maxSize > 0 && a.size > r.maxSize ? (new Mo().open(null, "图片过大，最大允许：" + _h.format(r.maxSize, 2)), !0) : (Mn.upload(i, [a]), !0);
    }
  }
  return !1;
};
hn.getFile = function(i) {
  const t = Ea.getType(i.name), r = "screenshot_" + Kh.format() + "." + (t.length > 0 ? t : "png");
  return new File(
    [i],
    r,
    {
      type: i.type,
      lastModified: i.lastModified
    }
  );
};
hn.paste = function(i, t) {
  const n = new FileReader();
  n.onload = function(r) {
    const o = { src: r.target.result, title: t.name, alt: t.name };
    Gh.image(i, o);
  }, n.readAsDataURL(t);
};
const Pn = {};
Pn.process = function(i, t, n) {
  return function(s) {
    if (s) {
      const o = Pn.clean(s), l = Wt.fromSchema(i.state.schema), a = document.createElement("div");
      a.innerHTML = o;
      const c = l.parseSlice(a), { dispatch: u, state: d } = i, h = d.tr.replaceSelection(c);
      return u(h.scrollIntoView()), !0;
    }
    return !1;
  }(t.clipboardData.getData("text/html"));
};
Pn.read = function(i) {
  window.navigator.clipboard.read().then(function(t) {
    for (const n of t)
      if (n.types.includes("text/html")) {
        n.getType("text/html").then(function(r) {
          r.text().then(i);
        });
        break;
      }
  });
};
Pn.clean = function(i) {
  return Oi.clean(i);
};
const Ta = {};
Ta.build = function(i, t) {
  let n = null;
  t.value instanceof HTMLElement ? n = t.value : (n = document.createElement("div"), t.value && (n.innerHTML = t.value));
  const r = bd, s = r.spec.marks.append({
    link: {
      attrs: {
        class: {
          default: null,
          validate: "string|null"
        },
        href: {
          default: null,
          validate: "string|null"
        },
        title: {
          default: null,
          validate: "string|null"
        },
        target: {
          default: null,
          validate: "string|null"
        },
        referer: {
          default: null,
          validate: "string|null"
        }
      },
      inclusive: !1,
      parseDOM: [
        {
          tag: "a[href]"
        }
      ],
      toDOM: function(g) {
        return ["a", {
          class: g.attrs.class,
          href: g.attrs.href,
          title: g.attrs.title,
          target: g.attrs.target,
          "data-referer": g.attrs.referer
        }, 0];
      }
    },
    // 字体
    fontfamily: {
      attrs: { family: { default: "" } },
      parseDOM: [
        {
          style: "font-family",
          getAttrs: function(g) {
            return { family: g.trim() };
          }
        }
      ],
      toDOM: function(g) {
        return ["span", { style: "font-family: " + g.attrs.family }, 0];
      }
    },
    // 字号
    fontsize: {
      attrs: { size: { default: "" } },
      toDOM: function(g) {
        return ["span", { style: "font-size: " + g.attrs.size }, 0];
      },
      parseDOM: [
        {
          style: "font-size",
          getAttrs: function(g) {
            return { size: g.trim() };
          }
        }
      ]
    },
    // 字体颜色
    forecolor: {
      attrs: { color: { default: "" } },
      toDOM: function(g) {
        return ["span", { style: "color: " + g.attrs.color }, 0];
      },
      parseDOM: [
        {
          style: "color",
          getAttrs: function(g) {
            return { color: g.trim() };
          }
        }
      ]
    },
    // 背景色
    backcolor: {
      attrs: { color: { default: "" } },
      toDOM: function(g) {
        return ["span", { style: "background-color: " + g.attrs.color }, 0];
      },
      parseDOM: [
        {
          style: "background-color",
          getAttrs: function(g) {
            return { color: g.trim() };
          }
        }
      ]
    },
    // 上划线 | 删除线 | 下划线
    // overline | line-through | underline
    underline: {
      attrs: {},
      toDOM: function(g) {
        return ["u", {}, 0];
      },
      parseDOM: [
        {
          getAttrs: function(g) {
            return {};
          }
        }
      ]
    },
    // 上划线 | 删除线 | 下划线
    // overline | line-through | underline
    strike: {
      attrs: {},
      toDOM: function(g) {
        return ["s", {}, 0];
      },
      parseDOM: [
        {
          getAttrs: function(g) {
            return {};
          }
        }
      ]
    }
  }), o = {
    inline: !0,
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      align: { default: null }
    },
    group: "inline",
    draggable: !0,
    parseDOM: [{
      tag: "img[src]",
      getAttrs: function(g) {
        let S = g.style.width, E = g.style.height, he = g.style.marginLeft, yn = g.style.marginRight;
        return S || (S = g.getAttribute("width"), S && (S = S + "px")), E || (E = g.getAttribute("height"), E && (E = E + "px")), g.style.margin == "0 auto" || he == "auto" && yn == "auto", {
          src: g.getAttribute("src"),
          width: S || null,
          height: E || null,
          title: g.getAttribute("title"),
          alt: g.getAttribute("alt")
        };
      }
    }],
    toDOM(g) {
      const S = [], E = { src: g.attrs.src };
      return g.attrs.width && S.push("width: " + g.attrs.width + ";"), g.attrs.height && S.push("height: " + g.attrs.height + ";"), S.length > 0 && (E.style = S.join(" ")), g.attrs.title && g.attrs.title.length > 0 && (E.title = g.attrs.title), g.attrs.alt && g.attrs.alt.length > 0 && (E.alt = g.attrs.alt), ["img", E];
    }
  }, l = {
    inline: !0,
    attrs: {
      src: {},
      controls: { default: !0 },
      width: { default: null },
      height: { default: null }
    },
    group: "inline",
    parseDOM: [{
      tag: "audio[src]",
      getAttrs: function(g) {
        return {
          src: g.getAttribute("src"),
          controls: g.hasAttribute("controls"),
          width: g.getAttribute("width"),
          height: g.getAttribute("height")
        };
      }
    }],
    toDOM: function(g) {
      return ["audio", {
        src: g.attrs.src,
        controls: g.attrs.controls ? "" : null,
        width: g.attrs.width,
        height: g.attrs.height,
        style: "max-width: 100%"
      }];
    }
  }, a = {
    inline: !0,
    attrs: {
      src: {},
      controls: { default: !0 },
      width: { default: null },
      height: { default: null }
    },
    group: "inline",
    parseDOM: [{
      tag: "video[src]",
      getAttrs: function(g) {
        return {
          src: g.getAttribute("src"),
          controls: g.hasAttribute("controls"),
          width: g.getAttribute("width"),
          height: g.getAttribute("height")
        };
      }
    }],
    toDOM: function(g) {
      return ["video", {
        src: g.attrs.src,
        controls: g.attrs.controls ? "" : null,
        width: g.attrs.width,
        height: g.attrs.height,
        style: "max-width: 100%"
      }];
    }
  }, c = {
    inline: !0,
    attrs: {
      src: {},
      width: { default: null },
      height: { default: null },
      allow: { default: null }
    },
    group: "inline",
    parseDOM: [{
      tag: "iframe[src]",
      getAttrs: function(g) {
        let S = g.getAttribute("src"), E = g.style.width, he = g.style.height, yn = g.getAttribute("allow");
        return E || (E = g.getAttribute("width"), E && (E = E + "px")), he || (he = g.getAttribute("height"), he && (he = he + "px")), { src: S, width: E, height: he, allow: yn };
      }
    }],
    toDOM: function(g) {
      let S = {}, E = [];
      return g.attrs.width && E.push("width: " + g.attrs.width + ";"), g.attrs.height && E.push("height: " + g.attrs.height + ";"), S.src = g.attrs.src, E.length > 0 && (S.style = E.join(" ")), g.attrs.allow && g.attrs.allow.length > 0 && (S.allow = g.attrs.allow.trim()), ["iframe", S];
    }
  }, u = {
    inline: !0,
    attrs: {
      name: { default: null },
      title: { default: null },
      url: { default: null },
      size: { default: null }
    },
    group: "inline",
    draggable: !0,
    parseDOM: [{
      tag: "attachment",
      getAttrs: function(g) {
        return { name: g.getAttribute("data-name"), title: g.getAttribute("data-title"), url: g.getAttribute("data-url"), size: g.getAttribute("data-size") };
      }
    }],
    toDOM(g) {
      return ["attachment", { "data-name": g.attrs.name, "data-title": g.attrs.title, "data-url": g.attrs.url, "data-size": g.attrs.size }];
    }
  }, d = {
    content: "inline*",
    group: "block",
    attrs: { indent: { default: 0 }, align: { default: null } },
    parseDOM: [{
      tag: "p",
      getAttrs: function(g) {
        const S = g.style.textIndent || "0em", E = parseInt(S.replace(/em/, "")) || 0, he = g.style.textAlign;
        return { indent: E, align: he };
      }
    }],
    toDOM: function(g) {
      let S = [], E = {};
      return g.attrs.indent && g.attrs.indent > 0 && S.push("text-indent: " + g.attrs.indent + "em;"), ["left", "right", "center", "justify"].includes(g.attrs.align) && S.push("text-align: " + g.attrs.align + ";"), S.length > 0 && (E.style = S.join(" ")), ["p", E, 0];
    }
  }, h = {
    code: !0,
    content: "text*",
    defining: !0,
    group: "block",
    marks: "",
    attrs: {
      lang: { default: "plaintext" }
    },
    toDOM: function(g) {
      return [
        "pre",
        ["code", { class: "language-" + g.attrs.lang }, 0]
      ];
    },
    parseDOM: [
      {
        tag: "pre",
        getAttrs: function(g) {
          let S = g.firstChild, E = "plaintext";
          return S && S.className && (E = S.className.match(/language-(\w+)/)?.[1] || "plaintext"), { lang: E };
        },
        contentElement: "code"
      }
    ]
  }, f = Vd({
    tableGroup: "block",
    cellContent: "block+",
    // 单元格可包含多个块级节点（段落、标题等）
    cellAttributes: {
      // 可选：自定义单元格属性（如背景色、边框）
      background: { default: null },
      borderColor: { default: null }
    }
  }), p = {
    inline: !0,
    group: "inline",
    selectable: !1,
    parseDOM: [{ tag: "br" }],
    toDOM: function() {
      return ["br"];
    }
  }, m = r.spec.nodes.append(f).update("paragraph", d).update("code_block", h).update("hard_break", p).update("image", o).update("audio", l).update("video", a).update("iframe", c).update("attachment", u), y = new qr({
    nodes: Md(m, "paragraph block*", "block"),
    marks: s
  }), b = {
    // 绑定快捷键（可选，和菜单功能一致）
    "Mod-b": xt(y.marks.bold),
    "Mod-i": xt(y.marks.italic),
    Tab: uo(1),
    "Shift-Tab": uo(-1),
    "Mod-Enter": C.br,
    "Mod-z": Gr,
    "Mod-y": Ei,
    "Mod-Shift-z": Ei
  };
  (t.menubar == null || t.menubar == null) && (t.menubar = {});
  const w = Le.getItems(t.menubar.items, t.menubar.enabled);
  for (let g = 0; g < w.length; g++) {
    let S = w[g];
    S.shortcut && (b[S.shortcut] = function(E, he, yn, rs) {
      jh.stop(rs), S.run && S.run(E, he, yn, rs);
    });
  }
  const D = [];
  D.push(ca.create(w)), pi.getValue(t, "editor.title.enabled") == !0 && D.push(da.create(t)), pi.getValue(t, "editor.nodebar.enabled") == !0, D.push(ua.create()), D.push(ha.create()), D.push(xa.create()), D.push(ka.create()), D.push(m1()), D.push(M1()), D.push(Sa.create()), D.push(io(b)), D.push(io(K1)), D.push(nh());
  const B = ut.create({
    schema: y,
    doc: Wt.fromSchema(y).parse(n),
    plugins: D
  }), ge = pi.getValue(t, "editor.editable") != !1, J = new Hl(i, {
    state: B,
    nodeViews: {
      code_block: function(g, S, E) {
        return new Ph(g, S, E, t);
      },
      image: function(g, S, E) {
        return new Vh(g, S, E);
      },
      attachment: function(g, S, E) {
        return new Wh(g, S, E);
      }
    },
    attributes: {
      class: "ProseMirror",
      contenteditable: "true"
    },
    // 无效
    // domEventHandlers: {
    //     "paste": function(view, event) {
    //         event.preventDefault();
    //         PastePlugin.handle(view, event, null);
    //         return true;
    //     }
    // },
    editable: ge ? (function(g) {
      return !0;
    }) : (function(g) {
      return !1;
    })
  }), Se = function(g) {
    const S = J.dom;
    if (S == null || S == null || S.parentNode == null) {
      document.removeEventListener("paste", Se);
      return;
    }
    if (S.contains(g.target) == !0)
      return g.preventDefault(), g.stopPropagation(), qi.handle(J, g, null), !0;
  };
  return document.addEventListener("paste", Se, { capture: !0 }), J;
};
const Qh = {};
Qh.scan = function(i, t, n) {
  const r = [], s = [];
  if (i.querySelectorAll("img").forEach(function(l) {
    const a = l.src;
    if (Co.test(a)) {
      const c = Co.toBlob(a), u = hn.getFile(c);
      s.push(u), r.push({ file: u, element: l });
    }
  }), s.length < 1) {
    n();
    return;
  }
  let o = 0;
  t.upload(s, function(l, a) {
    o++;
    const c = (function() {
      for (let u = 0; u < r.length; u++) {
        let d = r[u];
        if (d.file == l)
          return d.element;
      }
      return null;
    })();
    c && (c.src = a.url), o >= s.length && n();
  });
};
const j = function(i) {
  this.opts = i || { menubar: {} }, this.view = null, this.upload = new Yh(), this.assetsManager = new Kt();
};
j.prototype.render = function(i, t) {
  const n = this, r = Object.assign(this.opts, { value: t }), s = document.createElement("div");
  s.className = "se-container", s.innerHTML = [
    '<div class="se-toolbar"></div>',
    '<div class="se-nodebar"></div>',
    '<div class="se-frame">',
    '<div class="se-editor"></div>',
    '<div class="se-loading-mask"></div>',
    "</div>"
  ].join(""), i.appendChild(s);
  const o = s.querySelector(":scope > div.se-frame"), l = s.querySelector(":scope > div.se-frame div.se-editor");
  if (this.view = Ta.build(l, r), this.view.INSTANCE = this, s.addEventListener("click", function(a) {
    if ((a.target || a.srcElement).className == "se-editor")
      try {
        n.view.focus();
      } catch (u) {
        console.log(u);
      }
  }), i.closest(".word")) {
    const a = document.createElement("div");
    a.className = "se-backtop", a.textContent = "↑", a.addEventListener("click", function(u) {
      oe.scrollToTop(o, 600);
    }), o.addEventListener("scroll", function(u) {
      this.scrollTop > 20 ? a.classList.add("show") : a.classList.remove("show");
    }), o.appendChild(a);
    const c = document.createElement("div");
    c.className = "se-page", c.innerHTML = [
      '<div class="se-d1 se-s1"></div>',
      '<div class="se-d2 se-s1"></div>',
      '<div class="se-d3 se-s1"></div>',
      '<div class="se-d4 se-s1"></div>'
    ].join(""), l.appendChild(c);
  }
};
j.prototype.setTitle = function(i) {
  const n = this.view.dom.parentElement.querySelector(":scope > div.se-title input[name=title]");
  n && (n.value = i || ""), this.opts.title = i || "";
};
j.prototype.getTitle = function() {
  const t = this.view.dom.parentElement.querySelector(":scope > div.se-title input[name=title]");
  return t ? t.value : null;
};
j.prototype.getValue = function(i) {
  const t = this.view.state.schema, n = this.view.state.doc, r = kt.fromSchema(t).serializeFragment(n.content), s = document.createElement("div");
  return s.appendChild(r), i == !0 ? Oi.format(s) : s.innerHTML;
};
j.prototype.getJSON = function() {
  return this.view.state.doc.toJSON();
};
j.prototype.setValue = function(i, t) {
  let n = null;
  i instanceof window.HTMLElement ? t == !0 ? (n = document.createElement("div"), n.innerHTML = Oi.clean(i.innerHTML)) : n = i : (n = document.createElement("div"), n.innerHTML = t == !0 ? Oi.clean(i) : i);
  const r = this.view.state.schema, s = this.view.state.plugins, o = Wt.fromSchema(r).parse(n), l = ut.create({
    doc: o,
    plugins: s
  });
  this.view.updateState(l);
};
j.prototype.setContent = function(i) {
  let t = null;
  content instanceof window.Node ? t = content : (t = document.createElement("div"), t.innerHTML = content);
  const n = this.view.state, r = n.schema, s = Wt.fromSchema(r).parse(t), o = n.tr.replaceWith(0, n.doc.content.size, s.content);
  this.view.dispatch(o);
};
j.prototype.enable = function(i) {
  const n = this.view.dom.parentElement.querySelector(":scope > div.se-title input[name=title]");
  n && (n.readOnly = i == !1), this.view.dispatch(this.view.state.tr.setMeta("readonly", i == !1)), this.view.dom.setAttribute("contenteditable", "true");
};
j.prototype.disable = function() {
  this.enable(!1);
};
j.prototype.focus = function() {
  this.view.focus();
};
j.prototype.blur = function() {
  document.body.focus();
};
j.prototype.exec = function(i) {
  const t = C[i];
  t && t(this.view.state, this.view.dispatch, this.view, null);
};
j.prototype.undo = function() {
  this.exec("undo");
};
j.prototype.redo = function() {
  this.exec("redo");
};
j.prototype.fullscreen = function(i) {
  const t = this.view.dom.closest("div.se-container");
  t && oe.fullscreen(t, i || 1);
};
j.prototype.clear = function() {
  C.clear(this.view.state, this.view.dispatch, this.view, null);
};
j.prototype.loading = function(i) {
  const n = this.view.dom.closest("div.se-frame").querySelector("div.se-mask");
  n && (i != !1 ? (n.innerHTML = '<div class="se-loading"><div class="se-striped"></div></div>', n.style.display = "block") : (n.innerHTML = "", n.style.display = "none"));
};
j.prototype.info = function() {
  const i = {
    id: 1,
    title: "StackEditor 使用指南",
    mimeType: "text/html",
    category: { id: 1, name: "docker" },
    theme: "wiki",
    url: "/blog/article/display.html?id=1",
    createTime: "2026-03-08 08:00",
    updateTime: "2026-03-08 10:00"
  };
  new Xh(i).open();
};
j.prototype.destroy = function() {
  this.view && (this.view.destroy(), this.view = null);
};
(function() {
  Jh.guess();
})();
export {
  sf as Ajax,
  lf as Base64Upload,
  Zh as BundleManager,
  oe as DOM,
  of as DefaultUpload,
  C as EditCommand,
  Oi as HTML,
  Yh as MockUpload,
  Qh as ResourceHandler,
  af as Sharing,
  j as StackEditor
};
