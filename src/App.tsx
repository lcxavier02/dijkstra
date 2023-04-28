import { makeStyles, Paper, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import PathfindingVisualizer from './components/PathfindingVisualizer';
import useWindowSize from './hooks/useWindowSize';
import start from './assets/icons8-arrow-20.png';
import end from './assets/icons8-accuracy-20.png';

const useStyles = makeStyles((theme) => ({
  paper: {
    flexGrow: 1,
    maxWidth: 1000,
    margin: "30px auto",
    padding: `20px ${theme.spacing(5)}px`,
    textAlign: 'center',
  },
  wall: {
    color: 'black',
    fontWeight: 'bold',
  },
}));

function App() {
  const classes = useStyles();

  const { width, height } = useWindowSize()
  const nodeSize = 12;
  const [nRows, setnRows] = useState(0);
  const [nCols, setnCols] = useState(0);

  useEffect(() => {
    if (width === undefined || height === undefined) {
      console.log('Device undefined')
    } else if (width >= 700) {
      console.log('Device PC')
      setnRows(Math.trunc(height / nodeSize * 0.6))
      setnCols(Math.min(Math.trunc(width / nodeSize * 0.7), 50))
    } else {
      console.log('Device SmartPhone')
      setnRows(Math.trunc(height / nodeSize * 0.7))
      setnCols(Math.trunc(width / nodeSize * 0.9))
    }
  }, [width, height])

  console.log(`[w: ${width}, h: ${height}], [rows: ${nRows}, cols: ${nCols}]`)

  return (
    <Paper elevation={5} className={classes.paper}>
      <h1>Dijkstra</h1>
      <Typography variant="body1" gutterBottom>
        Drag trough the grid to create a <span className={classes.wall}>WALL</span><br />
        Drag <img src={start} alt='' /> and <img src={end} alt=''/>
      </Typography>
      {/* need key to force re-render https://stackoverflow.com/questions/38892672 */}
      <PathfindingVisualizer key={nRows} nRows={nRows} nCols={nCols} />
    </Paper >
  );
}

export default App;
