import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const winningSquareStyle = {
    border: '3px solid rgb(202, 20, 20)'
  }
  return (
    <button className="square" onClick={props.onClick} style={props.isHighlight ? winningSquareStyle : null}>
      {props.value}
    </button>
  )
}
class Board extends React.Component {
  renderSquare(i, isHighlight) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        isHighlight={isHighlight}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let boardRows = [];
    let winningSquares = this.props.winningSquares;
    for (let row = 0; row < 3; row++) {
      let cells = [];
      for (let col = 0; col < 3; col++) {
        const id = row * 3 + col;
        const isHighlight = winningSquares.indexOf(id) >= 0;
        cells.push(this.renderSquare(id, isHighlight))
      }
      boardRows.push(<div className="board-row" key={row}>{cells} </div>)
    }
    return (
      <div>
        {boardRows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        moveLocation: 0,
      }],
      stepNumber: 0,
      xIsNext: true,
      isSortMovesASC: true
    }
  }

  resetGame(i) {
    const history = this.state.history.slice(0, 1);
    this.setState({
      history: history,
      stepNumber: 0,
      xIsNext: true,
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares, this.state.stepNumber).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([{
        squares: squares,
        moveLocation: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }
  reverseMoveList() {
    this.setState({
      isSortMovesASC: !this.state.isSortMovesASC,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winInfo = calculateWinner(current.squares, this.state.stepNumber);

    let status;
    if (winInfo.winner) {
      status = 'Winner: ' + winInfo.winner;
    } else {
      if (winInfo.isDraw) {
        status = "Draw Game!!!"
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
    }

    let moves = history.map((step, move) => {
      let col = step.moveLocation % 3;
      let row = Math.floor(step.moveLocation / 3);
      let desc = move ?
        'Go to move #' + move + " at location (" + col + "," + row + ")" :
        'Go to game start';
      if (this.state.stepNumber === move) {
        desc = <b>{desc}</b>
      }
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })
    if (!this.state.isSortMovesASC) {
      moves.reverse()
    }
    return (

      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={winInfo.winningSquares}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.reverseMoveList()}>{"Sort Moves"}</button>
          <button onClick={() => this.resetGame()}>{"Reset Game"}</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }



}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);


function calculateWinner(squares, stepNumber) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
  let ret = {
    winner: null,
    winningSquares: [],
    isDraw: false,
  }
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      ret.winner = squares[a];
      ret.winningSquares = [a, b, c]
      return ret;
    }
  }
  if (stepNumber === 9) {
    ret.isDraw = true
  }
  return ret;
}
