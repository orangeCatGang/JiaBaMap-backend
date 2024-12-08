const express = require("express");
const router = express.Router();
const axios = require("axios");

const app = express();

router.get("/details", async (req, res, next) => {
  // get query parameter
  // TODO: error handling
  const id = req.query.id;

  // send request to Google API
  try {
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          fields: [
            "displayName",
            "photos",
            "formattedAddress",
            "googleMapsUri",
            "currentOpeningHours",
            "nationalPhoneNumber",
            "priceRange",
            "rating",
            "websiteUri",
            "userRatingCount",
          ].join(","),
          key: process.env.API_KEY,
          languageCode: "zh-TW",
        },
      }
    );

    const photoNum = 2;
    const photoNames = [];
    for (let i = 0; i < photoNum; i++) {
      photoNames.push(response.data.photos[i].name);
    }

    // prepare data
    const data = {
      displayName: response.data.displayName.text ?? null,
      rating: response.data.rating ?? null,
      userRatingCount: response.data.userRatingCount ?? null,
      startPrice: response.data.priceRange?.startPrice?.units ?? null,
      endPrice: response.data.priceRange?.endPrice?.units ?? null,
      weekDayDescriptions:
        response.data.currentOpeningHours?.weekdayDescriptions ?? null,
      formattedAddress: response.data.formattedAddress ?? null,
      websiteUri: response.data.websiteUri ?? null,
      nationalPhoneNumber: response.data.nationalPhoneNumber ?? null,
      googleMapsUri: response.data.googleMapsUri,
      openNow: response.data.currentOpeningHours?.openNow ?? null,
      photoIds: photoNames,
    };

    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({});
  }
});

//店家照片
router.get("/photo", async (req, res, next) => {
  // get query parameter
  const photoId = req.query.id;

  // send request to Google API
  try {
    const response = await axios.get(
      `https://places.googleapis.com/v1/${photoId}/media`,
      {
        responseType: "arraybuffer",
        params: {
          key: process.env.API_KEY,
          maxHeightPx: 1024,
          maxWidthPx: 1024,
        },
      }
    );

    // prepare data
    //FIXME
    res.header("Access-Control-Allow-Origin", "*");
    res.contentType(response.headers["content-type"]).send(response.data);
  } catch (err) {
    // TODO: error handling
    console.log(err);
    res.json({});
  }
});

//根據關鍵字和經緯度搜尋結果
router.get("/search", async (req, res, next) => {
  // get query parameter
  const { keyword, lat, lng } = req.query;
  // send request to Google API
  try {
    const body = {
      textQuery: keyword,
      includedType: "restaurant",
      languageCode: "zh-TW",
      pageSize: 15,
      locationBias: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng,
          },
          radius: 1000.0,
        },
      },
    };
    const headers = {
      "X-Goog-Api-Key": process.env.API_KEY,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.photos",
        "places.priceRange",
        "places.rating",
        "places.userRatingCount",
        "places.currentOpeningHours",
      ].join(","),
    };
    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchText",
      body,
      {
        headers,
      }
    );

    const places = [];
    for (const ele of response.data.places) {
      places.push({
        id: ele.id,
        name: ele.displayName,
        rating: ele.rating ?? null,
        userRatingCount: ele.userRatingCount ?? null,
        openNow: ele.currentOpeningHours?.openNow ?? null,
        Address: ele.formattedAddress ?? null,
        startPrice: ele.priceRange?.startPrice?.units ?? null,
        endPrice: ele.priceRange?.endPrice?.units ?? null,
        photoId: ele.photos.length > 0 ? ele.photos[0].name : null,
      });
    }
    res.json(places);
  } catch (err) {
    console.log(err);
    res.json([]);
  }
});

module.exports = router;
