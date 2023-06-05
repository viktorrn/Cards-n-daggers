import * as CardPool from '../cards/itemPool.js';
import * as StatusEffects from '../encounter/statusEffects.js';
import * as Card from '../cards/card.js';
import * as Main from '../main.js';
import * as Util from '../utilityFunctions.js';
import * as CardHandling from '../cards/cardHandling.js';


class Hand{
    constructor(game){
        this.type = 'hand';
        this.key=null;
        this.id=game.createInstance(this);

       

        this.overlayDisplayKey = null;
        this.cardDisplayOverlayActive = false;

        this.cardPool = null;
        
        this.hand = new Array();
        this.maxCardsInHand = 6;
        this.maxHandSlots = 9;

        this.drawPile = new Array();
        this.discardPile = new Array();
        this.shatterPile = new Array();

        this.deck = new Array();

        this.cardLootTable;
        
    }

    startRun(){
        this.cardPool = Main.getLibrary().getData('cardPool',Main.getPlayer().name);
        this.maxCardsInHand = 6;
    }

    startEncounter(){
        this.shuffleCardsFromDeckIntoDrawPile();
    }

    newSet(){
        this.drawCardFromDrawPile(4);
    }

    endEncounter(){
        Main.$(Main.clearDOMElement(this.Key));
        this.resetParentID();
        this.clearHand();
        this.clearDrawPile();
        this.clearDiscardPile();
        this.clearShatterPile();
    }

    endRun(){
        this.endEncounter();
        this.clearDeck();
        this.cardPool = null;
    }

    //load cards

    startRun(startingCards){
        this.cardPool = Main.getLibrary().getData('cardPool',Main.getPlayer().name);

        for(let i in startingCards){
            let c = this.cardPool.getItemOfName( startingCards[i] );
            if(c != null){
                let card = Card.createCard(c,Main.getPlayer().entity.id,this.id,Main.getGameObject());
                this.deck.push(card);
            }   
        }
    }

    //handle cards moving around
    
    shuffleCardsFromDeckIntoDrawPile(){
        let temp = new Array();

        for(let i in this.deck){
            temp[i] = this.deck[i]
        }

        temp = Util.shuffleArray(temp);

        for(let i in temp){
            this.drawPile.push( temp[i] );
            //console.log("card",this.deck[i])
        }
    }

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

            this.drawPile[0].parentID = this.id;
            this.hand.push(this.drawPile[0])
            
            this.drawPile.splice(0,1);
            a++;
        }
    }

    pushPlayedCardsToDiscardPile(){
        let entity = Main.getPlayer().entity;
        //console.log("player played cards")
        for(let i in entity.playedCards){
            //console.log(player.playedCards[i])
            if(entity.playedCards[i] != null){
                console.log("pc",entity.playedCards[i])
                if(StatusEffects.getIfShatter(entity.playedCards[i]) == false){
                    this.discardPile.push(entity.playedCards[i])
                }else{
                    console.log("shatter card")
                    this.shatterPile.push(entity.playedCards[i])
                }

                entity.playedCards[i].parentID = this.id;
                entity.playedCards[i] = null;
            }
        }

    }

    shuffleAndReturnFromDiscardPile(){
        this.discardPile = Util.shuffleArray(this.discardPile);
        //console.log("getting cards from discardPile")
        while(this.discardPile.length > 0){
            //console.log("moving card",this.discardPile[0],"to drawPile")
            
            this.drawPile.push(this.discardPile[0])
            this.discardPile.splice(0,1);


        }
    }


    //clearing functions
    resetParentID(){
        for(let i in this.deck){
            this.deck[i].parentID = null;
        }
    }

    clearHand(){
        this.hand = new Array();
    }

    clearDrawPile(){
        this.drawPile = new Array();
    }

    clearDiscardPile(){
        this.discardPile = new Array();
    }

    clearShatterPile(){
        this.shatterPile = new Array();
    }

    clearDeck(){
        for(let i in this.deck){
            Main.getGameObject().destroyInstance(this.deck[i].id);
        }
        this.deck = new Array();
    }
    
    //functions

    getCardIndex(id){
        for(const i in this.hand){
            if(this.hand[i].id == id)
                return i;
        }
        return null;
    }

    //drop zones

    addDropZone(){
        Main.$('removeCard').onpointerenter = CardHandling.onRemoveEnter;
        Main.$('removeCard').onpointerleave = CardHandling.onRemoveLeave;
        Main.$('removeCard').style.zIndex = 25;
    }
    
    removeDropZone(){
        Main.$('removeCard').onpointerenter = null;
        Main.$('removeCard').onpointerleave = null;
        Main.$('removeCard').style.zIndex = -1;
    }

    //display stuff

    displayCardList(type){
        this.cardDisplayOverlayActive = true;
        this.overlayDisplayKey.style.visibility = 'visible';
        //console.log("type",type)
        switch(type){
            case 'deck':
                this.overlayDisplayList(this.deck);
            break;

            case 'drawPile':
                this.overlayDisplayList(this.drawPile);
            break;

            case 'discardPile':
                this.overlayDisplayList(this.discardPile);
            break;
        }
    }

    overlayDisplayList(List){
        //console.log("cards in display List")
        for(let i in List){
            let card = Card.createCardDOM(List[i])
            card.onpointerenter = CardHandling.onCardMenuEntered;
            card.onpointerleave = CardHandling.onCardMenuLeft;
            Main.$('overlayCardList').appendChild(card);
        }
    }

    hideCardList(){
        this.cardDisplayOverlayActive = false;
        this.overlayDisplayKey.style.visibility = 'hidden';
        Main.clearDOMElement(Main.$('overlayCardList'))
    }

    //draw funtion
    drawHand(){
        Main.clearDOMElement(this.Key);
        Main.$('show-drawPile').innerText = this.drawPile.length;
        Main.$('show-discardPile').innerText = this.discardPile.length;

        for(let i in this.hand){
            let card = Card.createCardDOM(this.hand[i]);

            card.onpointerenter = CardHandling.onCardEntered; 
            card.onpointerleave = CardHandling.onCardExited;
            card.style.zIndex = 1;
            this.Key.appendChild(card);
        }

    }

    //pick card functions
    pickedCard(c){
        c.ownerID = Main.getPlayer().entity.id;
        this.deck.push(c);
    }

}

export{Hand}