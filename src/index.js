import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';

// for a team, let's show the score for the current game.

// first, let's pick a team id
// Stars = 25

// We need to keep track of the current score. Let's get and store the score

//
//
const idToTeamMap = {
  25: "Dallas Stars",
  20: "Calgary Flames",
};
//

// I'll create the tree bracket data structure on my own, and I'll have to update it I guess
// can proably do something really cool to have it update automatically, but for now I'll do it

// Go through each series, and pick a team. Query for their games since playoff start.
//   can we limit to games against the opponent?
//   can we limit to games over?
//   Go through all of the games and get who won each game.
// We can the record of ended games.
// If a game is live display it.
// If a game is not live, display the date of the next game.


const listOfSeries = [{team1: 25, team2: 20}];

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {games: {}}
  }

  render() {
    return (
      <div>
        <h1> Hello Claudole! </h1>
        <div>
          Series 1
        </div>
        <div>
          {idToTeamMap[listOfSeries[0].team1]} vs {idToTeamMap[listOfSeries[0].team2]}
        </div>
        <div>
          {this.state.games[listOfSeries[0].team1]} - {this.state.games[listOfSeries[0].team2]}
        </div>
      </div>
    );
  }

  getGames(series) {
    let team1Id = series.team1;
    let team2Id = series.team2;
    let games = {
      [team1Id]: 0,
      [team2Id]: 0,
      winner: null
    };

    fetch("https://statsapi.web.nhl.com/api/v1/schedule?teamId=" + team1Id + "&startDate=2020-08-11&endDate=2020-08-23")
      .then(res => res.json())
      .then(
        (result) => {
          result.dates.forEach((date, i) => {
            date.games.forEach((game, ii) => {
              let ended = game.status.abstractGameState == "Final";
              if (ended) {
                let awayTeamId = game.teams.away.team.id;
                let awayTeamScore = game.teams.away.score;

                let homeTeamId = game.teams.home.team.id;
                let homeTeamScore = game.teams.home.score;

                if (awayTeamScore > homeTeamScore) {
                  games[awayTeamId]++;
                } else {
                  games.[homeTeamId]++;
                }
              }
            });
          });

          // Is the series over? Who Won?
          if (games[team1Id] == 4) {
            games.winner = team1Id;
          } else if (games[team2Id] == 4) {
            games.winner = team2Id;
          }

          this.setState({
            ...this.state, games: games, result: result
          })
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }

  componentDidMount() {
    listOfSeries.forEach(series => {
      this.getGames(series);
      this.setState({
        isLoaded: true,
        items: null,
        homeScore: "sfsadf",
      })
    });
  }

  setPeriodTime(gameLink) {
    fetch("https://statsapi.web.nhl.com" + gameLink)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            period: result.liveData.linescore.currentPeriodOrdinal,
            timeRemaining: result.liveData.linescore.currentPeriodTimeRemaining
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
