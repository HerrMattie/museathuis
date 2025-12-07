export function mergeAndFilterArtworks(collectionData: any[], oaiData: any[]) {
  const merged = [];

  for (const item of collectionData) {
    // Quality filter 1: image
    if (!item.webImage?.url) continue;
    if (item.webImage.width < 2000) continue;

    // Quality filter 2: essential metadata
    if (!item.title) continue;
    if (!item.principalOrFirstMaker) continue;

    merged.push({
      external_id: item.objectNumber,
      title: item.title,
      artist_name: item.principalOrFirstMaker,
      image_url: item.webImage.url,
      year_from: item.dating?.yearEarly || null,
      year_to: item.dating?.yearLate || null,
      object_type: item.objectTypes?.[0] || null,
      materials: item.materials?.join(", "),
      techniques: item.techniques?.join(", "),
      rights: item.productionPlaces?.join(", "),
      is_cc0: item.showImage === true
    });
  }

  return merged;
}
