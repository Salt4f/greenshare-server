module.exports = (sequelize, DataTypes) => {
    const Request = sequelize.define(
        // modelName
        'Requests',
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
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
            ownerId: DataTypes.INTEGER,
            status: DataTypes.STRING,
        },
        {
            // Other model options go here

            timestamps: true,
        }
    );
    return Request;
};
