const axiosLib = require("axios");
const { html } = require("./helpers");

require("dotenv").config();

module.exports = async function(context, myTimer, axios = axiosLib) {
  return new Promise((resolve, reject) => {
    const { AIRTABLE_API_KEY, AIRTABLE_APP_ID } = process.env;
    context.info("FUNCTION CALLED. VARS", Object.keys(process.env));
    const key = `?api_key=${AIRTABLE_API_KEY}`;
    const base = `https://api.airtable.com/v0/${AIRTABLE_APP_ID}/Quotes`;

    const params = {
      "sort[0][field]": "times_sent",
      "sort[0][direction]": "asc"
    };

    const queryString = Object.keys(params)
      .reduce((arr, key) => [...arr, `${key}=${params[key]}`], [])
      .join("&");

    if (myTimer.isPastDue) {
      try {
        axios
          .get(`${base}${key}&${queryString}`)
          .then(json => {
            const next = json.records[0];
            context.log("NEXT: ", next);

            axios
              .patch(`${base}/${next.id}${key}`, {
                fields: {
                  times_sent: (
                    parseInt(next.fields.times_sent, 10) + 1
                  ).toString()
                }
              })
              .then(json => {
                console.info("REACHED EMAIL", next);
                resolve(json);
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    } else {
      resolve(true);
    }
  });
};
