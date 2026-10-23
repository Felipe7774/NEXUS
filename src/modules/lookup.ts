/** Bound UUID query strings below gateway URL limits. Each caller owns its table. */
export async function lookupBatches<T>(
  ids: (string | null)[],
  read: (batch: string[]) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  const rows: T[] = [];
  for (let offset = 0; offset < unique.length; offset += 100) {
    const { data, error } = await read(unique.slice(offset, offset + 100));
    if (error) throw error;
    rows.push(...(data ?? []));
  }
  return rows;
}
