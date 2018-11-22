const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const accesToken = process.env.ACCESS_TOKEN;
const clientAccessToken = process.env.CLIENT_ACCESS_TOKEN;
const app = express();
const apiaiApp = require('apiai')(clientAccessToken);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'chat_bot') {
      res.status(200).send(req.query['hub.challenge']);
    } else {
      res.status(403).end();
    }
  });
  
  /* Handling all messenges */
  app.post('/webhook', (req, res) => {
    console.log(req.body);
    if (req.body.object === 'page') {
      req.body.entry.forEach((entry) => {
        entry.messaging.forEach((event) => {
          if (event.message && event.message.text) {
            sendMessage(event);
          }
        });
      });
      res.status(200).end();
    }
  });

  // function sendMessage(event) {
  //   let sender = event.sender.id;
  //   let text = event.message.text;
  
  //   request({
  //     url: 'https://graph.facebook.com/v2.6/me/messages',
  //     qs: {access_token:'EAAK1Jk3sBgcBAOrD3aobqhWSrsdPZBNXZCIuaKCansXSB7CRSDZAF32vuLPO3gmeLspYJayDrCpKo9aEuopZAuR7ZCPr32H6C4VF25PcMiGCYq7ZBpZCcDcMVzZCe3kZBKF3qIolW5Jf68IAHUuKR'},
  //     method: 'POST',
  //     json: {
  //       recipient: {id: sender},
  //       message: {text: text}
  //     }
  //   }, function (error, response) {
  //     if (error) {
  //         console.log('Error sending message: ', error);
  //     } else if (response.body.error) {
  //         console.log('Error: ', response.body.error);
  //     }
  //   });
  // }

  function sendMessage(event) {
    let sender = event.sender.id;
    let text = event.message.text;
  
    let apiai = apiaiApp.textRequest(text, {
      sessionId: 'tabby_cat' // use any arbitrary id
    });
  
    apiai.on('response', (response) => {
      let aiText = response.result.fulfillment.speech;
    
        request({
          url: 'https://graph.facebook.com/v2.6/me/messages',
          qs: {access_token: accesToken},
          method: 'POST',
          json: {
            recipient: {id: sender},
            message: {text: aiText}
          }
        }, (error, response) => {
          if (error) {
              console.log('Error sending message: ', error);
          } else if (response.body.error) {
              console.log('Error: ', response.body.error);
          }
        });
     });
  
    apiai.on('error', (error) => {
      console.log(error);
    });
  
    apiai.end();
  }