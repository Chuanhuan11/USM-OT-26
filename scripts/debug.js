const fs = require('fs');
let text = fs.readFileSync('c:/Users/GIGABYTE/Downloads/USMBNC OT 20252026/index.html', 'utf8');
let match = text.match(/<span class=\"info-label\">([^<]*Time)<\/span>/);
if (match) {
    console.log('Match found! Content:', match[1]);
    for (let i = 0; i < match[1].length; i++) {
        console.log(match[1][i], match[1].charCodeAt(i).toString(16));
    }
} else {
    console.log('No match found for Time!');
}

let matchVenue = text.match(/<span class=\"info-label\">([^<]*Venue)<\/span>/);
if (matchVenue) {
    console.log('Match found! Content:', matchVenue[1]);
    for (let i = 0; i < matchVenue[1].length; i++) {
        console.log(matchVenue[1][i], matchVenue[1].charCodeAt(i).toString(16));
    }
}
