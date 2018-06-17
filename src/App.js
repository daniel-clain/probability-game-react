import React, { Component } from 'react';
import './App.css';

class App extends Component {

  state = {
    points: 0,
    currentRound: 0,
    roundOptions: [],
    selectedOption: null,
    isGameActive: false
  }

  numberOfRounds = 8;
  timePerOption = 2000;

  constructor(){
    super()
    this.startRound = this.startRound.bind(this);
  }


  startRound(){
    this.setupThisRound()
    .then(() => this.waitUntilEndOfRound())
    .then(() => {
      this.resolveEndOfRound()
      this.state.currentRound < this.numberOfRounds ? this.nextRound() : this.endGame()
    })
  }

  nextRound(){
    this.setState({roundOptions: []})
    this.waitForNextRound()
    .then(this.startRound)
  }

  endGame(){
    this.setState({
      isGameActive: false,
      currentRound: 0
    })
    console.log('end game')
  }

  setupThisRound(){
    return new Promise(resolve =>
      this.setState(ps =>
        ({
          currentRound: ps.currentRound += 1,
          roundOptions: this.getRoundOptions()
        }), resolve()
      )
    )
  }

  resolveEndOfRound(){
    if(this.state.selectedOption != null) {
      const randomNumber = Math.floor(Math.random()*100 + 1)
      if(randomNumber <= this.state.roundOptions[this.state.selectedOption].percentageSuccessChance) {
        this.setState(ps => ({points: ps.points += this.state.roundOptions[this.state.selectedOption].successPoints}))
      } else {
        this.setState(ps => ({points: ps.points += this.state.roundOptions[this.state.selectedOption].failPoints}))
      }
    } else {
      this.setState(ps => ({points: ps.points += -5}))
    }
    this.setState({selectedOption: null})
    this.forceUpdate()
  }

  waitUntilEndOfRound(){
    const numberOfOptions = this.state.roundOptions.length
    return new Promise(resolve => setTimeout(resolve, this.timePerOption * numberOfOptions))
  }
  waitForNextRound(){
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  determineDecidedPercentage(optionsChanceObj){
    const chancesTotalled = optionsChanceObj.reduce(
      (runningTotal, option) => runningTotal += option.chance, 0);
    if(chancesTotalled !== 100)
      throw new Error(`options % chance total ${chancesTotalled}`);

    const randomNumber = Math.floor(Math.random()*100 + 1);

    for(let i = 0; i < optionsChanceObj.length; i++){
      const base = optionsChanceObj
      .slice(0, i)
      .reduce((chanceSum, option) => chanceSum += option.chance, 0);

      const basePlusChance = base + optionsChanceObj[i].chance;

      if(randomNumber > base && randomNumber <= basePlusChance){
        return optionsChanceObj[i];
      }
    }

  }

  getRoundOptions(){
    const chanceForNumberOfOptions = [
      { options: 2, chance: 15 },
      { options: 3, chance: 70 },
      { options: 4, chance: 10 },
      { options: 5, chance: 4 },
      { options: 6, chance: 1 }
    ]

    const decidedNumberOfOptions = this.determineDecidedPercentage(chanceForNumberOfOptions).options

    const randomOptions = [];

    for(let i = 0; i < decidedNumberOfOptions; i++){
      randomOptions.push({
        percentageSuccessChance: this.getRandomSuccessChance(),
        successPoints: this.getRandomSuccessPoints(),
        failPoints: this.getRandomFailPoints()
      })
    }
    return randomOptions;
  }

  getRandomSuccessChance(){
    const posibilites = [40, 60, 70, 80, 90]
    const randomPosibility = Math.floor(Math.random()*posibilites.length)
    return posibilites[randomPosibility]
  }

  getRandomSuccessPoints(){
    const posibilites = [1, 10, 20, 50, 90]
    const randomPosibility = Math.floor(Math.random()*posibilites.length)
    return posibilites[randomPosibility]
  }

  getRandomFailPoints(){
    const posibilites = [ -5, -20, -60]
    const randomPosibility = Math.floor(Math.random()*posibilites.length)
    return posibilites[randomPosibility]
  }

  render() {

    const startGame = () => this.setState({
        isGameActive: true,
        points: 0
      }, this.startRound())


    const selectOption = option => this.setState({selectedOption: option})


    return (
      <div className="App">
        {
          !this.state.isGameActive &&
          <button onClick={startGame}>Start Game</button>
        }
        {
          (this.state.points || this.state.isGameActive) &&
          <h2>Points: {this.state.points}</h2>
        }
        {
          this.state.isGameActive && !!this.state.roundOptions.length &&
          <div className="roundContainer">
            <h3>Round: {this.state.currentRound} of {this.numberOfRounds}</h3>
            <div className="roundTimerBar">
              <div className="timeLeft" style={{animationDuration: this.state.roundOptions.length*2+'s'}}></div>
            </div>
            <div className="optionsContainer">
              {
                this.state.roundOptions.map((option, index) => {
                return (
                  <div key={index} className={(this.state.selectedOption === index) ? 'selected' : null}>
                    <h3>Option {index + 1}</h3>
                    <div>Success Chance: {option.percentageSuccessChance}</div>
                    <div>Success Points: {option.successPoints}</div>
                    <div>Fail Points: {option.failPoints}</div>
                    <button onClick={() => selectOption(index)}>Select Option {index + 1}</button>
                  </div>
                )})
              }
            </div>
          </div>
        }

      </div>
    );
  }
}

export default App;
