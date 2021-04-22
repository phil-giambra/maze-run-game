let STATE = {}

let wrapper = document.getElementById("wrapper")
document.addEventListener("keyup", handleKeyUp)
fetch('assets/maze1s.svg').then(response => response.text()).then(data => parseMazeSvg(data));


let out
function parseMazeSvg(data){
    out = {
        max_x:0,
        max_y:0,
        blksize:40,
        wallsize:8,
        segments:20,
        xlines:{},
        ylines:{},
        maze:[],
        solution:null,
        start_pos:null,
        end_pos:null

    }
    let lines = data.split("\n")
    out.segments = (parseInt(lines[2].split(" ")[1].split('"')[1]) - 4) / 16
    console.log("segments :",out.segments );
    for (let x = 0; x < out.segments +1; x++) {
        out.maze.push([])
        for (let y = 0; y < out.segments+1; y++) {
            out.maze[x].push({x:x,y:y, xwall:false, ywall:false, type:"open"})
        }
    }


    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim()
        if (line.startsWith("<line")){
            line = line.replace("<line","").replace("/>","").trim().replace(/"/g, "")
            let parts = line.split(" ")
            let x1 = Math.floor( (parseInt(parts[0].split("=")[1])-2) / 16 )
            let y1 = Math.floor( (parseInt(parts[1].split("=")[1])-2) / 16 )
            let x2 = Math.floor( (parseInt(parts[2].split("=")[1])-2) / 16 )
            let y2 = Math.floor( (parseInt(parts[3].split("=")[1])-2) / 16 )

            if (y1 == y2) {
                for (let x = x1; x < x2 ; x++) {
                    //console.log("xwall",x,y1);
                    out.maze[x][y1].xwall = true
                }
            } else {
                for (let y = y1; y < y2 ; y++) {
                    //console.log("ywall",x1,y);
                    out.maze[x1][y].ywall = true
                }
            }
        }
        if (line.startsWith("<polyline")){
            let sol = line.split("=")
            sol = sol[sol.length-1].replace(/"/g, "").replace("/>","").trim()
            out.solution = sol.split(" ")

            for (let s = 0; s < out.solution.length; s++) {
                out.solution[s] = out.solution[s].split(",")
                out.solution[s][0] = Math.floor(parseInt(out.solution[s][0]-2) / 16 )
                out.solution[s][1] = Math.floor(parseInt(out.solution[s][1]-2) / 16 )
            }
            out.start_pos = out.solution[0]
            out.end_pos = out.solution[out.solution.length -1]
            /*
            out.start_pos = out.solution[0].split(",")
            out.end_pos = out.solution[out.solution.length -1].split(",")
            out.start_pos[0] = Math.floor(parseInt(out.start_pos[0]-2) / 16 )
            out.start_pos[1] = Math.floor(parseInt(out.start_pos[1]-2) / 16 )
            out.end_pos[0] = Math.floor(parseInt(out.end_pos[0]-2) / 16 )
            out.end_pos[1] = Math.floor(parseInt(out.end_pos[1]-2) / 16 )
            */
        }
    }
    console.log(out);
    buildMazeHtml(out)
}

function buildMazeHtml(data) {
    let maze = data.maze
    let mod = data.blksize
    let str = ""
    for (let x = 0; x < maze.length; x++) {
        for (let y = 0; y < maze[x].length; y++) {
            let block = maze[x][y]
            str += `<div id="blk_${block.x}_${block.y}" class="basic_block" style="top:${(block.y )*mod}px;left:${(block.x )*mod}px;height:${mod}px;width:${mod}px;">`
            if (block.xwall === true) {
                str += `<div class="xwall" style="top:0px;left:0px;height:${data.wallsize}px;width:${mod}px;"></div>`
            }
            if (block.ywall === true) {
                str += `<div class="ywall" style="top:0px;left:0px;height:${mod}px;width:${data.wallsize}px;"></div>`
            }
            str += `</div>`


        }
        document.getElementById("wrapper").insertAdjacentHTML("beforeend", str);
        str = ""
    }
    let blocks = document.getElementsByClassName('basic_block')
    for (var i = 0; i < blocks.length; i++) {
        blocks[i].addEventListener("click", moveToBlock)
    }

    // put player in start_pos
    STATE.player.x = out.start_pos[0]
    STATE.player.y = out.start_pos[1]
    str = `<div id="player" class="player_block" style="top:${(STATE.player.y )*mod}px;left:${(STATE.player.x )*mod}px;height:${mod}px;width:${mod}px;"></div>`
    document.getElementById("wrapper").insertAdjacentHTML("beforeend", str);
}

STATE.player = {
    x:null,
    y:null

}

function handleKeyUp(event){
    console.log("keyup", event.keyCode);
    if (event.keyCode == 37){ // left
         moveToBlock(`blk_${STATE.player.x - 1}_${STATE.player.y}`)
    }
    if (event.keyCode == 38){ //up
         moveToBlock(`blk_${STATE.player.x}_${STATE.player.y - 1}`)
    }
    if (event.keyCode == 39){ //right
         moveToBlock(`blk_${STATE.player.x + 1}_${STATE.player.y}`)
    }
    if (event.keyCode == 40){ //down
         moveToBlock(`blk_${STATE.player.x}_${STATE.player.y + 1}`)
    }
}

function moveToBlock(event){
    console.log("moveToBlock");
    let parts
    if (typeof(event) === "string"){
        parts = event.split("_")
    } else {
        parts = event.target.id.split("_")
    }
    let maze = out.maze
    let p = STATE.player
    let pdiv = document.getElementById("player")
    let x,y
    let move = {x:null,y:null, xmove:null, ymove:null, ok:true}

    if( parts.length == 3 ) {
        move.x = parseInt(parts[1])
        move.y= parseInt(parts[2])
        // stop multi block and diagonal moves
        let calcx = Math.abs(move.x - p.x)
        let calcy = Math.abs(move.y - p.y)
        if (calcx > 1) { move.ok = false}
        if (calcy > 1) { move.ok = false}
        if (calcx > 0 && calcy > 0) {move.ok = false}
        if (move.x < 0 || move.y < 0) {move.ok = false}
        // check which direction were trying to move
        if (move.x !== p.x ) {
            console.log("moving x", move.x, p.x);
            if (move.x > p.x) {move.xmove = "+"} else {move.xmove = "-" }
        }
        if (move.y !== p.y ) {
            console.log("moving y", move.y, p.y);
            if (move.y > p.y) {move.ymove = "+"} else {move.ymove = "-" }
        }
        if ( move.ymove == "+" && maze[move.x][move.y].xwall === true) { move.ok = false}
        if ( move.ymove == "-" && maze[p.x][p.y].xwall === true) { move.ok = false}

        if ( move.xmove == "+" && maze[move.x][move.y].ywall === true) { move.ok = false}
        if ( move.xmove == "-" && maze[p.x][p.y].ywall === true) { move.ok = false}
        console.log(out.maze[move.x][move.y], move);
        // move the player
        if (move.ok === true) {
            pdiv.style.left = (move.x * out.blksize) + "px"
            pdiv.style.top = (move.y * out.blksize) + "px"
            STATE.player.x = move.x
            STATE.player.y = move.y
            //if (move.x ==)
        }

    }
}
