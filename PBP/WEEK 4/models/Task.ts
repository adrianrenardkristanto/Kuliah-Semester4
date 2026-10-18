import {Table, Column, Model, DataType,} from 'sequelize-typescript';
import { v4 } from "uuid";

export type TaskStatus = "pending" | "in_progress" | "completed";

@Table({
    tableName: "tasks",
    timestamps: true,   
})

export class Task extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: v4
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare title: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare description: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare status: TaskStatus;
}