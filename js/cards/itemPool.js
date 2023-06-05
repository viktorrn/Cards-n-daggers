import * as Main from '../main.js';
export class itemPool{
    constructor(game,ownerName){
        game = Main.getGameObject();
        this.type = 'itemPool';

        //console.log("this",this)
        
        this.id = game.createInstance(this);
        
        //console.log("itempool",this)
        
        this.name = ownerName;

        this.items = new Array();   
        this.totalWeigth = null;
        this.weigthTable = new Array();

    }

    getItemOfName(name){
        for(let i in this.items){
            if(this.items[i].name == name){
                return this.items[i];
            }
        }
        return null;
        console.log("Card not found "+name);
    }

    getItemOfType(type){
       let temp = new Array();
       for(let i in this.items) {
           if(this.items[i].cardType == type){
                for(let w = 0; w < this.items[i].weigth; w++){
                    temp.push(this.items[i]);
                } 
           }
       }
       return temp[Math.floor(Math.random()*temp.length)];
    }

    calculateTotalWeigth(){
        this.totalWeigth = null;
        for(let c in this.items){
            this.totalWeigth += this.items[c].weigth;
        }
    }

    calculateWeigthTable(){
        this.calculateTotalWeigth();
        this.weigthTable = new Array();

        for(let i in this.items){
            for(let w = 0; w < this.items[i].weigth; w++){
                this.weigthTable.push(this.items[i]);
            }
        }
    }

    getAcard(){
        return this.weigthTable[Math.floor(Math.random()*this.totalWeigth)];
    }

    
    
}

