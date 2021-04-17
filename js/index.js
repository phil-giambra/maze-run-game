let STATE = {}
fetch('assets/maze1.svg')
  .then(response => response.text())
  .then(data => parseMazeSvg(data));

function parseMazeSvg(data){
    let out = {
        max_x:0,
        max_y:0,
        mod:5,
        segments:20,
        lines:[],
        maze:[]
    }

    let lines = data.split("\n")
    for (var i = 0; i < lines.length; i++) {
        let xline = false

        let line = lines[i].trim()
        if (line.startsWith("<line")){
            line = line.replace("<line","").replace("/>","").trim().replace(/"/g, "")
            let parts = line.split(" ")
            let x1 = Math.floor( (parseInt(parts[0].split("=")[1])-2) / 16 )
            let y1 = Math.floor( (parseInt(parts[1].split("=")[1])-2) / 16 )
            let x2 = Math.floor( (parseInt(parts[2].split("=")[1])-2) / 16 )
            let y2 = Math.floor( (parseInt(parts[3].split("=")[1])-2) / 16 )

            if (x1 > out.max_x) { out.max_x = x1  }
            if (y1 > out.max_y) { out.max_y = y1  }
            if (x2 > out.max_x) { out.max_x = x2  }
            if (y2 > out.max_y) { out.max_y = y2  }
            if (y1 == y2) { xline = true }
            out.lines.push([x1,y1,x2,y2,xline])



        }
    }
    // generate the empty maze array
    for (let x = 0; x < out.max_x +1; x++) {
        out.maze[x] = []
        for (let y = 0; y < out.max_y +1; y++) {
            out.maze[x][y] = {x:x, y:y, type:"open", xline:"x"}
        }
    }
    // fill in the wall blocks line by line
    for (let l = 0; l < out.lines.length; l++) {
        if (out.lines[l][4] === true) {
            console.log("xline");
            for (let xx = out.lines[l][0]; xx < out.lines[l][2]; xx++) {
                out.maze[xx][out.lines[l][1]].type = "wall"
                out.maze[xx][out.lines[l][1]].xline = "x"
                //console.log(out.maze[xx][out.lines[l][1]]);
            }
        } else {
            console.log("yline");
            for (let yy = out.lines[l][1]; yy < out.lines[l][3]; yy++) {
                out.maze[out.lines[l][0]][yy].type = "wall"
                out.maze[out.lines[l][0]][yy].xline = "y"
                //console.log(out.maze[out.lines[l][0]][yy]);
            }
        }

    }


    console.log(out);
    buildMazeHtml(out)
}



function buildMazeHtml(data) {
    let maze = data.maze
    let str = ""
    for (let x = 0; x < maze.length; x++) {
        for (let y = 0; y < maze[x].length; y++) {
            let block = maze[x][y]
            if (block.type === "open"){
                str += `<div class="${block.type}" style="top:${(block.y )*10}px;left:${(block.x )*10}px;"></div>`
            }

        }
        document.getElementById("wrapper").insertAdjacentHTML("beforeend", str);
        str = ""
    }
    for (let x = 0; x < maze.length; x++) {
        for (let y = 0; y < maze[x].length; y++) {
            let block = maze[x][y]

            if (block.type === "wall"){
                str += `<div class="${block.type}${block.xline}" style="top:${(block.y )*10}px;left:${(block.x)*10}px;"></div>`
            }
        }
        document.getElementById("wrapper").insertAdjacentHTML("beforeend", str);
        str = ""
    }

}
