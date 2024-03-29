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
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            terminateAt: DataTypes.DATE,
            location: DataTypes.STRING,
            ecoImpact: DataTypes.INTEGER,
            icon: DataTypes.BLOB('long'),
            ownerId: DataTypes.INTEGER,
            status: {
                type: DataTypes.STRING,
                defaultValue: 'idle',
            },
        },
        {
            // Other model options go here

            timestamps: true,
        }
    );
    return Offer;
};
