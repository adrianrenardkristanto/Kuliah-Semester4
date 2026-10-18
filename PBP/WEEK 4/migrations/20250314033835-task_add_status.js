'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('tasks',
      "status",{
        type:Sequelize.ENUM("pending","in_progress","completed"),
        allowNull:false,
        defaultValue: "pending"
      });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn("tasks","status");
  }
};
