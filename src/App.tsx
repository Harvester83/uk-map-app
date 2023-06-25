import React from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.scss";
import axios from "axios";

const App: React.FC = () => {
  const center: [number, number] = [54.7023545, -3.2765753];

  const [populationData, setPopulationData] = React.useState(null);

  React.useEffect(() => {
    const getPopulationData = async () => {
      const response = await axios.get(
        `https://sc-test-data-uk.netlify.app/great_britain_1.geojson`
      );
      console.log("data: ", response.data);

      setPopulationData(response.data);
    };

    getPopulationData();
  }, []);

  return (
    <div className="wrapper">
      <div className="aside">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum accusamus
        odio tempore dicta, ullam culpa, tempora dolor neque ducimus harum et.
        Et corrupti fugit accusamus eos ratione quaerat recusandae aliquid.
      </div>
      <MapContainer center={center} zoom={6} style={{ flex: "70%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="Map data © <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors"
        />

        {populationData && (
          <GeoJSON
            data={populationData}
            style={() => ({
              fillColor: "#d48585",
              fillOpacity: 0.6,
              color: "#000",
              weight: 1,
            })}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(
                `<strong>Region name: ${feature.properties.name}</strong><br>Population: ${feature.properties.population}`
              );
            }}
          />
        )}

        <Marker position={center}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default App;
