// I've neither proven this correct nor tested it extensively. Beware.
// ...but at least it's in JavaScript?

function fuzzyMatch(searchSet, query) {
    var tokens = query.toLowerCase().split(''),
        matches = [];

    for (var i = 0 ; i<searchSet.length; i++){
        var el = searchSet[i];
        var tokenIndex = 0,
            stringIndex = 0,
            matchWithHighlights = '',
            matchedPositions = [];

        var string = el.text.toLowerCase();

        while (stringIndex < string.length) {
            if (string[stringIndex] === tokens[tokenIndex]) {
                matchWithHighlights += match_highlight(string[stringIndex]);
                matchedPositions.push(stringIndex);
                tokenIndex++;

                if (tokenIndex >= tokens.length) {
                    matches.push({
                        el: el,
                        text: string,
                        highlighted_text: matchWithHighlights + string.slice(
                            stringIndex + 1
                        ),
                        // Maybe use this to weight matches?
                        // More consecutive numbers = higher score?
                        positions: matchedPositions
                    });

                    break;
                }
            }
            else {
                matchWithHighlights += string[stringIndex];
            }

            stringIndex++;
        }
    });

    return matches;
}

function match_highlight(string) {
    return '<span class="linkmagpie" style="color: #FF0000">' + string + '</span>';
}
