import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getPlayers = (params = {}) => api.get("/players", { params }).then((r) => r.data);
export const getRoles = (params = {}) => api.get("/roles", { params }).then((r) => r.data);
export const compare = (player1, player2, role) =>
  api.get("/compare", { params: { player1, player2, role } }).then((r) => r.data);

export default api;
