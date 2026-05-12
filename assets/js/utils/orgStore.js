const ORGS_KEY = 'tf_orgs_v1';
const INVITES_KEY = 'tf_invites_v1';
const PRE_REG_KEY = 'tf_pre_reg_v1';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function genKey(len = 10) {
  // Lowercase, url-safe-ish key: [a-z0-9], using crypto randomness.
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export const orgStore = {
  getOrgs() {
    return readJson(ORGS_KEY, {});
  },

  getInvites() {
    return readJson(INVITES_KEY, {});
  },

  getPreReg() {
    return readJson(PRE_REG_KEY, {});
  },

  getOrg(orgId) {
    const orgs = this.getOrgs();
    return orgs[orgId] || null;
  },

  createOrg({ name, ownerSub }) {
    const orgId = genKey(12);
    const orgs = this.getOrgs();
    orgs[orgId] = { id: orgId, name, ownerSub, createdAt: new Date().toISOString() };
    writeJson(ORGS_KEY, orgs);
    return orgs[orgId];
  },

  createInvite({ orgId, createdBySub }) {
    const key = genKey(10);
    const invites = this.getInvites();
    invites[key] = {
      key,
      orgId,
      createdBySub,
      createdAt: new Date().toISOString(),
      usedBySub: null,
      usedAt: null,
    };
    writeJson(INVITES_KEY, invites);
    return invites[key];
  },

  useInvite({ key, usedBySub }) {
    const invites = this.getInvites();
    const inv = invites[key];
    if (!inv) return { ok: false, error: 'Invalid key' };
    if (inv.usedBySub) return { ok: false, error: 'Key already used' };
    inv.usedBySub = usedBySub;
    inv.usedAt = new Date().toISOString();
    invites[key] = inv;
    writeJson(INVITES_KEY, invites);
    return { ok: true, invite: inv };
  },

  listOrgInvites(orgId) {
    const invites = this.getInvites();
    return Object.values(invites).filter(i => i.orgId === orgId).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },

  preRegisterEmployee({ email, orgId }) {
    const preReg = this.getPreReg();
    if (preReg[email]) return { ok: false, error: 'User already pre-registered' };
    preReg[email] = { email, orgId, createdAt: new Date().toISOString() };
    writeJson(PRE_REG_KEY, preReg);
    return { ok: true };
  },

  getPreRegEntry(email) {
    const preReg = this.getPreReg();
    return preReg[email] || null;
  }
};

