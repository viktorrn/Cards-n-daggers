import * as BoardEntity from '../graphics/boardEntity.js';
import * as Main from '../main.js';

class Entity{
    constructor(game,name,type,ownerID,imgPath){
        this.type = type;
        this.id = game.createInstance(this);
        this.name = name;
        this.ownerID = ownerID;

        this.health = null;
        this.maxHealth = null;
        this.color = "red";
        this.imgSrc = imgPath;

        this.position = {x: null, y: null};
        this.priority = null;

        this.playedCards = new Array();
        this.stateCard = null;
        this.statusEffects = new Array();

        this.isDead = false;
                                
        this.boardEntity = new BoardEntity.BoardEntity(game,this.id,this.name,this.imgSrc);

    }

    setPriority(val){
        this.priority = val;
    }

    resetPriority(){
        this.priority = null;
    }

    getBoardEntityData(){
        return this.boardEntity.getDrawData();
    }

    getOwner(){
        Main.getGameObject().getObject(this.ownerID);
    }

    emptyHand(){
       Main.getGameObject().getObject(this.ownerID).emptyHand();
    }

    resetHand(){
        Main.getGameObject().getObject(this.ownerID).resetHand();
    }

    clearDebuffs(){
        this.statusEffects = new Array();
    }

    getEntityOfType(type,range){
        
    }

}

export{Entity}