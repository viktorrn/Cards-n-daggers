

import * as Interface from '../graphics/UI.js';

export function getStatusEffectIcons(entity,SEF){
    for(let i in entity.statusEffects){
        
        let div = document.createElement('div');
        div.setAttribute('id','effectContainter')
        let span = document.createElement('div');
        let img = document.createElement('img')
       
        switch(entity.statusEffects[i].name){
            case 'bleed':
                //div.style.backgroundColor = Interface.RGB(151,15,15);
                
                img.src = getStatusEffectIcon(entity.statusEffects[i].name);
                div.appendChild(img);
                span.innerText = entity.statusEffects[i].value;
                span.style.color = "white";
                div.appendChild(span)
            break;

            case 'ammo':
                //div.style.backgroundColor = Interface.RGB(136,125,36)
                
                img.src = getStatusEffectIcon(entity.statusEffects[i].name);
                div.appendChild(img);
                span.innerText = entity.statusEffects[i].value;
                span.style.color = "white";
                div.appendChild(span)
            break;

            case 'sharpen':
                //div.style.backgroundColor = Interface.RGB(151,15,15);
                
                img.src = getStatusEffectIcon(entity.statusEffects[i].name);
                div.appendChild(img);
                span.innerText = entity.statusEffects[i].value;
                span.style.color = "white";
                div.appendChild(span)
            break;

            case 'frenzy':
                //div.style.backgroundColor = Interface.RGB(15,15,151);
                
                img.src = getStatusEffectIcon(entity.statusEffects[i].name);
                div.appendChild(img);
                span.innerText = entity.statusEffects[i].value;
                span.style.color = "white";
                div.appendChild(span)
            break;

            case 'weak':
                //div.style.backgroundColor = Interface.RGB(151,151,151);
                
                img.src = getStatusEffectIcon(entity.statusEffects[i].name);
                div.appendChild(img);
                span.innerText = entity.statusEffects[i].value;
                span.style.color = "white";
                div.appendChild(span)
            break;

            case 'mark':
                //div.style.backgroundColor = Interface.RGB(151,10,10);
                
                img.src = getStatusEffectIcon(entity.statusEffects[i].name);
                div.appendChild(img);
                span.innerText = entity.statusEffects[i].value;
                span.style.color = "white";
                div.appendChild(span)
            break;
        }
        SEF.appendChild(div);
    }
    return SEF;
}

export function getStatusEffectIcon(effect){
    switch(effect){
        case 'bleed':
            return "../art/statusEffects/bleed.png";
        case 'ammo':
            return "../art/statusEffects/ammo.png";
        case 'sharpen':
            return "../art/statusEffects/attack.png";
        case 'mark':
            return "../art/statusEffects/mark.png";
        case 'frenzy':
            return "../art/statusEffects/frenzy.png";
        case 'weak':
            return "../art/statusEffects/weak.png";
    }
    
}