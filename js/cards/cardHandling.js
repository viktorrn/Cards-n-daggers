import * as Card from './card.js';
import * as Main from '../main.js';

function onCardMenuEntered(e){
    this.style.transform = "scale(1.2,1.2)";
    this.style.zIndex = 50;
}

function onCardMenuLeft(e){
    this.style.transform = "scale(1,1)";
    this.style.zIndex = 1;
}

function onCardEntered(e){
    let game = Main.getGameObject();
    
    if(Main.getPlayer().cardOnMove == null){

        if(Main.getPlayer().waitingForBoardInput == null)
            Card.displayRangeData(this.getAttribute("id"))

        if(game.getObject(this.getAttribute("id")).ownerID == Main.getPlayer().entity.id){
            
            this.onpointerdown = dragCard;
            
        }   
    }    

    switch(game.getObject(game.getObject(this.getAttribute("id")).parentID).type){
        case 'hand':
            this.style.transform = "scale(1.5,1.5) translateY(-40px)";
            this.style.boxShadow = "0px 0px 20px 10px #3A3A3A"
            break;

        case 'rowContainer':
            this.style.transform = "scale(1.5,1.5)";
            this.style.height = (0.8*236)+"px";
            this.style.boxShadow = "0px 0px 20px 10px #3A3A3A"

            Main.getBoard().displayEntityCard(game.getObject(this.getAttribute("id")).ownerID);

            break;
    
    } 
    this.style.zIndex = 10;  
}

function onCardExited(e){
    let game = Main.getGameObject();
    if(Main.getPlayer().cardOnMove == null && Main.getPlayer().waitingForBoardInput == null){
       Main.clearDOMElement(Main.getBoard().interactKey)
    }
    switch(game.getObject(game.getObject(this.getAttribute("id")).parentID).type){
        case 'hand':
            
            break;

        case 'rowContainer':
            
            this.style.height = 0.8*142+"px";
            Main.getBoard().hideEntityCard();
            break;

    }
    this.style.boxShadow = "none";
    this.style.transform = "scale(1,1)";
    this.style.zIndex = 1;
}

export function onSelectCardEntered(e){
    this.style.transform = "scale(1.5,1.5)";
    this.style.boxShadow = "0px 0px 20px 10px #3A3A3A"
    this.style.zIndex = 10; 
}

export function onSelectCardExited(e){
    this.style.boxShadow = "none";
    this.style.transform = "scale(1,1)";
    this.style.zIndex = 1;
}

function onRemoveEnter(e){
    Main.getPlayer().sectionHover = 'remove';
}

function onRemoveLeave(e){
    Main.getPlayer().sectionHover = null;
}

function onPlayEnter(e){
    Main.getPlayer().sectionHover = 'play';
}

function onPlayLeave(e){
    Main.getPlayer().sectionHover = null;
}

function dragCard(e){
    Main.getPlayer().waitingForBoardInput = null
    Main.getPlayer().waitingForBoardInputQueue = new Array();

    Main.getPlayer().cardOnMove = this.id;
    
    this.style.pointerEvents = 'none';
    Main.getPlayer().CardOffsetY = e.clientY - Main.getOffset(this).top - (this.style.padding);
    Main.getPlayer().CardOffsetX = e.clientX - Main.getOffset(this).left - (this.style.padding);

    Main.getGameObject().getObjectByType('actionList').addDropZone();
    Main.getGameObject().getObjectByType('hand').addDropZone();

    window.onpointermove = cardMove;
}

function cardMove(e){
    let card = Main.$(Main.getPlayer().cardOnMove);
    e.preventDefault();
    card.style.zIndex = 200;
    card.style.position = "fixed";
    card.style.top = e.clientY - Main.getPlayer().CardOffsetY+'px'; //- offsetY  +'px';
    card.style.left = e.clientX - Main.getPlayer().CardOffsetX +'px';//- offsetX  +'px';
    card.style.transform = "scale(1.5,1.5)";
    card.style.height = (0.8*216)+"px";
}

function dropCard(){

    window.onpointermove = null;
    
    let player = Main.getPlayer();
    let game = Main.getGameObject();
    let hand = game.getObjectByType('hand');
    let actionList = game.getObjectByType('actionList');
    
    if(player.cardOnMove != null && player.sectionHover != null){
        
        Main.getBoard().hideEntityCard();
        Main.clearDOMElement(Main.getBoard().interactKey)

        let cardOnMove = game.getObject(player.cardOnMove);
        switch(player.sectionHover){
            case 'remove':
                if(game.getObject(cardOnMove.parentID).type != 'hand'){

                    let index = parseInt(Main.$(cardOnMove.parentID).getAttribute('index'))
                    player.removeCardFromRowContainer(index);
                    actionList.removeCardFromRowContainer(cardOnMove,index);

                    cardOnMove.parentID = hand.id;
                    resetCardData(cardOnMove);

                    hand.hand.push(cardOnMove);
                }
            break;

            case 'play':
                if(game.getObject(cardOnMove.parentID).type != 'rowContainer'){
                    let r = actionList.getEntityInRow(player.entity,actionList.currentTurn);
                    if(r == 0){
                        switch(game.getObject(cardOnMove.parentID).type){
                            case 'hand':
                                let cardIndex = hand.getCardIndex(cardOnMove.id);
                                //console.log(cardIndex)
                                if(cardIndex != null)
                                    hand.hand.splice(cardIndex,1);
                            break;
                        }

                        actionList.placeCardInRowContainer(cardOnMove,actionList.currentTurn);
                        player.placeCardInRowContainer(cardOnMove,actionList.currentTurn);
                        player.cardPlaced(cardOnMove);
                        actionList.orderCards();
                    }
                }else{
                    player.cardPlaced(cardOnMove);
                }
            break;
        }
        
    }

    actionList.removeDropZone();
    hand.removeDropZone();
    if(player.waitingForBoardInput == null){
        let board = Main.getBoard();
        board.drawSpecificBoard(board.board)    
    }
    
    actionList.draw();
    hand.drawHand();
    player.cardOnMove = null;

}

function resetCardData(card){
    if(card.mutation == undefined){
        resetSpecificCardData(card);
    }
    else{
        for(let i in card.mutation){
            resetSpecificCardData(card.mutation[i])
        }
    }
    
}

function resetSpecificCardData(card){
    switch(card.cardType){
        case 'move':
            card.moveData.movePos = null;
            break;

        case 'attack':
            switch(card.attackData.pattern){
                case 'target':
                    card.attackData.target = null;
                    break;
            }
            break;
    }
}

export{onCardMenuEntered,onCardMenuLeft,onCardEntered,onCardExited}
export {onRemoveEnter,onRemoveLeave,onPlayEnter,onPlayLeave,dropCard}