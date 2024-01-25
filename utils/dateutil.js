// dateUtils.js

const convertToDate = (dateStr) => {
    let [date, time] = dateStr.split(', ');
    let [month, day, year] = date.split('/');
    let [hour, minute, second] = time.split(':');
    return new Date(year, month - 1, day, hour, minute, second);
};

module.exports = convertToDate;
