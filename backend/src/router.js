const express = require("express")

const router = express.Router()

const scoresControllers = require("./controllers/scoresControllers")

router.get("/scores", scoresControllers.browse)
router.get("/scores/:id", scoresControllers.read)
router.put("/scores/:id", scoresControllers.edit)
router.post("/scores", scoresControllers.add)
router.delete("/scores/:id", scoresControllers.destroy)

module.exports = router
