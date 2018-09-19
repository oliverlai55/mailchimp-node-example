const express = require('express');
const bodyParser = require('body-parser');
const Mailchimp = require('mailchimp-api-v3');
const nodeMailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

require('dotenv').config();

const mc_api_key = process.env.MAILCHIMP_API_KEY;
const list_id = process.env.MAILING_LIST_ID;
const pw = process.env.PASS;
const SGKEY = process.env.SENDGRID_API_KEY;
const app = express();
const mailchimp = new Mailchimp(mc_api_key);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Dealing with CORS
app.use(function (req, res, next) {
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

// Contact endpoints processing email
app.post('/api/email/contact', async (req, res) => {
  try {
    console.log('req body', req.body);
    sendMail(req, res);
    res.status(200).json({ message: "nice" });
    // sendMail(req, res);
  } catch (err) {
    res.status(400).json(err);
  }
})

const sendMail = (req, res) => {
  let transporter = nodeMailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: {
      user: 'apikey',
      pass: SGKEY
    }
  });
  
const name = `${req.body.firstName} ${req.body.lastName}`;
const senderEmail = req.body.senderEmail;
const subject = req.body.subject;
const message = req.body.message;

  let mailOptions = {
    from: `${name} ${senderEmail}`,
    to: 'oliverlai55@gmail.com',
    subject,
    text: 'TEST TEST',
    html: `<p>${message}</p>`
  };

  console.log('mailOptions', mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(400).send({ success: false })
    } else {
      // console.log('success, heres the res', res);
      // console.log('info', info);
      res.status(200).send({ success: true });
    }
  });
}


// SEND GRID
// const msg = {
//   to: 'oliverlai55@gmail.com',
//   from: 'oliver@imbrex.io',
//   subject: 'Sending with SendGrid is fun',
//   text: 'text text?',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
// sgMail.send(msg);

app.get('/', (req, res) => {
  res.status(200).json({ message: "Welcome to the app" });
})

const port = process.env.PORT || 9001;
app.listen(port);

console.log(`express app listening on port ${port}`);

