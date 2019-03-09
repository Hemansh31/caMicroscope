var upload_url = "../../load/Slide/upload"
var check_url = "../../load/Slide/info/"
var thumb_url = "../../load/Slide/thumb/"

var store = new Store("../../data/")

function changeStatus(step, text){

  //Reset the status bar
  document.getElementById("load_status").innerHTML=""
  
  //Display JSON as table:
  if(typeof text === 'object'){ //If the text arg is a JSON
    var col = []; //List of column headers
    for (var key in text) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }

    var table = document.createElement("table")
    table.setAttribute('border', '1')
    table.setAttribute('cellpadding', '10%')

    //Add table headers:
    var tr = table.insertRow(-1)
    for (var i = 0; i < col.length; i++) {
      var th = document.createElement("th")
      th.innerHTML = col[i]
      tr.appendChild(th)
    }

    //Add JSON data to the table as rows:
    tr = table.insertRow(-1)
    for (var j = 0; j < col.length; j++) {
      var tabCell = tr.insertCell(-1)
      tabCell.innerHTML = text[col[j]]
    }

    var divContainer = document.getElementById("json_table")
    divContainer.innerHTML = ""
    divContainer.appendChild(table)

    document.getElementById("load_status").innerHTML=step
  }

  else{
    text = JSON.stringify(text)
    text = step + " | " + text
    document.getElementById("load_status").innerHTML=text
  }
}

function handleUpload(file, filename){

  //Remove thumbnail if displayed:
  var thumbnail = document.getElementById("thumbnail")
  if (thumbnail.hasChildNodes()) {
    thumbnail.removeChild(thumbnail.childNodes[0])
  } 

  var data = new FormData()
  data.append('file', file)
  data.append('filename', filename)
  changeStatus("UPLOAD", "Begun upload")
  fetch(upload_url, {
    credentials: "same-origin",
    method: "POST",
    body: data
  }).then(
    response => response.json() // if the response is a JSON object
  ).then(
    success => changeStatus("UPLOAD", success) // Handle the success response object
  ).catch(
    error => changeStatus("UPLOAD", error) // Handle the error response object
  );
}

function getThumbnail(filename, size){
  fetch(thumb_url + filename, {credentials: "same-origin"}).then(
    response => response.json() // if the response is a JSON object
  ).then(x=>{
    let img = new Image()
    img.src = x.slide
    document.getElementById("thumbnail").appendChild(img)
  }).catch(
    error => changeStatus("CHECK, Thumbnail", error) // Handle the error response object
  );
}

function handleCheck(filename){
  fetch(check_url + filename, {credentials: "same-origin"}).then(
    response => response.json() // if the response is a JSON object
  ).then(
    success => {
      changeStatus("CHECK", success)
      getThumbnail(filename, 100)
    } // Handle the success response object
  ).catch(
    error => changeStatus("CHECK", error) // Handle the error response object
  );
}

function handlePost(filename, slidename){

  //Remove thumbnail if displayed:
  var thumbnail = document.getElementById("thumbnail")
  if (thumbnail.hasChildNodes()) {
    thumbnail.removeChild(thumbnail.childNodes[0])
  } 
  
  fetch(check_url + filename, {credentials: "same-origin"}).then(
    response => response.json() // if the response is a JSON object
  ).then(
    data => {
      data['upload_date'] = new Date(Date.now()).toLocaleString();
      data.name = slidename
      data.location = "/images/" + filename
      data.study = ""
      data.specimen = ""
      data.mpp = parseFloat(data['mpp-x']) || parseFloat(data['mpp-y']) || 0
      data.mpp_x = parseFloat(data['mpp-x'])
      data.mpp_y = parseFloat(data['mpp-y'])
      store.post("Slide", {}, data).then(
        success => changeStatus("POST", success) // Handle the success response object
      ).catch(
        error => changeStatus("POST", error) // Handle the error response object
      );
    }
  ).catch(
    error => changeStatus("POST", error) // Handle the error response object
  );
}

//register events for file upload
function UploadBtn(){
  const fileInput = document.getElementById('fileinput');
  var filename = document.getElementById('filename').value
  handleUpload(fileInput.files[0], filename);
}

function CheckBtn(){
  var filename = document.getElementById('filename').value
  handleCheck(filename)
}

function PostBtn(){
  var filename = document.getElementById('filename').value
  var slidename = document.getElementById('slidename').value
  handlePost(filename, slidename)
}
