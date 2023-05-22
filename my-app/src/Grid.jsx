import React, {useState, useEffect, useRef} from 'react';
import './Grid.css';

const GRIDSIZE = 20;

class LinkedList {
    constructor(list){
        const node = new LinkedListNode(list);
        this.head = node;
        this.tail = node;
    }
}

class LinkedListNode{
    constructor(node){
        this.node = node;
        this.next = null;
    }
}

const useInterval = (callback, delay) =>{
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
}

const Grid = () =>{
const [score, newScore] = useState(0);
const [grid, modGrid] = useState(genGrid(GRIDSIZE));
const [snake, growSnake] = useState(new LinkedList(getFirstSnakeCell(grid)));
const [direction, changeDirection] = useState("ArrowRight");
const [snakeCells, setSnakeCells] = useState(new Set([snake.head.node.cell]));
const [foodCell, setFood] = useState(grid[9][14]);
const mySnakeCells = useRef(snakeCells);
const myDirection = useRef(direction);

useEffect(() => {
    window.addEventListener('keydown', e => {
        changeDir(e);
        console.log(myDirection.current);
        console.log(mySnakeCells.current.size);
    });
}, []);

useInterval(() => {
    moveSnake();
    mySnakeCells.current = snakeCells;
}, 150);

const moveSnake = () =>{
    const newHeadCoords = getNewHead(snake.head, myDirection.current, grid);
    
    if (!isValidMove(newHeadCoords, mySnakeCells.current, grid, snake)) {
        endGame(); 
        return;
    }
    const newHead = new LinkedListNode({
        row: newHeadCoords.row,
        column: newHeadCoords.column,
        cell: grid[newHeadCoords.row][newHeadCoords.column]
    });
    if (newHead.node.cell === foodCell){
        addSnakeCell();
    }else {
    newHead.next = snake.head; 
    snake.head = newHead;
    const snakedCells = new Set(snakeCells);
    snakedCells.delete(snake.tail.node.cell);
    snakedCells.add(snake.head.node.cell);
    setSnakeCells(snakedCells);
    let mockTail = snake.head;
    while(mockTail.next !== snake.tail) mockTail = mockTail.next;
    snake.tail = mockTail;
    }
}

const addSnakeCell = () =>{
    const newHeadCoords = getNewHead(snake.head, myDirection.current, grid);
    const newHead = new LinkedListNode({
        row: newHeadCoords.row,
        column: newHeadCoords.column,
        cell: grid[newHeadCoords.row][newHeadCoords.column]
    });

    if (!isValidMove(newHeadCoords, snakeCells, grid)) return;
    const newSnakeCells = new Set(snakeCells);
    newHead.next = snake.head;
    snake.head = newHead;
    newSnakeCells.add(snake.head.node.cell);
    setSnakeCells(newSnakeCells);
    newScore(score + 1);
    newFood();
}

const newFood = () =>{
    let foodX = Math.floor(Math.random() * (20));
    let foodY = Math.floor(Math.random() * (20));
    while (snakeCells.has(grid[foodX][foodY]) || foodCell === grid[foodX][foodY]){
        foodX = Math.floor(Math.random() * (20));
        foodY = Math.floor(Math.random() * (20));
    }
    setFood(grid[foodX][foodY]);
}

const changeDir = e =>{
    let newDir = e.key;
    if (newDir === "ArrowUp" && myDirection.current === "ArrowDown" && mySnakeCells.current.size > 1){
        changeDirection("ArrowDown");
        myDirection.current = "ArrowDown";
    }else if (newDir === "ArrowDown" && myDirection.current === "ArrowUp" && mySnakeCells.current.size > 1){
        changeDirection("ArrowUp");
        myDirection.current = "ArrowUp";
    }else if (newDir === "ArrowRight" && myDirection.current === "ArrowLeft" && mySnakeCells.current.size > 1){
        changeDirection("ArrowLeft");
        myDirection.current = "ArrowLeft";
    }else if (newDir === "ArrowLeft" && myDirection.current === "ArrowRight" && mySnakeCells.current.size > 1){
        changeDirection("ArrowRight");
        myDirection.current = "ArrowRight";
    }else if (newDir !== "ArrowUp" && newDir !== "ArrowDown" && newDir !== "ArrowLeft" && newDir !== "ArrowRight"){
        return;
    }else{
        changeDirection(newDir);
        myDirection.current = newDir;
    }
}

const endGame = () =>{
    newScore(0);
    growSnake(new LinkedList(getFirstSnakeCell(grid)));
    setSnakeCells(new Set([grid[9][5]]));
    setFood(grid[9][14]);
    changeDirection("ArrowRight");
    myDirection.current = "ArrowRight";
}

    return (
        <>
    <h2 className="score">Score: {score}</h2>
      <div className="grid">
        {grid.map((row, rowId) => (
          <div key={rowId} className="row">
            {row.map((cell, cellId) => {
                const color = cellType(cell, snakeCells, foodCell);
              return <div key={cellId} className={color}></div>;
            })}
          </div>
        ))}
      </div>
    </>
    );
};

const isValidMove = (newHead, snakeCells, grid, snake) =>{
    if (newHead.row < 0 || newHead.row > 19 || newHead.column < 0 || newHead.column > 19) return false;
    if (snakeCells.has(grid[newHead.row][newHead.column]) && snake.tail.node.cell !== grid[newHead.row][newHead.column] && snakeCells.size > 1) return false;
    return true;
}

const getNewHead = (head, direction, grid) =>{
    if (direction === "ArrowDown"){
        return {row: head.node.row + 1, column: head.node.column};
    }else if (direction === "ArrowUp"){
        return {row : head.node.row - 1, column: head.node.column};
    }else if  (direction === "ArrowLeft"){
        return {row: head.node.row, column: head.node.column - 1};
    }else if (direction === "ArrowRight"){
        return {row: head.node.row, column: head.node.column + 1};
    }
}
const cellType = (cell, snakeCells, foodCell) =>{
    let type = 'cell';
    if (cell === foodCell){
        type = 'cell cell-red';
    }
    if (snakeCells.has(cell)){
        type = 'cell cell-green';
    }
    return type;
}

const getFirstSnakeCell = grid =>{
    const row = 9;
    const column = 5;
    const startCell = grid[row][column];
    return {
        row: row,
        column: column,
        cell: startCell
    };
};

const genGrid = size =>{
    let n = 0;
    const grid = [];
    for (let i = 0; i < size; i++){
        const row = [];
        for  (let j = 0; j < size; j++){
            row.push(n++);
        }
        grid.push(row);
    }
    return grid;
}

export default Grid;