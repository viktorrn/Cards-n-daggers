import * as Util from '../utilityFunctions.js';
import * as Main from '../main.js';
import * as Card from '../cards/card.js'
import * as StatusEffects from '../encounter/statusEffects.js';


function playCard(card){

    let game = Main.getGameObject();
    let cardOwner = game.getObject(card.ownerID);
    let board = Main.getBoard();

    if(!cardOwner.isDead){
        
        StatusEffects.procStatusEffects("playedCard",cardOwner,card)
        StatusEffects.valueChangeStatusEffects("playedCard",cardOwner,card)
       
        game.log.push(new Main.playedCard(card,cardOwner))
        if(card.mutation == undefined){
            playSpecificCard(card,cardOwner);
        }else{
            for(let i in card.mutation){
                playSpecificCard(card.mutation[i],cardOwner)
            }
            //console.log("mutation card played");
        }
    }
    board.drawSpecificBoard(board.board);
}

function playSpecificCard(card,cardOwner){
    switch(card.cardType){
        case 'move':
            playMoveCard(card,cardOwner);
            break;
        
        case 'attack':
            playAttackCard(card,cardOwner);
            break;

        case 'idle':
            
            break;
        
        case 'block':
            cardOwner.stateCard = card;
            break;

        case 'state':
            playStateCard(card,cardOwner);
        break;
    }
}


function playMoveCard(card,cardOwner){
    let game = Main.getGameObject();
    let board = game.getObjectByType('board');

    if(card.moveData.movePos != null)
        moveEntity(cardOwner.position,card.moveData.movePos,cardOwner,board);
    
    board.drawSpecificBoard(board.board);
}

function moveEntity(cur,target,ent,board){
    
    if(board.board[target] == -1){
        let temp = board.board[cur.y*board.size.w+cur.x];

        board.board[cur.y*board.size.w+cur.x] = -1;
        board.board[target] = temp;
        ent.position.x = Main.getX(target);
        ent.position.y = Main.getY(target);
    }
}

function playAttackCard(card,cardOwner){
    let game = Main.getGameObject();
    let board = game.getObjectByType('board');

    //for(let t = 0; t < card.attackData.times; t++){
        switch(card.attackData.pattern){
            
            case 'target':
                if(card.attackData.target != null)
                    attackEntity(game.getObject(card.attackData.target),card,cardOwner,card.attackData.damageType)
                
            break;
            
            case 'all':

                playAllAttackCard(card,cardOwner)

            break;

            case 'tile':
                attackTile(card.attackData.target,card,cardOwner)
            break;

        }
    //}
    board.drawSpecificBoard(board.board);
}

function playAllAttackCard(card,cardOwner){
    let game = Main.getGameObject();
    switch(cardOwner.type){
        case 'player':
            switch(card.name){
                case 'Open Wounds':
                    
                    
                    for(let e in game.currentEncounter){
                        console.log("open Wounds played",game.getObject(game.currentEncounter[e]))
                        StatusEffects.cardProcStatusEffects(game.getObject(game.currentEncounter[e]),"bleed");

                    }
                      
                break;

                case 'Blood Lust':
                    for(let e in game.currentEncounter){
                        StatusEffects.playCardStatusEffects(card.attackData.statusEffect[0],game.getObject(game.currentEncounter[e]))
                    }    
                break;

            }
        break;
    }

}

function attackTile(pos,card,attacker){
    let game = Main.getGameObject();
    let board = game.getObjectByType('board');
    
    //console.log("tile under attack",board.board[pos])
    if(pos != undefined){
        if(board.board[pos] != -1){
        
            let ent = game.getObject(board.board[pos].id);
            attackEntity(ent,card,attacker,card.attackData.damageType);
            
            return true;
        }
    }
   
    
    return false;
}

function attackEntity(target,attackObject,attacker,damageType){
    console.log("entity attacked",target,"attack",attackObject,"attacker",attacker)
    let game = Main.getGameObject();
    let mult = 1;    
    let damage = 0;
    let index = parseInt(game.log.length) - parseInt(1);

    let stateCard = checkStateCards(target,attacker,damageType);

    switch(damageType){
        
        case 'mental':
            
            for(let i in attackObject.attackData.statusEffect){
                StatusEffects.playCardStatusEffects(attackObject.attackData.statusEffect[i],target);
            }

            let res = checkTargetEnts(target,index)
                let targetEnt; 

                if(res.t){
                    //found target entity
                    targetEnt = game.log[index].targetEnts[res.index];
                }else{
                    //create target entity
                    targetEnt = new Main.targetEnt(target); 
                    game.log[index].targetEnts.push(targetEnt)
                }
                
                //deal damage
                targetEnt.dmg += (damage*mult)*attackObject.attackData.times;

        break;

        case 'physical':
             if(stateCard == false){
                
                damage = attackObject.attackData.damage;
                
                damage += StatusEffects.getSharpen(attacker)
                
                
                for(let i in attackObject.attackData.statusEffect){
                    mult *= StatusEffects.playCardStatusEffects(attackObject.attackData.statusEffect[i],target);
                }

                
                
                for(let i in attacker.statusEffects){
                    if(attacker.statusEffects[i].name == "weak")
                        mult *= 0.75;
                } 

                mult *= StatusEffects.checkIfTargetMarked(target)
            }
            else{
                mult = 0;
            }

            damage = (damage*mult)*attackObject.attackData.times;
            
            if(stateCard == false){
                let res = checkTargetEnts(target,index)
                let targetEnt; 
        
                if(res.t){
                    //found target entity
                    targetEnt = game.log[index].targetEnts[res.index];
                }else{
                    //create target entity
                    targetEnt = new Main.targetEnt(target); 
                    game.log[index].targetEnts.push(targetEnt)
                }
                    
                    //if damage is over 1 times
                if(mult == 2){
                    targetEnt.critical = true;
                }
                
                //deal damage
                targetEnt.dmg += damage;
            }

        break;

        case 'statusEffect':
            damage = attackObject.damage;
        break;

        
    }

    //check target entity
    
    target.health -= parseInt(damage +0.5);

    Main.getGameObject().checkEntityKilledInEncounter(target.id);        
}

function hitEntity(card){

}

function checkTargetEnts(target,index){
    let game = Main.getGameObject();
    for(let i in game.log[index].targetEnts){
        if(game.log[index].targetEnts[i].entity.id == target.id){
            return {t : true, index : i};
        }
    }
    return false;
}

//state stuff

function playStateCard(card,cardOwner){
    console.log("card",card);
    for(let i in card.stateData.statusEffect){
        StatusEffects.applyStatusEffects(cardOwner,card.stateData.statusEffect[i])
    }
}

function clearStateCards(){
    let game = Main.getGameObject();
    for(let i in game.turnOrder){
        let ent = game.getObject(game.turnOrder[i]);
        ent.stateCard = null;
    }
}

function checkStateCards(target,attacker,damageType){
    let game = Main.getGameObject();
    if(target.stateCard != null){
        switch(damageType){
            case 'physical':

                switch(target.stateCard.blockData.type){
                    case 'parry': 
                        let card = Card.createCard(target.stateCard.blockData.parryData,target.id,null,game)
                        card.attackData.pattern = "target";
                        card.attackData.target = attacker.id;
        
                        playCard(card);
        
                        Main.getGameObject().destroyInstance(card.id);
                        return true;
                        
                    case 'block':
                        return true;
        
                }
            break;

            case 'statusEffect':
                
            break;
        }
    }
    return false;
   
}



export {playCard,clearStateCards,attackEntity};