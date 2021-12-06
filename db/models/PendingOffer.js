module.exports = (sequelize, DataTypes) => {
    const PendingOffer = sequelize.define(
        // modelName
        'PendingOffers',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
        },
        {
            // Other model options go here
        }
    );
    return PendingOffer;
};
