import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

type Note = {
  id: string
  subject: string
  content: string
}

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')

  const fetchNotes = async () => {
    const res = await axios.get('http://localhost:3001/get-notes')
    setNotes(res.data)
  }

  const addNote = async () => {
    if (!subject.trim() || !content.trim()) return alert('Empty notes? Really?')
    await axios.post('http://localhost:3001/add-note', {
      subject,
      content,
    })
    setSubject('')
    setContent('')
    fetchNotes()
  }

  const deleteNote = async (id: string) => {
    await axios.delete('http://localhost:3001/delete-note', {
      data: { id },
    })
    fetchNotes()
  }

  const editNote = async (note: Note) => {
    const newSubject = prompt('Edit subject:', note.subject)
    const newContent = prompt('Edit content:', note.content)

    if (!newSubject || !newContent) return

    await axios.post('http://localhost:3001/edit-note', {
      id: note.id,
      subject: newSubject,
      content: newContent,
    })

    fetchNotes()
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  return (
    <div className="app">
      <h1>📝 Discord Notes</h1>

      <div className="note-input">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          placeholder="Write your thoughts here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={addNote}>Add Note</button>
      </div>

      <div className="notes-grid">
        {notes.map((note) => (
          <div className="note-card" key={note.id}>
            <h3>{note.subject}</h3>
            <p>{note.content}</p>
            <div className="actions">
              <button onClick={() => editNote(note)}>Edit</button>
              <button className="danger" onClick={() => deleteNote(note.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
