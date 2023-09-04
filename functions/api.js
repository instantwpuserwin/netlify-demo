const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

const txn_type_auth = "authtxn";
const txn_type_capture = "capture";

let records = [];

//Get all students
router.get('/1', (req, res) => {
  res.send('App is running.....');
});
 
//showing demo records
router.get('/demo', (req, res) => {
  res.json([
    {
      id: '001',
      name: 'Smith',
      email: 'smith@gmail.com',
    },
    {
      id: '002',
      name: 'Sam',
      email: 'sam@gmail.com',
    },
    {
      id: '003',
      name: 'lily',
      email: 'lily@gmail.com',
    },
  ]);
});


router.get('/dia/afrm/:env_id/:txn_type/:ordid/:txnid', async (req, res) => {
//router.get('/dia/afrm/:env_id/:txn_type/:ordid/:txnid', async (req, res) => {

  const env_id = req.params.env_id;
  const txn_type = req.params.txn_type;
  const order_id = req.params.ordid;
  const transaction_id = req.params.txnid;
  console.log("In app get, ", "env_id=", env_id, ", txn_type= =", txn_type, ", order_id=", order_id, ", transaction_id=", transaction_id);

  var afrmdata = await afrm(env_id, txn_type, order_id, transaction_id);
  console.log("In app get, afrmdata=", afrmdata);
  res.json({ afrm: afrmdata })

}
);


async function afrm(env_id, txn_type, order_id, transaction_id) {

  console.log("In afrm function, txn_type =", txn_type, "env_id=", env_id, "order_id=", order_id, ", transaction_id=", transaction_id);

  var auth_url = "", public_key = "", private_key = "";

  if (env_id === "sb") {
    auth_url = '@affirm-developers/v2.0#lra732k0ljrje2ac';
    public_key = 'HQP4H5GN8SPPBVVA';
    private_key = 'L0NtZiaz5Q0PUZqWfcS4C9PuGM9XJhF0';
  }

  if (env_id === "prod") {
    auth_url = '@affirm-developers/v2.0#lra732k0ljrje2ac';
    public_key = 'HQP4H5GN8SPPBVVA';
    private_key = 'L0NtZiaz5Q0PUZqWfcS4C9PuGM9XJhF0';  
  }

  const sdk = require('api')(auth_url);
  var retdata = null;
  await sdk.auth(public_key, private_key);

  if (txn_type === txn_type_auth) {
    await sdk.authorize_transaction({
      order_id: order_id,
      transaction_id: transaction_id
    }, { accept: '*/*' })
      .then(({ data }) => {
        console.log("In afrm function, data=", data);
        retdata = data;
      })
      .catch(err => {
        console.error("In afrm function, Error=", err.data);
        retdata = err.data;
      }
      );
  }

  console.error("In afrm function, retdata=", retdata);
  return retdata;

}


app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
