/*jshint expr:true */
'use strict';

const Spider = require('../lib/Spider');
const expect = require('chai').expect;


// settings for nock to mock http server
const nock = require('nock');

describe('Links', function () {

    before(function () {
        nock.cleanAll();
        nock('http://dummy.com').get('/pagination').reply(200, '<html><head><meta charset="utf-8"><title>Links</title></head><body><a href="/page/1">1</a> <a href="/page/2">2</a></body></html>', { 'Content-Type': 'text/html' }).persist();
        nock('http://dummy.com').get('/redirect').reply(302, 'redirect', { 'Location': 'http://dummy.com/pagination' }).persist();        
	});
    

    it('should resolved relative links', function (finishTest) {
        const spider = new Spider(
            {
                startUrl: 'http://dummy.com/pagination',
                crawlLimit: 0,
                userCallback: (response) => {
                    expect(response).not.to.be.null;
                    expect(response.data[0].links[0]).to.equal('http://dummy.com/page/1');
                    expect(response.data[0].links[1]).to.equal('http://dummy.com/page/2');
                    finishTest();
                }
            })
        spider.crawl();
    });

    it('should resolved links to absolute urls after redirect', function (finishTest) {
        const spider = new Spider(
            {
                startUrl: 'http://dummy.com/redirect',
                crawlLimit: 0,
                userCallback: (response) => {
                    expect(response.data[0].url).to.equal('http://dummy.com/redirect');
                    expect(response.data[0].links[0]).to.equal('http://dummy.com/page/1');
                    expect(response.data[0].links[1]).to.equal('http://dummy.com/page/2');
                    finishTest();

                }
            })
        spider.crawl();
    });

});

