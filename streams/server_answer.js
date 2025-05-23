const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost`)
  /*
    TODO: напишите обработчик запроса.
    
    Ответом на запрос к /path/to/file-name должен быть файл, расположенный в директории /public/path/to/file-name.
    Если файл существует, то статус ответа - 200 (OK)
    Если файл не найден (или по указанному пути находится не файл, а директория), то статус ответа - 404 (NOT FOUND)

    Подсказка: используйте поле url для доступа к параметрам GET-запроса.
    Подсказка: используйте fs.access, чтобы проверить, существует ли файл?
    Подсказка: используйте fs.stat, чтобы проверить, что по указанному пути находится файл,а не директория
  */

  const filePath = path.join(__dirname, 'public', url.pathname)
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
    const fileInfo = await fs.promises.stat(filePath)
    const isFile = fileInfo.isFile()
    if (!isFile) {
      throw new Error(`${filePath} is not a file`)
    }

    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    fs
      .createReadStream(filePath)
      .on('error', err => {
        res.emit('error', err)
      })
      .pipe(res)
  } catch (err) {
    res.statusCode = 404
    res.end('Not found')
  }
});

module.exports = { server }


