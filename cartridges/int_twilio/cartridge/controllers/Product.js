'use strict';

/**
 * @namespace Product
 */

const server = require('server');
server.extend(module.superModule);

const csrfProtection = require('*/cartridge/scripts/middleware/csrf');

 /**
  * Product-Show : This endpoint is called to show the details of the selected product
  * @name Product-Show
  * @function
  * @memberof Product
  * @param {category} - non-sensitive
  * @param {renders} - isml
  * @param {serverfunction} - append
  */
server.append('Show', csrfProtection.generateToken, function (req, res, next) {
    const ContentMgr = require('dw/content/ContentMgr');
    const outOfStockForm = server.forms.getForm('outOfStockForm');
    outOfStockForm.clear();

    const viewData = res.getViewData();

    viewData.forms = { outOfStockForm };

    const contentAssetID = 'out-of-stock-section';
    const outOfStockAsset = ContentMgr.getContent(contentAssetID);

    if (outOfStockAsset) {
        viewData.outOfStockAsset = outOfStockAsset;
    }

    res.setViewData(viewData);
    next();
});

module.exports = server.exports();
