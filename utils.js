 const PRODUCT_NAME = 'ZABOR'
 const PRODUCT_VERSION = '1.1.0'
 const PRODUCT_URL = 'http://localhost:3000/'

 const HTML_REGISTRATION = (code) => `
<!DOCTYPE html>
 <html>
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

 module.exports = { PRODUCT_NAME, PRODUCT_VERSION, PRODUCT_URL, HTML_REGISTRATION}