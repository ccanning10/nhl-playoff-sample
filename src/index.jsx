import PropTypes from 'prop-types'; // ES6
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

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

// Needs just a game's data. So we can create one

// I'll create the tree bracket data structure on my own, and I'll have to update it I guess
// can proably do something really cool to have it update automatically, but for now I'll do it

// TODO: If a game is not live, display the date of the next game.
// TODO: Hooks?
// TODO: actions + reducers
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

function getLiveGame(gameLink) {
  return fetch(`https://statsapi.web.nhl.com${gameLink}`)
    .then((res) => res.json())
    .then(
      (result) => ({
        period: result.liveData.linescore.currentPeriodOrdinal,
        timeRemaining: result.liveData.linescore.currentPeriodTimeRemaining,
        team1Goals: result.liveData.linescore.teams.home.goals,
        team2Goals: result.liveData.linescore.teams.away.goals,
      }),
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        console.log(`ERROR: ${error}`);
      },
    );
}

function getGames(seriesTeams) {
  const team1Id = seriesTeams.team1;
  const team2Id = seriesTeams.team2;
  const currentSeries = {
    [team1Id]: 0,
    [team2Id]: 0,
    winner: null,
  };

  return fetch(`https://statsapi.web.nhl.com/api/v1/schedule?teamId=${team1Id}&startDate=2020-08-11&endDate=2020-08-23`)
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
                currentSeries[awayTeamId] += 1;
              } else {
                currentSeries[homeTeamId] += 1;
              }
            } else if (gameStatus === 'Live') {
              currentSeries.gameLink = game.link;
            }
          });
        });

        // Is the series over? Who Won?
        if (currentSeries[team1Id] === 4) {
          currentSeries.winner = team1Id;
        } else if (currentSeries[team2Id] === 4) {
          currentSeries.winner = team2Id;
        }
        return currentSeries;
      },
      (error) => {
        console.log(`ERROR: ${error}`);
      },
    );
}

const useGameScore = () => {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    const promises = [];
    listOfSeries.forEach((seriesTeams) => {
      promises.push(getGames(seriesTeams));
    });
    Promise.all(promises).then((values) => {
      setSeries(values);
    });
  }, []);

  return series;
};

const Series = React.memo(({
  gameLink, seriesNumber, team1Wins,
  team2Wins, team1Name, team2Name,
}) => {
  const [liveGameData, setLiveGameData] = useState({});

  // Update the currently running games with live scores.
  useEffect(() => {
    console.log(`in effect: ${gameLink}`);
    // Do it once now
    if (gameLink) {
      getLiveGame(gameLink).then((value) => {
        setLiveGameData(value);
      });
    }
    // Set up an interval every 10 seconds to update the score.
    const id = setInterval(() => {
      if (gameLink) {
        getLiveGame(gameLink).then((value) => {
          setLiveGameData(value);
        });
      }
    }, 10 * 1000);
    return () => clearInterval(id);
  }, [gameLink]);

  console.log(`Rendering: ${seriesNumber}, ${team1Wins}`);
  return (
    <div>
      <div>
        <span>
          <b>
            <span>Series </span>
            {seriesNumber + 1}
          </b>
        </span>
      </div>
      <div>
        {team1Name}
        <span> vs </span>
        {team2Name}
      </div>
      <div>
        {team1Wins}
        <span> - </span>
        {team2Wins}
      </div>
      {liveGameData.period && (
        <div>
          *Live Game:
          Period:
          <span> </span>
          {liveGameData.period}
          <span>, Time Remaining: </span>
          {liveGameData.timeRemaining}
          <span>, Score: </span>
          {liveGameData.team1Goals}
          <span> - </span>
          {liveGameData.team2Goals}
        </div>
      )}
      <br />
    </div>
  );
});
Series.propTypes = {
  gameLink: PropTypes.string,
  seriesNumber: PropTypes.number.isRequired,
  team1Wins: PropTypes.number,
  team2Wins: PropTypes.number,
  team1Name: PropTypes.string,
  team2Name: PropTypes.string,
};
Series.defaultProps = {
  gameLink: null,
  team1Wins: null,
  team2Wins: null,
  team1Name: null,
  team2Name: null,
};

function AllSeries() {
  const series = useGameScore();

  return (
    <div>
      {listOfSeries.map((seriesTeams, i) => (
        <Series
          seriesNumber={i}
          team1Name={idToTeamMap[listOfSeries[i].team1]}
          team2Name={idToTeamMap[listOfSeries[i].team2]}
          team1Wins={series[i] ? series[i][listOfSeries[i].team1] : null}
          team2Wins={series[i] ? series[i][listOfSeries[i].team2] : null}
          gameLink={series[i] ? series[i].gameLink : null}
        />
      ))}
    </div>
  );
}

function NHLPlayoffSeries() {
  return (
    <div>
      <h1> NHL Stanley Cup Playoff Standings </h1>
      <AllSeries />
    </div>
  );
}

ReactDOM.render(<NHLPlayoffSeries key="1" />, document.getElementById('root'));
