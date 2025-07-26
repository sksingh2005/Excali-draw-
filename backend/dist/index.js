"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173", // React app URL
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Store room data
const rooms = new Map();
const userNames = [
    'Artist', 'Painter', 'Creator', 'Designer', 'Sketcher', 'Drawer', 'Crafter',
    'Maker', 'Builder', 'Genius', 'Master', 'Expert', 'Pro', 'Star', 'Hero'
];
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
function generateUserName() {
    const adjectives = ['Creative', 'Artistic', 'Talented', 'Skilled', 'Amazing', 'Cool', 'Smart', 'Quick'];
    const name = userNames[Math.floor(Math.random() * userNames.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    return `${adjective} ${name}`;
}
// Create new room
app.post('/api/rooms', (req, res) => {
    const roomId = generateRoomId();
    const newRoom = {
        id: roomId,
        paths: [],
        shapes: [],
        users: new Map(),
        createdAt: new Date()
    };
    rooms.set(roomId, newRoom);
    res.json({ roomId });
});
// Get room data
app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
    }
    res.json({
        roomId,
        paths: room.paths,
        shapes: room.shapes,
        userCount: room.users.size
    });
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-room', (roomId) => {
        const room = rooms.get(roomId);
        if (!room) {
            socket.emit('room-error', 'Room not found');
            return;
        }
        socket.join(roomId);
        socket.roomId = roomId;
        // Generate user info
        const userName = generateUserName();
        const userColor = colors[Math.floor(Math.random() * colors.length)];
        const userInfo = {
            id: socket.id,
            name: userName,
            color: userColor,
            cursor: null
        };
        room.users.set(socket.id, userInfo);
        socket.userInfo = userInfo;
        // Send current room state to the new user
        socket.emit('room-joined', {
            roomId,
            userInfo,
            paths: room.paths,
            shapes: room.shapes
        });
        // Notify others about new user
        socket.to(roomId).emit('user-joined', userInfo);
        // Send current users list
        const users = Array.from(room.users.values());
        io.to(roomId).emit('users-update', users);
        console.log(`User ${userName} joined room ${roomId}`);
    });
    socket.on('drawing-update', (data) => {
        var _a, _b, _c;
        if (!socket.roomId)
            return;
        const room = rooms.get(socket.roomId);
        if (!room)
            return;
        // Update room data
        if (data.type === 'path-add' && data.path) {
            room.paths.push(data.path);
        }
        else if (data.type === 'shape-add' && data.shape) {
            room.shapes.push(data.shape);
        }
        else if (data.type === 'clear') {
            room.paths = [];
            room.shapes = [];
        }
        else if (data.type === 'delete-elements') {
            if (data.pathIds) {
                room.paths = room.paths.filter(p => !data.pathIds.includes(p.id));
            }
            if (data.shapeIds) {
                room.shapes = room.shapes.filter(s => !data.shapeIds.includes(s.id));
            }
        }
        else if (data.type === 'update-elements') {
            // Update paths
            (_a = data.paths) === null || _a === void 0 ? void 0 : _a.forEach((updatedPath) => {
                const index = room.paths.findIndex(p => p.id === updatedPath.id);
                if (index !== -1) {
                    room.paths[index] = updatedPath;
                }
            });
            // Update shapes
            (_b = data.shapes) === null || _b === void 0 ? void 0 : _b.forEach((updatedShape) => {
                const index = room.shapes.findIndex(s => s.id === updatedShape.id);
                if (index !== -1) {
                    room.shapes[index] = updatedShape;
                }
            });
        }
        // Broadcast to other users in the room
        socket.to(socket.roomId).emit('drawing-update', Object.assign(Object.assign({}, data), { userId: socket.id, userName: (_c = socket.userInfo) === null || _c === void 0 ? void 0 : _c.name }));
    });
    socket.on('cursor-move', (cursorData) => {
        if (!socket.roomId || !socket.userInfo)
            return;
        socket.userInfo.cursor = cursorData;
        // Broadcast cursor position to other users
        socket.to(socket.roomId).emit('cursor-update', {
            userId: socket.id,
            userName: socket.userInfo.name,
            userColor: socket.userInfo.color,
            cursor: cursorData
        });
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.roomId) {
            const room = rooms.get(socket.roomId);
            if (room) {
                room.users.delete(socket.id);
                // Notify others about user leaving
                socket.to(socket.roomId).emit('user-left', socket.id);
                // Send updated users list
                const users = Array.from(room.users.values());
                socket.to(socket.roomId).emit('users-update', users);
                // Clean up empty rooms
                if (room.users.size === 0) {
                    rooms.delete(socket.roomId);
                }
            }
        }
    });
});
const PORT = parseInt(process.env.PORT || '5000', 10);
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
