const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// schema for instructions
const instructionSchema = new mongoose.Schema({
    title: String,
    link: String,
    medium: String,
});

const Instruction = mongoose.model("Instruction", instructionSchema);

// route to render the addProject page
router.get("/addProject", (req, res) => {
    res.render("addProject");
});

// route to add a project
router.post("/addProject", async (req, res) => {
    const { title, link, medium } = req.body;

    try {
        const newInstruction = new Instruction({ title, link, medium });
        await newInstruction.save();
        res.redirect("/projects");
    } catch (error) {
        console.error("Error adding project:", error);
        res.status(500).send("Error adding project");
    }
});

// route to render projects page
router.get("/projects", async (req, res) => {
    try {
        const projects = await Instruction.find();
        res.render("projects", { projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).send("Error fetching projects");
    }
});

// route to render search page
router.get("/search", async (req, res) => {
    try {
        const items = await Instruction.find();
        res.render("search", { items });
    } catch (error) {
        res.status(500).send("Error fetching items");
    }
});

// route to filter search results
router.post("/search", async (req, res) => {
    const { medium } = req.body;

    let items;
    if (medium === "all") {
        items = await Instruction.find();
    } else {
        items = await Instruction.find({ medium });
    }

    res.render("search", { items });
});

// route to render clear form
router.get("/clear", (req, res) => {
    res.render("clear");
});

// route to clear collection
router.post("/clear", async (req, res) => {
    try {
        await Instruction.deleteMany();
        res.render("collectionCleared");
    } catch (error) {
        console.error("Error clearing collection:", error);
        res.status(500).send("Error clearing collection");
    }
});

module.exports = router;
