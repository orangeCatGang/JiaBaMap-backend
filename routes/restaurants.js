const express = require("express");
const router = express.Router();
const axios = require("axios");

const app = express();

router.get("/details", async (req, res, next) => {
  /* 	
    #swagger.summary = 'Get place detail information'
    #swagger.description = 'Endpoint to get detail information of a place from Google API'
  */

  /* 
    #swagger.parameters['id'] = {
      in: 'query',
      description: 'The ID of a place assigned by Google Places API',
      required: 'true',
      type: 'string',
    }
  */

  /*
    #swagger.responses[200] = {
      schema: {
        "displayName": "鮨荻 sushi ogi",
        "rating": 4.7,
        "userRatingCount": 41,
        "startPrice": "2000",
        "endPrice": null,
        "weekDayDescriptions": [
          "星期一: 休息",
          "星期二: 12:00 – 14:30, 18:00 – 21:30",
          "星期三: 12:00 – 14:30, 18:00 – 21:30",
          "星期四: 12:00 – 14:30, 18:00 – 21:30",
          "星期五: 12:00 – 14:30, 18:00 – 21:30",
          "星期六: 12:00 – 14:30, 18:00 – 21:30",
          "星期日: 休息"
        ],
        "formattedAddress": "104004台灣台北市中山區天津街21號",
        "websiteUri": "https://www.facebook.com/Sushiogi/",
        "nationalPhoneNumber": null,
        "googleMapsUri": "https://maps.google.com/?cid=10555472622014893236",
        "openNow": false,
        "photoIds": [
          "places/ChIJXb0k11GpQjQRtAyPp2ySfJI/photos/AdDdOWpEd8Nnf4pdqwGqklFuTnLL5v2tEO3Pzs00AONzEElI4ABs3Dp4J6aiQiXxr9eTbQ5O6pnENPKrGDSZXN4s1DL6gP33hGtcZuzqhpfji0hNWPo6U80iIMltTWctOaER8CYm0QrU22N4tyjM-8boOp14sdsho8CpSbrA",
          "places/ChIJXb0k11GpQjQRtAyPp2ySfJI/photos/AdDdOWrntO0i8qHHIxs2ZCNdvJBmBYSpWW3UhK0kJLouTusr91-Fn5zsR75NIytST4JyxSnnLw0RYeSSa-Clehi6TuE_acnMjzfREAFq_VWAO_9I6pmG1AcJZZkCzxOAy8cssKOtQA2qoawMSR5nDCFKm9nxZkT14OE6RdnL"
        ]
      },
      description: "Get place detail successfully."
    }
  */

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
  /* 	
    #swagger.summary = 'Get photo'
    #swagger.description = 'Endpoint to get a photo from Google API given by the photo ID'
    */

    /* 
    #swagger.parameters['id'] = {
      in: 'query',
      description: 'The ID of a photo assigned by Google Places API',
      required: 'true',
      type: 'string',
    }
  */

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
  /* 	
    #swagger.summary = 'Search restaurants for the keyword'
    #swagger.description = 'Endpoint to search 15 restaurants from Google API based on the keyword and the coordinate'
    */

    /* 
    #swagger.parameters['keyword'] = {
      in: 'query',
      description: 'The keyword to be searched by user',
      required: 'true',
      type: 'string',
    }
    #swagger.parameters['lat'] = {
      in: 'query',
      description: 'The latitude to be searched by user',
      required: 'true',
      type: 'string',
    }
    #swagger.parameters['lng'] = {
      in: 'query',
      description: 'The longitude to be searched by user',
      required: 'true',
      type: 'string',
    }
  */

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
        "places.location",
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
        name: ele.displayName.text,
        rating: ele.rating ?? null,
        userRatingCount: ele.userRatingCount ?? null,
        openNow: ele.currentOpeningHours?.openNow ?? null,
        address: ele.formattedAddress ?? null,
        startPrice: ele.priceRange?.startPrice?.units ?? null,
        endPrice: ele.priceRange?.endPrice?.units ?? null,
        photoId: ele.photos.length > 0 ? ele.photos[0].name : null,
        lat: ele.location.latitude,
        lng: ele.location.longitude,
      });
    }
    res.json(places);
  } catch (err) {
    console.log(err);
    res.json([]);
  }
});

module.exports = router;
