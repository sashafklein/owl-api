const timerFunction = require("./index");
const { makeBold, html } = require("./helpers");

const context = require("../testing/defaultContext");

const promiseMock = resolvesTo =>
  jest.fn().mockReturnValue(Promise.resolve(resolvesTo));

const htmlExpectation = `
    <div style='background: #F7F7F7; color: black; padding: 30px 8px; font-family: "Montserrat", "Gotham Light", helvetica'>
      <div style='margin: auto; max-width: 700px'>
        <p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; font-style: italic;'>
            The most basic question is not what is best, but <strong>who shall decide</strong> what is best.
          </p>
      </div>
      <div>
        <p style='font-size: 22px; text-align: center; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; margin-bottom: 30px; margin-top: -4px;'>
          - Thomas Sowell
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
  it("Timer trigger should fetch data, update item, and send message", done => {
    const log = context.log.mock;
    const axios = {
      get: promiseMock({
        data: {
          records: [{ id: "12345", fields: { ...fields, times_sent: 5 } }]
        }
      }),
      patch: promiseMock({ success: true })
    };

    timerFunction(context, {}, axios)
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
          { to: [{ email: "sashafklein@gmail.com", name: "Sasha Klein" }] }
        ]);
        expect(from).toEqual({
          name: "Thomas Sowell - Quote Owl",
          email: "quote.owl@gmail.com"
        });
        expect(subject).toEqual(
          "The most basic question is not what is best, but who shall decide what is best."
        );
        console.log(content[0].value);
        expect(content[0]).toEqual({
          type: "text/html",
          value: htmlExpectation.trim()
        });

        done();
      })
      .catch(err => {
        console.log("CALLS", log.calls);
        console.log("ERR: ", err);
        throw err;
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
