const jwt = require('jsonwebtoken')
module.exports.isAuthorized = function (req, res, next) {
  const authHeader = req.header("Authorization")
  const {refreshToken} = req.cookies

  if (authHeader) {
    const [bearer, token] = authHeader.split(" ")

    return jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if(err) {
        return res.status(403).json({message: 'Ошибка доступа'})
      }
      req.userId = user.user.id
      req.user = user.user
      next()
    })
  }

  if (!refreshToken) {
    return res.status(401).json({message: 'Пользователь не авторизован, отсутствует токен'})
  }

  return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if(err) {
      console.log('Refresh Token Error:', err)
      return res.status(403).json({message: 'Ошибка доступа fresh'})
    }
    console.log('Decoded Refresh User:', user)
    req.userId = user.user.id
    req.user = user.user
    next()
  })
}
