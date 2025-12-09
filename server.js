const path = require("path");
// require("dotenv").config({ silent: true });

const express = require("express");
const app = express();
const mongoose = require("mongoose");

// connect to MongoDB using Mongoose
const uri = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(uri).catch(() => {});

// schema for instructions
const instructionSchema = new mongoose.Schema({
    title: String,
    link: String,
    medium: String,
});

const Instruction = mongoose.model("Instruction", instructionSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Setup EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
 
app.get("/", (req, res) => {
    res.render("index");
}); 

// route to render the addProject page
app.get("/addProject", (req, res) => {
    res.render("addProject");
});

// route to render the projects page
app.post("/addProject", async (req, res) => {
    const { title, link, medium } = req.body;

    try {
        const newInstruction = new Instruction({
            title,
            link,
            medium
        });

        await newInstruction.save();  
        console.log("Project added successfully");

        res.redirect("/projects");
    } catch (error) {
        console.error("Error adding project:", error);
        res.status(500).send("Error adding project");
    }
});


// route to render artworks page with using artworks from API
app.get("/artworks", async (req, res) => {
    try {
        const response = await fetch("https://api.artic.edu/api/v1/artworks");

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const artworks = data.data
        .filter((artwork) => {
            // ensure artwork has image_id and thumbnail width and height
            if (!artwork.image_id || !artwork.thumbnail?.width || !artwork.thumbnail?.height) {
                return false;
            }
            return true;
        })
        .map((artwork) => {
            const width = artwork.thumbnail?.width || 400; 
            const height = artwork.thumbnail?.height || ""; 

            const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/${width},${height}/0/default.jpg`;

            return {
                title: artwork.title,
                artist: artwork.artist_title || "Unknown artist",
                imageUrl,
            };
        });

        res.render("artworks", { artworks });
    } catch (error) {
        console.error("Error fetching artworks:", error.message);
        res.status(500).send("Error fetching artworks");
    }
});

// route to render projects page 
app.get("/projects", async (req, res) => {
    try {
        const projects = await Instruction.find(); 
        res.render("projects", { projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).send("Error fetching projects");
    }
});

// route to render search page 
app.get("/search", async (req, res) => {
    try {
        const items = await Instruction.find();
        res.render("search", { items });
    } catch (error) {
        res.status(500).send("Error fetching items");
    }
});


// route to filter search results 
app.post("/search", async (req, res) => {
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
app.get("/clear", (req,res) => {
    res.render("clear");
})

// route to render cleared collection
app.post("/clear", async (req, res) => {
    try {
        await Instruction.deleteMany(); 
        res.render("collectionCleared");
    } catch (error) {
        console.error("Error clearing collection:", error);
        res.status(500).send("Error clearing collection");
    }
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
});

