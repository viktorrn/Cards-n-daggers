function copyArray(array){
    let temp = new Array(array.length);
    for(let i in array){
        temp[i] = array[i];
    }
    //console.log("copied array",array);
    return temp;
}

function copyObject(obj){
    //console.log("copied object",obj)
    return JSON.parse(JSON.stringify(obj));
}

function clone(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;    
    var temp = new obj.constructor(); 
    for(var key in obj)
        temp[key] = clone(obj[key]);    
    return temp;
}

function readFile(src,type){
    fetch(src).then(result => result.json())
    .then(result => {
        type(result);
        return true;
    })
    .catch(error =>{
        console.log('Error:',error)
        return false;
    })
}

function shuffleArray(array) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
  }

function cardBubbleSort(arr){
    var len = arr.length;
    for (var i = len-1; i>=0; i--){
      for(var j = 1; j<=i; j++){
        if(arr[j-1].priority>arr[j].priority){
            var temp = arr[j-1];
            arr[j-1] = arr[j];
            arr[j] = temp;
         }
      }
    }
    return arr;
 }

function tileBubbleSort(arr){
    var len = arr.length;
    for (var i = len-1; i>=0; i--){
      for(var j = 1; j<=i; j++){
        if(arr[j-1].score>arr[j].score){
            var temp = arr[j-1];
            arr[j-1] = arr[j];
            arr[j] = temp;
         }
      }
    }
    return arr;
}

export{cardBubbleSort,shuffleArray,tileBubbleSort}
export {copyArray,copyObject,readFile,clone}