const jwt = require('jsonwebtoken');
const {Publication_tag, Creative_tag} = require("./models/models");

function count(arr) {
  return arr.reduce((acc, item) => {
    acc[item.publicationId] = (acc[item.publicationId] || 0) + 1;
    return acc;
  }, {});
}

async function findPublicationTags(publicationsArray, tags) {
  for (const item of publicationsArray) {
    const publicationTags = await Publication_tag.findAll({
      where: {publicationId: item.publicationId},
      attributes: ['publicationId', 'creativeTagId'],
      include: [
        {model: Creative_tag, attributes: ['name']},
      ]
    });
    tags.push(...publicationTags);
  }
  return tags
}

function checkTags(tags, creative_tags, publicationsArray, publications) {
  for (let i = 0; i < creative_tags.length; i++) { // перебор выбранных тэгов
    tags.map(item => { // перебор тэгов найденных по публикациям
      if (item.creativeTagId === parseInt(creative_tags[i])) { // если есть совпадения
        publicationsArray.map(publication => { // добавление в общий массив
          if (publication.publicationId === item.publicationId) {
            publications.push(publication)
          }
        })
      }
    })
  }
  const uniqueNames = new Set(publications)
  publications = Array.from(uniqueNames)
  return publications
}

const generateTokens = async (user) => {
  try {
    const accessToken = jwt.sign(
      {user},
      process.env.JWT_SECRET,
      {expiresIn: "1h"}
    );
    const refreshToken = jwt.sign(
      {user},
      process.env.JWT_REFRESH_SECRET,
      {expiresIn: "30d"}
    );
    return {accessToken, refreshToken}
  } catch (err) {
    return Promise.reject(err);
  }
};

const refreshToken = async (oldToken) => {
  try {
    const decodeToken = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findByPk(decodeToken.user.id)
    if (!user) {
      throw Error('Пользователь не найден')
    }
    const {accessToken, refreshToken} = await generateTokens(user)
    return {accessToken, refreshToken};
  } catch (e) {
    throw Error('Неправильный токен')
  }
}


module.exports = {count, findPublicationTags, checkTags, generateTokens, refreshToken}