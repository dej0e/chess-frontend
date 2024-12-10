import React, { useState, useEffect } from 'react';

const ChessGame = () => {
  const [gameId, setGameId] = useState(null);
  const [playerId] = useState(() => Math.random().toString(36).substr(2, 9)); // Generate unique player ID
  const [socket, setSocket] = useState(null);
  const [joinGameId, setJoinGameId] = useState('');
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState({
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    current_turn: 'white',
    status: 'waiting',
    white_player: null,
    black_player: null,
    legal_moves: [],
    is_check: false,
    is_checkmate: false,
    is_stalemate: false,
    time_elapsed: '00:00:00',
  });
  const [selectedSquare, setSelectedSquare] = useState(null);

  // Create a new game
  const createGame = async () => {
    try {
      const response = await fetch('http://localhost:8000/new-game');
      const data = await response.json();
      setGameId(data.game_id);
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  // Join an existing game
  const joinGame = () => {
    if (!joinGameId) {
      setError('Please enter a valid Game ID');
      return;
    }
    setGameId(joinGameId);
  };

  // Setup WebSocket connection
  useEffect(() => {
    if (gameId) {
      const ws = new WebSocket(`ws://localhost:8000/ws/${gameId}/${playerId}`);
      ws.onopen = () => console.log('Connected to game server');
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'game_state') {
          setGameState(message.data);
        } else if (message.type === 'error') {
          setError(message.message);
          setTimeout(() => setError(null), 3000);
        }
      };
      ws.onerror = () => setError('WebSocket connection error');
      setSocket(ws);
      return () => ws.close();
    }
  }, [gameId, playerId]);

  // Determine if the player is white or black
  const isWhitePlayer = gameState.white_player === playerId;

  // Check if it's the player's turn
  const isPlayersTurn = () => {
    return (
      (isWhitePlayer && gameState.current_turn === 'white') ||
      (!isWhitePlayer && gameState.current_turn === 'black')
    );
  };

  // Convert FEN to board state for rendering
  const fenToBoard = (fen) => {
    const [position] = fen.split(' ');
    const rows = position.split('/');
    const board = [];
    for (const row of rows) {
      const boardRow = [];
      for (const char of row) {
        if (isNaN(char)) {
          boardRow.push(char);
        } else {
          for (let i = 0; i < parseInt(char); i++) {
            boardRow.push(null);
          }
        }
      }
      board.push(boardRow);
    }
    return board;
  };

  const getPieceSymbol = (piece) => {
    if (!piece) return null;
  
    const pieceMap = {
      K: '/assets/white_king.svg',
      Q: '/assets/white_queen.svg',
      R: '/assets/white_rook.svg',
      B: '/assets/white_bishop.svg',
      N: '/assets/white_knight.svg',
      P: '/assets/white_pawn.svg',
      k: '/assets/black_king.svg',
      q: '/assets/black_queen.svg',
      r: '/assets/black_rook.svg',
      b: '/assets/black_bishop.svg',
      n: '/assets/black_knight.svg',
      p: '/assets/black_pawn.svg',
    };
  
    return pieceMap[piece] || null;
  };
  const getSquareCoord = (row, col) => {
    const files = 'abcdefgh';
    const ranks = '87654321'; // Standard ranks
    return `${files[col]}${ranks[row]}`;
  };

  const handleSquareClick = (row, col) => {
    const squareCoord = getSquareCoord(row, col);

    if (selectedSquare) {
      const move = `${selectedSquare}${squareCoord}`;
      if (gameState.legal_moves.includes(move)) {
        socket.send(JSON.stringify({ type: 'move', move }));
      }
      setSelectedSquare(null);
    } else {
      const piece = fenToBoard(gameState.fen)[row][col];
      if (piece) {
        setSelectedSquare(squareCoord);
      }
    }
  };

  const board = fenToBoard(gameState.fen);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {!gameId && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">Join or Create a Game</h1>
          <button onClick={createGame} className="p-2 bg-blue-500 text-white rounded">
            Create New Game
          </button>
          <input
            type="text"
            placeholder="Enter Game ID"
            value={joinGameId}
            onChange={(e) => setJoinGameId(e.target.value)}
            className="border p-2 rounded w-full mt-2"
          />
          <button onClick={joinGame} className="p-2 bg-green-500 text-white rounded mt-2">
            Join Game
          </button>
        </div>
      )}
      {gameId && (
        <div>
          <h1 className="text-2xl font-bold mb-2">Chess Game</h1>
          <p className="text-sm text-gray-600">Game ID: {gameId}</p>
          <p className="text-sm text-gray-600">
            You are {isWhitePlayer ? 'White (Solids)' : 'Black (Outlines)'}
          </p>
          <p className="text-sm text-gray-600">Time Elapsed: {gameState.time_elapsed}</p>
          <p
            className={`text-lg font-semibold ${
              isPlayersTurn() ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPlayersTurn() ? "It's your turn" : "Waiting for opponent's turn"}
          </p>
          <div className="grid grid-cols-8 gap-px bg-gray-300 p-1 rounded">
            {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isLight = (rowIndex + colIndex) % 2 === 0;
                const squareCoord = getSquareCoord(rowIndex, colIndex);
                const isSelected = selectedSquare === squareCoord;
                const isValidMove =
                  selectedSquare &&
                  gameState.legal_moves.includes(`${selectedSquare}${squareCoord}`);
                return (
                    <div
  key={`${rowIndex}-${colIndex}`}
  onClick={() => {
    if (isPlayersTurn()) handleSquareClick(rowIndex, colIndex); // Allow clicks only if it's the player's turn
  }}
  className={`w-16 h-16 flex items-center justify-center text-3xl font-semibold transition-transform transform ${
    isLight ? 'bg-green-100 text-black' : 'bg-green-800 text-white'
  } ${
    isSelected ? 'ring-4 ring-yellow-500 scale-105 shadow-lg' : ''
  } ${
    isValidMove ? 'ring-4 ring-green-400 scale-105 shadow-lg' : ''
  } ${
    isPlayersTurn() ? 'cursor-pointer hover:scale-110 hover:brightness-125' : 'cursor-not-allowed opacity-90'
  }`}
>
{piece && (
    <img
      src={getPieceSymbol(piece)}
      alt={piece}
      className="w-12 h-12"
    />
  )}</div>

                );
              })
            )}
          </div>
        </div>
      )}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
};

export default ChessGame;
