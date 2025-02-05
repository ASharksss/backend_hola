const {Transaction, Publication, Publication_buy, User,  Type_notification} = require("../models/models");
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
                ivnID: 'deeeeemn',
                status: false,
            })
            // console.log(publicationIDs);
            for (let i = 0; i < publicationIDs.length; i++) {
                await Basket.update({
                    transactionId: transaction.id,
                }, {
                    where: {
                        id: publicationIDs[i]
                    }
                });
            }

            return res.status(200).json({url: 'http://localhost:3000/tempPay', transaction: transaction.id})

        } catch (e) {
            return sideError(e);
        }
    }


    async answFromRobo(req, res) {
        function sideError(param, type) {
            let err = type === 'cli' ? 'Client side error' : 'Server error';
            let status = type === 'cli' ? 400 : 500;
            return res.status(status).json({message: `${param}. ${err}`});
        }

        const {ID, transaction} = req.body
        const userID = req.userId;
        // const {user} = req.user;

        if (!ID || !transaction) return sideError("Publication ID not found", 'cli');
        if (!userID) return sideError("User ID not found", 'cli');
        // console.log(typeof publicationIDs);
        try {
            if(transaction === true){
                const transactionPP = await Transaction.update({status: 1}, {where: {id: ID}})
                if (!transactionPP) return await sideError("transaction ");

                const publics = await Basket.findAll({where: {transactionId: ID}}).catch((e) => res.status(500).json({message: `${e}`}));

                const failedPublications = [];
                const boughtPublications = [];

                // let textTemplate = await Type_notification.findOne({where: {id: 7}})

                // console.log(publics);

                for (let item of publics) {
                    // console.log(item);
                    const candidate = await Publication_buy.findOne({where: {publicationId : item.publicationId, userId: userID}});
                    if (candidate) {
                        failedPublications.push(item.publicationId);
                    } else {
                        const buy = await Publication_buy.create({publicationId : item.publicationId, userId: userID, transactionId: ID});
                        boughtPublications.push(item.publicationId);
                        const publication = await Publication.findOne({
                            where: {id: item.publicationId},
                            attributes: ['title', 'price'],
                            include: {model: User, attributes: ['id', 'nickname']}
                        })

                        // publications.push(publication) // ЗАЧЕМ???

                        // //Находим кошелек автора
                        // authorWalletId = await Wallet.findOne({
                        //     where: {userId: publication.user.id},
                        //     attributes: ['id', 'balance']
                        // })

                        //Создаем транзакцию
                        await Transaction.update({
                            publicationBuyId: buy.id,
                            purchaseCost: publication.price,
                            transferToAuthor: publication.price * (1 - 0.01),
                            transferToService: publication.price * (1 - 0.99),
                            userID
                        }, {where: {id: ID}}).catch((e) => res.status(500).json({message: `${e}`}));

                        //Обновляем баланс

                        // let newBalance = authorWalletId.balance + transaction.transferToAuthor
                        // await Wallet.update(
                        //     {balance: newBalance},
                        //     {where: {id: authorWalletId.id}}
                        // )

                        //Отправляем уведомление

                        // let notification_text = textTemplate.text
                        //     .replace('{nickname}', user.nickname).replace('{title}', publication.title)
                        // await Notification.create({
                        //     userId: publication.user.id,
                        //     notification_text,
                        //     typeNotificationId: 7
                        // })
                    }
                }
                return res.status(200).json({url: 'http://localhost:3000/basket'})
            }

        } catch (e) {
            return sideError(e);
        }
    }
}

module.exports = new TransactionController()