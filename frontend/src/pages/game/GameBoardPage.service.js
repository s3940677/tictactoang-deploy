import { gameService } from '../../services/game.service';

export const fetchGame    = (id)           => gameService.getGame(id);
export const sendMove     = (id, row, col) => gameService.makeMove(id, row, col);
export const abortGame    = (id)           => gameService.abort(id);
export const createGame   = (data)         => gameService.create(data);
