
let debugEntropyCanvas = document.getElementById("debugEntropyCanvas");
debugEntropyCanvas.height = entropyGrid.length * outputCanvasCellSize
debugEntropyCanvas.width = entropyGrid[0].length * outputCanvasCellSize
let debugEntropyCtx = debugEntropyCanvas.getContext("2d")

let debugOutputCanvas = document.getElementById("debugOutputCanvas")
debugOutputCanvas.height = outputGrid.length * outputCanvasCellSize
debugOutputCanvas.width = outputGrid[0].length * outputCanvasCellSize
let debugOutputCtx = debugOutputCanvas.getContext("2d")

let debugSuperPatternEntropyCanvas = document.getElementById("debugSuperPatternEntropyCanvas")
debugSuperPatternEntropyCanvas.height = superTileOutputGrid.length * outputCanvasCellSize
debugSuperPatternEntropyCanvas.width = superTileOutputGrid[0].length * outputCanvasCellSize
let debugSuperPatternEntropyCtx = debugSuperPatternEntropyCanvas.getContext("2d")

let debugSuperColorCanvas = document.getElementById("debugSuperColorCanvas")
debugSuperColorCanvas.height = superColorOutputGrid.length * outputCanvasCellSize
debugSuperColorCanvas.width = superColorOutputGrid[0].length * outputCanvasCellSize
let debugSuperColorCtx = debugSuperColorCanvas.getContext("2d")

renderGrid(debugEntropyCanvas, debugEntropyCtx, entropyGrid, {
    cellColorFunc: (grid, row, col) => ["grey", "green"][grid[row][col]] ?? "white",
    cellTextFunc: (grid, row, col) => grid[row][col],
    borderFirstPattern: true
})

renderGrid(debugOutputCanvas, debugOutputCtx, outputGrid, {
    cellColorFunc: (grid, row, col) => ["white", ...colors][grid[row][col] + 1] ?? "black",
    cellTextFunc: (grid, row, col) => grid[row][col],
    borderFirstPattern: true
})

renderGrid(debugSuperPatternEntropyCanvas, debugSuperPatternEntropyCtx, superTileOutputGrid, {
    cellColorFunc: (grid, row, col) => grid[row][col].filter(v => v === true).length === entropyGrid[row][col] ? "white" : "red",
    cellTextFunc: (grid, row, col) => grid[row][col].filter(v => v === true).length,
    borderFirstPattern: true
})

renderGrid(debugSuperColorCanvas, debugSuperColorCtx, superColorOutputGrid, {
    cellColorFunc: (grid, row, col) => ["red", "green"][grid[row][col].filter(v => v === true).length] ?? "white",
    cellTextFunc: (grid, row, col) => grid[row][col].filter(v => v === true).length,
    borderFirstPattern: true
})

let patternsList = document.getElementById("patternsList")
function debugRenderPatterns() {
    patternsList.innerHTML = "";
    patternCanvases = [];
    patternCtxs = [];
    for (let i = 0; i < patterns.length; i++) {
        let newCanvas = document.createElement('canvas')
        newCanvas.height = patterns[i].length * outputCanvasCellSize
        newCanvas.width = patterns[i][0].length * outputCanvasCellSize
        newCanvas.style.paddingRight = '4px';
        let newCtx = newCanvas.getContext('2d')

        renderGrid(newCanvas, newCtx, patterns[i], {
            cellColorFunc: (grid, row, col) => colors[grid[row][col]]
        })

        patternsList.appendChild(newCanvas);
    }
}
debugRenderPatterns()


function renderGrid(canvas, canvasCtx, grid, options) {
    canvasCtx.fillStyle = "white"
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

    let cellWidth = canvas.width / grid.length
    let cellHeight = canvas.height / grid[0].length
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (options.cellColorFunc) {
                canvasCtx.fillStyle = options.cellColorFunc(grid, i, j)
                canvasCtx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
            }
            if (options.cellTextFunc) {
                canvasCtx.fillStyle = "black";
                let cellText = options.cellTextFunc(grid, i, j)
                canvasCtx.fillText(cellText, j * cellWidth + 5, i * cellHeight + 15)
            }
        }
    }

    if (options.borderFirstPattern) {
        canvasCtx.strokeStyle = "black"
        canvasCtx.lineWidth = 2
        let [x, y] = debugFirstPatternIndex;
        canvasCtx.strokeRect(y * cellWidth, x * cellHeight, patternSize * cellWidth, patternSize * cellHeight)

    }
}

