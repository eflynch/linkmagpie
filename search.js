// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    var links = [],l = document.links;
    for(var i=0;i<l.length; i++){
        links.push({id:i,text:l[i].text,url:l[i].href,link:l[i]});
    }
    //var links = [{
    //    id: 1,
    //    text: 'The Great Gatsby',
    //    url: 'F. Scott. Fitzgerald'
    //},{
    //    id: 2,
    //    text: 'The DaVinci Code',
    //    url: 'Dan Brown'
    //}];

    var options = {
        keys: ['text'],
        id: 'id'
    }
    var f = new Fuse(links, options);
    var results = f.search(message.searchText);
    alert(results);
    for(var i=0;i<results.length;i++){
        var r = results[i];
        l[r].innerHTML = "<span style='color: #000000;'>" + l[r].innerHTML + "</span>";
    }
});
