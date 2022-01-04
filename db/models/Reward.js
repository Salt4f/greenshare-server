module.exports = (sequelize, DataTypes) => {
    const Rewards = sequelize.define(
        // modelName
        'Rewards',
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            sponsorName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            greenCoins: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            // Other model options go here
            timestamps: true,
        }
    );
    return Rewards;
};
