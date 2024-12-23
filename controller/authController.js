const bcrypt = require('bcrypt')
const {Op, where} = require("sequelize");
const {User, File, UsersSocialMedia} = require("../models/models");
const { generateTokens} = require("../services/utils");
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen')
const {PRODUCT_NAME, PRODUCT_VERSION, PRODUCT_URL, HTML_REGISTRATION} = require("../utils");

class AuthController {
  async registration(req, res) {
    try {
      const {username, sex, password, email, date_of_birth} = req.body
      const errMes = ''
      const hashPassword = await bcrypt.hash(password, 10)
      const [user, created] = await User.findOrCreate({
        where: {
          [Op.or]: [{ nickname: username }, { email }]
        },
        defaults: {
          nickname: username, email, sex, password: hashPassword, roleId: 1, date_of_birth
        }
      })


      const {accessToken, refreshToken} = await generateTokens(user);
      const currentDate = new Date()
      const expiresIn = new Date(new Date().setMonth(currentDate.getMonth() + 1))
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        expires: expiresIn,
        // secure: true,
        sameSite: true
      })

      // Если захотите сделать отправку почты
      // const mailOptions = {
      //   from: EMAIL_USER,
      //   to: email,
      //   subject: 'Регистация на сайте',
      //   html: HTML_REGISTRATION(email, phone, short_name)
      // };
      // await transporter.sendMail(mailOptions, function (error, info) {
      //   if (error) {
      //     console.log(error);
      //   } else {
      //     console.log('Email sent: ' + info.response);
      //   }
      // });

      delete user.password;

      if (created)
        return res.json({token: accessToken, email: user.email, profile: user});
      return res.json(created)
    } catch (e) {
      console.log(e)
      return e
    }
  }

  async login(req, res, next) {
    try {
      const {email, password} = req.body
      let user = null
      if (email !== undefined) {
        user = await User.findOne({
          where: {email},
          include: {
            model: UsersSocialMedia,
            attributes: ['text', 'socialMediumId']
          },
          // raw: true
        })
      }
      if (user === null) {
        return res.status(404).json({message: 'Пользователь не найден'})
      }
      let comparePassword = bcrypt.compareSync(password, user.password)
      if (!comparePassword) {
        return res.status(401).json({message: 'Неверный пароль'})
      }
      const {accessToken, refreshToken} = await generateTokens(user);
      // delete user.password
      // delete user.updatedAt
      const currentDate = new Date()
      const expiresIn = new Date(new Date().setMonth(currentDate.getMonth() + 1))
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        expires: expiresIn,
        // secure: true,
        sameSite: true
      })
      let avatar = await File.findOne({
        where: {userId: user.id, typeFileId: 3}
      })
      //как будто уже и не нужен
      let profileCover = await File.findOne({
        where: {userId: user.id, typeFileId: 1}
      })

      // Обновил сборку, потому что прошлая не работала, присылала password && не присылала avatar
      const responseUser = {
        aboutMe: user.aboutMe,
        count_subscribers: user.count_subscribers,
        date_of_birth: user.date_of_birth,
        email: user.email,
        id: user.id,
        nickname: user.nickname,
        roleId: user.roleId,
        sex: user.sex,
        avatar: avatar?.url,
        usersSocialMedia: user.usersSocialMedia,
      }
      return res.json({token: accessToken, email: user.email, profile: responseUser});

    } catch (e) {
      console.log(e)
      return res.status(401).json({message: e.message})
    }
  }

  async logout (req, res) {
    try {
      const {refreshToken} = req.cookies
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        expires: new Date(0),
        // secure: false,
        sameSite: false
      })
      return res.status(200).json('Пака')
    } catch (e) {
      return res.status(401).json({message: e.message})
    }
  }

  async loginToAccessToken(req, res, next) {
    // try {
    //   let currentUser = null
    //   const cookie = req.cookies
    //   const authToken = cookie.refreshToken;
    //   if (!authToken) {
    //     return res.status(401).json({message: 'Пользователь не авторизован, отсутствует токен'})
    //   }
    //   jwt.verify(authToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    //     if(err) {
    //       return res.status(403).json({message: 'Ощибка доступа'})
    //     }
    //     currentUser = user
    //   })
    //   const {accessToken} = await refreshToken(authToken)
    //   return res.json({token: accessToken, email: currentUser['user'].email, profile: currentUser['user']})
    // } catch (e) {
    //   return res.status(401).json({message: e.message})
    // }
    next();
  }
  async resetPassword(req, res, next) {
    const { email } = req.body

    function randomIntFromInterval(min, max) { // min and max included
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const code = randomIntFromInterval(1000, 9999);

    let config = {
      host: process.env.MAIL_SERVER,
      port: process.env.MAIL_PORT,               // Порт для SSL
      secure: false,            // Используем SSL
      auth: {
        user: process.env.NODEJS_GMAIL_APP_USER,
        pass: process.env.NODEJS_GMAIL_APP_PASSWORD
      }
    }
    let transporter = nodemailer.createTransport(config);
    let MailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: PRODUCT_NAME,
        link: PRODUCT_URL
      }
    });

    function notFound({type}){
      return res.status(401).json({message: 'Не найдено ' + {type}})
    }

    if(!email) notFound('email')
    const user = await User.findOne({where: {email}})
    if(!user) notFound('user')
    await User.update({refreshCode: code}, {where: {id: user.id}})


    let message = {
      from: process.env.NODEJS_GMAIL_APP_USER,
      to: req.body.email,
      subject: `Сброс пароля на сайте ${PRODUCT_NAME} `,
      html: HTML_REGISTRATION(code),
    };

    transporter.sendMail(message).then((info) => {
      return res.status(201).json(
          {
            msg: "Email sent",
            info: info.messageId,
            preview: nodemailer.getTestMessageUrl(info)
          }
      )
    }).catch((err) => {
      return res.status(500).json({ msg: err });
    })

  }

  async checkME(req, res) {
    const { email, code } = req.body

    function notFound({type}){
      return res.status(401).json({message: 'Не найдено ' + {type}})
    }

    if(!email || !code) notFound('email || code')
    const user = await User.findOne({where: {email}})
    if(!user) notFound('user')

    if(user.refreshCode === code){
      res.status(200).json({success: true})
    }else{
      res.status(400).json({success: false})
    }
  }

  async setNewPassword(req, res) {
    const {email, newPassword} = req.body;

    try {
      const user = await User.findOne({where: {email}})
      if(!user || !newPassword) res.status(401).json({message: 'not founded'})

      const hashPassword = await bcrypt.hash(newPassword, 10)
      await User.update(
          {password: hashPassword, refreshCode: null},
          {where: {id: user.id}}
      )
      return res.status(200).json({message: 'Password updated'})
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }
}

module.exports = new AuthController()