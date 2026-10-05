import './App.css'
import {Editor} from "@monaco-editor/react"
import {MonacoBinding} from "y-monaco"
import { useRef,useMemo,useState } from 'react'
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function App() {

  const editorRef = useRef(null)
  const [userName , setUserName ] = useState("")

  const ydoc = useMemo(() => new Y.Doc(), [])
  const ytext = useMemo(() => ydoc.getText('monaco'), [ydoc])
  

  const handleMount = (editor) => {
    editorRef.current = editor
    const provider = new SocketIOProvider('http://localhost:3000', "monaco", ydoc, {
      autoConnect:true
    })
    const monoBinding = new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )
  }

  if(!userName){
    <main className='h-screen bg-gray-950 w-full p-4 flex gap-5 items-center justify-center'>
      <div className='flex flxe-col gap-4'>
        <input type="text" placeholder='' />

      </div>
    </main>
  }

  return (
    <main className='h-screen bg-gray-950 w-full p-4 flex gap-5'>
      <aside className="bg-amber-50 w-1/4 rounded-2xl"></aside>
      <section className='bg-neutral-800 w-3/4 rounded-2xl overflow-hidden  '>
        <Editor
        height="100%"
        defaultLanguage='javascript'
        defaultValue='// Some content'
        theme='vs-dark'
        onMount={handleMount}
        />
      </section>
    </main>
  )
}

export default App
