var fs = require("fs");

var options = {
  crawlLimit: 0,
  inDomainOnly: true,
  // startUrl: "https://www.google.com",
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
  // console.log(console.log(JSON.stringify(resultJson)));

  fs.writeFile("output.json", JSON.stringify(resultJson), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("output JSON file saved!");
}); 
}

