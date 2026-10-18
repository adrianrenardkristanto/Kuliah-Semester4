import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
} from "sequelize-typescript";
import { v4 } from "uuid";
import { Project } from "./Project";

export type TaskStatus = "pending" | "in_progress" | "completed";

@Table({
  tableName: "tasks",
  // timestamps: false
})
export class Task extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: v4,
  })
  declare id: string;

  @Column({ type: DataType.STRING })
  declare title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare status: TaskStatus;

  @BelongsTo(() => Project, "projectId")
  declare project: Project;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare projectId: string;
}
