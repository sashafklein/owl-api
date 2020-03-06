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
    <div style='background: #F7F7F7; color: black; padding: 20px 8px; font-family: "Montserrat", "Gotham Light", helvetica'>
      <div style='margin: auto; max-width: 800px'>
        <h2 style='font-size: 24px; text-align: center; font-weight: normal; font-family: "Montserrat", "Gotham Light", helvetica; margin-bottom: 30px;'>
          ${quote.author}
        </h2>
        <div style='padding: 0 40px'>
          ${body.split("\r\n").map(
            line =>
              `<p style='text-align: center; line-height: 1.9; padding: 0 40; font-size: 17px; font-weight: normal; font-family: "Montserrat", "Gotham Light", helvetica'>
                ${line}
                </br>
              </p>`
          )}
        </div>
      </div>
    </div>
  `.trim();
  return content;
};

module.exports = {
  html,
  makeBold
};
