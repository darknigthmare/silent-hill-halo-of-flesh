/* Pure versus rules. These are implementation/balance choices, NOT canonical powers. */
export function takeDamage(actor, requested) {
  const amount = Number.isFinite(requested) ? Math.max(0, Math.round(requested)) : 0;
  const available = Math.max(0, Number.isFinite(actor.health) ? actor.health : 0);
  const dealt = Math.min(available, amount);
  actor.health = available - dealt;
  return dealt;
}

/** Abandon a interrupted action instead of resuming its old active frames. */
export function interruptAction(actor, state = 'hurt') {
  actor.attack = null;
  actor.counterStance = 0;
  actor.dodgeFrames = 0;
  actor.dodgeFollowupWindow = 0;
  actor.guardCounterWindow = 0;
  actor.parryWindow = 0;
  actor.blocking = false;
  actor.state = state;
}

/** A monster with more starting HP does not win time-out by virtue of size alone. */
export function timeoutWinner(left, right) {
  const a = Math.max(0, left.health) * Math.max(1, right.maxHealth);
  const b = Math.max(0, right.health) * Math.max(1, left.maxHealth);
  return Math.abs(a - b) < 1e-7 ? null : a > b ? left : right;
}

/** Swept square projectile against a body. Same square envelope as the old hitbox.
 * Slab intersection checks the whole frame, not only its destination. No RNG.
 */
export function sweptProjectileContact(from, to, radius, body) {
  const values = [from.x, from.y, to.x, to.y, radius, body.x, body.y, body.w, body.h];
  if (!values.every(Number.isFinite) || radius < 0 || body.w <= 0 || body.h <= 0) return null;
  let entry = 0, exit = 1;
  for (const [axis, size] of [['x', 'w'], ['y', 'h']]) {
    const lo = body[axis] - radius, hi = body[axis] + body[size] + radius;
    const start = from[axis], delta = to[axis] - start;
    if (Math.abs(delta) < 1e-9) {
      if (start <= lo || start >= hi) return null;
    } else {
      const near = (lo - start) / delta, far = (hi - start) / delta;
      entry = Math.max(entry, Math.min(near, far));
      exit = Math.min(exit, Math.max(near, far));
      if (entry > exit) return null;
    }
  }
  return { t: entry, x: from.x + (to.x - from.x) * entry, y: from.y + (to.y - from.y) * entry };
}
