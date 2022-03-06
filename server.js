const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const haversine = require("haversine-distance");
const app = express();

dotenv.config({ path: "./.env" });
app.use(cors());

app.get("/", async (req, res) => {
  const names = [];
  try {
    const peopleLiveInLondon = await axios.get(
      "https://bpdts-test-app.herokuapp.com/city/London/users"
    );

    const peopleLiveWithIn50MilesFromLondon = await axios.get(
      "https://bpdts-test-app.herokuapp.com/users"
    );

    if (peopleLiveInLondon && peopleLiveInLondon.data) {
      peopleLiveInLondon.data.map((individualData) => {
        names.push(individualData);
      });
    }

    if (
      peopleLiveWithIn50MilesFromLondon &&
      peopleLiveWithIn50MilesFromLondon.data
    ) {
      peopleLiveWithIn50MilesFromLondon.data.map((individualData) => {
        const londonCoordinates = { latitude: 51.509865, longitude: -0.118092 }; // obtained from https://www.latlong.net/place/london-the-uk-14153.html
        const personCoordinates = {
          latitude: individualData.latitude,
          longitude: individualData.longitude,
        };
        const result = haversine(londonCoordinates, personCoordinates); // haversine returns the distance in meters
        if (result && (result * 0.621371) / 1000 <= 50) {
          names.push(individualData);
        }
      });
    }
    if (names.length > 0) {
      res.status(200).json({
        message:
          "These are people who are listed as either living in London, or whose current coordinates are within 50 miles of London.",
        count: names.length,
        data: names
      });
    } else {
      res.status(200).json({
        message:
          "There are no people who are listed as either living in London, or whose current coordinates are within 50 miles of London.",
        count: 0
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

const PORT = process.env.PORT || 8001;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
