import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';
import { NextApiRequest, NextApiResponse } from 'next';

type NextApiResponseWithSocket = NextApiResponse & {
    socket: NetSocket & {
        server: HTTPServer & {
            io?: IOServer;
        };
    };
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (res.socket.server.io) {
        res.end();
        return;
    }
    const io = new IOServer(res.socket.server, {
        path: '/api/socket',
    });
    res.socket.server.io = io;

    const rooms: Record<string, { players: string[]; choices: Record<string, string> }> = {};

    io.on('connection', socket => {

        socket.on('joinRoom', ({ roomId }) => {
            rooms[roomId] = rooms[roomId] || { players: [], choices: {} };

            if (rooms[roomId].players.length >= 2) {
                socket.emit('roomFull');
                return;
            }

            socket.join(roomId);
            rooms[roomId].players.push(socket.id);
            io.to(roomId).emit('playerJoined', rooms[roomId].players.length);
        });

        socket.on('makeChoice', ({ roomId, choice }) => {
            const room = rooms[roomId];
            if (!room) return;
            room.choices[socket.id] = choice;

            if (Object.keys(room.choices).length === 2) {
                const [p1, p2] = room.players;
                io.to(roomId).emit('roundResult', {
                    p1: { id: p1, choice: room.choices[p1] },
                    p2: { id: p2, choice: room.choices[p2] },
                });
                room.choices = {};
            }
        });

        socket.on('disconnect', () => {
            for (const roomId in rooms) {
                rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
                delete rooms[roomId].choices[socket.id];
            }
        });
    });

    res.end();
}
