import React from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.scss";
import axios, { AxiosResponse } from "axios";
import L, {
  LatLngBounds,
  LatLngBoundsExpression,
  LatLngExpression,
} from "leaflet";
import {
  getCenterBbox,
  getCenterBound,
  getColor,
  getPopupContent,
} from "./utils";

type MapOptionsType = {
  bounds: LatLngBoundsExpression | LatLngBounds | null;
  coordinates: LatLngExpression;
  zoom: number;
  featureProperties: any
};

const App: React.FC = () => {
  const [level, setLevel] = React.useState<"level_1" | "level_2">("level_1");

  const [mapOptions, setMapOptions] = React.useState<MapOptionsType>({
    bounds: null,
    coordinates: [54.7023545, -4.2765753] as LatLngExpression,
    zoom: 6,
    featureProperties: {}
  });

  const [dataset, setDataset] = React.useState<any>(null);

  const getCombinedData = (geomData: any, dataset: any, level: string) => {
    return {
      type: "FeatureCollection",
      features: geomData.features.map((feature: any) => {
        const geoFeature: any = dataset.features.find((geoFeature: any) => {
          if (level === "level_1") {
            return (
              geoFeature.properties.lvl1_name === feature.properties.lvl1_name
            );
          }
          if (level === "level_2") {
            return (
              geoFeature.properties.lvl2_name === feature.properties.lvl2_name
            );
          }
          return false;
        });
        if (geoFeature) {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              ...geoFeature.properties,
            },
          };
        }
        return feature;
      }),
    };
  };

  React.useEffect(() => {
    const fetchData = async (
      geomUrl: string,
      dataUrl: string,
      level: string
    ): Promise<void> => {
      try {
        const responseGeomData: AxiosResponse<any> = await axios.get(geomUrl);
        const responseData: AxiosResponse<any> = await axios.get(dataUrl);
        const geomData = responseGeomData.data;
        const dataset = responseData.data;
        const combinedData = getCombinedData(geomData, dataset, level);
        setDataset(combinedData);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const getData = async (): Promise<void> => {
      const geomUrl = `https://sc-test-data-uk.netlify.app/great_britain_1.geojson`;
      const dataUrl = `https://sc-test-data-uk.netlify.app/data_great_britain_1.json`;
      await fetchData(geomUrl, dataUrl, "level_1");
    };

    getData();
  }, []);

  type FitBoundsProps = {
    bounds: LatLngBoundsExpression | null | any;
    properties: any;
  };

  const FitBounds: React.FC<FitBoundsProps> = ({ bounds, properties }) => {
    const map = useMap();

    React.useEffect(() => {
      if (!bounds) {
        return;
      }

      map.fitBounds(bounds);
      map.setZoom(8);

      console.log({properties});
      const name = level === "level_1" ? properties.lvl1_name : properties.lvl2_name

      const popupContent = `<strong>Region name: ${name}</strong><br>Density: ${properties.Density}`;
      const center = getCenterBound(bounds);

      const popup = L.popup({ closeOnClick: false })
        .setLatLng(center as LatLngExpression)
        .setContent(popupContent);

      map.openPopup(popup);
    }, [bounds, map]);

    return null;
  };

  const getFitBounds = (bbox: LatLngBoundsExpression | any, properties: any) => {
    if (!bbox) {
      return;
    }

    console.log("bbox: ", bbox);

    setMapOptions({
      ...mapOptions,
      featureProperties: properties,
      zoom: 10,
      bounds: [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]],
      ] as LatLngBoundsExpression,
    });
  };

  React.useEffect(() => {
    const fetchData = async (
      geomUrl: string,
      dataUrl: string,
      level: string
    ): Promise<void> => {
      try {
        const responseGeomData: AxiosResponse<any> = await axios.get(geomUrl);
        const responseData: AxiosResponse<any> = await axios.get(dataUrl);
        const geomData = responseGeomData.data;
        const dataset = responseData.data;
        const combinedData = getCombinedData(geomData, dataset, level);
        setDataset(combinedData);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const getFirstLevelDivisions = async (): Promise<void> => {
      const geomUrl =
        "https://sc-test-data-uk.netlify.app/great_britain_1.geojson";
      const dataUrl =
        "https://sc-test-data-uk.netlify.app/data_great_britain_1.json";
      await fetchData(geomUrl, dataUrl, "level_1");
    };

    const getSecondLevelDivisions = async (): Promise<void> => {
      const geomUrl =
        "https://sc-test-data-uk.netlify.app/great_britain_2.geojson";
      const dataUrl =
        "https://sc-test-data-uk.netlify.app/data_great_britain_2.json";
      await fetchData(geomUrl, dataUrl, "level_2");
    };

    if (level === "level_1") {
      getFirstLevelDivisions();
    } else {
      getSecondLevelDivisions();
    }
  }, [level]);

  return (
    <div className="wrapper">
      <div className="aside">
        <div className="lists-wrapper">
          <ul className="list">
            <li onClick={() => setLevel("level_1")}>Level 1</li>
            <li onClick={() => setLevel("level_2")}>Level 2</li>
          </ul>

          <div className="list-container">
            <ul className="list">
              {dataset &&
                dataset.features.map((item: any, index: number) => (
                  <li
                    key={index}
                    onClick={() => {
                      console.log(item);
                      getFitBounds(item.bbox, item.properties);
                    }}
                  >
                    {level === "level_1"
                      ? item.properties.lvl1_name
                      : item.properties.lvl2_name}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      <MapContainer
        center={mapOptions.coordinates}
        zoom={mapOptions.zoom}
        style={{ flex: "80%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="Map data © <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors"
        />

        {dataset &&
          dataset.features.map((item: any, index: number) => {
            return (
              <GeoJSON
                key={index}
                data={item.geometry}
                style={() => {
                  return {
                    fillColor: getColor(item?.properties.Density),
                    fillOpacity: 0.6,
                    color: "#000",
                    weight: 1,
                  };
                }}
                onEachFeature={(feature, layer) => {
                  const name =
                    level === "level_1"
                      ? item.properties.lvl1_name
                      : item.properties.lvl2_name;

                  layer.bindPopup(
                    `<strong>Region Name: ${name}</strong><br>Density: ${item.properties.Density}`
                  );
                }}
              />
            );
          })}

        <FitBounds bounds={mapOptions.bounds} properties={mapOptions.featureProperties}/>
      </MapContainer>
    </div>
  );
};

export default App;
