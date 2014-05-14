function focus_highlight(text){
    text.innerHTML = "<span style='color: #000000; background-color: #FF8800;'>" + text.innerHTML + "</span>";
}

function highlight(text){
    text.innerHTML = "<span style='color: #000000; background-color: #FFFF00;'>" + text.innerHTML + "</span>";
}

function unhighlight(text){
    text.innerHTML = text.getElementsByTagName("span")[0].innerHTML;
}



var results = [];
var prevResults = [];
var focus = 0;
var searchText = "";
var l = document.links;

function executeSearch(searchText){
     var links = [];
     for(var i=0;i<l.length; i++){
         links.push({id:i,text:l[i].text,url:l[i].href,link:l[i]});
     }
     var options = {
         keys: ['text'],
         id: 'id',
         threshold: 0.4
     }
     var f = new Fuse(links, options);
     results = f.search(searchText);

     for(var i=0;i<prevResults.length;i++){
         unhighlight(l[prevResults[i]]);
     }
     prevResults = results.slice(0);

     for(var i=0;i<results.length;i++){
         var r = results[i];
         var focus_found = false;
         if (r == focus){
             focus_highlight(l[r]);
             focus_found = true;
         } else {
             highlight(l[r]);
         }
         if (focus_found == false){
             focus_found = true;
             focus = results[0];
             unhighlight(l[focus]);
             focus_highlight(l[focus]);
         }
     }
}



chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message.method == "go"){
        window.location.href = l[focus].href;
    } else if (message.method == "next"){
        for(var i=0; i<prevResults.length-1;i++){
            if (focus == prevResults[i]){
                unhighlight(l[focus]);
                highlight(l[focus]);
                focus = prevResults[i+1];
                unhighlight(l[focus]);
                focus_highlight(l[focus]);
                break;
            }
        }
    } else if (message.method == "prev"){
        for(var i=1; i<prevResults.length;i++){
            if (focus == prevResults[i]){
                unhighlight(l[focus]);
                highlight(l[focus]);
                focus = prevResults[i-1];
                unhighlight(l[focus]);
                focus_highlight(l[focus]);
                break;
            }
        }
    } else if  (message.method == "search"){
        searchText = message.searchText;
        executeSearch(searchText);
        //var links = [],l = document.links;
        //for(var i=0;i<l.length; i++){
        //    links.push({id:i,text:l[i].text,url:l[i].href,link:l[i]});
        //}
        //var options = {
        //    keys: ['text'],
        //    id: 'id',
        //    threshold: 0.4
        //}
        //var f = new Fuse(links, options);
        //results = f.search(message.searchText);

        //for(var i=0;i<prevResults.length;i++){
        //    unhighlight(l[prevResults[i]]);
        //}
        //prevResults = results.slice(0);

        //for(var i=0;i<results.length;i++){
        //    var r = results[i];
        //    var focus_found = false;
        //    if (r == focus){
        //        focus_highlight(l[r]);
        //        focus_found = true;
        //    } else {
        //        highlight(l[r]);
        //    }
        //    if (focus_found == false){
        //        focus_found = true;
        //        focus = results[0];
        //        unhighlight(l[focus]);
        //        focus_highlight(l[focus]);
        //    }
        //}
    }
});


