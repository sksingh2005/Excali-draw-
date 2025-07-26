import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Home, 
  Pencil, 
  Eraser, 
  Square, 
  Circle, 
  Trash2, 
  Download,
  Undo,
  Redo,
  Palette,
  Minus,
  Plus,
  MousePointer,
  Move,
  RotateCcw,
  Share,
  Users,
  Copy,
  Check
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';

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

interface SelectionBox {
  startPoint: Point;
  endPoint: Point;
}

interface User {
  id: string;
  name: string;
  color: string;
  cursor: Point | null;
}

interface RemoteCursor {
  userId: string;
  userName: string;
  userColor: string;
  cursor: Point;
}

const DrawingPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId?: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'select'>('pen');
  const [currentColor, setCurrentColor] = useState('#3B82F6');
  const [brushSize, setBrushSize] = useState(3);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [selectedElements, setSelectedElements] = useState<{paths: string[], shapes: string[]}>({paths: [], shapes: []});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [history, setHistory] = useState<{paths: DrawingPath[], shapes: Shape[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Collaboration state
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(roomId || null);

  const baseUrl='https://excali-draw.onrender.com'
  // Initialize socket connection
  useEffect(() => {
    if (currentRoomId) {
      console.log('Connecting to room:', currentRoomId);
      socketRef.current = io(baseUrl);
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        socketRef.current?.emit('join-room', currentRoomId);
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });
      
      socketRef.current.on('room-joined', (data) => {
        console.log('Room joined:', data);
        setCurrentUser(data.userInfo);
        setPaths(data.paths);
        setShapes(data.shapes);
      });
      
      socketRef.current.on('room-error', (error) => {
        console.error('Room error:', error);
        alert('Room not found!');
        navigate('/');
      });
      
      socketRef.current.on('users-update', (usersList) => {
        setUsers(usersList);
      });
      
      socketRef.current.on('drawing-update', (data) => {
        if (data.type === 'path-add') {
          setPaths(prev => [...prev, data.path]);
        } else if (data.type === 'shape-add') {
          setShapes(prev => [...prev, data.shape]);
        } else if (data.type === 'clear') {
          setPaths([]);
          setShapes([]);
        } else if (data.type === 'delete-elements') {
          setPaths(prev => prev.filter(p => !data.pathIds.includes(p.id)));
          setShapes(prev => prev.filter(s => !data.shapeIds.includes(s.id)));
        } else if (data.type === 'update-elements') {
          if (data.paths) {
            setPaths(prev => prev.map(p => {
              const updated = data.paths.find((up: DrawingPath) => up.id === p.id);
              return updated || p;
            }));
          }
          if (data.shapes) {
            setShapes(prev => prev.map(s => {
              const updated = data.shapes.find((us: Shape) => us.id === s.id);
              return updated || s;
            }));
          }
        }
      });
      
      socketRef.current.on('cursor-update', (cursorData) => {
        setRemoteCursors(prev => {
          const filtered = prev.filter(c => c.userId !== cursorData.userId);
          if (cursorData.cursor) {
            return [...filtered, cursorData];
          }
          return filtered;
        });
      });
      
      socketRef.current.on('user-left', (userId) => {
        setRemoteCursors(prev => prev.filter(c => c.userId !== userId));
      });
      
      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [currentRoomId, navigate]);

  // Create new room
  const createRoom = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setCurrentRoomId(data.roomId);
      navigate(`/draw/${data.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // Share functionality
  const handleShare = () => {
    if (!currentRoomId) {
      createRoom();
    } else {
      setShareModalOpen(true);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/draw/${currentRoomId}`;
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const emitDrawingUpdate = (type: string, data: any) => {
    if (socketRef.current && currentRoomId) {
      socketRef.current.emit('drawing-update', { type, ...data });
    }
  };

  // Save to localStorage (for solo mode)
  const saveToLocalStorage = useCallback(() => {
    if (!currentRoomId) {
      const drawingData = {
        paths,
        shapes,
        timestamp: Date.now()
      };
      localStorage.setItem('scribbly-drawing', JSON.stringify(drawingData));
    }
  }, [paths, shapes, currentRoomId]);

  // Load from localStorage (for solo mode)
  const loadFromLocalStorage = useCallback(() => {
    if (!currentRoomId) {
      try {
        const saved = localStorage.getItem('scribbly-drawing');
        if (saved) {
          const data = JSON.parse(saved);
          setPaths(data.paths || []);
          setShapes(data.shapes || []);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }, [currentRoomId]);

  // Save history for undo/redo
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ paths: [...paths], shapes: [...shapes] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [paths, shapes, history, historyIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    console.log('Canvas dimensions:', canvas.width, canvas.height);

    // Set canvas style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load saved drawing (only in solo mode)
    if (!currentRoomId) {
      loadFromLocalStorage();
    }
  }, [loadFromLocalStorage, currentRoomId]);

  // Auto-save when paths or shapes change (only in solo mode)
  useEffect(() => {
    if (!currentRoomId && (paths.length > 0 || shapes.length > 0)) {
      saveToLocalStorage();
    }
  }, [paths, shapes, saveToLocalStorage, currentRoomId]);

  useEffect(() => {
    redrawCanvas();
  }, [paths, shapes, currentPath, currentShape, currentTool, currentColor, brushSize, selectionBox, selectedElements, remoteCursors]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const isPointInPath = (point: Point, path: DrawingPath): boolean => {
    return path.points.some(p => 
      Math.abs(p.x - point.x) < path.width + 5 && 
      Math.abs(p.y - point.y) < path.width + 5
    );
  };

  const isPointInShape = (point: Point, shape: Shape): boolean => {
    const { startPoint, endPoint } = shape;
    
    if (shape.type === 'rectangle') {
      const minX = Math.min(startPoint.x, endPoint.x);
      const maxX = Math.max(startPoint.x, endPoint.x);
      const minY = Math.min(startPoint.y, endPoint.y);
      const maxY = Math.max(startPoint.y, endPoint.y);
      return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
    } else if (shape.type === 'circle') {
      const centerX = (startPoint.x + endPoint.x) / 2;
      const centerY = (startPoint.y + endPoint.y) / 2;
      const radius = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + 
        Math.pow(endPoint.y - startPoint.y, 2)
      ) / 2;
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + 
        Math.pow(point.y - centerY, 2)
      );
      return distance <= radius;
    } else if (shape.type === 'line') {
      const A = point.y - startPoint.y;
      const B = startPoint.x - point.x;
      const C = point.x * startPoint.y - startPoint.x * point.y;
      const distance = Math.abs(A * endPoint.x + B * endPoint.y + C) / 
        Math.sqrt(A * A + B * B);
      return distance < shape.width + 5;
    }
    return false;
  };

  const isElementInSelection = (element: DrawingPath | Shape, selection: SelectionBox): boolean => {
    const minX = Math.min(selection.startPoint.x, selection.endPoint.x);
    const maxX = Math.max(selection.startPoint.x, selection.endPoint.x);
    const minY = Math.min(selection.startPoint.y, selection.endPoint.y);
    const maxY = Math.max(selection.startPoint.y, selection.endPoint.y);

    if ('points' in element) {
      return element.points.some(point => 
        point.x >= minX && point.x <= maxX && 
        point.y >= minY && point.y <= maxY
      );
    } else {
      const { startPoint, endPoint } = element;
      return (startPoint.x >= minX && startPoint.x <= maxX && 
              startPoint.y >= minY && startPoint.y <= maxY) ||
             (endPoint.x >= minX && endPoint.x <= maxX && 
              endPoint.y >= minY && endPoint.y <= maxY);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found in redraw');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Context not found');
      return;
    }

    console.log('Redrawing canvas with:', paths.length, 'paths and', shapes.length, 'shapes');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed paths
    paths.forEach(path => {
      if (path.points.length < 2) return;

      ctx.strokeStyle = path.selected ? '#FF6B6B' : path.color;
      ctx.lineWidth = path.selected ? path.width + 2 : path.width;
      ctx.globalCompositeOperation = path.tool === 'eraser' ? 'destination-out' : 'source-over';

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      path.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      
      ctx.stroke();
    });

    // Draw all completed shapes
    shapes.forEach(shape => {
      ctx.strokeStyle = shape.selected ? '#FF6B6B' : shape.color;
      ctx.lineWidth = shape.selected ? shape.width + 2 : shape.width;
      ctx.globalCompositeOperation = 'source-over';

      if (shape.type === 'rectangle') {
        const width = shape.endPoint.x - shape.startPoint.x;
        const height = shape.endPoint.y - shape.startPoint.y;
        ctx.strokeRect(shape.startPoint.x, shape.startPoint.y, width, height);
      } else if (shape.type === 'circle') {
        const centerX = (shape.startPoint.x + shape.endPoint.x) / 2;
        const centerY = (shape.startPoint.y + shape.endPoint.y) / 2;
        const radius = Math.sqrt(
          Math.pow(shape.endPoint.x - shape.startPoint.x, 2) + 
          Math.pow(shape.endPoint.y - shape.startPoint.y, 2)
        ) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(shape.startPoint.x, shape.startPoint.y);
        ctx.lineTo(shape.endPoint.x, shape.endPoint.y);
        ctx.stroke();
      }
    });

    // Draw current path
    if (currentPath.length > 1) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';

      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      
      currentPath.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      
      ctx.stroke();
    }

    // Draw current shape preview
    if (currentShape) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = 'source-over';
      ctx.setLineDash([5, 5]);

      if (currentShape.type === 'rectangle') {
        const width = currentShape.endPoint.x - currentShape.startPoint.x;
        const height = currentShape.endPoint.y - currentShape.startPoint.y;
        ctx.strokeRect(currentShape.startPoint.x, currentShape.startPoint.y, width, height);
      } else if (currentShape.type === 'circle') {
        const centerX = (currentShape.startPoint.x + currentShape.endPoint.x) / 2;
        const centerY = (currentShape.startPoint.y + currentShape.endPoint.y) / 2;
        const radius = Math.sqrt(
          Math.pow(currentShape.endPoint.x - currentShape.startPoint.x, 2) + 
          Math.pow(currentShape.endPoint.y - currentShape.startPoint.y, 2)
        ) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (currentShape.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(currentShape.startPoint.x, currentShape.startPoint.y);
        ctx.lineTo(currentShape.endPoint.x, currentShape.endPoint.y);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // Draw selection box
    if (selectionBox) {
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.globalCompositeOperation = 'source-over';
      
      const width = selectionBox.endPoint.x - selectionBox.startPoint.x;
      const height = selectionBox.endPoint.y - selectionBox.startPoint.y;
      ctx.strokeRect(selectionBox.startPoint.x, selectionBox.startPoint.y, width, height);
      
      ctx.setLineDash([]);
    }

    // Draw remote cursors
    remoteCursors.forEach(cursor => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = cursor.userColor;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      
      // Draw cursor pointer
      ctx.beginPath();
      ctx.moveTo(cursor.cursor.x, cursor.cursor.y);
      ctx.lineTo(cursor.cursor.x + 12, cursor.cursor.y + 12);
      ctx.lineTo(cursor.cursor.x + 8, cursor.cursor.y + 16);
      ctx.lineTo(cursor.cursor.x + 4, cursor.cursor.y + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw user name
      ctx.fillStyle = cursor.userColor;
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(cursor.userName, cursor.cursor.x + 15, cursor.cursor.y + 15);
    });

    ctx.globalCompositeOperation = 'source-over';
  };

  const startDrawing = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      console.log('Canvas rect not found');
      return;
    }

    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    console.log('Mouse down at:', point, 'Tool:', currentTool);

    if (currentTool === 'select') {
      const clickedPath = paths.find(path => selectedElements.paths.includes(path.id) && isPointInPath(point, path));
      const clickedShape = shapes.find(shape => selectedElements.shapes.includes(shape.id) && isPointInShape(point, shape));
      
      if (clickedPath || clickedShape) {
        setIsDragging(true);
        setDragStart(point);
      } else {
        setIsDrawing(true);
        setSelectionBox({ startPoint: point, endPoint: point });
        setSelectedElements({ paths: [], shapes: [] });
      }
    } else if (currentTool === 'pen' || currentTool === 'eraser') {
      setIsDrawing(true);
      setCurrentPath([point]);
    } else if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line') {
      setIsDrawing(true);
      setStartPoint(point);
      setCurrentShape({
        id: generateId(),
        type: currentTool,
        startPoint: point,
        endPoint: point,
        color: currentColor,
        width: brushSize
      });
    }
  };

  const draw = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Send cursor position to other users if in collaborative mode
    if (socketRef.current && currentRoomId) {
      socketRef.current.emit('cursor-move', point);
    }

    if (currentTool === 'select') {
      if (isDragging && dragStart) {
        const deltaX = point.x - dragStart.x;
        const deltaY = point.y - dragStart.y;
        
        const updatedPaths = paths.map(path => {
          if (selectedElements.paths.includes(path.id)) {
            return {
              ...path,
              points: path.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }))
            };
          }
          return path;
        });
        
        const updatedShapes = shapes.map(shape => {
          if (selectedElements.shapes.includes(shape.id)) {
            return {
              ...shape,
              startPoint: { x: shape.startPoint.x + deltaX, y: shape.startPoint.y + deltaY },
              endPoint: { x: shape.endPoint.x + deltaX, y: shape.endPoint.y + deltaY }
            };
          }
          return shape;
        });
        
        setPaths(updatedPaths);
        setShapes(updatedShapes);
        setDragStart(point);
      } else if (isDrawing && selectionBox) {
        setSelectionBox(prev => prev ? { ...prev, endPoint: point } : null);
      }
    } else if (isDrawing) {
      if (currentTool === 'pen' || currentTool === 'eraser') {
        setCurrentPath(prev => [...prev, point]);
      } else if ((currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line') && startPoint) {
        setCurrentShape(prev => prev ? {
          ...prev,
          endPoint: point
        } : null);
      }
    }
  };

  const stopDrawing = () => {
    console.log('Stop drawing called, isDrawing:', isDrawing, 'currentTool:', currentTool);
    
    if (currentTool === 'select') {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
        saveToHistory();
        
        // Emit update for collaborative mode
        const updatedPaths = paths.filter(p => selectedElements.paths.includes(p.id));
        const updatedShapes = shapes.filter(s => selectedElements.shapes.includes(s.id));
        if (updatedPaths.length > 0 || updatedShapes.length > 0) {
          emitDrawingUpdate('update-elements', { paths: updatedPaths, shapes: updatedShapes });
        }
      } else if (isDrawing && selectionBox) {
        const selectedPaths = paths.filter(path => isElementInSelection(path, selectionBox)).map(p => p.id);
        const selectedShapes = shapes.filter(shape => isElementInSelection(shape, selectionBox)).map(s => s.id);
        
        setSelectedElements({ paths: selectedPaths, shapes: selectedShapes });
        setSelectionBox(null);
      }
    } else if (isDrawing && (currentTool === 'pen' || currentTool === 'eraser') && currentPath.length > 1) {
      const newPath: DrawingPath = {
        id: generateId(),
        points: [...currentPath],
        color: currentColor,
        width: brushSize,
        tool: currentTool === 'eraser' ? 'eraser' : 'pen'
      };

      console.log('Adding new path:', newPath);
      setPaths(prev => [...prev, newPath]);
      setCurrentPath([]);
      saveToHistory();
      
      // Emit to collaborative mode
      emitDrawingUpdate('path-add', { path: newPath });
    } else if (isDrawing && (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line') && currentShape) {
      console.log('Adding new shape:', currentShape);
      setShapes(prev => [...prev, currentShape]);
      setCurrentShape(null);
      setStartPoint(null);
      saveToHistory();
      
      // Emit to collaborative mode
      emitDrawingUpdate('shape-add', { shape: currentShape });
    }
    setIsDrawing(false);
  };

  const deleteSelected = () => {
    setPaths(prev => prev.filter(path => !selectedElements.paths.includes(path.id)));
    setShapes(prev => prev.filter(shape => !selectedElements.shapes.includes(shape.id)));
    
    // Emit to collaborative mode
    emitDrawingUpdate('delete-elements', { 
      pathIds: selectedElements.paths, 
      shapeIds: selectedElements.shapes 
    });
    
    setSelectedElements({ paths: [], shapes: [] });
    saveToHistory();
  };

  const clearCanvas = () => {
    setPaths([]);
    setShapes([]);
    setCurrentPath([]);
    setCurrentShape(null);
    setStartPoint(null);
    setSelectedElements({ paths: [], shapes: [] });
    
    if (!currentRoomId) {
      localStorage.removeItem('scribbly-drawing');
    }
    
    // Emit to collaborative mode
    emitDrawingUpdate('clear', {});
    
    saveToHistory();
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPaths(prevState.paths);
      setShapes(prevState.shapes);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPaths(nextState.paths);
      setShapes(nextState.shapes);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'scribbly-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = [
    '#000000', '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'
  ];

  const hasSelection = selectedElements.paths.length > 0 || selectedElements.shapes.length > 0;

  // Debug component state
  useEffect(() => {
    console.log('Component state:', {
      currentTool,
      currentColor,
      brushSize,
      pathsCount: paths.length,
      shapesCount: shapes.length,
      isConnected,
      currentRoomId
    });
  }, [currentTool, currentColor, brushSize, paths.length, shapes.length, isConnected, currentRoomId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home size={20} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Scribbly
            </h1>
            {currentRoomId && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                <Users size={16} />
                <span>{users.length} online</span>
                {isConnected ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Share size={20} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo size={20} />
            </button>
            <button
              onClick={downloadCanvas}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={20} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Toolbar */}
        <div className="bg-white shadow-lg border-r p-4 w-20 lg:w-64">
          <div className="space-y-6">
            {/* Online Users */}
            {currentRoomId && users.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 hidden lg:block">Online Users</h3>
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: user.color }}
                      ></div>
                      <span className="hidden lg:inline truncate">
                        {user.id === currentUser?.id ? 'You' : user.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 hidden lg:block">Tools</h3>
              <div className="space-y-2">
                {[
                  { tool: 'select', icon: MousePointer, name: 'Select' },
                  { tool: 'pen', icon: Pencil, name: 'Pen' },
                  { tool: 'eraser', icon: Eraser, name: 'Eraser' },
                  { tool: 'rectangle', icon: Square, name: 'Rectangle' },
                  { tool: 'circle', icon: Circle, name: 'Circle' },
                  { tool: 'line', icon: Minus, name: 'Line' },
                ].map(({ tool, icon: Icon, name }) => (
                  <button
                    key={tool}
                    onClick={() => {
                      console.log('Tool selected:', tool);
                      setCurrentTool(tool as any);
                      if (tool !== 'select') {
                        setSelectedElements({ paths: [], shapes: [] });
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      currentTool === tool ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="hidden lg:inline">{name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Actions */}
            {hasSelection && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 hidden lg:block">Selection</h3>
                <div className="space-y-2">
                  <button
                    onClick={deleteSelected}
                    className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                    <span className="hidden lg:inline">Delete Selected</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2 hidden lg:block">
                  Selected: {selectedElements.paths.length} paths, {selectedElements.shapes.length} shapes
                </div>
              </div>
            )}

            {/* Colors */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 hidden lg:block">Colors</h3>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      currentColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 hidden lg:block">
                Size: {brushSize}px
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="hidden lg:block flex-1"
                />
                <button
                  onClick={() => setBrushSize(Math.min(50, brushSize + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-4">
              <button
                onClick={clearCanvas}
                className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
                <span className="hidden lg:inline">Clear All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4">
          <div className="relative h-full bg-white rounded-lg shadow-inner overflow-hidden">
            <canvas
              ref={canvasRef}
              className={`w-full h-full ${
                currentTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
              }`}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            {/* Instructions */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
              {currentRoomId ? (
                `Collaborating in room ${currentRoomId}. ${users.length} users online.`
              ) : (
                currentTool === 'select' ? 
                  'Click and drag to select elements. Click selected elements to move them.' :
                  'Click and drag to draw. Your work is automatically saved.'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Share Your Drawing</h3>
            <p className="text-gray-600 mb-4">
              Share this link with others to collaborate in real-time:
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={`${window.location.origin}/draw/${currentRoomId}`}
                readOnly
                className="flex-1 p-2 border rounded-lg bg-gray-50"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingPage;
