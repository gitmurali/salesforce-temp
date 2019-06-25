// Simple spider to scrape and  crawl links defined in  DOM. 

'use strict';
// var request = require('request');
var request = require('request')
    , cheerio = require('cheerio')
    , URL = require('url-parse')
    , _ = require('lodash')


function Spider(options) {
    console.log("---STARTED---");
    var self = this;
    options = options || {};
    self.init(options);

}



Spider.prototype.init = function init(options) {
    var self = this;
    var processData = {
        linksCrawled: [],
        crawlCounter: 0,
        responseCounter: 0,
        linksToCrawl: [],
        output: { data: [] },
    }
    var defaultOptions = {
        crawlLimit: 10,  // Set crawl limit to 0 to crawl pages
        timeout: 15000,
        skipDuplicates: true,
        inDomainOnly: true,
        showoutputInConsole: false,

    };
    //return defaultOptions with overriden properties from options.
    self.processData = processData;
    self.options = _.extend(defaultOptions, options);
    self.url = new URL(self.options.startUrl);
    var port =  self.url.port?":" + self.url.port:'';
    self.baseUrl = self.url.protocol + "//" + self.url.hostname + port;
    self.processData.linksToCrawl.push(self.options.startUrl);



}

Spider.prototype.crawl = function crawl(scope) {
    var self = scope || this;

    // Exit when all the res recvd or reached the request limit.
    if ((self.options.crawlLimit > 0 && self.processData.crawlCounter >= self.options.crawlLimit)
        || (self.processData.linksToCrawl.length == 0 
            && self.processData.crawlCounter == self.processData.responseCounter)) {
        
        console.log("Terminating the Crawl");
        if (self.options.showoutputInConsole) {
            console.log(JSON.stringify(self.processData.output))
        };

        // invoke client call back send the output json
        if (self.options.userCallback) {
            self.options.userCallback(self.processData.output);
        }
        return;
    }

    var nextLink = self.processData.linksToCrawl.pop();
    self.requestPage(nextLink, self.crawl);

}

Spider.prototype.requestPage = function requestPage(url, callback) {
    var self = this;
    // set link in crawled array

    // fetch page
    if (!url) {
        return;
    }
    self.processData.linksCrawled.push(url);
    self.processData.crawlCounter++;
    // console.log("requesting link:-" + url);
    
    request(url, function (error, response, body) {
        // return status code not valid (200 is HTTP OK)
        self.processData.responseCounter++;
        if (error) {
            // console.log(error);
            callback(self);
            return;
        }
        if (!response || response.statusCode !== 200) {
            // console.log("Invalid response");
            callback(self);
            return;
        }


        // Find new links
        self.listURL(url, body, this.baseUrl);
        // Call crawl with scope. 
        callback(self);
    });
}

//  functions returns all links targeted to baseUrl domain only.
Spider.prototype.listURL = function listURL(url, body, baseUrl) {
    //  use cheerio to parse dom
    var self = this;
    var links = [];
    var $ = cheerio.load(body);
    // Pick links with relative path
    $("a[href^='/']").each(function () {
        const relURL = (self.baseUrl + $(this).attr('href'));
        // console.log(relURL);
        self.addLinkToCrawl(relURL);
        links.push(relURL);
    });

    // Pick links with abs path
    $("a[href^='http']").each(function () {
        const absURL = $(this).attr('href');
        if (self.isURLtoBeFollowed(absURL, baseUrl, self.options.inDomainOnly)) {
            self.addLinkToCrawl(absURL);
        }
        links.push(absURL);
    });
    self.processData.output.data.push({ url, links });
}

// follow URL which pass defined rules

Spider.prototype.addLinkToCrawl = function addLinkToCrawl(lnkUrl) {
    var self = this;
    // avoid crawl duplication 
    if (self.processData.linksCrawled.indexOf(lnkUrl) > -1) {
        return
    } else {
        self.processData.linksToCrawl.push(lnkUrl);
    }
}
Spider.prototype.isURLtoBeFollowed = function isURLtoBeFollowed(targetUrl, baseUrl, inDomainOnly) {
    // return true;
    if (!inDomainOnly) {
        return true;
    }
    //Allow same root host name only
    if (inDomainOnly && targetUrl && baseUrl) {
        var targetUrlHostName = new URL(targetUrl).hostname;
        var baseUrlHostName = new URL(baseUrl).hostname;
        return targetUrlHostName == baseUrlHostName;
    }


}


module.exports = Spider; 