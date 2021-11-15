module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define(
        // modelName
        'Tags',
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
            },
            isOfficial: {
                type: DataTypes.BOOLEAN,
            },
        },
        {
            // Other model options go here
        }
    );
    return Tag;
};
