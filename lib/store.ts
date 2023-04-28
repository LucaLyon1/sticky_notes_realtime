import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { Channel, Note } from "@/types";

export const supabase = createBrowserSupabaseClient()

export const useStore = (props: { channelId: number }): { notes: Note[] | null, channels: Channel[] | null } => {
  const [channels, setChannels] = useState<Channel[] | null>([])
  const [notes, setNotes] = useState<Note[] | null>([])
  const [users] = useState(new Map)
  const [newNote, handleNewNote] = useState<Note | null>(null)
  const [movedNote, handleMovedNote] = useState<Note | null>(null)
  const [newChannel, handleNewChannel] = useState<Channel | null>(null)
  const [newOrUpdatedUser, handleNewOrUpdatedUser] = useState(null)
  const [deletedChannel, handleDeletedChannel] = useState<Channel | null>(null)
  const [deletedNote, handleDeletedNote] = useState<Note | null>(null)

  useEffect(() => {
    // Fetch all existing channels
    fetchChannels(setChannels)
    //Set up listener for new and deleted notes
    const noteListener = supabase.channel('public:notes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Notes'
      }, (payload) => handleNewNote(payload.new as Note))
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Notes'
      }, (payload) => handleMovedNote(payload.new as Note))
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'Notes',
      }, (payload) => handleDeletedNote(payload.old as Note))
      .subscribe()

    // Listen for new and deleted channels
    const channelListener = supabase
      .channel('public:channels')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'channels' },
        (payload) => handleNewChannel(payload.new as Channel)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'channels' },
        (payload) => handleDeletedChannel(payload.old as Channel)
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
      fetchNotes(props.channelId, (notes: Note[]) => {
        setNotes(notes)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.channelId])

  //New note
  useEffect(() => {
    if (newNote && newNote.channel_id === Number(props.channelId)) {
      const handleAsync = async () => {
        if (notes) setNotes(notes.concat(newNote))
      }
      handleAsync()
    }
  }, [newNote])
  //Move note
  useEffect(() => {
    console.log('moved !')
    if (movedNote && movedNote.channel_id === Number(props.channelId)) {
      const handleAsync = async () => {
        if (notes) {
          const index = notes.findIndex((note) => note.id === movedNote.id)
          let newNotes = [...notes]
          newNotes[index] = movedNote
          console.log(notes)
          console.log(newNotes)
          setNotes(newNotes)
        }
      }
      handleAsync()
    }
  }, [movedNote])

  // Deleted channel received from postgres
  useEffect(() => {
    if (deletedChannel && channels) setChannels(channels.filter((channel) => channel.id !== deletedChannel.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedChannel])

  //Deleted note
  useEffect(() => {
    if (deletedNote && notes) setNotes(notes.filter((note) => note.id !== deletedNote.id))
  }, [deletedNote])

  return {
    // We can export computed values here to map the authors to each message
    notes: notes !== null ? notes : [],
    channels: channels !== null ? channels : [],
  }
}

export const fetchChannels = async (setState: Function) => {
  try {
    let { data } = await supabase.from('channels').select('*')
    if (setState) setState(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

export const fetchNotes = async (channelId: number, setState: Function) => {
  try {
    let { data } = await supabase.from('Notes').select('*').eq('channel_id', channelId)
    if (setState) setState(data)
  } catch (error) {
    console.log('error', error)
  }
}