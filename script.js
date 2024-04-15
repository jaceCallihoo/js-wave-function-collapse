// constants ----------------------------------------------------------------->
const inputGridRows = 10;
const inputGridCols = 10;
const inputCanvasCellSize = 31
const inputGridTileSize = 3



// globals ------------------------------------------------------------------->
let inputGrid = Array(inputGridRows).fill().map(() => Array(inputGridCols).fill(0));
let colorIndex = 1

// setup --------------------------------------------------------------------->
let inputCanvas = document.getElementById("inputCanvas")
inputCanvas.width = inputGridCols * inputCanvasCellSize
inputCanvas.height = inputGridRows * inputCanvasCellSize

let ctx = inputCanvas.getContext("2d")

ctx.fillStyle = "green"
ctx.fillRect(0, 0, inputCanvas.width, inputCanvas.height)

inputCanvas.addEventListener("click", (event) => {
    const rect = inputCanvas.getBoundingClientRect()
    const clickX = event.clientX - rect.x
    const clickY = event.clientY - rect.y

    const x = Math.floor((clickX / inputCanvas.width) * inputGridCols)
    const y = Math.floor((clickY / inputCanvas.height) * inputGridRows)

    console.log({x, y})
    inputGrid[y][x] = colorIndex;
    renderInput()
})

// render -------------------------------------------------------------------->
function renderInput() {
    for (let i = 0; i < inputGridRows; i++) {
        for (let j = 0; j < inputGridCols; j++) {
            ctx.fillStyle = ["blue", "red", "green"][inputGrid[i][j]]
            let cellWidth = inputCanvas.width / inputGridCols
            let cellHeight = inputCanvas.height / inputGridRows
            ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
        }
    }
}

// wave function collapse ---------------------------------------------------->

// use the input grid to create the input

