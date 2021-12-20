const fs = require('fs');
const readline = require('readline');

async function getFirstLine(pathToFile, number) {
    const readable = fs.createReadStream(pathToFile);
    const reader = readline.createInterface({ input: readable });
    let count = 0;
    let array = [];
    const line = await new Promise((resolve) => {
        reader.on('line', (line) => {
            count++;
            if (number >= count) {
                reader.close();
                array.push(line)
                resolve(line);
            }
        });
    });
    readable.close();
    return array;
}
async function main() {

    let array = await getFirstLine("monitor/app/b.txt", 400)
    console.log(array)
    console.log("1")
}

main()
