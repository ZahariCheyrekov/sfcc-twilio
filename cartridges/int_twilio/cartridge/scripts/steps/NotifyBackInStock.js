'use strict';

const CustomObjectMgr = require('dw/object/CustomObjectMgr');
const Transaction = require('dw/system/Transaction');
const productMgr = require('dw/catalog/ProductMgr');

const notifyService = require('~/cartridge/scripts/services/notifyService');
const stepConfig = require('./stepConfig');

/**
 * @function
 * Service sends SMS to all customer that are subscribed to the newsletter when a given
 * products is back in-stock and deletes all custom objects from the Business Manager
 */
module.exports.execute = function () {
    var productsObjectIterator = CustomObjectMgr.getAllCustomObjects('OutOfStockForm');

    while (productsObjectIterator.hasNext()) {
        var productObject = productsObjectIterator.next();
        var product = productMgr.getProduct(productObject.custom.productId);

        if (!product.available) {
            return 'Product is not available';
        }

        const customerPhoneNumbers = productObject.custom.phoneNumbers.split(', ');

        let error = false;
        const phoneNumbersNotProcessed = [];

        customerPhoneNumbers.forEach((phoneNumber) => {
            let serviceResult = notifyService
                .notifyProductInStock()
                .call({
                    To: phoneNumber,
                    Body: `${product.name} is back in stock!`,
                })
                .isOk();

            if (!serviceResult) {
                error = true;
                phoneNumbersNotProcessed.push(phoneNumber);
            } else {
                error = false;
            }
        });

        if (error) {
            var remainingPhoneNumbers = phoneNumbersNotProcessed.join(', ');

            Transaction.wrap(() => {
                productObject.custom.phoneNumbers = remainingPhoneNumbers;
            });
        } else {
            Transaction.wrap(function () {
                CustomObjectMgr.remove(productObject);
            });
        }
    }
};
