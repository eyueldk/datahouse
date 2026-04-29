/** Yields each full page from a list endpoint until all items are consumed. */
export async function* paginate<
  TPage extends { items: readonly unknown[]; meta: { offset: number; total: number } },
>(
  fetchPage: (args: { limit?: number; offset?: number }) => Promise<TPage>,
  options: { limit?: number; offset?: number } = {},
): AsyncGenerator<TPage, void, undefined> {
  const limit = options.limit;
  let offset = options.offset;

  while (true) {
    const page = await fetchPage({ limit, offset });
    if (page.items.length === 0) {
      break;
    }
    yield page;
    offset = page.meta.offset + page.items.length;
    if (offset >= page.meta.total) {
      break;
    }
  }
}
