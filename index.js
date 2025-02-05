require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const router = require("./routes");
const sequelize = require("./db");
const models = require('./models/models')
const deleteExpiredPublications = require("./services/deleteExpiredPublications");
const deleteNotifications = require("./services/deleteNotifications");
const port = process.env.PORT
const originAccess = process.env.originAccess || '["http://localhost:3000"]'

app.use('/static', express.static('static'))

app.use(cors({
  credentials: true, origin: JSON.parse(originAccess),
  allowedHeaders: ['Content-Type', 'Authorization', 'x-position'], methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE']
}))

app.use((req, res, next) => {
  console.log('Date', new Date().toLocaleString('ru-RU'), 'method', req.method, 'url', req.originalUrl, 'ip', req.ip);
  next()
})


app.use(cookieParser())

app.use(fileUpload({}))

app.use(express.json())

app.use('/api', router)


const start = async () => {
  try {
    await sequelize.authenticate()

    // await sequelize.sync({alter: false})
    //     .then(result => {
    //       // console.log('result')
    //     }).catch(e => console.log('e'))

    app.listen(port, () => {
      console.log('Port started')
    })
  } catch (e) {
    console.log('Ошибка index.js')
    // console.log('Ошибка index.js', e)
  }
}

start();

deleteExpiredPublications();
deleteNotifications();
