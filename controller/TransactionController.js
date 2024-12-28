const {Transaction} = require("../models/models");
const {Basket} = require("../models/models");

class TransactionController {
    async createTransaction(req, res) {
        function sideError(param, type) {
            let err = type === 'cli' ? 'Client side error' : 'Server error';
            let status = type === 'cli' ? 400 : 500;
            return res.status(status).json({message: `${param}. ${err}`});
        }

        const {publicationIDs} = req.body
        const userID = req.userId;

        if (!publicationIDs) return sideError("Publication ID not found", 'cli');
        if (!userID) return sideError("User ID not found", 'cli');
        // console.log(typeof publicationIDs);
        try {
            const transaction = await Transaction.create({
                userId: userID,
                ivnID: 'deeeeem',
                status: false,
            })
            for (let i = 0; i < publicationIDs.length; i++) {
                await Basket.update({
                    transactionId: transaction.id,
                }, {
                    where: {
                        publicationId: publicationIDs[i]
                    }
                });
            }

            return res.status(200).json({url: 'https://hui.ru/balassal/pay/my/basket/pls'})

        } catch (e) {
            return sideError(e);
        }
    }
}

module.exports = new TransactionController()