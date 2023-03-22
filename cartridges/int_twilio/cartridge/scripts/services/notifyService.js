'use strict';

const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const { notifyService } = require('./serviceConfig');

/**
 * @name notifyProductInStock
 * @function
 * @returns {Object} Service configuration
 */
function notifyProductInStock() {
    const response = LocalServiceRegistry.createService(notifyService.service_name, {
        createRequest: function (svc, args) {
            svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
            svc.setRequestMethod('POST');

            return `To=${args.To}&From=${notifyService.twilio_number}&Body=${args.Body}`;
        },
        parseResponse: function (svc, client) {
            let result;

            try {
                result = JSON.parse(client.text);
            } catch (e) {
                result = client.text;
            }

            return result;
        },
        filterLogMessage: function (msg) {
            return msg.replace(notifyService.phone_pattern, 'To=**********');
        },
    });

    return response;
}

module.exports = {
    notifyProductInStock: notifyProductInStock,
};
