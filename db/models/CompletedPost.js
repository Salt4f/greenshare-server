module.exports = (sequelize, DataTypes) => {
    const CompletedPost = sequelize.define(
        // modelName
        'CompletedPosts',
        {
            acceptedPostId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            valoration: {
                type: DataTypes.INTEGER,
            },
            points: {
                type: DataTypes.INTEGER,
            },
        },
        {
            // Other model options go here
        }
    );
    return CompletedPost;
};
