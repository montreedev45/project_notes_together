import api from "./api.js";

export const getNote = (roomId)=> api.get(`/notes/${roomId}`)
export const saveNote = (roomId, content)=> api.put(`/notes/${roomId}`, content)