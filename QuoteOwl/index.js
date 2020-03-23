const axiosLib = require("axios");
const { html } = require("./helpers");

require("dotenv").config();

module.exports = async function(context, myTimer, axios = axiosLib) {
  const { log } = context;
  return new Promise((resolve, reject) => {
    const { AIRTABLE_API_KEY, AIRTABLE_APP_ID, RECIPIENTS } = process.env;
    log("TIMER", myTimer);
    const key = `?api_key=${AIRTABLE_API_KEY}`;
    const base = `https://api.airtable.com/v0/${AIRTABLE_APP_ID}/Quotes`;

    const params = {
      "sort[0][field]": "times_sent",
      "sort[0][direction]": "asc"
    };

    const queryString = Object.keys(params)
      .reduce((arr, key) => [...arr, `${key}=${params[key]}`], [])
      .join("&");

    const getUrl = `${base}${key}&${queryString}`;
    log("GET URL", getUrl);
    try {
      axios
        .get(getUrl)
        .then(({ data }) => {
          log("DATA: ", data);
          const next = data.records[0];
          log("NEXT: ", next, next.fields);

          const timesSent =
            parseInt(
              next.fields.times_sent ||
                data.records.find(r => r.fields.times_sent).fields.times_sent,
              10
            ) + 1;

          const patchUrl = `${base}/${next.id}${key}`;
          const fields = {
            times_sent: timesSent.toString()
          };
          log("FIELDS", fields);
          log("PATCH URL", patchUrl);
          axios
            .patch(patchUrl, { fields })
            .then(r => {
              log("PATCH: ", r.data);
              const quote = next.fields;
              const { author, body } = quote;
              const bodySubject = body.length < 100;
              const subject = bodySubject
                ? body.replace(/\*/g, "").replace(/\r\n/g, " ")
                : author;
              const from = bodySubject
                ? `${author.replace(/[\,'."\(\*\)#]/g, "")} - Quote Owl`
                : "Quote Owl";
              const to = RECIPIENTS.split(",").map(nameEmail => {
                const [name, email] = nameEmail.split("|");
                return { email, name };
              });
              log("TO", to);

              const message = {
                personalizations: [{ to }],
                from: {
                  email: "quote.owl@gmail.com",
                  name: from
                },
                subject,
                content: [
                  {
                    type: "text/html",
                    value: html(quote)
                  }
                ]
              };
              log("SENDING", message);
              resolve(message);
            })
            .catch(err => {
              log("FAILED PATCH", err);
              reject(err);
            });
        })
        .catch(err => {
          context.log("FAILED GET", err);
          reject(err);
        });
    } catch (err) {
      context.log("IN GLOBAL CATCH");
      reject(err);
    }
  });
};
