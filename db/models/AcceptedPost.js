module.exports = (sequelize, DataTypes) => {
    const AcceptedPost = sequelize.define(
        // modelName
        'AcceptedPosts',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            offerId: {
                type: DataTypes.INTEGER,
            },
            requestId: {
                type: DataTypes.INTEGER,
            },
            createdAt: true,
        },
        {
            // Other model options go here
            timestamps: true,
        }
    );
    return AcceptedPost;
};
