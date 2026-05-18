import { gameService } from '../../services/game.service';

export const fetchReplay = (id) => gameService.getReplay(id);
