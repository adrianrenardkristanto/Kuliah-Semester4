import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { v4 as uuidv4 } from "uuid";

@Table({
    tableName: "User",
    timestamps: true,   
})
export class User extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: uuidv4
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    declare username: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;

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