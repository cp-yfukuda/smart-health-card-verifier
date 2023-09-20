function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
export class Timer {
  /* milli second */
  constructor() {
    _defineProperty(this, "startTime", void 0);
    /* milli second */
    _defineProperty(this, "timeTook", void 0);
    this.startTime = 0;
    this.timeTook = 0;
  }
  start() {
    this.startTime = new Date().getTime();
  }

  /**
   * result will be return in second.
   * @return {number} [description]
   */
  stop() {
    const time = new Date().getTime();
    this.timeTook = time - this.startTime;
    return this.timeTook / 1000;
  }
}
//# sourceMappingURL=timer.js.map