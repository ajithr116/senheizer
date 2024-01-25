// userStats.js

const User = require('../models/user');
const convertToDate = require('./dateutil');

const getUserStats = async (filter = 'weekly') => {
    const totalUsersCount = await User.countDocuments({});
    switch (filter) {
        case 'weekly':
            let oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const users = await User.find({});
            let weeklyTotalUsers = 0;
            users.forEach(user => {
                let userJoinedDate = convertToDate(user.joinedDate);
                if (userJoinedDate >= oneWeekAgo) {
                    weeklyTotalUsers++;
                }
            });

            let startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            let monthlyTotalUsers = 0;
            users.forEach(user => {
                let userJoinedDate = convertToDate(user.joinedDate);
                if (userJoinedDate >= startOfMonth) {
                    monthlyTotalUsers++;
                }
            });

            let startOfYear = new Date(new Date().getFullYear(), 0, 1);
            let yearlyTotalUsers = 0;
            users.forEach(user => {
                let userJoinedDate = convertToDate(user.joinedDate);
                if (userJoinedDate >= startOfYear) {
                    yearlyTotalUsers++;
                }
            });

            return {
                totalUsersCount,
                weeklyTotalUsers,
                monthlyTotalUsers,
                yearlyTotalUsers
            };
            break;
    case 'monthly':
        let monthlyUsers = [];
        for (let month = 0; month < 12; month++) {
            let startDate = new Date(new Date().getFullYear(), month, 1);
            let endDate = new Date(new Date().getFullYear(), month + 1, 0);
            const users = await User.find({});
            let monthlyTotalUsers = 0;
            users.forEach(user => {
                let userJoinedDate = convertToDate(user.joinedDate);
                if (userJoinedDate >= startDate && userJoinedDate <= endDate) {
                    monthlyTotalUsers++;
                }
            });
            monthlyUsers.push(monthlyTotalUsers);
        }
        return {
            totalUsersCount,
            monthlyUsers
        };
        break;
    case 'yearly':
        let yearlyUsers = [];
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 5; year <= currentYear; year++) { // Adjust the range as needed
            let startDate = new Date(year, 0, 1);
            let endDate = new Date(year + 1, 0, 1);
            const users = await User.find({});
            let yearlyTotalUsers = 0;
            users.forEach(user => {
                let userJoinedDate = convertToDate(user.joinedDate);
                if (userJoinedDate >= startDate && userJoinedDate <= endDate) {
                    yearlyTotalUsers++;
                }
            });
            yearlyUsers.push(yearlyTotalUsers);
        }
    

    return {
        totalUsersCount,
        yearlyUsers
    };
      break;
    default:
      console.log("error by userstate.js")
  }    
};

module.exports = getUserStats;
