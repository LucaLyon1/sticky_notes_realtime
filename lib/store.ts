import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { Note } from "@/types";

export const supabase = createBrowserSupabaseClient()

export const useStore = (props: { channelId: number }) => {
    const [channels, setChannels] = useState([])
    const [notes, setNotes] = useState([])
    const [users] = useState(new Map)
    const [newNote, handleNewNote] = useState<Note | null>(null)
    const [newChannel, handleNewChannel] = useState(null)
    const [newOrUpdatedUser, handleNewOrUpdatedUser] = useState(null)
    const [deletedChannel, handleDeletedChannel] = useState(null)
    const [deletedNote, handleDeletedNote] = useState<Note | null>(null)

    useEffect(() => {
        // Fetch all existing channels
        fetchChannels(setChannels)
        //Set up listener for new and deleted notes
        const noteListener = supabase.channel('public:notes')
        .on('postgres_changes', {
            event:'INSERT',
            schema:'public',
            table:'Notes'
        }, (payload) => handleNewNote(payload.new as Note))
        .on('postgres_changes', {
            event:'DELETE',
            schema:'public',
            table:'Notes',
        }, (payload) => handleDeletedNote(payload.old as Note))
        .subscribe()

        // Listen for new and deleted channels
        const channelListener = supabase
        .channel('public:channels')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'channels' },
          (payload) => handleNewChannel(payload.new)
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'channels' },
          (payload) => handleDeletedChannel(payload.old)
        )
        .subscribe()
        // Cleanup on unmount
        return () => {
          supabase.removeChannel(noteListener)
          supabase.removeChannel(channelListener)
        }
    }, [])

    // Update when the route changes
    useEffect(() => {
      if (props?.channelId > 0) {
        fetchNotes(props.channelId, (messages) => {
          messages.forEach((x) => users.set(x.user_id, x.author))
          setMessages(messages)
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.channelId])
}

export const fetchChannels = async (setState: Function) => {
    try {
        let { data } = await supabase.from('channels').select('*')
        if(setState) setState(data)
        return data
    } catch(error) {
        console.log('error', error)
    }
}

export const fetchNotes = async (channelId: number, setState: Function) => {
    try {
        let { data } = await supabase.from('Notes').select('*')
    } catch(error) {
        console.log('error', error)
    }
}