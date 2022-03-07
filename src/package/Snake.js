import React from 'react';
import './Snake.css';

export default class Snake extends React.Component{
  constructor(props){
    super(props);

    this.startGame = this.startGame.bind(this);
    this.control = this.control.bind(this);
    
    this.state = {
      gridWidth: 10,
      snake: [2, 1, 0], 
      appleIndex: 0,
      speedIncreaseFactor: 0.95,
      score: 0,
      highscore: Number(localStorage.getItem("snakeHighscore")) || 0,
      newHighscore: false,
      direction: 1, //right
      gameover: false,
      gameIsOn: false,
      intervalTime: 700,   
      timeoutId: 0, 
      squares: [] 
    };
  };

  componentDidMount(){
    window.addEventListener('keyup', this.control);
  };

  componentWillUnmount(){
    window.removeEventListener('keyup', this.control);
    clearTimeout(this.state.timeoutId);
  };

  //methods

  createDefaultSquares(){
    let squares = this.state.squares;
    let snake = this.state.snake;
    let gridWidth = this.state.gridWidth;
    //create 100 objects with a for loop
    for (let i=0; i < gridWidth * gridWidth; i++) {
      const square = {isSnake: false, isApple: false};
      squares.push(square);
    };
    //update the squares which are snake
    snake.forEach((index) => {squares[index].isSnake = true});
    this.setState({squares});
  };

  startGame(){
    if(this.state.gameover || this.state.gameIsOn){
      this.resetGame();
      setTimeout(() => this.startGame(), 100);
    } else {
      this.createDefaultSquares();
      this.createApple();
      this.gameInterval();
      this.setState({gameIsOn: true})
    };
  };

  resetGame(){
    let snake = this.state.snake;
    let score = this.state.score;
    let direction = this.state.direction;
    let gameover = this.state.gameover;
    let gameIsOn = this.state.gameIsOn;
    let newHighscore = this.state.newHighscore;
    let intervalTime = this.state.intervalTime;
    let squares = this.state.squares;
    snake = [2,1,0];
    score = 0;
    direction = 1;
    gameover = false;
    gameIsOn = false;
    newHighscore = false;
    intervalTime = 700;
    squares = [];
    this.setState({
      snake,
      score,
      direction,
      gameover,
      gameIsOn,
      newHighscore,
      intervalTime,
      squares
    });
    clearTimeout(this.state.timeoutId);
  };
  
  createApple(){ 
    let squares = this.state.squares;
    let appleIndex = this.state.appleIndex;
    let snake = this.state.snake;
    do { 
      appleIndex = Math.floor(Math.random() * squares.length);
    } while (
      snake.some((number) => {return number === appleIndex}) 
    );
    //set the index to apple is true
    squares[appleIndex].isApple = true;
    this.setState({squares, appleIndex});
  };

  gameInterval(){
    if(!this.state.gameover){
      let timeoutId = setTimeout(() => {
        this.move();
        this.updateSquares(); 
        this.gameInterval();
      }, this.state.intervalTime);
      this.setState({timeoutId});
    };
  };

  control(e, button){
    let gridWidth = this.state.gridWidth;
    let direction = this.state.direction;
    let snake = this.state.snake;
    if ((e.keyCode === 39 || button === "right") && direction !== -1 && snake[0] - direction === snake[1]) { 
        this.setState({direction: 1});
    } else if ((e.keyCode === 38 || button === "up") && direction !== gridWidth && snake[0] - direction === snake[1]) {
        this.setState({direction: -gridWidth});
    } else if ((e.keyCode === 37 || button === "left") && direction !== 1 && snake[0] - direction === snake[1]) {
        this.setState({direction: -1});
    } else if ((e.keyCode === 40 || button === "down") && direction !== -gridWidth && snake[0] - direction === snake[1]) {
        this.setState({direction: gridWidth});
    };
  };

  move(){
    let snake = this.state.snake;
    let gridWidth = this.state.gridWidth;
    let direction = this.state.direction;
    let squares = this.state.squares;
    let gameover = this.state.gameover;
    let score = this.state.score;
    let highscore = this.state.highscore;
    let newHighscore = this.state.newHighscore;
    let intervalTime = this.state.intervalTime;
    let speedIncreaseFactor = this.state.speedIncreaseFactor;
    
    if ( //define the unvalid moves
        (snake[0] + gridWidth >= gridWidth*gridWidth && direction === gridWidth) || //if snake has hit bottom
        (snake[0] % gridWidth === gridWidth-1 && direction === 1) || //if snake has hit right wall
        (snake[0] % gridWidth === 0 && direction === -1) || //if snake has hit left wall
        (snake[0] - gridWidth < 0 && direction === -gridWidth) || //if snake has hit top
        squares[snake[0] + direction].isSnake //if snake eats itself
    ) {
        gameover = true;
    } else {
      //remove last item from snake and store it for growing
      const tail = snake.pop();
      //add item in direction snake is heading
      snake.unshift(snake[0] + direction);
      //snake gets apple
      if (squares[snake[0]].isApple) {
        //grow snake
        snake.push(tail);
        //create new apple
        this.createApple();
        //add score
        score++;
        //check for highscore
        if(score > highscore){
          highscore = score;
          newHighscore = true;
          localStorage.setItem("snakeHighscore", score);
        };
        //speed up the snake
        intervalTime = intervalTime * speedIncreaseFactor;
      };
    };
    this.setState({
      snake,
      gameover,
      score,
      highscore,
      newHighscore,
      intervalTime
    });
  };

  updateSquares(){
    let gridWidth = this.state.gridWidth;
    let snake = this.state.snake;
    let appleIndex = this.state.appleIndex;
    let squares = this.state.squares;
    squares = [];
    for (let i=0; i < gridWidth * gridWidth; i++) {
      const square = {isSnake: false, isApple: false};
      squares.push(square);
    };
    snake.forEach((index) => {squares[index].isSnake = true});
    squares[appleIndex].isApple = true;
    this.setState({squares});
  };

  render(){

    function createElements(obj){
      if(obj.isSnake === true){
        return React.createElement(
          'div',
          {className: 'square snake'}
        );
      } else if (obj.isApple === true){
        return React.createElement(
          'div',
          {className: 'square apple'}
        );
      } else {
        return React.createElement(
          'div',
          {className: 'square'}
        );
      };
    };

    //returning state for further implementations if invoked as <Snake sendGameData={getGameData}/>
    if(this.props.sendGameData){
      this.props.sendGameData(this.state);
    };

    return (
      <div className="snake__app">
          <div className="background-container">
            <div className="handheld-container">
                <h1>Jungle Snake</h1>
                <div className="grid">
                  {this.state.squares.map(createElements)}
                  <div className={this.state.gameover? "grid_overlay" : "grid_overlay_hidden"}>
                    <h2> -GAME OVER- </h2>
                    <h2>Highscore: {this.state.highscore}</h2>
                    <p>{this.state.newHighscore? "...that's a new highscore!" : "Tipp: You can also use the arrow keys to play"}</p>
                  </div>
                </div>
                <div className="control-pad">
                  <div className="score">Score: {this.state.score < 10? "0": ""}{this.state.score} </div>
                  <div className="arrow up" onClick={(event) => this.control(event, "up")}></div>
                  <div className="arrow down" onClick={(event) => this.control(event, "down")}></div>
                  <div className="arrow left" onClick={(event) => this.control(event, "left")}></div>
                  <div className="arrow right" onClick={(event) => this.control(event, "right")}></div>
                  <div className="start-btn" onClick={this.startGame}>Start Game</div>
                </div>
            </div>
          </div>
      </div>
    );
  };
};

//{(this.state.gameover && this.state.newHighscore) && <Confetti />}