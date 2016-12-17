window.onload = function(){
  document.getElementById('searchText').onkeyup = searchText;
  document.onkeyup = controls;
};


var port;
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    port = chrome.tabs.connect(tabs[0].id, {name: "linkmagpie"});
    port.postMessage("dude");
});


var state = 0;
function controls(e){
    if (state == 0){
        if (e.which == 13){
            port.postMessage({method:"go"});
            window.close();
        } else if (e.which == 18){
           state = 1; 
           document.getElementById('searchText').disabled = true;
        }
    } else {
        if (e.which == 13){
            port.postMessage({method:"go"});
            window.close();
        } else if (e.which == 18){
            state = 0;
            document.getElementById('searchText').disabled = false;
            document.getElementById('searchText').focus();
        } else if (e.which == 78){
            port.postMessage({method:"next"});
        } else if (e.which == 80){
            port.postMessage({method:"prev"});
        }
    }
}
function searchText(e){
    var search = document.getElementById('searchText').value;
    if(search){
        port.postMessage({method:"search",searchText:search});
    }
}
