const { expect } = require('chai')
const request = require('supertest')
const sinon = require('sinon')
const path = require('path')
const fs = require('fs')
const { Readable } = require('stream')

const { server } = require('../server.js')

function stubFileStream(filePath, isFile, content) {
  fs.access
    .withArgs(filePath)
    .callsFake(function fsAccessStub() {
      const callback = arguments[arguments.length - 1]
      callback(null)
    })
  fs.stat
    .withArgs(filePath)
    .callsFake(function fsAccessStub() {
      const callback = arguments[arguments.length - 1]
      callback({ isFile: () => isFile })
    })

  fs.promises
    .access
    .withArgs(filePath)
    .resolves()
  fs.promises
    .stat
    .withArgs(filePath)
    .resolves({ isFile: () => isFile })

  if (!isFile) {
    return
  }

  fs.createReadStream
    .withArgs(filePath)
    .callsFake(() => {
      const stream = new Readable()
      stream.push(content)
      stream.push(null)
      return stream
    })
}

describe('HTTP-server', () => {
  beforeEach(() => {
    const generateNotFoundError = filePath => new Error(`File ${filePath} not found`);

    // Заглушки для методов fs.*, используемых для реализации веб-сервера
    // fs.acess и fs.stub, работающие через callback-функции
    sinon
      .stub(fs, 'access')
      .callsFake(function fsAccessStub() {
        const filePath = arguments[0]
        const callback = arguments[arguments.length - 1]
        callback(generateNotFoundError(filePath))
      })
    sinon
      .stub(fs, 'stat')
      .callsFake(function fsStatStub() {
        const filePath = arguments[0]
        const callback = arguments[arguments.length - 1]
        callback(generateNotFoundError(filePath))
      })

    // fs.acess и fs.stub, работающие через Promise
    sinon
      .stub(fs.promises, 'access')
      .callsFake(filePath => Promise.reject(generateNotFoundError(filePath)))
    sinon
      .stub(fs.promises, 'stat')
      .callsFake(filePath => Promise.reject(generateNotFoundError(filePath)))

    // fs.createReadStream
    sinon
      .stub(fs, 'createReadStream')
      .callsFake(filePath => {
        const stream = new Readable()
        stream.emit('error', generateNotFoundError(filePath))
        return stream
      })
  })

  afterEach(() => sinon.restore())

  it('should return file\'s content if file exists', done => {
    const content = 'Hello World text file!'
    const fileName = 'test.txt'
    const filePath = path.join(__dirname, '../public', fileName)
    stubFileStream(filePath, true, content)

    request(server)
      .get(`/${fileName}`)
      .expect(200)
      .then(res => {
        expect(res.text).to.equal(content)
        done()
      })
      .catch(done)
  })

  it('should return error if file is not found', done => {
    request(server)
      .get('/non-existing-file')
      .expect(404)
      .then(() => done())
      .catch(done)
  })

  it('should return error for directories', done => {
    const dirName = '/dir'
    const dirPath = path.join(__dirname, '../public', dirName)
    stubFileStream(dirPath, false)

    request(server)
      .get(dirName)
      .expect(404)
      .then(() => done())
      .catch(done)
  })
})
