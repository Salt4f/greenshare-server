module.exports = (sequelize, DataTypes) => {
    const Photo = sequelize.define(
        // modelName
        'Photos',
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            image: {
                type: DataTypes.BLOB('long'),
            },
            offerId: {
                type: DataTypes.INTEGER,
            },
        },
        {
            // Other model options go here
        }
    );
    return Photo;
};
