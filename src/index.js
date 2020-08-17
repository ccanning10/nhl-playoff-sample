import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';

const idToTeamMap = {
  25: "Dallas Stars",
  20: "Calgary Flames",
  54: "Vegas Golden Knights",
  16: "Arizona Chicago Blackhawks",
  21: "Colorado Avalanche",
  53: "Arizona Coyotes",
  19: "St. Louis Blues",
  28: "San Jose Sharks",
  4: "Philidelphia Flyers",
  8: "Montreal Canadiens",
  14: "Tampa Bay Lightning",
  29: "Columbus Blue Jackets",
  15: "Washington Capitals",
  2: "New York Islanders",
  6: "Boston Bruins",
  12: "Carolina Hurricanes",
};

// I'll create the tree bracket data structure on my own, and I'll have to update it I guess
// can proably do something really cool to have it update automatically, but for now I'll do it

// TODO: If a game is live display it.
// TODO: If a game is not live, display the date of the next game.
// TODO: Break down into components
// TODO: Hooks?
// TODO: Redux?

const listOfSeries = [
  // Vegas, chicago
  {team1: 54, team2: 16},
  // Avalanche, Coyotes
  {team1: 21, team2: 53},
  // Stars, glames
  {team1: 25, team2: 20},
  // Blues, Sharks
  {team1: 19, team2: 28},

  //Flyers, canadiens
  {team1: 4, team2: 8},
  //Lightning, Columbus
  {team1: 14, team2: 29},
  // Capitals, Islanders
  {team1: 15, team2: 2},
  // Bruins, Hurricanes
  {team1: 6, team2: 12},
];

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {games: []}
  }

  render() {
    return (
      <div>
        <h1> NHL Stanley Cup Playoff Standings </h1>
        {listOfSeries.map((series, i) => (
          <div>
            <div>
              Series {i+1}
            </div>
            <div>
              {idToTeamMap[listOfSeries[i].team1]} vs {idToTeamMap[listOfSeries[i].team2]}
            </div>
            <div>
              {this.state.games[i] ? this.state.games[i][listOfSeries[i].team1] : null} - {this.state.games[i] ? this.state.games[i][listOfSeries[i].team2] : null}
            </div>
            <br />
          </div>
        ))}
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
              let gameStatus = game.status.abstractGameState;
              if (gameStatus == "Final") {
                let awayTeamId = game.teams.away.team.id;
                let awayTeamScore = game.teams.away.score;

                let homeTeamId = game.teams.home.team.id;
                let homeTeamScore = game.teams.home.score;

                if (awayTeamScore > homeTeamScore) {
                  games[awayTeamId]++;
                } else {
                  games.[homeTeamId]++;
                }
              } else if (gameStatus == "Live") {
                let gameLink = game.link;
              }
            });
          });

          // Is the series over? Who Won?
          if (games[team1Id] == 4) {
            games.winner = team1Id;
          } else if (games[team2Id] == 4) {
            games.winner = team2Id;
          }

          this.setState((state) => ({
            ...state, games: this.state.games.concat([games]),
            // result: result
          }));
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState((state) => ({
            ...state, error: error
          }));
        }
      );
  }

  componentDidMount() {
    listOfSeries.forEach(series => {
      this.getGames(series);
    });
  }

  setPeriodTime(gameLink) {
    fetch("https://statsapi.web.nhl.com" + gameLink)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState((state) => ({
            ...state,
            period: result.liveData.linescore.currentPeriodOrdinal,
            timeRemaining: result.liveData.linescore.currentPeriodTimeRemaining
          }));
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState((state) => ({
            ...state, error: error
          }));
        }
      )
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
