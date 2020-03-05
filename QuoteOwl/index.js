const nodeFetch = require("node-fetch");

require("dotenv").config();

const makeBold = text => {
  const regex = new RegExp("(?:\\*+)([a-zA-Z0-9 ]+)(?:\\*+)", "g");
  return text.replace(
    regex,
    match => `<strong>${match.replace(new RegExp("\\*", "g"), "")}</strong>`
  );
};

export const html = quote => {
  const body = makeBold(quote.body);
  const content = `
    <div style='background: #F7F7F7; color: black; padding: 8px; font-family: "Gotham-Light", helvetica'>
      <h2 style='font-size: 24px; text-align: center; font-weight: normal; font-family: "Gotham-Light", helvetica; margin-bottom: 30px;'>
        ${quote.author}
      </h2>
      <div style='padding: 0 40px'>
        ${body.split("\r\n").map(
          line =>
            `<p style='text-align: center; line-height: 1.9; padding: 0 40; font-size: 17px; font-weight: normal; font-family: "Gotham-Light", helvetica'>
              ${line}
              </br>
            </p>`
        )}
      </div>
    </div>
  `;
  return content;
};

module.exports = async function(context, myTimer, fetch = nodeFetch) {
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
        fetch(`${base}${key}&${queryString}`)
          .then(res => res.json())
          .then(json => {
            const next = json.records[0];
            context.log("NEXT: ", next);

            fetch(`${base}/${next.id}${key}`, {
              method: "PATCH",
              body: JSON.stringify({
                fields: {
                  times_sent: (
                    parseInt(next.fields.times_sent, 10) + 1
                  ).toString()
                }
              }),
              headers: { "Content-Type": "application/json" }
            })
              .then(res => res.json())
              .then(json => {
                if (json.error) {
                  reject(json.error);
                } else {
                  console.info("REACHED EMAIL", next);
                  resolve(json);
                }
              })
              .catch(err => {
                reject(err);
              });
          });
      } catch (err) {
        reject(err);
      }
    } else {
      resolve(true);
    }
  });
};
