import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco"; //yjs connect to monaco
import { useRef, useMemo, useState, useEffect } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);
  const [userName, setUserName] = useState(() => {
    return new URLSearchParams(window.location.search).get("userName") || "";
  });

  const [users, setUsers] = useState([]);

  const ydoc = useMemo(() => new Y.Doc(), []);

  // provide the data of single file
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;

    new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    );
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setUserName(e.target.userName.value);
    window.history.pushState({}, "", "?userName=" + e.target.userName.value);
  };

  useEffect(() => {
    console.log(userName);
    if (userName) {
      const provider = new SocketIOProvider(
        "http://localhost:3000",
        "monaco",
        ydoc,
        {
          autoConnect: true,
        },
      );

      provider.awareness.setLocalStateField("user", {
        userName,
      });

      const syncUsers = () => {
        const states = Array.from(provider.awareness.getStates().values());
        setUsers(
          states
            .filter((state) => state.user && state.user.userName)
            .map((state) => state.user),
        );
      };

      provider.awareness.on("change", syncUsers);
      syncUsers();

      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null);
      }
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        provider.disconnect();
        provider.awareness.off("change", syncUsers);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [userName, ydoc]);

  if (!userName) {
    return (
      <main className="h-screen bg-gray-950 w-full p-4 flex gap-5 items-center justify-center">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your name"
            className="p-2 rounded-lg bg-grey-800 text-white"
            name="userName"
          />
          <button className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold">
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen bg-gray-950 w-full p-4 flex gap-5">
      <aside className="bg-amber-50 w-1/4 rounded-2xl">
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">
          Users
        </h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
              {user.userName}
            </li>
          ))}
        </ul>
      </aside>
      <section className="bg-neutral-800 w-3/4 rounded-2xl overflow-hidden  ">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Some content"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;
