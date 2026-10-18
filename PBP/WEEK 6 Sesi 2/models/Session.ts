import { Table, Column, Model, DataType, ForeignKey  } from 'sequelize-typescript';
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";

@Table({
    tableName: "Session",
    timestamps: true,   
})

export class Session extends Model {
    @ForeignKey(() => User)
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    declare id: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare userId: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare accessToken: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare refreshToken: string;

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

