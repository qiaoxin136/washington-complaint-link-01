import { useEffect, useState, ChangeEvent, useCallback } from "react";
import type { Schema } from "../amplify/data/resource";
import { DeckGL } from "@deck.gl/react";
import { PickingInfo } from "@deck.gl/core";
import { MVTLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer } from "@deck.gl/layers";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { MapView } from "@aws-amplify/ui-react-geo";
import { generateClient } from "aws-amplify/data";
import "@aws-amplify/ui-react/styles.css";

import {
  Flex,
  Button,
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  ThemeProvider,
  Theme,
  Divider,
  ScrollView,
} from "@aws-amplify/ui-react";

import {
  Marker,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
} from "react-map-gl";

import "@aws-amplify/ui-react/styles.css";
import "maplibre-gl/dist/maplibre-gl.css";

import { uploadData } from "aws-amplify/storage";

import axios, { AxiosResponse } from "axios";
import type { Feature, Geometry } from "geojson";

type BlockProperties = {
  person: string;
  description: string;
  date: string;
  report: string;
};

export type DataType = Feature<Geometry, BlockProperties>;

// Define the type for the file object
type FileType = File | null;

const client = generateClient<Schema>();

const theme: Theme = {
  name: "table-theme",
  tokens: {
    components: {
      table: {
        row: {
          hover: {
            backgroundColor: { value: "{colors.blue.20}" },
          },

          striped: {
            backgroundColor: { value: "{colors.orange.10}" },
          },
        },

        header: {
          color: { value: "{colors.blue.80}" },
          fontSize: { value: "{fontSizes.x3}" },
          borderColor: { value: "{colors.blue.20}" },
        },

        data: {
          fontWeight: { value: "{fontWeights.semibold}" },
        },
      },
    },
  },
};

const INITIAL_VIEW_STATE: any = {
  //longitude: 139.7674681227469,
  longitude: -80.20321,
  //latitude: 35.68111419325676,
  latitude: 26.00068,
  zoom: 17,
  bearing: 0,
  pitch: 0,
};

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  const { signOut } = useAuthenticator();
  const [person, setPerson] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  //const [report, setReport] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);

  const [file, setFile] = useState<FileType>();

  const [viewport, setViewport] = useState(INITIAL_VIEW_STATE);

  const [data, setData] = useState<DataType>();
  const layers: any = [];

  const handleChange = (event: any) => {
    setFile(event.target.files?.[0]);
  };

  const handleClick = () => {
    if (!file) {
      return;
    }
    uploadData({
      path: `picture-submissions/${file.name}`,
      data: file,
    });
    console.log(file);
  };

  const handlePerson = (e: ChangeEvent<HTMLInputElement>) => {
    setPerson(e.target.value);
  };
  const handleDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  const handleDate = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };
  // const handleReport = (e: ChangeEvent<HTMLInputElement>) => {
  //   setReport(e.target.value);
  // };

  const getPlacesData = async () => {
    try {
      const url =
        "https://u7wrupm2a5.execute-api.us-east-1.amazonaws.com/test/getData";
      const response: AxiosResponse = await axios.get(url);
      //console.log(response.data);

      return response.data;

      return null;
    } catch (error) {
      console.log(error);
    }
  };

  function handleData() {
    getPlacesData().then((array) => {
      setData(array);
      console.log(data);
    });

    //console.log(data);
  }

  useEffect(() => {
    handleData();
  }, []);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({
      person: person,
      description: description,
      date: date,
      report: file?.name,
      lat: lat,
      long: lng,
    });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  // const openInNewTab = (url: any) => {
  //   window.open(url, "_blank", "noreferrer");
  // };

  const onClick = useCallback((info: PickingInfo) => {
    setLng(Object.values(info)[8][0]);
    setLat(Object.values(info)[8][1]);
  }, []);

  let layer82 = new MVTLayer({
    id: "lateral",
    data: `https://a.tiles.mapbox.com/v4/hazensawyer.0t8hy4di/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiaGF6ZW5zYXd5ZXIiLCJhIjoiY2xmNGQ3MDgyMTE3YjQzcnE1djRpOGVtNiJ9.U06GItbSVWFTsvfg9WwQWQ`,

    minZoom: 0,
    maxZoom: 23,
    getLineColor: [169, 169, 169, 255],

    getFillColor: [140, 170, 180],
    getLineWidth: 1,

    lineWidthMinPixels: 1,
    pickable: true,
  });

  layers.push(layer82);

  let layer71 = new MVTLayer({
    id: "gravity-public-pipe",
    data: `https://a.tiles.mapbox.com/v4/hazensawyer.04mlahe9/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiaGF6ZW5zYXd5ZXIiLCJhIjoiY2xmNGQ3MDgyMTE3YjQzcnE1djRpOGVtNiJ9.U06GItbSVWFTsvfg9WwQWQ`,

    minZoom: 0,
    maxZoom: 23,
    getLineColor: [0, 163, 108, 255],
    getFillColor: [140, 170, 180],
    getLineWidth: (f) =>
      f.properties.DIAMETER < 7
        ? 1
        : f.properties.DIAMETER < 11
        ? 3
        : f.properties.DIAMETER < 17
        ? 5
        : f.properties.DIAMETER < 25
        ? 7
        : f.properties.DIAMETER < 31
        ? 9
        : 11,

    lineWidthMinPixels: 1,
    pickable: true,
  });

  layers.push(layer71);

  let layer101 = new MVTLayer({
    id: "gravity-private-pipe",
    data: `https://a.tiles.mapbox.com/v4/hazensawyer.dhp8w8ur/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiaGF6ZW5zYXd5ZXIiLCJhIjoiY2xmNGQ3MDgyMTE3YjQzcnE1djRpOGVtNiJ9.U06GItbSVWFTsvfg9WwQWQ`,

    minZoom: 0,
    maxZoom: 23,
    getLineColor: [0, 163, 108, 255],
    getFillColor: [140, 170, 180],
    getLineWidth: (f) =>
      f.properties.DIAMETER < 7
        ? 1
        : f.properties.DIAMETER < 11
        ? 3
        : f.properties.DIAMETER < 17
        ? 5
        : f.properties.DIAMETER < 25
        ? 7
        : f.properties.DIAMETER < 31
        ? 9
        : 11,

    lineWidthMinPixels: 1,
    pickable: true,
  });

  layers.push(layer101);

  let layer81 = new MVTLayer({
    id: "fmpipe",
    data: `https://a.tiles.mapbox.com/v4/hazensawyer.4hfx5po8/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiaGF6ZW5zYXd5ZXIiLCJhIjoiY2xmNGQ3MDgyMTE3YjQzcnE1djRpOGVtNiJ9.U06GItbSVWFTsvfg9WwQWQ`,

    minZoom: 0,
    maxZoom: 23,
    getLineColor: (f) =>
      f.properties.DIAMETER < 10
        ? [128, 0, 32, 255]
        : f.properties.DIAMETER < 20
        ? [233, 116, 81, 255]
        : [255, 195, 0, 255],
    getFillColor: [140, 170, 180],
    getLineWidth: (f) =>
      f.properties.DIAMETER < 7
        ? 1
        : f.properties.DIAMETER < 11
        ? 3
        : f.properties.DIAMETER < 17
        ? 4
        : f.properties.DIAMETER < 25
        ? 5
        : f.properties.DIAMETER < 31
        ? 6
        : 7,

    lineWidthMinPixels: 1,
    pickable: true,
  });

  layers.push(layer81);

  let layer75 = new MVTLayer({
    id: "mh",
    data: `https://a.tiles.mapbox.com/v4/hazensawyer.56zc2nx5/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiaGF6ZW5zYXd5ZXIiLCJhIjoiY2xmNGQ3MDgyMTE3YjQzcnE1djRpOGVtNiJ9.U06GItbSVWFTsvfg9WwQWQ`,
    minZoom: 15,
    maxZoom: 23,
    filled: true,
    getIconAngle: 0,
    getIconColor: [0, 0, 0, 255],
    getIconPixelOffset: [-2, 2],
    getIconSize: 3,
    // getText: (f) => f.properties.FACILITYID,
    getPointRadius: 2,
    getTextAlignmentBaseline: "center",
    getTextAnchor: "middle",
    getTextAngle: 0,
    getTextBackgroundColor: [0, 0, 0, 255],
    getTextBorderColor: [0, 0, 0, 255],
    getTextBorderWidth: 0,
    getTextColor: [0, 0, 0, 255],
    getTextPixelOffset: [-12, -12],
    getTextSize: 20,
    pointRadiusMinPixels: 2,

    // getPointRadius: (f) => (f.properties.PRESSURE < 45 ? 6 : 3),
    getFillColor: [255, 195, 0, 255],
    // Interactive props
    pickable: true,
    autoHighlight: true,
    // ...choice,
    // pointRadiusUnits: "pixels",
    pointType: "circle+text",
  });

  layers.push(layer75);

  let layer25 = new GeoJsonLayer({
    id: "datasource",
    data: data,
    filled: true,
    //pointType: "circle+text",
    pickable: true,
    pointType: "icon",
    iconAtlas:
      "https://mylibraryforuse.s3.amazonaws.com/logo/icons8-marker-100.png",
    iconMapping: {
      marker: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        anchorY: 50,
        anchorX: 50,
        mask: false,
      },
    },
    getIcon: () => "marker",
    getIconSize: 5,
    getIconColor: [112, 128, 144, 200],
    getIconAngle: 0,
    iconSizeUnits: "meters",
    iconSizeScale: 5,
    iconSizeMinPixels: 6,
  });

  layers.push(layer25);

  return (
    <main>
      <h1>Washington Park Project Complaint Data</h1>

      <Divider orientation="horizontal" />
      <br />
      <Flex>
        <Button onClick={signOut} width={120}>
          Sign out
        </Button>
        <Button onClick={createTodo} backgroundColor={"azure"} color={"red"}>
          + new
        </Button>
        <Button
          role="link"
          // onClick={() =>
          //   openInNewTab("https://showdata.d34q2tdncqr0gx.amplifyapp.com/")
          // }
          onClick={() => getPlacesData()}
        >
          Refresh Data
        </Button>
      </Flex>
      <br />
      <Flex direction="row">
        <input
          type="text"
          value={person}
          placeholder="person"
          onChange={handlePerson}
          width="250%"
        />
        <input
          type="text"
          value={description}
          placeholder="description"
          onChange={handleDescription}
          width="150%"
        />

        <input
          type="date"
          value={date}
          placeholder="date"
          onChange={handleDate}
          width="150%"
        />
        <input type="number" value={lat} width="150%" />
        <input type="number" value={lng} width="150%" />
        <input type="file" onChange={handleChange} />
        <Button onClick={handleClick}>Upload</Button>
      </Flex>
      <ScrollView
        as="div"
        ariaLabel="View example"
        backgroundColor="var(--amplify-colors-white)"
        borderRadius="6px"
        //border="1px solid var(--amplify-colors-black)"
        // boxShadow="3px 3px 5px 6px var(--amplify-colors-neutral-60)"
        color="var(--amplify-colors-blue-60)"
        // height="45rem"
        // maxWidth="100%"
        padding="1rem"
        // width="100%"
        width="2400px"
        height={"2400px"}
        maxHeight={"2400px"}
        maxWidth="2400px"
      >
        <ThemeProvider theme={theme} colorMode="light">
          <Table caption="" highlightOnHover={false}>
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Description</TableCell>
                <TableCell as="th">Date</TableCell>
                <TableCell as="th">Report</TableCell>
                <TableCell as="th">Latitude</TableCell>
                <TableCell as="th">Longitude</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todos.map((todo) => (
                <TableRow onClick={() => deleteTodo(todo.id)} key={todo.id}>
                  <TableCell>{todo.person}</TableCell>
                  <TableCell>{todo.description}</TableCell>
                  <TableCell>{todo.date}</TableCell>
                  <TableCell>{todo.report}</TableCell>
                  <TableCell>{todo.lat}</TableCell>
                  <TableCell>{todo.long}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ThemeProvider>
      </ScrollView>
      <ScrollView>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller
          layers={layers}
          onClick={onClick}
          onViewStateChange={({ viewState }) => setViewport(viewState)}
          style={{
            height: "100%",
            width: "100%",
            top: "90%",
          }}
        >
          <MapView
            {...viewport}
            initialViewState={INITIAL_VIEW_STATE}
            style={{
              //position: "absolute",
              zIndex: -1,
              height: "200%",
              width: "100%",
            }}
          >
            <Marker latitude={lat} longitude={lng} />
            <NavigationControl />
            <GeolocateControl />
            <ScaleControl />
          </MapView>
        </DeckGL>
      </ScrollView>
    </main>
  );
}

export default App;
