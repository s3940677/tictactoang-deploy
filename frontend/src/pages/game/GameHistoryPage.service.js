import { gameService } from '../../services/game.service';

export const fetchHistory = (params) => gameService.getHistory(params);
