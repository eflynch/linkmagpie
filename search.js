if (!String.prototype.contains) {
    String.prototype.contains = function(s, i) {
        return this.indexOf(s, i) != -1;
    }
}

function focus_highlight(r){
    r.el.innerHTML = r.highlighted_text;
    r.el.innerHTML = "<span class='linkmagpie' style='color: #909090; background-color: #FF8800;'>" + r.el.innerHTML + "</span>";
    r.el.scrollIntoView(false);
}

function highlight(r){
    r.el.innerHTML = r.highlighted_text;
    r.el.innerHTML = "<span class='linkmagpie' style='color: #909090; background-color: #FFFF00;'>" + r.el.innerHTML + "</span>";
}

function unhighlight(r){
    var magpies = r.el.getElementsByClassName("linkmagpie");
    while (magpies.length > 0){
        magpies[0].outerHTML = magpies[0].innerHTML;
    }
}


var focus = null;
var l = document.links;
var results = [];


function executeFuzzy(searchText){
    var searchSet = l;
    var query = searchText;

    for (var i=0; i<results.length;i++){
        unhighlight(results[i]);
    }

    results = fuzzyMatch(searchSet, query);
    if (results.length > 0){
        focus = results[0];
    } else {
        focus = null;
    }

    for (var i=0; i<results.length; i++){
        if (results[i] != focus){
            highlight(results[i]);
        }
    }
    if (focus){
        focus_highlight(focus);
    }

}


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message.method == "go"){
        if(focus){
            window.location.href = focus.el.href;
        }
    } else if (message.method == "next"){
        for(var i=0; i<results.length-1;i++){
            var r = results[i];
            var next_r = results[i+1];
            if (focus){
                if (focus == r){
                    unhighlight(focus);
                    highlight(focus);
                    focus = next_r;
                    unhighlight(focus);
                    focus_highlight(focus);
                    break;
                }
            }
        }
    } else if (message.method == "prev"){
        for(var i=1; i<results.length;i++){
            var r = results[i];
            var prev_r = results[i-1];
            if (focus){
                if (focus == r){
                    unhighlight(focus);
                    highlight(focus);
                    focus = prev_r;
                    unhighlight(focus);
                    focus_highlight(focus);
                    break;
                }
            }
        }
    } else if  (message.method == "search"){
        searchText = message.searchText;
        //executeSearch(searchText);
        executeFuzzy(searchText);
    }
});


function fuzzyMatch(searchSet, query) {
    var tokens = query.toLowerCase().split(''),
        matches = [];

    for (var i = 0 ; i<searchSet.length; i++){
        var el = searchSet[i];
        var tokenIndex = 0,
            stringIndex = 0,
            matchWithHighlights = '',
            matchedPositions = [];

        // TODO: fix the fact that this destroys structure of links.
        var string = el.text.toLowerCase();
        var text = el.text;

        while (stringIndex < string.length) {
            if (string[stringIndex] === tokens[tokenIndex]) {
                matchWithHighlights += match_highlight(text[stringIndex]);
                matchedPositions.push(stringIndex);
                tokenIndex++;

                if (tokenIndex >= tokens.length) {
                    matches.push({
                        index: i,
                        el: el,
                        text: text,
                        highlighted_text: matchWithHighlights + text.slice(
                            stringIndex + 1
                        ),
                        positions: matchedPositions
                    });

                    break;
                }
            }
            else {
                matchWithHighlights += text[stringIndex];
            }

            stringIndex++;
        }
    }

    return matches;
}

function match_highlight(string) {
    return '<span class="linkmagpie" style="color: #000000">' + string + '</span>';
}
