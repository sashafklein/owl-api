const htmlBeautify = require("js-beautify").html;
const axios = require("axios");
const timerFunction = require("./index");
const { makeBold, html, key, base } = require("./helpers");

const context = require("../testing/defaultContext");

const promiseMock = (resolvesTo) =>
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

const htmlExpectation2 = `
    <div style='background: #F7F7F7; color: black; padding: 30px 8px; font-family: "Montserrat", "Gotham Light", helvetica'>
      <div style='margin: auto; max-width: 700px'>
        <p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; font-style: italic;'>
          God, grant me the serenity to accept the things I cannot change,
        </p>
        <p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; font-style: italic; margin-top: -15px;'>
          Courage to change the things I can change,
        </p>
        <p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; font-style: italic; margin-top: -15px;'>
          And wisdom to know the difference.
        </p>
      </div>
      <div>
        <p style='font-size: 22px; text-align: center; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; margin-bottom: 30px; margin-top: -4px;'>
          - Reinhold Niebuhr
        </p>
      </div>
    </div>`;

const htmlExpectation3 = `
    <div style='background: #F7F7F7; color: black; padding: 30px 8px; font-family: "Montserrat", "Gotham Light", helvetica'>
      <div style='margin: auto; max-width: 700px'>
        <p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; font-style: italic;'>
            The greatest obstacle to living is expectancy, which hangs upon tomorrow and loses today.
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; font-style: italic; margin-top: -15px;'>
            The whole future lies in uncertainty: live immediately.
          </p>
      </div>
      <div>
        <p style='font-size: 22px; text-align: center; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; margin-bottom: 30px; margin-top: -4px;'>
          - Seneca
        </p>
      </div>
    </div>`;

const htmlExpectation4 = `<div style='background: #F7F7F7; color: black; padding: 30px 8px; font-family: \"Montserrat\", \"Gotham Light\", helvetica'>
      <div style='margin: auto; max-width: 700px'>
        <p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic;'>
            <strong>Tripping Over Joy</strong>
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            What is the difference
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            Between your experience of Existence
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            And that of a saint?
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            The saint knows
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            That the spiritual path
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            Is a sublime chess game with God
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            And that the Beloved
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            Has just made such a Fantastic Move
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            That the saint is now continually
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            Tripping over Joy
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            And bursting out in Laughter
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            And saying, “I Surrender!”
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            Whereas, my dear,
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            I am afraid you still think
          </p><p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; font-style: italic; margin-top: -15px;'>
            You have a thousand serious moves.
          </p>
      </div>
      <div>
        <p style='font-size: 22px; text-align: center; font-weight: 400; font-family: \"Montserrat\", \"Gotham Light\", helvetica; margin-bottom: 30px; margin-top: -4px;'>
          - Hafez
        </p>
      </div>
    </div>`;

const fields = {
  times_sent: "6",
  author: "Thomas Sowell",
  body:
    "The most basic question is not what is best, but *who shall decide* what is best.",
};

describe("Quote owl endpoint", () => {
  it("Timer trigger should fetch data, update item, and send message", (done) => {
    const log = context.log.mock;
    const axios = {
      get: promiseMock({
        data: {
          records: [{ id: "12345", fields: { ...fields, times_sent: 5 } }],
        },
      }),
      patch: promiseMock({ success: true }),
    };

    timerFunction(context, {}, axios)
      .then((resp) => {
        expect(axios.get.mock.calls.length).toEqual(1);
        expect(axios.get.mock.calls[0]).toEqual([
          "https://api.airtable.com/v0/appHdoe52fqgUn5bm/Quotes?api_key=keyoCC3tPr89iYmgz&sort[0][field]=times_sent&sort[0][direction]=asc",
        ]);
        expect(axios.patch.mock.calls[0]).toEqual([
          "https://api.airtable.com/v0/appHdoe52fqgUn5bm/Quotes/12345?api_key=keyoCC3tPr89iYmgz",
          {
            fields: { times_sent: "6" },
          },
        ]);
        const { personalizations, from, subject, content } = resp;

        expect(personalizations).toEqual([
          { to: [{ email: "sashafklein@gmail.com", name: "Sasha Klein" }] },
        ]);
        expect(from).toEqual({
          name: "Thomas Sowell - Quote Owl",
          email: "quote.owl@gmail.com",
        });
        expect(subject).toEqual(
          "The most basic question is not what is best, but who shall decide what is best."
        );

        expect(content[0]).toEqual({
          type: "text/html",
          value: htmlExpectation.trim(),
        });

        done();
      })
      .catch((err) => {
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
        "The most basic question is not what is best, but *who shall decide* what is best.",
    };

    expect(html(quote).trim()).toEqual(htmlExpectation.trim());
  });

  it("html - handles newlines", () => {
    const quote = {
      body:
        "God, grant me the serenity to accept the things I cannot change,\r\nCourage to change the things I can change,\r\nAnd wisdom to know the difference.",
      author: "Reinhold Niebuhr",
    };

    expect(htmlBeautify(html(quote))).toEqual(htmlBeautify(htmlExpectation2));

    const quote2 = {
      body:
        "The greatest obstacle to living is expectancy, which hangs upon tomorrow and loses today.\nThe whole future lies in uncertainty: live immediately.",
      author: "Seneca",
    };

    expect(htmlBeautify(html(quote2))).toEqual(htmlBeautify(htmlExpectation3));
  });

  it("html plus endpoint - it formats Hafez correctly", (done) => {
    const hafezId = "rec6FW2tca6dnkq0u";
    axios.get(`${base}/${hafezId}${key}`).then(({ data }) => {
      expect(htmlBeautify(html(data.fields))).toEqual(
        htmlBeautify(htmlExpectation4)
      );
      done();
    });
  });
});
