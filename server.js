const express = require('express');
const request = require('request');
const path = require('path');
const url = require('url');
const app = express();

const port = process.env.PORT || 8000
const fs = require('fs');

//app.use(express.static(path.join(__dirname + '/web')));

function readFile(filepath) {
    return fs.readFileSync(filepath, 'utf8');
}

app.get('/', (req, res) => {
	res.writeHead(200,{"Content-Type":"text/html"});
    res.end(readFile('./web/index.html'))
});

app.get('/profile', (req, res) => {
	res.writeHead(200,{"Content-Type":"text/html"});
    res.end(readFile('./web/murali.html'))
});

app.get('/api/auth/salesForceCallback',(req,res)=>{
    //res.writeHead(200,{"Content-Type":"text/html"});
   //  res.end(readFile('./web/index.html'))
   //
const communityUrl = req.query.sfdc_community_url;
const path = communityUrl+"/services/oauth2/token";
const code = req.query.code;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const startURL = req.query.state;
// request.post(
//     path,
//     { code: code, grant_type: 'authorization_code', client_id: client_id, client_secret: client_secret, redirect_uri: 'http://localhost:3010/auth/callback'},
//     function (error, response, body) {
// 			console.log(body);
//         if (!error && response.statusCode == 200) {
//
//             console.log('murali', body);
//         }
//     }
// );
   // const htmlpage= readFile('./web/murali.html');
   // res.status(200).send(htmlpage);

var options = {
	method: 'POST',
  url: path,
  headers:{
		 'cache-control': 'no-cache',
     'content-type': 'multipart/form-data;'
	 },
	 formData:{ client_id: process.env.CLIENT_ID,
     client_secret: process.env.CLIENT_SECRET,
     code: code,
     grant_type: 'authorization_code',
     redirect_uri: 'https://carama-salesforce.herokuapp.com/api/auth/salesForceCallback' }
	 };

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);
		const obj = JSON.parse(body);
		const url = obj.id + "?version=latest";
		const accessToken = obj.access_token;

		var dataAccess = { method: 'GET',
		 url: url,
		 headers:
			{ authorization: 'Bearer ' + accessToken }
		};

		request(dataAccess, function (error, response, body) {
			const bodyRes = JSON.parse(body);
			
			bodyRes.access_token = accessToken;
			console.log(bodyRes);

			const outputStr =  "<html><head>\n" +
							"<meta name='salesforce-community' content='"+ communityUrl +"'>" +
								 "<meta name=\"salesforce-mode\" content=\"modal-callback\">\n" +
						 "<meta name=\"salesforce-server-callback\" content=\"true\">\n" +
								 "<meta name=\"salesforce-server-response\" content='"+ Buffer.from(JSON.stringify(bodyRes)).toString("base64") +"'>\n" +
								// "<meta name=\"salesforce-server-starturl\" content='" + startURL +"'>\n" +
								"<meta name=\"salesforce-server-starturl\" content=\"https://carama-salesforce.herokuapp.com/profile\">\n" +
								"<meta name=\"salesforce-target\" content= \"#salesforce-login\">\n"+
								"<meta name=\"salesforce-allowed-domains\" content=\"https://carama-salesforce.herokuapp.com/\">\n" +
								"<script src=\""+ communityUrl + "/servlet/servlet.loginwidgetcontroller?type=javascript_widget\"" +" async defer></script>\n" +
								"</head><body></body></html>";
								res.charset = 'utf-8';
								res.writeHead(200,{"Content-Type":"text/html"});
								res.end(outputStr);

								// res.writeHead(302, {
								// 	'Location': 'http://localhost:3010/profile?access_token=' + accessToken
								// 	//add other headers here...
								//   });
								//   res.end();
		});

	});
});

app.listen(port, () => console.log(`Example server app listening on port ${port}!`))
