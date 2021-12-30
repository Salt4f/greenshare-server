module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define(
        // modelName
        'Reports',
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            itemId: DataTypes.INTEGER,
            reporterId: DataTypes.INTEGER,
            message: {
                type: DataTypes.STRING,
            },
            solved: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            // Other model options go here
            timestamps: true,
        }
    );
    return Report;
};
