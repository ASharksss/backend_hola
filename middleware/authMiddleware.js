const jwt = require('jsonwebtoken')

module.exports.isAuthorized = function (req, res, next) {
  const authHeader = req.header("Authorization")
  if (!authHeader) {
    const {refreshToken} = req.cookies
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if(err) {
        return res.status(403).json({message: 'Ощибка доступа'})
      }
      req.userId = user.user.id
      req.user = user.user
      return next();
    })
    if (!refreshToken) {
      return res.status(401).json({message: 'Пользователь не авторизован, отсутствует токен'})
    }
  }
  const [bearer, token] = authHeader.split(" ")
  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({message: 'Пользрватель не авторизован, неправильный формат'})
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err) {
      return res.status(403).json({message: 'Ошибка доступа'})
    }
    req.userId = user.user.id
    req.user = user.user
    return next();
  })
}