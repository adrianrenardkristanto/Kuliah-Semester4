'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("Session", {
      id: {
        type: Sequelize.UUID, 
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
      },
      accessToken: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      refreshToken:{
        type: Sequelize.STRING,
       allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Session");
  },
};
