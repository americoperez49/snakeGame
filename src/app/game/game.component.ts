import { Component, HostListener, OnInit } from '@angular/core';
import { empty } from 'rxjs';

export class SnakePart {
  x: number;
  y: number

  constructor (x:number,y:number){
    this.x = x;
    this.y = y;
  }
}

export enum gridStates{
  empty,
  snake,
  apple,
}

export enum direction{
  up,
  down,
  left,
  right
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  rows = 12; //Grid rows
  columns = 12; // Grid columns
  grid: Number[][]; //abtraction of the game board. Each cell represents a cell on the game grid
  snake: SnakePart[]; //abtraction of the snake. Each cell represents a part of the snake
  gameHasStarted:Boolean=false;
  playerLost:boolean = false
  currentDirection:direction | undefined
  nextDirection:direction | undefined
  score:number  = 0
  timeInterval:number = 500

  gameClock:ReturnType<typeof setInterval> | undefined;



  constructor() { 
    this.grid = []
    this.snake = [];
  }

  ngOnInit(): void {
    this.createGameBoard();

    this.addTheSnakeToTheGame();

   this.addAppleToTheGame();

  }

  //create the game intial board
  createGameBoard(){
    for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
      let newColumn = []
      for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
        newColumn.push(gridStates.empty);
      }
      this.grid.push(newColumn)
    }
    console.log()
  }

  //add the snake's head to the game board
  addTheSnakeToTheGame(){
    let x = this.randomIntFromInterval(0,9)
    let y = this.randomIntFromInterval(0,9)

    let currentSnakeHead = new SnakePart(x,y)
    this.snake.push(currentSnakeHead);
    this.grid[y][x] = gridStates.snake;
  }

  //add the apple to the gameboard
  addAppleToTheGame(){
    let xCoordinate = this.randomIntFromInterval(0,9)
    let yCoordinate = this.randomIntFromInterval(0,9)

    let foundSnakeParts = this.snake.filter((snakePart:SnakePart)=>{
      if (snakePart.x == xCoordinate && snakePart.y == yCoordinate) {
        return snakePart
      }
      else return
    })

    if (foundSnakeParts.length >0){
      this.addAppleToTheGame()
    }

    else{
      this.grid[yCoordinate][xCoordinate] = gridStates.apple
    }

  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {

    if (this.gameHasStarted){
      let previous = this.nextDirection
      let next = this.getDirection(event)
      if (next== direction.up && previous != direction.down){
        this.nextDirection = this.getDirection(event)
      }
      if (next== direction.down && previous != direction.up){
        this.nextDirection = this.getDirection(event)
      }
      if (next== direction.left && previous != direction.right){
        this.nextDirection = this.getDirection(event)
      }
      if(next== direction.right && previous != direction.left){
        this.nextDirection = this.getDirection(event)
      }
    }
    else{
      this.nextDirection = this.getDirection(event)
      this.gameHasStarted = true;
      this.mainGameLoop()
    }
    // if (event.key) {
    //   console.log(event)
    // }

    // if (event.keyCode === KEY_CODE.LEFT_ARROW) {
    //   console.log()
    // }
  }

   //Main Game Loop
   mainGameLoop(){

    //TODO setUpdate Interval
    this.gameClock = setTimeout(()=>{
      if (!this.playerLost)
      this.moveSnake()
      this.checkForLoseCondition()
      if (!this.playerLost){

        this.mainGameLoop()
      }
    },this.timeInterval)


    //TODO render
    //This will probably be done automagially by angular
  }

  moveSnake(){
    if (this.nextDirection == direction.up && this.currentDirection != direction.down){
      this.move(0,-1)
    }
    if (this.nextDirection == direction.down && this.currentDirection != direction.up){
      this.move(0,1)
    }
    if (this.nextDirection == direction.left && this.currentDirection != direction.right){
      this.move(-1,0)
    }
    if(this.nextDirection == direction.right && this.currentDirection != direction.left){
      this.move(1,0)
    }
    this.currentDirection = this.nextDirection
  }

  move(xDirection:number, yDirection:number){
    let currentSnakeTail = this.snake[this.snake.length-1]
    let currentSnakeHead = this.snake[0];
    let newSnakeHead = new SnakePart(currentSnakeHead!.x+xDirection, currentSnakeHead!.y+yDirection)
    if (newSnakeHead.x <0 || newSnakeHead.x > this.columns -1 || newSnakeHead.y <0 || newSnakeHead.y > this.rows-1){
      this.playerLost = true
      return
    }

    //is the next grid cell a snake
    if (this.grid[newSnakeHead!.y][newSnakeHead!.x] == gridStates.snake){
      this.playerLost = true
     return
    }

    //is the next grid cell an apple
    if (this.grid[newSnakeHead!.y][newSnakeHead!.x] == gridStates.apple){
      this.grid[newSnakeHead!.y][newSnakeHead!.x] = gridStates.snake
      this.snake.unshift(newSnakeHead);
      this.addAppleToTheGame()
      this.score+=1
      this.checkIfSpeedShouldIncrease()
      return 
    }

    //is the next rid cell empty
    if (this.grid[newSnakeHead!.y][newSnakeHead!.x] == gridStates.empty){
      this.grid[newSnakeHead!.y][newSnakeHead!.x] = gridStates.snake
      this.snake.unshift(newSnakeHead);

      this.grid[currentSnakeTail!.y][currentSnakeTail!.x] = gridStates.empty
      this.snake.pop()
      return 
    }
  }

 

  getDirection(event:KeyboardEvent){
    if (event.code === "ArrowUp"){
      return direction.up;
    }
    else if (event.code === "ArrowDown"){
      return direction.down;
    }
    else if (event.code === "ArrowLeft"){
      return direction.left;
    }

    else {
      return direction.right;
    }
  }

  checkForLoseCondition(){
    if (this.playerLost){
      console.log('player lost')
      clearInterval(this.gameClock)
    }
    //did we eat ourselves

    //did we hit a wall
  }

  checkIfSpeedShouldIncrease(){
    if (this.score % 5 == 0){
      this.timeInterval -= 50
      console.log(this.timeInterval)
    }
  }

  //Random Number generator
  randomIntFromInterval(min:number, max:number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  getStyles() {
    return {
      display: 'grid',
      'grid-template-columns': `repeat(${this.columns}, 75px)`,
      'grid-template-rows': `repeat(${this.rows}, 75px)`,
      'justify-items': 'center',
      'align-items': 'center'
    };
  }

}
