import { http } from './http.helper';
import { GAME_API } from '../config/api.config';

export const gameService = {
  create:  (data)     => http.post(GAME_API.create, data),
  getGame: (id)       => http.get(GAME_API.get(id)),
  makeMove:(id, row, col) => http.post(GAME_API.move(id), { row, col }),
  abort:   (id)       => http.post(GAME_API.abort(id), {}),
  getReplay: (id)     => http.get(GAME_API.replay(id)),
  getHistory: (params) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v)).toString();
    return http.get(`${GAME_API.history}${qs ? '?' + qs : ''}`);
  },
};
