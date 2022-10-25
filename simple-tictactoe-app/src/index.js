import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.isWinCell ? <b>{props.value}</b> : props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(row, col, lineWin) {
    const index = getIdKeyFromRowAndColumn(row, col, this.props.sizeBoard)
    return (
      <Square
        key={index}
        isWinCell={lineWin.includes(index)}
        value={this.props.squares[index]}
        onClick={() => this.props.onClick(row, col)}
      />
    );
  }

  render() {
    const size = this.props.sizeBoard
    var boardToRender = []
    for (var row = 0; row < size; row++) {
      var rowtoRender = []
      for (var column = 0; column < size; column++) {
        rowtoRender.push(this.renderSquare(row, column, this.props.lineWin))
      }
      boardToRender.push(
        <div key={"row" + row} className="board-row">
          {rowtoRender}
        </div>
      )
    }

    return (
      <div>
        {boardToRender}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          row: null,
          col: null
        }
      ],
      size: 3,
      stepNumber: 0,
      xIsNext: true,
      result: null,
      listMoveReversed: false
    };
  }

  calculateResult(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {value: squares[a] + " won the game.", lineWin: lines[i].slice()}
      }
    }
    const emptySquarePosition = squares.findIndex((square) => {
      return square === null || square === undefined
    })
    if (emptySquarePosition === -1) return {value: "draw."}
    return null
  }

  calculateResult2(squares, size) {
    const totalToWin = size === 3 ? 3 : 5
    var lineWin = null

    const returnWinResult = (winner, lineWin) => {
      return {value: winner + " won the game.", lineWin: lineWin.slice()}
    }

    //find winner
    for(var row = 0; row < size; row++) {
      for(var col = 0; col < size; col++) {
        lineWin = [row*size + col]
        const checkingValue = squares[row*size + col]
        if (checkingValue === null || checkingValue === undefined) {
          continue
        }
        var rowEnough = false, colEnough = false
        // check column
        if (col + totalToWin - 1 < size) {
          colEnough = true
          for(var nextCol = 1; nextCol < totalToWin; nextCol++) {
            if (checkingValue === squares[row*size + col + nextCol]) {
              lineWin.push(row*size + col + nextCol)
            }
            else {
              lineWin = lineWin.slice(0, 1)
              break
            }
          }
          if(lineWin.length > 1) {
            return returnWinResult(checkingValue, lineWin)
          }
        }
        
        // check row
        if (row + totalToWin - 1 < size) {
          rowEnough = true
          for(var nextRow = 1; nextRow < totalToWin; nextRow++) {
            if (checkingValue === squares[(row + nextRow)*size + col]) {
              lineWin.push((row + nextRow)*size + col)
            }
            else {
              lineWin = lineWin.slice(0, 1)
              break
            }
          }
          if(lineWin.length > 1) {
            return returnWinResult(checkingValue, lineWin)
          }
        }

        //check main-diagonal
        if (rowEnough && colEnough) {
          for(var nextDiag = 1; nextDiag < totalToWin; nextDiag++) {
            if (checkingValue === squares[
              (row + nextDiag)*size + col + nextDiag
            ]) {
              lineWin.push((row + nextDiag)*size + col + nextDiag)
            }
            else {
              lineWin = lineWin.slice(0, 1)
              break
            }
          }
          if(lineWin.length > 1) {
            return returnWinResult(checkingValue, lineWin)
          }
        }

        //check sub-diagonal
        if (rowEnough && (col - (totalToWin - 1)) >= 0) {
          for(var preDiag = 1; preDiag < totalToWin; preDiag++) {
            if (checkingValue === squares[
              (row + preDiag)*size + col - preDiag
            ]) {
              lineWin.push((row + preDiag)*size + col - preDiag)
            }
            else {
              lineWin = lineWin.slice(0, 1)
              break
            }
          }
          if(lineWin.length > 1) {
            return returnWinResult(checkingValue, lineWin)
          }
        }
      }
    }

    //check if draw
    const emptySquarePosition = squares.findIndex((square) => {
      return square === null || square === undefined
    })
    if (emptySquarePosition === -1) return {value: "draw."}

    //game not finished yet
    return null
  }

  handleClick(row, col) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const clickedIdKey = getIdKeyFromRowAndColumn(row, col, this.state.size)
    if (this.state.result || squares[clickedIdKey]) {
      return;
    }
    squares[clickedIdKey] = this.state.xIsNext ? "X" : "O"
    this.setState({
      history: history.concat([
        {
          squares: squares,
          row: row,
          col: col
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      result: this.calculateResult2(squares, this.state.size)
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      result: this.calculateResult2(
        this.state.history[step].squares, this.state.size
      )
    });
  }

  render() {
    const size = this.state.size;

    if (size**2 !== this.state.history[0].squares.length) {
      this.setState({
        history: [
          {
            squares: Array(size**2).fill(null),
            row: null,
            col: null
          }
        ],
        stepNumber: 0,
        xIsNext: true,
        result: null,
      })
    }

    const history = this.state.history;
    const current = history[this.state.stepNumber];

    var moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + " (row: " + step.row + ", column: " + step.col + ")":
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move===this.state.stepNumber ? <b>{desc}</b>: desc}
          </button>
        </li>
      );
    });

    if (this.state.listMoveReversed) moves.reverse()

    let status;
    let lineWin = []
    if (this.state.result) {
      status = "Result: " + this.state.result.value;
      lineWin = (this.state.result.lineWin ?? []).slice()
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    const nextSize = size===3 ? 5 : (size===5 ? 10 : 3)

    return (
      <div className="game">
        <div className="game-board">
          <Board
            sizeBoard={size}
            lineWin={lineWin}
            squares={current.squares}
            onClick={(row, col) => this.handleClick(row, col)}
          />
          <button className="toggle-size-btn" onClick={() => this.setState({
            size: nextSize,
          })}>
            {`${nextSize}x${nextSize} (${nextSize===3 ? 3 : 5} to win)`}
          </button>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
        <div>
          <button className="toggle-order-btn" onClick={() => this.setState({
            listMoveReversed: !this.state.listMoveReversed,
          })}>
            {this.state.listMoveReversed ? "Assending" : "Decending"}
          </button>
        </div>
      </div>
    );
  }
}

function getIdKeyFromRowAndColumn(row, col, size) {
  if (isNaN(row) || isNaN(col) || isNaN(size)) return null
  return row * size + col
}

// ==========================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
