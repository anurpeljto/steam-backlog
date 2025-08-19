import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OwnedGame } from "./ownedgame.entity";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    steam_id: string;

    @Column({nullable: true})
    username: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => OwnedGame, game => game.user)
    owned_games: OwnedGame[];

    @Column({ type: 'varchar', nullable: true, default: "Welcome to my profile! I''m here to clear my backlog and discover new games."})
    description: string;
}