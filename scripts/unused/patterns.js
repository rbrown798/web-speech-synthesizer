

// const patterns = [
//   [/(?<!\w)a(?!\w)|(ey|ay|ai|eigh)/gi, 'ey y'],
//   [/(?<!\w)e(?!\w)|(ee|ea|ei)/gi, 'iy'],
//   [/(?<!\w)i(?!\w)|(igh|ie)/gi, 'aa y'],
//   [/(?<!\w)o(?!\w)|(ow|ough|oa)/gi, 'ow w'],
//   [/(?<!\w)u(?!\w)|(you|yu|yew)/gi, 'y uw w'],
//   [/(?<!\w)y(?!\w)|(why|wy)/gi, 'w aa y'],

//   [/not/gi, 'n aa t'],
//   [/no/gi, 'n ow w'],

//   [/tow|toe/gi, 't ow w'],
//   [/to|too|tue|tew/gi, 't uw w'],

//   [/at|att/gi, 'ae t'],
//   [/an/gi, 'ae n'],

//   [/qu/gi, 'k w'],

//   [/wh/gi, 'w'],

//   [/be/gi, 'b iy'],

//   [/or|ore|oar/gi, 'ao r'],
//   [/tion/gi, 'ch ih n'],

//   [/s\b/gi, 'z']
// ];

// const string = "To be or not to be, that is the question. whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune";

// const toPhonemes = str => {
//   for ([pattern, phonemes] of patterns) {
//     str = str.replace(pattern, ' ' + phonemes + ' ');
//   }
//   return str;
// }


// console.log(toPhonemes(string));


// rule_syntax = {
//   '#': /[AEIOUY]+/,
//   '+': /[EIY]/,
//   ':': /[BCDFGHJKLMNPQRSTVWXZ]*/,
//   '^': /[BCDFGHJKLMNPQRSTVWXZ]/,
//   '.': /[BVDGJLMNRWZ]/,
//   '%': /(?:ER|E|ES|ED|ING|EL)/,
//   '&': /(?:[SCGZXJ]|CH|SH)/,
//   '@': /(?:[TSRDLZNJ]|TH|CH|SH)/,
// }

