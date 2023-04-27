import { Note } from "@/types"
import { supabase, useStore } from "@/lib/store"
import { useEffect, useState } from "react"


const Task = ({ note, channelId }: { note: Note, channelId: Number }) => {
    const { notes, channels } = useStore({ channelId: channelId ? +channelId : 1 })
    const [dragging, setDragging] = useState(false)
    const [oldX, setOldX] = useState(0)
    const [oldY, setOldY] = useState(0)
    const [xpos, setXpos] = useState(0)
    const [ypos, setYpos] = useState(0)
    const task = document.getElementById(String(note.id))


    const deleteChannel = async () => {
        await supabase.from('channels').delete().eq('id', channelId)
    }

    const getInitialPos = (e: React.MouseEvent) => {
        setXpos(e.clientX)
        setYpos(e.clientY)
        setDragging(true)
        console.log(oldX)
    }
    const handleMove = (e: React.MouseEvent) => {
        e.preventDefault()
        if (dragging) {
            if (task) {
                task.style.left = Math.min(oldX + (e.clientX - xpos), window.innerWidth) + 'px'
                task.style.top = Math.min(oldY + (e.clientY - ypos), window.innerHeight) + 'px'
            }
        }
    }
    const releasePos = (e: React.MouseEvent) => {
        setDragging(false)
        setOldX(oldX + e.clientX - xpos)
        setOldY(oldY + e.clientY - ypos)
        updatePosition(oldX + e.clientX - xpos, oldY + e.clientY - ypos)
    }
    const updatePosition = async (x: number, y: number) => {
        await supabase.from('Notes').update({ pos_x: x, pos_y: y }).eq('id', note.id)
    }

    const deleteNote = async (id: bigint) => {

        await supabase.from('Notes').delete().eq('id', id)
        const res = await supabase.from('Notes').select('*', { count: 'exact' }).eq('channel_id', channelId)
        if (res.count === 0) {
            deleteChannel()
        }
    }

    return (
        <div id={String(note.id)} onMouseDown={getInitialPos} onMouseMove={handleMove} onMouseUp={releasePos} className='bg-blue-400 p-4 rounded-md text-white my-2 absolute'>
            <p onClick={() => deleteNote(note.id)} className="float-left cursor-pointer">Delete</p>
            <h2>{note.title}</h2>
            <p>{note.text}</p>
            <p>{note.created_at && new Date(note.created_at).toLocaleDateString('en-GB')}</p>
        </div>
    )
}

export default Task