import { useStore } from "@/lib/store"
import { Note, Channel } from "@/types"
import { useState } from "react";

export default function Home() {
  const [channel, setChannel] = useState('')

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setChannel(e.currentTarget.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(channel);
  }
  return (
    <main>
      <div className="flex h-screen">
        <div className="w-1/3 m-auto text-center align-middle bg-slate-300 py-24 rounded-lg">
          <p className="mb-8">What channel do you want to go to ?</p>
          <form onSubmit={handleSubmit}>
            <input className="border-blue-400 border-2" type="number" name="channel" id="channel" value={channel} onChange={handleChange} />
            <br />
            <button className="bg-blue-400 rounded-md text-white p-2 mt-4 hover:bg-blue-300">Go to the channel</button>
          </form>
        </div>
      </div>
    </main>
  )
}
