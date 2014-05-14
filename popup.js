window.onload = function(){
  document.getElementById('searchText').onkeyup = searchText;
  document.onkeyup = controls;
};

var state = 0;
function controls(e){
    if (e.which == 27){
        window.close();
    }
    if (state == 0){
        if (e.which == 13){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {method:"go"});
                window.close();
            });
        } else if (e.which == 18){
           state = 1; 
           document.getElementById('searchText').disabled = true;
        }
    } else {
        if (e.which == 13){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {method:"go"});
                window.close();
            });
        } else if (e.which == 18){
            state = 0;
            document.getElementById('searchText').disabled = false;
            document.getElementById('searchText').focus();
        } else if (e.which == 78){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {method:"next"});
            });
        } else if (e.which == 80){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {method:"prev"});
            });
        }
    }
}
function searchText(e){
    var search = document.getElementById('searchText').value;
    if(search){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {method:"search",searchText:search});
        });
    }
}
