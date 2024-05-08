import { Geometry } from "pixi.js";
import { totalWidth, totallHeight } from "./constants";

export const geometry = new Geometry()
.addAttribute('aVertexPosition', // the attribute name
    [0, 0, // x, y
        totalWidth, 0, // x, y
        totalWidth, totallHeight,
        0, totallHeight], // x, y
    2) // the size of the attribute
.addAttribute('aUvs', 
    [0, 0, // u, v
        1, 0, // u, v
        1, 1,
        0, 1], // u, v
    2) // the size of the attribute
.addIndex([0, 1, 2, 0, 2, 3]);