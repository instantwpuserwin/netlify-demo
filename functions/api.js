const express = require('express');
const serverless = require('serverless-http');
const requestIP = require('request-ip');
const IP = require('ip');
const app = express();
const router = express.Router();

const txn_type_auth = "authtxn";
const txn_type_capture = "capture";

let records = [];

router.get('/test', async (req, res) => {
  var origin = req.get('origin');
  var host = req.get('host');

  var origin2 = req.header('Origin');
  var host2 = req.header('Host');
  var DomainReferer = req.header('Referer') == null ? "" : req.header('Referer').toLowerCase();

  var validDomain = DomainReferer.includes("www.diamondandgoldwarehouse.com");

  const ipAddress1 = IP.address();
  const ipAddress2 =requestIP.getClientIp(req); 
  const ipAddress3 = req.header('x-forwarded-for') ||	req.socket.remoteAddress;

  var debugmesg = "ipAddress1=" + ipAddress1   + ", ipAddress2=" + ipAddress2  + ", ipAddress3=" + ipAddress3  
 

  console.log(debugmesg);

  res.json(debugmesg);
}
);

router.get('/dia/afrm/:env_id/:txn_type/:ordid/:txnid', async (req, res) => {
  //router.get('/dia/afrm/:env_id/:txn_type/:ordid/:txnid', async (req, res) => {

  const ipAddress = req.header('x-forwarded-for') ||	req.socket.remoteAddress;

  var validDomain = ipAddress.includes("5.172.176.161");

  //validDomain = true;
  console.log("ipAddress=", ipAddress, ", validDomain=", validDomain);

   if (!validDomain) {
     res.json({ err: "invalid domain, Domain referer= " + DomainReferer });
     return;
   }
   else {
    const env_id = req.params.env_id;
    const txn_type = req.params.txn_type;
    const order_id = req.params.ordid;
    const transaction_id = req.params.txnid;
    //console.log("In app get, ", "env_id=", env_id, ", txn_type= =", txn_type, ", order_id=", order_id, ", transaction_id=", transaction_id);

    var afrmdata = await afrm(env_id, txn_type, order_id, transaction_id);
    //console.log("In app get, afrmdata=", afrmdata);
    res.json({ afrm: afrmdata })
  }
}
);


async function afrm(env_id, txn_type, order_id, transaction_id) {

  //console.log("In afrm function, txn_type =", txn_type, "env_id=", env_id, "order_id=", order_id, ", transaction_id=", transaction_id);

  var auth_url = "", public_key = "", private_key = "",
    capture_url = "", sb_url = "https://sandbox.affirm.com/api/v1", prod_url = "https://api.affirm.com/api/v1/",     prod_txn_server_url="https://api.affirm.com/api/v1", txn_auth_url=""; 

  if (env_id === "sb") {
    txn_auth_url = '@affirm-developers/v2.0#lra732k0ljrje2ac';
    public_key = 'HQP4H5GN8SPPBVVA';
    private_key = 'L0NtZiaz5Q0PUZqWfcS4C9PuGM9XJhF0';
    capture_url = sb_url;
  }

  if (env_id === "prod") {
    txn_auth_url = '@affirm-developers/v2.0#3pywt32llzjpmvf';
    //auth_url = prod_url;
    public_key = 'VXZC558QAAR0KED1';
    private_key = 'QWPvVZodEQlb8IYeL2SgP5OoEvKPwAS5';
    capture_url = prod_url;
  }

  //const sdk = require('api')(auth_url);
  var retdata = null;
  //await sdk.auth(public_key, private_key);

  if (txn_type === txn_type_auth) {
 
    const sdk = require('api')(txn_auth_url);
    await sdk.auth(public_key, private_key);
    
    if (env_id === "prod") sdk.server(prod_txn_server_url);
    
    await sdk.authorize_transaction({
      order_id: order_id,
      transaction_id: transaction_id
    }, { accept: '*/*' })
      .then(({ data }) => {
        //console.log("In afrm function, data=", data);
        retdata = data;
      })
      .catch(err => {
        //console.error("In afrm function, Error=", err.data);
        retdata = err.data;
      }
      );
  }

  if (txn_type === txn_type_capture) {

    const sdk = require('api')(txn_auth_url);
    await sdk.auth(public_key, private_key);

    await sdk.server(capture_url);


    await sdk.capture_transaction({ order_id: order_id }, { id: transaction_id, accept: '*/*' })
      .then(({ data }) => {
        //console.log("In afrm function, data=", data);
        retdata = data;
      })
      .catch(err => {
        //console.error("In afrm function, Error=", err.data);
        retdata = err.data;
      }
      );
  }




  //console.error("In afrm function, retdata=", retdata);
  return retdata;

}


app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
