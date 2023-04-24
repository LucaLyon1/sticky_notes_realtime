export interface Note {
    id?: bigint,
    created_at?: string,
    title: string,
    text: string,
    uid?: string,
    channel_id: number,
}

export interface Channel {
    id: bigint,
    created_at: string,
}