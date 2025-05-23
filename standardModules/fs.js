const fs = require('fs/promises');

// file statistics
fs.stat('./test.csv', (err, data) => {
    if (err) {
        console.error(err)
    }
    console.log(data)
});

fs.stat('./example.csv', (err, data) => {
    if (err) {
        console.error(err)
    }
    console.log(data)
});

(async () => {
    try {
        const statPromises = await fs.stat('./test.csv')
        console.log(statPromises)
    } catch (error) {
        console.error(error)
    }
})();

