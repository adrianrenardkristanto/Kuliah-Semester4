"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tasks", "status", {
      type: Sequelize.ENUM("pending", "in_progress", "completed"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tasks", "status");
  },
};
