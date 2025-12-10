const path = require("path");
// require("dotenv").config({ silent: true });
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userRoutes = require("./routes/userRoutes");

// connect to MongoDB
const uri = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(uri).catch(() => {});

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// setup EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/artworks", async (req, res) => {
    try {
        const response = await fetch("https://api.artic.edu/api/v1/artworks");
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

        const data = await response.json();
        const artworks = data.data
            .filter(artwork => artwork.image_id && artwork.thumbnail?.width && artwork.thumbnail?.height)
            .map(artwork => {
                const width = artwork.thumbnail.width || 400;
                const height = artwork.thumbnail.height || "";
                return {
                    title: artwork.title,
                    artist: artwork.artist_title || "Unknown artist",
                    imageUrl: `https://www.artic.edu/iiif/2/${artwork.image_id}/full/${width},${height}/0/default.jpg`
                };
            });

        res.render("artworks", { artworks });
    } catch (error) {
        console.error("Error fetching artworks:", error.message);
        res.status(500).send("Error fetching artworks");
    }
});

// mount the router
app.use("/", userRoutes);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
