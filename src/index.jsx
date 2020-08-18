import React, { useState, useEffect } from 'react';
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
      (result) => {
        return {
          period: result.liveData.linescore.currentPeriodOrdinal,
          timeRemaining: result.liveData.linescore.currentPeriodTimeRemaining,
          team1Goals: result.liveData.linescore.teams.home.goals,
          team2Goals: result.liveData.linescore.teams.away.goals,
        };
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        console.log('ERROR');
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
              currentSeries.gameLink = game.link
              // this.setLiveGame(game.link, seriesIndex);
              // this.timerIDs[seriesIndex] = setInterval(
              //   () => this.  setLiveGame(game.link, seriesIndex),
              //   10 * 1000,
              // );
            }
          });
        });

        // Is the series over? Who Won?
        if (currentSeries[team1Id] === 4) {
          currentSeries.winner = team1Id;
        } else if (currentSeries[team2Id] === 4) {
          currentSeries.winner = team2Id;
        }
        console.log('HERE');
        return currentSeries;
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        // setSeries(series);
        // setError(error);
        console.log('ERROR');
      },
    );
}

const useClock = (offset = 1, initialTime = new Date()) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    console.log("weird" + offset);
    const id = setInterval(() => {
      setTime(() => new Date());
    }, offset*1000);
    return () => clearInterval(id);
  }, []);

  return time;
}





// const useLiveTime = (gameLink) => {
//   const [period, setPeriod] = useState(new Date());

//   useEffect((gameLink) => {
//     console.log("period");
//     const id = setInterval(() => {
//       setPeriod(() => new Date());
//     }, 5000);
//     return () => clearInterval(id);
//   }, []);

//   return period;
// };

// function LiveGameTime(props) {
//   const liveTime = useLiveTime(""); // props.gameLink

//   return (
//     <div>
//       Period:
//       {liveTime.toLocaleTimeString()}
//     </div>
//   );
// }





const useGameScore = () => {
  let [series, setSeries] = useState([]);

  useEffect(() => {
    let promises = [];
    listOfSeries.forEach((seriesTeams) => {
      promises.push(getGames(seriesTeams));
    });
    Promise.all(promises).then((values) => {
      setSeries(values);
    });
  }, []);

  return series;
};

const Series = React.memo((props) => {
  // const series = useGameScore();
  // props - seriesNumber, team1Id, team2Id, team1Wins, team2Wins
  // the wins can most likely stay as props since we will rerender this component when the parent passes in new props - ie after the api call.

  // Not as efficient, but lets just have the live data coming in as a prop too, so the entire thing will rerender.

  // Let's make an effect here for making an

  let [liveGameData, setLiveGameData] = useState({});

  useEffect(() => {
    console.log("in effect: " + props.gameLink);
    if (props.gameLink) {
      getLiveGame(props.gameLink).then((value) => {
        setLiveGameData(value);
      });
    }
  }, [props.gameLink]);

  console.log("Rendering: " + props.seriesNumber + ", " + props.team1Wins);
  return (
    <div>
      <div>
        <span>
          <b>
            <span>Series </span>
            {props.seriesNumber + 1}
          </b>
        </span>
      </div>
      <div>
        {props.team1Name}
        <span> vs </span>
        {props.team2Name}
      </div>
      <div>
        {props.team1Wins}
        <span> - </span>
        {props.team2Wins}
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

function AllGames(props) {
  const series = useGameScore();

  // We need many components here, each showing the game score state.
  // Let's try storing the game link in state. The offset for getting the scores will
  //    change whenever teh game state changes.
  // We should make one component for displaying the game.

  // 3. Make an offset for the live data that changes whenever the gamelink changes. Need some code to basically do nothing if the game state doesn't exist, which will be the case
  //     the first time it renders. It will still happpen and not break rule, but won't do anything.
  // 4.

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

function ApplicationCache() {
  // let [error, setError] = useState("");
  // let [liveGames, setLiveGames] = useState({});
  // let [count, setCount] = useState(1);
  // let [count2, setCount2] = useState(1);

  // const time1 = useClock();
  // const time2 = useClock(2);

  // useEffect(() => {
  //   let promises = [];
  //   listOfSeries.forEach((seriesTeams) => {
  //     promises.push(getGames(seriesTeams));
  //   });
  //   Promise.all(promises).then((values) => {
  //     setSeries(values);
  //   });
  // }, []);

  return (
    <div>
      <h1> NHL Stanley Cup Playoff Standings </h1>
      {/* {time1.toLocaleTimeString()} */}
      <div></div>
      {/* {time2.toLocaleTimeString()} */}
      {/* <LiveGameTime /> */}
      <AllGames />
    </div>
  );
}

// class Home extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { series: [], liveGames: {} };
//     this.timerIDs = [];
//   }

//   componentDidMount() {
//     listOfSeries.forEach((seriesTeams, index) => {
//       this.getGames(seriesTeams, index);
//     });
//   }

//   componentWillUnmount() {
//     clearInterval(this.timerIDs);
//   }

//   setLiveGame(gameLink, seriesIndex) {
//     fetch(`https://statsapi.web.nhl.com${gameLink}`)
//       .then((res) => res.json())
//       .then(
//         (result) => {
//           const liveGame = {
//             period: result.liveData.linescore.currentPeriodOrdinal,
//             timeRemaining: result.liveData.linescore.currentPeriodTimeRemaining,
//             team1Goals: result.liveData.linescore.teams.home.goals,
//             team2Goals: result.liveData.linescore.teams.away.goals,
//           };

//           this.setState((state) => ({
//             ...state,
//             liveGames: {
//               ...state.liveGames,
//               [seriesIndex]: liveGame,
//             },
//           }));
//         },
//         // Note: it's important to handle errors here
//         // instead of a catch() block so that we don't swallow
//         // exceptions from actual bugs in components.
//         (error) => {
//           console.log('ERROR');
//           this.setState((state) => ({
//             ...state, error,
//           }));
//         },
//       );
//   }

//   render() {
//     const { series: games } = this.state;
//     const { liveGames } = this.state;

//     return (
//       <div>
//         <h1> NHL Stanley Cup Playoff Standings </h1>
//         {listOfSeries.map((series, i) => (
//           <div>
//             <div>
//               <b>Series</b>
//               {i + 1}
//             </div>
//             <div>
//               {idToTeamMap[listOfSeries[i].team1]}
//               <span> vs </span>
//               {idToTeamMap[listOfSeries[i].team2]}
//             </div>
//             <div>
//               {games[i] ? games[i][listOfSeries[i].team1] : null}
//               <span> - </span>
//               {games[i] ? games[i][listOfSeries[i].team2] : null}
//             </div>
//             {liveGames[i]
//             && (
//             <div>
//               *Live Game:
//               Period:
//               <span> </span>
//               {liveGames[i].period}
//               <span>, Time Remaining: </span>
//               {liveGames[i].timeRemaining}
//               <span>, Score: </span>
//               {liveGames[i].team1Goals}
//               <span> - </span>
//               {liveGames[i].team2Goals}
//             </div>
//             )}
//             <br />
//           </div>
//         ))}
//       </div>
//     );
//   }
// }

ReactDOM.render(<ApplicationCache key="1" />, document.getElementById('root'));
