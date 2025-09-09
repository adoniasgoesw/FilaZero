// Lightweight cache backed by localStorage with safe JSON handling

export function readCache(key) {
  try {
    const raw = localStorage.getItem(`cache:${key}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeCache(key, value) {
  try {
    localStorage.setItem(`cache:${key}`, JSON.stringify(value));
  } catch {
    // ignore quota or serialization errors
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(`cache:${key}`);
  } catch {
    // ignore
  }
}


