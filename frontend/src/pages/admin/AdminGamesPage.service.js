import { adminService } from '../../services/admin.service';

export const fetchGames   = ()       => adminService.getGames();
export const searchGames  = (query)  => adminService.searchGames(query);
export const closeGame    = (id)     => adminService.closeGame(id);
