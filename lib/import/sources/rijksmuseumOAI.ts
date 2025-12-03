export async function fetchRijksmuseumOAI() {
  // We simplify: load OAI via one step (you can later expand)
  const url = "https://www.rijksmuseum.nl/oaipmh/oai";

  // In real use, you’d need resumption tokens. For 80/20 we fetch limited sets.
  const response = await fetch(
    `${url}?verb=ListRecords&metadataPrefix=edm`
  );

  const xml = await response.text();

  // You would parse XML here — for 80/20, return empty until extended:
  return [];
}
