import L, {
  LatLngBounds,
  LatLngBoundsExpression,
  LatLngBoundsLiteral,
  LatLngExpression,
} from "leaflet";

export const getCenterBbox = (bbox: number[]) => {
  const southwestLatitude = bbox[1];
  const southwestLongitude = bbox[0];
  const northeastLatitude = bbox[3];
  const northeastLongitude = bbox[2];

  const centerLatitude = (southwestLatitude + northeastLatitude) / 2;
  const centerLongitude = (southwestLongitude + northeastLongitude) / 2;

  const center = [centerLatitude, centerLongitude];

  return center;
};

export const getCenterBound = (bounds: LatLngBoundsExpression | LatLngBounds | LatLngBoundsLiteral ) => {
  //console.log({ bound });

  const bboxBounds = new LatLngBounds(bounds as LatLngBoundsLiteral);
  const center: LatLngExpression = bboxBounds.getCenter();

  //console.log(center); // Output: [58.080999925, -6.341788285]

  return center;
};

export const getColor = (density: number): string => {
  switch (true) {
    case density < 31:
      return "#db8080";
    case density < 60:
      return "#c63333";
    case density < 71:
      return "#b80101";
    default:
      return "#e9b2b2";
  }
};

export const getPopupContent = (
  feature: any,
  dataset: any,
  level: string
): string => {
  let popupContent = "";

  if (level === "level_1") {
    const lvl1_name = feature.properties.lvl1_name;
    const properties = dataset.features.find(
      (item: any) => item.properties.lvl1_name === lvl1_name
    );

    popupContent = `<strong>Region name: ${lvl1_name}</strong><br>Density: ${properties.properties.Density}`;
  }

  if (level === "level_2") {
    const lvl2_name = feature.properties.lvl2_name;
    const properties = dataset.features.find(
      (item: any) => item.properties.lvl2_name === lvl2_name
    );

    popupContent = `<strong>Region name: ${lvl2_name}</strong><br>Density: ${properties.properties.Density}`;
  }

  return popupContent;
};
