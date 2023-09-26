import { useState, useEffect } from "react"
import axios from "axios"
import "./Home.scss"
import { colorValues } from "../assets/variables/colorValues"

export default function Home() {
  const [grid2048, setGrid2048] = useState([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const createGrid = () => {
    const newgrid = []
    for (let x = 1; x < 5; x++) {
      for (let y = 1; y < 5; y++) {
        const cell = {
          x,
          y,
          value: 0,
          mergeable: true,
        }
        newgrid.push(cell)
      }
    }

    setGrid2048(newgrid)

    return newgrid
  }

  const findFreeRandomPosition = (grid) => {
    const freePositions = grid.filter((cell) => cell.value === 0)

    const randomX = Math.floor(Math.random() * 5)
    const randomY = Math.floor(Math.random() * 5)

    if (
      freePositions.find((cell) => cell.x === randomX && cell.y === randomY)
    ) {
      return { randomX, randomY }
    } else {
      return findFreeRandomPosition(grid)
    }
  }

  const handleRandom2Or4 = () => {
    return Math.random() < 0.9 ? 2 : 4
  }

  const handleGameOver = (myGrid) => {
    // let nbVide = 0
    // let sameValueAside = false

    for (let x = 1; x < 5; x++) {
      for (let y = 1; y < 5; y++) {
        const activeCell = myGrid.find((cell) => cell.x === x && cell.y === y)

        if (activeCell.value === 0) {
          // nbVide++
          return false
        }

        const cellXm1 = myGrid.find((cell) => cell.x === x - 1 && cell.y === y)
        const cellXp1 = myGrid.find((cell) => cell.x === x + 1 && cell.y === y)
        const cellYm1 = myGrid.find((cell) => cell.x === x && cell.y === y - 1)
        const cellYp1 = myGrid.find((cell) => cell.x === x && cell.y === y + 1)

        if (cellXm1 !== undefined) {
          if (cellXm1.value === activeCell.value) {
            return false
          }
        }

        if (cellXp1 !== undefined) {
          if (cellXp1.value === activeCell.value) {
            return false
          }
        }

        if (cellYm1 !== undefined) {
          if (cellYm1.value === activeCell.value) {
            return false
          }
        }

        if (cellYp1 !== undefined) {
          if (cellYp1.value === activeCell.value) {
            return false
          }
        }
      }
    }

    setGameOver(true)

    axios
      .post("http://localhost:4242/scores", {
        score,
      })
      .then(() => {
        axios
          .get("http://localhost:4242/scores")
          .then(({ data }) => setHighScore(data.score))
      })

    return true
  }

  const swipeLeft = (myGrid, count, newScore) => {
    // let newGrid = grid2048
    let newGrid = myGrid

    let changeGrid = false
    // let oneChangeMergeable = false

    for (let x = 1; x < 5; x++) {
      for (let y = 1; y < 5; y++) {
        const cell = newGrid.find((cell) => cell.x === x && cell.y === y)
        const cellnext = newGrid.find(
          (cell) => cell.x === x && cell.y === y + 1
        )
        if (cell.y < 4) {
          // si cellNext.value = cell.value alors on fusionne en cell et on passe cellNext.value à null
          if (
            cellnext.value === cell.value &&
            cell.mergeable === true &&
            cellnext.mergeable === true
          ) {
            // si la valeur de la cellule et la suivante sont identiques
            if (cell.value === 0) {
              // si c'est identique mais = à 0
              newGrid = newGrid.map(
                (cellule) =>
                  cellule.x === x && cellule.y === y // la cellule regardée
                    ? { ...cellule, value: cell.value + cellnext.value } // = 0 + 0 = 0
                    : cellule.x === x && cellule.y === y + 1 // la cellule suivante
                    ? { ...cellule, value: 0 } // = 0
                    : cellule // les autres cellules ne changent pas
              )

              // il n'y a eu aucune modification donc changeGrid ne change pas
            } else {
              // les cellules ont des valeurs identiques mais différentes de 0

              newGrid = newGrid.map(
                (cellule) =>
                  cellule.x === x && cellule.y === y // la cellule regardée
                    ? {
                        ...cellule,
                        value: cell.value + cellnext.value,
                        mergeable: false,
                      } // double sa valeur et sa valeur ne peut plus fusionner avec une autre cellule
                    : cellule.x === x && cellule.y === y + 1 // la valeur de la cellule suivante
                    ? { ...cellule, value: 0 } // devient 0
                    : cellule // les autres cellules ne bougent pas
              )

              newScore += cell.value * 2
              changeGrid = true // il y a eu une modification donc changeGrid passe à true
            }
          } else if (cell.value === 0) {
            // la valeur de la cellule est 0 et est différente de la valeur de la cellule suivante
            newGrid = newGrid.map(
              (cellule) =>
                cellule.x === x && cellule.y === y // la cellule regardée
                  ? { ...cellule, value: cellnext.value } // prend la valeur de la cellule suivante
                  : cellule.x === x && cellule.y === y + 1 // la cellule suivante
                  ? { ...cellule, value: 0 } // devient nulle (0) car elle a été déplacée
                  : cellule // les autres cellules ne changent pas
            )

            if (cellnext.value !== cell.value) {
              changeGrid = true
            } // il y a eu une modification donc changeGrid passe à true
          } else if (cell.value !== cellnext.value) {
            // les valeurs de la cellule et de la suivante sont différentes mais cell.value !== 0
            newGrid = newGrid // on ne fait rien
          }
        }
      }
    }

    // vérification que tous les éléments sont à gauche avant d'ajouter un nouveau nombre
    let allOnLeft = true
    for (let x = 1; x < 5; x++) {
      for (let y = 1; y < 4; y++) {
        const cell = newGrid.find((cell) => cell.x === x && cell.y === y)
        const cellnext = newGrid.find(
          (cell) => cell.x === x && cell.y === y + 1
        )

        if (cell.value === 0 && cellnext.value !== 0) {
          allOnLeft = false
        }
      }
    }

    // console.log("allOnLeft",allOnLeft);
    // console.log("changeGrid", changeGrid);
    // si allOnLeft = true et que changeGrid = false on rajoute un chiffre
    if (allOnLeft === true && changeGrid === false) {
      if (count > 0) {
        const newPosition = findFreeRandomPosition(newGrid)
        // on rajoute le nouveau chiffre à la grille
        newGrid = newGrid.map((cell) =>
          cell.x === newPosition.randomX && cell.y === newPosition.randomY
            ? { ...cell, value: handleRandom2Or4() }
            : cell
        )
        // on rend de nouveau toutes les cases mergeables
        newGrid = newGrid.map((item) => ({ ...item, mergeable: true }))
      }
    } else {
      handleGameOver(newGrid)
      return swipeLeft(newGrid, count + 1, newScore)
    }

    handleGameOver(newGrid)

    setGrid2048(newGrid)

    setScore(score + newScore)
  }
  // }

  const swipeTop = (myGrid, count, newScore) => {
    // let newGrid = grid2048
    let newGrid = myGrid

    let changeGrid = false
    // let oneChangeMergeable = false

    for (let x = 1; x < 5; x++) {
      for (let y = 1; y < 5; y++) {
        const cell = newGrid.find((cell) => cell.x === x && cell.y === y)
        const cellnext = newGrid.find(
          (cell) => cell.x === x + 1 && cell.y === y
        )
        if (cell.x < 4) {
          // si cellNext.value = cell.value alors on fusionne en cell et on passe cellNext.value à null
          if (
            cellnext.value === cell.value &&
            cell.mergeable === true &&
            cellnext.mergeable === true
          ) {
            // si la valeur de la cellule et la suivante sont identiques
            if (cell.value === 0) {
              // si c'est identique mais = à 0
              newGrid = newGrid.map(
                (cellule) =>
                  cellule.x === x && cellule.y === y // la cellule regardée
                    ? { ...cellule, value: cell.value + cellnext.value } // = 0 + 0 = 0
                    : cellule.x === x + 1 && cellule.y === y // la cellule suivante
                    ? { ...cellule, value: 0 } // = 0
                    : cellule // les autres cellules ne changent pas
              )

              // il n'y a eu aucune modification donc changeGrid ne change pas
            } else {
              // les cellules ont des valeurs identiques mais différentes de 0

              newGrid = newGrid.map(
                (cellule) =>
                  cellule.x === x && cellule.y === y // la cellule regardée
                    ? {
                        ...cellule,
                        value: cell.value + cellnext.value,
                        mergeable: false,
                      } // double sa valeur et sa valeur ne peut plus fusionner avec une autre cellule
                    : cellule.x === x + 1 && cellule.y === y // la valeur de la cellule suivante
                    ? { ...cellule, value: 0 } // devient 0
                    : cellule // les autres cellules ne bougent pas
              )

              newScore += cell.value * 2
              changeGrid = true // il y a eu une modification donc changeGrid passe à true
            }
          } else if (cell.value === 0) {
            // la valeur de la cellule est 0 et est différente de la valeur de la cellule suivante
            newGrid = newGrid.map(
              (cellule) =>
                cellule.x === x && cellule.y === y // la cellule regardée
                  ? { ...cellule, value: cellnext.value } // prend la valeur de la cellule suivante
                  : cellule.x === x + 1 && cellule.y === y // la cellule suivante
                  ? { ...cellule, value: 0 } // devient nulle (0) car elle a été déplacée
                  : cellule // les autres cellules ne changent pas
            )

            if (cellnext.value !== cell.value) {
              changeGrid = true
            } // il y a eu une modification donc changeGrid passe à true
          } else if (cell.value !== cellnext.value) {
            // les valeurs de la cellule et de la suivante sont différentes mais cell.value !== 0
            newGrid = newGrid // on ne fait rien
          }
        }
      }
    }

    // vérification que tous les éléments sont à gauche avant d'ajouter un nouveau nombre
    let allOnTop = true
    for (let x = 1; x < 4; x++) {
      for (let y = 1; y < 5; y++) {
        const cell = newGrid.find((cell) => cell.x === x && cell.y === y)
        const cellnext = newGrid.find(
          (cell) => cell.x === x + 1 && cell.y === y
        )

        if (cell.value === 0 && cellnext.value !== 0) {
          allOnTop = false
        }
      }
    }

    // console.log("allOnTop",allOnTop);
    // console.log("changeGrid", changeGrid);

    // si allOnTop = true et que changeGrid = false on rajoute un chiffre
    if (allOnTop === true && changeGrid === false) {
      if (count > 0) {
        const newPosition = findFreeRandomPosition(newGrid)
        // on rajoute le nouveau chiffre à la grille
        newGrid = newGrid.map((cell) =>
          cell.x === newPosition.randomX && cell.y === newPosition.randomY
            ? { ...cell, value: handleRandom2Or4() }
            : cell
        )
        // on rend de nouveau toutes les cases mergeables
        newGrid = newGrid.map((item) => ({ ...item, mergeable: true }))
      }
    } else {
      handleGameOver(newGrid)
      return swipeTop(newGrid, count + 1, newScore)
    }

    handleGameOver(newGrid)
    setGrid2048(newGrid)
    setScore(score + newScore)
  }

  const swipeRight = (myGrid, count, newScore) => {
    // let newGrid = grid2048
    let newGrid = myGrid

    let changeGrid = false
    // let oneChangeMergeable = false

    for (let x = 1; x < 5; x++) {
      for (let y = 4; y > 0; y--) {
        const cell = newGrid.find((cell) => cell.x === x && cell.y === y)
        const cellnext = newGrid.find(
          (cell) => cell.x === x && cell.y === y - 1
        )
        if (cell.y > 1) {
          // si cellNext.value = cell.value alors on fusionne en cell et on passe cellNext.value à null
          if (
            cellnext.value === cell.value &&
            cell.mergeable === true &&
            cellnext.mergeable === true
          ) {
            // si la valeur de la cellule et la suivante sont identiques
            if (cell.value === 0) {
              // si c'est identique mais = à 0
              newGrid = newGrid.map(
                (cellule) =>
                  cellule.x === x && cellule.y === y // la cellule regardée
                    ? { ...cellule, value: cell.value + cellnext.value } // = 0 + 0 = 0
                    : cellule.x === x && cellule.y === y - 1 // la cellule suivante
                    ? { ...cellule, value: 0 } // = 0
                    : cellule // les autres cellules ne changent pas
              )

              // il n'y a eu aucune modification donc changeGrid ne change pas
            } else {
              // les cellules ont des valeurs identiques mais différentes de 0

              newGrid = newGrid.map(
                (cellule) =>
                  cellule.x === x && cellule.y === y // la cellule regardée
                    ? {
                        ...cellule,
                        value: cell.value + cellnext.value,
                        mergeable: false,
                      } // double sa valeur et sa valeur ne peut plus fusionner avec une autre cellule
                    : cellule.x === x && cellule.y === y - 1 // la valeur de la cellule suivante
                    ? { ...cellule, value: 0 } // devient 0
                    : cellule // les autres cellules ne bougent pas
              )

              newScore += cell.value * 2
              changeGrid = true // il y a eu une modification donc changeGrid passe à true
            }
          } else if (cell.value === 0) {
            // la valeur de la cellule est 0 et est différente de la valeur de la cellule suivante
            newGrid = newGrid.map(
              (cellule) =>
                cellule.x === x && cellule.y === y // la cellule regardée
                  ? { ...cellule, value: cellnext.value } // prend la valeur de la cellule suivante
                  : cellule.x === x && cellule.y === y - 1 // la cellule suivante
                  ? { ...cellule, value: 0 } // devient nulle (0) car elle a été déplacée
                  : cellule // les autres cellules ne changent pas
            )

            if (cellnext.value !== cell.value) {
              changeGrid = true
            } // il y a eu une modification donc changeGrid passe à true
          } else if (cell.value !== cellnext.value) {
            // les valeurs de la cellule et de la suivante sont différentes mais cell.value !== 0
            newGrid = newGrid // on ne fait rien
          }
        }
      }
    }

    // vérification que tous les éléments sont à gauche avant d'ajouter un nouveau nombre
    let allOnRight = true
    for (let x = 1; x < 5; x++) {
      for (let y = 4; y > 1; y--) {
        const cell = newGrid.find((cell) => cell.x === x && cell.y === y)
        const cellnext = newGrid.find(
          (cell) => cell.x === x && cell.y === y - 1
        )

        if (cell.value === 0 && cellnext.value !== 0) {
          allOnRight = false
        }
      }
    }

    // console.log("allOnRight",allOnRight);
    // console.log("changeGrid", changeGrid);

    // si allOnRight = true et que changeGrid = false on rajoute un chiffre
    if (allOnRight === true && changeGrid === false) {
      if (count > 0) {
        const newPosition = findFreeRandomPosition(newGrid)
        // on rajoute le nouveau chiffre à la grille
        newGrid = newGrid.map((cell) =>
          cell.x === newPosition.randomX && cell.y === newPosition.randomY
            ? { ...cell, value: handleRandom2Or4() }
            : cell
        )
        // on rend de nouveau toutes les cases mergeables
        newGrid = newGrid.map((item) => ({ ...item, mergeable: true }))
      }
    } else {
      handleGameOver(newGrid)
      return swipeRight(newGrid, count + 1, newScore)
    }

    handleGameOver(newGrid)
    setGrid2048(newGrid)
    setScore(score + newScore)
  }

  const swipeBottom = (myGrid, count, newScore) => {
    // let newGrid = grid2048
    let newGrid = myGrid

    let changeGrid = false
    // let oneChangeMergeable = false

    for (let x = 4; x > 0; x--) {
      for (let y = 1; y < 5; y++) {
        const cell = newGrid.find((cell) => cell.x === x && cell.y === y)
        const cellnext = newGrid.find(
          (cell) => cell.x === x - 1 && cell.y === y
        )
        if (cell.x > 1) {
          // si cellNext.value = cell.value alors on fusionne en cell et on passe cellNext.value à null
          if (
            cellnext.value === cell.value &&
            cell.mergeable === true &&
            cellnext.mergeable === true
          ) {
            // si la valeur de la cellule et la suivante sont identiques
            if (cell.value === 0) {
              // si c'est identique mais = à 0
              newGrid = newGrid.map(
                (cellule) =>
                  cellule.x === x && cellule.y === y // la cellule regardée
                    ? { ...cellule, value: cell.value + cellnext.value } // = 0 + 0 = 0
                    : cellule.x === x - 1 && cellule.y === y // la cellule suivante
                    ? { ...cellule, value: 0 } // = 0
                    : cellule // les autres cellules ne changent pas
              )

              // il n'y a eu aucune modification donc changeGrid ne change pas
            } else {
              // les cellules ont des valeurs identiques mais différentes de 0

              newGrid = newGrid.map(
                (cellule) =>
                  cellule.x === x && cellule.y === y // la cellule regardée
                    ? {
                        ...cellule,
                        value: cell.value + cellnext.value,
                        mergeable: false,
                      } // double sa valeur et sa valeur ne peut plus fusionner avec une autre cellule
                    : cellule.x === x - 1 && cellule.y === y // la valeur de la cellule suivante
                    ? { ...cellule, value: 0 } // devient 0
                    : cellule // les autres cellules ne bougent pas
              )

              newScore += cell.value * 2
              changeGrid = true // il y a eu une modification donc changeGrid passe à true
            }
          } else if (cell.value === 0) {
            // la valeur de la cellule est 0 et est différente de la valeur de la cellule suivante
            newGrid = newGrid.map(
              (cellule) =>
                cellule.x === x && cellule.y === y // la cellule regardée
                  ? { ...cellule, value: cellnext.value } // prend la valeur de la cellule suivante
                  : cellule.x === x - 1 && cellule.y === y // la cellule suivante
                  ? { ...cellule, value: 0 } // devient nulle (0) car elle a été déplacée
                  : cellule // les autres cellules ne changent pas
            )

            if (cellnext.value !== cell.value) {
              changeGrid = true
            } // il y a eu une modification donc changeGrid passe à true
          } else if (cell.value !== cellnext.value) {
            // les valeurs de la cellule et de la suivante sont différentes mais cell.value !== 0
            newGrid = newGrid // on ne fait rien
          }
        }
      }
    }

    // vérification que tous les éléments sont à gauche avant d'ajouter un nouveau nombre
    let allOnBottom = true
    for (let x = 4; x > 1; x--) {
      for (let y = 1; y < 5; y++) {
        const cell = newGrid.find((cell) => cell.x === x && cell.y === y)
        const cellnext = newGrid.find(
          (cell) => cell.x === x - 1 && cell.y === y
        )

        if (cell.value === 0 && cellnext.value !== 0) {
          allOnBottom = false
        }
      }
    }

    // console.log("allOnBottom",allOnBottom);
    // console.log("changeGrid", changeGrid);

    // si allOnBottom = true et que changeGrid = false on rajoute un chiffre
    if (allOnBottom === true && changeGrid === false) {
      if (count > 0) {
        const newPosition = findFreeRandomPosition(newGrid)
        // on rajoute le nouveau chiffre à la grille
        newGrid = newGrid.map((cell) =>
          cell.x === newPosition.randomX && cell.y === newPosition.randomY
            ? { ...cell, value: handleRandom2Or4() }
            : cell
        )
        // on rend de nouveau toutes les cases mergeables
        newGrid = newGrid.map((item) => ({ ...item, mergeable: true }))
      }
    } else {
      handleGameOver(newGrid)
      return swipeBottom(newGrid, count + 1, newScore)
    }

    handleGameOver(newGrid)
    setGrid2048(newGrid)
    setScore(score + newScore)
  }

  // Créer une fonction qui gère l'événement onKeyDown
  const handleKeyDown = (event) => {
    // Récupérer le code de la touche enfoncée
    const keyCode = event.keyCode

    // Comparer le code avec les codes des touches flèches
    switch (keyCode) {
      case 37: // Flèche gauche
        swipeLeft(grid2048, 0, 0)
        break
      case 38: // Flèche haut
        swipeTop(grid2048, 0, 0)
        break
      case 39: // Flèche droite
        swipeRight(grid2048, 0, 0)
        break
      case 40: // Flèche bas
        swipeBottom(grid2048, 0, 0)
        break
      default:
        break
    }
  }

  const handleRestart = () => {
    setScore(0)
    setGameOver(false)

    let newGrid = createGrid()
    const firstPosition = findFreeRandomPosition(newGrid)
    newGrid = newGrid.map((cell) =>
      cell.x === firstPosition.randomX && cell.y === firstPosition.randomY
        ? { ...cell, value: 2 }
        : cell
    )
    const secondPosition = findFreeRandomPosition(newGrid)
    newGrid = newGrid.map((cell) =>
      cell.x === secondPosition.randomX && cell.y === secondPosition.randomY
        ? { ...cell, value: 2 }
        : cell
    )
    setGrid2048(newGrid)
  }

  useEffect(() => {
    handleRestart()

    axios
      .get("http://localhost:4242/scores")
      .then(({ data }) => setHighScore(data.score))
  }, [])

  return (
    <main className="main-home" tabIndex="0" onKeyDown={handleKeyDown}>
      <div className="game-container">
        <section className="score-container">
          <h1
            title="Restart"
            onClick={handleRestart}
            style={
              grid2048[0]
                ? {
                    color: colorValues.find(
                      (color) =>
                        color.value ===
                        Math.max(...grid2048.map((cell) => cell.value))
                    ).color,
                  }
                : null
            }
          >
            2048
          </h1>
          <div className="div-score">
            <h2>Score</h2>
            <p>{score}</p>
          </div>
          <div className="div-score">
            <h2>High score</h2>
            <p>{highScore || 0}</p>
          </div>
        </section>
        <section className="section-2048-container">
          {grid2048.map((cell) => (
            <div
              className="cell2048"
              style={
                cell.value !== 0
                  ? {
                      backgroundColor: colorValues.find(
                        (color) => color.value === cell.value
                      ).color,
                    }
                  : null
              }
              key={"x" + cell.x + " - y" + cell.y}
            >
              {
                <p
                  style={
                    cell.value < 1000
                      ? { fontSize: "3rem" }
                      : cell.value < 10000
                      ? { fontSize: "2.3rem" }
                      : { fontSize: "1.7rem" }
                  }
                >
                  {cell.value !== 0 ? cell.value : null}
                </p>
                // <p>{"x" + cell.x + " - y"  + cell.y + "val" + cell.value + "  " + cell.mergeable} </p>
              }
            </div>
          ))}
        </section>
        {gameOver && <h1 className="gameover">Game Over</h1>}
      </div>
    </main>
  )
}
