module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define(
        // modelName
        'Offers',
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            name: {
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.STRING,
            },
            createdAt: true,
            terminateAt: DataTypes.DATE,
            location: DataTypes.STRING,
            ecoImpact: DataTypes.INTEGER,
            // falta icon & photos
            userId: DataTypes.INTEGER,
        },
        {
            // Other model options go here

            timestamps: true,
        }
    );
    return Users;
};
