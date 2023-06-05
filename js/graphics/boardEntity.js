import * as Main from  '../main.js';
import * as Encounter from '../encounter/encounter.js';
import * as Interface from '../graphics/UI.js';
import * as StatusEffectUI from '../graphics/statusEffectsUI.js';


class BoardEntity{
    constructor(game,entityID,entityName,imgSrc){
        this.type = 'boardEntity';
        this.id = game.createInstance(this);

        this.entityID = entityID;
        this.imgSrc = imgSrc;

        return this;
    }

    getDrawData(){
        let game = Main.getGameObject();

        //base
        let div = document.createElement('div');
        div.setAttribute('class','board-entity');
        div.setAttribute('id',this.id)

        //interactive display data
        let id  = this.entityID;
        let actionList = Main.getActionList();
        let ct = actionList.currentTurn;
        let ent = Main.getGameObject().getObject(id);

        let high = this.highlightEntityData;
        let hide = this.hideEntityData;

        div.onpointerenter = function(){  high(id) };
        div.onpointerleave = function(){ hide(id) };
        
        let statusEffects = document.createElement('div')
        statusEffects.style.visibility = "hidden";
        statusEffects.setAttribute('id','statusEffects_'+id);
        statusEffects.setAttribute('class','statusEffects');

        //let ent = game.getObject(this.entityID)
        statusEffects = StatusEffectUI.getStatusEffectIcons(ent,statusEffects);
        //character
        let img = document.createElement('img');
        img.setAttribute("class",'character')
        img.style.zIndex = -1;
        img.src = this.imgSrc;

        //health and state
        let health = document.createElement('div');
        health.setAttribute('id','health');
        health.innerHTML = ent.health;
        

        let type = document.createElement('div');
        type.setAttribute('id','type');
        let typeImg = document.createElement('img');
        let c = undefined;

        if(ent.playedCards[ct] != undefined || ent.playedCards[ct] != null){
            c = Interface.getCardTypeIcon(ent.playedCards[ct].cardType);
        }else{
            c = Interface.getCardTypeIcon('idle');
        }
        
        if(c != undefined){
            typeImg.src = c;
        }

        type.appendChild(typeImg)
        div.appendChild(type);
        
        div.appendChild(statusEffects);
        div.appendChild(health)
        div.prepend(img);
        return div;
    }

    getID(){
        return this.id;
    }

    highlightEntityData(id){
        Main.$('statusEffects_'+id).style.visibility = 'visible';
        Main.getActionList().displayEntityCards(id);
        Main.getBoard().displayEntityCard(id)
    }

    hideEntityData(id){
        Main.$('statusEffects_'+id).style.visibility = 'hidden';
        Main.getActionList().hideEntityCards(id)
        Main.getBoard().hideEntityCard(id)
    }
}



function getImgPath(name){
    switch(name){
        case 'Slasher':
            return "./art/characters/slasher.png";
        break;

        case 'Sanguiana':
            return "./art/characters/sanguiana.png";
        break;

        
    }
}

export{BoardEntity}