function isHidden(el) {
    return (el.offsetParent === null)
}
let fuzzyMatch = (searchSet, query, highlighter) => {
    let tokens = query.toLowerCase().split('');
    let matches = [];
    searchSet.forEach((el) => {
        let tokenIndex = 0;
        let stringIndex = 0;
        let matchWithHighlights = document.createElement("span");
        let matchedPositions = [];

        let text = "";
        if (el.text !== undefined && el.text) {
            text = el.text;
        } else if (el.value !== undefined && el.value) {
            text = el.value;
        } else if (el.innerText !== undefined) {
            text = el.innerText;
        }

        if (!text){
            return;
        }

        let string = text.toLowerCase();

        while (stringIndex < string.length) {
            if (string[stringIndex] === tokens[tokenIndex]) {
                matchWithHighlights.appendChild(highlighter(text[stringIndex]));
                matchedPositions.push(stringIndex);
                tokenIndex++;
                if (tokenIndex >= tokens.length) {
                    let endText = text.slice(stringIndex + 1);
                    matchWithHighlights.appendChild(document.createTextNode(endText));
                    matches.push({
                        el: el,
                        text: text,
                        highlightedElement: matchWithHighlights,
                        positions: matchedPositions
                    });

                    break;
                }
            }
            else {
                matchWithHighlights.appendChild(document.createTextNode(text[stringIndex]));
            }

            stringIndex++;
        }
    });
    return matches;
};

let getAllClickables = () => {
    let clickables = [];
    clickables = clickables.concat(Array.from(document.getElementsByTagName('a')));
    clickables = clickables.concat(Array.from(document.getElementsByTagName('button')));
    clickables = clickables.concat(Array.from(document.querySelectorAll('input[type=button]')));
    clickables = clickables.concat(Array.from(document.querySelectorAll('input[type=submit]')));

    return clickables.filter((el)=>{return !isHidden(el);});
};

let followFocus = (match) => {
    if (match === undefined || match === null){
        return;
    }

    if (match.el.href !== undefined) {
        window.location.href = match.el.href;
    } else if (match.el.click !== undefined) {
        match.el.click();
    }
};

let clear_highlights = () => {
    let highlights = Array.from(document.getElementsByClassName("linkmagpie"));
    highlights.forEach((el)=>{
        el.parentNode.removeChild(el);
    });
};

let createHighlight = (highlightedElement, left, top, isFocus) => {
    let cover = document.createElement("span");
    cover.style.position = "absolute";
    cover.style.left = left + "px";
    cover.style.top = top + "px";
    cover.style.fontSize = "20px";
    if (isFocus) {
        cover.style.backgroundColor = "yellow"
        cover.style.color = "gray";
    } else {
        cover.style.backgroundColor = "white"
        cover.style.color = "gray";
    }
    cover.style.border = "1px black solid";
    cover.style.zIndex = "1000000000";
    cover.className = "linkmagpie";
    cover.appendChild(highlightedElement);
    return cover;
};

let createInput = () => {
    let input = document.createElement("input");
    input.style.position = "fixed";
    input.style.right = "20px";
    input.style.top = "20px";
    input.style.fontSize = "30px";
    input.style.zIndex = "10000000000";
    return input;
}

let apply_highlights = (matches, focus) => {
    clear_highlights();
    matches.forEach((match) =>{
        let el = match.el;
        let rect = el.getBoundingClientRect();
        let cover = createHighlight(match.highlightedElement,
                                    rect.left + window.scrollX,
                                    rect.top + window.scrollY,
                                    match === focus);
        document.body.appendChild(cover);
        if (match === focus) {
            cover.scrollIntoView({"block": "center", inline: "nearest"});
        }
    });
};

let state = "off";

let toggleOn = () => {
    let clickables = getAllClickables();
    let input = createInput(); 

    document.body.appendChild(input);
    input.focus();

    let focus = null;
    let matches = [];
    input.onkeydown = (e) => {
        if (e.code === "Comma"){
            e.preventDefault();
        }
    };
    input.onkeyup = (e) => {
        if (e.code === "Enter") {
            followFocus(focus);
            return;
        }

        if (e.code === "Comma") {
            e.preventDefault();
            if (matches) {
                if (focus){
                    old_focus_idx = matches.indexOf(focus);
                    focus = matches[(old_focus_idx + 1) % matches.length];
                }
            } else {
                focus = null;
            }
        } else {
            let query = e.target.value;
            matches = fuzzyMatch(clickables, query, (string) => {
                let span = document.createElement("span");
                span.className = "linkmagpielet";
                span.style.color = "#000000";
                span.innerText = string;
                return span;
            });
            if (matches) {
                focus = matches[0];
            } else {
                focus = null;
            }
        }
        apply_highlights(matches, focus);
    };
    state = input;
};

let toggleOff = () => {
    clear_highlights();
    document.body.removeChild(state);
    state = "off";
};

document.addEventListener('keyup', (e) => {
    if (e.code === "Comma" && e.ctrlKey){
        if (state === "off") {
            toggleOn();
        } else {
            toggleOff();
            toggleOn();
        }
    }
    if (e.code === "Escape") {
        if (state !== "off") {
            toggleOff();
        }
    }
});