/* Linkmagpie's business */

/* First add contains method to strings if they don't have it */
if (!String.prototype.contains) {
    String.prototype.contains = function(s, i) {
        return this.indexOf(s, i) != -1;
    }
}

// Define fuzzyMatch
function fuzzyMatch(searchSet, query) {
    var tokens = query.toLowerCase().split('');
    var matches = [];

    for (var i = 0 ; i < searchSet.length; i++){
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
    return '<span class="linkmagpielet" style="color: #000000">' + string + '</span>';
}


/* Define LinkMagpie Class */
class LinkMagpie {
    constructor() {
        this.changes = {};
        this.focus = null;
        this.links = document.links;
        this.results = [];


        this.focus_highlight = this.focus_highlight.bind(this);
        this.highlight = this.highlight.bind(this);
        this.unhighlight = this.unhighlight.bind(this);

        this.setFocus = this.setFocus.bind(this);
        this.followFocus = this.followFocus.bind(this);
        this.focusNext = this.focusNext.bind(this);
        this.focusPrev = this.focusPrev.bind(this);
        this.unhighlightAll = this.unhighlightAll.bind(this);

        this.executeFuzzy = this.executeFuzzy.bind(this);
    }

    focus_highlight(r){
        var highlight = document.createElement("SPAN");
        highlight.innerHTML = r.highlighted_text;
        highlight.style.position = "absolute";
        highlight.style.top = 0;
        highlight.style.left = 0;
        highlight.style.zIndex = 1000;
        highlight.style.color = "#909090";
        highlight.style.backgroundColor ="#FF8800";
        highlight.style.boxShadow = "4px 4px 5px #000000";
        highlight.className = "linkmagpie";

        r.el.style.position = "relative";
        r.el.appendChild(highlight);
        r.el.scrollIntoView(false);
    }

    highlight(r){
        var highlight = document.createElement("SPAN");
        highlight.innerHTML = r.highlighted_text;
        highlight.style.position = "absolute";
        highlight.style.top = 0;
        highlight.style.left = 0;
        highlight.style.zIndex = 1000;
        highlight.style.color = "#909090";
        highlight.style.backgroundColor ="#FFFF00";
        highlight.className = "linkmagpie";

        r.el.style.position = "relative";
        r.el.appendChild(highlight);
        
    }

    unhighlight(r){
        var spans = r.el.getElementsByClassName("linkmagpie");
        for (var i=0; i < spans.length; i++){
            spans[i].parentNode.removeChild(spans[i]);
        }
    }

    unhighlightAll(){
        this.results.forEach(this.unhighlight);
    }


    executeFuzzy(searchText){

        // Unhighlight old results
        for (var i=0; i<this.results.length;i++){
            this.unhighlight(this.results[i]);
        }
        this.focus = null;

        // Get new Results
        this.results = fuzzyMatch(this.links, searchText);

        // Set new Focus if possible
        if (this.results.length > 0){
            this.setFocus(this.results[0]);
        }

        // Highlight all non focus Results
        for (var i=0; i<this.results.length; i++){
            if (this.results[i] !== this.focus){
                this.highlight(this.results[i]);
            }
        }
    }

    setFocus(r) {
        var old_focus = this.focus;
        if (old_focus === r){
            return;
        }

        if (old_focus !== null){
            this.unhighlight(old_focus);
            this.highlight(old_focus);
        }

        if (r === null){
            this.focus = null;
            return;
        }

        this.unhighlight(r);
        this.focus_highlight(r)
        this.focus = r;
    }

    followFocus() {
        if (this.focus){
            window.location.href = this.focus.el.href;
        }
    }

    focusNext(){
        if (!this.focus || !this.results.length){
            return;
        }

        var focusIndex = this.results.indexOf(this.focus);
        if (focusIndex < this.results.length - 1){
            this.setFocus(this.results[focusIndex + 1]);
        }
    }

    focusPrev(){
        if (!this.focus || !this.results.length){
            return;
        }
        var focusIndex = this.results.indexOf(this.focus);
        if (focusIndex > 0){
            this.setFocus(this.results[focusIndex - 1]);
        }
    }
}


window.LM = new LinkMagpie();


chrome.runtime.onConnect.addListener(function(port){
    console.assert(port.name == "linkmagpie");
    /* Message Listener */
    port.onMessage.addListener(function(message){
        if (message.method == "go"){
            LM.followFocus();
        } else if (message.method == "next"){
            LM.focusNext();
        } else if (message.method == "prev"){
            LM.focusPrev();
        } else if (message.method == "search"){
            LM.executeFuzzy(message.searchText);
        }
    });
    port.onDisconnect.addListener(function(port){
        LM.unhighlightAll();
    });
});







