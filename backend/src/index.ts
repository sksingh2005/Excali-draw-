import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://excali-draw-theta.vercel.app/", // React app URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Type definitions
interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
  selected?: boolean;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  startPoint: Point;
  endPoint: Point;
  color: string;
  width: number;
  selected?: boolean;
}

interface UserInfo {
  id: string;
  name: string;
  color: string;
  cursor: Point | null;
}

interface Room {
  id: string;
  paths: DrawingPath[];
  shapes: Shape[];
  users: Map<string, UserInfo>;
  createdAt: Date;
}

interface DrawingUpdateData {
  type: 'path-add' | 'shape-add' | 'clear' | 'delete-elements' | 'update-elements';
  path?: DrawingPath;
  shape?: Shape;
  pathIds?: string[];
  shapeIds?: string[];
  paths?: DrawingPath[];
  shapes?: Shape[];
}

// Extend Socket interface to include custom properties
interface CustomSocket extends Socket {
  roomId?: string;
  userInfo?: UserInfo;
}

// Store room data
const rooms = new Map<string, Room>();
const userNames: string[] = [
  'Artist', 'Painter', 'Creator', 'Designer', 'Sketcher', 'Drawer', 'Crafter',
  'Maker', 'Builder', 'Genius', 'Master', 'Expert', 'Pro', 'Star', 'Hero'
];

const colors: string[] = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateUserName(): string {
  const adjectives: string[] = ['Creative', 'Artistic', 'Talented', 'Skilled', 'Amazing', 'Cool', 'Smart', 'Quick'];
  const name = userNames[Math.floor(Math.random() * userNames.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  return `${adjective} ${name}`;
}

// Create new room
app.post('/api/rooms', (req: Request, res: Response): void => {
  const roomId = generateRoomId();
  const newRoom: Room = {
    id: roomId,
    paths: [],
    shapes: [],
    users: new Map<string, UserInfo>(),
    createdAt: new Date()
  };
  
  rooms.set(roomId, newRoom);
  
  res.json({ roomId });
});

// Get room data
app.get('/api/rooms/:roomId', (req: Request, res: Response): void => {
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

io.on('connection', (socket: CustomSocket): void => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (roomId: string): void => {
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
    
    const userInfo: UserInfo = {
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
  
  socket.on('drawing-update', (data: DrawingUpdateData): void => {
    if (!socket.roomId) return;
    
    const room = rooms.get(socket.roomId);
    if (!room) return;
    
    // Update room data
    if (data.type === 'path-add' && data.path) {
      room.paths.push(data.path);
    } else if (data.type === 'shape-add' && data.shape) {
      room.shapes.push(data.shape);
    } else if (data.type === 'clear') {
      room.paths = [];
      room.shapes = [];
    } else if (data.type === 'delete-elements') {
      if (data.pathIds) {
        room.paths = room.paths.filter(p => !data.pathIds!.includes(p.id));
      }
      if (data.shapeIds) {
        room.shapes = room.shapes.filter(s => !data.shapeIds!.includes(s.id));
      }
    } else if (data.type === 'update-elements') {
      // Update paths
      data.paths?.forEach((updatedPath: DrawingPath) => {
        const index = room.paths.findIndex(p => p.id === updatedPath.id);
        if (index !== -1) {
          room.paths[index] = updatedPath;
        }
      });
      
      // Update shapes
      data.shapes?.forEach((updatedShape: Shape) => {
        const index = room.shapes.findIndex(s => s.id === updatedShape.id);
        if (index !== -1) {
          room.shapes[index] = updatedShape;
        }
      });
    }
    
    // Broadcast to other users in the room
    socket.to(socket.roomId).emit('drawing-update', {
      ...data,
      userId: socket.id,
      userName: socket.userInfo?.name
    });
  });
  
  socket.on('cursor-move', (cursorData: Point): void => {
    if (!socket.roomId || !socket.userInfo) return;
    
    socket.userInfo.cursor = cursorData;
    
    // Broadcast cursor position to other users
    socket.to(socket.roomId).emit('cursor-update', {
      userId: socket.id,
      userName: socket.userInfo.name,
      userColor: socket.userInfo.color,
      cursor: cursorData
    });
  });
  
  socket.on('disconnect', (): void => {
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

const PORT: number = parseInt(process.env.PORT || '5000', 10);
server.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});
