// import jStat from 'jstat';
// var input;

// input = document.getElementById("input")
// input.addEventListener("input", (event) => {
//   const currentVal = event.target.value;

//   console.log(currentVal);
// })
let counter = 1

document.getElementById("calc").addEventListener("click", function() {
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
let almostDone = pSum/sSum;
console.log(almostDone);
let done = jStat.chisquare.cdf(almostDone, 1);
console.log(done);
})


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
}});
