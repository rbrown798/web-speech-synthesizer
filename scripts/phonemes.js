/* 
*   phonemes.js
*   Parameters for synthesizing each phoneme 
*/
export const PHONEMES = {
  
// Vowels --------------------------------------

    iy: { 
    type  : "vowel", 
    freqs : [270, 2290, 3010] 
    },
    ih: { 
    type  : "vowel", 
    freqs : [390, 1990, 2550] 
    },
    ey: { 
    type  : "vowel", 
    freqs : [480, 1720, 2520] 
    },
    eh: { 
    type  : "vowel", 
    freqs : [530, 1840, 2480] 
    },
    er: { 
    type  : "vowel", 
    freqs : [490, 1350, 1690] 
    },
    ae: { 
    type  : "vowel", 
    freqs : [660, 1720, 2410] 
    },
    aa: { 
    type  : "vowel", 
    freqs : [730, 1090, 2440] 
    },
    ao: { 
    type  : "vowel", 
    freqs : [600,  990, 2570] 
    },
    ah: { 
    type  : "vowel", 
    freqs : [570,  840, 2410] 
    },
    ow: { 
    type  : "vowel", 
    freqs : [414,  721, 2406] 
    },
    uh: { 
    type  : "vowel", 
    freqs : [440, 1020, 2240] 
    },
    uw: { 
    type  : "vowel", 
    freqs : [300,  870, 2240] 
    },
    ax: { 
    type  : "vowel", 
    freqs : [470, 1270, 1540] 
    },  
    ay: { 
    type  : "vowel", 
    freqs : [660, 1200, 2550] 
    },
    aw: { 
    type  : "vowel", 
    freqs : [640, 1230, 2550] 
    },
    oy: { 
    type  : "vowel", 
    freqs : [550,  960, 2400] 
    },

// Approximants --------------------------------

    w: { 
    type  : "approximant", 
    freqs : [290,  610, 2150] 
    },
    y: { 
    type  : "approximant", 
    freqs : [260, 2070, 3020] 
    },
    r: { 
    type  : "approximant", 
    freqs : [310, 1060, 1380] 
    },
    l: { 
    type  : "approximant", 
    freqs : [310, 1050, 2880] 
    },

// Nasals --------------------------------------

    m: { 
    type  : "nasal", 
    freqs : [450, 1270, 2130] 
    },
    n: { 
    type  : 'nasal', 
    freqs : [450, 1340, 2470] 
    },
    ng: { 
    type  : 'nasal', 
    freqs : [450, 2208, 3079] 
    },

// Fricatives ----------------------------------

    s: { 
    type   : 'fricative', 
    freqs  : [4600, 0, 0], 
    muls   : [1.0, 0, 0] 
    },
    z: { 
    type   : "fricative", 
    voiced : true, 
    freqs  : [4600, 0, 0], 
    muls   : [1.0, 0, 0] },
    sh: { 
    type   : 'fricative', 
    freqs  : [2350, 0, 0], 
    muls   : [1.0, 0, 0] 
    },
    zh: { 
    type   : 'fricative', 
    voiced : true,
    freqs  : [2350, 0, 0], 
    muls   : [1.0, 0, 0] 
    },
    f: { 
    type   : 'fricative', 
    freqs  : [2000, 0, 0], 
    muls   : [1.0, 0, 0] 
    },
    v: { 
    type   : 'fricative', 
    voiced : true, 
    freqs  : [2000, 0, 0], 
    muls   : [1.0, 0, 0] 
    },
    th: { 
    type   : 'fricative', 
    freqs  : [1575, 0, 0], 
    muls   : [1.0, 0, 0] 
    },
    dh: { 
    type   : 'fricative', 
    voiced : true, 
    freqs  : [1575, 0, 0], 
    muls   : [1.0, 0, 0] 
    },

// Stop Consonants ----------------------------- 

    p: {
    type           : 'stop-consonant', 
    oscFreqs       : [400, 1100, 2150], 
    noiseFreqs     : [1765, 2672, 4818], 
    noiseGains     : [1, 0.8, 0.2, 0],
    voiceOnsetTime : 0.02
    },

    b: {
    type           : 'stop-consonant', 
    voiced         : true,
    oscFreqs       : [200, 1100, 2150], 
    noiseFreqs     : [1765, 2672, 4818], 
    noiseGains     : [1, 0.8, 0.2, 0],
    voiceOnsetTime : 0.01
    },

    t: { 
    type           : 'stop-consonant', 
    oscFreqs       : [400, 1600, 2600], 
    noiseFreqs     : [1902, 2913, 4040], 
    noiseGains     : [0.8, 0.2, 1, 0],
    voiceOnsetTime : 0.04
    },

    d: { 
    type           : 'stop-consonant', 
    voiced         : true, 
    oscFreqs       : [200, 1600, 2600], 
    noiseFreqs     : [1902, 2913, 4040], 
    noiseGains     : [0.8, 0.2, 1, 0],
    voiceOnsetTime : 0.01
    }, 

    k: {
    type           : 'stop-consonant', 
    oscFreqs       : [300, 1990, 2850], 
    noiseFreqs     : [1928, 4110, 4570], 
    noiseGains     : [0.8, 0.2, 1, 0],
    voiceOnsetTime : 0.03
    },

    g: { 
    type           : 'stop-consonant', 
    voiced         : true, 
    oscFreqs       : [200, 1990, 2850], 
    noiseFreqs     : [1928, 4110, 4570], 
    noiseGains     : [0.8, 0.2, 1, 0],    // added zero but weird
    voiceOnsetTime : 0.03
    }, 

// Affricates ----------------------------------
// NOTE: Eventually these might have their own 'type' value for using envelope durations that are distinct from stop-consonants

    ch: { 
    type           : 'stop-consonant', 
    oscFreqs       : [400, 1600, 2600], 
    noiseFreqs     : [2778, 3514, 4397], 
    noiseGains     : [0.65, 0.69, 0.59, 0],    // added zero but weird
    voiceOnsetTime : 0.03
    },
    j: {
    type           : 'stop-consonant', 
    Voiced         : true,
    oscFreqs       : [200, 1600, 2600], 
    noiseFreqs     : [2725, 3298, 4553], 
    noiseGains     : [1.0, 0.2, 0.8, 0],    // added zero but weird
    voiceOnsetTime : 0.03
    }

};
    

export const DURATIONS = {
    aspirate       : 0.1,
    pause          : 0.1,
  
    vowel          : 0.2,
    approximant    : 0.1,
    nasal          : 0.1,
    fricative      : 0.1,
    stopConsonant  : 0.08
};
  
    
    