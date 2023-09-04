const txn_type_auth="authtxn";
const txn_type_capture="capture";

var Auth_success_json={"afrm": {
    "amount_refunded": 0,
    "provider_id": 1,
    "checkout_id": "7LS73A624TTIREEU",
    "status": "authorized",
    "id": "ITR4-R7VU",
    "order_id": "DGW007173",
    "created": "2023-09-04T07:43:02Z",
    "events": [
      {
        "type": "auth",
        "id": "DUTIRR8VTQ6587LR",
        "created": "2023-09-04T07:51:01Z",
        "amount": 30100,
        "currency": "USD"
      }
    ],
    "authorization_expiration": "2023-10-04T07:51:01Z",
    "amount": 30100,
    "remove_tax": false,
    "currency": "USD"
  }};
var Auth_error_json={"afrm":{"message":"The transaction has already been authorized.","status_code":403,"type":"already_authorized"}};

//var body= Auth_error_json;
var body= Auth_success_json;
var AffirmRetData = body.afrm;
var AuthorizedId="", RetAmount=0;

var ret_status = AffirmRetData.status_code? AffirmRetData.status_code: AffirmRetData.status;

console.log("affirm ret body=", AffirmRetData, ", status=",ret_status);

if (ret_status === "authorized") {
    AuthorizedId= AffirmRetData.id;
    RetAmount= AffirmRetData.amount;
}
else if (ret_status === "403") {

}
else
{

}

console.log("AuthorizedId=", AuthorizedId, ", RetAmount=",RetAmount);

  
