import { useEffect, useState, ChangeEvent } from "react";
import type { Schema } from "../amplify/data/resource";
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

} from "@aws-amplify/ui-react";


const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

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
      location:{
        lat: latitude,
      long: longitude}
   });
  }

    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <main>
      <h1>Washington Park Project Complaint Data</h1>
          <Flex direction="row">
            <input
              type="text"
              value={person}
              placeholder="person"
              onChange={handlePerson}
            />
            <input
              type="text"
              value={description}
              placeholder="description"
              onChange={handleDescription}
            />

            <input
              type="text"
              value={report}
              placeholder="report"
              onChange={handleReport}
            />
            <input
              type="date"
              value={date}
              placeholder="date"
              onChange={handleDate}
            />
            <input type="number" value={latitude} onChange={handleLatitude} />
            <input type="number" value={longitude} onChange={handleLongitude} />
            <Button onClick={createTodo}>+ new</Button>
            </Flex>
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
              <TableCell>{todo.location?.lat}</TableCell>
              <TableCell>{todo.location?.long}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
{/*       <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
            {todo.person}
            {todo.description}
            {todo.date}
            {todo.report}
            {todo.location?.lat}
            {todo.location?.long}

          </li>
        ))}
      </ul> */}
     
    </main>
  );
}

export default App;
