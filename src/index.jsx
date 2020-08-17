import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';

const idToTeamMap = {
  25: 'Dallas Stars',
  20: 'Calgary Flames',
  54: 'Vegas Golden Knights',
  16: 'Arizona Chicago Blackhawks',
  21: 'Colorado Avalanche',
  53: 'Arizona Coyotes',
  19: 'St. Louis Blues',
  28: 'San Jose Sharks',
  4: 'Philidelphia Flyers',
  8: 'Montreal Canadiens',
  14: 'Tampa Bay Lightning',
  29: 'Columbus Blue Jackets',
  15: 'Washington Capitals',
  2: 'New York Islanders',
  6: 'Boston Bruins',
  12: 'Carolina Hurricanes',
};

// I'll create the tree bracket data structure on my own, and I'll have to update it I guess
// can proably do something really cool to have it update automatically, but for now I'll do it

// TODO: If a game is live display it. [untested]
// TODO: If a game is not live, display the date of the next game.
// TODO: Break down into components
// TODO: Hooks?
// TODO: Redux?
const listOfSeries = [
  // Vegas, chicago
  { team1: 54, team2: 16 },
  // Avalanche, Coyotes
  { team1: 21, team2: 53 },
  // Stars, glames
  { team1: 25, team2: 20 },
  // Blues, Sharks
  { team1: 19, team2: 28 },

  // Flyers, canadiens
  { team1: 4, team2: 8 },
  // Lightning, Columbus
  { team1: 14, team2: 29 },
  // Capitals, Islanders
  { team1: 15, team2: 2 },
  // Bruins, Hurricanes
  { team1: 6, team2: 12 },
];

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { games: [], liveGames: [] };
    this.timerIDs = [];
  }

  componentDidMount() {
    listOfSeries.forEach((series, index) => {
      this.getGames(series, index);
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerIDs);
  }

  getGames(series, seriesIndex) {
    const team1Id = series.team1;
    const team2Id = series.team2;
    const games = {
      [team1Id]: 0,
      [team2Id]: 0,
      winner: null,
    };

    fetch(`https://statsapi.web.nhl.com/api/v1/schedule?teamId=${team1Id}&startDate=2020-08-11&endDate=2020-08-23`)
      .then((res) => res.json())
      .then(
        (result) => {
          result.dates.forEach((date) => {
            date.games.forEach((game) => {
              const gameStatus = game.status.abstractGameState;
              if (gameStatus === 'Final') {
                const awayTeamId = game.teams.away.team.id;
                const awayTeamScore = game.teams.away.score;

                const homeTeamId = game.teams.home.team.id;
                const homeTeamScore = game.teams.home.score;

                if (awayTeamScore > homeTeamScore) {
                  games[awayTeamId] += 1;
                } else {
                  games[homeTeamId] += 1;
                }
              } else if (gameStatus === 'Live') {
                this.timerIDs[seriesIndex] = setInterval(
                  () => this.setLiveGame(game.link, seriesIndex),
                  1000,
                );
              }
            });
          });

          // Is the series over? Who Won?
          if (games[team1Id] === 4) {
            games.winner = team1Id;
          } else if (games[team2Id] === 4) {
            games.winner = team2Id;
          }

          this.setState((state) => ({
            ...state,
            games: [...state.games.slice(0, seriesIndex), games, ...state.games.slice(seriesIndex)],
          }));
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log('ERROR');
          this.setState((state) => ({
            ...state, error,
          }));
        },
      );
  }

  setLiveGame(gameLink, seriesIndex) {
    fetch(`https://statsapi.web.nhl.com${gameLink}`)
      .then((res) => res.json())
      .then(
        (result) => {
          const liveGame = {
            period: result.liveData.linescore.currentPeriodOrdinal,
            timeRemaining: result.liveData.linescore.currentPeriodTimeRemaining,
            team1Goals: result.liveData.linescore.teams.home.goals,
            team2Goals: result.liveData.linescore.teams.away.goals,
          };

          this.setState((state) => ({
            ...state,
            liveGames: [
              ...state.liveGames.slice(0, seriesIndex),
              liveGame,
              ...state.liveGames.slice(seriesIndex),
            ],
          }));
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log('ERROR');
          this.setState((state) => ({
            ...state, error,
          }));
        },
      );
  }

  render() {
    const { games } = this.state;

    return (
      <div>
        <h1> NHL Stanley Cup Playoff Standings </h1>
        {listOfSeries.map((series, i) => (
          <div>
            <div>
              Series
              {i + 1}
            </div>
            <div>
              {idToTeamMap[listOfSeries[i].team1]}
              vs
              {idToTeamMap[listOfSeries[i].team2]}
            </div>
            <div>
              {games[i] ? games[i][listOfSeries[i].team1] : null}
              -
              {games[i] ? games[i][listOfSeries[i].team2] : null}
            </div>
            {games[i] && games[i].live
            && (
            <div>
              Live Game:
              Period:
              {games[i].period}
              , Time Remaining:
              {games[i].timeRemaining}
              , Score:
              {games.team1Goals}
              -
              {games.team2Goals}
            </div>
            )}
            <br />
          </div>
        ))}
      </div>
    );
  }
}

ReactDOM.render(<Home key="1" />, document.getElementById('root'));