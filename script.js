// todo ---------------------------------------------------------------------->
//  - pad the left and top side of the output grid with N tiles to account for the
//    missing tiles
//  - propegate the changes when a cell in collapsed

// constants ----------------------------------------------------------------->
const inputGridRows = 6;
const inputGridCols = 6;
const inputCanvasCellSize = 31;
const patternSize = 3;
const outputGridRows = 10;
const outputGridCols = 10;
const outputCanvasCellSize = 20;
const colors = ["blue", "red", "green", "yellow", "purple", "orange"];

// globals ------------------------------------------------------------------->
let inputGrid = Array(inputGridRows).fill().map(() => Array(inputGridCols).fill(0));
let outputGrid = Array(outputGridRows).fill().map(() => Array(outputGridCols).fill(-1));
let superTileOutputGrid = Array(outputGridRows).fill().map(() => Array(outputGridCols).fill(null));
let superColorOutputGrid = Array(outputGridRows).fill().map(() => Array(outputGridCols).fill(null));
let entropyGrid = Array(outputGridRows).fill().map(() => Array(outputGridCols).fill(null));
let colorIndex = 1
let numInputColors;
let patterns;
let debugFirstPatternIndex;

// setup --------------------------------------------------------------------->
let inputCanvas = document.getElementById("inputCanvas");
inputCanvas.width = inputGridCols * inputCanvasCellSize;
inputCanvas.height = inputGridRows * inputCanvasCellSize;
let inputCtx = inputCanvas.getContext("2d");

inputCanvas.addEventListener("click", (event) => {
    const rect = inputCanvas.getBoundingClientRect()
    const clickX = event.clientX - rect.x
    const clickY = event.clientY - rect.y

    const x = Math.floor((clickX / inputCanvas.width) * inputGridCols)
    const y = Math.floor((clickY / inputCanvas.height) * inputGridRows)

    inputGrid[y][x] = colorIndex;
    renderInput()
})

// render -------------------------------------------------------------------->
function renderInput() {
    inputCtx.clearRect(0, 0, inputCanvas.width, inputCanvas.height);

    for (let i = 0; i < inputGridRows; i++) {
        for (let j = 0; j < inputGridCols; j++) {
            inputCtx.fillStyle = colors[inputGrid[i][j]]
            let cellWidth = inputCanvas.width / inputGridCols
            let cellHeight = inputCanvas.height / inputGridRows
            inputCtx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
        }
    }
}

// wave function collapse ---------------------------------------------------->
function generatePatterns() {
    patterns = []
    for (let i = 0; i <= inputGridRows - patternSize; i++) {
        for (let j = 0; j <= inputGridCols - patternSize; j++) {
            let pattern = Array(patternSize).fill().map(() => Array(patternSize).fill(0))
            for (let a = 0; a < patternSize; a++) {
                for (let b = 0; b < patternSize; b++) {
                    pattern[a][b] = inputGrid[i + a][j + b];
                }
            }
            patterns.push(pattern);
        }
    }
}

function wfc() {
    console.log({patterns})
    // get number of colors used in the input
    const set = new Set();
    for (let i = 0; i < inputGridRows; i++) {
        for (let j = 0; j < inputGridCols; j++) {
            set.add(inputGrid[i][j])
        }
    }
    numInputColors = set.size

    // init super output and entropy grid
    for (let i = 0; i < outputGridRows; i++) {
        for (let j = 0; j < outputGridCols; j++) {
            // super color
            superColorOutputGrid[i][j] = Array(numInputColors);
            for (let k = 0; k < numInputColors; k++) {
                superColorOutputGrid[i][j][k] = true;
            }

            // super tile
            superTileOutputGrid[i][j] = Array(patterns.length)
            for (let k = 0; k < superTileOutputGrid[i][j].length; k++) {
                superTileOutputGrid[i][j][k] = true;
            }

            // entopy
            entropyGrid[i][j] = patterns.length
        }
    }

    let collapseIdx = [rint(outputGridRows), rint(outputGridCols)]
    debugFirstPatternIndex = collapseIdx;
    collapse(...collapseIdx)
    /*
    while (isEntropy()) {
        collapse(...collapseIdx)


        // let lowestEntropies = findLowestEntropies()
    }
    */
}

// rethinking the algo ---
// I'm not sure if the super color grid is even useful
// I think that 
// wait maybe I'm wrong again
// I might just be thinking about how the color grid verifies colors wrong
// maybe i need to break the changes into waves? With wave 1 (originating from
// the initial collapse) dictating which colors a cell can be for wave 2?

// 1. collapse a superTile index into one tile
//      - set the correct superTile[row][col][rand] to true
//      - set the entropy to 1
// 2. collect each unset cell under the tile into a list
//      - iterate over the ?output? grid, 
// 3. from the list, generate all the tiles that could be affected by that cell
// 4. for each tile in the list, check if it is still valid. If it's not add it
//    to a list
// 5. from the list of invalidated tiles, generate a list of cells which they
//    could affect
// 6. for each cell in tha list, check to see if it's list of colors is still valid
//
// set each of the colors effected by the tile
// if an unset cell color was set:
//      add it to the list
// for each cell in the list
//      for each pattern that could be effected by the cell
//          check if it is still a valid pattern

function collapse(row, col) {
    // for each of these collapsed cells, we want to shoot a laser upwards and
    // shatter all the glass patterns above that don't have the lasers color
    // in their grid at that location
    let collapsedCells = []; 
    console.log({row, col}) 
    let selectedIndex = getRandomPossibility(row, col)
    console.log({selectedIndex})
    // update super color
    let selectedTile = patterns[selectedIndex];
    console.log({selectedTile})
    for (let i = 0; i < selectedTile.length; i++) {
        for (let j = 0; j < selectedTile[i].length; j++) {
            rowTarget = row + i;
            colTarget = col + j;
            if (rowTarget >= superColorOutputGrid.length || colTarget >= superColorOutputGrid[rowTarget].length) {
                continue;
            }
            // update super color
            // should check if the color was already set, if so we don't need to check for tile updates for that cell
            for (let k = 0; k < numInputColors; k++) {
                // must do bounds check
                superColorOutputGrid[row + i][col + j][k] = selectedTile[i][j] === k;
            }
            // update output
            outputGrid[row + i][col + j] = selectedTile[i][j];
            // update entropy grid
            // can't do this here yet because ... we don't update the tile 
            // entropy for pattern, just the one selcted. This should go 
            // outside of this loop
            // entropyGrid[row + i][col + j] = 1;
            collapsedCells.push([rowTarget, colTarget])
        }
    } 
    // update super tile
    for (let i = 0; i < superTileOutputGrid[row][col].length; i++) {
        superTileOutputGrid[row][col][i] = selectedIndex === i;
    }
    entropyGrid[row][col] = 1

    // collapsedCells = [collapsedCells[0]]
    propegate2(collapsedCells);
    // propegate(row, col);
}

function propegate2(collapsedCells) {
    for (let i = 0; i < collapsedCells.length; i++) {
        propegate3(collapsedCells[i][0], collapsedCells[i][1])
    }
}


function propegate3(row, col) {
    for (let i = 0; i < patternSize; i++) {
        for (let j = 0; j < patternSize; j++) {
            let rowTarget = row - i;
            let colTarget = col - j;
            // for each pattern
            for (let k = 0; k < patterns.length; k++) {
                console.log(superTileOutputGrid[rowTarget][colTarget][k])
                if (superTileOutputGrid[rowTarget][colTarget][k] === false) {
                    continue
                }
                console.log({"patterns[k][i][j]": patterns[k][i][j], "outputGrid[row][col]": outputGrid[row][col]})
                if (patterns[k][i][j] !== outputGrid[row][col]) {
                    superTileOutputGrid[rowTarget][colTarget][k] = false;
                    entropyGrid[rowTarget][colTarget]--;
                }
            }
        }
    }
}

function getRandomPossibility(row, col) {
    let possibilities = [];
    console.log({outputGrid, row, col})
    for (let i = 0; i < superTileOutputGrid[row][col].length; i++) {
        if (superTileOutputGrid[row][col][i] === true) {
            possibilities.push(i)
        }
    }
    let possibility = possibilities[rint(possibilities.length)];
    console.log({possibility});
    console.log({possibilities});
    return possibility;
}

function propegate(row, col) {
    // update the tiles based on the pixel change in all affectable cells
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            let rowTarget = row + i;
            let colTarget = col + j; 
            if (rowTarget < 0 || rowTarget >= outputGridRows || colTarget < 0 || colTarget >= outputGridCols) {
                continue;
            }

            // go through all the valid grids, check if each is still valid
            revalidatePatterns(rowTarget, colTarget)
        }
    }
}

// takes a row and col in the bounds of the grid
// re evaluates whether the patterns in the array are still valid based on the 
// current pixels
function revalidatePatterns(row, col) {
    for (let i = 0; i < superTileOutputGrid[row][col].length; i++) {
        if (superTileOutputGrid[row][col][i] === false) {
            continue;
        }
        if (isValidPattern(row, col, i) === false) {
            // console.log("invalidPattern")
            superTileOutputGrid[row][col][i] = false;
            console.log("---")
            entropyGrid[row][col]--;
        }
    }
}

// for a pattern to be valid:
//  - for each cell in the pattern the following must be true:
//      - in the superColorGrid, that color index must be true
function isValidPattern(row, col, index) {
    // for each cell in the pattern
    for (let i = 0; i < patternSize; i++) {
        for (let j = 0; j < patternSize; j++) {
            let rowTarget = row + i;
            let colTarget = col + j;

            if (rowTarget < 0 || rowTarget >= outputGridRows || colTarget < 0 || colTarget >= outputGridCols) {
                continue;
            }

            let patternColorIndex = patterns[index][i][j];
            if (superColorOutputGrid[rowTarget][colTarget][patternColorIndex] == false) {
                return false
            }
        }
    }
    return true
}

function findLowestEntropies() {
    for (let i = 0; i < outputGridRows; i++) {
        for (let j = 0; j < outputGridCols; j++) {

            for (let k = 0; k < outputGrid[i][j].length; k++) {

                if (outputGrid[i][j][k] == true) {
                    return true;
                }
            }
        }
    }
}

function isEntropy() {
    for (let i = 0; i < outputGridRows; i++) {
        for (let j = 0; j < outputGridCols; j++) {
            for (let k = 0; k < numInputColors; k++) {
                if (outputGrid[i][j][k] == true) {
                    return true;
                }
            }
        }
    }
    return false;
}

function rint(num) {
    return Math.floor(Math.random() * num);
}

// test ---------------------------------------------------------------------->
function synthInputClick(row, col) {
    let rect = inputCanvas.getBoundingClientRect()
    let clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: rect.left + (col * inputCanvasCellSize),
        clientY: rect.top + (row * inputCanvasCellSize),
    })
    inputCanvas.dispatchEvent(clickEvent)
}

colorIndex = 1;
for (let i = 0; i < 8; i++) {
    synthInputClick(rint(inputGridRows), rint(inputGridCols))
}
/*
colorIndex = 2;
for (let i = 0; i < 8; i++) {
    synthInputClick(rint(inputGridRows), rint(inputGridCols))
}
*/

// debug --------------------------------------------------------------------->


// run ----------------------------------------------------------------------->

generatePatterns()
wfc()

