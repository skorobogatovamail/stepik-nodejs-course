const { expect } = require('chai')
const request = require('supertest')
const uuid = require('uuid/v4')

const { server } = require('../server.js')

describe('HTTP-server', () => {
    it('должен возвращать в ответ параметр \'message\' из GET-запроса', done => {
        const message = uuid()
        request(server)
            .get(`/?message=${message}`)
            .expect('Content-Type', /text\/plain/)
            .expect(200)
            .then(res => {
                expect(res.text).to.equal(message)
                done()
            })
            .catch(done)
    })

    it('должен возвращать подсказку, если параметр \'message\' не указан', done => {
        request(server)
            .get('/')
            .expect('Content-Type', /text\/plain/)
            .expect(400)
            .then(res => {
                expect(res.text).to.equal('Передайте строку в параметре message GET-запроса')
                done()
            })
            .catch(done)
    })
})
