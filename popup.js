window.onload = function(){
  document.getElementById('searchButton').onclick = searchText;
};
function searchText(){
  var search = document.getElementById('searchText').value;
  if(search){
    chrome.tabs.executeScript({file:"search.js"});
    chrome.tabs.executeScript({file:"fuse.js"});

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {method:"search",searchText:search});
    });
    //chrome.tabs.sendMessage({method:'search',searchText:search});
  }
}
