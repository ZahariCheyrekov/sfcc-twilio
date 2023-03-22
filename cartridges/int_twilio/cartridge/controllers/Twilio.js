"use strict";

/**
 * @namespace Twilio
 */

const server = require("server");
const consentTracking = require("*/cartridge/scripts/middleware/consentTracking");
const csrfProtection = require("*/cartridge/scripts/middleware/csrf");

const Resource = require("dw/web/Resource");

/**
 * Twilio-Subscribe : This endpoint is called when the subscribe to product form is submitted
 * @name Base/Twilio-Subscribe
 * @function
 * @memberof Twilio
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - csrf_token - a CSRF token
 * @param {category} - sensitive
 * @param {serverfunction} - post
 */
server.post(
    "Subscribe",
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        const CustomObjectMgr = require("dw/object/CustomObjectMgr");
        const Transaction = require("dw/system/Transaction");
        const Resource = require('dw/web/Resource');

        const subscribeToProductForm = server.forms.getForm("outOfStockForm");
        const customObjectType = "OutOfStockForm";
        const phoneNumber = subscribeToProductForm.phoneNumber.value;
        const productId = subscribeToProductForm.productSubscribeId.value;

        if (subscribeToProductForm.phoneNumber && subscribeToProductForm.productSubscribeId) {
            const newPhoneNumber = subscribeToProductForm.phoneNumber.value;

            if (!subscribeToProductForm.phoneNumber) {
                res.json({
                    success: false,
                    error: Resource.msg('error.message.phone.number.format', 'error', null)
                });
                return next();
            }

            const subscribeToProductResult = CustomObjectMgr.getCustomObject(customObjectType, productId);

            if (!empty(subscribeToProductResult)) {
                let phoneNumbers = subscribeToProductResult.custom.phoneNumbers;
                const phoneNumbersArr = phoneNumbers.split(", ");

                if (!phoneNumbersArr.includes(newPhoneNumber)) {
                    phoneNumbersArr.push(newPhoneNumber);
                    phoneNumbers = phoneNumbersArr.join(", ");

                    Transaction.wrap(function () {
                        subscribeToProductResult.custom.phoneNumbers = phoneNumbers;
                    });

                    res.json({
                        success: true,
                    });
                } else {
                    res.json({
                        error: "Phone number is already added to the product",
                    });
                }


            } else {
                Transaction.wrap(function () {
                    const newsletter = CustomObjectMgr.createCustomObject(customObjectType, productId);
                    newsletter.custom.phoneNumbers = newPhoneNumber;
                });

                res.json({
                    success: true,
                });
            }
        } else {
            res.json({
                error: "Missing phone number",
            });
        }

        return next();
    }
);

module.exports = server.exports();
