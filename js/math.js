export function degToRad(deg){
    return deg*(Math.PI/180)
}

export function dist(x1,y1,x2,y2){
    return Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) )
}