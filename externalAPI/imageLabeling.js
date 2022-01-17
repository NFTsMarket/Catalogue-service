const request = require('request');
const rp = require('request-promise');
const http = require('https');


require("dotenv").config();

const getLabels = async (pictureUrl) =>{

    const apiKey = process.env.IMAGE_LABELLING_KEY;

    // fetch('https://image-labeling1.p.rapidapi.com/img/label', {
    //   method: 'POST',
    //   // url: 'https://image-labeling1.p.rapidapi.com/img/label',
    //   headers: {
    //     'content-type': 'application/json',
    //     'x-rapidapi-host': 'image-labeling1.p.rapidapi.com',
    //     'x-rapidapi-key': apiKey,
    //     useQueryString: true
    //   },
    //   body: {url: pictureUrl},
    //   json: true

    // }).then(function(response){ 
    //   return response.json(); 
    // }).then((json) => {
    //   console.log("imprimiendo json y res")
    //   console.log(json)
    //   res = json;
    //   console.log(res)
    // })

    const options = {
        method: 'POST',
        url: 'https://image-labeling1.p.rapidapi.com/img/label',
        headers: {
          'content-type': 'application/json',
          'x-rapidapi-host': 'image-labeling1.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
          useQueryString: true
        },
        body: {url: pictureUrl},
        json: true
      };

      // let result;

      // await rp(options).then(parsedBody => {
      //   resolve(parsedBody);
      //   // console.log(parsedBody);
      //   // console.log(result);
      //   // return parsedBody;
      // }).catch(err => {
      //   result = [];
      //   // return [];

      // });

      return new Promise ((resolve, reject) => {
        let req = http.request(options);
    
        req.on('response', res => {
          resolve(res);
        });
    
        req.on('error', err => {
          reject(err);
        });
      }); 
    

      // console.log("imprimiendo result")
      // console.log(result)
      // return result;



    
    // await request(options, function(error, response, body){
    //   let labels = [];
    //     if (!error && response.statusCode == 200) {
    //         labels = Object.keys(body);
    //     }
    //     return labels;
    // }).then((res) => {
    //   return res;
    // });

}

// Export
module.exports = { getLabels };