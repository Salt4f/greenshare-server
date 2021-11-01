module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define(
        // modelName
        'Tags',
        {
            // Model attributes are defined here
            name: {
                type: DataTypes.STRING,
                primaryKey: true,
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
