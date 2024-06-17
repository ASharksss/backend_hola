function count(arr) {
  return arr.reduce((acc, item) => {
    acc[item.publicationId] = (acc[item.publicationId] || 0) + 1;
    return acc;
  }, {});
}

module.exports = {count}