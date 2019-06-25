/*jshint expr:true */
'use strict';

const Spider = require('../lib/Spider');
const expect = require('chai').expect;

const jsdom = require('jsdom');
const fs = require('fs');
// settings for nock to mock http server
const nock = require('nock');

describe('Crawler', function () {


    var indexPage = '',
        testPage1 = '',
        testPage2 = '';

    function readFile(filepath) {
        return fs.readFileSync(filepath, 'utf8');
    }

    function setNock() {
        nock.cleanAll();
        nock('http://dummy.com').get('/index.html')
            .reply(200, indexPage,
                { 'Content-Type': 'text/html' }).persist();

        nock('http://dummy.com').get('/testpage1.html')
            .reply(200, testPage1,
                { 'Content-Type': 'text/html' }).persist();

        nock('http://dummy.com').get('/testpage2.html')
            .reply(200, testPage2,
                { 'Content-Type': 'text/html' }).persist();
    }
    before(function () {


        // loading html file for test
        indexPage = readFile('./web/index.html');
        testPage1 = readFile('./web/testpage1.html');
        testPage2 = readFile('./web/testpage2.html');
        setNock();

    });


    it('should crawled all links in domain', function (finishTest) {
        const spider = new Spider(
            {
                startUrl: 'http://dummy.com/index.html',
                crawlLimit: 0,
                userCallback: (response) => {
                    expect(response).not.to.be.null;
                   expect(response.data.length).to.equal(3);
                   // TODO: add more conditions and make more  exhaustive 
                    finishTest();
                }
            })
        spider.crawl();
    });
    


});

