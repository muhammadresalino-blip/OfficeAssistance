export const trimAll = (rows: string[][]) =>
  rows.map((r) => r.map((c) => c.replace(/\s+/g, ' ').trim()));

export function removeDuplicates(rows: string[][]) {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const key = r.join('|').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function detectIssues(rows: string[][]): string[] {
  const issues: string[] = [];
  if (rows.length === 0) return issues;

  const hasDup = rows.some((r, i) => rows.slice(i + 1).some((o) => o.join('|').toLowerCase() === r.join('|').toLowerCase()));
  if (hasDup) issues.push('duplicate');

  const hasExtraSpace = rows.some((r) => r.some((c) => c !== c.trim() || /\s{2,}/.test(c)));
  if (hasExtraSpace) issues.push('extra_space');

  const mixedDate = rows.some((r) => r.some((c) => /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c)) && r.some((c) => /\d{4}-\d{2}-\d{2}/.test(c)));
  if (mixedDate) issues.push('mixed_date');

  return issues;
}
