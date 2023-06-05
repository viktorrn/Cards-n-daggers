import * as Util from '../utilityFunctions.js';

export class LootTable{
    constructor(table){
        this.table = table;

        this.commonTable = new Array();
        this.rareTable = new Array();
        
        this.setsSinceLastRare = 0;
        this.rareCardOdd = 5;
        this.cardsToChooseFrom = 3;

        this.resetTables()
    }

    resetTables(){
        this.commonTable = new Array();
        this.rareTable = new Array();
        for(let rarity in this.table){
            switch(this.table[rarity].rarity){
                case "common":
                    for(let c in this.table[rarity].cards)
                    this.commonTable.push(this.table[rarity].cards[c])   
                break;

                case 'rare':
                    for(let c in this.table[rarity].cards)
                    this.rareTable.push(this.table[rarity].cards[c])   
                break;
            }
        }
        console.log(this)
    }

    calculateLoot(){
        let val = Math.floor(Math.random()*this.rareCardOdd)+1;
        let rare = false;
        let loot = new Array();

        this.commonTable = Util.shuffleArray(this.commonTable);
        this.rareTable = Util.shuffleArray(this.rareTable);

        //console.log(val-this.setsSinceLastRare)

        if(val - this.setsSinceLastRare <= 1){
            rare = true;
        }
        this.setsSinceLastRare++;

        if(rare){
            loot.push(this.rareTable[0])
        }

        let i = 0;
        while(loot.length < this.cardsToChooseFrom)
            loot.push(this.commonTable[i++])
        
        return loot;
    }

    chooseRare(){
        this.setsSinceLastRare = 0;
    }

}   