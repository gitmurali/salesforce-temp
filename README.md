# crawler-demo
Basic demonstration only :Node js spider code using recursive method to crawl , test cases and test demo to be run on express. 
To invoke user set options.startUrl url as entry point and userCallback method which will be invoked with json response as a param.
  
  # Get started

## Install

```sh
download zip or clone/branch the source code
```
from working folder 
```js
$ npm install 
```
above will download required node plugins.

## running demo 
start web express server  
```js
$ node server.js
```

start demo  in diff console , this will generate output.json
```js
$ node demo.js 
//this will generate and save output.json in working directory.


//Set crawl url: change to diff target url  
//    options.StartUrl

//Set crawllimit more than 0 to limit page requests.
//    options.crawlLimit
```
## TEST 
$ npm test

## Basic usage

```js

var options = {
  crawlLimit: 0,
  inDomainOnly: true,
  startUrl:"http://localhost:3000/",
  userCallback:handleSpiderOutput,
  skipDuplicates:true,
}
console.clear();


var Spider = require('./lib/spider');
spider = new Spider(options);
// spider();
spider.crawl();


function handleSpiderOutput(resultJson) {
   console.log(JSON.stringify(resultJson));
 }
