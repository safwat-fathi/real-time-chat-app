const moment = require("moment");

const formatMsgs = (username = "", text = "") => {
  return {
    username,
    text,
    time: moment().format("h : mm a")
  };
};

module.exports = formatMsgs;
