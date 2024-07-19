const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt')
const {Op} = require("sequelize");
const {User, File} = require("../models/models");
const {refreshToken, generateTokens} = require("../services/utils");

class AuthController {
  async registration(req, res) {
    try {
      const {username, sex, password, email, date_of_birth} = req.body
      const hashPassword = await bcrypt.hash(password, 10)
      const [user, created] = await User.findOrCreate({
        where: {
          [Op.or]: [{ nickname: username }, { email }]
        },
        defaults: {
          nickname: username, email, sex, password: hashPassword, roleId: 1, date_of_birth
        }
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
      if (created)
        return res.json(user)
      return res.json({created})
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
          raw: true
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
      delete user.password
      delete user.updatedAt
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
      let profileCover = await File.findOne({
        where: {userId: user.id, typeFileId: 1}
      })
      if (avatar) {
        user.avatar = `/static/${avatar.name}`
      }
      if (profileCover) {
        user.profileCover = `/static/${profileCover.name}`
      }

      return res.json({token: accessToken, email: user.email, profile: user});
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
    try {
      let currentUser = null
      const cookie = req.cookies
      const authToken = cookie.refreshToken;
      if (!authToken) {
        return res.status(401).json({message: 'Пользователь не авторизован, отсутствует токен'})
      }
      jwt.verify(authToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if(err) {
          return res.status(403).json({message: 'Ощибка доступа'})
        }
        currentUser = user
      })
      const {accessToken} = await refreshToken(authToken)
      return res.json({token: accessToken, email: currentUser['user'].email, profile: currentUser['user']})
    } catch (e) {
      return res.status(401).json({message: e.message})
    }
  }

}

module.exports = new AuthController()