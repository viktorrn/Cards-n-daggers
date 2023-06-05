import * as SEF from '../../encounter/statusEffects.js';
import * as Card from '../../cards/card.js';

export function getGoals(name){
    switch(name){
        case 'Slasher':
            return SlasherCalcGoals;
        case 'Hunter':
            return HunterCalcGoals;
        case 'Hooded Servant':
            return HoodedServantCalcGoals;
        case 'Disfigured Rodent':
            return DisfiguredRodent;
    }

}

export function SlasherCalcGoals(card,dist,target,maxRange){
    let score = 0;
    score = checkIfShouldMove(card,dist,maxRange)
    
    switch(card.name){
        case 'Slash':
            if(!SEF.checkIfStatusEffectConditionMet(target,'bleed')){
                score += 1;
            }
        break;
        
        case 'Quick Stab':
            if(SEF.checkIfStatusEffectConditionMet(target,'bleed')){
                score += 1;
            }
        break;

        case 'Sharpen':
            score += 2;
        break;
    }
    return score;
}

export function HunterCalcGoals(card,dist,target,maxRange,prefRange){
    let score = 0;
    score += checkIfShouldMove(card,dist,maxRange)

    switch(card.name){
        case 'Hunters Mark':
            if(!SEF.checkIfStatusEffectConditionMet(target,'mark')){
                score += 1;
            }
        break;
        
        case 'Arrow Rain':
            if(SEF.checkIfStatusEffectConditionMet(target,'mark')){
                score += 1;
            }
        break;
    }


    return score;

}

export function DisfiguredRodent(card,dist,target,maxRange,prefRange){
    let score = 0;
    score += checkIfShouldMove(card,dist,maxRange)
    return score;

}

export function HoodedServantCalcGoals(card,dist,target,maxRange){
    let score = 0;
    score += checkIfShouldMove(card,dist,maxRange);
    //console.log("dist",dist)
    if(dist == 2){
        switch(card.name){
            case 'Lunge':
                //console.log("dist",dist)
                score += 410;
            break;
        }
    }
    return score;
}

function checkIfShouldMove(card,dist,maxRange){
    switch(card.cardType){
        case 'move':
            if(maxRange < dist)
            return 400;
            break;
            
    }
    return 0;
}