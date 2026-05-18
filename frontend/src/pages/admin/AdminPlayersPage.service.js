import { adminService } from '../../services/admin.service';

export const fetchPlayers  = ()           => adminService.getPlayers();
export const setPlayerStatus = (id, status) => adminService.setStatus(id, status);
