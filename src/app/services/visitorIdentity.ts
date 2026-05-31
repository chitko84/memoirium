const VISITOR_ID_KEY = "memoirium-anonymous-visitor-id";

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getAnonymousVisitorId() {
  const fallbackId = createVisitorId();

  if (typeof window === "undefined") {
    return fallbackId;
  }

  const storedId = window.localStorage.getItem(VISITOR_ID_KEY);

  if (storedId) {
    return storedId;
  }

  window.localStorage.setItem(VISITOR_ID_KEY, fallbackId);
  return fallbackId;
}
