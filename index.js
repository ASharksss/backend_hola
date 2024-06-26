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
const port = process.env.PORT

app.use('/static', express.static('public'))
app.use(cors())
app.use(cookieParser())
app.use(fileUpload({}))
app.use(express.json())
app.use('/api', router)


const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync().then(result => {
      console.log(result)
    }).catch(e => console.log(e))
    app.listen(port, () => {
      console.log('Port started')
    })
  } catch (e) {
    console.log(e)
  }
}

start();

deleteExpiredPublications();
