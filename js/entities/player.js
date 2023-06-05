import * as Main from '../main.js';
import * as Entity from './entity.js';
import * as Maths from '../math.js';
import * as LootTable from '../encounter/LootTable.js';
import * as Card from '../cards/card.js';
import * as Util from '../utilityFunctions.js';

class Player{
    constructor(game){
        this.type = 'player';
        this.name = null;
        this.id = game.createInstance(this);
        //this.handID = null;
       
        
        this.cardOnMove = null;
        this.instanceHoveredID = null;
        this.sectionHover = null;
        this.CardOffsetY = null;
        this.CardOffsetX = null;

        //this.waitingForBoardInput = false;
        this.waitingForBoardInput = null;
        this.waitingForBoardInputQueue = new Array();

        this.entity = null;

        this.killed = 0;

        this.timeLine = new Array();
    }

    startRun(name){
        this.name = name;
        this.createEntity();
    }
    
    endEncounter(){
        this.entity.clearDebuffs();
        this.entity.health += 10;
        if(this.entity.health > this.entity.maxHealth){
            this.entity.health = this.entity.maxHealth;
        }
    }

    endRun(){
        this.resetData();
        this.destroyEntity();
    }

    resetData(){
        this.killed = 0;
        this.name = null;
    }


    createEntity(){
        let data = Main.getLibrary().getData('entity',this.name);

        if(data != null){
            this.entity = new Entity.Entity(Main.getGameObject(),this.name,this.type,this.id,data.imgPath);
            this.entity.health = data.health;
            this.entity.maxHealth = data.health;
            this.entity.color = data.color;
            Main.getHand().startRun(data.startingHand);

            Main.getHand().cardLootTable = new LootTable.LootTable(data.cardTable);
        }

        
    }

    destroyEntity(){
        Main.getGameObject().destroyInstance(this.entity.boardEntity.id);
        Main.getGameObject().destroyInstance(this.entity.id);
        this.entity = null;
    }

    //card functions

    placeCardInRowContainer(card,index){
        this.entity.playedCards[index] = card;
    }
   
    removeCardFromRowContainer(index){
        this.entity.playedCards[index] = null;
    }

    clearPlayedCards(){
        for(let i = 0; i < Main.getGameObject().turnsInSet; i++){
            this.entity.playedCards[i] = null;
        }
    }

    RandomizePosition(){
        let board = Main.getBoard();
        this.entity.position = {x: board.playerSpaceWidth-1, y: Math.floor(Math.random()*board.size.h)};
        return this.entity.position;
    }

    SetPosition(pos){
        this.entity.position = {x: getX(pos), y: getY(pos)};
    }

    checkIfWaitingForBoardInput(){
        if(this.waitingForBoardInputQueue.length > 0){
            this.selectTile(this.waitingForBoardInputQueue[0].data,this.waitingForBoardInputQueue[0].type,Main.getActionList().currentTurn);
        }
    }

    selectTile(card,type,index){

        console.log("select Tile",card,"type",type)
        let actionList = Main.getActionList();
        let board = Main.getBoard();

        actionList.currentListIndex = index;

        let temp = new Array();
        

        for(let i = 0; i < board.ArrayLength; i++){
            temp[i] = -1;
        }

        let t = 0;
        let range = 0;

        range = Card.calcCardRange(card)

        let MainPos = Main.getBoard().getEntityPosition(this.timeLine,this.entity.id,"select Tile");

        let oX = this.entity.position.x;
        let oY = this.entity.position.y;

        oX = MainPos.x;
        oY = MainPos.y;

        for(let y = - range; y <= range; y++ ){
            let offset = Math.abs(Math.sign(y))
            for(let x = - (range - Math.abs(y) +offset ); x <= (range - Math.abs(y) +offset ); x++ ){

                let Cx = x + oX;
                let Cy = y + oY;
                
                if(Cx > -1 && Cx < board.size.w && Cy > -1 && Cy < board.size.h){

                    switch(type){
                        case 'move':
                            if(this.timeLine[Cy*board.size.w+Cx] == -1){
                                temp[Cy*board.size.w+Cx] = 0; t++;
                            }
                        break;

                        case 'target':
                            if(this.timeLine[Cy*board.size.w+Cx].type == 'enemy'){
                                temp[Cy*board.size.w+Cx] = 0; t++;
                            }
                        break;

                        case 'tile':
                            temp[Cy*board.size.w+Cx] = 0; t++;
                        break;
                    }
                }

            }
        }
 
        if(t > 0){
            this.setWaitingForBoardInput("card",card);
            board.drawInteractBoard(temp,type); 
        }else{
            this.waitingForBoardInput = null;
            this.waitingForBoardInputQueue.splice(0,1)
            this.checkIfWaitingForBoardInput();
        }
        
    }

    BoardTileKlicked(pos){
        let actionList = Main.getGameObject().getObjectByType('actionList')
        let board = Main.getGameObject().getObjectByType('board')

        console.log("waiting for input",this.waitingForBoardInput)

        switch(this.waitingForBoardInput.type){
            case 'card':
                let temp = board.board;
                switch(this.waitingForBoardInput.data.cardType){
                    case 'move':
                        this.waitingForBoardInput.data.moveData.movePos = pos; 
                        Main.moveEntity( Main.getPos(this.entity.position.x,this.entity.position.y), pos, this.timeLine ) 
                    break;
        
                    case 'attack':
                        switch(this.waitingForBoardInput.data.attackData.pattern){
                            case 'target':
                                this.waitingForBoardInput.data.attackData.target = temp[pos].id;
                            break;

                            case 'tile':
                                this.waitingForBoardInput.data.attackData.target = pos;
                            break;
                        }
                    break;
                }
                board.drawSpecificBoard(board.board);
                actionList.draw();
            break;

            case 'startPosition':
                this.entity.SetPosition(pos);
                board.addEntityToBoard(player,this.entity.position);
                playerPickedSpot();
            break;


        }
     
        this.waitingForBoardInput = null;
        this.waitingForBoardInputQueue.splice(0,1)
        this.checkIfWaitingForBoardInput();
    }

    selectStartTile(){
        let board = Main.getBoard()
        let temp = new Array();
        for(let i = 0; i < board.ArrayLength; i++){
            temp[i] = -1;
        }

        for( let y = 0; y < board.size.h; y++ ){
            for( let x = 0; x < board.size.w-board.playerSpaceWidth; x++ ){
                temp[y*board.size.w+x] = 0;
            }
        }
        this.setWaitingForBoardInput('startPosition')
        board.drawInteractBoard(temp,type);
    }

    cardPlaced(card){
        this.timeLine = Util.copyArray(Main.getBoard().board);
        
        if(card.mutation == undefined || card.mutation == null){
            this.specificCardPlaced(card);
        }else{
            for(let m in card.mutation){
                this.specificCardPlaced(card.mutation[m]);
            }
        }

        this.checkIfWaitingForBoardInput();
    }

    specificCardPlaced(data){
        switch(data.cardType){
            case 'move':
              this.setWaitingForBoardInputQueue('move',data)
            break;

            case 'attack':
                switch(data.attackData.pattern){
                    case 'tile':
                        this.setWaitingForBoardInputQueue('tile',data)
                    break;

                    case 'target':
                        this.setWaitingForBoardInputQueue('target',data)
                    break;
                }
            break;
      } 
    }

    setWaitingForBoardInputQueue(type,data){
        let request = {type: type, data:data};
        this.waitingForBoardInputQueue.push(request);
    } 
    
    setWaitingForBoardInput(type,data){
        let request = {type: type, data:data};
        this.waitingForBoardInput = request;
    } 
    
    emptyHand(){
        this.entity.playedCards = new Array();
    }
    
}

export{Player}