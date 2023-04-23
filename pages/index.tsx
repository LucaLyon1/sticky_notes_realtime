import { useStore } from "@/lib/store"
import { Note, Channel } from "@/types"

export default function Home() {
  const {notes, channels} = useStore({channelId:1})

  return (
    <main>
      {JSON.stringify(notes)}
    </main>
  )
}
