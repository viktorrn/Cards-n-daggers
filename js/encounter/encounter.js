import * as Main from '../main.js';
import * as Card from '../cards/card.js';
import * as CardHandling from '../cards/cardHandling.js';
import * as CardPlayer from './playCards.js';
import * as StatusEffects from '../encounter/statusEffects.js';

import * as Util from '../utilityFunctions.js';
import * as Interface from '../graphics/UI.js';
import * as Enemy from '../entities/enemy.js';

class Board{
    constructor(game){
        this.type = 'board';
        this.id = game.createInstance(this);
        this.Key = null;
        this.interactKey = null;

        this.ents = null;

        this.size = {w:8,h:8}
        this.ArrayLength = this.size.w*this.size.h;
        this.playerSpaceWidth = 2;

        this.boardTiles = new Array();

        this.board = new Array();    
    }

    //generall functions

    startRun(){
        this.initBoardTiles();
        this.resetBoard();
    }

    endRun(){
        this.resetBoardTiles();
    }

    startEncounter(){
        this.initBoard();
    }

    endEncounter(){
        Main.$(Main.clearDOMElement(this.Key));
        this.resetBoard();
    }

    //

    initBoardTiles(){
        for(let i = 0; i < this.ArrayLength; i++){
            let bt = new BoardTile(Main.getGameObject());
            bt.index = i;
            this.boardTiles.push(bt);
        }
    }

    resetBoard(){
        for(let i = 0; i < this.ArrayLength;i++){
            this.board[i] = -1;
        } 
    }

    resetBoardTiles(){
        while(this.boardTiles.length > 0){
            Main.getGameObject().destroyInstance(this.boardTiles[0].id);
            this.boardTiles.splice(0,1)
        }
    }

    addEntityToBoard(ent){
        //console.log(ent,pos)
        let obj = {id:null,type:null,name:null};
        obj.type = ent.type;
        obj.name = ent.name;
        obj.id = ent.id;
        this.board[this.size.w*ent.position.y+ent.position.x] = obj;
    }

    initBoard(){
        this.resetBoard();
       
        for(let e in Main.getGameObject().turnOrder){
            let ent = Main.getGameObject().getObject(Main.getGameObject().currentEncounter[e])
            switch(ent.type){
                case 'enemy':
                    Main.getGameObject().getObject(ent.ownerID).SetPosition();
                    this.addEntityToBoard(ent)
                    break;
            }
        }
        //this.initTurnBoard();
    }

    removeEntityFromBoard(id){
        for(let i = 0; i < this.ArrayLength; i++){
            if(this.board[i] != -1){
                if(this.board[i].id == id)
                    this.board[i] = -1;
            }
            
        }
    }
    
    /*initTurnBoard(){
        this.turnBoard = Util.copyArray(this.board);
    }*/

    //timeline and card placement

    //interact stuff
    drawInteractBoard(tiles,type){
       
        Main.clearDOMElement(this.interactKey)
        this.interactKey.style.zIndex = 100;
        for(let h = 0; h < this.size.h; h++){
            let tr = document.createElement('tr');
            for(let r = 0; r < this.size.w; r++){
                let td = document.createElement('td');
                if(tiles[this.size.w*h+r] == 0){
                    
                    td.onpointerenter = onBoardTileOver;
                    td.onpointerleave = onBoardTileOut;
                    td.onclick = onBoardTileKlicked;
                    
                    switch(type){
                        case 'tile':
                        case 'target':
                            td.style.outline = "4px solid red";
                        break;
                        case 'move':
                            td.style.outline = "4px solid blue";
                        break;
                    }
                    
                    td.style.zIndex = 100;

                    td.setAttribute("index",(this.size.w*h+r))
                    }
                tr.appendChild(td);
            }
            this.interactKey.appendChild(tr);
        }
    }

    drawCardBoard(tiles,type,card){
        //console.log("interact key",this.interactKey)
        Main.clearDOMElement(this.interactKey)
        let parent = Main.getGameObject().getObject(card.ownerID);

        for(let h = 0; h < this.size.h; h++){
            let tr = document.createElement('tr');
            for(let r = 0; r < this.size.w; r++){
                let td = document.createElement('td');
                if(tiles[this.size.w*h+r] == 0){
                    
                    switch(parent.type){
                        case 'enemy':
                            td.style.outline = "4px solid" + Interface.colorList("enemyTiles");
                        break;
                        case 'player':
                            td.style.outline = "4px solid" + Interface.colorList("playerTiles");
                        break;
                    }
                    
                    td.style.zIndex = 100;

                    td.setAttribute("index",(this.size.w*h+r))
                    }
                tr.appendChild(td);
            }
            this.interactKey.appendChild(tr);
        }
    }
  
        //card stuff
        displayEntityCard(id){
            let game = Main.getGameObject()
            let ent = game.getObject(id);
            let actionList = Main.getActionList();
            
            let card = ent.playedCards[actionList.currentTurn];

            if(card != null || card != undefined){

                if(card.mutation == undefined){
                    this.displayCard(ent,card);
                }else{
                    for(let i in card.mutation){
                        //console.log("card.mutation[i]",card.mutation[i])
                        this.displayCard(ent,card.mutation[i]);
                    }
                }
                
            } 
        }

        displayCard(ent,card){
            //console.log("card",card)
            let game = Main.getGameObject()
            let ind = ent.position.y*this.size.w+ent.position.x;
           
            //console.log("card",card,"cards in hand",owner.hand)
            //console.log("played cards",ent,"cards in hand",owner.hand)
            let btCurr;
            let btTarget;
            let c;
            let t;
            let offset = 22;
            
            if(false == true){
                switch(card.cardType){
                    case 'move':
                        btCurr = Main.$("bt-"+ind);
                        btTarget = Main.$("bt-"+card.moveData.movePos);
                        //console.log("cur",btCurr,"bt target",btTarget);
                        c = Main.getOffset(btCurr);
                        t = Main.getOffset(btTarget);
                        if(btTarget == null)
                            t = c;
                        //console.log("cur",c,"target",t);
    
                        
    
                        document.body.appendChild(Main.drawLine(c.left+offset,c.top+offset,t.left+offset,t.top+offset,Interface.colorList("move")));
                    break;
    
                    case 'attack':
                        btCurr = Main.$("bt-"+ind);
    
                        switch(card.attackData.pattern){
                            case 'tile':  
                                btTarget = Main.$("bt-"+card.attackData.target);  
                            break;
    
                            case 'target':
                                btTarget = Main.$(this.getBoardTileByEntityID(card.attackData.target));
                            break;
                        }
    
                         //console.log("cur",btCurr,"bt target",btTarget);
                         c = Main.getOffset(btCurr);
                         t = Main.getOffset(btTarget);
    
                         if(btTarget == null)
                            t = c;
                         //console.log("cur",c,"target",t);
     
                     
                         if(card.attackData.target != null || card.attackData.target != undefined)
                            document.body.appendChild(Main.drawLine(c.left+offset,c.top+offset,t.left+offset,t.top+offset,Interface.colorList("red")));
                    break;
                }
            }

            switch(card.cardType){
                case 'move':
                    btCurr = Main.$("bt-"+ind);
                    btTarget = Main.$("bt-"+card.moveData.movePos);
                    //console.log("cur",btCurr,"bt target",btTarget);
                    c = Main.getOffset(btCurr);
                    t = Main.getOffset(btTarget);
                    if(btTarget == null)
                        t = c;

                    document.body.appendChild(Main.drawImageIcon(t.left+offset,t.top+offset,card));
                break;

                case 'attack':
                    btCurr = Main.$("bt-"+ind);

                    switch(card.attackData.pattern){
                        case 'tile':  
                            btTarget = Main.$("bt-"+card.attackData.target);  
                        break;

                        case 'target':
                            btTarget = Main.$(this.getBoardTileByEntityID(card.attackData.target));
                        break;
                    }
                     c = Main.getOffset(btCurr);
                     t = Main.getOffset(btTarget);

                     if(btTarget == null)
                        t = c;
 
                    document.body.appendChild(Main.drawImageIcon(t.left+offset,t.top+offset,card));
                break;
            }
            
            
        }
        
    
        hideEntityCard(){
            while(Main.$('actionIcon') != undefined){
                document.body.removeChild(Main.$('actionIcon'));
            }
        }

    //draw regular board
    drawSpecificBoard(board){

        for(let i = 0; i < this.ArrayLength; i++){
            this.boardTiles[i].data = board[i]; 
        }

        Main.eraseBoardEntities();
        Main.clearDOMElement(this.Key);
        
        for(let h = 0; h < this.size.h; h++){
            let tr = document.createElement('tr');
            for(let r = 0; r < this.size.w; r++){
                let td = document.createElement('td');
                td.setAttribute("id","bt-"+parseInt(this.size.w*h+r))

                if(this.boardTiles[this.size.w*h+r].data != -1){
                    
                    let ent = Main.getGameObject().getObject(this.boardTiles[this.size.w*h+r].data.id);
                    //td.appendChild(ent.getBoardEntityData());
                    let offset = Main.getOffset(this.Key);
                    let dy = offset.top;
                    let dx = offset.left;

                    let be = ent.getBoardEntityData();

                    be.style.top = dy + 80*h;
                    be.style.left = dx + 83*r;
                    

                    document.body.appendChild(be);

                }
                tr.appendChild(td);
            }
            this.Key.appendChild(tr);
        }
    }

    //regular display  

    drawData(ent){

        let li = document.createElement('li');

        let div = document.createElement('div');

        div.setAttribute('id','sidebar-entity');
        //div.style.backgroundColor = Interface.colorList(ent.color);

        div.innerHTML = Interface.styleText(Interface.styleText(ent.name,ent.color,false,false) + Interface.styleText("Health","red",false,false) + ent.health + " pos " +ent.position.x + "," + ent.position.y,null,false,true);
        
        let debList = undefined;
        let debTitle = undefined;

        if(ent.debuffs.length > 0){
            
            debTitle = document.createElement('li');
            debTitle.innerHTML = Interface.styleText("Debuffs:",null,false,true);
            debList = document.createElement('ul')

            for(let i in ent.debuffs){
                let deb = document.createElement('li');
                let style = Interface.getStyleForEffect(ent.debuffs[i].effect)
                deb.innerHTML = Interface.styleText(ent.debuffs[i].effect,style.color,style.outline,style.bold)
                deb.innerHTML +=": "+ent.debuffs[i].value;

                debList.appendChild(deb);
            }
        }
        if(debTitle != undefined){
            div.appendChild(debTitle);
            div.appendChild(debList);
        }
    
        li.appendChild(div);
        this.ents.appendChild(li);
    }

    getBoardTileByEntityID(entityID){
        for(let i in this.board){
            if(this.board[i] != -1){
                if(this.board[i].id == entityID){
                    return ("bt-"+i);
                }
            }
        }
    }

    getEntityPosition(board,ID,caller){
        //console.log("id",ID)
        //console.log("board",board)
        //console.log("caller",caller)
        for(let i in board){
            if(board[i] != -1){
                if(board[i].id == ID){
                    return {x : Main.getX(i), y : Main.getY(i)}
                }
            }
        }
    //console.log("entity not found on board",ID);
    return null;
    }

}

class BoardTile{
    constructor(game){
        this.type = 'boardTile';
        this.id = game.createInstance(this);
        this.data = -1;
        this.index = null;
        
    }
}

class ActionHandler{
    constructor(game){
        this.type = 'actionHandler';
        this.id = game.createInstance(this);
        this.eventList = new Array();
        
        this.currentTurn = 0;
        this.cardsToPlay = new Array();
    
    }

    playSet(){
        
        for(let e in Main.getGameObject().turnOrder){
            StatusEffects.procStatusEffects("endOfSet",Main.getGameObject().getObject( Main.getGameObject().turnOrder[e]));
            StatusEffects.valueChangeStatusEffects("endOfSet", Main.getGameObject().getObject( Main.getGameObject().turnOrder[e]) )
        }
        
        Main.getGameObject().printLog();
        Main.getHand().pushPlayedCardsToDiscardPile();
        Main.getGameObject().startNewSet();
    }

    clearCardsToPlay(){
        this.cardsToPlay = new Array();
    }

    //set play
    getCardsToPlay(){
        this.clearCardsToPlay();
        let actionList = Main.getActionList();

        for(let turn in actionList.List){
            this.cardsToPlay.push(Util.copyArray(actionList.List[turn].List));
        }
    }

    //turn play
    playTurn(){
        let turn = Main.getActionList().currentTurn;
        this.getCardsFromTurn(turn);
        this.playCards();
        Main.getGameObject().printLog();
     
        //Main.$('actions').scrollTop = Main.$('actionLog').scrollHeight;
    }

    getCardsFromTurn(turn){
        let actionList = Main.getActionList();
        this.clearCardsToPlay();
        this.cardsToPlay.push(Util.copyArray(actionList.List[turn].List));
    }

    //play cards
    playCards(){
        let game = Main.getGameObject();
        for(let turn in this.cardsToPlay){
            for(let c in this.cardsToPlay[turn]){
                CardPlayer.playCard(this.cardsToPlay[turn][c]);
            }
            CardPlayer.clearStateCards();
        }
        
    }
    
}

class ActionList{
    constructor(game){
        this.type = 'actionList';
        this.List = new Array(); 
        this.id = game.createInstance(this);

        this.currentListIndex = null;
       
        this.Key = null;

        this.currentTurn = null;
    }
    
    //main functions

    startRun(){
        this.createRowContainers();
    }

    newSet(){
        this.emptyRowContainerLists();
        this.pushCardsToContainer();
    }    

    endEncounter(){
        Main.$(Main.clearDOMElement(this.Key));
        this.emptyRowContainerLists();
    }

    endRun(){
        this.endEncounter();
        this.resetList();
    }


    //other
    resetList(){
        for(let i in this.List){
            Main.getGameObject().destroyInstance(this.List[i].id);
        }
        this.List = new Array();
        //this.createRowContainers();
    }

    emptyRowContainerLists(){
        this.currentTurn = 0;
        for(let i in this.List){
            this.List[i].resetList();
        }
    }

    createRowContainers(){
        for(let i = 0; i < Main.getGameObject().turnsInSet; i++){
            let RC = new RowContainer(Main.getGameObject())
            RC.index = i;
            this.List.push(RC);
        }
    }

    pushCardsToContainer(){
        let game = Main.getGameObject();
        for(let i = 0; i < game.turnsInSet; i++){
            for(let e in game.turnOrder){
                let ent = game.getObject(game.turnOrder[e]);
                
                switch(ent.type){
                    case 'player':
                    
                    break;
    
                    default:
                        if(ent.playedCards[i] != null){
    
                            let card = ent.playedCards[i];
                            this.placeCardInRowContainer(card,i);
                        
                        }       
                    break;
                }
            }
        }
        this.orderCards()
    }

    getNumber(i){
        switch(i)
        {
            case 1:
                return "I";
            break;

            case 2:
                return "II";
            break;

            case 3:
                return "III";
            break;

            case 4:
                return "IV";
            break;
        }
    }

    addDropZone(){
        Main.$('playCard').onpointerenter = CardHandling.onPlayEnter;
        Main.$('playCard').onpointerleave = CardHandling.onPlayLeave;
        Main.$('playCard').style.zIndex = 25;
    }

    removeDropZone(){
        Main.$('playCard').onpointerenter = null;
        Main.$('playCard').onpointerleave = null;
        Main.$('playCard').style.zIndex = -3;
    }

    draw(){

        Main.clearDOMElement(Main.$('actionList'));
        
        let game = Main.getGameObject()

        for(let i = 0; i < game.turnsInSet; i++){
            let li = document.createElement('li');
            li.setAttribute('id',this.List[i].id);
            li.setAttribute('index',i)

            let d = document.createElement('div');
            d.setAttribute('id','displayIndex');
            d.innerHTML = this.getNumber(i+1);
            li.appendChild(d);
            
                for(let ii in this.List[i].List){
                    if(!Main.getGameObject().getObject(this.List[i].List[ii].ownerID).isDead){

                        let card = Card.createCardDOM(this.List[i].List[ii]);
                        card.onpointerenter = CardHandling.onCardEntered;
                        card.onpointerleave = CardHandling.onCardExited;
                        card.style.zIndex = 1;
    
                        if(i == this.currentTurn){
                            card.style.visibility = "visible";
                        }
                        else{
                            card.style.visibility = "hidden";
                        }
    
                        li.appendChild(card);
                    }
                   
                }
            
            if(i != this.currentTurn){
                li.style.transform = "scale(0.7,0.7)";
            }
           
            Main.$('actionList').appendChild(li);
        }

    }

    displayEntityCards(entityID){

        let game = Main.getGameObject();
     
        for(let i = this.currentTurn; i < game.turnsInSet; i++){
            for(let ii in this.List[i].List){
                
                if(this.List[i].List[ii].ownerID == entityID){
                    Main.$(this.List[i].List[ii].id).style.visibility = "visible";
                    Main.$(this.List[i].List[ii].id).style.boxShadow = "0px 0px 20px 10px #FFFFFF";
                    
                }
            }
        }
    }

    hideEntityCards(entityID){

        let game = Main.getGameObject();

        for(let i = this.currentTurn; i < game.turnsInSet; i++){
            for(let ii in this.List[i].List){
                
                if(this.List[i].List[ii].ownerID == entityID){
                    if(i != this.currentTurn)
                        Main.$(this.List[i].List[ii].id).style.visibility = "hidden";
                    Main.$(this.List[i].List[ii].id).style.boxShadow = "none";
                }

            }
        }
    }

    placeCardInRowContainer(card,turn){
        card.parentID = this.List[turn].id;
        this.List[turn].List.push(card);
    }


    removeCardFromRowContainer(card,turn){
        let ind = this.getCardListIndex(card,turn);
        this.List[turn].List.splice(ind,1);
    }

    getCardListIndex(card,index){
        
        for(let i in this.List[index].List){
            if(this.List[index].List[i].id == card.id){
                return i;
            }
        }
        console.log("card not found",card)
        return null;
    }

    getEntityInRow(entity,index){
        let c = 0;
        for(let i in this.List[index].List){
            if(this.List[index].List[i].ownerID == entity.id){
                c++;
            }
        }
        return c;
    }

    nextTurn(){
        Main.getActionHandler().playTurn();
        this.currentTurn++;

        if(this.currentTurn >= Main.getGameObject().turnsInSet){
            Main.getActionHandler().playSet();
        }
        
        Main.getGameObject().checkIfEncounterEnded(Main.getGameObject().checkKilled());

        if(this.currentTurn != 0){
            let game = Main.getGameObject();
            for(let e in game.currentEncounter){
                let enemy =  game.getObject(game.getObject(game.currentEncounter[e]).ownerID);
                
                Enemy.reCalculateAction(Main.getActionList().currentTurn)
            }
            //Enemy;
        }
            
        this.draw();
    }

    orderCards(){
        for(let i in this.List){
            for(let c in this.List[i].List){
                this.List[i].List[c].calculatePriority();
            }
            this.List[i].List = Util.cardBubbleSort(this.List[i].List);
        }
    }
}

class RowContainer{
    constructor(game){
        this.id = game.createInstance(this);
        this.type = 'rowContainer';
        this.index = null;
        this.List = new Array();
    }

    resetList(){
        this.List = new Array();
    }
}

function onBoardTileOver(e){
    this.style.backgroundColor = Interface.RGBA(255,255,255,0.6);//'rgba(' + [255,255,255,0.6].join(',') + ')';
    
}

function onBoardTileOut(e){
    this.style.backgroundColor = "transparent";
}

function onBoardTileKlicked(e){
    let ind = this.getAttribute('index');
    Main.clearDOMElement(Main.getBoard().interactKey)
    Main.getPlayer().BoardTileKlicked(parseInt(ind));
}

export{ActionHandler,ActionList,RowContainer,Board}