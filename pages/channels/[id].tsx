import { supabase, useStore } from "@/lib/store"
import { Note } from "@/types"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const channelPage = () => {
    const [newNote, setNewNote] = useState<Note | null>(null)
    const router = useRouter()
    const { id } = router.query
    const channelId = id
    const { notes, channels } = useStore({ channelId: channelId ? +channelId : 1 })

    useEffect(() => {
        const check_channels = async () => {
            const res = await supabase.from('channels').select('id').eq('id', channelId)
            if (res.data?.length === 0) {
                await supabase.from('channels').insert({ id: channelId })
                await postFirstNote()
            }
        }
        if (channelId) check_channels()
    })

    const addNote = () => {
        setNewNote({
            title: 'Title of your sticky note !',
            text: 'Description of your sticky note !',
            channel_id: channelId ? +channelId : 1,
        } as Note)
    }

    const handleTitle = (e: React.FormEvent<HTMLInputElement>) => {
        if (newNote) {
            setNewNote({ ...newNote, title: e.currentTarget.value })
        }
    }

    const handleText = (e: React.FormEvent<HTMLInputElement>) => {
        if (newNote) {
            setNewNote({ ...newNote, text: e.currentTarget.value })
        }
    }

    const postNote = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        await supabase.from('Notes').insert(newNote)
    }

    const postFirstNote = async () => {
        await supabase.from('Notes').insert({
            title: `First sticky note of channel ${channelId}`,
            text: 'Create as much sticky note as you want here 📝',
            channel_id: channelId ? +channelId : 1,
        })
    }

    const deleteChannel = async () => {
        await supabase.from('channels').delete().eq('id', channelId)
    }

    const deleteNote = async (id: bigint) => {
        await supabase.from('Notes').delete().eq('id', id)
        const res = await supabase.from('Notes').select('*', { count: 'exact' }).eq('channel_id', channelId)
        console.log(res)
        if (res.count === 0) {
            deleteChannel()
        }
    }

    // redirect to public channel when current channel is deleted
    useEffect(() => {
        if (id && channels && channels?.length !== 0) if (!channels.some((channel) => channel.id as any === +id)) {
            router.push('/channels/1')
        }
    }, [channels, id])

    return (
        <div className="flex h-screen">
            <div className="m-auto text-center">
                {notes?.map((note, i) => {
                    return <div className="bg-blue-400 p-4 rounded-md text-white my-2" key={i}>
                        <p onClick={() => deleteNote(note.id)} className="float-left cursor-pointer absolute">Delete</p>
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