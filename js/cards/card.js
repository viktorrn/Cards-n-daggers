import * as Util from '../utilityFunctions.js';
import * as Main from '../main.js';
import * as Interface from '../graphics/UI.js';
import * as StatusEffects from '../encounter/statusEffects.js';

class Card{
    constructor(game){
        //general data

        this.type = 'card';
        this.name = this.cardType = this.playDuration = null;
        this.parentID = null;
        this.id = game.createInstance(this);
        this.ownerID = null;

        this.text = "";
        this.priority = null;

    }
    
    calculatePriority(){
        let p = this.playDuration;
        let ent = Main.getGameObject().getObject(this.ownerID)
        if(ent.priority != null)
            p = (ent.priority+Main.getGameObject().turnOrder.length)*this.playDuration;
        this.priority = p;
    }
}

function displayRangeData(id){
    
    let card = Main.getGameObject().getObject( id )
    let entity = Main.getGameObject().getObject( card.ownerID );
    
    let board = Main.getBoard();
    let temp = new Array();

    for(let i = 0; i < board.ArrayLength; i++){
        temp[i] = -1;
    }

    let range = 0;
    let type = null;

    range = calcCardRange(card);
   

    let oX = entity.position.x;
    let oY = entity.position.y;

    for(let y = - range; y <= range; y++ ){
        let offset = Math.abs(Math.sign(y))
        for(let x = - (range - Math.abs(y) +offset ); x <= (range - Math.abs(y) +offset ); x++ ){

            let Cx = x + oX;
            let Cy = y + oY;
            
            if(Cx > -1 && Cx < board.size.w && Cy > -1 && Cy < board.size.h){
                
                temp[Cy*board.size.w+Cx] = 0; 

            }
        }
    }
    
    board.drawCardBoard(temp,type,card)
}

function createCardDOM(c){
    
    let game = Main.getGameObject();
    let owner = game.getObject(c.ownerID);
    let id = c.id;

    //card
        let card = document.createElement('div');
        
        card.style.transform = "scale(1,1)";
        card.style.zIndex = 100;
        card.style.outline = "3px solid "+owner.color;

        
        card.setAttribute("id",id);
        card.setAttribute("class","Card");

        
        
    //icons
        let type = document.createElement('div');
        type.setAttribute("class","type");

        let typeImg = document.createElement('img');

        let imgC = undefined;
        imgC = Interface.getCardTypeIcon(c.cardType);

        if(imgC != undefined){
            typeImg.src = imgC;
        }else{
            type.style.visibility = "hidden";
        }
        type.appendChild(typeImg)

        let pd = document.createElement('div');
        pd.setAttribute("class","playDuration");
        pd.innerHTML = c.playDuration;

        let header = document.createElement('div')
        header.setAttribute('class','cardHeader')
        
    

    //data
        let dataContainer = document.createElement('div');
        dataContainer.setAttribute("class","data-container");

            let img = document.createElement('div');
            img.setAttribute("class","img");

            let name = document.createElement('div');
            name.setAttribute("class","name");
            name.innerHTML = c.name;



            //text

            let text = document.createElement('div');
            text.setAttribute("class","text");
            text.innerHTML = formatText(c,owner)


            //plates
            let namePlate = document.createElement('div');
            let footer = document.createElement('div');

            if(c.rare == true){
                namePlate.setAttribute('class','rareCardNamePlate');
                footer.setAttribute('class','rareCardFooter');
            }
            else{
                namePlate.setAttribute('class','cardNamePlate');
                footer.setAttribute('class','cardFooter');
            }
      
    card.appendChild(type);
    card.appendChild(pd);
    card.appendChild(header);

    dataContainer.appendChild(img);
    dataContainer.appendChild(name);
    dataContainer.appendChild(text);
    dataContainer.appendChild(footer);
    dataContainer.appendChild(namePlate);

    card.appendChild(dataContainer);
   

    return card;
}

function formatText(c,owner){
    let text = c.text;
    if(c.mutation == undefined){
        text = formatSpecificText(c,text,owner);
    }
    else{
        for(let i in c.mutation){
            text = formatSpecificText(c.mutation[i],text,owner)
        }
    }
    return text;
}

function formatSpecificText(c,text,owner){
    let sharp = StatusEffects.getSharpen(owner)
    let weak = StatusEffects.getWeaken(owner)
    

    switch(c.cardType){
        case 'attack':
            let orig = c.attackData.damage;
            let rep = parseInt( weak*(orig+sharp) +0.5)

            if(rep > orig){
                rep = Interface.styleText(rep,"green",false,true)
            }else if(rep < orig){
                rep = Interface.styleText(rep,"weak",false,true)
            }
            text = text.replace("{damage}", rep );
        break;

        case 'move':
            text = text.replace("{step}",c.moveData.range);
        break;

        case 'block':
            switch(c.blockData.type){
                case 'parry':
                    let orig = c.blockData.parryData.attackData.damage;
                    let rep = parseInt( weak*(orig+sharp) +0.5)
                    
                    if(rep > orig){
                        rep = Interface.styleText(rep,"green",false,true)
                    }else if(rep < orig){
                        rep = Interface.styleText(rep,"weak",false,true)
                    }
                    text = text.replace("{damage}", rep );
                break;
            }
        break;
    }

    let range = calcCardRange(c);
    let t;
    if(range == undefined || range == 0 || c.cardType == "move")
        t = text;
    else    
        t = "Range " + range +". " +text; 
        
    return t;
}

function createCard(Carddata,ownerID,parentID,game){
    game = Main.getGameObject();
    let data = Util.copyObject(Carddata);
    let card = new Card(game);
    card.ownerID = ownerID;

    //console.log("data",data)

    if(parentID != null){
        card.parentID = parentID;
    }

    //console.log("card data ",data)
    card.name = data.name;
    card.cardType = data.cardType;
    card.playDuration = data.playDuration;

 
    if(data.mutation == undefined){
        switch(data.cardType){
            case 'attack':
                card.attackData = data.attackData;
                //console.log("attack card")
                break;
    
            case 'move':
                card.moveData = data.moveData;
                //console.log("move card")
                break;
    
            case 'block':
                card.blockData = data.blockData;
                break;
            
            case 'state':
                card.stateData = data.stateData;
            break;
        }
    }
    else{
        card.mutation = data.mutation;
        //console.log("mutation card found")
    }

    

    if(data.text != undefined)
        card.text = data.text;

    if(data.cost != undefined)
        card.cost = data.cost;

    if(data.rare != undefined)
        card.rare = true;
    
    
    //console.log("card text",card.text)

    return card;
}

export function calcCardRange(card){
    let range = 0;
    if(card.mutation == undefined){
        range = calcSpecificCardRange(card)
    }else{
        for(let i in card.mutation){
            range += calcSpecificCardRange(card.mutation[i]);
        }
    }
    return range;
}

function calcSpecificCardRange(card){
    let range = 0;
    switch(card.cardType){
        case 'move':
            range = card.moveData.range;
        break;

        case 'attack':
            range = card.attackData.range;
        break;

        case 'state':
            range = card.stateData.range;
            break;

        case 'block':
            range = card.blockData.range;
            break;
    }
    return range;
}

//player functions

export {Card,createCardDOM,createCard,displayRangeData}