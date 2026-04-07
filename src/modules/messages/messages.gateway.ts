import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId -> socketId
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token);
      const userId: string = payload.sub;
      client.data.userId = userId;
      this.connectedUsers.set(userId, client.id);
      client.join(`user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId: string = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string },
  ) {
    const senderId: string = client.data.userId;
    if (!senderId || !data.receiverId || !data.content?.trim()) return;

    try {
      const message = await this.messagesService.sendMessage(
        senderId,
        data.receiverId,
        data.content.trim(),
      );

      // Emit to sender
      client.emit('new_message', message);

      // Emit to receiver if online
      this.server.to(`user:${data.receiverId}`).emit('new_message', message);
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }
}
