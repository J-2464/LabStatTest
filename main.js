// import jStat from 'jstat';
// var input;

// input = document.getElementById("input")
// input.addEventListener("input", (event) => {
//   const currentVal = event.target.value;

//   console.log(currentVal);
// })
let counter = 1


//calculation
document.getElementById("calc").addEventListener("click", function() {
  let pVal = 0;
  let primeroSum = [];
  let segundoSum = [];
  let pSum = 0;
  let sSum = 0;
  for(let i = 0; i<counter; i++){

  let a = parseFloat(document.getElementsByTagName("input")[4*i].value);
  let b = parseFloat(document.getElementsByTagName("input")[4*i+1].value);
  let c = parseFloat(document.getElementsByTagName("input")[4*i+2].value);
  let d = parseFloat(document.getElementsByTagName("input")[4*i+3].value);
  let exopherAB = b/(a+b);
  let exopherCD = d/(c+d);
  let tot = a+b+c+d;
  let james = (a-((a+b)*(a+c))/tot);
  primeroSum[i]=james;
  let mark = ((a+b)*(a+c)*(b+d)*(c+d))/((tot*tot*tot)-(tot*tot));
  segundoSum[i]=mark;
  // console.log(mark);
  // console.log(james);
  // console.log(exopherAB);
  // console.log(exopherCD);
  // console.log(counter)
}
for(let j = 0; j<counter; j++){
  pSum=pSum + primeroSum[j];
  sSum=sSum + segundoSum[j];
}
pSum = Math.pow(Math.abs(pSum)-0.5,2);
console.log(pSum)
console.log(sSum)
if(sSum==0){pVal="Undefined or Error"}
else{
let almostDone = pSum/sSum;
console.log(almostDone);
pVal = 1-jStat.chisquare.cdf(almostDone, 1);
}
console.log(pVal);
}
)



//add boxes button
document.getElementById("addButton").addEventListener("click", function() {
  var inputContainer = document.getElementById("inputContainer");
  counter++;
  for (var i = 0; i < 4; i++) {
      if (i%2 == 0) {
          var br = document.createElement("br");
          inputContainer.appendChild(br);
      }
      
      var newInput = document.createElement("input");
      newInput.type = "number";
      inputContainer.appendChild(newInput);
}
var br = document.createElement("br");
inputContainer.appendChild(br);
}
);

document.getElementById("subButton").addEventListener("click", function() {
// alert("VIRUS INFECTED BY HNERY RUTGERS")
if(counter>1){
var inputContainer = document.getElementById("inputContainer");
    
// Get all input elements within the container
var inputs = inputContainer.getElementsByTagName("input");
var breaks = inputContainer.getElementsByTagName("br");
// Remove inputs one by one
for (var i = inputs.length - 1; i >= 4*counter-8; i--) {
    inputContainer.removeChild(inputs[i]);
}
inputContainer.removeChild(breaks[breaks.length-3]);
  inputContainer.removeChild(breaks[breaks.length-2]);
  inputContainer.removeChild(breaks[breaks.length-1]);
counter--
}
}
);
