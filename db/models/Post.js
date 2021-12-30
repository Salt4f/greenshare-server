module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define(
        // modelName
        'Posts',
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING,
            },
        },
        {
            // Other model options go here
            timestamps: true,
        }
    );
    return Post;
};
