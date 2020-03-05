const axiosLib = require("axios");
const { html } = require("./helpers");

require("dotenv").config();

module.exports = async function(context, myTimer, axios = axiosLib) {
  return new Promise((resolve, reject) => {
    const { AIRTABLE_API_KEY, AIRTABLE_APP_ID, RECIPIENTS } = process.env;
    context.log("FUNCTION CALLED. VARS", Object.keys(process.env));
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
      context.log("PAST DUE");
      try {
        axios
          .get(`${base}${key}&${queryString}`)
          .then(json => {
            const next = json.records[0];
            context.log("NEXT: ", next, next.fields);

            axios
              .patch(`${base}/${next.id}${key}`, {
                fields: {
                  times_sent: (
                    parseInt(next.fields.times_sent, 10) + 1
                  ).toString()
                }
              })
              .then(() => {
                const quote = next.fields;
                const { author, body } = quote;
                const bodySubject = body.length < 100;
                const subject = bodySubject ? body.replace(/\*/g, "") : author;
                const fromEmail = "Quote Owl <quote.owl@gmail.com>";
                const from = bodySubject
                  ? `${author.replace(/[\,'."\(\*\)#]/g, "")} - ${fromEmail}`
                  : fromEmail;
                const message = {
                  personalizations: [
                    { to: RECIPIENTS.split(",").map(email => ({ email })) }
                  ],
                  from: from,
                  subject,
                  content: [
                    {
                      type: "text/html",
                      value: html(quote)
                    }
                  ]
                };
                context.log("SENDING", message);
                resolve(message);
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
      context.log("NOT DUE");
      resolve({});
    }
  });
};
