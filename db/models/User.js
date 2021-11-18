module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define(
        // modelName
        'Users',
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            nickname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            dni: {
                type: DataTypes.STRING,
            },
            birthDate: {
                type: DataTypes.DATE,
            },
            fullName: {
                type: DataTypes.STRING,
            },
            profilePicture: {
                type: DataTypes.BLOB('long'),
            },
            aboutMe: {
                type: DataTypes.STRING,
            },
            banned: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            // Other model options go here
        }
    );
    return Users;
};
