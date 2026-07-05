// Ukumiswa kwe-backend: lapho i-REST ne-WebSocket kutholakala khona (backend
// endpoint configuration -- overridable via Vite env vars for deployment).
export const IPHOTHI_YANGEMUVA = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
export const URL_YE_WEBSOCKET = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";
