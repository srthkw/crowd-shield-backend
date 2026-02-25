const express = require("express");
const { orgRegister } = require("../controllers/OrgReqsController");

const router = express.Router();

router.post("/", orgRegister);

module.exports = router;