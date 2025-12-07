export async function fetchRijksmuseumCollection() {
  const API_KEY = process.env.RIJKSMUSEUM_API_KEY!;
  const url = `https://www.rijksmuseum.nl/api/nl/collection?key=${API_KEY}&ps=100`;

  const results = [];
  let page = 1;

  while (true) {
    const response = await fetch(`${url}&p=${page}`);
    const data = await response.json();

    if (!data.artObjects?.length) break;

    results.push(...data.artObjects);

    page++;
    if (page > 100) break; // safety
  }

  return results;
}
