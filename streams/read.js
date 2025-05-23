const fs = require('fs');
const { Writable, Transform } = require('stream');
const { pipeline } = require('stream/promises');

// variant 1 Использование асинхронного итератора 
// (
//     async () => {
//         const readStream = fs.createReadStream('./test.csv')

//         for await (const chunk of readStream) {
//             console.log('chunk', chunk.toString())
//         }
//     }
// )();


// variant 2 Использование события 'data'
// const readStream = fs.createReadStream('./test.csv');

// readStream.on('data', (chunk) => {
//     console.log('chunk', chunk.toString())
// })

// readStream.on('error', (err) => {
//     console.error(err)
// })

// readStream.on('end', () => {
//     console.log('reading finished')
// })

// variant 3 pipeline - write data to new file
const readStream = fs.createReadStream('./test.csv');
const rowsBatch = []
const newFileName = 'newFile.csv'

const createBatchProcessor = (rowsBatch) => {
    const BATCH_SIZE = 3;
    return async (record, encoding, next) => {
        console.log('record 2', record.toString())
        rowsBatch.push(record.toString());
        console.log('rowsBatch.length', rowsBatch.length)


        if (rowsBatch.length >= BATCH_SIZE) {
            console.log('rowsBatch', rowsBatch)
            const batchToWrite = [...rowsBatch]
            await fs.promises.writeFile(newFileName, batchToWrite.join('\n') + '\n', { flag: 'a' })
            rowsBatch.length = 0;
        }
        next()
    }
}

(
    async () => {
        try {
            await pipeline(
                readStream,
                new Transform({
                    objectMode: true,
                    transform(record, encoding, callback) {
                        console.log('record 1', record.toString())
                        const lines = record.toString().split('\n');
                        lines.forEach(line => {
                            if (line.trim() !== '') {
                                this.push(line)
                            }
                        })
                        callback()
                    }
                }),
                new Writable({
                    objectMode: true,
                    write: createBatchProcessor(rowsBatch)
                })
            )
        } catch (error) {
            console.error(error)
        }

    }
)()