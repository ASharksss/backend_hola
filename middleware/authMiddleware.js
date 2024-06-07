module.exports.isAuthorized = function (req, res, next) {
  req.userId = 1
  return next()
}