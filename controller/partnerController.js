const {PartnerCardAdditional} = require("../models/PartnerCardAdditional");
const {PartnerCardBank} = require("../models/PartnerCardBank");
const {PartnerCardContact} = require("../models/PartnerCardContact");
const {PartnerCard} = require("../models/PartnerCard");
const {User} = require("../models/models");

class PartnerController {
    async createPartner(req, res) {
        function sideError(param, type) {
            let err = type === 'cli' ? 'Client side error' : 'Server error';
            let status = type === 'cli' ? 400 : 500;
            return res.status(status).json({ message: `${param}. ${err}` });
        }

        const userId = req.userId;
        const data = req.body;

        if (!userId) return sideError("User not found", 'cli');
        if (!data) return sideError("Data not found", 'cli');

        let main, additional, bank, contact;

        try {
            // 1. Создание основной информации (PartnerCard)
            main = await PartnerCard.create({
                fullName: data.fullName,
                shortName: data.shortName,
                legalAddress: data.legalAddress,
                actualAddress: data.actualAddress,
                inn: data.inn,
                taxationSystem: data.taxationSystem,
                okved: data.okved,
                ogrnip: data.ogrn,
                kpp: data.kpp,
                ogrn: data.ogrn,
                director: data.director,
                userId: userId,
            });

            if (!main) {
                return sideError("Failed to create main partner information", 'server');
            }

            // 2. Создание дополнительной информации (PartnerCardAdditional)
            if (data.cite) {
                additional = await PartnerCardAdditional.create({
                    cite: data.cite,
                });
            }

            // 3. Создание банковской информации (PartnerCardBank)
            bank = await PartnerCardBank.create({
                bankName: data.bankName,
                bic: data.bic,
                accountNumber: data.accountNumber,
                correspondentAccount: data.correspondentAccount,
            });

            // 4. Создание контактной информации (PartnerCardContact)
            contact = await PartnerCardContact.findOne({
                where: {
                    email: data.email,
                    phone: data.phone,
                }
            });

            if (contact) {
                // Обновляем существующий контакт
                await contact.update({
                    email: data.email,
                    phone: data.phone,
                });
            } else {
                // Создаем новый контакт
                contact = await PartnerCardContact.create({
                    email: data.email,
                    phone: data.phone,
                });
            }

            // 5. Обновление основной информации связями
            await main.update({
                PartnerCardContactId: contact.id,
                PartnerCardAdditionalId: additional?.id || null,
                PartnerCardBankId: bank.id,
            });

            await User.update({
                roleId: 3, // Стал партером - правильнее конечно если текстом, но пох
            }, {where: {id: userId},})

            return res.status(201).json({ message: "Partner created successfully", partnerId: main.id });

        } catch (e) {
            console.error("Error creating partner:", e);
            if (e.name === 'SequelizeValidationError') {
                return sideError(`Validation error: ${e.message}`, 'cli');
            } else if (e.name === 'SequelizeUniqueConstraintError') {
                return sideError(`Unique constraint error: ${e.message}`, 'cli');
            } else {
                return sideError("Server error during partner creation", 'server');
            }
        }
    }


    // async updatePartner(req, res) {
    //     try {
    //         const {tags} = req.body
    //         tags.map(async tag => {
    //             await Creative_tag.create({name: tag.name, groupTagId: tag.groupTagId})
    //         })
    //         return res.json(tags)
    //     } catch (e) {
    //         return res.status(500).json({error: e.message});
    //     }
    // }
    //
    async getPartnerData(req, res) {
        function sideError(param, type) {
            let err = type === 'cli' ? 'Client side error' : 'Server error';
            let status = type === 'cli' ? 400 : 500;
            return res.status(status).json({ message: `${param}. ${err}` });
        }


        const userId = req.userId;

        if (!userId) return sideError("User not found", 'cli');
        // console.log(userId)
        try {
            const partnerCard = await PartnerCard.findOne({
                where: {userId: userId},
                include: [
                    {model: PartnerCardContact},
                    {model: PartnerCardAdditional},
                    {model: PartnerCardBank}
                ],
            })
            if (!partnerCard) return sideError("Cannot get data");

            let flat = {
                fullName: partnerCard.fullName,
                shortName: partnerCard.shortName,
                legalAddress: partnerCard.legalAddress,
                actualAddress: partnerCard.actualAddress,
                inn: partnerCard.inn,
                taxationSystem: partnerCard.taxationSystem,
                okved: partnerCard.okved,
                ogrnip: partnerCard.ogrnip,
                kpp: partnerCard.kpp,
                ogrn: partnerCard.ogrn,
                director: partnerCard.director,
                bankName: partnerCard?.PartnerCardBank?.bankName,
                bic: partnerCard?.PartnerCardBank?.bic,
                accountNumber: partnerCard?.PartnerCardBank?.accountNumber,
                correspondentAccount: partnerCard?.PartnerCardBank?.correspondentAccount,
                email: partnerCard?.PartnerCardContact?.email,
                phone: partnerCard?.PartnerCardContact?.phone,
                site: partnerCard?.PartnerCardAdditional?.site,
            };

            return res.json(flat)
        } catch (e) {
            return sideError(`Something went wrong, ${e.message}`);
        }
    }

}

module.exports = new PartnerController()