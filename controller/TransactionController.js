const crypto = require('crypto');

const {Transaction, Publication, Publication_buy, User, Type_notification, Wallet} = require("../models/models");
const {Basket} = require("../models/models");
const {PRODUCT_URL, postData, receipt} = require("../utils");
const {where} = require("sequelize");
const user = require("nodemailer/lib/smtp-connection");

class TransactionController {
    // async createTransaction(req, res) {
    //     function sideError(param, type) {
    //         let err = type === 'cli' ? 'Client side error' : 'Server error';
    //         let status = type === 'cli' ? 400 : 500;
    //         return res.status(status).json({message: `${param}. ${err}`});
    //     }
    //
    //     const {publicationIDs} = req.body
    //     const userID = req.userId;
    //
    //     if (!publicationIDs) return sideError("Publication ID not found", 'cli');
    //     if (!userID) return sideError("User ID not found", 'cli');
    //     // console.log(typeof publicationIDs);
    //     try {
    //         const transaction = await Transaction.create({
    //             userId: userID,
    //             ivnID: 'deeeeemn',
    //             status: false,
    //         })
    //         // console.log(publicationIDs);
    //         for (let i = 0; i < publicationIDs.length; i++) {
    //             await Basket.update({
    //                 transactionId: transaction.id,
    //             }, {
    //                 where: {
    //                     id: publicationIDs[i]
    //                 }
    //             });
    //         }
    //
    //         return res.status(200).json({url: 'http://localhost:3000/tempPay', transaction: transaction.id})
    //
    //     } catch (e) {
    //         return sideError(e);
    //     }
    // }
    //
    //
    // async answFromRobo(req, res) {
    //     function sideError(param, type) {
    //         let err = type === 'cli' ? 'Client side error' : 'Server error';
    //         let status = type === 'cli' ? 400 : 500;
    //         return res.status(status).json({message: `${param}. ${err}`});
    //     }
    //
    //     const {ID, transaction} = req.body
    //     const userID = req.userId;
    //     // const {user} = req.user;
    //
    //     if (!ID || !transaction) return sideError("Publication ID not found", 'cli');
    //     if (!userID) return sideError("User ID not found", 'cli');
    //     // console.log(typeof publicationIDs);
    //     try {
    //         if(transaction === true){
    //             const transactionPP = await Transaction.update({status: 1}, {where: {id: ID}})
    //             if (!transactionPP) return await sideError("transaction ");
    //
    //             const publics = await Basket.findAll({where: {transactionId: ID}}).catch((e) => res.status(500).json({message: `${e}`}));
    //
    //             const failedPublications = [];
    //             const boughtPublications = [];
    //
    //             // let textTemplate = await Type_notification.findOne({where: {id: 7}})
    //
    //             // console.log(publics);
    //
    //             for (let item of publics) {
    //                 // console.log(item);
    //                 const candidate = await Publication_buy.findOne({where: {publicationId : item.publicationId, userId: userID}});
    //                 if (candidate) {
    //                     failedPublications.push(item.publicationId);
    //                 } else {
    //                     const buy = await Publication_buy.create({publicationId : item.publicationId, userId: userID, transactionId: ID});
    //                     boughtPublications.push(item.publicationId);
    //
    //                     const publication = await Publication.findOne({
    //                         where: {id: item.publicationId},
    //                         attributes: ['title', 'price'],
    //                         include: {model: User, attributes: ['id', 'nickname']}
    //                     })
    //
    //                     // publications.push(publication) // ЗАЧЕМ???
    //
    //
    //
    //                     //Находим кошелек автора
    //                     let authorWalletId = await Wallet.findOne({
    //                         where: {userId: publication.user.id},
    //                         attributes: ['id', 'balance']
    //                     })
    //
    //                     console.log(authorWalletId);
    //
    //                     if(!authorWalletId){
    //                         authorWalletId = await Wallet.create({
    //                             userId: publication.user.id,
    //                             balance: 0.0
    //                         })
    //                     }
    //
    //                     console.log(authorWalletId);
    //
    //                     //Создаем транзакцию
    //                     await Transaction.update({
    //                         publicationBuyId: buy.id,
    //                         purchaseCost: publication.price,
    //                         transferToAuthor: publication.price * (1 - 0.01),
    //                         transferToService: publication.price * (1 - 0.99),
    //                         userID
    //                     }, {where: {id: ID}}).catch((e) => res.status(500).json({message: `${e}`}));
    //
    //                     //Обновляем баланс
    //
    //                     let newBalance = authorWalletId.balance === 0 ? 0 : authorWalletId.balance  + transaction.transferToAuthor
    //                     await Wallet.update(
    //                         {balance: newBalance},
    //                         {where: {id: authorWalletId.id}}
    //                     )
    //
    //                     //Отправляем уведомление
    //
    //                     // let notification_text = textTemplate.text
    //                     //     .replace('{nickname}', user.nickname).replace('{title}', publication.title)
    //                     // await Notification.create({
    //                     //     userId: publication.user.id,
    //                     //     notification_text,
    //                     //     typeNotificationId: 7n
    //                 }
    //             }
    //             return res.status(200).json({url: 'http://localhost:3000/basket'})
    //         }
    //
    //     } catch (e) {
    //         return sideError(e);
    //     }
    // }
    //

    async payAd(req, res, next) {
        try {
            const user = req.user

            const basket = await Basket.findAll({
                where: {userId: user.id},
                include: {
                    model: Publication,
                    attributes: ['id', 'price']
                }
            });

            let totalPrice;

            for(const post of basket){
                totalPrice = post.publication.price;
            }

            const transaction = await Transaction.create({
                            userId: user.id,
                            ivnID: 'pending',
                            status: false,
                            purchaseCost: totalPrice,
            })
            if(!transaction){
                return res.status(500).json({error: "Transaction not found", url: `${PRODUCT_URL}/pay/error`})
            } // идет загрузка на клиенте

            const updateBasket = await Basket.update(
                {transactionId: transaction.id},
                {where: {userId: user.id}}
            )
            if(!updateBasket){
                return res.status(500).json({error: "Basket updating is failed", url: `${PRODUCT_URL}/pay/error`})
            } // идет загрузка на клиенте

            const robokassaLogin = process.env.ROBOKASSA_LOGIN
            const robokassaIsTest = process.env.ROBOKASSA_IS_TEST || 1
            const robokassaPassword = process.env.ROBOKASSA_PASSWORD_1

            // https://docs.robokassa.ru/testing-mode/ Документация для тестового

            const receiptData = receipt('Оплата постов', totalPrice)
            const receiptURLEncode = encodeURIComponent(JSON.stringify(receiptData)).replace(/%3A/g, ":").replace(/%2C/g, ",")
            let crcData = `${robokassaLogin}:${totalPrice}:${transaction.id}:${receiptURLEncode}:${robokassaPassword}`
            const crc = crypto.createHash('md5').update(crcData).digest("hex");

            const invoice = postData(robokassaLogin, totalPrice, transaction.id, receiptURLEncode, crc, user.email, robokassaIsTest)
                .then(async data => {
                    return data?.invoiceID;
                })
                .catch(error => {
                    console.warn('Ошибка при выполнении запроса:', error);
                });

            const ads = `https://auth.robokassa.ru/Merchant/Index/${JSON.stringify(invoice)}`
            return res.json(ads)
        } catch (e) {
            console.log(e)
            return next('some Error')
        }
    }

    async success(req, res, next) {
        try {
            const {OutSum, InvId, SignatureValue} = req.query
            const robokassaPassword = process.env.ROBOKASSA_PASSWORD_1

            const transaction = await Transaction.update({
                status: true,
                invId: 'success'
            },{where: {id: InvId}})

            const basket = await Basket.findAll({where: {transactionId: InvId}})

            for(let post of basket){
                const post_buy = await Publication_buy.create({
                    userId: basket.userId,
                    publicationId: post.publicationId,
                    transactionId: transaction.id,
                })
                if(!post_buy){console.log('error buy add')}
            }

                                 // if (!booking) return res.json({message: 'oshibka, ne nashel zakaz'});

            let crcData = `${OutSum}:${InvId}:${robokassaPassword}`
            const crc = crypto.createHash('md5').update(crcData).digest("hex");
            if (crc !== SignatureValue) return res.json({message: 'Ошибка'})

                            // await Booking.update({isActive: 1}, {where: {id: InvId}})
                            // await Ad.update({statusAdId: 2}, {where: {id: booking['adId']}})

            return res.redirect(`${PRODUCT_URL}/publications/available`)

        } catch (e) {
            console.log(e.message)
            return next(ApiError.badRequest(e.message))
        }
    }

    async error(req, res, next) {
        try {
            const {InvId} = req.query
            await Transaction.update({
                status: 0,
                ivnID: 'error'
            }, {where: {id: InvId}}).catch((e) => res.status(500).json({message: `${e}`}));

            return res.redirect(`${PRODUCT_URL}/pay/error`)
        } catch (e) {
            // console.log(e.message)
            return res.status(500).json({error: e.message})
        }
    }
}

module.exports = new TransactionController()