import * as Main from '../main.js';

function colorList(col){
    switch(col){
        case 'yellow':
            return "#ffea00";

        case 'red':
            return "#701f09";

        case 'blood':
            return "#750d0d";

        case 'purple':
            return "#581a91";

        case 'green':
            return "#088014";

        case 'white':
            return "#ffffff";

        case 'move':
            return "#dbcc67";

        case 'playerTiles':
            return "#125e87";

        case 'enemyTiles':
            return "#8a2828";

        case 'weak':
            return "#f0782e";

        default:
            return col;
    }
}

function getStyleForEffect(effect){
    let style = {
        color:null,
        outline:false,
        bold:false
    }

    switch(effect){
        case 'bleed':
            style.color = "blood";
            style.outline = false;
            style.bold = true;
            break;

        case 'critical':
            style.color = "yellow";
            style.outline = true;
            style.bold = true;
            break;
    }
    return style;
}

function colorText(str,color){
    let span;

    span = "<span style='color:";
    span += colorList(color)+"'>"; 
    span += " "+str+" "+"</span>";

    return span;
}

function styleText(str,color,outline,bold){
    let span = "<span style=";
    if(color != null){
        span += "'color:"+colorList(color)+";"
    }

    if(outline == true){
        span+="-webkit-text-stroke-width: 1px; -webkit-text-stroke-color: rgba(71, 71, 68, 0.9);"
    }

    if(bold == true){
        span+="font-weight:bold;";
    }
    span += ";'>"+" " + str +" " + "</span>"
    return span;
}

export function RGBA(r,g,b,a){
    return 'rgba(' + [r,g,b,a].join(',') + ')';
}

export function RGB(r,g,b){
    return 'rgba(' + [r,g,b].join(',') + ')';
}

export function ShowToolTip(text,element){
    
    let div = document.createElement('div');
    div.setAttribute('id','toolTip');
    div.innerHTML = text;
    document.body.appendChild(div);

    let divWidth = div.offsetWidth;
    let divHeight = div.offsetHeight +30;
    
    let divX = Main.getOffset(div).left;
    let divY = Main.getOffset(div).top;

    console.log("yOffset",divHeight)

    let x = Main.getOffset(element).left;
    let y = Main.getOffset(element).top;

    while(divY + divHeight > y +10){
        divY--; 
    }

    div.style.top = divY;
    div.style.left = x;
    
}

export function HideToolTip(){
    while(Main.$('toolTip') != undefined){
        document.body.removeChild(Main.$('toolTip'))
    }
}

export function getCardTypeIcon(cardType){
    switch(cardType){
        case 'attack':
            return "../art/UI/attack.png";
        break;

        case 'move':
            return "../art/UI/move.png";
        break;

        case 'idle':
            return "../art/UI/idle.png";
        break;

        case 'block':
            return "../art/UI/block.png";
        break;

        case 'state':
            return "../art/UI/state.png";

    }
    return undefined;
}





export{colorList};
export {colorText,styleText,getStyleForEffect};