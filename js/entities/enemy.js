import * as Main from '../main.js';
import * as Entity from './entity.js';
import * as Card from '../cards/card.js';
import * as Util from '../utilityFunctions.js';
import * as Library from '../objectLibrary.js';
import * as Maths from '../math.js'

// AI goals
import * as EnemyGoals from './enemies/EnemyGoals.js';

class Enemy{
    constructor(game,name){
        this.type = "enemy";
        this.name = name;
        this.id = game.createInstance(this);

        this.maxCardsInHand = 8;
        this.preferredRange = null;

        this.cardPool = new Array();
        this.entity = null; //new Entity.Entity(game,this.type,name,this.id); 

        this.drawPile = new Array();
        this.hand = new Array();
        this.discardPile = new Array();

        this.goals = null;
        this.salary = null;
        this.purse = 0;
        
        //this.moveBoard = null;
        
    }

    //init encounter
    createEntity(){
        let data = Main.getLibrary().getData('entity',this.name);
        
        if(data != null){
            //console.log("data",data);
            this.entity = new Entity.Entity(Main.getGameObject(),this.name,this.type,this.id,data.imgPath);
            this.entity.health = data.health;
            this.entity.maxHealth = data.health;
            this.entity.rank = data.rank;
            this.entity.color = data.color;

            this.preferredRange = data.preferredRange;
            this.salary = data.salary;
            //console.log("this.salary",this.salary)
            
            for(let i in data.statusEffects){
               
                this.entity.statusEffects.push( Util.copyObject(data.statusEffects[i]))
            }
            
        }

        this.cardPool = Main.getLibrary().getData('cardPool',this.name);
        //console.log("cp",this.cardPool);

        for(let c in this.cardPool.weigthTable){
            
            let card = Card.createCard(this.cardPool.weigthTable[c],this.entity.id,null)
            //console.log(this,"card",card)
            this.drawPile.push(card);
        }

        //console.log("name",this.name)
        this.goals = EnemyGoals.getGoals(this.name);

        this.drawPile = Util.shuffleArray(this.drawPile)
        //console.log("this.drawPile",this.drawPile)
    }

    SetPosition(){
        
        let board = Main.getGameObject().getObjectByType('board');
        let _x;let _y;
       
        do{
        
            _x = ( board.playerSpaceWidth + 3 ) + Math.floor(Math.random()*(board.size.w - ( board.playerSpaceWidth+3 ) ) );
            _y = Math.floor(Math.random()*board.size.h);

       }while(board.board[_y*board.size.h+_x] != -1)
       
       this.entity.position = {x: _x, y: _y };
    }


    //card handling

    drawCardFromDrawPile(amount){
        let a = 0;
        let drawAmount = this.drawPile.length + this.discardPile.length;

        while(amount > drawAmount){
            amount--;
        } 
        for(let i = 0; i < amount; i++){
            if(this.hand.length >= this.maxCardsInHand){
                break;
            }
            
            if(this.drawPile.length == 0 && (amount - a) > 0){
                this.shuffleAndReturnFromDiscardPile();
            }
            this.drawPile[0].score = 0;
            this.hand.push(this.drawPile[0])
            
            this.drawPile.splice(0,1);
            a++;
        }
    }

    shuffleAndReturnFromDiscardPile(){
        this.discardPile = Util.shuffleArray(this.discardPile);
        while(this.discardPile.length > 0){
            
            this.drawPile.push(this.discardPile[0])
            this.discardPile.splice(0,1);


        }
    }

    //new set
    newSet(){
        this.drawCardFromDrawPile(4);
        this.purse = this.salary;
        //console.log("this.hand",this.hand)
    }

    //end set

    emptyHand(){

        let game = Main.getGameObject();

        for(let i = 0; i < game.turnsInSet; i++){
            if(this.entity.playedCards[i] != null){
                 
                this.discardPile.push(this.entity.playedCards[i]);
            }
            this.entity.playedCards[i] = null;
        }
    }


    //end encounter
    resetHand(){

        let game = Main.getGameObject();

        for(let c in this.discardPile){
            game.destroyInstance(this.discardPile[c].id)
        }
        for(let c in this.drawPile){
            game.destroyInstance(this.drawPile[c].id)
        }
        for(let c in this.hand){
            game.destroyInstance(this.hand[c].id)
        }
    }
    

    /*OldgetDistToTarget(){
        let target = Main.getPlayer().entity;
        let dist = Math.floor( Maths.dist(this.entity.position.x,this.entity.position.y,target.position.x,target.position.y) + 0.5)
        //console.log("dist",Maths.dist(this.entity.position.x,this.entity.position.y,target.position.x,target.position.y),"calced dist",dist)
        return dist;
    }*/

    getDistanceToTarget(target,tempBoard){

        let board = Main.getBoard();

        let pos = board.getEntityPosition(tempBoard,this.entity.id,"calcMoveTileScoring");
    
        let oX = pos.x;
        let oY = pos.y;

        let range = 0;

        while(++range < 16){

            for(let y = - range; y <= range; y++ ){
              
                let offset = Math.abs(Math.sign(y))
    
                    for(let x = - (range - Math.abs(y) +offset ); x <= (range - Math.abs(y) +offset ); x++ ){
        
                        let Cx = x + oX;
                        let Cy = y + oY;

                        if( Cx > -1 && Cx < board.size.w && Cy > -1 && Cy < board.size.h ){
                            if( tempBoard[Cy*board.size.w+Cx] != -1){
                                if(tempBoard[Cy*board.size.w+Cx].id == target.id)
                                    return range;
                            }
                        }
                    }
            }
        }
        return 15; 
        

    }

    // tile scoring
    calculateMoveTileScoring(tempBoard,card){
       
            let moveBoard = new Array();
            let board = Main.getBoard();
            
            let pos = board.getEntityPosition(tempBoard,this.entity.id,"calcMoveTileScoring");
    
            let oX = pos.x;
            let oY = pos.y;
    
            //console.log("pos",pos,"act pos",this.entity.position)
    
            let target = Main.getPlayer().entity;
            let tX = target.position.x;
            let tY = target.position.y;
    
            //console.log(this.cardPool.getItemOfName('Step'));
    
            let range = card.moveData.range;
           
            while(Main.$('dot') != undefined){
                document.body.removeChild(Main.$('dot'));
            }
    
            for(let y = - range; y <= range; y++ ){
                let offset = Math.abs(Math.sign(y))
                for(let x = - (range - Math.abs(y) +offset ); x <= (range - Math.abs(y) +offset ); x++ ){
    
                    let Cx = x + oX;
                    let Cy = y + oY;
    
                    if( Cx > -1 && Cx < board.size.w && Cy > -1 && Cy < board.size.h ){
    
                        if( tempBoard[Cy*board.size.w+Cx] == -1){
    
                            let score = {}
                            let val = Maths.dist(Cx,Cy,tX,tY) - this.preferredRange;
                            //let val = Math.floor(Maths.dist(Cx,Cy,tX,tY)+0.5); 
                            
                            //let calcedVal = Math.floor( val*val + Math.floor(Maths.dist(oX,oY,Cx,Cy)+0.5)*0.5 +0.5);
                            let oToC = -Maths.dist(oX,oY,Cx,Cy);
                            let tipScale = -val;
                            let mainScale = -(val*val*val*val); 
                            let calcedVal = (100 + (mainScale + tipScale + oToC*1.2));

                            //console.log("card",card,"val",val,"calced val",calcedVal)
                            
                            score.score = calcedVal;

                            score.tileIndex = Cy*board.size.w+Cx;
                            
                            moveBoard.push(score);
    
                            
                            /*let tile = Main.$("bt-"+(Cy*board.size.w+Cx));
                            let pos = Main.getOffset(tile);
                            let bx = pos.left + 50;
                            let by = pos.top + 50;
                            let point = Main.drawPoint(bx,by);
                            let text = calcedVal.toString(10);
                            point.innerHTML = text.substr(0,5);
                            document.body.appendChild(point)*/
                            
                        }
                    }
                }
            }
            moveBoard = Util.shuffleArray(moveBoard)
            moveBoard = Util.tileBubbleSort(moveBoard);
            return moveBoard;
            
        
       
    }

    calculateAttackTileScoring(tempBoard,card){

       
            let attackBoard = new Array();
            let board = Main.getBoard();
            
            
            let pos = board.getEntityPosition(tempBoard,this.entity.id,"calcAttackTileScoring");
            
            let oX = pos.x;
            let oY = pos.y;
    
            //console.log("pos",pos,"act pos",this.entity.position,"ent",this.entity)
        
            let target = Main.getPlayer().entity;
            let tX = target.position.x;
            let tY = target.position.y;
    
    
            //console.log(this.cardPool.getItemOfName('Step'));
    
            let range = card.attackData.range;
           
            while(Main.$('dot') != undefined){
                document.body.removeChild(Main.$('dot'));
            }
    
            for(let y = - range; y <= range; y++ ){
                let offset = Math.abs(Math.sign(y))
                for(let x = - (range - Math.abs(y) +offset ); x <= (range - Math.abs(y) +offset ); x++ ){
    
                    let Cx = x + oX;
                    let Cy = y + oY;
    
                    if( Cx > -1 && Cx < board.size.w && Cy > -1 && Cy < board.size.h ){
    
                        //if( tempBoard[Cy*board.size.w+Cx] == -1){
    
                            let score = {}
                            let Pos = Cy*board.size.w+Cx;
                            score.score = Maths.dist(Cx,Cy,tX,tY)

                            let d = Maths.dist(Cx,Cy,oX,oY)
                            
                            score.tileIndex = Pos;
                            if( tempBoard[Pos] != -1){
                                if(tempBoard[Pos].id != target.id )
                                    score.score += 10;
                            }
                                
                            
                            
                            attackBoard.push(score);
    
                            
                            /*let tile = Main.$("bt-"+(Cy*board.size.w+Cx));
                            let pos = Main.getOffset(tile);
                            let bx = pos.left + 50;
                            let by = pos.top + 50;
                            let point = Main.drawPoint(bx,by);
                            
                            //let text = score.score.toString(10)
                            let text = d.toString(10)


                            point.innerHTML = text.substr(0,4);
                            document.body.appendChild(point)*/
                            
                        //}
                    }
                }
            }
        
            attackBoard = Util.tileBubbleSort(attackBoard);
            return attackBoard;
        
        
        
    }

    //card scoring
    calcCardScore(mx,dist,range){
        let rd = (range - dist)
        let tot = 10 - (rd*rd)/3 + rd/6;
        return  tot;
    }


	scoreCardsInHand2(tempBoard){
		let board = Main.getBoard();
        let target = Main.getPlayer().entity;

        /*let pos = board.getEntityPosition(tempBoard,this.entity.id,"scoreCardsinHand2");
        let Tpos = board.getEntityPosition(tempBoard,target.id,"scoreCardsinHand2");
        //let dist =  ( Maths.dist(pos.x,pos.y,Tpos.x,Tpos.y) +0.5);*/
        let dist = this.getDistanceToTarget(target,tempBoard);
        //console.log("dist",dist,"this",this)
        let maxRange = 0;

		for(let c in this.hand){
            let card = this.hand[c]
            card.score = 0;

            let range = Card.calcCardRange(card);
            if(range > maxRange)
                maxRange = range;
        }
        
		for(let c in this.hand){
			
            let card = this.hand[c]
			let range = Card.calcCardRange(card);
			

			card.score = this.calcCardScore(maxRange,dist,range) 
            
            if(this.goals != undefined)
                card.score += this.goals(card,dist,target,maxRange);

            //console.log("card",card,"score",card.score,"dist",dist,"range",range,"maxRange",maxRange);
		}
        

		this.hand = Util.tileBubbleSort(this.hand);
        //let dif = this.hand[this.hand.length - 1].score - this.hand[0].score;
        //console.log("dif ",dif,"max",this.hand[this.hand.length - 1].score,"min",this.hand[0].score)
	}

    

    playCard(card,turn,tempBoard){
        
        let target = Main.getPlayer().entity;
        let pos = Main.getBoard().getEntityPosition(tempBoard,this.entity.id,"playCard");
        let dist =  Math.floor( Maths.dist(pos.x,pos.y,target.position.x,target.position.y) + 0.5);

        if(card.mutation == undefined){
            tempBoard = this.playSpecificCard(card,tempBoard,dist)
        }else{
            for(let c in card.mutation){
                tempBoard = this.playSpecificCard(card.mutation[c],tempBoard,dist)
            }
        }

        this.entity.playedCards[turn] = card;
        this.hand.splice(this.hand.length-1,1)
        
        //console.log("tempBoard",tempBoard)
        return tempBoard; 
    }

    playSpecificCard(card,tempBoard,dist){

        let pos = Main.getBoard().getEntityPosition(tempBoard,this.entity.id,"playSpecificCard");
        
        switch(card.cardType){
            case 'move':
                let moveBoard = this.calculateMoveTileScoring(tempBoard,card);
                card.moveData.movePos = moveBoard[moveBoard.length-1].tileIndex;
                tempBoard = Main.moveEntity(Main.getPos(pos.x,pos.y),moveBoard[moveBoard.length-1].tileIndex,tempBoard)
            break;
            
            case 'attack':
                switch(card.attackData.pattern){
                    case 'target':
                        card.attackData.target = Main.getPlayer().entity.id;
                    break;

                    case 'tile':
                        card.attackData.target = this.calculateAttackTileScoring(tempBoard,card)[0].tileIndex;
                    break;
                }
            break;
        }
        return tempBoard; 
    }

    reCalcCardAction(card,tempBoard){
        if(card.mutation == undefined){
            tempBoard = this.reCalcSpecificCardAction(card,tempBoard)
        }else{
            for(let c in card.mutation){
                tempBoard = this.reCalcSpecificCardAction(card.mutation[c],tempBoard)
            }
        }
        return tempBoard;
    }

    reCalcSpecificCardAction(card,tempBoard){
        switch(card.cardType){
            case 'move':
                let moveBoard = this.calculateMoveTileScoring(tempBoard,card);
                card.moveData.movePos = moveBoard[moveBoard.length-1].tileIndex;
                tempBoard = Main.moveEntity(Main.getPos(this.entity.position.x,this.entity.position.y),moveBoard[moveBoard.length-1].tileIndex,tempBoard)
            break;
            
            case 'attack':
                switch(card.attackData.pattern){
                    case 'target':
                        //card.attackData.target = Main.getPlayer().entity.id;
                    break;

                    case 'tile': 
                        card.attackData.target = this.calculateAttackTileScoring(tempBoard,card)[0].tileIndex;
                    break;
                }
            
            break;
        }
        return tempBoard;
    }
}

function drawEnemyCards(){
    
    let game = Main.getGameObject();
    let turnBoard = Util.copyArray(Main.getBoard().board);
    
    for(let e in game.currentEncounter){
        let ent = game.getObject(game.getObject(game.currentEncounter[e]).ownerID);
        ent.newSet();
    }

    for(let turn = Main.getActionList().currentTurn; turn < game.turnsInSet; turn++){
        //console.log("new turn")
            for(let e in game.currentEncounter){
                if(!game.getObject(game.currentEncounter[e]).isDead){
                    
                    let enemy = game.getObject(game.getObject(game.currentEncounter[e]).ownerID);
                    if(enemy.hand.length > 0){
                        
                        enemy.scoreCardsInHand2(turnBoard);
                        let i = enemy.hand.length-1;
                        if(enemy.purse >= 0){
                            while(i > -1){
                                let card = enemy.hand[i];
                                if(card.cost <= enemy.purse){
                                    enemy.purse -= card.cost;
                                    turnBoard = enemy.playCard(card,turn,turnBoard)
                                    break;
                                }
                                i--;
                            }  
                        }
                        
                    }
                   

                }
            }
    }
}

export function reCalculateAction(turn){
    let game = Main.getGameObject();
    let turnBoard = Util.copyArray(Main.getBoard().board);
        
    for(let e in game.currentEncounter){
        let ent = game.getObject(game.currentEncounter[e])
        if(!ent.isDead){
            if(ent.playedCards[turn] != null){
                let enemy = game.getObject(game.getObject(game.currentEncounter[e]).ownerID);
                turnBoard = enemy.reCalcCardAction(ent.playedCards[turn],turnBoard)
            }
            
        }
    }


}

export{Enemy,drawEnemyCards};