import { Button, makeStyles, Theme } from '@material-ui/core';
import React, { createRef, RefObject, useEffect, useState } from 'react';
import { backtrackToStart, Dijkstra } from '../algorithms/Dijkstra';
import { NodeType } from '../algorithms/NodeType';
import { Vertex } from '../algorithms/Vertex';
import useMouseEventHandlers from '../hooks/useMouseEventHandlers';
import { Coordinates } from './Coordinates';
import Node from './Node';

const useStyles = makeStyles<Theme, Props>((theme) => ({
  container: props => ({
    display: 'grid',
    gridTemplateRows: `repeat(${props.nRows}, 20px)`,
    gridTemplateColumns: `repeat(${props.nCols}, 20px)`,
    justifyContent: 'center',
    margin: '20px auto',
    // stop scroll in grid from smartphone
    // equivalent to e.preventDefault() plus addEventListener passive false
    // https://www.little-cuckoo.jp/entry/2020/06/09/123000
    touchAction: 'none',
  }),
  visited: {
    backgroundColor: '#0092C5'
  },
  shortestPath: {
    backgroundColor: '#ccff00'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    margin: '20px auto'
  },
}));

const initialStartEnd = (p: Props): Coordinates[] => {
  if (p.nRows < p.nCols) { // PC
    return [
      { i: Math.trunc(p.nRows / 2), j: Math.trunc(p.nCols / 5) },
      { i: Math.trunc(p.nRows / 2), j: Math.trunc(p.nCols * 4 / 5) - 1 }
    ]
  } else { // SmartPhone
    return [
      { j: Math.trunc(p.nCols / 2), i: Math.trunc(p.nRows / 5) },
      { j: Math.trunc(p.nCols / 2), i: Math.trunc(p.nRows * 4 / 5) - 1 }
    ]
  }
}

const initialNodeType = (i: number, j: number, start: Coordinates, end: Coordinates) => {
  return (
    i === start.i && j === start.j ? NodeType.Start :
      i === end.i && j === end.j ? NodeType.End :
        NodeType.Default
  )
}

type Props = {
  nRows: number
  nCols: number
}

function PathfindingVisualizer(props: Props) {
  const classes = useStyles(props);
  const probWall = 0.32

  const startEnd = initialStartEnd(props)
  const [start, setStart] = useState<Coordinates>(startEnd[0]);
  const [end, setEnd] = useState<Coordinates>(startEnd[1]);

  const initialRefs =
    Array.from({ length: props.nRows }, _ =>
      Array.from({ length: props.nCols }, _ =>
        createRef<HTMLDivElement>()
      )
    )
  const [refs] = useState<RefObject<HTMLDivElement>[][]>(initialRefs);

  const initialGrid =
    Array.from({ length: props.nRows }, (_, i) =>
      Array.from({ length: props.nCols }, (_, j) => {
        const nodeType = initialNodeType(i, j, start, end)
        return new Vertex(i, j, nodeType)
      })
    )
  const [grid, setGrid] = useState<Vertex[][]>(initialGrid);

  const resetGrid = () => {
    refs.forEach((row, i) =>
      row.forEach((ref, j) => {
        grid[i][j].reset()
        ref.current?.classList.remove(classes.visited, classes.shortestPath)
      })
    )
  }

  const resetWall = (probWall: number) => {
    refs.forEach((row, i) =>
      row.forEach((ref, j) => {
        if (grid[i][j].isStartOrEnd()) return

        if (Math.random() < probWall) {
          grid[i][j].setWall()
        } else {
          grid[i][j].clearWall()
        }
      })
    )

    resetGrid()
    setStart({ i: start.i, j: start.j }) // force re-render
  }

  useEffect(() => {
    resetWall(probWall)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlers = useMouseEventHandlers(grid, start, end, setGrid, setStart, setEnd, resetGrid)

  // let timeout: (string | number | NodeJS.Timeout | undefined)[] = [];
  // let currentStep = 0;
   let visitedNodes: Vertex[] = [];
   let shortestPath: Vertex[] = [];

  // const visualize = () => {
  //   resetGrid()

  //   const startNode = grid[start.i][start.j]
  //   const endNode = grid[end.i][end.j]
  //   const visitedNodes = Dijkstra(grid, startNode, endNode);
  //   const shortestPath = backtrackToStart(endNode);

  //   animate(visitedNodes, shortestPath);

  //   return { visitedNodes, shortestPath };
  // }

  // const iniciarAlgoritmo = () => {
  //   const result = visualize();
  //   visitedNodes = result.visitedNodes;
  //   shortestPath = result.shortestPath;
  // };

  // const updateAnimation = (visitedNodes: Vertex[], shortestPath: Vertex[], step: number) => {
  //   resetGrid();
  
  //   for (let i = 1; i <= step; i++) {
  //     const node = visitedNodes[i];
  //     const ref = refs[node.i][node.j].current!;
  //     ref.classList.add(classes.visited);
  //   }
  
  //   for (let i = 1; i < shortestPath.length - 1 && i <= step - visitedNodes.length; i++) {
  //     const node = shortestPath[i];
  //     const ref = refs[node.i][node.j].current!;
  //     ref.classList.add(classes.shortestPath);
  //   }
  // };

  // const animate = (visitedNodes: Vertex[], shortestPath: Vertex[]) => {
  //   const timeouts = [];

  //   for (let i = 1; i < visitedNodes.length - 1; i++) {
  //     const timeoutID = setTimeout(() => {
  //       const node = visitedNodes[i];
  //       const ref = refs[node.i][node.j].current!;
  //       ref.classList.add(classes.visited);
  //     }, 10 * i);

  //     timeouts.push(timeoutID);

  //     if (i === visitedNodes.length - 2) {
  //       const timeoutID = setTimeout(() => {
  //         animateShortestPath(shortestPath);
  //       }, 10 * i);

  //       timeouts.push(timeoutID);
  //     }
  //   }

  //   return timeouts;
  // }

  // const animateShortestPath = (shortestPath: Vertex[]) => {
  //   for (let i = 1; i < shortestPath.length - 1; i++) {
  //     setTimeout(() => {
  //       const node = shortestPath[i];
  //       const ref = refs[node.i][node.j].current!
  //       ref.classList.add(classes.shortestPath)
  //     }, 50 * i);
  //   }
  // }

//   let timeouts: (number | string | NodeJS.Timeout | undefined)[] = []; // arreglo para guardar los IDs de los timeouts

//   const iniciarAlgoritmo = () => {
//     const { visitedNodes, shortestPath } = executeAlgorithm();
//     animate(visitedNodes, shortestPath);
//   }

// const executeAlgorithm = () => {
//   resetGrid();
//   const startNode = grid[start.i][start.j];
//   const endNode = grid[end.i][end.j];
//   const visitedNodes = Dijkstra(grid, startNode, endNode);
//   const shortestPath = backtrackToStart(endNode);
//   return { visitedNodes, shortestPath };
// }

// const animate = (visitedNodes: Vertex[], shortestPath: Vertex[]) => {
//   for (let i = 1; i < visitedNodes.length - 1; i++) {
//     const timeoutId = setTimeout(() => {
//       const node = visitedNodes[i];
//       const ref = refs[node.i][node.j].current!
//       ref.classList.add(classes.visited)
//     }, 10 * i);
//     timeouts.push(timeoutId); // agregar el ID del timeout al arreglo

//     if (i === visitedNodes.length - 2) {
//       const timeoutId = setTimeout(() => {
//         animateShortestPath(shortestPath);
//       }, 10 * i);
//       timeouts.push(timeoutId); // agregar el ID del timeout al arreglo
//       return;
//     }
//   }
// }

// const animateShortestPath = (shortestPath: Vertex[]) => {
//   for (let i = 1; i < shortestPath.length - 1; i++) {
//     const timeoutId = setTimeout(() => {
//       const node = shortestPath[i];
//       const ref = refs[node.i][node.j].current!
//       ref.classList.add(classes.shortestPath)
//     }, 50 * i);
//     timeouts.push(timeoutId); // agregar el ID del timeout al arreglo
//   }
// }

  let visitedNodesTimeouts: number[] = [];
  let shortestPathTimeouts: number[] = [];
  let currentVisitedIndex = 0;
  let currentShortestPathIndex = 0;

  const visualizeVisitedNodes = () => {
    const startNode = grid[start.i][start.j];
    const endNode = grid[end.i][end.j];
    visitedNodesTimeouts = animateVisitedNodes(Dijkstra(grid, startNode, endNode));

    visualizeShortestPath();
  };

  const animateVisitedNodes = (visitedNodes: Vertex[]): number[] => {
    const timeouts: any[] = [];
    for (let i = 1; i < visitedNodes.length - 1; i++) {
      const timeout = setTimeout(() => {
        const node = visitedNodes[i];
        const ref = refs[node.i][node.j].current!;
        ref.classList.add(classes.visited);
      }, 10 * i);
      timeouts.push(timeout);
    }
    return timeouts;
  };

  const undoAnimateVisitedNodes = () => {
    for (const timeout of visitedNodesTimeouts) {
      clearTimeout(timeout);
    }
    visitedNodesTimeouts = [];
    currentVisitedIndex = 0;
    undoAnimateShortestPath();
    resetGrid();
  };

  const animateShortestPath = (shortestPath: Vertex[]): number[] => {
    const timeouts: any[] = [];
    for (let i = 1; i < shortestPath.length - 1; i++) {
      const timeout = setTimeout(() => {
        const node = shortestPath[i];
        const ref = refs[node.i][node.j].current!;
        ref.classList.add(classes.shortestPath);
      }, 250 * i);
      timeouts.push(timeout);
    }
    return timeouts;
  };

  const visualizeShortestPath = () => {
    const endNode = grid[end.i][end.j];
    shortestPathTimeouts = animateShortestPath(backtrackToStart(endNode));
  };

  const undoAnimateShortestPath = () => {
    for (const timeout of shortestPathTimeouts) {
      clearTimeout(timeout);
    }
    shortestPathTimeouts = [];
    currentShortestPathIndex = 0;
    resetGrid();
  };

  const avanzarAnimacion = () => {
    if (currentVisitedIndex >= visitedNodesTimeouts.length) return;
    const node = visitedNodes[currentVisitedIndex];
    const ref = refs[node.i][node.j].current!;
    ref.classList.add(classes.visited);
    currentVisitedIndex++;
    avanzarRutaCorta();
  };

  const retrocederAnimacion = () => {
    if (currentVisitedIndex <= 0) return;
    currentVisitedIndex--;
    const node = visitedNodes[currentVisitedIndex];
    const ref = refs[node.i][node.j].current!;
    ref.classList.remove(classes.visited);
    retrocederRutaCorta();
  };

  const avanzarRutaCorta = () => {
    if (currentShortestPathIndex >= shortestPathTimeouts.length) return;
    const node = shortestPath[currentShortestPathIndex];
    const ref = refs[node.i][node.j].current!;
    ref.classList.add(classes.shortestPath);
    currentShortestPathIndex++;
  };

  const retrocederRutaCorta = () => {
    if (currentShortestPathIndex <= 0) return;
    currentShortestPathIndex--;
    const node = shortestPath[currentShortestPathIndex];
    const ref = refs[node.i][node.j].current!;
    ref.classList.remove(classes.shortestPath);
  };


  // const previousNode = () => {
  //   console.log("Previous node animated and logically visited");
  //   const timeoutId = timeouts.pop(); // sacar el último ID del arreglo
  //   clearTimeout(timeoutId); // detener el timeout correspondiente
  // }

  // const nextNode = () => {
  //   console.log("Next node animated and logically visited");
  //   const timeoutId = timeouts.shift(); // sacar el primer ID del arreglo
  // clearTimeout(timeoutId); // detener el timeout correspondiente
  // }

  return (
    <>
      <div className={classes.buttons}>
        <Button variant="contained" style={{ textTransform: 'none', marginRight: '10px', backgroundColor: '#2F86EB', color: '#EDF7F6' }} onClick={() => resetWall(probWall)}>
          Random Wall
        </Button>
        <Button variant="contained" style={{ textTransform: 'none', marginLeft: '10px', backgroundColor: '#E2725B', color: '#EDF7F6' }} onClick={() => resetWall(0)}>
          Clear Wall
        </Button>
      </div>
      {/* <Button variant="contained" style={{ textTransform: 'none' }} onClick={iniciarAlgoritmo}>
        Visualize Dijkstra's Algorithm
      </Button> */}
      <div className={classes.buttons}>
        <Button variant="contained" style={{ textTransform: 'none', marginRight: '10px', backgroundColor: '#44C95B', color: '#EDF7F6' }} onClick={undoAnimateVisitedNodes}>
           Previous node
        </Button>
        <Button variant="contained" style={{ textTransform: 'none', marginLeft: '10px', backgroundColor: '#44C95B', color: '#EDF7F6' }} onClick={visualizeVisitedNodes}>
          Next node
        </Button>
      </div>
      <div className={classes.container}>
        {
          refs.map((row, i) =>
            row.map((node, j) =>
              <Node
                i={i} j={j}
                key={`node-${i}-${j}`}
                nodeRef={node}
                vertex={grid[i][j]}
                handleMouseDown={handlers.handleMouseDown}
                handleMouseEnter={handlers.handleMouseEnter}
                handleMouseUp={handlers.handleMouseUp}
              />
            )
          )
        }
      </div>
    </>
  )
}

export default PathfindingVisualizer
