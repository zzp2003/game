import React, { useState, useEffect } from 'react';
import '../styles/Board.css';

type Player = 'black' | 'white';
type CellValue = Player | null;

interface BoardProps {
  size?: number;
}

const Board: React.FC<BoardProps> = ({ size = 15 }) => {
  const [board, setBoard] = useState<CellValue[][]>(
    Array(size).fill(null).map(() => Array(size).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // 检查是否获胜
  const checkWin = (row: number, col: number, player: Player): boolean => {
    const directions = [
      [1, 0],   // 水平
      [0, 1],   // 垂直
      [1, 1],   // 对角线
      [1, -1],  // 反对角线
    ];

    return directions.some(([dx, dy]) => {
      let count = 1;
      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow < 0 || newRow >= size ||
          newCol < 0 || newCol >= size ||
          board[newRow][newCol] !== player
        ) break;
        count++;
      }
      // 反向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow < 0 || newRow >= size ||
          newCol < 0 || newCol >= size ||
          board[newRow][newCol] !== player
        ) break;
        count++;
      }
      return count >= 5;
    });
  };

  // AI移动
  const aiMove = () => {
    if (gameOver) return;

    // 简单的AI策略：评估每个空位置的分数
    let bestScore = -Infinity;
    let bestMove: [number, number] = [-1, -1];

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === null) {
          const score = evaluatePosition(i, j);
          if (score > bestScore) {
            bestScore = score;
            bestMove = [i, j];
          }
        }
      }
    }

    if (bestMove[0] !== -1) {
      handleMove(bestMove[0], bestMove[1]);
    }
  };

  // 评估位置分数
  const evaluatePosition = (row: number, col: number): number => {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    let score = 0;

    directions.forEach(([dx, dy]) => {
      score += evaluateDirection(row, col, dx, dy, 'white'); // AI得分
      score += evaluateDirection(row, col, dx, dy, 'black') * 1.1; // 防守得分略高
    });

    return score;
  };

  // 评估某个方向的得分
  const evaluateDirection = (row: number, col: number, dx: number, dy: number, player: Player): number => {
    let consecutive = 0;
    let blocked = 0;
    let space = 0;

    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) {
        blocked++;
        break;
      }
      const cell = board[newRow][newCol];
      if (cell === player) consecutive++;
      else if (cell === null) {
        space++;
        break;
      } else {
        blocked++;
        break;
      }
    }

    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) {
        blocked++;
        break;
      }
      const cell = board[newRow][newCol];
      if (cell === player) consecutive++;
      else if (cell === null) {
        space++;
        break;
      } else {
        blocked++;
        break;
      }
    }

    // 根据连子数和阻塞情况评分
    if (consecutive >= 4) return 10000;
    if (consecutive === 3 && blocked === 0) return 1000;
    if (consecutive === 2 && blocked === 0) return 100;
    if (consecutive === 1 && blocked === 0) return 10;
    return 0;
  };

  // 处理移动
  const handleMove = (row: number, col: number) => {
    if (board[row][col] !== null || gameOver) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    if (checkWin(row, col, currentPlayer)) {
      setWinner(currentPlayer);
      setGameOver(true);
      return;
    }

    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
  };

  // 当玩家下完棋后，AI自动移动
  useEffect(() => {
    if (currentPlayer === 'white' && !gameOver) {
      const timer = setTimeout(aiMove, 500); // 添加延迟使移动更自然
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameOver]);

  // 重置游戏
  const resetGame = () => {
    setBoard(Array(size).fill(null).map(() => Array(size).fill(null)));
    setCurrentPlayer('black');
    setWinner(null);
    setGameOver(false);
  };

  return (
    <div className="game-container">
      <div className="board">
        {board.map((row, i) => (
          <div key={i} className="board-row">
            {row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`cell ${cell || ''}`}
                onClick={() => currentPlayer === 'black' && handleMove(i, j)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="game-info">
        {gameOver ? (
          <div className="game-over">
            {winner ? `${winner === 'black' ? '黑棋' : '白棋'}获胜！` : '游戏结束'}
          </div>
        ) : (
          <div className="current-player">
            当前玩家: {currentPlayer === 'black' ? '黑棋' : '白棋'}
          </div>
        )}
        <button className="reset-button" onClick={resetGame}>重新开始</button>
      </div>
    </div>
  );
};

export default Board;