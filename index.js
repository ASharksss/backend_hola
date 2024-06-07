require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const router = require("./routes");
const sequelize = require("./db");
const models = require('./models/models')
const port = process.env.PORT

app.use('/static', express.static('public'))
app.use(cors())
app.use(express.json())
app.use('/api', router)


const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({alter:true}).then(result => {
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

