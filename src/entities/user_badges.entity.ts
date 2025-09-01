import { Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Badge } from "./badge.entity";


@Entity('user_badges')
export class UserBadges {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, user => user.id)
    @Column('int')
    user_id: number;

    @OneToOne(() => Badge, badge => badge.id)
    @Column('int')
    achievement_id: number;

    @Column('timestamp')
    unlocked_at: Date;
}