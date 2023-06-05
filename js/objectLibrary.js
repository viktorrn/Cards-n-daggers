import * as Main from './main.js';
import * as Util from './utilityFunctions.js';
import * as ItemPool from './cards/itemPool.js';

class Library{
    constructor(game){
        this.id = game.createInstance(this);
        this.type = 'library';

        this.itemsPools = new Array();
        this.entities = new Array();
        this.cardPools = new Array();
        this.statusEffects = new Array();

        this.jsonPath = "../jsonData/";
    }

    clearAllData(){
        this.itemsPools = new Array();
        this.entities = new Array();
        this.cardPools = new Array();
        this.statusEffects = new Array();
    }
    //search functions

    getData(type,name){
        let data = null;
      
        switch(type){
            case 'entity':
                data = this.searchList(this.entities,name);
            break;

            case 'cardPool':
                data = this.searchList(this.cardPools,name);
            break;

            case 'statusEffect':
                data = this.searchList(this.statusEffects,name)
            break;

            default:
                console.log("searched type",type,"not valid");
            break;
        }
        return data;
    }

    searchList(list,keyName){
        for(let i in list){
            if(list[i].name == keyName){
                return Util.clone(list[i]);
            }
        }
        return null;
    }

    copyCardPool(list,keyName){
        for(let i in list){
            if(list[i].name == keyName){
                return Util.clone(list[i].weigthTable);
            }
        }
        return null;
    }

    //data functions

    getDataToLoad(){
        Util.readFile(this.jsonPath+"DataToLoad.json",this.handleSRCData);
    }

    handleSRCData(data){
        let lib = Main.getGameObject().getObjectByType('library');
        
        lib.index = 0;
        lib.length = data.src.length;
        lib.srcList = data.src;
        Util.readFile(lib.jsonPath+lib.srcList[lib.index++] ,lib.runSrcList)

    }

    runSrcList(data){
        let lib = Main.getGameObject().getObjectByType('library');
        lib.handleData(data);

        if(lib.index < lib.length){
            Util.readFile(lib.jsonPath+lib.srcList[lib.index++] ,lib.runSrcList)
            
        }
    }



    handleData(data){
        let lib = Main.getGameObject().getObjectByType('library');

        switch(data.type){
            case 'entity':
                lib.createEntity(data);
            break;

            case 'statusEffect':
                lib.createStatusEffect(data);
            break;
        }
    }

    createStatusEffect(effect){
        let lib = Main.getGameObject().getObjectByType('library');
       
        for(let e in effect.statusEffects){
            effect.statusEffects[e].type = "statsEffect";
            lib.statusEffects.push(effect.statusEffects[e]);
        }

    }

    createEntity(entity){
        let lib = Main.getGameObject().getObjectByType('library');
        let cards = entity.cards;
        
        entity.type = entity.entityType;
        for(let i in entity.statusEffects){
            entity.statusEffects[i] = fetchStatusEffectObjectForEntity(entity.statusEffects[i]);
        }

        delete entity.cards;
        delete entity.entityType;

        lib.entities.push(entity);
        lib.createCardPool(cards,entity.name);
    }

    createCardPool(cards,owner){
        let lib = Main.getGameObject().getObjectByType('library');
        let itemPool = new ItemPool.itemPool(Main.getGameObject(),owner)

        for(let a in cards){
            let b = cards[a];
            
            for(let c in b.cards){
                let card = b.cards[c];
                card.cardType = b.cardType;
                
                if(b.cards[c].mutation == undefined){
                    card = fetchAndApplyStatusEffectObjectForCard(card);
                }else{
                    card.mutation = b.cards[c].mutation;
                    for(let c in card.mutation){
                        card.mutation[c] = fetchAndApplyStatusEffectObjectForCard(card.mutation[c]);
                    }
                }
                itemPool.items.push(card) 
            }
        }
        itemPool.calculateWeigthTable();
        lib.cardPools.push(itemPool);
    }
}

function fetchAndApplyStatusEffectObjectForCard(card){
    let lib = Main.getGameObject().getObjectByType('library');
    let val, tc = 'none';
    switch(card.cardType){
        case 'attack':
            for(let i in card.attackData.statusEffect){
                if(card.attackData.statusEffect[i].name == 'critical'){
                    tc = card.attackData.statusEffect[i].targetCondition;
                }
                val = card.attackData.statusEffect[i].value;
                card.attackData.statusEffect[i] = lib.getData("statusEffect",card.attackData.statusEffect[i].name);
                card.attackData.statusEffect[i].value = val;
                card.attackData.statusEffect[i].targetCondition = tc;
                
            }
        break;

        case 'state':
            for(let i in card.stateData.statusEffect){
                    
                val = card.stateData.statusEffect[i].value;
                card.stateData.statusEffect[i] = lib.getData("statusEffect",card.stateData.statusEffect[i].name);
                card.stateData.statusEffect[i].value = val;
            }
        break;
        
    }
    return card;
}

export function fetchStatusEffectObjectForEntity(sef){
    let lib = Main.getGameObject().getObjectByType('library');  
    
    let val = sef.value; 
    let obj = lib.getData("statusEffect",sef.name );
    obj.value = val;     
    
    return obj
}

export{Library}