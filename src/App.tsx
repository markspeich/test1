import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import TodoCreateForm from './ui-components/TodoCreateForm';
import { TodoCreateFormInputValues } from "./ui-components/TodoCreateForm";
import { uploadData } from 'aws-amplify/storage'

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [echo, setEcho] = useState<String | null | undefined>('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  function onSubmit(fields: TodoCreateFormInputValues): TodoCreateFormInputValues {
    handleSubmit(fields)
    return fields
  }

  async function handleSubmit(fields: TodoCreateFormInputValues) {
    const { errors, data: newTodo } = await client.models.Todo.create({ content: fields.content, isDone: fields.isDone, dueDate: fields.dueDate })
    if (errors) {
      console.error(errors)
    }
  }

  // onClick handler for the "Query" button which will run the echo query
  async function handleQuery() {
    const { data, errors } = await client.queries.echo({ content: "echo" })
    if (errors) {
      console.error(errors)
    } else {
      let t: React.SetStateAction<String>
      setEcho(data?.content)
    }
  }

  const handleChange = (event: any) => {
    setFile(event.target.files[0]);
  }

  const handleUpload = () => {
    if (file === null) return
    uploadData({
      path: `picture-submissions/${file?.name}`,
      data: file,
    })
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <h1>My todos</h1>
          <button onClick={handleQuery}>Query</button>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li onClick={() => deleteTodo(todo.id)} key={todo.id}>{todo.content}, Done: {todo.isDone ? "Yes" : "No"}</li>
            ))}
          </ul>
          <TodoCreateForm onSubmit={onSubmit} />
          <div>
            <input type="file" onChange={handleChange} />
            <button
              onClick={handleUpload}
            >
              Upload
            </button>
          </div>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review next step of this tutorial.
            </a>
          </div>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
