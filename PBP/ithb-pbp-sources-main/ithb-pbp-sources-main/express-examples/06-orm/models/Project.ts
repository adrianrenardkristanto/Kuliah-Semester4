import { Table, Model, DataType, HasMany, Column } from "sequelize-typescript";
import { v4 } from "uuid";
import { Task } from "./Task";

@Table({
  tableName: "projects",
  timestamps: false,
})
export class Project extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: v4,
  })
  declare id: string;

  @Column({ type: DataType.STRING })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare description: string;

  @HasMany(() => Task, "projectId")
  declare tasks: Task[];
}
