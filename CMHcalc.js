// import jStat from 'jstat';
// var input;
const popup = document.querySelector('.calcPopup');
const overlay = document.querySelector('.calcPopupOverlay');
// input = document.getElementById("input")
// input.addEventListener("input", (event) => {
//   const currentVal = event.target.value;

//   console.log(currentVal);
// })
let counter = 1;
let history = [];
let calculations = 0;
var pVal
//calculation
document.getElementById("calc").addEventListener("click", function() {
  pvalCalc(0);
}
)
document.getElementById("calcPlus").addEventListener("click", function() {
    pvalCalc(1);
}
)

function pvalCalc(plus){
  pVal = 0;
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
if(sSum==0||isNaN(sSum)){pVal="Undefined or Error, Reivew inputs"}
else{
let almostDone = pSum/sSum;
console.log(almostDone);
pVal = 1-jStat.chisquare.cdf(almostDone, 1);
history.push(pVal);
RecentCalcs = document.getElementById("recentCalcs");
var textNode = document.createElement('div');
textNode.textContent = pVal;
// var br = document.createElement("br");
RecentCalcs.prepend(textNode);

// RecentCalcs.appendChild(br);
console.log(pVal);

if(plus!=0){calcPopup();return;}

}

alert(pVal);
}
function addTable(){
  var inputContainer = document.getElementById("inputContainer");
  counter++;
  var table = document.createElement("table");
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
          cell.textContent = 0;
          cell.id = counter + "D" + j
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
function subTable(){
  if(counter>1){
    var inputContainer = document.getElementById("inputContainer");
    var tables = document.getElementsByTagName("table");
    inputContainer.removeChild(tables[counter-1]);
    counter--;
inputs = document.querySelectorAll('input, textarea');
}
}
function clearTables(){
  document.getElementsByTagName("input")[3].value='';
  document.getElementsByTagName("input")[4].value='';
  document.getElementsByTagName("input")[5].value='';
  document.getElementsByTagName("input")[7].value='';
  document.getElementsByTagName("input")[8].value='';
  document.getElementsByTagName("input")[9].value='';
  for(let i = 0; i<counter*6-6; i++){
  document.getElementsByTagName("input")[i+10].value='';
}
tableUpdates()
}
function autoFill(){
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
  tableUpdates()  
}

document.getElementById("addButton").addEventListener("click", function() {
  addTable();
// //   var text = "Trial " + counter
// //   let ph = ["True" + counter + "A", "False" + counter + "A", "Total" + counter + "A", "True" + counter + "B", "False" + counter + "B", "Total" + counter + "B"]
// //   inputContainer.append(text);
// //   for (var i = 0; i < 6; i++) {
// //       if (i%3 == 0) {
// //           var br = document.createElement("br");
// //           inputContainer.appendChild(br);
// //       }
      
// //       var newInput = document.createElement("input");
// //       newInput.type = "number";
// //       newInput.placeholder = ph[i]
// //       inputContainer.appendChild(newInput);
// // }
// // var br = document.createElement("br");
// // inputContainer.appendChild(br);
  
//   // const input = document.createElement('input'); 
//   // input.type = 'number';
//   for(let i = 0; i<4; i++){
//     let row = document.createElement('tr');
//     for(let j = 0; j<4; j++){
//       const input = document.createElement('input'); 
//       // input.type = 'number'; 
//       const cell = document.createElement('td')
//       switch (true) {
//         case (i === 0 && j === 0):
//           cell.textContent = "Trial " + counter;
//           cell.id = counter + "A" + j
//           break;
//         case (i === 0 && j === 1):
//           cell.id = counter + "A" + j
//           cell.textContent = document.getElementsByTagName("input")[0].value
//           break;
//         case (i === 0 && j === 2):
//           cell.id = counter + "A" + j
//           cell.textContent = document.getElementsByTagName("input")[1].value
//           break;
//         case (i === 0 && j === 3):
//           cell.textContent="Total";
//           break;
//         case (i === 1 && j === 0):
//           cell.id = counter + "B" + j
//           cell.textContent = document.getElementsByTagName("input")[2].value
//           break;
//         case (i === 1 && j === 1):
//           cell.appendChild(input); 
//           break;
//         case (i === 1 && j === 2):
//           cell.appendChild(input); 
//           break;
//         case (i === 1 && j === 3):
//           cell.appendChild(input); 
//           break;

//         case (i === 2 && j === 0):
//           cell.id = counter + "C" + j
//           cell.textContent = document.getElementsByTagName("input")[6].value
//           break;
//         case (i === 2 && j === 1):
//           cell.appendChild(input); 
//           break;
//         case (i === 2 && j === 2):
//           cell.appendChild(input); 
//           break;
//         case (i === 2 && j === 3):
//           cell.appendChild(input); 
//           break;
//         case (i === 3 && j === 0):
//           cell.textContent="Total";
//           break;
//         case (i === 3 && j === 1):
//           cell.textContent = 0;
//           cell.id = counter + "D" + j
//           break;
//         case (i === 3 && j === 2):
//           cell.textContent = 0;
//           cell.id = counter + "D" + j
//           break;
//         case (i === 3 && j === 3):
//           cell.textContent = 0;
//           cell.id = counter + "D" + j
//           break;

//         default:
//           // Default case for other cells (not really necessary, all cases covered)
//           cell.textContent = `Row ${i+1}, Col ${j+1}`;
//       }
//       row.appendChild(cell);
//     }
//     table.appendChild(row);
//   }
//   inputContainer.appendChild(table);
}
);

document.getElementById("subButton").addEventListener("click", function() {
  subTable();
// alert("VIRUS INFECTED BY HNERY RUTGERS")
// if(counter>1){
// var inputContainer = document.getElementById("inputContainer");
// var tables = document.getElementsByTagName("table");
// inputContainer.removeChild(tables[counter-1]);
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


// counter--;
// inputs = document.querySelectorAll('input, textarea');
// }
});

document.getElementById("clear").addEventListener("click", function() {
clearTables();
})


document.getElementById("AutoFill").addEventListener("click", function() {
  autoFill();

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
    id = (i+1)+"D"+3
    document.getElementById(id).textContent=e+f   
    }
    else{
      document.getElementById("1D1").textContent=Number(document.getElementsByTagName("input")[3].value)+Number(document.getElementsByTagName("input")[7].value);
      document.getElementById("1D2").textContent=Number(document.getElementsByTagName("input")[4].value)+Number(document.getElementsByTagName("input")[8].value);
      document.getElementById("1D3").textContent=Number(document.getElementsByTagName("input")[4].value)+Number(document.getElementsByTagName("input")[8].value)+Number(document.getElementsByTagName("input")[3].value)+Number(document.getElementsByTagName("input")[7].value);
    }
    

  }
}

inputContainer.addEventListener('input', (event) => {
  tableUpdates();
})

function calcPopup() {
  var container = document.getElementById("calcPopupContent");
  container.replaceChildren();
showCalcPopup();
  for(var count = 1; count<=counter; count++){
    let table = document.createElement("table");
    //i is row j is column
    for(let i = 0; i<4; i++){
      let row = document.createElement('tr')
      for(let j = 0; j<5; j++){
        const cell = document.createElement('td');
        switch (true) {
          //cases where you just copy the number, the "input 3x3"
          case (i==1 && j>=1 && j<=3):
            if(count==1){
              cell.textContent = document.getElementsByTagName("input")[j+2].value;
            }
            else{
              cell.textContent = document.getElementsByTagName("input")[3+(count-1)*6+j].value;
            }
            break;
          case (i==2 && j>=1 && j<=3):
            if(count==1){
              cell.textContent = document.getElementsByTagName("input")[j+6].value;
            }
            else{
              cell.textContent = document.getElementsByTagName("input")[6+(count-1)*6+j].value;
            }
            // cell.textContent = document.getElementById(counter + "C" + j).textContent;
            break;
          case (i==3 && j>=1 && j<=3):
            cell.textContent = document.getElementById(count + "D" + j).textContent;
            break;
            //text cases
            case (i === 0 && j === 0):
              cell.textContent = "Trial " + count;
              break;
            case (i === 0 && j === 1):
              cell.textContent = document.getElementsByTagName("input")[0].value
                break;
            case (i === 0 && j === 2):
                  cell.textContent = document.getElementsByTagName("input")[1].value
                  break;
            case (i === 0 && j === 3):
                    cell.textContent="Total";
                    break;
            case (i === 1 && j === 0):
                      cell.textContent = document.getElementsByTagName("input")[2].value
                      break;
            case (i === 2 && j === 0):
                        cell.textContent = document.getElementsByTagName("input")[6].value
                        break;
            case (i === 3 && j === 0):
                          cell.textContent="Total";
                          break;
            case (i==0 && j==4): cell.textContent = document.getElementsByTagName("input")[0].value + " / Total";
                          break;              
        }
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    container.appendChild(table);
    console.log("added");
  }
}

function showCalcPopup() {
  overlay.style.display = 'block';  
  popup.style.display = 'flex';  
  popup.style.pointerEvents = 'auto'; 
}

function hidePopup() {
  popup.style.display = 'none';
  overlay.style.display = 'none';  
  popup.style.pointerEvents = 'none'; 
}
  
tableUpdates();
overlay.addEventListener('click', hidePopup);


var fileInput = document.getElementById("xInput");
fileInput.addEventListener('change', function(event) {
  var file = fileInput.files[0];

  // Check if the file is an Excel file (XLSX)
  var validFile = file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.csv'));
  if (validFile) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var data = e.target.result;
    var workbook = XLSX.read(data, {type: 'binary'});
    var sheetName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[sheetName];

    // Get the range of the sheet (e.g., "A1:C3")
    var range = worksheet['!ref'];
    var startRow = range.split(':')[0].match(/\d+/)[0]; // Extract the starting row number
    var endRow = range.split(':')[1].match(/\d+/)[0]; // Extract the ending row number
    var startCol = range.split(':')[0].match(/[A-Za-z]+/)[0]; // Extract the starting column
    var endCol = range.split(':')[1].match(/[A-Za-z]+/)[0]; // Extract the ending column

    console.log('Number of rows:', endRow - startRow + 1);

    // Function to convert Excel column (e.g., "A", "B", "C", ...) to a 0-based index
    function colToIndex(col) {
      let index = 0;
      let length = col.length;
      for (let i = 0; i < length; i++) {
        index = index * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
      }
      return index - 1; // Adjust for 0-based index
    }

    // Convert columns from letters to numbers
    var startColIndex = colToIndex(startCol);
    var endColIndex = colToIndex(endCol);

    var sheetData = [];
    for (var row = startRow; row <= endRow; row++) {
      var rowData = [];
      for (var colIndex = startColIndex; colIndex <= endColIndex; colIndex++) {
        var colLetter = String.fromCharCode('A'.charCodeAt(0) + colIndex); // Convert index to letter
        var cellAddress = colLetter + row;
        if (worksheet[cellAddress]) {
          rowData.push(worksheet[cellAddress].v); // Add the cell value to the rowData array
        } else {
          rowData.push(null); // In case the cell is empty
        }
      }
      sheetData.push(rowData); // Add the rowData to the sheetData array
    }

//actual work heer

//get right amont of tables
let tables = (sheetData.length-1)/4;
while(tables!=counter){
  if(tables>counter){addTable();}
  else{subTable();}
}
clearTables();
document.getElementsByTagName("input")[0].value = sheetData[1][2];
document.getElementsByTagName("input")[1].value = sheetData[2][2];
document.getElementsByTagName("input")[2].value = sheetData[1][1];
document.getElementsByTagName("input")[6].value = sheetData[3][1];
let dataCol = 3;
let pos = 10;
for(let i = 1; i<=tables*4; i++){
  if(i==1){
    document.getElementsByTagName("input")[3].value = sheetData[i][dataCol];
  }
  else if(i==2){
    document.getElementsByTagName("input")[4].value = sheetData[i][dataCol];
  }
  else if(i==3){
    document.getElementsByTagName("input")[7].value = sheetData[i][dataCol];
  }
  else if(i==4){
    document.getElementsByTagName("input")[8].value = sheetData[i][dataCol];
  }
  else{
    
    document.getElementsByTagName("input")[pos].value = sheetData[i][dataCol];
    pos++;
    if(i%2==0){pos++};
  }
}

autoFill();
tableUpdates();


  };
  reader.readAsBinaryString(fileInput.files[0]);
}
else { alert("Not Valid File Type")}
});

function downloadExcel(){
  const outTable = [];

  //trial col
  for(let i = 0; i<counter*4+1; i++){
    outTable[i] = [];
    if(i==0){outTable[i][0]="Trial"; continue;}
    outTable[i][0]="Trial " + (Math.floor((i-1)/4)+1);
  }
  //treat col
  for(let i = 0; i<counter*4+1; i++){
    
    if(i==0){outTable[i][1]="Treatment"; continue;}
    let treatA, treatB;
    treatA = document.getElementsByTagName('input')[2].value;
    treatB = document.getElementsByTagName('input')[6].value;

    if(i%3==0||i%4==0){
      outTable[i][1]=treatB;
    }
    else{
      outTable[i][1]=treatA
    }
    
  }
  //out col
  for(let i = 0; i<counter*4+1; i++){
    
    if(i==0){outTable[i][2]="Outcome"; continue;}
    let outA, outB;
    outA = document.getElementsByTagName('input')[0].value;
    outB = document.getElementsByTagName('input')[1].value;

    if(i%2==1){
      outTable[i][2]=outA;
    }
    else{
      outTable[i][2]=outB
    }
    
  }
//result col
let headStart = 10;
  for(let i = 0; i<counter*4+1; i++){
    
    if(i==0){outTable[i][3]="Result"; continue;}
    if(i==1){outTable[i][3]=document.getElementsByTagName('input')[3].value;}
    else if (i==2){outTable[i][3]=document.getElementsByTagName('input')[4].value;}
    else if (i==3){outTable[i][3]=document.getElementsByTagName('input')[7].value;}
    else if (i==4){outTable[i][3]=document.getElementsByTagName('input')[8].value;}
    else {outTable[i][3]=document.getElementsByTagName('input')[headStart].value; headStart++; if(i%2==0){headStart++}}
  }

  outTable[0][4] = "pVal: " + pVal;


  //arr to xl
  const ws = XLSX.utils.aoa_to_sheet(outTable);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  XLSX.writeFile(wb, "output.xlsx");

}