const axios = require('axios')

 const PRODUCT_NAME = 'Dont Stop Me'
 const PRODUCT_VERSION = '1.0.0'
 const PRODUCT_URL = 'http://localhost:3000/'

 const HTML_REGISTRATION = (code) => `
<!DOCTYPE html>
 <html lang="ru">
  <head>
   <style>
       body {
           font-family: Arial, sans-serif;
       }
       h1 {
           background-color: #f1f1f1;
           padding: 20px;
           text-align: center;
       }
       body{
          background-color: #ffffff;
           display: flex;
           flex-direction: column;
           justify-content: center;
           align-items: center;
           text-align: center;
       }
       .container {
            text-align: center;
           max-width: 400px;
       }
   </style>
  </head>
  <body>

    <div class="container">
        <p>Для успешного сброса пароля введите данный код на сайте <a href="https://vezdesens.ru/">${PRODUCT_NAME}</a> </p>
        <h1>Код: ${code}</h1>
        <p>Если это не вы, напишите нам об этом ${process.env.NODEJS_GMAIL_APP_USER}.</p>
    </div>
    
  </body>
 </html>`

 const postData = async (login, sum, invId, receipt, signatureValue, email, test) => {
  const url = 'https://auth.robokassa.ru/Merchant/Indexjson.aspx?';
  const data = {
   MerchantLogin: login,
   OutSum: sum,
   EMail: email,
   invoiceID: invId,
   Receipt: receipt,
   SignatureValue: signatureValue,
   Culture: 'ru',
   istest: parseInt(test)
  };
  try {
   const response = await axios.post(url, new URLSearchParams(data).toString(), {
    headers: {
     'Content-Type': 'application/x-www-form-urlencoded'
    }
   });

   // console.log(response.data)

   if (response.status !== 200) {
    console.warn(response.data);
    return  new Error('Network response was not ok');
   }
   return response.data;
  } catch (error) {
   console.warn(error);
   throw error;
  }
 }

 const receipt = (name, sum) => ({
  "items": [{"name": `Услуга разового размещения, Объявление ${name}`, "quantity": 1, "sum": sum, "tax": "none"}]
 })


 module.exports = { PRODUCT_NAME, PRODUCT_VERSION, PRODUCT_URL, HTML_REGISTRATION, postData, receipt}