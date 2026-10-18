import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { v4 as uuidv4 } from "uuid";

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskImportance = "low" | "medium" | "high";

@Table({
  tableName: "Tasks",
  timestamps: true,   
})
export class Task extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: uuidv4
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare description?: string;

  @Column({
    type: DataType.ENUM("pending", "in_progress", "completed"),
    allowNull: false,
    defaultValue: "pending"
  })
  declare status: TaskStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare deadline?: Date;

  @Column({
    type: DataType.ENUM("low", "medium", "high"),
    allowNull: false
  })
  declare importance: TaskImportance;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare updatedAt: Date;
}
