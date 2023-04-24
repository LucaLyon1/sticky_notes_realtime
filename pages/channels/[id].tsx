import { supabase, useStore } from "@/lib/store"
import { Note } from "@/types"
import { useRouter } from "next/router"
import { useState } from "react"

const channelPage = () => {
    const [newNote, setNewNote] = useState<Note | null>(null)
    const router = useRouter()
    const { id } = router.query
    const { notes, channels } = useStore({ channelId: id ? +id : 1 })


    const addNote = () => {
        setNewNote({
            title: 'Title of your sticky note !',
            text: 'Description of your sticky note !',
            channel_id: id ? +id : 1,
        } as Note)
    }
    const handleTitle = (e: React.FormEvent<HTMLInputElement>) => {
        if (newNote?.title && newNote.text) {
            setNewNote({ ...newNote, title: e.currentTarget.value })
        }
    }
    const handleText = (e: React.FormEvent<HTMLInputElement>) => {
        if (newNote?.title && newNote.text) {
            setNewNote({ ...newNote, text: e.currentTarget.value })
        }
    }
    const postNote = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        await supabase.from('Notes').insert(newNote)
    }
    return (
        <div className="flex h-screen">
            <div className="m-auto text-center">
                {notes?.map((note) => {
                    return <div className="bg-blue-400 p-4 rounded-md text-white my-2">
                        <h2>{note.title}</h2>
                        <p>{note.text}</p>
                        <p>{note.created_at && new Date(note.created_at).toLocaleDateString('en-GB')}</p>
                    </div>
                })}
                {newNote &&
                    <form className="bg-blue-400 p-4 rounded-md my-2">
                        <input className="border-2 border-blue-400 p-2 my-1 rounded-md" type="text" value={newNote.title} onChange={handleTitle} /><br />
                        <input className="border-2 border-blue-400 p-2 my-1 rounded-md" type="text" value={newNote.text} onChange={handleText} /><br />
                        <input className="text-white p-2 bg-blue-300 cursor-pointer rounded-md hover:bg-blue-200" type="submit" value="Add note" onClick={postNote} />
                    </form>
                }
                <button className="bg-blue-400 p-2 text-white rounded-md" onClick={addNote}>add note</button>
            </div>
        </div>
    )
}

export default channelPage