const express = require('express');
const bodyParser = require('body-parser');
const Mailchimp = require('mailchimp-api-v3');
require('dotenv').config();

const mc_api_key = process.env.MAILCHIMP_API_KEY;
const list_id = process.env.MAILING_LIST_ID;

const app = express();
const mailchimp = new Mailchimp(mc_api_key);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Dealing with CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// routes
app.get('/api/email/members', (req, res) => {
  mailchimp.get(`/lists/${list_id}/members`)
    .then(results => {
      res.send(results);
    })
    .catch(err => {
      res.send(err);
    });
});

// app.get('/api/email/members', async (res) => {
//   try {
//     const results = await mailchimp.get(`/lists/${list_id}/members`)
//     res.send(results);
//   } catch (err) {
//     res.send(err);
//   }
// })

//BEFORE
// app.post('/api/email/signup', (req, res) => {
//   mailchimp.post(`/lists/${list_id}/members`, {
//     email_address: req.body.email_address,
//     status: 'subscribed',
//     'merge_fields': {
//       "FIRSTNAME": req.body.firstName,
//       'LASTNAME': req.body.lastName
//     }
//   })
//   .then(results => {
//     res.send(results);
//   })
//   .catch(err => {
//     res.status(400).json(err);
//   });
// })

// AFTER
app.post('/api/email/signup', async (req, res) => {
  try {
    const results = await mailchimp.post(`/lists/${list_id}/members`, {
      email_address: req.body.emailAddress,
      status: 'subscribed',
      'merge_fields': {
        "FIRSTNAME": req.body.firstName,
        'LASTNAME': req.body.lastName
      }
    });
  
    res.send(results);
  } catch (err) {
    res.status(400).json(err);
  }
})

app.get('/', (req, res) => {
  res.status(200).json({ message: "Welcome to the app" });
})

const port = process.env.PORT || 9001;
app.listen(port);

console.log(`express app listening on port ${port}`);

