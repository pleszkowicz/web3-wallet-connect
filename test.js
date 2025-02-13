var vowelsMap = new Map(Object.entries({
    a: true,
    A: true,
    e: true,
    E: true,
    i: true,
    I: true,
    o: true,
    O: true,
    u: true,
    U: true,
    y: true,
    Y: true,
}));
function reverseVowels(text) {
    var outputString = text;
    var vowelsIndexMap = new Map();
    text.split('').forEach(function (char, index) {
        if (vowelsMap.has(char)) {
            vowelsIndexMap.set(index, char);
        }
    });

    const vowelIndexMapEntries = vowelsIndexMap.entries();
    
    vowelIndexMapEntries.forEach(function (_a) {
        var index = _a[0], value = _a[1];
        outputString = outputString.slice(0, index) + value + outputString.slice(index + 1);
    });
    return outputString;
}
console.log(reverseVowels("Hello Universe")); // Output should reverse only vowelsP
