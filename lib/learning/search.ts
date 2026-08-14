const INTENT_ALIASES: Record<string, string[]> = {
  recursion: ["recursion", "function", "call", "repeat"],
  variables: ["variables", "values", "state", "assign"],
  functions: ["functions", "function", "parameter", "return"],
  arrays: ["arrays", "array", "list", "collection"],
  loops: ["loops", "loop", "repeat", "iteration"],
};

export function semanticTokens(query: string): string[] {
  const normalized = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = new Set(normalized.split(/\s+/).filter(Boolean));
  Object.entries(INTENT_ALIASES).forEach(([intent, aliases]) => {
    if (aliases.some((alias) => normalized.includes(alias))) {
      tokens.add(intent);
      aliases.forEach((alias) => tokens.add(alias));
    }
  });
  return [...tokens];
}

export function semanticMatch(query: string, fields: string[]): boolean {
  const tokens = semanticTokens(query);
  if (tokens.length === 0) return true;
  const searchable = fields.join(" ").toLowerCase();
  return tokens.some((token) => searchable.includes(token));
}
