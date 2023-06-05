 import * as Util from './utilityFunctions.js';

import * as Interface from './graphics/UI.js';
import * as Encounter from './encounter/encounter.js'
import * as Maths from './math.js';

//entities
import * as Player from './entities/player.js';
import * as Enemy from './entities/enemy.js';
import * as Hand from './entities/hand.js';
import * as Library from './objectLibrary.js';


// cardStuff
import * as CardHandling from './cards/cardHandling.js';
import * as Card from './cards/card.js';

//classes

class Game{
    constructor(){
        this.instanceCount = -1;
        this.instances = new Array();

        this.turnOrder = new Array();
        this.currentEncounter = new Array();
        this.encounterRunning = false;
        this.runActive = false,
        this.EndSetKey = null;

        this.log = new Array();
        this.turnsInSet = 3;

        this.runLength = 7;

        this.setTimer = null;
        this.encounterTimer = null;

        this.cardsToChooseFrom = new Array();
        this.cardsToChooseFromBeingDisplayed = new Array();
        this.lootOptionAmount = 0;

        //dev log stuff
        this.devMenuDisplay = true;

        this.encHP;
        this.score = 0;
        this.sets;

        this.encounterList = new Array();
    }

    //log functions

    clearLog(){
        clearDOMElement($('actions'));
        this.log = new Array()
    }

    printLog(){
        var output = $('actions');
        clearDOMElement($('actions'))
        for(let c in this.log){
            var li = document.createElement('li');
            switch(this.log[c].type){
                
                case 'playedCard':
                    li.innerHTML = Interface.styleText(this.log[c].cardOwner.name,this.log[c].cardOwner.color,false,true) +" played "+ this.log[c].card.name;

                    switch(this.log[c].card.cardType){
                        case 'move':
                            
                            li.innerHTML +=", moved to (" + getX(this.log[c].card.moveData.movePos)+","+getY(this.log[c].card.moveData.movePos)+")";
                            
                            break;
        
                        case 'attack':
                            
                            for(let i in this.log[c].targetEnts){
                                
                                li.innerHTML += ","+ Interface.styleText("attacked","red",false,true) 
                                li.innerHTML += Interface.styleText(this.log[c].targetEnts[i].entity.name,this.log[c].targetEnts[i].entity.color,false,true) + " dealing ";
                            
                                if(this.log[c].targetEnts[i].critical){
                                    let style = Interface.getStyleForEffect("critical")
                                    li.innerHTML += Interface.styleText(" *CRITICAL* ",style.color,style.outline,style.bold);
                                }
                                    
                                li.innerHTML += Interface.styleText(this.log[c].targetEnts[i].dmg,null,false,true) + " damage";
                            }
                            break;
                    }
                break;

                case 'statusEffect':
                    li.innerHTML = Interface.styleText( this.log[c].target.name, this.log[c].target.color,false,true) + " took " + Interface.styleText(this.log[c].damage,"black",false,true) + " damage from " + this.log[c].debuffName;
                
                break;
            }
            //console.log("c owner",this.log[c],"c",c)

           
            output.appendChild(li);
        }
    }

    createInstance(obj){
        this.instanceCount++;
        this.instances.push(obj);
        return this.instanceCount;
    }

    destroyInstance(id){
        //console.log("destroyed instance ",this.getObject(id));
        if(this.getObject(id) != undefined)
            this.instances.splice(this.getInstanceIndex(id),1);
        else 
            console.log("undefined passed to destroy function with id ",id);
    }

    getInstanceIndex(id){
        for(let i in this.instances){
            if(this.instances[i].id == id)
                return i;
        }
        return null;
    }

    getObject(id){
        return this.instances[this.getInstanceIndex(id)];
    }

    getObjectByType(type){
        for(let i in this.instances){
            if(this.instances[i].type == type)
                return this.instances[i];
        }
        return null;
    }
    
    loadEncounterList(){
        this.encounterList = [
            [
                "Hooded Servant","Hooded Servant"
            ],
            [
                "Hooded Servant","Hooded Servant","Disfigured Rodent"
            ],
            [
                "Disfigured Rodent","Disfigured Rodent","Disfigured Rodent"
            ],
            [
                "Slasher","Disfigured Rodent",
            ],
            [
                "Slasher","Slasher", 
            ],
            [
                "Hunter","Slasher"
            ],
            [
                "Hunter","Hooded Servant"
            ]
        ]

        this.encounterList = Util.shuffleArray( this.encounterList );
    }

    //entity functions

    checkEntityKilledInEncounter(id){
        let ent = this.getObject(id);
       if(ent.health <= 0){
        ent.isDead = true;

        switch(ent.type){
            case 'player':
                //console.log("player killed")
            break;

            case 'enemy':
                getBoard().removeEntityFromBoard(ent.id);
                
                //console.log("killed",ent);
                player.killed++;
                ent.emptyHand();
            break;
        }
       }
    }
   
    checkKilled(){
        let deaded = true;

        for(let e in this.currentEncounter){
            //console.log("ent check killed",this.getObject(this.currentEncounter[e]))
            if(!this.getObject(this.currentEncounter[e]).isDead){
                deaded = false;
            }
        }

        if(player.entity.isDead){
            deaded = false;
            return "pd";
        }

        if(deaded == true){
            //console.log("enemies dead");
            return "ed";
        }
        return null;
    }

    checkIfEncounterEnded(state){
        
        switch(state){
            case 'ed':
                if(--game.encounterTimer > 0){
                    //console.log("gt",game.encounterTimer)
                    game.calcScore();

                    game.endEncounter();
                    displayWin();
                }else{
                    game.calcScore();

                    game.endEncounter();
                    displayRunOver();
                }
                
            break;

            case 'pd':
                game.calcScore();
                game.endEncounter();
    
                displayLose();    
            break;
        }



    }

    calcScore(){

        let d = this.encHP - player.entity.health;
        
        if(d != 0)   
            this.score += 10*(100 + player.killed * 10) / (1+ d*0.2 + this.setsPlayedInEncounter*0.5);
        else 
            this.score += 10*(100 + player.killed * 10) / ( 1+ this.setsPlayedInEncounter*0.5);

        this.score = parseInt(this.score += 0.5);

        $('tot-score').innerText = "Total score: "+this.score;

    }

    addToCurrentEncounter(id){
        this.currentEncounter.push(id);
    }

    addToTurnOrder(id){
        let ent = this.getObject(id);
        
        switch(ent.type){
            case 'player':
                ent.setPriority(2);
            break;

            case 'enemy':
                ent.setPriority(1);   
            break;
        }
        this.turnOrder.push(id);
    }

    //run functions
    startRun(){ 
        //toggleFullscreen()
        //console.log("entity",library.getData('cardPool',"Slasher"));
       //try{
            if(!game.runActive){
                game.runActive = true;
                game.loadEncounterList()
                player.startRun('Sanguiana');
                actionList.startRun();
                board.startRun();
                game.score = 0;
    
                game.encounterTimer = game.runLength;
                $('encsLeft').innerText = "Encounters Left: "+game.encounterTimer;
                
                // substitute
                //console.log("run started",game.instances);
                game.startEncounter();
            }
        //}catch{
          /*console.log("failed to start, trying to restart")
            game.endRun();*/
            //game.startRun();
        //}
        
    }

    endRun(){
        if(game.runActive){
            
            this.score = 0;
            $('tot-score').innerText = "Total score: "+this.score;


            game.runActive = false;
            
            game.endEncounter();
            
            hand.endRun();
            player.endRun();
            actionList.endRun();
            board.endRun();
            console.log("run ended",game.instances)
        }
        
    }

    //encounter functions


        //init stuff
        initEnemies(){
            let val = (game.encounterTimer % game.encounterList.length)
            //console.log("this.encounterList[ this.sets % 5 ]",game.encounterList[ val ]);
            
            let list = this.encounterList[ val ]

            for(let i in list){
                //console.log("entity being created",list[i])
                let enemy = new Enemy.Enemy(game,list[i]);
                enemy.createEntity();
                if(enemy.entity != null){
                    this.addToCurrentEncounter(enemy.entity.id);
                    this.addToTurnOrder(enemy.entity.id);
                }
            }
            
     
        }

        initPlayer(){
            this.addToTurnOrder(player.entity.id);
            player.RandomizePosition();
            hand.startEncounter();
        }

        startEncounter(){
            console.log("start encounter called")
            if(game.encounterRunning == false){
                console.log("start encounter approved")
                game.encounterRunning = true;
                this.encHP = player.entity.health;
                this.setsPlayedInEncounter = 0;
                
                //console.log("encHP",this.encHP);
                this.initEnemies();
                board.startEncounter();
                
                this.initPlayer();  

                this.playerPickedSpot(); 
            }
        }

        playerPickedSpot(){
            window.onpointerup = CardHandling.dropCard;

            board.addEntityToBoard(player.entity,player.entity.position);
           // console.log("game current encounter",game.getObject(game.currentEncounter))
            
            this.startNewSet();
            
        }

        startNewSet(){
            actionList.currentTurn = 0;
            for(let i in this.currentEncounter){
                this.getObject(this.currentEncounter[i]).emptyHand();
            }
            this.setsPlayedInEncounter++;
            $('encsLeft').innerText = "Encounters Left: "+game.encounterTimer+ " Set: "+game.setsPlayedInEncounter;

            board.drawSpecificBoard(board.board);
            Enemy.drawEnemyCards();
            
            actionList.newSet();
            hand.newSet();
            
            actionList.draw();
            hand.drawHand();
            board.drawSpecificBoard(board.board);
        }

        //end stuff

        endEncounter(){
            //console.log("encounter ended")
            if(this.encounterRunning == true){
                
                eraseBoardEntities()

                this.clearLog();
                
                this.encounterRunning = false
                
                
                window.onpointerup = null;
        
                hand.removeDropZone();
                actionList.removeDropZone();
        
                this.clearEncounterData();
                
                player.endEncounter();
                hand.endEncounter();
                board.endEncounter();
                actionList.endEncounter();

                
                console.log("encounter ended",game.instances);
            }
            
        }

        clearEncounterData(){
            for(let i in this.turnOrder){
                this.getObject(this.turnOrder[i]).resetPriority();
            }
            this.turnOrder = new Array();
    
            for(let e in this.currentEncounter){
                
                let ent = this.getObject(this.currentEncounter[e]);
                ent.emptyHand();
                ent.resetHand();
                this.destroyInstance(ent.boardEntity.id);
                this.destroyInstance(ent.ownerID);
                this.destroyInstance(ent.id);

                //this.clearEmptyItemPools();
    
            }
            this.currentEncounter = new Array();
        }


}

class playedCard{
    constructor(c,co){
        this.type = "playedCard";
        this.cardOwner = co;
        this.card = c;
        this.targetEnts = new Array();
    }
}

class targetEnt{
    constructor(ent){
        this.entity = ent;
        this.critical = false;
        this.dmg = 0;
        this.times = 0;
    }    
}

    var game = new Game();
    var player = new Player.Player(game);
    var hand = new Hand.Hand(game);
    var library = new Library.Library(game);

    var board = new Encounter.Board(game);
    var actionHandler = new Encounter.ActionHandler(game);
    var actionList = new Encounter.ActionList(game);
   

//general functions

function getPos(x,y){
    return y*board.size.w+x;
}

function getX(pos){
    return pos % board.size.w;
}

function getY(pos){
    return Math.floor(pos / board.size.h);
}

function $(e){
    return document.getElementById(e);
}

function getOffset( el ) {
    let _x = 0;
    let _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

function clearDOMElement( el ){
    while(el.hasChildNodes()){
        el.removeChild(el.firstChild);
    }
}

function moveEntity(cur,target,board){
    let temp = board[cur];
    board[cur] = -1;
    board[target] = temp;
    return board;
}

function drawLine(x1,y1,x2,y2,color){
    let distance = Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) );
    //console.log("dist",distance);

    let xMid = x1 + (x2-x1)/2;
    let yMid = y1 + (y2-y1)/2;

    //console.log("yMid",yMid, "xMid",xMid)

    let rad = Math.atan2(y2 - y1,x2 - x1);
    let deg = (rad * 180) / Math.PI;

    let line = document.createElement('div');
    line.id = "line";

    
    line.style.width = distance+"px";
    line.style.top = yMid;
    line.style.left = xMid-(distance/2);
    line.style.transform = "rotate("+deg+"deg)";
    line.style.backgroundColor = color;

    return line;
}

function drawPoint(x,y){
    
    let dot = document.createElement('div');
    
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    
    dot.id = "dot";


    return dot;
}

export function drawImageIcon(x,y,card){
    
    let dot = document.createElement('div');
    
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    
    dot.id = "actionIcon";

    let img = document.createElement('img');
    img.src = Interface.getCardTypeIcon(card.cardType);

    dot.appendChild(img)

    return dot;
}

//init game
window.onload = function(){

    library.getDataToLoad();
    document.body.style.cursor = "pointer";
    
    loadHTMLKeys();
    addClickEvents();
    //drawCircle();
    
    console.log("game loaded",game.instances);

    /*if(duEGeyEmil(gey))
        samtalList.push(personJoinaSamtal( bibliotek.getPerson("emil") ));
    return gey*/
};

function loadHTMLKeys(){
    hand.Key = document.getElementsByClassName("hand")[0];
    hand.Key.setAttribute("id",hand.id);
    hand.overlayDisplayKey = $('cardDisplayOverlay');
    player.handID = hand.id;
    board.Key = $('board');
    board.ents = $('entities')
    board.interactKey = $('interact-board')
    actionList.Key = $('actionList');
}

function toggleFullscreen() {
    let elem = document.body
  
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      //document.exitFullscreen();
    }
  }

function addClickEvents(){
    //$('emptyHand').onclick = emptyHand;
    //$('drawCards').onclick = function(){ hand.drawCardFromDrawPile(4)};    
    $('endSet').onclick = nextTurn;

    $('endSet').onpointerenter = function(){/*Interface.ShowToolTip("End current Turn",$('endSet'))*/}
    $('endSet').onpointerleave = function(){/*Interface.HideToolTip()*/}

    $('begin').onclick = game.startRun;
    $('end').onclick = game.endRun;
    
    $('back').onclick = function(){hand.hideCardList();} 
    $('show-drawPile').onclick = function(){hand.displayCardList('drawPile')};
    $('show-discardPile').onclick = function(){hand.displayCardList('discardPile')};
    $('show-deck').onclick = function(){hand.displayCardList('deck')}

    $('actionLog').onpointerenter = function(){
        $('actions').scrollTop = $('actions').scrollHeight;
    }

    document.body.addEventListener("contextmenu", (e) => { 
        //e.preventDefault();
    });
    document.onkeyup = keyPressed;
}

function drawPointWithColor(x,y,c){
    
    let dot = document.createElement('div');
    
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    dot.style.backgroundColor = Interface.RGB(c,c,c);
    dot.id = "dot";


    return dot;
}

function drawCircle(){
    
    while($('dot') != undefined){
        document.body.removeChild(Main.$('dot'));
    }

    while($('line') != undefined){
        document.body.removeChild(Main.$('line'));
    }

    let angPart = 180/ 7;
    let Xradius = 240;
    let Yradius = 200;
    let Ox = screen.width/2;
    let Oy = screen.height - 160;
        
        for(let a = 0 - angPart/2; a > -180 - angPart/2; a-=angPart){

            let x = Ox + Xradius * Math.cos( Maths.degToRad(a) );
            let y = Oy + Yradius * Math.sin( Maths.degToRad(a) );
            
            let dot = drawPoint(x,y)
            document.body.appendChild(dot);
            //for(let t = -10; t < 10; t++){
                let d = 30;    

                let dx1 = x - (-d ) * Math.sin( Maths.degToRad(a) )
                let dy1 = y + (-d ) * Math.cos( Maths.degToRad(a) )
    
                let dx2 = x - (d) * Math.sin( Maths.degToRad(a) )
                let dy2 = y + (d) * Math.cos( Maths.degToRad(a) )
    
                let line = drawLine(dx1,dy1,dx2,dy2,Interface.RGB(Math.abs( parseInt(d)*30) % 255, 200 , Math.abs( parseInt(a)*70) % 255 ) )
                document.body.appendChild(line);
            //}
        }
}

function drawFunnyCircle(){
    
    while($('dot') != undefined){
        document.body.removeChild(Main.$('dot'));
    }

    while($('line') != undefined){
        document.body.removeChild(Main.$('line'));
    }

    
    let Xradius = 900;
    let Yradius = 450;
    let Ox = screen.width+1200;
    let Oy = screen.height - Yradius +1000;
    for(let i = 1; i < 40; i++){
        let angPart = 180 / (200/i);
        for(let a = 0 - angPart/2; a > -360 - angPart/2; a-=angPart){

            let x = Ox + Xradius / ( ( i/2 ) ) * Math.cos( Maths.degToRad(a) );
            let y = Oy + Yradius / ( ( i/2 ) ) * Math.sin( Maths.degToRad(a) );
            
            let dot = drawPoint(x,y)
            document.body.appendChild(dot);
            console.log("a", Math.abs( parseInt(a)*70) % 255 )
            
            //for(let t = -10; t < 10; t++){
                
                let dx1 = x - (-140 / ( (i/2) * (i/2) ) ) * Math.sin( Maths.degToRad(a) )
                let dy1 = y + (-140 / ( (i/2) * (i/2) ) ) * Math.cos( Maths.degToRad(a) )
    
                let dx2 = x - (140 / ( (i/2) * (i/2) ) ) * Math.sin( Maths.degToRad(a) )
                let dy2 = y + (140 / ( (i/2) * (i/2) ) ) * Math.cos( Maths.degToRad(a) )
    
                let line = drawLine(dx1,dy1,dx2,dy2,Interface.RGB(Math.abs( parseInt(i)*30) % 255, Math.abs( parseInt(a-i)*10) % 255 , Math.abs( parseInt(a)*70) % 255 ) )
                document.body.appendChild(line);
            //}
        }
    }
    
}

function keyPressed(e){
    console.log(e.key);
    switch(e.key){
        case 'd':
            if(game.devMenuDisplay){
                //$('dev-menu').style.visibility = "hidden";
            }else{
                //$('dev-menu').style.visibility = "visible";
            }
            game.devMenuDisplay = !game.devMenuDisplay
        break;
    }
}

function nextTurn(){
    if(player.waitingForBoardInput == null && game.encounterRunning){
        //actionHandler.runCards();
        actionList.nextTurn();
        hand.drawHand();
        board.drawSpecificBoard(board.board);
        
    }
}

function getGameObject(){
    return game;
}

function getPlayer(){
    return player;
}

function getActionList(){
    return actionList;
}

function getBoard(){
    return board;
}

function getHand(){
    return hand;
}

function getActionHandler(){
    return actionHandler;
}

function getLibrary(){
    return library;
}

function SetPlayerInstanceHoveredID(id){
    player.instanceHoveredID = id;
}

export function eraseBoardEntities(){
    for(let e in game.turnOrder){
            
        let ent = $(game.getObject(game.turnOrder[e]).boardEntity.id )

        //if(ent != null){
            //console.log(ent)
            try{
                document.body.removeChild(ent);
            }
            catch(e){
                //console.log("lol")
            }
            
        //}
    }
}

//win screen

function displayWin(){
    let bd = $('win-overlay');
    
    
    $('he-dead').innerText = "He deaded";
    
    while( $('score') ){
        $('score').parentNode.removeChild($('score'))
    }

    let sp = document.createElement('div')
    sp.setAttribute('id','score')
    sp.innerText = "score: "+game.score;
    
    let lootList = $('loot-list');
    clearDOMElement(lootList);
    game.lootOptionAmount = 0;
    game.cardsToChooseFrom = new Array();

    game.lootOptionAmount += setUpCardsToChooseFrom();
    if(((game.encounterTimer-1) % 2) == 0 && getHand().maxCardsInHand < getHand().maxHandSlots){
        game.lootOptionAmount += setUpExtraHandSlot();
    }
    

    $('bitch-dead').appendChild(sp)
    
    $('go-next').onclick = hideWin;
    $('go-next').innerText = "Go Next"

    bd.style.visibility = "visible";
}

function displayLose(){
    let bd = $('win-overlay');
    bd.style.visibility = "visible";

    $('he-dead').innerText = "You deaded";

    while( $('score') ){
        $('score').parentNode.removeChild($('score'))
    }

    let sp = document.createElement('div')
    sp.setAttribute('id','score')
    sp.innerText = "score: "+game.score;

    $('bitch-dead').appendChild(sp)
    
    $('go-next').onclick = startNewRun;
}

function displayRunOver(){
let bd = $('win-overlay');
    bd.style.visibility = "visible";

    $('he-dead').innerText = "Run Overeded";

    while( $('score') ){
        $('score').parentNode.removeChild($('score'))
    }

    let sp = document.createElement('div')
    sp.setAttribute('id','score')
    sp.innerText = "score: "+game.score;

    $('bitch-dead').appendChild(sp);    
    
    $('go-next').innerText = "New Run";

    $('go-next').onclick = startNewRun;
}

function startNewRun(){
    let bd = $('win-overlay');
    bd.style.visibility = "hidden";
    game.endRun();
    game.startRun();
}

function hideWin(){
    game.startEncounter();
    game.lootOptionAmount = 0;
    let bd = $('win-overlay');
    bd.style.visibility = "hidden";
}
//extra hand slot

function setUpExtraHandSlot(){
    let lootList = $('loot-list');

    let lo = game.lootOptionAmount;
    let cardsOption = document.createElement('li');
    cardsOption.innerText = '+1 Hand Slot';
    cardsOption.setAttribute('id','loot-option-'+ lo);
    cardsOption.onclick = function(){ claimCardSlot(lo) };

    lootList.appendChild(cardsOption);

    return 1;        
}

function claimCardSlot(index){
    console.log("index",index)
    getHand().maxCardsInHand++;
    optionPicked(index);
}

//card picking

function setUpCardsToChooseFrom(){
    let lootList = $('loot-list');

    let cardsOption = document.createElement('li');
    cardsOption.innerText = 'card reward';

    let lo = game.lootOptionAmount;

    cardsOption.setAttribute('id','loot-option-'+lo);
    let v = game.cardsToChooseFrom.length;
    cardsOption.onclick = function(){ displayCards(v,lo) };

    //get cards
    game.cardsToChooseFrom.push( getHand().cardLootTable.calculateLoot() );

    lootList.appendChild(cardsOption);

    return 1;
}

function cardSelected(cardID,optionIndex){

    let card = game.getObject(cardID);
    getHand().pickedCard(card);
    if(card.rare != undefined){
        getHand().cardLootTable.chooseRare();
    }

    for(let c in game.cardsToChooseFromBeingDisplayed){
        if(game.cardsToChooseFromBeingDisplayed[c].id == cardID){
            game.cardsToChooseFromBeingDisplayed.splice(c,1)
        } 
    }
    clearSelectCards();
    optionPicked(optionIndex);

    let bd = $('card-selector');
    bd.style.visibility = 'hidden'; 
}

function clearSelectCards(){
    for(let c in game.cardsToChooseFromBeingDisplayed){
        game.destroyInstance(game.cardsToChooseFromBeingDisplayed[c].id);
    }
}

function displayCards(cardIndex,optionIndex){
    let bd = $('card-selector');
    bd.style.visibility = 'visible';

    let cardList = $('card-option-list');
    clearDOMElement(cardList);
    game.cardsToChooseFromBeingDisplayed = new Array();
    
    let cards = game.cardsToChooseFrom[cardIndex];

    for(let c in cards){

        let data = getHand().cardPool.getItemOfName( cards[c] ) 
        if(data != null){
            let card = new Card.createCard(data,getPlayer().entity.id,null,game)
            game.cardsToChooseFromBeingDisplayed.push(card);

        }
       
        let card = Card.createCardDOM(game.cardsToChooseFromBeingDisplayed[c]);

        card.onclick = function(){cardSelected(game.cardsToChooseFromBeingDisplayed[c].id,optionIndex)}
        card.onpointerenter = CardHandling.onSelectCardEntered; 
        card.onpointerleave = CardHandling.onSelectCardExited;
        card.style.zIndex = 1;

        cardList.appendChild(card)

    }

    let back = $('go-back');
    back.onclick = function(){ 
        let bd = $('card-selector');
        bd.style.visibility = 'hidden'; 
        game.cardsToChooseFromBeingDisplayed = new Array();
        clearSelectCards();
    }

}

//option picked
function optionPicked(index){
    $('loot-list').removeChild($('loot-option-'+index))
}

export {getOffset,$,moveEntity,drawLine,drawPoint}
export {getX,getY,getPos,SetPlayerInstanceHoveredID,clearDOMElement}
export {getActionList,getGameObject,getPlayer,getBoard,getHand,getActionHandler,getLibrary}
export {targetEnt,playedCard};