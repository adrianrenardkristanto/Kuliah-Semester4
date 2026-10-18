"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projects", {
      id: {
        type: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addColumn("tasks", "projectId", {
      type: Sequelize.UUIDV4,
      allowNull: true,
      references: {
        model: "projects",
        key: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("projects");
  },
};
