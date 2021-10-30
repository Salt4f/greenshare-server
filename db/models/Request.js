module.exports = (sequelize, DataTypes) => {
    const Request = sequelize.define(
        // modelName
        'Requests',
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
            userId: DataTypes.INTEGER,
        },
        {
            // Other model options go here

            timestamps: true,
        }
    );
    return Request;
};
