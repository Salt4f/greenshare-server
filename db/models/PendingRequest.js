module.exports = (sequelize, DataTypes) => {
    const PendingRequest = sequelize.define(
        // modelName
        'PendingRequests',
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
    return PendingRequest;
};
