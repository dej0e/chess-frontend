import React from 'react';
import ChessGame from './components/ChessGame';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.title = 'Chess - Web Sockets';
  }, []);

  return (
    <div>
      <ChessGame />
    </div>
  );
}

export default App;
