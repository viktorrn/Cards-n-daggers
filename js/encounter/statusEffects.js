import * as Main from '../main.js';
import * as Cards from '../cards/card.js';
import * as Util from '../utilityFunctions.js';
import * as PlayCards from '../encounter/playCards.js';

export function procStatusEffects(procState,ent,data,specificEffect){
    let game = Main.getGameObject();


        for(let d in ent.statusEffects){
            

            if(ent.statusEffects[d].procFlag == procState){
                
                //console.log("procState",procState,"procFlag")
                
                switch(procState){
                    
                    case 'endOfSet':
                        playTickStatusEffect(ent.statusEffects[d],ent);
                    break;

                    case 'playedCard':
                        playPlayedCardEffect(ent.statusEffects[d],ent,data)
                    break;
 
                }       
            }    
        }
}

export function cardProcStatusEffects(ent,specificEffect){
    for(let d in ent.statusEffects){
        if(ent.statusEffects[d].name == specificEffect){
            playTickStatusEffect(ent.statusEffects[d],ent);
        }
    }

}

export function valueChangeStatusEffects(valueState,ent,data){
    let game = Main.getGameObject();

    for(let d in ent.statusEffects){

        //console.log("sef",ent.statusEffects[d].name,"ent",ent,"val state",valueState)

        if(ent.statusEffects[d].valueChange == valueState){
            
            switch(valueState){

                case 'endOfSet':
                    switch(ent.statusEffects[d].name){
                        case 'frenzy':
                            ent.statusEffects[d].value++;
                            break;

                        default:
                            ent.statusEffects[d].value--;
                    }
                    
                break;

            }
            removeStatusEffectIfValueIsZero( ent.statusEffects[d],ent);

        }
    }
}


function playTickStatusEffect(debuff,entity){
    
    let statusEffect = {type:"statusEffect", target:entity , debuffName:debuff.name};
    //console.log("debuff",debuff,"ent",entity);
    switch(debuff.name){
        case 'bleed':
            //console.log(entity.name,"bleeding",debuff.value)
            statusEffect.damage = debuff.value;
            PlayCards.attackEntity(entity,statusEffect,null,"statusEffect");
           
        break;
    }

    Main.getGameObject().log.push(statusEffect);

}

function playPlayedCardEffect(buff,ent,card){
    switch(buff.name){
        case 'ammo':
            switch(card.name){
                case 'Hip Fire':
                    card.attackData.times = 1+buff.value;
                    buff.value = 0;
                    removeStatusEffectIfValueIsZero(buff,ent);
                break;
            }
        break;
        
        case 'frenzy':
            switch(card.name){
                case 'Frantic Stab':
                    card.attackData.times = buff.value;
                break;
            }
        break;
       
        case 'sharpen':
          
        break;
    }
}

function removeStatusEffectIfValueIsZero(SEF,entity){
    if(SEF.value == 0){
        for(let i in entity.statusEffects){
            if(entity.statusEffects[i].name == SEF.name){
                entity.statusEffects.splice(i,1);
            }
        }
    }
    //console.log("entity effects after clear",entity.statusEffects)
}

//debuffs

export function playCardStatusEffects(statusEffect,target){
    switch(statusEffect.effectType){
        case 'use':
            switch(statusEffect.name){
                case 'critical':
                    if(checkIfStatusEffectConditionMet(target,statusEffect.targetCondition)){
                        return statusEffect.value;
                    }
                    break;
            }
            break;
        
        case 'apply':
                applyStatusEffects(target,statusEffect)
            break;
    }
    return 1;
}

//apply
export function applyStatusEffects(target,statusEffect){
    let temp = false;
    let ind = null;
    for(let i in target.statusEffects){
       if(statusEffect.name == target.statusEffects[i].name){
           temp = true;
           ind = i;
       }
    }   

    if(temp){
        target.statusEffects[ind].value += statusEffect.value;
    }
    else{
        target.statusEffects.push(Util.copyObject(statusEffect));
    }
}

//check statuseffect
export function checkIfStatusEffectConditionMet(target,statusEffect){
    for(let i in target.statusEffects){
        if(statusEffect == target.statusEffects[i].name){
           return true;
        }
    } 
    return false;  
}

export function checkIfTargetMarked(target){
    for(let i in target.statusEffects){
        if(target.statusEffects[i].name == "mark"){
            target.statusEffects[i].value--;

            removeStatusEffectIfValueIsZero( target.statusEffects[i],target);
            return 1.5;
        }
    }  
    return 1;
}

//display
export function getSharpen(target){
    for(let i in target.statusEffects)
        if(target.statusEffects[i].name == "sharpen")
            return target.statusEffects[i].value;
        
    return 0;
}

export function getWeaken(ent){
    if(checkIfStatusEffectConditionMet(ent,"weak"))
        return 0.75;
    return 1;
}

export function getMark(ent){
    if(checkIfStatusEffectConditionMet(ent,"mark"))
        return 1.5;
    return 1;
}

export function getIfShatter(card){
    let res = false;

    
    if(card.mutation == undefined){
            res = getIfSpecificShatter(card);
    }else{
        for(let m in card.mutation){
            if(getIfSpecificShatter(card.mutation[m]))
                res = true;
        }
    }
    return res;
}

function getIfSpecificShatter(card){
    let list = new Array();

    switch(card.cardType){
        case 'attack':
            list = card.attackData.statusEffect;
        break;
    }
    for(let d in list){
        if(list[d].name == 'shatter'){
            return true;
        }
            
    }
    return false;
}


