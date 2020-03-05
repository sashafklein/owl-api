const timerFunction, { makeBold, makeHtml } = require("./index");
const context = require("../testing/defaultContext");
const timer = require("../testing/defaultTimer");

describe('Quote owl endpoint', () => {
  it("Timer trigger should log message", done => {
    const mock = context.log.mock;
    const fetch = jest
      .fn()
      .mockReturnValueOnce(
        Promise.resolve({
          json: () =>
            Promise.resolve({
              records: [{ id: "12345", fields: { times_sent: 5 } }]
            })
        })
      )
      .mockReturnValueOnce(
        Promise.resolve({
          json: () => Promise.resolve({ success: true })
        })
      );

    timerFunction(context, { isPastDue: true }, fetch)
      .then(resp => {
        expect(fetch.mock.calls.length).toEqual(2);
        expect(fetch.mock.calls[0]).toEqual([
          "https://api.airtable.com/v0/appHdoe52fqgUn5bm/Quotes?api_key=keyoCC3tPr89iYmgz&sort[0][field]=times_sent&sort[0][direction]=asc"
        ]);
        expect(fetch.mock.calls[1][0]).toEqual(
          "https://api.airtable.com/v0/appHdoe52fqgUn5bm/Quotes/12345?api_key=keyoCC3tPr89iYmgz"
        );
        expect(fetch.mock.calls[1][1].body).toEqual(
          JSON.stringify({
            fields: { times_sent: "6" }
          })
        );
        expect(resp).toEqual({ success: true });
        done();
      })
      .catch(err => {
        console.log("CALLS", mock.calls);
        console.log("ERR: ", err);
        throw err;
        done();
      });
  });

  it('makeBold - makes text bold', () => {
    expect(
      makeBold('This is a *quote* with a bunch of *strong* stuff.')
    ).toEqual(
      'This is a <strong>quote</strong> with a bunch of <strong>strong</strong> stuff.'
    );
  });
});
