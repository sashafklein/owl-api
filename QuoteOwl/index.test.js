const timerFunction = require("./index");
const { makeBold, html } = require("./helpers");

const context = require("../testing/defaultContext");

const promiseMock = resolvesTo =>
  jest.fn().mockReturnValue(Promise.resolve(resolvesTo));

const htmlExpectation = `
    <div style='background: #F7F7F7; color: black; padding: 8px; font-family: \"Gotham-Light\", helvetica'>
      <h2 style='font-size: 24px; text-align: center; font-weight: normal; font-family: \"Gotham-Light\", helvetica; margin-bottom: 30px;'>
        Thomas Sowell
      </h2>
      <div style='padding: 0 40px'>
        <p style='text-align: center; line-height: 1.9; padding: 0 40; font-size: 17px; font-weight: normal; font-family: \"Gotham-Light\", helvetica'>
              The most basic question is not what is best, but <strong>who shall decide</strong> what is best.
              </br>
            </p>
      </div>
    </div>`;

const fields = {
  times_sent: "6",
  author: "Thomas Sowell",
  body:
    "The most basic question is not what is best, but *who shall decide* what is best."
};

describe("Quote owl endpoint", () => {
  it("Timer trigger should log message", done => {
    const log = context.log.mock;
    const axios = {
      get: promiseMock({
        records: [{ id: "12345", fields: { ...fields, times_sent: 5 } }]
      }),
      patch: promiseMock({ success: true })
    };

    timerFunction(context, { isPastDue: true }, axios)
      .then(resp => {
        expect(axios.get.mock.calls.length).toEqual(1);
        expect(axios.get.mock.calls[0]).toEqual([
          "https://api.airtable.com/v0/appHdoe52fqgUn5bm/Quotes?api_key=keyoCC3tPr89iYmgz&sort[0][field]=times_sent&sort[0][direction]=asc"
        ]);
        expect(axios.patch.mock.calls[0]).toEqual([
          "https://api.airtable.com/v0/appHdoe52fqgUn5bm/Quotes/12345?api_key=keyoCC3tPr89iYmgz",
          {
            fields: { times_sent: "6" }
          }
        ]);
        const { personalizations, from, subject, content } = resp;

        expect(personalizations).toEqual([
          { to: [{ email: "Sasha Klein <sashafklein@gmail.com>" }] }
        ]);
        expect(from).toEqual("Thomas Sowell - Quote Owl <quote.owl@gmail.com>");
        expect(subject).toEqual(
          "The most basic question is not what is best, but who shall decide what is best."
        );
        expect(content[0]).toEqual({
          type: "text/html",
          value: htmlExpectation.trim()
        });

        done();
      })
      .catch(err => {
        console.log("CALLS", log.calls);
        console.log("ERR: ", err);
        done();
      });
  });

  it("makeBold - makes text bold", () => {
    expect(
      makeBold("This is a *quote* with a bunch of *strong* stuff.")
    ).toEqual(
      "This is a <strong>quote</strong> with a bunch of <strong>strong</strong> stuff."
    );
  });

  it("html - formats html string", () => {
    const quote = {
      id: 12345,
      author: "Thomas Sowell",
      body:
        "The most basic question is not what is best, but *who shall decide* what is best."
    };

    expect(html(quote).trim()).toEqual(htmlExpectation.trim());
  });
});
