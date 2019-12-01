var express = require("express");
var router = express.Router();

/* List all items, sum all as inventory */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Web Inventory" });
});

/* New transaction = new purchase/sale */

module.exports = router;
