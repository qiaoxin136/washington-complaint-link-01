import { useEffect, useState, ChangeEvent } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
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
  View,
  ThemeProvider,
  Theme, 
  Divider
} from "@aws-amplify/ui-react";

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


function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { signOut } = useAuthenticator();
  const [person, setPerson] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [report, setReport] = useState("");
  const [latitude, setLatitude] = useState(39.5);
  const [longitude, setLongitude] = useState(-78.5);

  const handlePerson = (e: ChangeEvent<HTMLInputElement>) => {
    setPerson(e.target.value);
  };
  const handleDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  const handleDate = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };
  const handleReport = (e: ChangeEvent<HTMLInputElement>) => {
    setReport(e.target.value);
  };
  const handleLatitude = (e: ChangeEvent<HTMLInputElement>) => {
    setLatitude(parseFloat(e.target.value));
  };
  const handleLongitude = (e: ChangeEvent<HTMLInputElement>) => {
    setLongitude(parseFloat(e.target.value));
  };

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
      report: report,
      lat: latitude,
      long: longitude,
    });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main>
      <h1>Washington Park Project Complaint Data</h1>

      
      <Divider orientation="horizontal" />
      < br/>
      <Flex>
        <Button onClick={signOut} width={120}>
          Sign out
        </Button>
        <Button onClick={createTodo} backgroundColor={"azure"}color={"red"}>+ new</Button>
      </Flex>
      < br/>
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
          type="text"
          value={report}
          placeholder="report"
          onChange={handleReport}
          width="150%"
        />
        <input
          type="date"
          value={date}
          placeholder="date"
          onChange={handleDate}
          width="150%"
        />
        <input type="number" value={latitude} onChange={handleLatitude} width="150%"/>
        <input type="number" value={longitude} onChange={handleLongitude} width="150%"/>
      </Flex>     
      <View
          as="div"
          ariaLabel="View example"
          backgroundColor="var(--amplify-colors-white)"
          borderRadius="6px"
          //border="1px solid var(--amplify-colors-black)"
          // boxShadow="3px 3px 5px 6px var(--amplify-colors-neutral-60)"
          color="var(--amplify-colors-blue-60)"
          height="45rem"
          // maxWidth="100%"
          padding="1rem"
          width="100%"
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
      </View>
     
    </main>
  );
}

export default App;
