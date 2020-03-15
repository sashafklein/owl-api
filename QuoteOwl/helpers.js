const makeBold = text => {
  const regex = new RegExp("(?:\\*+)([a-zA-Z0-9 ]+)(?:\\*+)", "g");
  return text.replace(
    regex,
    match => `<strong>${match.replace(new RegExp("\\*", "g"), "")}</strong>`
  );
};

const html = quote => {
  const body = makeBold(quote.body);
  const content = `
    <div style='background: #F7F7F7; color: black; padding: 30px 8px; font-family: "Montserrat", "Gotham Light", helvetica'>
      <div style='margin: auto; max-width: 700px'>
        ${body.split("\r\n").map(
          (line, i) =>
            `<p style='text-align: center; line-height: 1.8; font-size: 24px; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; font-style: italic;${
              i === 0 ? "" : " margin-top: -15px;"
            }'>
            ${line}
          </p>`
        )}
      </div>
      <div>
        <p style='font-size: 22px; text-align: center; font-weight: 400; font-family: "Montserrat", "Gotham Light", helvetica; margin-bottom: 30px; margin-top: -4px;'>
          - ${quote.author}
        </p>
      </div>
    </div>
  `.trim();
  return content;
};

module.exports = {
  html,
  makeBold
};
