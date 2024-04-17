
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
    cellTextFunc: (grid, row, col) => grid[row][col]
})

renderGrid(debugOutputCanvas, debugOutputCtx, outputGrid, {
    cellColorFunc: (grid, row, col) => ["white", ...colors][grid[row][col] + 1] ?? "black",
    cellTextFunc: (grid, row, col) => grid[row][col]
})

renderGrid(debugSuperPatternEntropyCanvas, debugSuperPatternEntropyCtx, superTileOutputGrid, {
    cellColorFunc: (grid, row, col) => grid[row][col].filter(v => v === true).length === entropyGrid[row][col] ? "white" : "red",
    cellTextFunc: (grid, row, col) => grid[row][col].filter(v => v === true).length
})

renderGrid(debugSuperColorCanvas, debugSuperColorCtx, superColorOutputGrid, {
    cellColorFunc: (grid, row, col) => ["red", "green"][grid[row][col].filter(v => v === true).length] ?? "white",
    cellTextFunc: (grid, row, col) => grid[row][col].filter(v => v === true).length
})

let patternsList = document.getElementById("patternsList")
let patternCanvases;
let patternCtxs;

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

        //
        patternCanvases.push(newCanvas)
        patternsList.appendChild(newCanvas);
    }
}
debugRenderPatterns()


function renderGrid(canvas, canvasCtx, grid, options) {
    canvasCtx.fillStyle = "white"
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let cellWidth = canvas.width / grid.length
            let cellHeight = canvas.height / grid[i].length
            if (options.cellColorFunc) {
                canvasCtx.fillStyle = options.cellColorFunc(grid, i, j)
                canvasCtx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
            }
            if (options.cellTextFunc) {
                console.log("yo")
                canvasCtx.fillStyle = "black";
                let cellText = options.cellTextFunc(grid, i, j)
                console.log(cellText)
                canvasCtx.fillText(cellText, j * cellWidth + 5, i * cellHeight + 15)
            }
        }
    }
}

