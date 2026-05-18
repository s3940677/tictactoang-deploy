import { socketService } from '../../services/socket.service';

export const getSocket      = ()                  => socketService.getSocket();
export const emitMessage    = (gameId, text)      => socketService.getSocket()?.emit('sendMessage', { gameId, text });
export const onMessage      = (handler)           => socketService.getSocket()?.on('receiveMessage', handler);
export const offMessage     = (handler)           => socketService.getSocket()?.off('receiveMessage', handler);
