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




module.exports = {count, findPublicationTags, checkTags}