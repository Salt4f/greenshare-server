let bannedUsersArray = [];

const addUser = async (id, email) => {
    bannedUsersArray.push(id);
    bannedUsersArray.push(email);
};

const checkBannedUser = async (data) => {
    const user = bannedUsersArray.find((e) => e === data);
    if (user) return true;
    return false;
};

module.exports = { addUser, checkBannedUser };
