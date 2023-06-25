import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.scss";
import axios, { AxiosResponse } from "axios";
import L, { LatLngTuple, GeoJSONOptions } from "leaflet";

const App: React.FC = () => {
  const [coordinates, setCoordinates] = React.useState<[number, number]>([
    64.7023545, -5.2765753,
  ]);

  const [geomData, setGeomData] = React.useState<any>(null);
  const [dataset, setDataset] = React.useState<any>(null);

  React.useEffect(() => {
    const getPopulationData = async (): Promise<void> => {
      try {
        const responseGeomData: Promise<AxiosResponse<any>> = axios.get(
          `https://sc-test-data-uk.netlify.app/great_britain_1.geojson`
        );

        const responseGeomData2: Promise<AxiosResponse<any>> = axios.get(
          `https://sc-test-data-uk.netlify.app/data_great_britain_1.json`
        );

        const responses: AxiosResponse<any>[] = await Promise.all([
          responseGeomData,
          responseGeomData2,
        ]);

        //console.log("data: ", responses[0].data);
        //console.log("data: ", responses[1].data);

        // console.log("features:", dataset);
        // console.log("features:", dataset && dataset.features);

        setGeomData(responses[0].data);
        setDataset(responses[1].data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    getPopulationData();
  }, []);

  type MoveToCoordinatesProps = {
    coordinates: [number, number];
    //setCoordinates: any;
  };

  const MoveToCoordinates: React.FC<MoveToCoordinatesProps> = ({
    coordinates,
  }) => {
    console.log(3, coordinates);
    const map = useMap();
    map.setView(coordinates);
    map.setZoom(8);

    return null;
  };

  const getProperties = (properties: any) => {
    //console.log({properties});
    //console.log("dataset.features: ", dataset.features)

    const feature = geomData.features.find(
      (item: any) => item.properties.lvl1_name === properties.lvl1_name
    );

    // setCoordinates(feature.bbox);
    setCoordinates([54.7023545, -3.2765753]);

    //console.log(feature.bbox);
  };

  return (
    <div className="wrapper">
      <div className="aside">
        <div className="lists-wrapper">
          <ul className="list">
            <li>Level 1</li>
            <li>Level 2</li>
          </ul>

          <ul className="list">
            {dataset &&
              dataset.features.map((item: any, index: number) => (
                <li key={index} onClick={() => getProperties(item.properties)}>
                  {item.properties.lvl1_name}
                </li>
              ))}
          </ul>
        </div>
      </div>
      <MapContainer center={coordinates} zoom={6} style={{ flex: "80%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="Map data © <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors"
        />

        {geomData && (
          <GeoJSON
            data={geomData}
            style={() => ({
              fillColor: "#d48585",
              fillOpacity: 0.6,
              color: "#000",
              weight: 1,
            })}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(
                `<strong>Region name: ${feature.properties.lvl1_name}</strong><br>Population: ${feature.properties.population}`
              );
            }}
          />
        )}

        <MoveToCoordinates coordinates={coordinates} />

        <Marker position={coordinates}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default App;
