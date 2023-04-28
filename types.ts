export interface Note {
    id: bigint,
    created_at?: string,
    title: string,
    text: string,
    uid?: string,
    channel_id: number,
    pos_x: number,
    pos_y: number
}

export interface Channel {
    id: bigint,
    created_at: string,
}