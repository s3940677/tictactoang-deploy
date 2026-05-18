import { http } from './http.helper';
import { ADMIN_API } from '../config/api.config';

export const adminService = {
  getPlayers:   ()            => http.get(ADMIN_API.players),
  setStatus:    (id, status)  => http.patch(ADMIN_API.status(id), { status }),
  getGames:     ()            => http.get(ADMIN_API.games),
  searchGames:  (query)       => http.get(`${ADMIN_API.gameSearch}?query=${encodeURIComponent(query)}`),
  closeGame:    (id)          => http.post(ADMIN_API.closeGame(id), {}),
};
