// import jStat from 'jstat';
// var input;

// input = document.getElementById("input")
// input.addEventListener("input", (event) => {
//   const currentVal = event.target.value;

//   console.log(currentVal);
// })
let counter = 1
let history = [];
//calculation
document.getElementById("calc").addEventListener("click", function() {
  var pVal = 0;
  let primeroSum = [];
  let segundoSum = [];
  let pSum = 0;
  let sSum = 0;
  for(let i = 0; i<counter; i++){
  let a = parseFloat(document.getElementsByTagName("input")[6*i+4].value);
  let b = parseFloat(document.getElementsByTagName("input")[6*i+5].value);
  let c = parseFloat(document.getElementsByTagName("input")[6*i+7].value);
  let d = parseFloat(document.getElementsByTagName("input")[6*i+8].value);
  if(i==0){
     a = parseFloat(document.getElementsByTagName("input")[3].value);
     b = parseFloat(document.getElementsByTagName("input")[4].value);
     c = parseFloat(document.getElementsByTagName("input")[7].value);
     d = parseFloat(document.getElementsByTagName("input")[8].value);
  }
  else{

  };




  if(isNaN(a)){a=0}
  if(isNaN(b)){b=0}
  if(isNaN(c)){c=0}
  if(isNaN(d)){d=0}
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
if(sSum==0||isNaN(sSum)){pVal="Undefined or Error"}
else{
let almostDone = pSum/sSum;
console.log(almostDone);
pVal = 1-jStat.chisquare.cdf(almostDone, 1);
history.push(pVal);
}
console.log(pVal);
alert(pVal);
}
)



//add boxes button
document.getElementById("addButton").addEventListener("click", function() {
  var inputContainer = document.getElementById("inputContainer");
  counter++;
//   var text = "Trial " + counter
//   let ph = ["True" + counter + "A", "False" + counter + "A", "Total" + counter + "A", "True" + counter + "B", "False" + counter + "B", "Total" + counter + "B"]
//   inputContainer.append(text);
//   for (var i = 0; i < 6; i++) {
//       if (i%3 == 0) {
//           var br = document.createElement("br");
//           inputContainer.appendChild(br);
//       }
      
//       var newInput = document.createElement("input");
//       newInput.type = "number";
//       newInput.placeholder = ph[i]
//       inputContainer.appendChild(newInput);
// }
// var br = document.createElement("br");
// inputContainer.appendChild(br);
  var table = document.createElement("table");
  // const input = document.createElement('input'); 
  // input.type = 'number';
  for(let i = 0; i<4; i++){
    let row = document.createElement('tr');
    for(let j = 0; j<4; j++){
      const input = document.createElement('input'); 
      // input.type = 'number'; 
      const cell = document.createElement('td')
      switch (true) {
        case (i === 0 && j === 0):
          cell.textContent = "Trial " + counter;
          cell.id = counter + "A" + j
          break;
        case (i === 0 && j === 1):
          cell.id = counter + "A" + j
          cell.textContent = document.getElementsByTagName("input")[0].value
          break;
        case (i === 0 && j === 2):
          cell.id = counter + "A" + j
          cell.textContent = document.getElementsByTagName("input")[1].value
          break;
        case (i === 0 && j === 3):
          cell.textContent="Total";
          break;
        case (i === 1 && j === 0):
          cell.id = counter + "B" + j
          cell.textContent = document.getElementsByTagName("input")[2].value
          break;
        case (i === 1 && j === 1):
          cell.appendChild(input); 
          break;
        case (i === 1 && j === 2):
          cell.appendChild(input); 
          break;
        case (i === 1 && j === 3):
          cell.appendChild(input); 
          break;

        case (i === 2 && j === 0):
          cell.id = counter + "C" + j
          cell.textContent = document.getElementsByTagName("input")[6].value
          break;
        case (i === 2 && j === 1):
          cell.appendChild(input); 
          break;
        case (i === 2 && j === 2):
          cell.appendChild(input); 
          break;
        case (i === 2 && j === 3):
          cell.appendChild(input); 
          break;
        case (i === 3 && j === 0):
          cell.textContent="Total";
          break;
        case (i === 3 && j === 1):
          cell.textContent = 0;
          cell.id = counter + "D" + j
          break;
        case (i === 3 && j === 2):
          cell.textContent = 0;
          cell.id = counter + "D" + j
          break;
        case (i === 3 && j === 3):
          break;

        default:
          // Default case for other cells (not really necessary, all cases covered)
          cell.textContent = `Row ${i+1}, Col ${j+1}`;
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  inputContainer.appendChild(table);
}
);

document.getElementById("subButton").addEventListener("click", function() {
// alert("VIRUS INFECTED BY HNERY RUTGERS")
if(counter>1){
var inputContainer = document.getElementById("inputContainer");
var tables = document.getElementsByTagName("table");
inputContainer.removeChild(tables[counter-1]);
// // Get all input elements within the container
// var inputs = inputContainer.getElementsByTagName("input");
// var breaks = inputContainer.getElementsByTagName("br");
// // Remove inputs one by one
// for (var i = inputs.length - 1; i >= 6*counter-6; i--) {
//     inputContainer.removeChild(inputs[i]); 
// }
// //remove breaks might replace with words later...
// inputContainer.removeChild(breaks[breaks.length-3]);
//   inputContainer.removeChild(breaks[breaks.length-2]);
//   inputContainer.removeChild(breaks[breaks.length-1]);

// //text removal
//   const textNodes = Array.from(inputContainer.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
//   if (textNodes.length > 0) {
//       const lastTextNode = textNodes[textNodes.length - 1];
//       inputContainer.removeChild(lastTextNode);
//   }


counter--;
inputs = document.querySelectorAll('input, textarea');
}
});

document.getElementById("clear").addEventListener("click", function() {
  document.getElementsByTagName("input")[3].value='';
  document.getElementsByTagName("input")[4].value='';
  document.getElementsByTagName("input")[5].value='';
  document.getElementsByTagName("input")[7].value='';
  document.getElementsByTagName("input")[8].value='';
  document.getElementsByTagName("input")[9].value='';
  for(let i = 0; i<counter*6-6; i++){
  document.getElementsByTagName("input")[i+10].value='';
}


})


document.getElementById("AutoFill").addEventListener("click", function() {
  if(counter>1){
  for(let i = 10; i<counter*6+4; i+=3){
    let y = document.getElementsByTagName("input")[i].value
    let n = document.getElementsByTagName("input")[i+1].value
    let t = document.getElementsByTagName("input")[i+2].value
  if(y==''&&n!=''&&t!=''){document.getElementsByTagName("input")[i].value=t-n}
  else if(y!=''&&n==''&&t!=''){document.getElementsByTagName("input")[i+1].value=t-y}
  else if(y!=''&&n!=''&&t==''){
    y=y-0;
    n=n-0;
    document.getElementsByTagName("input")[i+2].value=y+n}
}}
for(let i=3; i<9; i+=4){
  let y = document.getElementsByTagName("input")[i].value
  let n = document.getElementsByTagName("input")[i+1].value
  let t = document.getElementsByTagName("input")[i+2].value
if(y==''&&n!=''&&t!=''){document.getElementsByTagName("input")[i].value=t-n}
else if(y!=''&&n==''&&t!=''){document.getElementsByTagName("input")[i+1].value=t-y}
else if(y!=''&&n!=''&&t==''){
  y=y-0;
  n=n-0;
  document.getElementsByTagName("input")[i+2].value=y+n}
}


})

//table updates

function tableUpdates() {
  let id;
  let a, b, c, d, e, f;
  for(let i = 0; i<counter; i++){
    if(i!=0){
    id = (i+1)+"A"+1
    a=document.getElementsByTagName("input")[0].value
    document.getElementById(id).textContent=a
    id = (i+1)+"A"+2
    b=document.getElementsByTagName("input")[1].value
    document.getElementById(id).textContent=b
    id = (i+1)+"B"+0
    c=document.getElementsByTagName("input")[2].value
    document.getElementById(id).textContent=c
    id = (i+1)+"C"+0
    d=document.getElementsByTagName("input")[6].value
    document.getElementById(id).textContent=d
    id = (i+1)+"D"+1
    e=0+Number(document.getElementsByTagName("input")[6*i+4].value)+Number(document.getElementsByTagName("input")[6*i+7].value)
    document.getElementById(id).textContent=e
    id = (i+1)+"D"+2
    f=0+Number(document.getElementsByTagName("input")[6*i+5].value)+Number(document.getElementsByTagName("input")[6*i+8].value)
    document.getElementById(id).textContent=f   
    }
    else{
      document.getElementById("1D1").textContent=Number(document.getElementsByTagName("input")[3].value)+Number(document.getElementsByTagName("input")[7].value);
      document.getElementById("1D2").textContent=Number(document.getElementsByTagName("input")[4].value)+Number(document.getElementsByTagName("input")[8].value);
    }
    

  }
}

inputContainer.addEventListener('input', (event) => {
  tableUpdates();
})

document.getElementById("recent").addEventListener('click', () => {
  document.getElementById("history").style.display = 'flex'; // Use 'flex' to center the popup
});
