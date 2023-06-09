import { supabase, useStore } from "@/lib/store"
import { Note } from "@/types"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Task from "@/components/Task"

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
    }, [notes])

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
        console.log(newNote)
        await supabase.from('Notes').insert(newNote)
    }

    const postFirstNote = async () => {
        await supabase.from('Notes').insert({
            title: `First sticky note of channel ${channelId}`,
            text: 'Create as much sticky note as you want here 📝',
            channel_id: channelId ? +channelId : 1,
        })
    }

    // redirect to public channel when current channel is deleted
    useEffect(() => {
        if (id && channels && channels?.length !== 0) if (!channels.some((channel) => channel.id as any === +id)) {
            router.push('/channels/1')
        }
    }, [channels, id])

    return (
        <div className="flex h-screen w-screen">
            {notes?.map((note, i) => {
                return <Task note={note} channelId={channelId ? +channelId : 1} key={i}></Task>
            })}
            <div className="absolute right-8 bottom-8">
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