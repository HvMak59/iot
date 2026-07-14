export function timeToSeconds(time: string) {
    const splitArray = time.trim().split(':').map(Number);

    if (splitArray.length > 3) return 'Invalid Date';

    return splitArray.reduce((total, value) => total * 60 + value, 0);
}


console.log(timeToSeconds("45"));
console.log(timeToSeconds("12:34"));
console.log(timeToSeconds("1:20:30"));
console.log(timeToSeconds("00:05:10"));