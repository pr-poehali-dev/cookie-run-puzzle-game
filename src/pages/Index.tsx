import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type CookieType = 'pink' | 'purple' | 'blue' | 'yellow' | 'orange';

interface Cookie {
  id: string;
  type: CookieType;
  row: number;
  col: number;
  isMatched?: boolean;
}

const cookieEmojis: Record<CookieType, string> = {
  pink: '🍓',
  purple: '🍇',
  blue: '🫐',
  yellow: '🍋',
  orange: '🍊'
};

const cookieColors: Record<CookieType, string> = {
  pink: 'from-pink-400 to-pink-600',
  purple: 'from-purple-400 to-purple-600',
  blue: 'from-blue-400 to-blue-600',
  yellow: 'from-yellow-400 to-yellow-600',
  orange: 'from-orange-400 to-orange-600'
};

const GRID_SIZE = 6;
const COOKIE_TYPES: CookieType[] = ['pink', 'purple', 'blue', 'yellow', 'orange'];

const Index = () => {
  const [grid, setGrid] = useState<Cookie[][]>([]);
  const [selectedCookie, setSelectedCookie] = useState<{row: number, col: number} | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [isAnimating, setIsAnimating] = useState(false);

  const createRandomCookie = (row: number, col: number): Cookie => ({
    id: `${row}-${col}-${Math.random()}`,
    type: COOKIE_TYPES[Math.floor(Math.random() * COOKIE_TYPES.length)],
    row,
    col
  });

  const initializeGrid = () => {
    const newGrid: Cookie[][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = createRandomCookie(row, col);
      }
    }
    setGrid(newGrid);
    setScore(0);
    setMoves(30);
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  const findMatches = (currentGrid: Cookie[][]): Cookie[] => {
    const matches: Cookie[] = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const cookie1 = currentGrid[row][col];
        const cookie2 = currentGrid[row][col + 1];
        const cookie3 = currentGrid[row][col + 2];
        
        if (cookie1.type === cookie2.type && cookie2.type === cookie3.type) {
          matches.push(cookie1, cookie2, cookie3);
        }
      }
    }
    
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const cookie1 = currentGrid[row][col];
        const cookie2 = currentGrid[row + 1][col];
        const cookie3 = currentGrid[row + 2][col];
        
        if (cookie1.type === cookie2.type && cookie2.type === cookie3.type) {
          matches.push(cookie1, cookie2, cookie3);
        }
      }
    }
    
    return Array.from(new Set(matches.map(c => c.id))).map(id => 
      matches.find(c => c.id === id)!
    );
  };

  const removeMatches = async () => {
    setIsAnimating(true);
    const newGrid = grid.map(row => [...row]);
    const matches = findMatches(newGrid);
    
    if (matches.length > 0) {
      matches.forEach(match => {
        newGrid[match.row][match.col].isMatched = true;
      });
      setGrid([...newGrid]);
      setScore(prev => prev + matches.length * 10);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      for (let col = 0; col < GRID_SIZE; col++) {
        let emptySpaces = 0;
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
          if (newGrid[row][col].isMatched) {
            emptySpaces++;
          } else if (emptySpaces > 0) {
            newGrid[row + emptySpaces][col] = newGrid[row][col];
            newGrid[row][col] = createRandomCookie(row, col);
          }
        }
        for (let i = 0; i < emptySpaces; i++) {
          newGrid[i][col] = createRandomCookie(i, col);
        }
      }
      
      setGrid([...newGrid]);
      setTimeout(() => removeMatches(), 100);
    } else {
      setIsAnimating(false);
    }
  };

  const handleCookieClick = (row: number, col: number) => {
    if (isAnimating || moves === 0) return;
    
    if (!selectedCookie) {
      setSelectedCookie({ row, col });
    } else {
      const rowDiff = Math.abs(selectedCookie.row - row);
      const colDiff = Math.abs(selectedCookie.col - col);
      
      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        const newGrid = grid.map(row => [...row]);
        const temp = newGrid[selectedCookie.row][selectedCookie.col];
        newGrid[selectedCookie.row][selectedCookie.col] = newGrid[row][col];
        newGrid[row][col] = temp;
        
        newGrid[selectedCookie.row][selectedCookie.col].row = selectedCookie.row;
        newGrid[selectedCookie.row][selectedCookie.col].col = selectedCookie.col;
        newGrid[row][col].row = row;
        newGrid[row][col].col = col;
        
        setGrid(newGrid);
        setMoves(prev => prev - 1);
        setSelectedCookie(null);
        
        setTimeout(() => removeMatches(), 100);
      } else {
        setSelectedCookie({ row, col });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] via-[#3d2a5e] to-[#1a1229] flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <div className="max-w-2xl w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold text-white magic-glow" style={{ 
            textShadow: '0 0 20px rgba(157, 78, 221, 0.8), 0 0 40px rgba(255, 105, 180, 0.6)' 
          }}>
            COOKIE RUN KINGDOM
          </h1>
          <p className="text-xl text-purple-200 font-medium">Магическая головоломка</p>
        </div>

        <Card className="bg-gradient-to-br from-purple-900/80 to-purple-950/80 backdrop-blur-sm border-2 border-purple-400/50 p-6 magic-glow">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 rounded-full cookie-shadow">
              <Icon name="Sparkles" className="text-purple-900" size={24} />
              <span className="text-2xl font-bold text-purple-900">{score}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-600 px-6 py-3 rounded-full cookie-shadow">
              <Icon name="Zap" className="text-white" size={24} />
              <span className="text-2xl font-bold text-white">{moves}</span>
            </div>
          </div>

          <div 
            className="grid gap-2 mb-6"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` 
            }}
          >
            {grid.map((row, rowIndex) => 
              row.map((cookie, colIndex) => (
                <button
                  key={cookie.id}
                  onClick={() => handleCookieClick(rowIndex, colIndex)}
                  disabled={isAnimating || moves === 0}
                  className={`
                    aspect-square rounded-xl flex items-center justify-center text-4xl
                    transition-all duration-200 cursor-pointer
                    bg-gradient-to-br ${cookieColors[cookie.type]}
                    hover:scale-110 active:scale-95
                    cookie-shadow
                    ${cookie.isMatched ? 'animate-pop-out' : 'animate-bounce-in'}
                    ${selectedCookie?.row === rowIndex && selectedCookie?.col === colIndex 
                      ? 'ring-4 ring-white scale-110 magic-glow' 
                      : ''
                    }
                    ${isAnimating || moves === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {cookieEmojis[cookie.type]}
                </button>
              ))
            )}
          </div>

          <Button
            onClick={initializeGrid}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 text-xl rounded-xl cookie-shadow transition-all hover:scale-105"
          >
            <Icon name="RotateCcw" className="mr-2" size={24} />
            Новая игра
          </Button>
        </Card>

        {moves === 0 && (
          <Card className="bg-gradient-to-br from-pink-500/90 to-purple-600/90 backdrop-blur-sm border-2 border-white/50 p-8 text-center magic-glow animate-bounce-in">
            <h2 className="text-3xl font-bold text-white mb-2">Игра окончена!</h2>
            <p className="text-xl text-white/90 mb-4">Ваш счёт: {score}</p>
            <Button
              onClick={initializeGrid}
              className="bg-white text-purple-600 hover:bg-purple-50 font-bold px-8 py-3 rounded-xl"
            >
              Играть снова
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
