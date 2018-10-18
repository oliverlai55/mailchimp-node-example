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

// routes
// Gets list of subscribers
app.get('/api/email/members', (req, res) => {
  mailchimp.get(`/lists/${list_id}/members`)
    .then(results => {
      res.send(results);
    })
    .catch(err => {
      res.send(err);
    });
});


// POST user to mailchimp email list by list id
app.post('/api/email/signup', async (req, res) => {
  try {
    console.log(req.body)
    const results = await mailchimp.post(`/lists/${list_id}/members`, {
      email_address: req.body.email,
      status: 'subscribed'
    });
      // 'merge_fields': {
      //   "FIRSTNAME": req.body.firstName,
      //   'LASTNAME': req.body.lastName
      // }
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