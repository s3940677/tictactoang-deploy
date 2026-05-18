import { socketService } from '../../services/socket.service';

export const getSocket      = ()                          => socketService.getSocket();
export const connectSocket  = (token)                     => socketService.connect(token);
export const disconnectSocket = ()                        => socketService.disconnect();
export const emitGetRooms   = ()                          => socketService.getSocket()?.emit('getRooms');
export const emitCreateRoom = (opts)                      => socketService.getSocket()?.emit('createRoom', opts);
export const emitJoinRoom   = (gameId)                    => socketService.getSocket()?.emit('joinRoom', { gameId });
export const emitMakeMove   = (gameId, row, col)          => socketService.getSocket()?.emit('makeMove', { gameId, row, col });
export const emitLeaveRoom    = (gameId)                    => socketService.getSocket()?.emit('leaveRoom', { gameId });
export const emitSelectMarker = (gameId, marker)           => socketService.getSocket()?.emit('selectMarker', { gameId, marker });
