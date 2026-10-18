"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tasks", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.addColumn("tasks", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tasks", "createdAt");
    await queryInterface.removeColumn("tasks", "updatedAt");
  },
};
