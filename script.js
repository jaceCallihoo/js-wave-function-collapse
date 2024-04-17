// todo ---------------------------------------------------------------------->
//  - pad the left and top side of the output grid with N tiles to account for the
//    missing tiles
//  - propegate the changes when a cell in collapsed

// constants ----------------------------------------------------------------->
const inputGridRows = 5;
const inputGridCols = 5;
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

// setup --------------------------------------------------------------------->
let inputCanvas = document.getElementById("inputCanvas");
inputCanvas.width = inputGridCols * inputCanvasCellSize;
inputCanvas.height = inputGridRows * inputCanvasCellSize;
let inputCtx = inputCanvas.getContext("2d");

let outputCanvas = document.getElementById("outputCanvas");
outputCanvas.width = outputGridCols * outputCanvasCellSize;
outputCanvas.height = outputGridCols * outputCanvasCellSize;
let outputCtx = outputCanvas.getContext("2d")

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

// optimization: could be refactor into one function with renderInput
function renderOutput() {
    outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    // outputCtx.font = ""

    for (let i = 0; i < outputGridRows; i++) {
        for (let j = 0; j < outputGridCols; j++) {
            let cellText;
            if (entropyGrid[i][j] === 1) {
                cellText = "-"
                outputCtx.fillStyle = colors[outputGrid[i][j]]
            } else {
                cellText = entropyGrid[i][j];
                outputCtx.fillStyle = "white"
            }
            let cellWidth = outputCanvas.width / outputGridCols
            let cellHeight = outputCanvas.height / outputGridRows
            outputCtx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
            outputCtx.fillStyle = "black" 
            outputCtx.fillText(cellText, j * cellWidth + 5, i * cellHeight + 15)
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
    collapse(...collapseIdx)
    renderOutput()
    /*
    while (isEntropy()) {
        collapse(...collapseIdx)


        // let lowestEntropies = findLowestEntropies()
    }
    */
}

function collapse(row, col) {
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
            for (let k = 0; k < numInputColors; k++) {
                // must do bounds check
                superColorOutputGrid[row + i][col + j][k] = selectedTile[i][j] === k;
            }
            console.log(superColorOutputGrid[row + i][col + j])
            // update output
            outputGrid[row + i][col + j] = selectedTile[i][j];
            // update entropy grid
            // can't do this here yet because ...
            entropyGrid[row + i][col + j] = 1;
        }
    } 
    // update super tile
    for (let i = 0; i < superTileOutputGrid[row][col].length; i++) {
        superTileOutputGrid[row][col][i] = selectedIndex === i;
    }
    entropyGrid[row][col] = 1
    console.log(superTileOutputGrid[row][col])
    
    propegate(row, col);
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
            console.log("skipping")
            continue;
        }
        if (isValidPattern(row, col, i) === false) {
            // console.log("invalidPattern")
            superTileOutputGrid[row][col][i] = false;
            // entropyGrid[row][col]--;
        } else {
            console.log("valid pattern")
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

